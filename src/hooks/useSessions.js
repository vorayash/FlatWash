import { useEffect, useState } from 'react'
import { subscribeToSessions } from '../lib/firestore'

export function useSessions(flatId) {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!flatId) { setLoading(false); return }
    setLoading(true)
    const unsub = subscribeToSessions(flatId, data => {
      setSessions(data)
      setLoading(false)
    })
    return unsub
  }, [flatId])

  return { sessions, loading }
}
