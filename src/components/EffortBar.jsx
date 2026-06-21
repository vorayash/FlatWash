import Avatar from './Avatar'

export default function EffortBar({ name, photoURL, value, max, avg }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  const isLow = value <= avg * 0.9
  const isHigh = value >= avg * 1.1

  return (
    <div className="flex items-center gap-3">
      <Avatar name={name} photoURL={photoURL} size={8} />
      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-sm mb-1">
          <span className="font-medium text-gray-800 dark:text-gray-200 truncate">{name}</span>
          <span className={`font-semibold ml-2 flex-shrink-0 ${isLow ? 'text-green-500' : isHigh ? 'text-orange-400' : 'text-gray-600 dark:text-gray-400'}`}>
            {value}
          </span>
        </div>
        <div className="h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isLow ? 'bg-green-400' : isHigh ? 'bg-orange-400' : 'bg-blue-400'
            }`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  )
}
