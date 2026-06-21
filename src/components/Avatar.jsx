const COLORS = [
  'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500',
  'bg-pink-500', 'bg-teal-500', 'bg-red-500', 'bg-indigo-500',
]

function colorFor(name = '') {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return COLORS[Math.abs(hash) % COLORS.length]
}

const SIZE_CLASSES = {
  6:  { box: 'w-6 h-6',   text: 'text-xs' },
  7:  { box: 'w-7 h-7',   text: 'text-xs' },
  8:  { box: 'w-8 h-8',   text: 'text-sm' },
  10: { box: 'w-10 h-10', text: 'text-base' },
}

export default function Avatar({ name = '', photoURL, size = 8 }) {
  const { box, text } = SIZE_CLASSES[size] ?? SIZE_CLASSES[8]
  if (photoURL) {
    return <img src={photoURL} alt={name} referrerPolicy="no-referrer" className={`${box} rounded-full object-cover flex-shrink-0`} />
  }
  return (
    <div className={`${box} ${text} rounded-full flex items-center justify-center flex-shrink-0 text-white font-semibold select-none ${colorFor(name)}`}>
      {name.charAt(0).toUpperCase() || '?'}
    </div>
  )
}
