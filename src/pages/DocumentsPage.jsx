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
  { key:'tanggal_pengecekan',      short:'CEK' },
  { key:'tanggal_znt',             short:'ZNT' },
  { key:'tanggal_alih_media',      short:'ALIH' },
  { key:'tanggal_balik_nama',      short:'BN' },
  { key:'tanggal_peningkatan_shm', short:'SHM' },
  { key:'tanggal_ht',              short:'HT' },
  { key:'tanggal_roya',            short:'ROYA' },
]

function fmtDate(val) {
  if (!val) return null
  try { return new Date(val).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'2-digit' }) }
  catch { return val }
}

function DateCell({ val }) {
  if (!val) return <span style={{ color:'var(--text-secondary)' }}>—</span>
  return (
    <span className="inline-flex items-center gap-1 text-[10px] font-medium whitespace-nowrap" style={{ color:'var(--gold)', opacity:0.9 }}>
      <span className="w-1 h-1 rounded-full inline-block flex-shrink-0" style={{ background:'var(--gold)' }} />
      {fmtDate(val)}
    </span>
  )
}

function StatusBadge({ rec }) {
  const done = rec.tanggal_selesai && rec.tanggal_register
  const any  = DATE_COLS.some(c => rec[c.key]) || rec.tanggal_akta
  if (done) return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ background:'var(--gold-dim)', color:'var(--gold)', border:'1px solid var(--gold-border)' }}>Selesai</span>
  if (any)  return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ background:'rgba(255,255,255,0.06)', color:'var(--text-secondary)' }}>Proses</span>
  return <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap" style={{ background:'rgba(255,255,255,0.03)', color:'var(--text-secondary)' }}>Belum</span>
}

function PdfIcon({ url }) {
  if (!url) return null
  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className="ml-1 inline-flex flex-shrink-0" title="Lihat PDF">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" style={{ color:'#e05252' }}>
        <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
      </svg>
    </a>
  )
}

const TH = { color:'var(--text-muted)', fontSize:'10px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', padding:'8px 10px', whiteSpace:'nowrap' }
const TD = { padding:'7px 10px', fontSize:'11px', whiteSpace:'nowrap', borderBottom:'1px solid var(--border)', color:'var(--text-primary)' }

export default function DocumentsPage() {
  const { userProfile } = useAuth()
  const [searchParams] = useSearchParams()

  const [docs, setDocs]           = useState([])
  const [companies, setCompanies] = useState([])
  const [companyMap, setCompanyMap] = useState({})
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [filterCompany, setFilterCompany] = useState(searchParams.get('company') || '')
  const [filterStatus, setFilterStatus]   = useState('')
  const [page, setPage]           = useState(1)
  const PAGE_SIZE = 20

  const [modalOpen, setModalOpen]     = useState(false)
  const [editRecord, setEditRecord]   = useState(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewRecord, setPreviewRecord] = useState(null)
  const [deleteId, setDeleteId]       = useState(null)
  const [deleting, setDeleting]       = useState(false)
  const [importOpen, setImportOpen]   = useState(false)

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
    const matchSearch   = !q || d.pihak_pertama?.toLowerCase().includes(q) || d.pihak_kedua?.toLowerCase().includes(q) || d.bank?.toLowerCase().includes(q) || d.jenis_akad?.toLowerCase().includes(q)
    const matchCompany  = !filterCompany || d.company_id === filterCompany
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
      // Edit existing — pdf sudah punya URL, langsung update
      const updated = await updateDocument(form.id, form)
      setDocs(prev => prev.map(d => d.id === form.id ? { ...d, ...updated } : d))
    } else {
      // Record baru — simpan dulu tanpa pdf, dapat ID, lalu update pdf jika ada
      const { pdf_selesai, pdf_register, ...rest } = form
      const newDoc = await addDocument(rest, userProfile?.id)

      // Kalau ada PDF yang sudah di-upload (sudah punya URL), update sekarang
      const pdfUpdates = {}
      if (pdf_selesai?.url) pdfUpdates.pdf_selesai = pdf_selesai
      if (pdf_register?.url) pdfUpdates.pdf_register = pdf_register

      let finalDoc = newDoc
      if (Object.keys(pdfUpdates).length > 0) {
        finalDoc = await updateDocument(newDoc.id, pdfUpdates)
      }

      setDocs(prev => [{ ...newDoc, ...finalDoc }, ...prev])
    }
  }

  async function handleDelete() {
    if (!deleteId) return
    setDeleting(true)
    try { await deleteDocument(deleteId); setDocs(prev => prev.filter(d => d.id !== deleteId)) }
    finally { setDeleting(false); setDeleteId(null) }
  }

  const inputStyle = { background:'var(--bg-raised)', border:'1px solid var(--border-strong)', color:'var(--text-primary)', borderRadius:'8px', padding:'7px 12px', fontSize:'13px', outline:'none' }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div>
          <h1 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'26px', fontWeight:600, color:'var(--text-primary)', lineHeight:1 }}>
            Monitoring Dokumen
          </h1>
          <p className="text-xs mt-1" style={{ color:'var(--text-secondary)' }}>{filtered.length} record ditemukan</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
            <button onClick={() => exportToExcel(docs, companies)}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition uppercase tracking-wider"
              style={{ background:'rgba(255,255,255,0.06)', color:'var(--text-secondary)', border:'1px solid var(--border-strong)' }}
              onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.color='var(--text-primary)' }}
              onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='var(--text-secondary)' }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Export Excel
            </button>
            <button onClick={() => setImportOpen(true)}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition uppercase tracking-wider"
              style={{ background:'rgba(255,255,255,0.06)', color:'var(--text-secondary)', border:'1px solid var(--border-strong)' }}
              onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.color='var(--text-primary)' }}
              onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='var(--text-secondary)' }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Import Excel
            </button>
            <button onClick={() => { setEditRecord(null); setModalOpen(true) }}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition uppercase tracking-wider"
              style={{ background:'var(--gold-dim)', color:'var(--gold)', border:'1px solid var(--gold-border)' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(201,168,76,0.25)'}
              onMouseLeave={e=>e.currentTarget.style.background='var(--gold-dim)'}>
              + Tambah Record
            </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <input style={inputStyle} placeholder="Cari nama, bank, akad…" value={search}
          onChange={e=>{ setSearch(e.target.value); setPage(1) }} className="w-52" />
        <select style={inputStyle} value={filterCompany} onChange={e=>{ setFilterCompany(e.target.value); setPage(1) }}>
          <option value="">Semua Perusahaan</option>
          {companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select style={inputStyle} value={filterStatus} onChange={e=>{ setFilterStatus(e.target.value); setPage(1) }}>
          <option value="">Semua Status</option>
          <option value="selesai">Selesai</option>
          <option value="proses">Dalam Proses</option>
          <option value="belum">Belum Mulai</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-xl scrollbar-thin" style={{ border:'1px solid var(--border)', background:'var(--bg-surface)' }}>
        <table style={{ minWidth:'100%', borderCollapse:'collapse', fontSize:'11px' }}>
          <thead>
            <tr style={{ background:'var(--bg-raised)', borderBottom:'1px solid var(--border)' }}>
              <th rowSpan={2} style={{ ...TH, textAlign:'left', borderRight:'1px solid var(--border)' }}>#</th>
              <th rowSpan={2} style={{ ...TH, textAlign:'left', borderRight:'1px solid var(--border)' }}>PERUSAHAAN</th>
              <th rowSpan={2} style={{ ...TH, textAlign:'left', borderRight:'1px solid var(--border)' }}>DEBITUR</th>
              <th rowSpan={2} style={{ ...TH, textAlign:'left', borderRight:'1px solid var(--border)' }}>AKAD</th>
              <th rowSpan={2} style={{ ...TH, textAlign:'left', borderRight:'1px solid var(--border)' }}>BANK</th>
              <th colSpan={4} style={{ ...TH, textAlign:'center', borderRight:'1px solid var(--border)', color:'var(--gold)', opacity:0.7 }}>AKAD & PAJAK</th>
              <th colSpan={7} style={{ ...TH, textAlign:'center', borderRight:'1px solid var(--border)', color:'var(--text-secondary)' }}>KEGIATAN</th>
              <th colSpan={2} style={{ ...TH, textAlign:'center', borderRight:'1px solid var(--border)', color:'var(--gold)', opacity:0.7 }}>SELESAI & REGISTER</th>
              <th rowSpan={2} style={{ ...TH, textAlign:'center', borderRight:'1px solid var(--border)' }}>STATUS</th>
              <th rowSpan={2} style={{ ...TH, textAlign:'center' }}>AKSI</th>
            </tr>
            <tr style={{ background:'var(--bg-raised)', borderBottom:'2px solid var(--border-strong)' }}>
              {['PINJAM','DITERIMA','PAJAK','AKTA'].map(h=>(
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
              <tr><td colSpan={20} style={{ padding:'60px', textAlign:'center', color:'var(--text-muted)' }}>Memuat data…</td></tr>
            ) : paginated.length === 0 ? (
              <tr><td colSpan={20} style={{ padding:'60px', textAlign:'center', color:'var(--text-muted)' }}>Tidak ada data</td></tr>
            ) : paginated.map((doc, idx) => (
              <tr key={doc.id} style={{ borderBottom:'1px solid var(--border)', transition:'background 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--bg-raised)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <td style={{ ...TD, color:'var(--text-muted)', borderRight:'1px solid var(--border)' }}>{(page-1)*PAGE_SIZE+idx+1}</td>
                <td style={{ ...TD, fontWeight:500, maxWidth:130, overflow:'hidden', textOverflow:'ellipsis', borderRight:'1px solid var(--border)' }} title={companyMap[doc.company_id]}>{companyMap[doc.company_id]||doc.company_id}</td>
                <td style={{ ...TD, fontWeight:500, maxWidth:150, overflow:'hidden', textOverflow:'ellipsis', borderRight:'1px solid var(--border)' }} title={doc.pihak_pertama}>{doc.pihak_pertama}</td>
                <td style={{ ...TD, borderRight:'1px solid var(--border)' }}>{doc.jenis_akad}</td>
                <td style={{ ...TD, borderRight:'1px solid var(--border)' }}>{doc.bank}</td>
                <td style={{ ...TD, borderRight:'1px solid var(--border)' }}><DateCell val={doc.tanggal_pinjam} /></td>
                <td style={{ ...TD, borderRight:'1px solid var(--border)' }}><DateCell val={doc.tanggal_diterima} /></td>
                <td style={{ ...TD, borderRight:'1px solid var(--border)' }}><DateCell val={doc.tanggal_bayar_pajak} /></td>
                <td style={{ ...TD, borderRight:'1px solid var(--border)' }}><DateCell val={doc.tanggal_akta} /></td>
                {DATE_COLS.map(c=>(
                  <td key={c.key} style={{ ...TD, borderRight:'1px solid var(--border)' }}><DateCell val={doc[c.key]} /></td>
                ))}
                <td style={{ ...TD, borderRight:'1px solid var(--border)' }}>
                  <span className="inline-flex items-center gap-0.5"><DateCell val={doc.tanggal_selesai} /><PdfIcon url={doc.pdf_selesai?.url} /></span>
                </td>
                <td style={{ ...TD, borderRight:'1px solid var(--border)' }}>
                  <span className="inline-flex items-center gap-0.5"><DateCell val={doc.tanggal_register} /><PdfIcon url={doc.pdf_register?.url} /></span>
                </td>
                <td style={{ ...TD, textAlign:'center', borderRight:'1px solid var(--border)' }}><StatusBadge rec={doc} /></td>
                <td style={{ ...TD, textAlign:'center' }}>
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={()=>{ setPreviewRecord(doc); setPreviewOpen(true) }} className="p-1.5 rounded transition"
                      style={{ color:'var(--text-secondary)' }} title="Preview"
                      onMouseEnter={e=>{ e.currentTarget.style.color='var(--gold)'; e.currentTarget.style.background='var(--gold-dim)' }}
                      onMouseLeave={e=>{ e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.background='transparent' }}>
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button onClick={()=>{ setEditRecord(doc); setModalOpen(true) }} className="p-1.5 rounded transition"
                        style={{ color:'var(--text-secondary)' }} title="Edit"
                        onMouseEnter={e=>{ e.currentTarget.style.color='var(--text-primary)'; e.currentTarget.style.background='var(--bg-hover)' }}
                        onMouseLeave={e=>{ e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.background='transparent' }}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                    <button onClick={()=>setDeleteId(doc.id)} className="p-1.5 rounded transition"
                        style={{ color:'var(--text-secondary)' }} title="Hapus"
                        onMouseEnter={e=>{ e.currentTarget.style.color='#e05252'; e.currentTarget.style.background='rgba(224,82,82,0.1)' }}
                        onMouseLeave={e=>{ e.currentTarget.style.color='var(--text-muted)'; e.currentTarget.style.background='transparent' }}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs" style={{ color:'var(--text-secondary)' }}>Halaman {page} dari {totalPages} · {filtered.length} record</p>
          <div className="flex gap-1">
            {['‹',...Array.from({length:Math.min(totalPages,7)},(_,i)=>i+1),'›'].map((label,i)=>{
              const isActive=label===page
              const isDisabled=(label==='‹'&&page===1)||(label==='›'&&page===totalPages)
              const onClick=label==='‹'?()=>setPage(p=>p-1):label==='›'?()=>setPage(p=>p+1):()=>setPage(label)
              return (
                <button key={i} onClick={onClick} disabled={isDisabled}
                  className="w-7 h-7 rounded text-xs font-medium flex items-center justify-center"
                  style={{ background:isActive?'var(--gold-dim)':'transparent', color:isActive?'var(--gold)':'var(--text-muted)', border:isActive?'1px solid var(--gold-border)':'1px solid transparent', opacity:isDisabled?0.3:1, cursor:isDisabled?'not-allowed':'pointer' }}>
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <DocumentModal isOpen={modalOpen} onClose={()=>setModalOpen(false)}
        onSave={handleSave} record={editRecord} companies={companies} defaultCompanyId={filterCompany||''} />

      <PreviewModal isOpen={previewOpen} onClose={()=>setPreviewOpen(false)}
        record={previewRecord} companyName={previewRecord?companyMap[previewRecord.company_id]:''} />

      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:'rgba(0,0,0,0.75)' }}>
          <div className="w-full max-w-sm rounded-xl p-6" style={{ background:'var(--bg-surface)', border:'1px solid var(--border-strong)' }}>
            <h3 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'20px', color:'var(--text-primary)', marginBottom:8 }}>Hapus Record?</h3>
            <p className="text-sm mb-6" style={{ color:'var(--text-secondary)' }}>Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex justify-end gap-3">
              <button onClick={()=>setDeleteId(null)} className="px-4 py-2 rounded-lg text-sm"
                style={{ border:'1px solid var(--border-strong)', color:'var(--text-secondary)', background:'var(--bg-raised)' }}>Batal</button>
              <button onClick={handleDelete} disabled={deleting} className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ background:'rgba(224,82,82,0.15)', color:'#e05252', border:'1px solid rgba(224,82,82,0.3)' }}>
                {deleting?'Menghapus…':'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ImportModal
        isOpen={importOpen}
        onClose={()=>setImportOpen(false)}
        companies={companies}
        currentUser={userProfile}
        onSuccess={()=>{
          setImportOpen(false)
          if (!userProfile) return
          const isStaff=userProfile.role==='staff'
          const assigned=userProfile.assigned_companies||[]
          const p=isStaff?getDocumentsByCompanies(assigned):getDocuments()
          p.then(data=>setDocs(data))
        }}
      />
    </div>
  )
}
