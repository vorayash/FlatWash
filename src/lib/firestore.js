import {
  doc, collection, addDoc, updateDoc,
  getDoc, getDocs, query, where, arrayUnion, arrayRemove,
  onSnapshot, serverTimestamp, orderBy,
} from 'firebase/firestore'
import { db } from './firebase'

const DEFAULT_UTENSILS = [
  { id: 'plate',        name: 'Plate',        defaultEffort: 10, emoji: '🍽️' },
  { id: 'bowl',         name: 'Bowl',         defaultEffort: 10, emoji: '🥣' },
  { id: 'glass',        name: 'Glass',        defaultEffort: 5,  emoji: '🥛' },
  { id: 'pot',          name: 'Pot',          defaultEffort: 40, emoji: '🫕' },
  { id: 'pan',          name: 'Pan',          defaultEffort: 35, emoji: '🍳' },
  { id: 'knife',        name: 'Knife',        defaultEffort: 5,  emoji: '🔪' },
  { id: 'spoon',        name: 'Spoon',        defaultEffort: 3,  emoji: '🥄' },
  { id: 'fork',         name: 'Fork',         defaultEffort: 3,  emoji: '🍴' },
  { id: 'cuttingboard', name: 'Cutting Board',defaultEffort: 15, emoji: '🪵' },
  { id: 'wok',          name: 'Wok',          defaultEffort: 40, emoji: '🥘' },
]

// --- Flat ---

export async function createFlat(name, adminUid, adminName, adminPhoto) {
  const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase()
  const ref = await addDoc(collection(db, 'flats'), {
    name,
    adminUid,
    inviteCode,
    members: [{ uid: adminUid, name: adminName, photoURL: adminPhoto }],
    memberUids: [adminUid],
    utensils: DEFAULT_UTENSILS,
    createdAt: serverTimestamp(),
  })
  await updateDoc(doc(db, 'users', adminUid), { flatIds: arrayUnion(ref.id) })
  return ref.id
}

export async function joinFlat(code, uid, name, photoURL) {
  const q = query(collection(db, 'flats'), where('inviteCode', '==', code.toUpperCase()))
  const snap = await getDocs(q)
  if (snap.empty) throw new Error('Invalid invite code')
  const flatDoc = snap.docs[0]
  const flatId = flatDoc.id
  const members = flatDoc.data().members
  if (members.some(m => m.uid === uid)) throw new Error('Already a member')
  await updateDoc(doc(db, 'flats', flatId), {
    members: arrayUnion({ uid, name, photoURL }),
    memberUids: arrayUnion(uid),
  })
  await updateDoc(doc(db, 'users', uid), { flatIds: arrayUnion(flatId) })
  return flatId
}

export async function getUserFlats(uid) {
  const snap = await getDoc(doc(db, 'users', uid))
  if (!snap.exists()) return []
  return snap.data().flatIds || []
}

export function subscribeToFlat(flatId, cb) {
  return onSnapshot(doc(db, 'flats', flatId), snap => {
    if (snap.exists()) cb({ id: snap.id, ...snap.data() })
  })
}

export async function updateFlatName(flatId, name) {
  await updateDoc(doc(db, 'flats', flatId), { name })
}

export async function regenerateInviteCode(flatId) {
  const code = Math.random().toString(36).substring(2, 8).toUpperCase()
  await updateDoc(doc(db, 'flats', flatId), { inviteCode: code })
  return code
}

export async function removeMember(flatId, uid, memberUid) {
  const snap = await getDoc(doc(db, 'flats', flatId))
  const members = snap.data().members.filter(m => m.uid !== memberUid)
  await updateDoc(doc(db, 'flats', flatId), {
    members,
    memberUids: arrayRemove(memberUid),
  })
  await updateDoc(doc(db, 'users', memberUid), { flatIds: arrayRemove(flatId) })
}

export async function leaveFlat(flatId, uid) {
  const snap = await getDoc(doc(db, 'flats', flatId))
  const members = snap.data().members.filter(m => m.uid !== uid)
  await updateDoc(doc(db, 'flats', flatId), {
    members,
    memberUids: arrayRemove(uid),
  })
  await updateDoc(doc(db, 'users', uid), { flatIds: arrayRemove(flatId) })
}

export async function updateUtensils(flatId, utensils) {
  await updateDoc(doc(db, 'flats', flatId), { utensils })
}

// --- Sessions ---

function stripUndefined(obj) {
  return JSON.parse(JSON.stringify(obj, (_, v) => v === undefined ? null : v))
}

export async function saveSession(flatId, label, assignments) {
  const totalEffort = assignments.reduce((s, a) => s + a.sessionEffort, 0)
  await addDoc(collection(db, 'flats', flatId, 'sessions'), {
    label,
    createdAt: serverTimestamp(),
    assignments: stripUndefined(assignments),
    totalEffort,
  })
}

export function subscribeToSessions(flatId, cb) {
  const q = query(
    collection(db, 'flats', flatId, 'sessions'),
    orderBy('createdAt', 'desc')
  )
  return onSnapshot(q, snap => {
    cb(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  })
}
