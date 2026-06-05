import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { loginUser, createUser } from '../services/api/userApi'
import ErrorBanner from '../components/ui/ErrorBanner'
import LoadingSpinner from '../components/ui/LoadingSpinner'

type Tab = 'signin' | 'register'
type AuthPayload = {
  userId?: unknown
  admin?: unknown
  isAdmin?: unknown
}

const unwrapAuthPayload = (response: unknown): AuthPayload => {
  if (!response || typeof response !== 'object') return {}

  const root = response as Record<string, unknown>
  const payload = root.payload && typeof root.payload === 'object'
    ? root.payload as Record<string, unknown>
    : root

  const data = payload.data && typeof payload.data === 'object'
    ? payload.data as Record<string, unknown>
    : payload

  return data as AuthPayload
}

const LoginRegister = () => {
  const { userId, login } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('signin')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Sign in form
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)

  // Register form
  const [regUsername, setRegUsername] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPassword, setRegPassword] = useState('')
  const [regPhone, setRegPhone] = useState('')

  if (userId) return <Navigate to="/" replace />

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const payload = unwrapAuthPayload(await loginUser({ email, password }))
      const nextUserId = payload?.userId
      const nextIsAdmin = Boolean(payload?.admin ?? payload?.isAdmin)
      if (!nextUserId) throw new Error('Login failed: missing userId')
      // JWT will be implemented later; keep token empty for now.
      await login(String(nextUserId), '', nextIsAdmin)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const payload = unwrapAuthPayload(await createUser({ username: regUsername, email: regEmail, password: regPassword, phoneNumber: regPhone || undefined }))
      const nextUserId = payload?.userId
      const nextIsAdmin = Boolean(payload?.admin ?? payload?.isAdmin)
      if (!nextUserId) throw new Error('Registration failed: missing userId')
      // JWT will be implemented later; keep token empty for now.
      await login(String(nextUserId), '', nextIsAdmin)
      navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'block w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all'
  const labelCls = 'block text-sm font-medium text-slate-700 mb-1.5'

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-xl">F</div>
          <h1 className="text-2xl font-bold text-slate-900">FinSight</h1>
          <p className="mt-1 text-sm text-slate-500">AI-powered stock analysis platform</p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200 shadow-sm p-6">
          {/* Tabs */}
          <div className="mb-6 flex rounded-lg bg-slate-100 p-1">
            {(['signin', 'register'] as Tab[]).map((t) => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(null) }}
                className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-all ${
                  tab === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {t === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>

          {error && <div className="mb-4"><ErrorBanner message={error} onDismiss={() => setError(null)} /></div>}

          {tab === 'signin' ? (
            <form onSubmit={(e) => void handleSignIn(e)} className="space-y-4">
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} placeholder="you@example.com" />
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`${inputCls} pr-10`}
                    placeholder="••••••••"
                  />
                  <button type="button" onClick={() => setShowPw((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {showPw
                        ? <><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></>
                        : <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>
                      }
                    </svg>
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                {loading ? <LoadingSpinner size="sm" /> : 'Sign In'}
              </button>
            </form>
          ) : (
            <form onSubmit={(e) => void handleRegister(e)} className="space-y-4">
              <div>
                <label className={labelCls}>Username</label>
                <input type="text" required value={regUsername} onChange={(e) => setRegUsername(e.target.value)} className={inputCls} placeholder="johndoe" />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className={inputCls} placeholder="you@example.com" />
              </div>
              <div>
                <label className={labelCls}>Password</label>
                <input type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className={inputCls} placeholder="••••••••" />
              </div>
              <div>
                <label className={labelCls}>Phone (optional)</label>
                <input type="tel" value={regPhone} onChange={(e) => setRegPhone(e.target.value)} className={inputCls} placeholder="+84 xxx xxx xxxx" />
              </div>
              <button type="submit" disabled={loading} className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
                {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default LoginRegister
