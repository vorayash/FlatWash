export default function UtensilCard({ utensil, selected, effort, onToggle, onEffortChange }) {
  return (
    <div
      onClick={onToggle}
      className={`relative rounded-2xl border-2 p-3 cursor-pointer transition-all select-none ${
        selected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 shadow-md'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600'
      }`}
    >
      <div className="flex justify-center mb-1">
        {utensil.iconUrl ? (
          <img src={utensil.iconUrl} alt={utensil.name} className="w-12 h-12 object-contain" />
        ) : (
          <span className="text-4xl">{utensil.emoji}</span>
        )}
      </div>
      <div className="text-center text-xs font-medium text-gray-700 dark:text-gray-300 truncate">{utensil.name}</div>

      {selected && (
        <div className="mt-2" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>Effort</span>
            <span className="font-semibold text-blue-600 dark:text-blue-400">{effort}</span>
          </div>
          <input
            type="range" min={1} max={100} value={effort}
            onChange={e => onEffortChange(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>
      )}

      {selected && (
        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center">
          <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
    </div>
  )
}
