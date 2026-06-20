import { useEffect, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { getUserFlats } from './lib/firestore'
import Landing from './pages/Landing'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'

// Read ?join=CODE from the URL once on load
const urlJoinCode = new URLSearchParams(window.location.search).get('join') || null

export default function App() {
  const { user, loading: authLoading } = useAuth()
  const [flatId, setFlatId] = useState(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!user) { setFlatId(null); return }
    setChecking(true)
    getUserFlats(user.uid).then(ids => {
      setFlatId(ids[0] || null)
      setChecking(false)
    })
  }, [user?.uid])

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl animate-pulse">🫧</div>
      </div>
    )
  }

  if (!user) return <Landing />

  if (!flatId) {
    return (
      <OnboardingPage
        onJoined={id => {
          // Clean up the ?join= param from the URL without a page reload
          window.history.replaceState({}, '', window.location.pathname)
          setFlatId(id)
        }}
        prefillCode={urlJoinCode}
      />
    )
  }

  return <DashboardPage flatId={flatId} onLeft={() => setFlatId(null)} />
}
