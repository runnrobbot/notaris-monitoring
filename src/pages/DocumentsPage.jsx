import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  getDocuments, getDocumentsByCompanies,
  addDocument, updateDocument, deleteDocument, getCompanies,
} from '../services/supabaseService'
import DocumentModal from '../components/DocumentModal'
import PreviewModal  from '../components/PreviewModal'
import { ImportModal } from '../components/ImportModal'
import { exportToExcel } from '../utils/excelUtils'

const DATE_COLS = [
  { key:'tanggal_pengecekan',      short:'CEK',  label:'Pengecekan' },
  { key:'tanggal_znt',             short:'ZNT',  label:'ZNT' },
  { key:'tanggal_alih_media',      short:'ALIH', label:'Alih Media' },
  { key:'tanggal_balik_nama',      short:'BN',   label:'Balik Nama' },
  { key:'tanggal_peningkatan_shm', short:'SHM',  label:'SHM' },
  { key:'tanggal_ht',              short:'HT',   label:'HT' },
  { key:'tanggal_roya',            short:'ROYA', label:'Roya' },
]

function fmtDate(val) {
  if (!val) return null
  try { return new Date(val).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'2-digit' }) }
  catch { return val }
}

function DateCell({ val }) {
  if (!val) return <span style={{ color:'rgba(255,255,255,0.25)', fontFamily:"'JetBrains Mono',monospace", fontSize:10 }}>—</span>
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:4, fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'rgba(255,255,255,0.75)', whiteSpace:'nowrap' }}>
      <span style={{ width:4, height:4, borderRadius:'50%', background:'rgba(255,255,255,0.4)', flexShrink:0, display:'inline-block' }} />
      {fmtDate(val)}
    </span>
  )
}

function StatusBadge({ rec }) {
  const done = rec.tanggal_selesai && rec.tanggal_register
  const any  = DATE_COLS.some(c => rec[c.key]) || rec.tanggal_akta
  if (done) return <span className="stamp stamp-gold">Selesai</span>
  if (any)  return <span className="stamp stamp-blue">Proses</span>
  return <span className="stamp stamp-ghost">Belum</span>
}

function PdfIcon({ url }) {
  if (!url) return null
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" style={{ marginLeft:3, display:'inline-flex', flexShrink:0 }} title="Lihat PDF">
      <svg width="11" height="11" fill="currentColor" viewBox="0 0 20 20" style={{ color:'#e05252', opacity:0.85 }}>
        <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
      </svg>
    </a>
  )
}

const TH = {
  fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:500,
  textTransform:'uppercase', letterSpacing:'0.10em', color:'rgba(255,255,255,0.38)',
  padding:'8px 10px', whiteSpace:'nowrap', background:'var(--bg-raised)',
}
const TD = {
  padding:'7px 10px', fontSize:11, whiteSpace:'nowrap',
  borderBottom:'1px solid var(--border)', color:'var(--text-primary)',
  fontFamily:"'JetBrains Mono',monospace",
}
const btnBase = {
  fontSize:10, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.08em',
  textTransform:'uppercase', border:'1px solid var(--border-mid)', borderRadius:8,
  padding:'7px 14px', cursor:'pointer', display:'inline-flex', alignItems:'center',
  gap:6, transition:'all 0.15s',
}

/* ── Mobile card component ── */
function MobileCard({ doc, companyMap, idx, onPreview, onEdit, onDelete }) {
  const done = doc.tanggal_selesai && doc.tanggal_register
  const any  = DATE_COLS.some(c => doc[c.key]) || doc.tanggal_akta

  // Collect filled date fields for summary
  const activeDates = [
    { label:'Pinjam',    val:doc.tanggal_pinjam,      pdf:doc.pdf_pinjam?.url },
    { label:'Diterima',  val:doc.tanggal_diterima,    pdf:doc.pdf_diterima?.url },
    { label:'Pajak',     val:doc.tanggal_bayar_pajak, pdf:doc.pdf_bayar_pajak?.url },
    { label:'Akta',      val:doc.tanggal_akta },
    { label:'Akad',      val:doc.tanggal_akad },
    ...DATE_COLS.map(c => ({ label:c.label, val:doc[c.key] })),
    { label:'Selesai',   val:doc.tanggal_selesai,     pdf:doc.pdf_selesai?.url },
    { label:'Register',  val:doc.tanggal_register,    pdf:doc.pdf_register?.url },
  ].filter(d => d.val)

  return (
    <div style={{ background:'var(--bg-surface)', border:'1px solid var(--border-mid)', borderRadius:10, padding:14, marginBottom:10 }}>
      {/* Top row: number + status + actions */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:10 }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:'rgba(255,255,255,0.3)', background:'var(--bg-raised)', padding:'2px 6px', borderRadius:4 }}>#{idx + 1}</span>
          <StatusBadge rec={doc} />
        </div>
        <div style={{ display:'flex', gap:4 }}>
          <button onClick={onPreview} style={{ padding:6, borderRadius:6, background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)', cursor:'pointer', color:'rgba(255,255,255,0.4)', display:'flex', alignItems:'center' }}
            onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,0.8)'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.4)'}>
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
          </button>
          <button onClick={onEdit} style={{ padding:6, borderRadius:6, background:'rgba(255,255,255,0.05)', border:'1px solid var(--border)', cursor:'pointer', color:'rgba(255,255,255,0.4)', display:'flex', alignItems:'center' }}
            onMouseEnter={e=>e.currentTarget.style.color='rgba(255,255,255,0.8)'} onMouseLeave={e=>e.currentTarget.style.color='rgba(255,255,255,0.4)'}>
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
          </button>
          <button onClick={onDelete} style={{ padding:6, borderRadius:6, background:'rgba(224,82,82,0.08)', border:'1px solid rgba(224,82,82,0.2)', cursor:'pointer', color:'rgba(224,82,82,0.6)', display:'flex', alignItems:'center' }}
            onMouseEnter={e=>e.currentTarget.style.color='#e05252'} onMouseLeave={e=>e.currentTarget.style.color='rgba(224,82,82,0.6)'}>
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          </button>
        </div>
      </div>

      {/* Main info */}
      <p style={{ fontFamily:"'Outfit',sans-serif", fontSize:15, fontWeight:600, color:'#fff', marginBottom:3 }}>{doc.pihak_pertama || '—'}</p>
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:10 }}>
        {companyMap[doc.company_id] && <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'rgba(255,255,255,0.45)', background:'var(--bg-raised)', padding:'2px 7px', borderRadius:4, border:'1px solid var(--border)' }}>{companyMap[doc.company_id]}</span>}
        {doc.jenis_akad && <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'rgba(255,255,255,0.45)', background:'var(--bg-raised)', padding:'2px 7px', borderRadius:4, border:'1px solid var(--border)' }}>{doc.jenis_akad}</span>}
        {doc.bank && <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'rgba(255,255,255,0.45)', background:'var(--bg-raised)', padding:'2px 7px', borderRadius:4, border:'1px solid var(--border)' }}>{doc.bank}</span>}
      </div>

      {/* Date grid — only show filled ones */}
      {activeDates.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'4px 12px', borderTop:'1px solid var(--border)', paddingTop:10 }}>
          {activeDates.map(({ label, val, pdf }) => (
            <div key={label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, color:'rgba(255,255,255,0.3)', textTransform:'uppercase', letterSpacing:'0.08em' }}>{label}</span>
              <span style={{ display:'inline-flex', alignItems:'center', gap:2, fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'rgba(255,255,255,0.7)' }}>
                {fmtDate(val)}
                {pdf && <PdfIcon url={pdf} />}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function DocumentsPage() {
  const { userProfile } = useAuth()
  const [searchParams] = useSearchParams()

  const [docs, setDocs]             = useState([])
  const [companies, setCompanies]   = useState([])
  const [companyMap, setCompanyMap] = useState({})
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [filterCompany, setFilterCompany] = useState(searchParams.get('company') || '')
  const [filterStatus, setFilterStatus]   = useState('')
  const [page, setPage]             = useState(1)
  const PAGE_SIZE = 20

  const [modalOpen, setModalOpen]       = useState(false)
  const [editRecord, setEditRecord]     = useState(null)
  const [previewOpen, setPreviewOpen]   = useState(false)
  const [previewRecord, setPreviewRecord] = useState(null)
  const [deleteId, setDeleteId]         = useState(null)
  const [deleting, setDeleting]         = useState(false)
  const [importOpen, setImportOpen]     = useState(false)

  useEffect(() => {
    getCompanies().then(list => {
      setCompanies(list)
      const m = {}; list.forEach(c => { m[c.id] = c.name }); setCompanyMap(m)
    })
  }, [])

  useEffect(() => {
    if (!userProfile) return
    setLoading(true)
    const isStaff  = userProfile.role === 'staff'
    const assigned = userProfile.assigned_companies || []
    const promise  = isStaff ? getDocumentsByCompanies(assigned) : getDocuments()
    promise.then(data => { setDocs(data); setLoading(false) })
  }, [userProfile])

  const filtered = docs.filter(d => {
    const q = search.toLowerCase()
    const matchSearch  = !q || d.pihak_pertama?.toLowerCase().includes(q) || d.pihak_kedua?.toLowerCase().includes(q) || d.bank?.toLowerCase().includes(q) || d.jenis_akad?.toLowerCase().includes(q)
    const matchCompany = !filterCompany || d.company_id === filterCompany
    const done   = d.tanggal_selesai && d.tanggal_register
    const any    = DATE_COLS.some(c => d[c.key]) || d.tanggal_akta
    const status = done ? 'selesai' : any ? 'proses' : 'belum'
    const matchStatus = !filterStatus || status === filterStatus
    return matchSearch && matchCompany && matchStatus
  })

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE)

  async function handleSave(form) {
    if (form.id) {
      const updated = await updateDocument(form.id, form)
      setDocs(prev => prev.map(d => d.id === form.id ? { ...d, ...updated } : d))
    } else {
      const { pdf_selesai, pdf_register, pdf_pinjam, pdf_bayar_pajak, pdf_diterima, ...rest } = form
      const newDoc = await addDocument(rest, userProfile?.id)
      const pdfUpdates = {}
      if (pdf_selesai?.url)     pdfUpdates.pdf_selesai     = pdf_selesai
      if (pdf_register?.url)    pdfUpdates.pdf_register    = pdf_register
      if (pdf_pinjam?.url)      pdfUpdates.pdf_pinjam      = pdf_pinjam
      if (pdf_bayar_pajak?.url) pdfUpdates.pdf_bayar_pajak = pdf_bayar_pajak
      if (pdf_diterima?.url)    pdfUpdates.pdf_diterima    = pdf_diterima
      let finalDoc = newDoc
      if (Object.keys(pdfUpdates).length > 0) finalDoc = await updateDocument(newDoc.id, pdfUpdates)
      setDocs(prev => [{ ...newDoc, ...finalDoc }, ...prev])
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try { await deleteDocument(deleteId); setDocs(prev => prev.filter(d => d.id !== deleteId)) }
    finally { setDeleting(false); setDeleteId(null) }
  }

  const inputStyle = {
    background:'var(--bg-raised)', border:'1px solid var(--border-mid)',
    color:'var(--text-primary)', borderRadius:8, padding:'7px 12px',
    fontSize:12, outline:'none', fontFamily:"'Outfit',sans-serif",
  }

  return (
    <div className="fade-up">
      {/* ── Header ── */}
      <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-end', justifyContent:'space-between', gap:12, marginBottom:20 }}>
        <div>
          <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, letterSpacing:'0.14em', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', marginBottom:4 }}>Dokumen</p>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:22, fontWeight:600, color:'#fff', lineHeight:1 }}>Monitoring Dokumen</h1>
          <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:5 }}>{filtered.length} record ditemukan</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <button onClick={() => exportToExcel(docs, companies)}
            style={{ ...btnBase, color:'rgba(255,255,255,0.6)', background:'var(--bg-surface)' }}
            onMouseEnter={e=>{ e.currentTarget.style.background='var(--bg-raised)'; e.currentTarget.style.color='#fff' }}
            onMouseLeave={e=>{ e.currentTarget.style.background='var(--bg-surface)'; e.currentTarget.style.color='rgba(255,255,255,0.6)' }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
            Export
          </button>
          <button onClick={() => setImportOpen(true)}
            style={{ ...btnBase, color:'rgba(255,255,255,0.6)', background:'var(--bg-surface)' }}
            onMouseEnter={e=>{ e.currentTarget.style.background='var(--bg-raised)'; e.currentTarget.style.color='#fff' }}
            onMouseLeave={e=>{ e.currentTarget.style.background='var(--bg-surface)'; e.currentTarget.style.color='rgba(255,255,255,0.6)' }}>
            <svg width="13" height="13" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
            Import
          </button>
          <button onClick={() => { setEditRecord(null); setModalOpen(true) }}
            style={{ ...btnBase, color:'var(--navy-900)', background:'var(--gold-500)', border:'none', fontWeight:600 }}
            onMouseEnter={e=>e.currentTarget.style.background='var(--gold-400)'}
            onMouseLeave={e=>e.currentTarget.style.background='var(--gold-500)'}>
            + Tambah Record
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:16 }}>
        <input style={{ ...inputStyle, minWidth:180, flex:'1 1 180px' }} placeholder="Cari nama, bank, akad…" value={search}
          onChange={e=>{ setSearch(e.target.value); setPage(1) }} />
        <select style={{ ...inputStyle, flex:'1 1 140px' }} value={filterCompany} onChange={e=>{ setFilterCompany(e.target.value); setPage(1) }}>
          <option value="">Semua Perusahaan</option>
          {companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select style={{ ...inputStyle, flex:'1 1 130px' }} value={filterStatus} onChange={e=>{ setFilterStatus(e.target.value); setPage(1) }}>
          <option value="">Semua Status</option>
          <option value="selesai">Selesai</option>
          <option value="proses">Dalam Proses</option>
          <option value="belum">Belum Mulai</option>
        </select>
      </div>

      {/* ── MOBILE: Card list (< 768px) ── */}
      <div className="block md:hidden">
        {loading ? (
          <p style={{ textAlign:'center', padding:40, fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'rgba(255,255,255,0.3)' }}>Memuat data…</p>
        ) : paginated.length === 0 ? (
          <p style={{ textAlign:'center', padding:40, fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'rgba(255,255,255,0.3)' }}>Tidak ada data</p>
        ) : paginated.map((doc, idx) => (
          <MobileCard key={doc.id} doc={doc} companyMap={companyMap} idx={(page-1)*PAGE_SIZE+idx}
            onPreview={() => { setPreviewRecord(doc); setPreviewOpen(true) }}
            onEdit   ={() => { setEditRecord(doc); setModalOpen(true) }}
            onDelete ={() => setDeleteId(doc.id)}
          />
        ))}
      </div>

      {/* ── DESKTOP: Scrollable table (≥ 768px) ── */}
      <div className="hidden md:block">
        <div className="scrollbar-thin" style={{ overflowX:'auto', borderRadius:12, border:'1px solid var(--border-mid)', background:'var(--bg-surface)' }}>
          <table style={{ minWidth:'100%', borderCollapse:'collapse', fontSize:11 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid var(--border-mid)' }}>
                <th rowSpan={2} style={{ ...TH, textAlign:'left', borderRight:'1px solid var(--border)' }}>#</th>
                <th rowSpan={2} style={{ ...TH, textAlign:'left', borderRight:'1px solid var(--border)', minWidth:110 }}>Pihak Pertama</th>
                <th rowSpan={2} style={{ ...TH, textAlign:'left', borderRight:'1px solid var(--border)', minWidth:130 }}>Pihak Kedua</th>
                <th rowSpan={2} style={{ ...TH, textAlign:'left', borderRight:'1px solid var(--border)' }}>Akad</th>
                <th rowSpan={2} style={{ ...TH, textAlign:'left', borderRight:'1px solid var(--border)' }}>Bank</th>
                <th colSpan={5} style={{ ...TH, textAlign:'center', borderRight:'1px solid var(--border)', color:'rgba(255,255,255,0.55)' }}>Akad &amp; Pajak</th>
                <th colSpan={7} style={{ ...TH, textAlign:'center', borderRight:'1px solid var(--border)', color:'rgba(255,255,255,0.55)' }}>Kegiatan</th>
                <th colSpan={2} style={{ ...TH, textAlign:'center', borderRight:'1px solid var(--border)', color:'rgba(255,255,255,0.55)' }}>Selesai &amp; Register</th>
                <th rowSpan={2} style={{ ...TH, textAlign:'center', borderRight:'1px solid var(--border)' }}>Status</th>
                <th rowSpan={2} style={{ ...TH, textAlign:'center' }}>Aksi</th>
              </tr>
              <tr style={{ borderBottom:'2px solid var(--border-strong)' }}>
                {['PINJAM','DITERIMA','PAJAK','AKTA','AKAD'].map(h=>(
                  <th key={h} style={{ ...TH, borderRight:'1px solid var(--border)' }}>{h}</th>
                ))}
                {DATE_COLS.map(c=>(
                  <th key={c.key} style={{ ...TH, borderRight:'1px solid var(--border)' }}>{c.short}</th>
                ))}
                <th style={{ ...TH, borderRight:'1px solid var(--border)' }}>SELESAI</th>
                <th style={{ ...TH, borderRight:'1px solid var(--border)' }}>REGISTER</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={22} style={{ padding:'60px', textAlign:'center', fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'rgba(255,255,255,0.3)' }}>Memuat data…</td></tr>
              ) : paginated.length === 0 ? (
                <tr><td colSpan={22} style={{ padding:'60px', textAlign:'center', fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'rgba(255,255,255,0.3)' }}>Tidak ada data</td></tr>
              ) : paginated.map((doc, idx) => (
                <tr key={doc.id} style={{ borderBottom:'1px solid var(--border)', transition:'background 0.12s' }}
                  onMouseEnter={e=>e.currentTarget.style.background='var(--bg-raised)'}
                  onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                  <td style={{ ...TD, color:'rgba(255,255,255,0.3)', borderRight:'1px solid var(--border)' }}>{(page-1)*PAGE_SIZE+idx+1}</td>
                  <td style={{ ...TD, maxWidth:110, overflow:'hidden', textOverflow:'ellipsis', borderRight:'1px solid var(--border)', color:'rgba(255,255,255,0.6)' }} title={companyMap[doc.company_id]}>{companyMap[doc.company_id]||'—'}</td>
                  <td style={{ ...TD, fontFamily:"'Outfit',sans-serif", fontWeight:600, maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', borderRight:'1px solid var(--border)', fontSize:12 }} title={doc.pihak_pertama}>{doc.pihak_pertama||'—'}</td>
                  <td style={{ ...TD, borderRight:'1px solid var(--border)', color:'rgba(255,255,255,0.6)' }}>{doc.jenis_akad||'—'}</td>
                  <td style={{ ...TD, borderRight:'1px solid var(--border)', color:'rgba(255,255,255,0.6)' }}>{doc.bank||'—'}</td>
                  <td style={{ ...TD, borderRight:'1px solid var(--border)' }}>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:2 }}><DateCell val={doc.tanggal_pinjam}/><PdfIcon url={doc.pdf_pinjam?.url}/></span>
                  </td>
                  <td style={{ ...TD, borderRight:'1px solid var(--border)' }}>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:2 }}><DateCell val={doc.tanggal_diterima}/><PdfIcon url={doc.pdf_diterima?.url}/></span>
                  </td>
                  <td style={{ ...TD, borderRight:'1px solid var(--border)' }}>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:2 }}><DateCell val={doc.tanggal_bayar_pajak}/><PdfIcon url={doc.pdf_bayar_pajak?.url}/></span>
                  </td>
                  <td style={{ ...TD, borderRight:'1px solid var(--border)' }}><DateCell val={doc.tanggal_akta}/></td>
                  <td style={{ ...TD, borderRight:'1px solid var(--border)' }}><DateCell val={doc.tanggal_akad}/></td>
                  {DATE_COLS.map(c=>(
                    <td key={c.key} style={{ ...TD, borderRight:'1px solid var(--border)' }}><DateCell val={doc[c.key]}/></td>
                  ))}
                  <td style={{ ...TD, borderRight:'1px solid var(--border)' }}>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:2 }}><DateCell val={doc.tanggal_selesai}/><PdfIcon url={doc.pdf_selesai?.url}/></span>
                  </td>
                  <td style={{ ...TD, borderRight:'1px solid var(--border)' }}>
                    <span style={{ display:'inline-flex', alignItems:'center', gap:2 }}><DateCell val={doc.tanggal_register}/><PdfIcon url={doc.pdf_register?.url}/></span>
                  </td>
                  <td style={{ ...TD, textAlign:'center', borderRight:'1px solid var(--border)' }}><StatusBadge rec={doc}/></td>
                  <td style={{ ...TD, textAlign:'center' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:2 }}>
                      <button onClick={()=>{ setPreviewRecord(doc); setPreviewOpen(true) }}
                        style={{ padding:5, borderRadius:5, background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.35)', transition:'all 0.12s' }}
                        onMouseEnter={e=>{ e.currentTarget.style.color='rgba(255,255,255,0.8)'; e.currentTarget.style.background='var(--bg-hover)' }}
                        onMouseLeave={e=>{ e.currentTarget.style.color='rgba(255,255,255,0.35)'; e.currentTarget.style.background='none' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                      </button>
                      <button onClick={()=>{ setEditRecord(doc); setModalOpen(true) }}
                        style={{ padding:5, borderRadius:5, background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.35)', transition:'all 0.12s' }}
                        onMouseEnter={e=>{ e.currentTarget.style.color='rgba(255,255,255,0.8)'; e.currentTarget.style.background='var(--bg-hover)' }}
                        onMouseLeave={e=>{ e.currentTarget.style.color='rgba(255,255,255,0.35)'; e.currentTarget.style.background='none' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                      </button>
                      <button onClick={()=>setDeleteId(doc.id)}
                        style={{ padding:5, borderRadius:5, background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.35)', transition:'all 0.12s' }}
                        onMouseEnter={e=>{ e.currentTarget.style.color='#e05252'; e.currentTarget.style.background='rgba(224,82,82,0.1)' }}
                        onMouseLeave={e=>{ e.currentTarget.style.color='rgba(255,255,255,0.35)'; e.currentTarget.style.background='none' }}>
                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:14, flexWrap:'wrap', gap:8 }}>
          <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'rgba(255,255,255,0.4)' }}>
            Halaman {page} dari {totalPages} · {filtered.length} record
          </p>
          <div style={{ display:'flex', gap:4 }}>
            {['‹', ...Array.from({length:Math.min(totalPages,7)},(_,i)=>i+1), '›'].map((label,i) => {
              const isActive   = label === page
              const isDisabled = (label==='‹'&&page===1) || (label==='›'&&page===totalPages)
              const onClick    = label==='‹' ? ()=>setPage(p=>p-1) : label==='›' ? ()=>setPage(p=>p+1) : ()=>setPage(label)
              return (
                <button key={i} onClick={onClick} disabled={isDisabled} style={{
                  width:28, height:28, borderRadius:5, fontFamily:"'JetBrains Mono',monospace", fontSize:11,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  background: isActive ? 'rgba(201,153,26,0.15)' : 'transparent',
                  color: isActive ? 'var(--gold-400)' : 'rgba(255,255,255,0.4)',
                  border: isActive ? '1px solid var(--gold-border)' : '1px solid transparent',
                  opacity: isDisabled ? 0.25 : 1, cursor: isDisabled ? 'not-allowed' : 'pointer',
                }}>
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Modals ── */}
      <DocumentModal isOpen={modalOpen} onClose={()=>setModalOpen(false)}
        onSave={handleSave} record={editRecord} companies={companies} defaultCompanyId={filterCompany||''} />

      <PreviewModal isOpen={previewOpen} onClose={()=>setPreviewOpen(false)}
        record={previewRecord} companyName={previewRecord?companyMap[previewRecord.company_id]:''} />

      {deleteId && (
        <div style={{ position:'fixed', inset:0, zIndex:9998, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(5,10,18,0.82)' }}>
          <div style={{ width:'100%', maxWidth:380, borderRadius:12, padding:24, background:'var(--bg-surface)', border:'1px solid var(--border-mid)', boxShadow:'var(--shadow-lg)' }}>
            <h3 style={{ fontFamily:"'Outfit',sans-serif", fontSize:18, fontWeight:600, color:'#fff', marginBottom:8 }}>Hapus Record?</h3>
            <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:'rgba(255,255,255,0.45)', marginBottom:24, lineHeight:1.6 }}>Tindakan ini tidak dapat dibatalkan.</p>
            <div style={{ display:'flex', justifyContent:'flex-end', gap:10 }}>
              <button onClick={()=>setDeleteId(null)} style={{ ...btnBase, color:'rgba(255,255,255,0.6)', background:'var(--bg-raised)' }}>Batal</button>
              <button onClick={handleDelete} disabled={deleting}
                style={{ ...btnBase, background:'rgba(224,82,82,0.12)', color:'#e05252', border:'1px solid rgba(224,82,82,0.25)' }}>
                {deleting ? 'Menghapus…' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ImportModal isOpen={importOpen} onClose={()=>setImportOpen(false)}
        companies={companies} currentUser={userProfile}
        onSuccess={()=>{
          setImportOpen(false)
          if (!userProfile) return
          const isStaff = userProfile.role==='staff'
          const assigned = userProfile.assigned_companies||[]
          const p = isStaff ? getDocumentsByCompanies(assigned) : getDocuments()
          p.then(data=>setDocs(data))
        }}
      />
    </div>
  )
}
