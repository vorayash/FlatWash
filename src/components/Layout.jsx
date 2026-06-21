import { useState } from 'react'
import { signOutUser } from '../lib/auth'
import { useAuth } from '../hooks/useAuth'
import { useTheme } from '../hooks/useTheme'
import Avatar from './Avatar'
import GroupSwitcher from './GroupSwitcher'

const TABS = [
  { id: 'session', label: 'New Session', icon: '🍽️' },
  { id: 'history', label: 'History',     icon: '📋' },
  { id: 'balance', label: 'Balance',     icon: '⚖️' },
  { id: 'settings',label: 'Settings',   icon: '⚙️' },
]

export default function Layout({ flat, activeTab, setActiveTab, flatIds = [], onGroupAdded, onGroupSwitch, children }) {
  const { user } = useAuth()
  const { dark, toggle } = useTheme()
  const [showSwitcher, setShowSwitcher] = useState(false)

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setShowSwitcher(true)}
          className="flex items-center gap-2 hover:opacity-70 transition-opacity"
        >
          <span className="text-xl">🫧</span>
          <div className="font-bold text-gray-900 dark:text-white leading-tight">{flat?.name || 'FlatWash'}</div>
          <span className="text-gray-400 dark:text-gray-500 text-xs">▾</span>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-base"
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? '☀️' : '🌙'}
          </button>
          {user && <Avatar name={user.displayName || user.email} photoURL={user.photoURL} size={8} />}
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

      {/* Footer */}
      <footer className="text-center py-2 text-xs text-gray-400 dark:text-gray-600">
        <span
          title="vorayash9028@gmail.com"
          className="cursor-default hover:text-gray-600 dark:hover:text-gray-400 transition-colors"
        >
          Developed by Yash Vora
        </span>
      </footer>

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

      {showSwitcher && (
        <GroupSwitcher
          flatIds={flatIds}
          activeFlatId={flat?.id}
          onSwitch={onGroupSwitch}
          onGroupAdded={onGroupAdded}
          onClose={() => setShowSwitcher(false)}
        />
      )}
    </div>
  )
}
