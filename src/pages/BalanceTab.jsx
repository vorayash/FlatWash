import EffortBar from '../components/EffortBar'
import Avatar from '../components/Avatar'

export default function BalanceTab({ flat, sessions }) {
  const members = flat?.members || []

  const totals = {}
  members.forEach(m => { totals[m.uid] = 0 })
  sessions.forEach(s => s.assignments?.forEach(a => {
    if (totals[a.uid] !== undefined) totals[a.uid] += a.sessionEffort || 0
  }))

  const values = members.map(m => totals[m.uid] || 0)
  const max = Math.max(...values, 1)
  const avg = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0
  const sorted = [...members].sort((a, b) => (totals[a.uid] || 0) - (totals[b.uid] || 0))
  const least = sorted[0]
  const most = sorted[sorted.length - 1]

  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-48 gap-2">
        <div className="text-4xl">⚖️</div>
        <p className="text-gray-400 dark:text-gray-500 text-sm">Complete a session to see the balance.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-5 space-y-4">
        <h2 className="font-bold text-gray-900 dark:text-white">Cumulative effort</h2>
        {sorted.map(m => (
          <EffortBar key={m.uid} name={m.name} photoURL={m.photoURL} value={totals[m.uid] || 0} max={max} avg={avg} />
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-4 text-center">
          <div className="mb-1 flex justify-center">
            <Avatar name={least?.name} photoURL={least?.photoURL} size={10} />
          </div>
          <div className="text-xs text-green-700 dark:text-green-400 font-semibold uppercase tracking-wide">Lightest load</div>
          <div className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">{least?.name}</div>
          <div className="text-green-600 dark:text-green-400 font-semibold">{totals[least?.uid] || 0}</div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl p-4 text-center">
          <div className="mb-1 flex justify-center">
            <Avatar name={most?.name} photoURL={most?.photoURL} size={10} />
          </div>
          <div className="text-xs text-orange-700 dark:text-orange-400 font-semibold uppercase tracking-wide">Heaviest load</div>
          <div className="font-bold text-gray-800 dark:text-gray-200 mt-0.5">{most?.name}</div>
          <div className="text-orange-500 dark:text-orange-400 font-semibold">{totals[most?.uid] || 0}</div>
        </div>
      </div>

      {least && most && least.uid !== most.uid && (
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl p-3">
          <span className="font-medium text-green-600 dark:text-green-400">{least.name}</span> will be prioritised next session to help balance the effort.
        </p>
      )}
    </div>
  )
}
