import SessionCard from '../components/SessionCard'

export default function HistoryTab({ flat, sessions }) {
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
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-4">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-3 text-sm">All-time effort</h3>
        <div className="space-y-2">
          {members.map(m => (
            <div key={m.uid} className="flex items-center gap-3">
              {m.photoURL && <img src={m.photoURL} alt="" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />}
              <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{m.name}</span>
              <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">{totals[m.uid] || 0}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200 text-sm">Past sessions</h3>
        {sessions.map(s => <SessionCard key={s.id} session={s} />)}
      </div>
    </div>
  )
}
