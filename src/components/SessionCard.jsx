import { useState } from 'react'

function formatDate(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function SessionCard({ session }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div>
          <div className="font-medium text-gray-900 dark:text-white text-sm">{session.label}</div>
          <div className="text-xs text-gray-400 dark:text-gray-500">{formatDate(session.createdAt)} · Total effort: {session.totalEffort}</div>
        </div>
        <span className="text-gray-400 text-sm">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="border-t border-gray-100 dark:border-gray-700 divide-y divide-gray-100 dark:divide-gray-700">
          {session.assignments?.map(a => (
            <div key={a.uid} className="px-4 py-3">
              <div className="flex items-center gap-2 mb-1.5">
                {a.photoURL && <img src={a.photoURL} alt="" className="w-6 h-6 rounded-full" referrerPolicy="no-referrer" />}
                <span className="font-medium text-sm text-gray-800 dark:text-gray-200">{a.name}</span>
                <span className="ml-auto text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">effort {a.sessionEffort}</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pl-8">
                {a.utensils.length === 0 ? (
                  <span className="text-gray-400 text-xs">Nothing</span>
                ) : (
                  a.utensils.map((u, i) => (
                    <span key={i} className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full px-2 py-0.5">
                      {u.emoji || '🍽️'} {u.name}
                    </span>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
