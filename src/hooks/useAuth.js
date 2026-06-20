import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '../lib/firebase'

export function useAuth() {
  const [user, setUser] = useState(undefined) // undefined = loading
  useEffect(() => onAuthStateChanged(auth, setUser), [])
  return { user, loading: user === undefined }
}
