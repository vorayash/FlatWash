import { useEffect, useState } from 'react'
import { useAuth } from './hooks/useAuth'
import { getUserFlats } from './lib/firestore'
import Landing from './pages/Landing'
import OnboardingPage from './pages/OnboardingPage'
import DashboardPage from './pages/DashboardPage'

const urlJoinCode = new URLSearchParams(window.location.search).get('join') || null

export default function App() {
  const { user, loading: authLoading } = useAuth()
  const [flatIds, setFlatIds] = useState([])
  const [activeFlatId, setActiveFlatId] = useState(null)
  const [checking, setChecking] = useState(false)

  useEffect(() => {
    if (!user) { setFlatIds([]); setActiveFlatId(null); return }
    setChecking(true)
    getUserFlats(user.uid).then(ids => {
      setFlatIds(ids)
      setActiveFlatId(ids[0] || null)
      setChecking(false)
    })
  }, [user?.uid])

  function handleGroupAdded(newId) {
    window.history.replaceState({}, '', window.location.pathname)
    setFlatIds(prev => prev.includes(newId) ? prev : [...prev, newId])
    setActiveFlatId(newId)
  }

  function handleLeft() {
    const remaining = flatIds.filter(id => id !== activeFlatId)
    setFlatIds(remaining)
    setActiveFlatId(remaining[0] || null)
  }

  if (authLoading || checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-4xl animate-pulse">🫧</div>
      </div>
    )
  }

  if (!user) return <Landing />

  if (!activeFlatId) {
    return (
      <OnboardingPage
        onJoined={handleGroupAdded}
        prefillCode={urlJoinCode}
      />
    )
  }

  return (
    <DashboardPage
      flatId={activeFlatId}
      flatIds={flatIds}
      onLeft={handleLeft}
      onGroupAdded={handleGroupAdded}
      onGroupSwitch={setActiveFlatId}
    />
  )
}
