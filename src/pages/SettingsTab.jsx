import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useConfirm } from '../hooks/useConfirm'
import {
  updateFlatName, regenerateInviteCode, removeMember,
  leaveFlat, updateUtensils,
} from '../lib/firestore'
import IconUploader from '../components/IconUploader'
import Avatar from '../components/Avatar'

export default function SettingsTab({ flat, onLeft }) {
  const { user } = useAuth()
  const isAdmin = flat?.adminUid === user?.uid
  const { confirm, dialog } = useConfirm()
  const [editingName, setEditingName] = useState(false)
  const [flatName, setFlatName] = useState(flat?.name || '')
  const [copied, setCopied] = useState(false) // 'code' | 'link' | false
  const [uploadingFor, setUploadingFor] = useState(null) // utensil id
  const [newUtensilName, setNewUtensilName] = useState('')
  const [savingName, setSavingName] = useState(false)
  const [effortEdits, setEffortEdits] = useState({})
  const [savingEffort, setSavingEffort] = useState(false)

  const inviteLink = `${window.location.origin}/?join=${flat?.inviteCode}`

  function copyCode() {
    navigator.clipboard.writeText(flat.inviteCode)
    setCopied('code')
    setTimeout(() => setCopied(false), 2000)
  }

  function copyLink() {
    navigator.clipboard.writeText(inviteLink)
    setCopied('link')
    setTimeout(() => setCopied(false), 2000)
  }

  function shareLink() {
    if (navigator.share) {
      navigator.share({ title: `Join ${flat.name} on FlatWash`, url: inviteLink })
    } else {
      copyLink()
    }
  }

  async function handleSaveName() {
    if (!flatName.trim()) return
    setSavingName(true)
    await updateFlatName(flat.id, flatName.trim())
    setSavingName(false)
    setEditingName(false)
  }

  async function handleRegenCode() {
    if (!await confirm('Regenerate invite code? The old code will stop working.', { confirmLabel: 'Regenerate', danger: true })) return
    await regenerateInviteCode(flat.id)
  }

  async function handleRemoveMember(uid) {
    if (!await confirm('Remove this member from the flat?', { confirmLabel: 'Remove', danger: true })) return
    await removeMember(flat.id, user.uid, uid)
  }

  async function handleLeave() {
    if (!await confirm('Leave this flat? You will need a new invite code to rejoin.', { confirmLabel: 'Leave', danger: true })) return
    await leaveFlat(flat.id, user.uid)
    onLeft()
  }

  async function handleIconSaved(utensilId, url) {
    const utensils = (flat.utensils || []).map(u =>
      u.id === utensilId ? { ...u, iconUrl: url } : u
    )
    await updateUtensils(flat.id, utensils)
    setUploadingFor(null)
  }

  async function handleRemoveIcon(utensilId) {
    const utensils = (flat.utensils || []).map(u =>
      u.id === utensilId ? { ...u, iconUrl: null } : u
    )
    await updateUtensils(flat.id, utensils)
  }

  async function handleDeleteUtensil(utensilId) {
    if (!await confirm('Delete this utensil?', { confirmLabel: 'Delete', danger: true })) return
    const utensils = (flat.utensils || []).filter(u => u.id !== utensilId)
    await updateUtensils(flat.id, utensils)
  }

  async function handleAddUtensil() {
    if (!newUtensilName.trim()) return
    const id = newUtensilName.trim().toLowerCase().replace(/\s+/g, '_') + '_' + Date.now()
    const utensils = [...(flat.utensils || []), { id, name: newUtensilName.trim(), defaultEffort: 10, emoji: '🍴' }]
    await updateUtensils(flat.id, utensils)
    setNewUtensilName('')
  }

  function handleEffortEdit(utensilId, val) {
    setEffortEdits(prev => ({ ...prev, [utensilId]: Number(val) }))
  }

  async function handleSaveEfforts() {
    setSavingEffort(true)
    const utensils = (flat.utensils || []).map(u =>
      effortEdits[u.id] !== undefined ? { ...u, defaultEffort: effortEdits[u.id] } : u
    )
    await updateUtensils(flat.id, utensils)
    setEffortEdits({})
    setSavingEffort(false)
  }

  if (!flat) return null

  return (
    <div className="space-y-6">
      {dialog}
      {/* Flat name */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 space-y-3">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Flat name</h3>
        {editingName ? (
          <div className="flex gap-2">
            <input
              autoFocus
              value={flatName}
              onChange={e => setFlatName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSaveName()}
              className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button onClick={handleSaveName} disabled={savingName} className="bg-blue-600 text-white rounded-xl px-4 py-2 text-sm font-medium disabled:opacity-50">
              {savingName ? '…' : 'Save'}
            </button>
            <button onClick={() => setEditingName(false)} className="text-gray-400 text-sm px-2">Cancel</button>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-gray-900 dark:text-white">{flat.name}</span>
            {isAdmin && (
              <button onClick={() => { setFlatName(flat.name); setEditingName(true) }} className="text-sm text-blue-600 hover:text-blue-700">Edit</button>
            )}
          </div>
        )}
      </section>

      {/* Invite */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">Invite flatmates</h3>
          {isAdmin && (
            <button onClick={handleRegenCode} className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 underline">
              Reset code
            </button>
          )}
        </div>

        {/* Share link button */}
        <button
          onClick={shareLink}
          className="w-full bg-blue-600 text-white rounded-xl py-3 font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
        >
          <span>🔗</span>
          {copied === 'link' ? 'Link copied!' : 'Share invite link'}
        </button>

        {/* Invite link text (copyable) */}
        <div
          onClick={copyLink}
          className="bg-white/70 dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded-xl px-3 py-2.5 text-xs text-gray-600 dark:text-gray-300 break-all cursor-pointer hover:bg-white dark:hover:bg-gray-700 transition-colors"
          title="Tap to copy"
        >
          {inviteLink}
        </div>

        {/* Divider */}
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <div className="flex-1 h-px bg-blue-200 dark:bg-blue-800" />
          or share the code manually
          <div className="flex-1 h-px bg-blue-200 dark:bg-blue-800" />
        </div>

        {/* Code */}
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-white/80 dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 text-center font-mono text-3xl tracking-[0.3em] font-bold text-gray-900 dark:text-white">
            {flat.inviteCode}
          </div>
          <button
            onClick={copyCode}
            className="bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 rounded-xl px-4 py-3 text-sm font-medium hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
          >
            {copied === 'code' ? '✓ Copied' : 'Copy'}
          </button>
        </div>
      </section>

      {/* Members */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 space-y-3">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Members ({flat.members?.length})</h3>
        <div className="space-y-2">
          {flat.members?.map(m => (
            <div key={m.uid} className="flex items-center gap-3">
              <Avatar name={m.name} photoURL={m.photoURL} size={8} />
              <div className="flex-1 text-sm text-gray-800 dark:text-gray-200">{m.name}
                {m.uid === flat.adminUid && <span className="ml-1 text-xs text-blue-600 font-medium">(admin)</span>}
                {m.uid === user?.uid && <span className="ml-1 text-xs text-gray-400">(you)</span>}
              </div>
              {isAdmin && m.uid !== user?.uid && (
                <button onClick={() => handleRemoveMember(m.uid)} className="text-xs text-red-400 hover:text-red-500">Remove</button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Utensil presets */}
      <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 space-y-3">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">Utensil presets</h3>
        <div className="space-y-3">
          {flat.utensils?.map(u => (
            <div key={u.id} className="border border-gray-100 dark:border-gray-700 rounded-xl p-3">
              <div className="flex items-center gap-3 mb-2">
                <button
                  onClick={() => setUploadingFor(u.id)}
                  className={`w-10 h-10 flex-shrink-0 rounded-lg border border-dashed flex items-center justify-center hover:border-blue-400 transition-colors ${
                    u.iconUrl
                      ? 'bg-white border-gray-300'
                      : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                  }`}
                  title="Set icon"
                >
                  {u.iconUrl
                    ? <img src={u.iconUrl} alt="" className="w-8 h-8 object-contain" />
                    : <span className="text-xl">{u.emoji}</span>
                  }
                </button>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{u.name}</div>
                  <div className="text-xs text-gray-400 dark:text-gray-500">Default effort: {u.defaultEffort}</div>
                </div>
                <button onClick={() => handleDeleteUtensil(u.id)} className="text-xs text-red-400 hover:text-red-500">Delete</button>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-12">Effort</span>
                <input
                  type="range" min={1} max={100}
                  value={effortEdits[u.id] ?? u.defaultEffort}
                  onChange={e => handleEffortEdit(u.id, e.target.value)}
                  disabled={!isAdmin}
                  className="flex-1 accent-blue-500 disabled:opacity-40"
                />
                <input
                  type="number" min={1} max={100}
                  value={effortEdits[u.id] ?? u.defaultEffort}
                  onChange={e => {
                    const v = Math.min(100, Math.max(1, Number(e.target.value) || 1))
                    handleEffortEdit(u.id, v)
                  }}
                  disabled={!isAdmin}
                  className="w-12 text-right text-xs font-semibold text-blue-600 dark:text-blue-400 bg-transparent border-b border-blue-300 dark:border-blue-600 focus:outline-none disabled:opacity-40"
                />
              </div>
              {u.iconUrl && (
                <button onClick={() => handleRemoveIcon(u.id)} className="text-xs text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 mt-1">Remove icon</button>
              )}
            </div>
          ))}
        </div>
        {Object.keys(effortEdits).length > 0 && (
          <button
            onClick={handleSaveEfforts}
            disabled={savingEffort}
            className="w-full bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {savingEffort ? 'Saving…' : `Save effort changes (${Object.keys(effortEdits).length})`}
          </button>
        )}

        {isAdmin && (
          <div className="flex gap-2 pt-1">
            <input
              value={newUtensilName}
              onChange={e => setNewUtensilName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddUtensil()}
              placeholder="New utensil name"
              className="flex-1 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <button
              onClick={handleAddUtensil}
              disabled={!newUtensilName.trim()}
              className="bg-blue-600 text-white rounded-xl px-4 text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              Add
            </button>
          </div>
        )}
      </section>

      {/* Danger zone */}
      <section className="bg-white dark:bg-gray-800 border border-red-100 dark:border-red-900 rounded-2xl p-4 space-y-2">
        <h3 className="font-semibold text-red-700 dark:text-red-400 text-sm">Danger zone</h3>
        <button onClick={handleLeave} className="w-full border border-red-200 text-red-600 rounded-xl py-2.5 text-sm font-medium hover:bg-red-50 transition-colors">
          Leave flat
        </button>
      </section>

      {uploadingFor && (
        <IconUploader
          utensil={flat.utensils.find(u => u.id === uploadingFor)}
          onSave={(base64) => handleIconSaved(uploadingFor, base64)}
          onClose={() => setUploadingFor(null)}
        />
      )}
    </div>
  )
}
