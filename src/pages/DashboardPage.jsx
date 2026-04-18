import { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { getDocuments, getDocumentsByCompanies, getCompanies } from '../services/supabaseService'
import { supabase } from '../supabase'
import { FileText, Building2, CheckCircle2, Clock, RefreshCw, ArrowRight } from 'lucide-react'
import toast from 'react-hot-toast'

const ACTIVITY_FIELDS = ['tanggal_pengecekan','tanggal_znt','tanggal_alih_media','tanggal_balik_nama','tanggal_peningkatan_shm','tanggal_ht','tanggal_roya']

function StatCard({ label, value, icon: Icon, sub, delay }) {
  return (
    <div className={`rounded-xl p-5 flex items-start justify-between hover-lift fade-up-${delay}`}
      style={{ background:'var(--bg-surface)', border:'1px solid var(--border-mid)' }}>
      <div>
        <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, letterSpacing:'0.12em', color:'rgba(255,255,255,0.38)', textTransform:'uppercase', marginBottom:10 }}>{label}</p>
        <p style={{ fontFamily:"'Outfit',sans-serif", fontSize:32, fontWeight:700, color:'#FFFFFF', lineHeight:1 }}>{value}</p>
        {sub && <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'rgba(255,255,255,0.38)', marginTop:6 }}>{sub}</p>}
      </div>
      <div style={{ borderRadius:8, padding:10, background:'var(--bg-raised)', border:'1px solid var(--border)' }}>
        <Icon size={15} style={{ color:'rgba(255,255,255,0.4)' }} />
      </div>
    </div>
  )
}

function fmtDate(val) {
  if (!val) return null
  try { return new Date(val).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'2-digit' }) }
  catch { return val }
}

export default function DashboardPage() {
  const { isAdmin, userProfile } = useAuth()
  const [loading, setLoading] = useState(true)
  const [docs, setDocs] = useState([])
  const [companies, setCompanies] = useState([])

  async function fetchData() {
    setLoading(true)
    try {
      const [companiesData, docsData] = await Promise.all([
        getCompanies(),
        isAdmin ? getDocuments() : getDocumentsByCompanies(userProfile?.assigned_companies || []),
      ])
      setCompanies(companiesData); setDocs(docsData)
    } catch { toast.error('Gagal memuat data') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchData()

    // Realtime — update otomatis tanpa refresh
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, () => { fetchData() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'companies' }, () => { fetchData() })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const total   = docs.length
  const selesai = docs.filter(d => !!d.tanggal_selesai).length
  const proses  = docs.filter(d => !d.tanggal_selesai && ACTIVITY_FIELDS.some(f => !!d[f])).length
  const belum   = total - selesai - proses
  const rate    = total > 0 ? Math.round((selesai / total) * 100) : 0
  const companyMap = Object.fromEntries(companies.map(c => [c.id, c.name]))

  if (loading) return (
    <div style={{ display:'flex', height:256, alignItems:'center', justifyContent:'center' }}>
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:12 }}>
        <RefreshCw size={18} className="animate-spin" style={{ color:'rgba(255,255,255,0.4)' }} />
        <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'rgba(255,255,255,0.38)', letterSpacing:'0.08em' }}>Memuat…</p>
      </div>
    </div>
  )

  return (
    <div style={{ maxWidth:1100, margin:'0 auto' }} className="space-y-6">

      {/* Header */}
      <div className="fade-up" style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between' }}>
        <div>
          <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, letterSpacing:'0.14em', color:'rgba(255,255,255,0.38)', textTransform:'uppercase', marginBottom:6 }}>Ringkasan</p>
          <h2 style={{ fontFamily:"'Outfit',sans-serif", fontSize:26, fontWeight:600, color:'#FFFFFF', lineHeight:1.2 }}>
            Selamat datang, {userProfile?.name?.split(' ')[0] || 'User'}
          </h2>
        </div>
        <button onClick={fetchData} style={{ display:'flex', alignItems:'center', gap:6, padding:'7px 14px', borderRadius:7, border:'1px solid var(--border-mid)', background:'transparent', color:'rgba(255,255,255,0.6)', cursor:'pointer', fontFamily:"'JetBrains Mono',monospace", fontSize:10, letterSpacing:'0.08em', textTransform:'uppercase', transition:'all 0.15s' }}
          onMouseEnter={e=>e.currentTarget.style.background='var(--bg-raised)'}
          onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {/* Stats — 4 kartu semua sama */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }} className="fade-up-1">
        <StatCard label="Total Dokumen" value={total}            icon={FileText}    sub="semua record"     delay={1} />
        <StatCard label="Selesai"       value={selesai}          icon={CheckCircle2} sub={`${rate}% selesai`} delay={2} />
        <StatCard label="Dalam Proses"  value={proses}           icon={Clock}       sub="sedang berjalan"  delay={3} />
        <StatCard label="Perusahaan"    value={companies.length} icon={Building2}   sub="terdaftar"        delay={4} />
      </div>

      {/* Progress */}
      <div className="rounded-xl p-6 fade-up-2" style={{ background:'var(--bg-surface)', border:'1px solid var(--border-mid)' }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:16 }}>
          <div>
            <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, letterSpacing:'0.12em', color:'rgba(255,255,255,0.38)', textTransform:'uppercase', marginBottom:4 }}>Completion Rate</p>
            <p style={{ fontFamily:"'Outfit',sans-serif", fontSize:30, fontWeight:700, color:'#FFFFFF', lineHeight:1 }}>
              {rate}<span style={{ fontSize:16, color:'rgba(255,255,255,0.38)', fontWeight:400 }}>%</span>
            </p>
          </div>
          <div style={{ display:'flex', gap:24 }}>
            {[['Selesai', selesai], ['Proses', proses], ['Belum', belum]].map(([lbl, val]) => (
              <div key={lbl} style={{ textAlign:'center' }}>
                <p style={{ fontFamily:"'Outfit',sans-serif", fontSize:22, fontWeight:700, color:'#FFFFFF', lineHeight:1 }}>{val}</p>
                <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:'rgba(255,255,255,0.38)', marginTop:3, letterSpacing:'0.08em' }}>{lbl}</p>
              </div>
            ))}
          </div>
        </div>
        <div style={{ height:5, borderRadius:3, overflow:'hidden', background:'var(--bg-raised)' }}>
          <div style={{ height:'100%', borderRadius:3, transition:'width 0.7s ease', width:`${rate}%`, background:'rgba(255,255,255,0.25)' }} />
        </div>
      </div>

      {/* Recent docs */}
      <div className="rounded-xl overflow-hidden fade-up-3" style={{ background:'var(--bg-surface)', border:'1px solid var(--border-mid)' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 20px', borderBottom:'1px solid var(--border)' }}>
          <p style={{ fontFamily:"'Outfit',sans-serif", fontSize:15, fontWeight:600, color:'#FFFFFF' }}>Dokumen Terbaru</p>
          <Link to="/documents" style={{ display:'flex', alignItems:'center', gap:4, fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'rgba(255,255,255,0.5)', textDecoration:'none', letterSpacing:'0.08em', textTransform:'uppercase' }}>
            Lihat semua <ArrowRight size={12} />
          </Link>
        </div>
        <table style={{ width:'100%', borderCollapse:'collapse' }}>
          <thead>
            <tr style={{ background:'var(--bg-raised)', borderBottom:'1px solid var(--border)' }}>
              {['Debitur','Perusahaan','Akad','Bank','Status'].map(h=>(
                <th key={h} style={{ padding:'10px 16px', textAlign:'left', fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:500, letterSpacing:'0.12em', color:'rgba(255,255,255,0.38)', textTransform:'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {docs.slice(0,8).map(doc => {
              const done = doc.tanggal_selesai && doc.tanggal_register
              const any  = ACTIVITY_FIELDS.some(f=>doc[f])
              return (
                <tr key={doc.id} style={{ borderBottom:'1px solid var(--border)', transition:'background 0.12s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg-raised)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ padding:'10px 16px', fontFamily:"'Outfit',sans-serif", fontSize:13, fontWeight:600, color:'#FFFFFF' }}>{doc.pihak_pertama||'—'}</td>
                  <td style={{ padding:'10px 16px', fontFamily:"'Outfit',sans-serif", fontSize:12, color:'rgba(255,255,255,0.6)' }}>{companyMap[doc.company_id]||'—'}</td>
                  <td style={{ padding:'10px 16px', fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'rgba(255,255,255,0.5)' }}>{doc.jenis_akad||'—'}</td>
                  <td style={{ padding:'10px 16px', fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'rgba(255,255,255,0.5)' }}>{doc.bank||'—'}</td>
                  <td style={{ padding:'10px 16px' }}>
                    {done  ? <span className="stamp stamp-gold">Selesai</span>
                    : any  ? <span className="stamp stamp-blue">Proses</span>
                    :        <span className="stamp stamp-ghost">Belum</span>}
                  </td>
                </tr>
              )
            })}
            {docs.length===0 && (
              <tr><td colSpan={5} style={{ padding:48, textAlign:'center', fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'rgba(255,255,255,0.3)', letterSpacing:'0.06em' }}>Belum ada data</td></tr>
            )}
          </tbody>
        </table>
      </div>

    </div>
  )
}
