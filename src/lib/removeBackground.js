import { removeBackground as imglyRemoveBg } from '@imgly/background-removal'

export async function removeBackground(file) {
  const blob = await imglyRemoveBg(file, {
    output: { format: 'image/png', quality: 0.9 },
  })
  return blob
}

// Resize blob to max 200×200 and return a base64 PNG data URL
export function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const url = URL.createObjectURL(blob)
    img.onload = () => {
      const MAX = 200
      const scale = Math.min(MAX / img.width, MAX / img.height, 1)
      const w = Math.round(img.width * scale)
      const h = Math.round(img.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d').drawImage(img, 0, 0, w, h)
      URL.revokeObjectURL(url)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = reject
    img.src = url
  })
}
