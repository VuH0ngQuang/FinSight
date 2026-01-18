import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

// --- Icons ---
const EyeIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
)

const EyeOffIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
        <line x1="2" x2="22" y1="2" y2="22" />
    </svg>
)

const LockIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
)

const MailIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="20" height="16" x="2" y="4" rx="2" />
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
)

const ArrowRightIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
    </svg>
)

const Login = () => {
    const navigate = useNavigate()
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState<string | null>(null)

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        // Mock login delay
        setTimeout(() => {
            setIsLoading(false)
            if (email && password) {
                navigate('/')
            } else {
                setError('Please enter both email and password.')
            }
        }, 1500)
    }

    return (
        <div className="flex min-h-screen w-full items-center justify-center bg-slate-950 px-4 py-10 font-sans text-slate-100 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none opacity-50" />
            <div className="absolute top-1/2 left-1/2 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-slate-900/50 blur-[100px] pointer-events-none" />
            <div className="absolute -bottom-40 -right-40 h-[500px] w-[500px] rounded-full bg-blue-600/10 blur-[120px] pointer-events-none opacity-50" />

            {/* Login Card */}
            <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
                <div className="flex flex-col items-center text-center">
                    <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 shadow-inner ring-1 ring-amber-500/20">
                        <LockIcon className="h-8 w-8" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Welcome Back</h1>
                    <p className="mt-2 text-sm text-slate-400">
                        Enter your credentials to access your personal dashboard.
                    </p>
                </div>

                <form onSubmit={handleLogin} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        <div className="group relative">
                            <label htmlFor="email" className="sr-only">Email address</label>
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500 group-focus-within:text-amber-500 transition-colors">
                                <MailIcon className="h-5 w-5" />
                            </div>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 shadow-sm focus:border-amber-500/50 focus:bg-black/30 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all hover:bg-black/30"
                                placeholder="name@example.com"
                            />
                        </div>

                        <div className="group relative">
                            <label htmlFor="password" className="sr-only">Password</label>
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-500 group-focus-within:text-amber-500 transition-colors">
                                <LockIcon className="h-5 w-5" />
                            </div>
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-xl border border-white/10 bg-black/20 py-3.5 pl-11 pr-12 text-sm text-white placeholder-slate-500 shadow-sm focus:border-amber-500/50 focus:bg-black/30 focus:outline-none focus:ring-1 focus:ring-amber-500/50 transition-all hover:bg-black/30"
                                placeholder="••••••••"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-500 hover:text-white transition-colors cursor-pointer"
                            >
                                {showPassword ? (
                                    <EyeOffIcon className="h-5 w-5" />
                                ) : (
                                    <EyeIcon className="h-5 w-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                className="h-4 w-4 rounded border-gray-600 bg-black/20 text-amber-500 focus:ring-amber-500/50 focus:ring-offset-0"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-400">
                                Remember me
                            </label>
                        </div>

                        <div className="text-xs">
                            <a href="#" className="font-medium text-amber-500 hover:text-amber-400 hover:underline">
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-lg bg-rose-500/10 p-3 text-xs text-rose-400 text-center border border-rose-500/20">
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-amber-500 py-3.5 text-sm font-bold text-slate-950 shadow-lg shadow-amber-500/20 transition-all hover:bg-amber-400 hover:shadow-amber-500/30 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                        {isLoading ? (
                            <>
                                <svg className="h-4 w-4 animate-spin text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Signing in...</span>
                            </>
                        ) : (
                            <>
                                <span>Sign in</span>
                                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </>
                        )}
                    </button>

                    <div className="mt-6 text-center text-xs text-slate-500">
                        Don't have an account?{' '}
                        <a href="#" className="font-bold text-white hover:text-amber-500 transition-colors">Sign up</a>
                    </div>
                </form>
            </div>

            {/* Footer */}
            <div className="absolute bottom-6 text-center text-[10px] text-slate-600">
                © 2024 FinSight Market Data. All rights reserved.
            </div>
        </div>
    )
}

export default Login
