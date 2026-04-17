import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getDocuments, getDocumentsByCompanies, getCompanies } from '../services/supabaseService'
import { FileText, Building2, CheckCircle2, Clock, RefreshCw, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

// snake_case activity fields (Supabase PostgreSQL)
const ACTIVITY_FIELDS = [
  'tanggal_pengecekan', 'tanggal_znt', 'tanggal_alih_media',
  'tanggal_balik_nama', 'tanggal_peningkatan_shm', 'tanggal_ht', 'tanggal_roya',
]

function StatCard({ label, value, icon: Icon, sub, gold }) {
  return (
    <div className="rounded-xl p-5 flex items-start justify-between" style={{
      background: 'var(--bg-surface)',
      border: gold ? '1px solid var(--gold-border)' : '1px solid var(--border)',
    }}>
      <div>
        <p className="text-[10px] uppercase tracking-widest mb-2" style={{ color: 'var(--text-muted)' }}>{label}</p>
        <p className="text-3xl font-bold leading-none" style={{
          fontFamily: "'Cormorant Garamond', serif",
          color: gold ? 'var(--gold)' : 'var(--text-primary)',
        }}>{value}</p>
        {sub && <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>{sub}</p>}
      </div>
      <div className="rounded-lg p-2.5" style={{ background: gold ? 'var(--gold-dim)' : 'var(--bg-raised)' }}>
        <Icon className="h-4 w-4" style={{ color: gold ? 'var(--gold)' : 'var(--text-secondary)' }} />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { isAdmin, userProfile } = useAuth()
  const [loading, setLoading]     = useState(true)
  const [docs, setDocs]           = useState([])
  const [companies, setCompanies] = useState([])

  async function fetchData() {
    setLoading(true)
    try {
      const [companiesData, docsData] = await Promise.all([
        getCompanies(),
        isAdmin
          ? getDocuments()
          : getDocumentsByCompanies(userProfile?.assigned_companies || []),
      ])
      setCompanies(companiesData)
      setDocs(docsData)
    } catch {
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const total   = docs.length
  const selesai = docs.filter(d => !!d.tanggal_selesai).length
  const proses  = docs.filter(d => !d.tanggal_selesai && ACTIVITY_FIELDS.some(f => !!d[f])).length
  const belum   = total - selesai - proses
  const rate    = total > 0 ? Math.round((selesai / total) * 100) : 0
  const companyMap = Object.fromEntries(companies.map(c => [c.id, c.name]))

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-5 w-5 animate-spin" style={{ color: 'var(--gold)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Memuat…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.1 }}>
            Selamat datang,{' '}
            <span style={{ color: 'var(--gold)' }}>{userProfile?.name?.split(' ')[0] || 'User'}</span>
          </h2>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            Ringkasan monitoring dokumen legal
          </p>
        </div>
        <button onClick={fetchData}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition"
          style={{ border: '1px solid var(--border-strong)', color: 'var(--text-secondary)', background: 'var(--bg-raised)' }}>
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Dokumen" value={total}   icon={FileText}    sub="semua record" />
        <StatCard label="Selesai"       value={selesai} icon={CheckCircle2} sub={`${rate}% completion`} gold />
        <StatCard label="Dalam Proses"  value={proses}  icon={Clock}       sub="sedang berjalan" />
        <StatCard label="Perusahaan"    value={companies.length} icon={Building2} sub="terdaftar" />
      </div>

      {/* Progress bar */}
      <div className="rounded-xl p-5" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="flex justify-between items-center mb-3">
          <p className="text-xs uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Completion Rate</p>
          <p className="text-sm font-semibold" style={{ color: 'var(--gold)' }}>{rate}%</p>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-raised)' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${rate}%`, background: 'linear-gradient(90deg, var(--gold) 0%, rgba(201,168,76,0.6) 100%)' }} />
        </div>
        <div className="flex gap-6 mt-3">
          {[
            { label: 'Selesai', val: selesai, color: 'var(--gold)' },
            { label: 'Proses',  val: proses,  color: 'var(--text-secondary)' },
            { label: 'Belum',   val: belum,   color: 'var(--text-muted)' },
          ].map(({ label, val, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: color }} />
              <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                {label}: <span style={{ color: 'var(--text-secondary)' }}>{val}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent docs */}
      <div className="rounded-xl overflow-hidden" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Dokumen Terbaru</p>
          <Link to="/documents" className="flex items-center gap-1 text-xs transition" style={{ color: 'var(--gold)' }}>
            Lihat semua <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Debitur', 'Perusahaan', 'Akad', 'Bank', 'Status'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium uppercase tracking-wider"
                    style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {docs.slice(0, 8).map(doc => {
                const done = doc.tanggal_selesai && doc.tanggal_register
                const any  = ACTIVITY_FIELDS.some(f => doc[f])
                return (
                  <tr key={doc.id} style={{ borderBottom: '1px solid var(--border)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-raised)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{doc.pihak_pertama || '—'}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{companyMap[doc.company_id] || '—'}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{doc.jenis_akad || '—'}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{doc.bank || '—'}</td>
                    <td className="px-4 py-3">
                      {done ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                          style={{ background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--gold-border)' }}>Selesai</span>
                      ) : any ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                          style={{ background: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>Proses</span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider"
                          style={{ background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)' }}>Belum</span>
                      )}
                    </td>
                  </tr>
                )
              })}
              {docs.length === 0 && (
                <tr><td colSpan={5} className="py-12 text-center text-sm" style={{ color: 'var(--text-muted)' }}>Belum ada data dokumen</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
