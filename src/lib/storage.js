import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './firebase'

export async function uploadUtensilIcon(flatId, utensilId, blob) {
  const path = `flats/${flatId}/utensils/${utensilId}.png`
  const storageRef = ref(storage, path)
  await uploadBytes(storageRef, blob, { contentType: 'image/png' })
  return getDownloadURL(storageRef)
}

export async function deleteUtensilIcon(flatId, utensilId) {
  try {
    await deleteObject(ref(storage, `flats/${flatId}/utensils/${utensilId}.png`))
  } catch {
    // ignore if file doesn't exist
  }
}
