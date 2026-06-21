import SessionCard from '../components/SessionCard'
import Avatar from '../components/Avatar'
import { useAuth } from '../hooks/useAuth'
import { useConfirm } from '../hooks/useConfirm'
import { deleteSession, deleteAllSessions } from '../lib/firestore'

export default function HistoryTab({ flat, sessions }) {
  const { user } = useAuth()
  const isAdmin = flat?.adminUid === user?.uid
  const { confirm, dialog } = useConfirm()
  const members = flat?.members || []

  const totals = {}
  members.forEach(m => { totals[m.uid] = 0 })
  sessions.forEach(s => s.assignments?.forEach(a => {
    if (totals[a.uid] !== undefined) totals[a.uid] += a.sessionEffort || 0
  }))

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-48 gap-2">
        <div className="text-4xl">📋</div>
        <p className="text-gray-400 dark:text-gray-500 text-sm">No sessions yet. Run your first one!</p>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {dialog}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-sm">All-time effort</h3>
        <div className="space-y-2">
          {members.map(m => (
            <div key={m.uid} className="flex items-center gap-3">
              <Avatar name={m.name} photoURL={m.photoURL} size={7} />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{m.name}</span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{totals[m.uid] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Past sessions</h3>
          {isAdmin && (
            <button
              onClick={async () => {
                if (await confirm(`Delete all ${sessions.length} sessions? This cannot be undone.`, { confirmLabel: 'Delete all', danger: true }))
                  deleteAllSessions(flat.id)
              }}
              className="text-xs text-red-400 hover:text-red-500 font-medium"
            >
              Delete all
            </button>
          )}
        </div>
        {sessions.map(s => (
          <SessionCard
            key={s.id}
            session={s}
            onDelete={isAdmin ? () => deleteSession(flat.id, s.id) : undefined}
          />
        ))}
      </div>
    </div>
  )
}
