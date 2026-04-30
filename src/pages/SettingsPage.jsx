import { useState, useEffect } from 'react'
import { supabase } from '../supabase'
import {
  getBanks, addBank, updateBank, deleteBank,
  getJenisAkad, addJenisAkad, updateJenisAkad, deleteJenisAkad,
} from '../services/supabaseService'
import toast from 'react-hot-toast'

const btnBase = {
  fontSize: 11, fontFamily: "'JetBrains Mono',monospace", letterSpacing: '0.08em',
  textTransform: 'uppercase', border: '1px solid var(--border-mid)', borderRadius: 8,
  padding: '7px 14px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
  gap: 6, transition: 'all 0.15s',
}
const inputStyle = {
  background: 'var(--bg-raised)', border: '1px solid rgba(255,255,255,0.12)',
  color: 'var(--text-primary)', borderRadius: 8, padding: '8px 12px',
  fontSize: 13, outline: 'none', fontFamily: "'Outfit',sans-serif", width: '100%',
  transition: 'border-color 0.15s',
}

function ReferenceSection({ title, description, items, onAdd, onEdit, onDelete, loading }) {
  const [newName, setNewName]     = useState('')
  const [editId, setEditId]       = useState(null)
  const [editName, setEditName]   = useState('')
  const [adding, setAdding]       = useState(false)
  const [saving, setSaving]       = useState(false)
  const [deleteId, setDeleteId]   = useState(null)
  const [deleting, setDeleting]   = useState(false)

  async function handleAdd() {
    if (!newName.trim()) return
    setAdding(true)
    try {
      await onAdd(newName.trim())
      setNewName('')
      toast.success(`${title} ditambahkan`)
    } catch (err) {
      toast.error(err.message || 'Gagal menambahkan')
    } finally { setAdding(false) }
  }

  async function handleSaveEdit() {
    if (!editName.trim()) return
    setSaving(true)
    try {
      await onEdit(editId, editName.trim())
      setEditId(null)
      setEditName('')
      toast.success('Berhasil diperbarui')
    } catch (err) {
      toast.error(err.message || 'Gagal memperbarui')
    } finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      await onDelete(deleteId)
      setDeleteId(null)
      toast.success('Berhasil dihapus')
    } catch (err) {
      toast.error(err.message || 'Gagal menghapus')
    } finally { setDeleting(false) }
  }

  return (
    <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-mid)', borderRadius: 12, overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <h2 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 16, fontWeight: 600, color: '#fff', marginBottom: 4 }}>{title}</h2>
        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>{description}</p>
      </div>

      {/* Add input */}
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-raised)', display: 'flex', gap: 8 }}>
        <input
          style={inputStyle}
          placeholder={`Tambah ${title} baru...`}
          value={newName}
          onChange={e => setNewName(e.target.value)}
          onFocus={e => e.target.style.borderColor = 'rgba(201,153,26,0.5)'}
          onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
          onKeyDown={e => e.key === 'Enter' && handleAdd()}
        />
        <button
          onClick={handleAdd}
          disabled={adding || !newName.trim()}
          style={{ ...btnBase, background: 'var(--gold-500)', color: 'var(--navy-900)', border: 'none', fontWeight: 600, flexShrink: 0, opacity: (!newName.trim() || adding) ? 0.5 : 1 }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--gold-400)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--gold-500)'}
        >
          {adding ? '...' : '+ Tambah'}
        </button>
      </div>

      {/* List */}
      <div>
        {loading ? (
          <p style={{ padding: '32px', textAlign: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Memuat data…</p>
        ) : items.length === 0 ? (
          <p style={{ padding: '32px', textAlign: 'center', fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Belum ada data. Tambah yang pertama.</p>
        ) : items.map((item, idx) => (
          <div key={item.id}
            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px', borderBottom: idx < items.length - 1 ? '1px solid var(--border)' : 'none', transition: 'background 0.12s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-raised)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {/* Index number */}
            <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, color: 'rgba(255,255,255,0.25)', minWidth: 24, textAlign: 'right', flexShrink: 0 }}>{idx + 1}</span>

            {/* Name / edit input */}
            {editId === item.id ? (
              <input
                style={{ ...inputStyle, flex: 1 }}
                value={editName}
                onChange={e => setEditName(e.target.value)}
                autoFocus
                onFocus={e => e.target.style.borderColor = 'rgba(201,153,26,0.5)'}
                onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.12)'}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSaveEdit()
                  if (e.key === 'Escape') { setEditId(null); setEditName('') }
                }}
              />
            ) : (
              <span style={{ flex: 1, fontFamily: "'Outfit',sans-serif", fontSize: 13, color: 'var(--text-primary)' }}>{item.name}</span>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              {editId === item.id ? (
                <>
                  <button onClick={handleSaveEdit} disabled={saving}
                    style={{ ...btnBase, padding: '5px 12px', background: 'rgba(201,153,26,0.15)', color: 'var(--gold-400)', border: '1px solid var(--gold-border)' }}>
                    {saving ? '...' : 'Simpan'}
                  </button>
                  <button onClick={() => { setEditId(null); setEditName('') }}
                    style={{ ...btnBase, padding: '5px 12px', background: 'transparent', color: 'rgba(255,255,255,0.4)' }}>
                    Batal
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => { setEditId(item.id); setEditName(item.name) }}
                    style={{ padding: 6, borderRadius: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', transition: 'all 0.12s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.8)'; e.currentTarget.style.background = 'var(--bg-raised)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.background = 'none' }}
                    title="Edit"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                  </button>
                  <button onClick={() => setDeleteId(item.id)}
                    style={{ padding: 6, borderRadius: 6, background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', transition: 'all 0.12s' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#e05252'; e.currentTarget.style.background = 'rgba(224,82,82,0.1)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; e.currentTarget.style.background = 'none' }}
                    title="Hapus"
                  >
                    <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Delete confirm dialog */}
      {deleteId && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(5,10,18,0.82)' }}>
          <div style={{ width: '100%', maxWidth: 360, borderRadius: 12, padding: 24, background: 'var(--bg-surface)', border: '1px solid var(--border-mid)', boxShadow: 'var(--shadow-lg)' }}>
            <h3 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 17, fontWeight: 600, color: '#fff', marginBottom: 8 }}>Hapus {title}?</h3>
            <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 11, color: 'rgba(255,255,255,0.45)', marginBottom: 22, lineHeight: 1.6 }}>
              Tindakan ini tidak bisa dibatalkan. Dokumen yang sudah menggunakan nilai ini tidak akan terpengaruh.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button onClick={() => setDeleteId(null)} style={{ ...btnBase, color: 'rgba(255,255,255,0.6)', background: 'var(--bg-raised)' }}>Batal</button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ ...btnBase, background: 'rgba(224,82,82,0.12)', color: '#e05252', border: '1px solid rgba(224,82,82,0.25)' }}>
                {deleting ? 'Menghapus…' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const [banks, setBanks]               = useState([])
  const [jenisAkadList, setJenisAkadList] = useState([])
  const [loadingBanks, setLoadingBanks]     = useState(true)
  const [loadingJenis, setLoadingJenis]     = useState(true)

  useEffect(() => {
    getBanks().then(d => { setBanks(d); setLoadingBanks(false) })
    getJenisAkad().then(d => { setJenisAkadList(d); setLoadingJenis(false) })

    // Realtime updates
    const ch = supabase.channel('settings-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banks' }, () => {
        getBanks().then(setBanks)
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jenis_akad' }, () => {
        getJenisAkad().then(setJenisAkadList)
      })
      .subscribe()

    return () => supabase.removeChannel(ch)
  }, [])

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, letterSpacing: '0.14em', color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 4 }}>Admin</p>
        <h1 style={{ fontFamily: "'Outfit',sans-serif", fontSize: 22, fontWeight: 600, color: '#fff', lineHeight: 1 }}>Pengaturan Referensi</h1>
        <p style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 5 }}>
          Kelola daftar bank dan jenis akad yang tersedia di form dokumen
        </p>
      </div>

      {/* Two columns on desktop, stacked on mobile */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        <ReferenceSection
          title="Bank"
          description={`${banks.length} bank terdaftar`}
          items={banks}
          loading={loadingBanks}
          onAdd={addBank}
          onEdit={updateBank}
          onDelete={deleteBank}
        />
        <ReferenceSection
          title="Jenis Akad"
          description={`${jenisAkadList.length} jenis akad terdaftar`}
          items={jenisAkadList}
          loading={loadingJenis}
          onAdd={addJenisAkad}
          onEdit={updateJenisAkad}
          onDelete={deleteJenisAkad}
        />
      </div>
    </div>
  )
}
