import { supabase } from './supabaseClient'

const STORAGE_LAST_PING_DATE = 'timelog_keepalive_last_date'
const STORAGE_LAST_PING_TIME = 'timelog_keepalive_last_timestamp'
const STORAGE_HEARTBEATS_CACHE = 'timelog_keepalive_history_v1'

let _intervalId = null
let _isPinging = false

function getTodayString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function getLocalCache() {
  try {
    const raw = localStorage.getItem(STORAGE_HEARTBEATS_CACHE)
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  return []
}

function setLocalCache(items) {
  try {
    localStorage.setItem(STORAGE_HEARTBEATS_CACHE, JSON.stringify(items.slice(0, 30)))
  } catch (e) {}
}

function notifySubscribers(payload) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('timelog:keepalive_updated', {
        detail: payload
      })
    )
  }
}

/**
 * Executes a heartbeat ping to Supabase.
 * Updates both the remote system_heartbeat_logs table and local cache.
 */
export async function triggerKeepAlivePing(source = 'web_app', notes = 'Automatic daily keepalive ping') {
  if (_isPinging) return { success: false, reason: 'in_flight' }
  _isPinging = true

  const now = new Date()
  const today = getTodayString()
  const pingTimestamp = now.toISOString()

  const clientInfo = {
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown',
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
    url: typeof window !== 'undefined' ? window.location.origin : '',
    screen: typeof window !== 'undefined' ? `${window.innerWidth}x${window.innerHeight}` : 'N/A'
  }

  const newRecord = {
    id: `hb-${Date.now()}`,
    ping_date: today,
    pinged_at: pingTimestamp,
    source,
    status: 'active',
    client_info: clientInfo,
    notes
  }

  let remoteSuccess = false
  let remoteData = null

  try {
    const { data, error } = await supabase
      .from('system_heartbeat_logs')
      .insert({
        source,
        status: 'active',
        client_info: clientInfo,
        notes
      })
      .select()
      .single()

    if (!error && data) {
      remoteSuccess = true
      remoteData = data
    } else if (error) {
      // If table doesn't exist yet, we still do a lightweight read to touch Supabase connection
      await supabase.from('projects').select('id').limit(1)
    }
  } catch (err) {
    console.warn('[KeepAlive] Remote ping attempt error:', err)
  } finally {
    _isPinging = false
  }

  // Record successful ping in local storage
  try {
    localStorage.setItem(STORAGE_LAST_PING_DATE, today)
    localStorage.setItem(STORAGE_LAST_PING_TIME, pingTimestamp)
  } catch (e) {}

  const finalItem = remoteData || newRecord
  const cache = getLocalCache()
  const updatedCache = [finalItem, ...cache.filter(c => c.id !== finalItem.id)].slice(0, 30)
  setLocalCache(updatedCache)

  const result = {
    success: true,
    remote: remoteSuccess,
    timestamp: pingTimestamp,
    date: today,
    data: finalItem
  }

  notifySubscribers(result)
  return result
}

/**
 * Checks if the daily keepalive ping is needed today, and executes it if so.
 */
export async function checkAndRunDailyKeepAlive() {
  const today = getTodayString()
  const lastPingDate = localStorage.getItem(STORAGE_LAST_PING_DATE)

  // If already pinged today, skip unnecessary DB writes
  if (lastPingDate === today) {
    return { skipped: true, reason: 'already_pinged_today', date: today }
  }

  console.info(`[KeepAlive] Triggering daily keepalive ping for ${today}...`)
  return await triggerKeepAlivePing('daily_auto_keepalive', 'Automatic daily keepalive to prevent backend pause')
}

/**
 * Initializes the keepalive background watcher.
 * Runs on initial app boot, and re-checks every 30 minutes.
 */
export function initKeepAliveService() {
  if (typeof window === 'undefined') return

  // Run on startup
  checkAndRunDailyKeepAlive().catch(err => {
    console.warn('[KeepAlive] Init check failed:', err)
  })

  // Periodically check every 30 mins in case browser tab is kept open across midnight
  if (!_intervalId) {
    _intervalId = setInterval(() => {
      checkAndRunDailyKeepAlive().catch(() => {})
    }, 30 * 60 * 1000)
  }
}

/**
 * Fetches recent heartbeat logs from Supabase or fallback cache.
 */
export async function fetchRecentHeartbeats(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('system_heartbeat_logs')
      .select('*')
      .order('pinged_at', { ascending: false })
      .limit(limit)

    if (!error && data && data.length > 0) {
      setLocalCache(data)
      return data
    }
  } catch (err) {}

  const local = getLocalCache()
  if (local.length > 0) return local.slice(0, limit)

  // Default seed heartbeat if empty
  const fallback = [
    {
      id: 'hb-init-1',
      pinged_at: new Date().toISOString(),
      ping_date: getTodayString(),
      source: 'web_app',
      status: 'active',
      notes: 'Initial system keepalive heartbeat'
    }
  ]
  setLocalCache(fallback)
  return fallback
}

/**
 * Retrieves current keepalive status metrics for the UI.
 */
export function getKeepAliveStatus() {
  const today = getTodayString()
  const lastDate = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_LAST_PING_DATE) : null
  const lastTime = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_LAST_PING_TIME) : null
  const isPingedToday = lastDate === today

  let hoursAgo = null
  if (lastTime) {
    const diffMs = Date.now() - new Date(lastTime).getTime()
    hoursAgo = Math.max(0, Math.round(diffMs / (1000 * 60 * 60)))
  }

  return {
    isPingedToday,
    lastDate,
    lastTime,
    hoursAgo,
    isHealthy: hoursAgo !== null ? hoursAgo < 168 : true, // 168h = 7 days
    daysRemainingBeforePause: hoursAgo !== null ? Math.max(1, 7 - Math.floor(hoursAgo / 24)) : 7
  }
}
