import { useEffect, useState } from 'react'
import { onSnapshot, doc } from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useFlat(flatId, onPermissionDenied) {
  const [flat, setFlat] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!flatId) { setLoading(false); return }
    setLoading(true)
    const unsub = onSnapshot(
      doc(db, 'flats', flatId),
      snap => {
        if (snap.exists()) setFlat({ id: snap.id, ...snap.data() })
        setLoading(false)
      },
      err => {
        if (err.code === 'permission-denied') {
          setLoading(false)
          onPermissionDenied?.()
        }
      }
    )
    return unsub
  }, [flatId])

  return { flat, loading }
}
