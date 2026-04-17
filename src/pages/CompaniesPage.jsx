import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import {
  getCompanies, addCompany, updateCompany, deleteCompany,
  getDocuments, getDocumentsByCompanies, seedCompaniesFromNamaDeveloper,
} from '../services/supabaseService'
import { Building2, Plus, Pencil, Trash2, X, Save, Loader2, RefreshCw, FileText, Database, ChevronRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'

function CompanyModal({ isOpen, onClose, onSubmit, company, loading }) {
  const { register, handleSubmit, reset, formState: { errors } } = useForm()
  useEffect(() => { reset(company ? { name: company.name } : { name: '' }) }, [company, isOpen])
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md rounded-2xl" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)' }}>
        <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', fontWeight: 600, color: 'var(--text-primary)' }}>
            {company ? 'Edit Perusahaan' : 'Tambah Perusahaan'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded transition" style={{ color: 'var(--text-muted)' }}>
            <X className="h-4 w-4" />
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label style={{ display: 'block', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', marginBottom: 6 }}>
              Nama Perusahaan / PT *
            </label>
            <input type="text" placeholder="cth. PT MAJU BERSAMA"
              style={{
                width: '100%', background: 'var(--bg-raised)', padding: '9px 12px',
                border: errors.name ? '1px solid #e05252' : '1px solid var(--border-strong)',
                borderRadius: 8, fontSize: 13, color: 'var(--text-primary)', outline: 'none',
              }}
              {...register('name', { required: true })} />
            {errors.name && <p style={{ fontSize: 11, color: '#e05252', marginTop: 3 }}>Nama wajib diisi</p>}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm transition"
              style={{ border: '1px solid var(--border-strong)', color: 'var(--text-secondary)' }}>
              Batal
            </button>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition"
              style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--gold-border)' }}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {loading ? 'Menyimpan…' : 'Simpan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function CompaniesPage() {
  const { isAdmin } = useAuth()
  const [companies, setCompanies] = useState([])
  const [docCounts, setDocCounts] = useState({})
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [editCompany, setEditCompany] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [search, setSearch] = useState('')

  async function fetchData() {
    setLoading(true)
    try {
      const [list, allDocs] = await Promise.all([getCompanies(), getDocuments()])
      setCompanies(list)
      const counts = {}
      allDocs.forEach(d => { counts[d.company_id] = (counts[d.company_id] || 0) + 1 })
      setDocCounts(counts)
    } catch { toast.error('Gagal memuat data') }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchData() }, [])

  async function handleSubmit(data) {
    setSaving(true)
    try {
      if (editCompany) {
        await updateCompany(editCompany.id, data)
        setCompanies(prev => prev.map(c => c.id === editCompany.id ? { ...c, ...data } : c))
        toast.success('Perusahaan diperbarui')
      } else {
        await addCompany(data)
        toast.success('Perusahaan ditambahkan')
        await fetchData()
      }
      setModalOpen(false); setEditCompany(null)
    } catch { toast.error('Operasi gagal') }
    finally { setSaving(false) }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try {
      await deleteCompany(deleteId)
      setCompanies(prev => prev.filter(c => c.id !== deleteId))
      toast.success('Perusahaan dihapus')
    } catch { toast.error('Gagal menghapus') }
    finally { setDeleting(false); setDeleteId(null) }
  }

  async function handleSeed() {
    setSeeding(true)
    try {
      const count = await seedCompaniesFromNamaDeveloper()
      toast.success(`${count} perusahaan berhasil di-seed`)
      await fetchData()
    } catch { toast.error('Seed gagal') }
    finally { setSeeding(false) }
  }

  const filtered = companies.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '26px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>
            Perusahaan
          </h1>
          <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{filtered.length} perusahaan terdaftar</p>
        </div>
        <div className="flex gap-2">
          {isAdmin && (
            <button onClick={handleSeed} disabled={seeding}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition"
              style={{ border: '1px solid var(--border-strong)', color: 'var(--text-secondary)', background: 'var(--bg-raised)' }}>
              {seeding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Database className="h-3.5 w-3.5" />}
              Seed dari Excel
            </button>
          )}
          <button onClick={fetchData}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition"
            style={{ border: '1px solid var(--border-strong)', color: 'var(--text-secondary)', background: 'var(--bg-raised)' }}>
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </button>
          {isAdmin && (
            <button onClick={() => { setEditCompany(null); setModalOpen(true) }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition"
              style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--gold-border)' }}>
              <Plus className="h-3.5 w-3.5" /> Tambah
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <input
        style={{
          width: '100%', maxWidth: 280, background: 'var(--bg-raised)', padding: '8px 12px',
          border: '1px solid var(--border-strong)', borderRadius: 8, fontSize: 13,
          color: 'var(--text-primary)', outline: 'none', marginBottom: 16,
        }}
        placeholder="Cari perusahaan…"
        value={search} onChange={e => setSearch(e.target.value)} />

      {/* Grid */}
      {loading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="h-5 w-5 animate-spin" style={{ color: 'var(--gold)' }} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-20 text-center" style={{ color: 'var(--text-muted)' }}>
          <Building2 className="h-10 w-10 mx-auto mb-3 opacity-20" />
          <p className="text-sm">Belum ada perusahaan</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(c => (
            <div key={c.id} className="rounded-xl p-4 transition group"
              style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--gold-border)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 h-9 w-9 rounded-lg flex items-center justify-center"
                    style={{ background: 'var(--gold-dim)', border: '1px solid var(--gold-border)' }}>
                    <Building2 className="h-4 w-4" style={{ color: 'var(--gold)' }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium leading-tight truncate" style={{ color: 'var(--text-primary)' }} title={c.name}>
                      {c.name}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {docCounts[c.id] || 0} dokumen
                    </p>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditCompany(c); setModalOpen(true) }}
                      className="p-1.5 rounded transition"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-primary)'; e.currentTarget.style.background = 'var(--bg-hover)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setDeleteId(c.id)}
                      className="p-1.5 rounded transition"
                      style={{ color: 'var(--text-muted)' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#e05252'; e.currentTarget.style.background = 'rgba(224,82,82,0.1)' }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent' }}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
                <Link to={`/documents?company=${c.id}`}
                  className="flex items-center gap-1 text-xs transition"
                  style={{ color: 'var(--text-secondary)' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}>
                  <FileText className="h-3 w-3" /> Lihat dokumen
                  <ChevronRight className="h-3 w-3 ml-auto" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <CompanyModal isOpen={modalOpen} onClose={() => { setModalOpen(false); setEditCompany(null) }}
        onSubmit={handleSubmit} company={editCompany} loading={saving} />

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
          <div className="w-full max-w-sm rounded-xl p-6" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)' }}>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '20px', color: 'var(--text-primary)', marginBottom: 8 }}>Hapus Perusahaan?</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Semua data terkait akan terpengaruh.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-lg text-sm"
                style={{ border: '1px solid var(--border-strong)', color: 'var(--text-secondary)' }}>Batal</button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'rgba(224,82,82,0.15)', color: '#e05252', border: '1px solid rgba(224,82,82,0.3)' }}>
                {deleting ? 'Menghapus…' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
