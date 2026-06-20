import { useState } from 'react'
import { signInWithGoogle, signInWithEmail, signUpWithEmail, resetPassword, authErrorMessage } from '../lib/auth'

export default function Landing() {
  const [tab, setTab] = useState('google')      // 'google' | 'email'
  const [mode, setMode] = useState('signin')    // 'signin' | 'signup' | 'reset'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetSent, setResetSent] = useState(false)

  function reset() { setError(''); setResetSent(false) }

  async function handleGoogle() {
    setLoading(true); reset()
    try { await signInWithGoogle() }
    catch (e) { setError(authErrorMessage(e.code)); setLoading(false) }
  }

  async function handleEmail(e) {
    e.preventDefault()
    setLoading(true); reset()
    try {
      if (mode === 'signup') await signUpWithEmail(name.trim(), email.trim(), password)
      else await signInWithEmail(email.trim(), password)
    } catch (err) {
      setError(authErrorMessage(err.code)); setLoading(false)
    }
  }

  async function handleReset(e) {
    e.preventDefault()
    setLoading(true); reset()
    try {
      await resetPassword(email.trim())
      setResetSent(true)
    } catch (err) {
      setError(authErrorMessage(err.code))
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">🫧</div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-1">FlatWash</h1>
        <p className="text-gray-500 dark:text-gray-400">Fair dishwashing for flatmates.</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-6 w-full max-w-sm">
        {/* Tabs */}
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 mb-5">
          {[['google', 'Google'], ['email', 'Email']].map(([key, label]) => (
            <button
              key={key}
              onClick={() => { setTab(key); reset() }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                tab === key
                  ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Google tab */}
        {tab === 'google' && (
          <div className="space-y-3">
            <button
              onClick={handleGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl px-4 py-3 text-gray-700 dark:text-gray-200 font-medium hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 shadow-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="" className="w-5 h-5" />
              {loading ? 'Signing in…' : 'Continue with Google'}
            </button>
          </div>
        )}

        {/* Email tab */}
        {tab === 'email' && mode !== 'reset' && (
          <form onSubmit={handleEmail} className="space-y-3">
            {/* Mode toggle */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-xl p-1 mb-1">
              {[['signin', 'Sign in'], ['signup', 'Create account']].map(([key, label]) => (
                <button
                  type="button"
                  key={key}
                  onClick={() => { setMode(key); reset() }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    mode === key
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {mode === 'signup' && (
              <input
                required autoFocus
                placeholder="Your name"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 dark:placeholder-gray-500"
              />
            )}
            <input
              required type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <input
              required type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={6}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 dark:placeholder-gray-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white rounded-xl py-2.5 font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {loading ? '…' : mode === 'signup' ? 'Create account' : 'Sign in'}
            </button>

            {mode === 'signin' && (
              <button
                type="button"
                onClick={() => { setMode('reset'); reset() }}
                className="w-full text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
              >
                Forgot password?
              </button>
            )}
          </form>
        )}

        {/* Password reset */}
        {tab === 'email' && mode === 'reset' && (
          <form onSubmit={handleReset} className="space-y-3">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">Enter your email and we'll send a reset link.</p>
            <input
              required type="email" autoFocus
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 dark:placeholder-gray-500"
            />
            {resetSent
              ? <p className="text-green-600 dark:text-green-400 text-sm text-center font-medium">Reset link sent! Check your inbox.</p>
              : <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white rounded-xl py-2.5 font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
            }
            <button type="button" onClick={() => { setMode('signin'); reset() }} className="w-full text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              Back to sign in
            </button>
          </form>
        )}

        {error && <p className="mt-3 text-red-500 text-sm text-center">{error}</p>}
      </div>

      <div className="mt-10 grid grid-cols-3 gap-4 text-center max-w-lg w-full">
        {[
          { icon: '🍽️', title: 'Pick utensils', desc: 'Select what was used and rate the effort' },
          { icon: '⚖️', title: 'Auto distribute', desc: 'Smart algorithm balances work over time' },
          { icon: '📊', title: 'Track history', desc: 'See who has done the most work at a glance' },
        ].map(f => (
          <div key={f.title} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm">
            <div className="text-3xl mb-2">{f.icon}</div>
            <div className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{f.title}</div>
            <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">{f.desc}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
