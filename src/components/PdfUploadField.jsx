import { useState, useRef } from 'react'
import { uploadPDF, deletePDF } from '../utils/storageUtils'

export default function PdfUploadField({ label, value, onChange, docId, fieldName, disabled = false }) {
  const [uploading, setUploading] = useState(false)
  const [progress,  setProgress]  = useState(0)
  const [error,     setError]     = useState('')
  const fileRef = useRef()

  const files = normalizeToArray(value)

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    if (file.type !== 'application/pdf') { setError('Hanya file PDF.'); return }
    if (file.size > 10 * 1024 * 1024)   { setError('Maksimal 10 MB.'); return }

    setError(''); setUploading(true); setProgress(0)
    try {
      const id     = docId || `new_${fieldName}_${Date.now()}`
      const result = await uploadPDF(file, id, fieldName, setProgress)
      const newFile = { ...result, name: file.name }
      onChange([...files, newFile])
    } catch (err) {
      setError('Upload gagal: ' + err.message)
    } finally {
      setUploading(false)
      setProgress(0)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleRemove(idx) {
    const toRemove = files[idx]
    if (toRemove?.path) {
      try { await deletePDF(toRemove.path) } catch (_) { /* biarkan lanjut */ }
    }
    const next = files.filter((_, i) => i !== idx)
    onChange(next.length > 0 ? next : null)
  }

  return (
    <div>
      <p style={{
        fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
        color: 'var(--text-muted)', textTransform: 'uppercase',
        letterSpacing: '0.12em', marginBottom: 7,
      }}>{label}</p>

      {files.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
          {files.map((f, idx) => (
            <div key={idx} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '7px 10px', borderRadius: 6,
              background: 'var(--gold-dim)', border: '1px solid var(--gold-border)',
            }}>
              <svg style={{ width: 14, height: 14, flexShrink: 0, color: '#E05252' }} fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
              </svg>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
                color: 'rgba(255,255,255,0.35)', flexShrink: 0,
              }}>#{idx + 1}</span>
              <a href={f.url} target="_blank" rel="noopener noreferrer" style={{
                fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                color: 'rgba(255,255,255,0.7)', flex: 1,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                textDecoration: 'none',
              }}>
                {f.name || 'Lihat PDF'}
              </a>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemove(idx)}
                  style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, lineHeight: 1, padding: 0, flexShrink: 0 }}
                  onMouseEnter={e => e.currentTarget.style.color = '#E05252'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
                  title="Hapus dokumen ini"
                >✕</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tombol upload (selalu tampil kalau tidak disabled) */}
      {!disabled && (
        <>
          <label style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
            borderRadius: 6, padding: '6px 12px',
            border: '1px dashed var(--border-mid)', color: 'var(--text-muted)',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
            letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--gold-border)'; e.currentTarget.style.color = 'var(--gold-400)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-mid)';  e.currentTarget.style.color = 'var(--text-muted)' }}
          >
            <svg style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            {files.length > 0 ? '+ Tambah PDF' : 'Upload PDF'}
            <input
              ref={fileRef} type="file" accept="application/pdf"
              style={{ display: 'none' }} onChange={handleFile} disabled={uploading}
            />
          </label>

          {uploading && (
            <div style={{ marginTop: 8 }}>
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 9,
                color: 'var(--text-muted)', marginBottom: 4,
              }}>
                <span>Mengupload…</span><span>{progress}%</span>
              </div>
              <div style={{ height: 3, borderRadius: 2, overflow: 'hidden', background: 'var(--bg-base)' }}>
                <div style={{
                  height: '100%', borderRadius: 2, transition: 'width 0.2s',
                  width: `${progress}%`, background: 'var(--gold-400)',
                }} />
              </div>
            </div>
          )}

          {error && (
            <p style={{ fontFamily: "'JetBrains Mono', monospace", marginTop: 4, fontSize: 10, color: 'var(--red)' }}>
              {error}
            </p>
          )}
        </>
      )}
    </div>
  )
}


function normalizeToArray(value) {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'object' && value.url) return [value]
  return []
}