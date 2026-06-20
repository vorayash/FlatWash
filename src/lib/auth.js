import {
  GoogleAuthProvider, signInWithPopup, signOut,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  updateProfile, sendPasswordResetEmail,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from './firebase'

const googleProvider = new GoogleAuthProvider()

async function ensureUserDoc(user) {
  const ref = doc(db, 'users', user.uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      name: user.displayName || user.email.split('@')[0],
      email: user.email,
      photoURL: user.photoURL || null,
      flatIds: [],
    })
  }
}

export async function signInWithGoogle() {
  const result = await signInWithPopup(auth, googleProvider)
  await ensureUserDoc(result.user)
  return result.user
}

export async function signUpWithEmail(name, email, password) {
  const result = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(result.user, { displayName: name })
  await setDoc(doc(db, 'users', result.user.uid), {
    name,
    email,
    photoURL: null,
    flatIds: [],
  })
  return result.user
}

export async function signInWithEmail(email, password) {
  const result = await signInWithEmailAndPassword(auth, email, password)
  await ensureUserDoc(result.user)
  return result.user
}

export function resetPassword(email) {
  return sendPasswordResetEmail(auth, email)
}

export function signOutUser() {
  return signOut(auth)
}

// Human-readable Firebase error messages
export function authErrorMessage(code) {
  switch (code) {
    case 'auth/email-already-in-use':    return 'An account with this email already exists.'
    case 'auth/invalid-email':           return 'Invalid email address.'
    case 'auth/weak-password':           return 'Password must be at least 6 characters.'
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':      return 'Incorrect email or password.'
    case 'auth/too-many-requests':       return 'Too many attempts. Try again later.'
    default:                             return 'Something went wrong. Please try again.'
  }
}
