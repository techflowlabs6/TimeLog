import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { user, signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (user) return <Navigate to="/" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      const { error } =
        mode === 'signin'
          ? await signInWithEmail(email, password)
          : await signUpWithEmail(email, password, fullName)
      if (error) setError(error.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-base-950 py-8 px-4 relative overflow-x-hidden">
      <div className="absolute inset-0 opacity-[0.05] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(#7c9eff 1px, transparent 1px), linear-gradient(90deg, #7c9eff 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}
      />

      <div className="relative card w-full max-w-sm p-6 sm:p-8 shadow-2xl">
        <div className="mb-6 sm:mb-8 text-center sm:text-left">
          <div className="font-display font-bold text-2xl text-base-100">
            Time<span className="text-accent">Log</span>
          </div>
          <div className="label-eyebrow mt-2">
            {mode === 'signin' ? 'sign in to your workspace' : 'create your account'}
          </div>
        </div>

        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-2.5 bg-base-100 text-base-950 font-semibold text-sm py-3 rounded-xl hover:bg-white transition-colors mb-6 shadow-xs"
        >
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.7 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4c-7.7 0-14.4 4.3-17.7 10.7z"/><path fill="#4CAF50" d="M24 44c5.3 0 10.1-2 13.7-5.4l-6.3-5.3C29.4 35.3 26.8 36 24 36c-5.3 0-9.8-3.3-11.4-8l-6.5 5C9.6 39.6 16.2 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.6l6.3 5.3C40.3 36.5 44 30.9 44 24c0-1.3-.1-2.7-.4-3.5z"/></svg>
          Continue with Google
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-px flex-1 bg-base-700" />
          <span className="text-xs text-base-400 font-mono">or email</span>
          <div className="h-px flex-1 bg-base-700" />
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {mode === 'signup' && (
            <input
              type="text"
              placeholder="Full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              className="bg-base-850 border border-base-700 rounded-xl px-3.5 py-3 text-sm text-base-100 placeholder-base-400 focus:border-accent outline-none"
            />
          )}
          <input
            type="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-base-850 border border-base-700 rounded-xl px-3.5 py-3 text-sm text-base-100 placeholder-base-400 focus:border-accent outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="bg-base-850 border border-base-700 rounded-xl px-3.5 py-3 text-sm text-base-100 placeholder-base-400 focus:border-accent outline-none"
          />

          {error && <div className="text-xs text-red-400 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">{error}</div>}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-accent hover:bg-accent-soft transition-colors text-base-950 font-semibold text-sm py-3 rounded-xl disabled:opacity-50 mt-1 shadow-xs"
          >
            {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <div className="text-center mt-6 text-xs text-base-400">
          {mode === 'signin' ? (
            <>No account? <button onClick={() => setMode('signup')} className="text-accent hover:underline font-medium">Sign up</button></>
          ) : (
            <>Have an account? <button onClick={() => setMode('signin')} className="text-accent hover:underline font-medium">Sign in</button></>
          )}
        </div>
      </div>
    </div>
  )
}
