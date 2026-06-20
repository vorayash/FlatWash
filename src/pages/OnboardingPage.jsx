import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { createFlat, joinFlat } from '../lib/firestore'

export default function OnboardingPage({ onJoined, prefillCode }) {
  const { user } = useAuth()
  const [mode, setMode] = useState(prefillCode ? 'join' : null)
  const [value, setValue] = useState(prefillCode || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleCreate() {
    if (!value.trim()) return
    setLoading(true); setError('')
    try {
      const flatId = await createFlat(value.trim(), user.uid, user.displayName, user.photoURL)
      onJoined(flatId)
    } catch (e) { setError(e.message); setLoading(false) }
  }

  async function handleJoin() {
    if (!value.trim()) return
    setLoading(true); setError('')
    try {
      const flatId = await joinFlat(value.trim(), user.uid, user.displayName, user.photoURL)
      onJoined(flatId)
    } catch (e) { setError(e.message); setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-lg p-8 w-full max-w-sm text-center">
        <div className="text-5xl mb-4">🏠</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Welcome, {user?.displayName?.split(' ')[0]}!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
          {prefillCode ? "You've been invited to join a flat." : 'Create a new flat or join an existing one.'}
        </p>

        {!mode && (
          <div className="flex flex-col gap-3">
            <button onClick={() => setMode('create')} className="bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition-colors">
              Create a flat
            </button>
            <button onClick={() => setMode('join')} className="border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl py-3 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Join with invite code
            </button>
          </div>
        )}

        {mode === 'create' && (
          <div className="flex flex-col gap-3">
            <input autoFocus value={value} onChange={e => setValue(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCreate()}
              placeholder="e.g. Yash's Apartment"
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-center focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 dark:placeholder-gray-500"
            />
            <button onClick={handleCreate} disabled={loading || !value.trim()} className="bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {loading ? 'Creating…' : 'Create flat'}
            </button>
            <button onClick={() => { setMode(null); setValue(''); setError('') }} className="text-sm text-gray-400 hover:text-gray-600">Back</button>
          </div>
        )}

        {mode === 'join' && (
          <div className="flex flex-col gap-3">
            <input autoFocus value={value} onChange={e => setValue(e.target.value.toUpperCase())} onKeyDown={e => e.key === 'Enter' && handleJoin()}
              placeholder="6-character code" maxLength={6}
              className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-4 py-3 text-center text-2xl tracking-widest font-mono uppercase focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button onClick={handleJoin} disabled={loading || value.length < 6} className="bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors">
              {loading ? 'Joining…' : 'Join flat'}
            </button>
            {!prefillCode && (
              <button onClick={() => { setMode(null); setValue(''); setError('') }} className="text-sm text-gray-400 hover:text-gray-600">Back</button>
            )}
          </div>
        )}

        {error && <p className="mt-3 text-red-500 text-sm">{error}</p>}
      </div>
    </div>
  )
}
