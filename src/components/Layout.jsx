import { signOutUser } from '../lib/auth'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'

const TABS = [
  { id: 'session', label: 'New Session', icon: '🍽️' },
  { id: 'history', label: 'History',     icon: '📋' },
  { id: 'balance', label: 'Balance',     icon: '⚖️' },
  { id: 'settings',label: 'Settings',   icon: '⚙️' },
]

export default function Layout({ flat, activeTab, setActiveTab, children }) {
  const { user } = useAuth()
  const { dark, toggle } = useTheme()

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl">🫧</span>
          <div className="font-bold text-gray-900 dark:text-white leading-tight">{flat?.name || 'FlatWash'}</div>
        </div>
        <div className="flex items-center gap-2">
          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-base"
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? '☀️' : '🌙'}
          </button>
          {user?.photoURL && (
            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full" referrerPolicy="no-referrer" />
          )}
          <button
            onClick={signOutUser}
            className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-700 rounded-lg px-2 py-1"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 py-6">{children}</main>

      {/* Bottom Tab Bar */}
      <nav className="sticky bottom-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 dark:text-blue-400 font-semibold'
                : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            <span className="text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
