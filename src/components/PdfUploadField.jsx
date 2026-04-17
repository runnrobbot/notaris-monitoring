import { useState, useRef } from 'react'
import { uploadPDF, getPdfViewUrl } from '../utils/storageUtils'

export default function PdfUploadField({ label, value, onChange, docId, fieldName, disabled = false }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState(0)
  const [error, setError]         = useState('')
  const fileRef = useRef()

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf') { setError('Hanya file PDF.'); return }
    if (file.size > 10 * 1024 * 1024) { setError('Maksimal 10 MB.'); return }
    setError(''); setUploading(true); setProgress(0)
    try {
      const id = docId || `new_${fieldName}_${Date.now()}`
      const result = await uploadPDF(file, id, fieldName, setProgress)
      onChange(result)
    } catch (err) {
      setError('Upload gagal: ' + err.message)
    } finally {
      setUploading(false); setProgress(0)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const viewUrl = getPdfViewUrl(value)

  return (
    <div>
      <p style={{ fontSize: 10, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
        {label}
      </p>

      {value?.url && (
        <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg"
          style={{ background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.25)' }}>
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" style={{ color: '#e05252' }}>
            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
          <a href={viewUrl} target="_blank" rel="noopener noreferrer"
            className="text-xs flex-1 truncate hover:underline"
            style={{ color: 'var(--gold)' }}
            title="Buka PDF">
            Lihat PDF
          </a>
          {!disabled && (
            <button type="button" onClick={() => onChange(null)}
              style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12 }}
              onMouseEnter={e => e.currentTarget.style.color = '#e05252'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              ✕
            </button>
          )}
        </div>
      )}

      {!disabled && (
        <>
          <label className="inline-flex items-center gap-1.5 cursor-pointer rounded-lg px-3 py-1.5 text-xs transition"
            style={{ border: '1px dashed rgba(255,255,255,0.15)', color: '#888' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(201,168,76,0.5)'; e.currentTarget.style.color = '#C9A84C' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#888' }}>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {value?.url ? 'Ganti PDF' : 'Upload PDF'}
            <input ref={fileRef} type="file" accept="application/pdf" className="hidden"
              onChange={handleFile} disabled={uploading} />
          </label>

          {uploading && (
            <div className="mt-2">
              <div className="flex justify-between text-[10px] mb-1" style={{ color: '#888' }}>
                <span>Mengupload ke Supabase…</span><span>{progress}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#202020' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${progress}%`, background: '#C9A84C' }} />
              </div>
            </div>
          )}
          {error && <p className="mt-1 text-xs" style={{ color: '#e05252' }}>{error}</p>}
        </>
      )}
    </div>
  )
}
