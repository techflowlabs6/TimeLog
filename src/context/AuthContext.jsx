import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId) {
    try {
      const isLocalHost =
        typeof window !== 'undefined' &&
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (!error && data) {
        if (isLocalHost && data.role !== 'admin') {
          setProfile({ ...data, role: 'admin' })
        } else {
          setProfile(data)
        }
      } else {
        const { data: userData } = await supabase.auth.getUser().catch(() => ({ data: null }))
        const u = userData?.user
        const fallback = {
          id: userId,
          full_name: u?.user_metadata?.full_name || u?.email?.split('@')[0] || 'Team Member',
          email: u?.email || 'member@timelog.local',
          role: isLocalHost ? 'admin' : 'member'
        }
        setProfile(fallback)
      }
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

      // Fetch active session from Supabase Client (handles URL hash automatically)
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (mounted) {
          setSession(session)
          if (session?.user) {
            await loadProfile(session.user.id)
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

    // Realtime auth listener for OAuth redirects, sign-in, token refresh, and sign-out
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      if (!mounted) return
      setSession(currentSession)

      if (currentSession?.user) {
        await loadProfile(currentSession.user.id)
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
      id: 'local-dev-user',
      full_name: 'Naveen Reddy',
      role: 'admin',
      email: 'naveen@techflowlabs.com'
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

  const value = {
    session,
    user: session?.user ?? null,
    profile,
    isAdmin: profile?.role === 'admin' || isLocal,
    loading,
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
