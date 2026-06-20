import { useRef, useState } from 'react'
import { removeBackground, blobToBase64 } from '../lib/removeBackground'

export default function IconUploader({ utensil, onSave, onClose }) {
  const inputRef = useRef()
  const [original, setOriginal] = useState(null)
  const [processed, setProcessed] = useState(null)
  const [processedBlob, setProcessedBlob] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(file) {
    if (!file) return
    setOriginal(URL.createObjectURL(file))
    setProcessed(null)
    setProcessedBlob(null)
    setError('')
    setLoading(true)
    try {
      const blob = await removeBackground(file)
      setProcessedBlob(blob)
      setProcessed(URL.createObjectURL(blob))
    } catch (e) {
      setError('Background removal failed. Try a clearer photo.')
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    if (!processedBlob) return
    setUploading(true)
    try {
      const base64 = await blobToBase64(processedBlob)
      onSave(base64)
    } catch (e) {
      setError('Save failed: ' + e.message)
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Set icon for {utensil.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => handleFile(e.target.files[0])}
        />

        {!original && (
          <button
            onClick={() => inputRef.current.click()}
            className="w-full border-2 border-dashed border-gray-300 rounded-2xl py-10 text-center text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-colors"
          >
            <div className="text-4xl mb-2">📷</div>
            <div className="text-sm font-medium">Tap to upload a photo</div>
            <div className="text-xs mt-1">Background will be removed automatically</div>
          </button>
        )}

        {loading && (
          <div className="text-center py-8">
            <div className="text-3xl mb-2 animate-spin">⚙️</div>
            <p className="text-sm text-gray-500">Removing background…</p>
            <p className="text-xs text-gray-400 mt-1">This runs in your browser, may take ~10s</p>
          </div>
        )}

        {original && !loading && (
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Original</div>
              <img src={original} alt="original" className="w-full h-32 object-contain rounded-xl bg-gray-100" />
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">Result</div>
              <div className="w-full h-32 rounded-xl bg-[url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAAFUlEQVQoU2NkYGBg+M9AaJAYFAAI7QAFaAwHxgAAAABJRU5ErkJggg==')] bg-repeat overflow-hidden">
                {processed
                  ? <img src={processed} alt="result" className="w-full h-32 object-contain" />
                  : <div className="flex items-center justify-center h-full text-gray-400 text-xs">Processing…</div>
                }
              </div>
            </div>
          </div>
        )}

        {error && <p className="text-red-500 text-sm text-center">{error}</p>}

        <div className="flex gap-2">
          {original && !loading && (
            <button
              onClick={() => { setOriginal(null); setProcessed(null); setProcessedBlob(null); setError('') }}
              className="flex-1 border border-gray-300 text-gray-700 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50"
            >
              Choose another
            </button>
          )}
          {processed && (
            <button
              onClick={handleSave}
              disabled={uploading}
              className="flex-1 bg-blue-600 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-blue-700 disabled:opacity-50"
            >
              {uploading ? 'Saving…' : 'Save icon'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
