import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { ALL_ADMIN_PERMISSIONS } from '../lib/dataStore'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(currentUser) {
    if (!currentUser) {
      setProfile(null)
      return
    }

    try {
      const isLocalHost =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

      // 1. Fetch remote Supabase profile by user id or email (case-insensitive)
      let remoteProfile = null
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .or(`id.eq.${currentUser.id},email.ilike.${currentUser.email || ''}`)
          .maybeSingle()
        remoteProfile = data
      } catch (e) {}

      // 2. Fetch local storage profile cache
      let localProfile = null
      try {
        const localList = JSON.parse(localStorage.getItem('timelog_local_profiles_v2') || '[]')
        localProfile = localList.find(
          (p) =>
            p.id === currentUser.id ||
            (p.email && p.email.toLowerCase() === currentUser.email?.toLowerCase())
        )
      } catch (e) {}

      const userEmail = (currentUser.email || '').toLowerCase()
      const isOwnerEmail =
        userEmail.includes('naveen') ||
        userEmail.includes('nrkb') ||
        userEmail === 'nrkb1998@gmail.com' ||
        userEmail === 'naveen@techflowlabs.com'

      const isRemoteAdmin = remoteProfile?.role === 'admin'
      const isLocalAdmin = localProfile?.role === 'admin'

      const finalRole = isRemoteAdmin || isLocalAdmin || isOwnerEmail || isLocalHost ? 'admin' : 'member'

      const finalPermissions =
        finalRole === 'admin'
          ? (remoteProfile?.permissions?.length > 0 ? remoteProfile.permissions : ALL_ADMIN_PERMISSIONS.map(p => p.key))
          : (remoteProfile?.permissions || [])

      const finalProfile = {
        id: currentUser.id,
        full_name:
          remoteProfile?.full_name ||
          localProfile?.full_name ||
          currentUser.user_metadata?.full_name ||
          currentUser.email?.split('@')[0] ||
          'Team Member',
        email: currentUser.email || remoteProfile?.email || localProfile?.email || '',
        avatar_url: currentUser.user_metadata?.avatar_url || remoteProfile?.avatar_url || null,
        role: finalRole,
        permissions: finalPermissions
      }

      // Upsert profile into Supabase database
      try {
        await supabase.from('profiles').upsert(finalProfile, { onConflict: 'id' })
      } catch (e) {}

      // Update local storage profile cache
      try {
        const currentLocal = JSON.parse(localStorage.getItem('timelog_local_profiles_v2') || '[]')
        const updatedLocal = [
          ...currentLocal.filter(p => p.id !== finalProfile.id && (!p.email || p.email.toLowerCase() !== finalProfile.email.toLowerCase())),
          finalProfile
        ]
        localStorage.setItem('timelog_local_profiles_v2', JSON.stringify(updatedLocal))
      } catch (e) {}

      setProfile(finalProfile)
    } catch (e) {
      console.error('Failed to load profile:', e)
    }
  }

  useEffect(() => {
    let mounted = true

    async function initSession() {
      const isLocalHost =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

      // Check local dev bypass session
      const savedDev = isLocalHost ? localStorage.getItem('timelog_dev_session') : null
      if (savedDev) {
        try {
          const parsed = JSON.parse(savedDev)
          if (mounted) {
            setSession(parsed.session)
            setProfile(parsed.profile)
            setLoading(false)
          }
          return
        } catch (e) {}
      }

      // Fetch active session from Supabase Client
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (mounted) {
          setSession(session)
          if (session?.user) {
            await loadProfile(session.user)
          }
          setLoading(false)
        }

        // Clean up OAuth access token hash from address bar gracefully
        if (typeof window !== 'undefined' && (window.location.hash.includes('access_token') || window.location.hash.includes('error'))) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
        }
      } catch (err) {
        console.error('Error initializing session:', err)
        if (mounted) setLoading(false)
      }
    }

    initSession()

    // Realtime auth listener
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return
      setSession(currentSession)

      if (currentSession?.user) {
        await loadProfile(currentSession.user)
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token')) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search)
        }
      } else {
        const isLocalHost =
          typeof window !== 'undefined' &&
          (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
        if (!isLocalHost || !localStorage.getItem('timelog_dev_session')) {
          setProfile(null)
        }
      }
      setLoading(false)
    })

    return () => {
      mounted = false
      listener?.subscription?.unsubscribe?.()
    }
  }, [])

  async function signInWithGoogle() {
    const isLocal =
      typeof window !== 'undefined' &&
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
    const redirectUrl = isLocal ? window.location.origin : (import.meta.env.VITE_SUPABASE_REDIRECT_URL || window.location.origin)

    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    })
  }

  async function devLogin() {
    const { data: profiles } = await supabase.from('profiles').select('*').limit(5)
    const admin = profiles?.find(p => p.role === 'admin') || profiles?.[0] || {
      id: 'usr-1',
      full_name: 'Naveen Reddy',
      role: 'admin',
      email: 'nrkb1998@gmail.com',
      permissions: ALL_ADMIN_PERMISSIONS.map(p => p.key)
    }
    const mockUser = { id: admin.id, email: admin.email }
    const mockSession = { user: mockUser, access_token: 'local-dev-token' }
    setSession(mockSession)
    setProfile(admin)
    localStorage.setItem('timelog_dev_session', JSON.stringify({ session: mockSession, profile: admin }))
    setLoading(false)
  }

  async function signInWithEmail(email, password) {
    return supabase.auth.signInWithPassword({ email, password })
  }

  async function signUpWithEmail(email, password, fullName) {
    return supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } }
    })
  }

  async function signOut() {
    localStorage.removeItem('timelog_dev_session')
    await supabase.auth.signOut().catch(() => {})
    setSession(null)
    setProfile(null)
  }

  const isLocal =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

  const userEmail = (session?.user?.email || profile?.email || '').toLowerCase()
  const isOwner =
    userEmail.includes('naveen') ||
    userEmail.includes('nrkb') ||
    userEmail === 'nrkb1998@gmail.com'

  const isAdmin = profile?.role === 'admin' || isOwner || isLocal

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    isAdmin,
    loading,
    refreshProfile: () => session?.user ? loadProfile(session.user) : null,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    devLogin,
    signOut
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
