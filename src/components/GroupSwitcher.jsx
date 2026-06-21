import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { getFlatsBasicInfo, createFlat, joinFlat } from '../lib/firestore'

export default function GroupSwitcher({ flatIds, activeFlatId, onSwitch, onGroupAdded, onClose }) {
  const { user } = useAuth()
  const [groups, setGroups] = useState([])
  const [mode, setMode] = useState(null) // 'create' | 'join'
  const [value, setValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    getFlatsBasicInfo(flatIds).then(setGroups)
  }, [flatIds])

  function resetForm() { setMode(null); setValue(''); setError('') }

  async function handleCreate() {
    if (!value.trim()) return
    setLoading(true); setError('')
    try {
      const id = await createFlat(value.trim(), user.uid, user.displayName, user.photoURL)
      onGroupAdded(id)
      onClose()
    } catch (e) { setError(e.message); setLoading(false) }
  }

  async function handleJoin() {
    if (value.length < 6) return
    setLoading(true); setError('')
    try {
      const id = await joinFlat(value.trim(), user.uid, user.displayName, user.photoURL)
      onGroupAdded(id)
      onClose()
    } catch (e) { setError(e.message); setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="font-bold text-gray-900 dark:text-white">Your groups</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 text-xl leading-none">×</button>
        </div>

        {/* Group list */}
        <div className="px-3 pb-2 space-y-1">
          {groups.map(g => (
            <button
              key={g.id}
              onClick={() => { onSwitch(g.id); onClose() }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                g.id === activeFlatId
                  ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200'
              }`}
            >
              <span className="text-lg">🏠</span>
              <span className="flex-1 text-sm font-medium">{g.name}</span>
              {g.id === activeFlatId && <span className="text-xs text-blue-500">Active</span>}
            </button>
          ))}
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 mx-3" />

        {/* Create / Join buttons or forms */}
        <div className="p-3 space-y-2">
          {!mode && (
            <>
              <button
                onClick={() => setMode('create')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors text-left"
              >
                <span className="text-lg">➕</span> Create a new group
              </button>
              <button
                onClick={() => setMode('join')}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium transition-colors text-left"
              >
                <span className="text-lg">🔗</span> Join with invite code
              </button>
            </>
          )}

          {mode === 'create' && (
            <div className="space-y-2">
              <input
                autoFocus
                value={value}
                onChange={e => setValue(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreate()}
                placeholder="Group name, e.g. Yash's Apartment"
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 dark:placeholder-gray-500"
              />
              <div className="flex gap-2">
                <button onClick={resetForm} className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
                  Cancel
                </button>
                <button onClick={handleCreate} disabled={loading || !value.trim()} className="flex-1 bg-blue-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                  {loading ? 'Creating…' : 'Create'}
                </button>
              </div>
            </div>
          )}

          {mode === 'join' && (
            <div className="space-y-2">
              <input
                autoFocus
                value={value}
                onChange={e => setValue(e.target.value.toUpperCase())}
                onKeyDown={e => e.key === 'Enter' && handleJoin()}
                placeholder="6-character code"
                maxLength={6}
                className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-2.5 text-sm text-center font-mono tracking-widest uppercase focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="flex gap-2">
                <button onClick={resetForm} className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 rounded-xl py-2 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700">
                  Cancel
                </button>
                <button onClick={handleJoin} disabled={loading || value.length < 6} className="flex-1 bg-blue-600 text-white rounded-xl py-2 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
                  {loading ? 'Joining…' : 'Join'}
                </button>
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
        </div>
      </div>
    </div>
  )
}
