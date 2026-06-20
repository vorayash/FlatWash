import { useState } from 'react'
import UtensilCard from '../components/UtensilCard'
import { distribute } from '../lib/distribute'
import { saveSession } from '../lib/firestore'

export default function NewSessionTab({ flat, sessions }) {
  const [selected, setSelected] = useState({})
  const [label, setLabel] = useState('')
  const [preview, setPreview] = useState(null)
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState(false)

  const utensils = flat?.utensils || []
  const members = flat?.members || []

  function toggleUtensil(u) {
    setSelected(prev => {
      if (prev[u.id]) { const next = { ...prev }; delete next[u.id]; return next }
      return { ...prev, [u.id]: u.defaultEffort }
    })
    setPreview(null)
  }

  function setEffort(id, val) {
    setSelected(prev => ({ ...prev, [id]: val }))
    setPreview(null)
  }

  function handleDistribute() {
    const list = Object.entries(selected).map(([id, effort]) => {
      const u = utensils.find(x => x.id === id)
      return { id, name: u.name, emoji: u.emoji || null, iconUrl: u.iconUrl || null, effort }
    })
    if (!list.length) return
    setPreview(distribute(list, members, sessions))
  }

  async function handleConfirm() {
    setSaving(true)
    await saveSession(flat.id, label || `Meal on ${new Date().toLocaleDateString()}`, preview)
    setSaving(false)
    setSelected({}); setLabel(''); setPreview(null)
    setDone(true)
    setTimeout(() => setDone(false), 2000)
  }

  const selectedCount = Object.keys(selected).length

  if (done) {
    return (
      <div className="flex flex-col items-center justify-center min-h-48 gap-3">
        <div className="text-5xl">✅</div>
        <p className="text-gray-600 dark:text-gray-400 font-medium">Session saved!</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Meal label (optional)</label>
        <input
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder={`e.g. Dinner ${new Date().toLocaleDateString()}`}
          className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 dark:placeholder-gray-500"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold text-gray-800 dark:text-gray-200">Select utensils used</h2>
          {selectedCount > 0 && <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">{selectedCount} selected</span>}
        </div>
        <div className="grid grid-cols-3 gap-2">
          {utensils.map(u => (
            <UtensilCard
              key={u.id} utensil={u}
              selected={!!selected[u.id]}
              effort={selected[u.id] || u.defaultEffort}
              onToggle={() => toggleUtensil(u)}
              onEffortChange={val => setEffort(u.id, val)}
            />
          ))}
        </div>
      </div>

      {selectedCount > 0 && !preview && (
        <button onClick={handleDistribute} className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition-colors">
          Distribute ({selectedCount} utensil{selectedCount > 1 ? 's' : ''})
        </button>
      )}

      {preview && (
        <div className="space-y-3">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200">Distribution preview</h3>
          {preview.map(a => (
            <div key={a.uid} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                {a.photoURL && <img src={a.photoURL} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />}
                <div className="flex-1">
                  <div className="font-medium text-gray-900 dark:text-white">{a.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Effort this session: {a.sessionEffort}</div>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {a.utensils.length === 0
                  ? <span className="text-gray-400 text-sm">Nothing to wash</span>
                  : a.utensils.map(u => (
                    <span key={u.id} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full px-2.5 py-0.5 text-xs font-medium flex items-center gap-1">
                      <span>{u.emoji}</span> {u.name} <span className="opacity-60">({u.effort})</span>
                    </span>
                  ))
                }
              </div>
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={handleDistribute} className="flex-1 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl py-3 font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              Re-distribute
            </button>
            <button onClick={handleConfirm} disabled={saving} className="flex-1 bg-green-600 text-white rounded-xl py-3 font-semibold hover:bg-green-700 disabled:opacity-50 transition-colors">
              {saving ? 'Saving…' : 'Confirm & Save'}
            </button>
          </div>
        </div>
      )}

      {utensils.length === 0 && (
        <p className="text-center text-gray-400 dark:text-gray-500 text-sm py-8">No utensils configured yet. Add them in Settings.</p>
      )}
    </div>
  )
}
