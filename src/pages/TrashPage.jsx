import { useState, useEffect } from 'react'
import { getTrashedDocuments, restoreDocument, permanentDeleteDocument, emptyTrash, getCompanies } from '../services/supabaseService'
import { supabase } from '../supabase'
import { createPortal } from 'react-dom'
import toast from 'react-hot-toast'
import { Trash2, RotateCcw, AlertTriangle, RefreshCw } from 'lucide-react'

function fmtDate(val) {
  if (!val) return '—'
  try { return new Date(val).toLocaleDateString('id-ID', { day:'2-digit', month:'short', year:'numeric' }) }
  catch { return val }
}

function fmtDateTime(val) {
  if (!val) return '—'
  try {
    return new Date(val).toLocaleString('id-ID', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' })
  } catch { return val }
}

const TH = {
  fontFamily:"'JetBrains Mono',monospace", fontSize:9, fontWeight:500,
  textTransform:'uppercase', letterSpacing:'0.10em', color:'rgba(255,255,255,0.38)',
  padding:'9px 12px', whiteSpace:'nowrap', background:'var(--bg-raised)',
  borderBottom:'1px solid var(--border-mid)',
}
const TD = {
  padding:'9px 12px', fontSize:12, whiteSpace:'nowrap',
  borderBottom:'1px solid var(--border)', color:'rgba(255,255,255,0.75)',
  fontFamily:"'Outfit',sans-serif",
}
const btnBase = {
  display:'inline-flex', alignItems:'center', gap:6,
  fontFamily:"'JetBrains Mono',monospace", fontSize:10,
  letterSpacing:'0.08em', textTransform:'uppercase',
  border:'1px solid var(--border-mid)', borderRadius:7,
  padding:'7px 14px', cursor:'pointer', transition:'all 0.15s',
}

export default function TrashPage() {
  const [docs, setDocs]           = useState([])
  const [companies, setCompanies] = useState([])
  const [companyMap, setCompanyMap] = useState({})
  const [loading, setLoading]     = useState(true)
  const [selected, setSelected]   = useState(new Set())
  const [confirmEmpty, setConfirmEmpty]   = useState(false)
  const [confirmPerm, setConfirmPerm]     = useState(null) // id atau 'selected'
  const [processing, setProcessing]       = useState(false)

  async function fetchData() {
    setLoading(true)
    try {
      const [trash, comps] = await Promise.all([getTrashedDocuments(), getCompanies()])
      setDocs(trash)
      setCompanies(comps)
      const m = {}; comps.forEach(c => { m[c.id] = c.name }); setCompanyMap(m)
    } catch { toast.error('Gagal memuat data sampah') }
    finally { setLoading(false) }
  }

  useEffect(() => {
    fetchData()

    // Realtime — update otomatis tanpa refresh
    const channel = supabase
      .channel('trash-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'documents' }, () => { fetchData() })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  function toggleSelect(id) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    setSelected(prev => prev.size === docs.length ? new Set() : new Set(docs.map(d => d.id)))
  }

  async function handleRestore(ids) {
    setProcessing(true)
    try {
      await Promise.all(ids.map(id => restoreDocument(id)))
      toast.success(`${ids.length} dokumen berhasil dipulihkan`)
      setDocs(prev => prev.filter(d => !ids.includes(d.id)))
      setSelected(prev => { const n = new Set(prev); ids.forEach(id => n.delete(id)); return n })
    } catch { toast.error('Gagal memulihkan dokumen') }
    finally { setProcessing(false) }
  }

  async function handlePermanentDelete(ids) {
    setProcessing(true)
    try {
      await Promise.all(ids.map(id => permanentDeleteDocument(id)))
      toast.success(`${ids.length} dokumen dihapus permanen`)
      setDocs(prev => prev.filter(d => !ids.includes(d.id)))
      setSelected(prev => { const n = new Set(prev); ids.forEach(id => n.delete(id)); return n })
    } catch { toast.error('Gagal menghapus permanen') }
    finally { setProcessing(false); setConfirmPerm(null) }
  }

  async function handleEmptyTrash() {
    setProcessing(true)
    try {
      await emptyTrash()
      toast.success('Sampah berhasil dikosongkan')
      setDocs([]); setSelected(new Set())
    } catch { toast.error('Gagal mengosongkan sampah') }
    finally { setProcessing(false); setConfirmEmpty(false) }
  }

  const selArr = [...selected]

  return (
    <div className="fade-up">

      {/* ── Header ── */}
      <div style={{ display:'flex', flexWrap:'wrap', alignItems:'flex-end', justifyContent:'space-between', gap:12, marginBottom:20 }}>
        <div>
          <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:9, letterSpacing:'0.14em', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', marginBottom:4 }}>
            Recycle Bin
          </p>
          <h1 style={{ fontFamily:"'Outfit',sans-serif", fontSize:22, fontWeight:600, color:'#fff', lineHeight:1 }}>
            Sampah
          </h1>
          <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:5 }}>
            {docs.length} dokumen di sampah · Dokumen dapat dipulihkan kapan saja
          </p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <button onClick={fetchData} style={{ ...btnBase, color:'rgba(255,255,255,0.5)', background:'transparent' }}
            onMouseEnter={e=>e.currentTarget.style.background='var(--bg-raised)'}
            onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <RefreshCw size={13}/> Refresh
          </button>
          {selArr.length > 0 && (
            <>
              <button onClick={() => handleRestore(selArr)} disabled={processing}
                style={{ ...btnBase, color:'rgba(255,255,255,0.75)', background:'var(--bg-raised)', border:'1px solid var(--border-mid)' }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--bg-hover)'}
                onMouseLeave={e=>e.currentTarget.style.background='var(--bg-raised)'}>
                <RotateCcw size={13}/> Pulihkan ({selArr.length})
              </button>
              <button onClick={() => setConfirmPerm('selected')} disabled={processing}
                style={{ ...btnBase, color:'#e05252', background:'rgba(224,82,82,0.08)', border:'1px solid rgba(224,82,82,0.25)' }}
                onMouseEnter={e=>e.currentTarget.style.background='rgba(224,82,82,0.15)'}
                onMouseLeave={e=>e.currentTarget.style.background='rgba(224,82,82,0.08)'}>
                <Trash2 size={13}/> Hapus Permanen ({selArr.length})
              </button>
            </>
          )}
          {docs.length > 0 && selArr.length === 0 && (
            <button onClick={() => setConfirmEmpty(true)} disabled={processing}
              style={{ ...btnBase, color:'#e05252', background:'rgba(224,82,82,0.08)', border:'1px solid rgba(224,82,82,0.25)' }}
              onMouseEnter={e=>e.currentTarget.style.background='rgba(224,82,82,0.15)'}
              onMouseLeave={e=>e.currentTarget.style.background='rgba(224,82,82,0.08)'}>
              <Trash2 size={13}/> Kosongkan Sampah
            </button>
          )}
        </div>
      </div>

      {/* ── Info banner ── */}
      <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'12px 16px', borderRadius:8, background:'rgba(201,153,26,0.07)', border:'1px solid rgba(201,153,26,0.2)', marginBottom:16 }}>
        <AlertTriangle size={15} style={{ color:'var(--gold-400)', flexShrink:0, marginTop:1 }}/>
        <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'rgba(255,255,255,0.55)', lineHeight:1.6 }}>
          Dokumen di sini telah dihapus dan tidak muncul di halaman Dokumen. Pilih dokumen lalu klik <strong style={{color:'rgba(255,255,255,0.75)'}}>Pulihkan</strong> untuk mengembalikannya, atau <strong style={{color:'#e05252'}}>Hapus Permanen</strong> untuk menghapus selamanya.
        </p>
      </div>

      {/* ── Table ── */}
      <div className="scrollbar-thin" style={{ overflowX:'auto', borderRadius:12, border:'1px solid var(--border-mid)', background:'var(--bg-surface)' }}>
        <table style={{ minWidth:'100%', borderCollapse:'collapse', fontSize:12 }}>
          <thead>
            <tr>
              <th style={{ ...TH, width:40, textAlign:'center' }}>
                <input type="checkbox" checked={docs.length > 0 && selected.size === docs.length}
                  onChange={toggleAll}
                  style={{ cursor:'pointer', accentColor:'var(--gold-400)', width:14, height:14 }}/>
              </th>
              <th style={{ ...TH, textAlign:'left', minWidth:150 }}>Debitur / Pihak Pertama</th>
              <th style={{ ...TH, textAlign:'left', minWidth:120 }}>Perusahaan</th>
              <th style={{ ...TH, textAlign:'left' }}>Akad</th>
              <th style={{ ...TH, textAlign:'left' }}>Bank</th>
              <th style={{ ...TH, textAlign:'left', minWidth:140 }}>Dihapus Pada</th>
              <th style={{ ...TH, textAlign:'center', minWidth:160 }}>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ padding:56, textAlign:'center', fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'rgba(255,255,255,0.3)' }}>Memuat data…</td></tr>
            ) : docs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ padding:'64px 20px', textAlign:'center' }}>
                  <Trash2 size={32} style={{ color:'rgba(255,255,255,0.1)', margin:'0 auto 12px', display:'block' }}/>
                  <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'rgba(255,255,255,0.3)', letterSpacing:'0.06em' }}>Sampah kosong</p>
                </td>
              </tr>
            ) : docs.map(doc => (
              <tr key={doc.id}
                style={{ borderBottom:'1px solid var(--border)', transition:'background 0.12s', background: selected.has(doc.id) ? 'rgba(201,153,26,0.06)' : 'transparent' }}
                onMouseEnter={e=>{ if(!selected.has(doc.id)) e.currentTarget.style.background='var(--bg-raised)' }}
                onMouseLeave={e=>{ if(!selected.has(doc.id)) e.currentTarget.style.background='transparent' }}>

                <td style={{ ...TD, textAlign:'center' }}>
                  <input type="checkbox" checked={selected.has(doc.id)} onChange={() => toggleSelect(doc.id)}
                    style={{ cursor:'pointer', accentColor:'var(--gold-400)', width:14, height:14 }}/>
                </td>
                <td style={{ ...TD, fontWeight:600, maxWidth:160, overflow:'hidden', textOverflow:'ellipsis', color:'#fff' }}>
                  {doc.pihak_pertama || '—'}
                </td>
                <td style={{ ...TD, maxWidth:130, overflow:'hidden', textOverflow:'ellipsis', color:'rgba(255,255,255,0.55)' }}>
                  {companyMap[doc.company_id] || '—'}
                </td>
                <td style={{ ...TD, fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'rgba(255,255,255,0.5)' }}>
                  {doc.jenis_akad || '—'}
                </td>
                <td style={{ ...TD, fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'rgba(255,255,255,0.5)' }}>
                  {doc.bank || '—'}
                </td>
                <td style={{ ...TD, fontFamily:"'JetBrains Mono',monospace", fontSize:10, color:'rgba(224,82,82,0.7)' }}>
                  {fmtDateTime(doc.deleted_at)}
                </td>
                <td style={{ ...TD, textAlign:'center' }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:6 }}>
                    {/* Restore */}
                    <button onClick={() => handleRestore([doc.id])} disabled={processing}
                      title="Pulihkan"
                      style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:6, background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.12)', cursor:'pointer', color:'rgba(255,255,255,0.6)', fontSize:10, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.06em', textTransform:'uppercase', transition:'all 0.15s' }}
                      onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.color='#fff' }}
                      onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.05)'; e.currentTarget.style.color='rgba(255,255,255,0.6)' }}>
                      <RotateCcw size={12}/> Pulihkan
                    </button>
                    {/* Hapus permanen */}
                    <button onClick={() => setConfirmPerm(doc.id)} disabled={processing}
                      title="Hapus Permanen"
                      style={{ display:'flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:6, background:'rgba(224,82,82,0.08)', border:'1px solid rgba(224,82,82,0.2)', cursor:'pointer', color:'rgba(224,82,82,0.7)', fontSize:10, fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.06em', textTransform:'uppercase', transition:'all 0.15s' }}
                      onMouseEnter={e=>{ e.currentTarget.style.background='rgba(224,82,82,0.18)'; e.currentTarget.style.color='#e05252' }}
                      onMouseLeave={e=>{ e.currentTarget.style.background='rgba(224,82,82,0.08)'; e.currentTarget.style.color='rgba(224,82,82,0.7)' }}>
                      <Trash2 size={12}/> Permanen
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Confirm: Hapus Permanen (satu / selected) ── */}
      {confirmPerm && createPortal(
        <div style={{ position:'fixed', inset:0, zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(5,10,18,0.82)' }}>
          <div style={{ position:'absolute', inset:0 }} onClick={() => setConfirmPerm(null)} />
          <div style={{ position:'relative', width:'100%', maxWidth:400, borderRadius:12, padding:28, background:'var(--bg-surface)', border:'1px solid rgba(224,82,82,0.3)', boxShadow:'0 20px 60px rgba(0,0,0,0.6)' }}>
            <div style={{ width:48, height:48, borderRadius:'50%', background:'rgba(224,82,82,0.1)', border:'1px solid rgba(224,82,82,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <Trash2 size={22} style={{ color:'#e05252' }}/>
            </div>
            <h3 style={{ fontFamily:"'Outfit',sans-serif", fontSize:18, fontWeight:600, color:'#fff', textAlign:'center', marginBottom:8 }}>
              Hapus Permanen?
            </h3>
            <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'rgba(255,255,255,0.45)', textAlign:'center', lineHeight:1.7, marginBottom:24 }}>
              {confirmPerm === 'selected'
                ? `${selArr.length} dokumen akan dihapus selamanya.`
                : '1 dokumen akan dihapus selamanya.'
              }<br/>
              <strong style={{ color:'#e05252' }}>Tindakan ini tidak dapat dibatalkan.</strong>
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setConfirmPerm(null)}
                style={{ flex:1, padding:'10px', borderRadius:8, border:'1px solid var(--border-mid)', color:'rgba(255,255,255,0.6)', background:'transparent', cursor:'pointer', fontSize:13, fontWeight:500, transition:'all 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--bg-raised)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                Batal
              </button>
              <button onClick={() => handlePermanentDelete(confirmPerm === 'selected' ? selArr : [confirmPerm])} disabled={processing}
                style={{ flex:1, padding:'10px', borderRadius:8, border:'none', background:'#e05252', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600, transition:'all 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.background='#c94444'}
                onMouseLeave={e=>e.currentTarget.style.background='#e05252'}>
                {processing ? 'Menghapus…' : 'Ya, Hapus Permanen'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {/* ── Confirm: Kosongkan Sampah ── */}
      {confirmEmpty && createPortal(
        <div style={{ position:'fixed', inset:0, zIndex:9999, display:'flex', alignItems:'center', justifyContent:'center', padding:16, background:'rgba(5,10,18,0.82)' }}>
          <div style={{ position:'absolute', inset:0 }} onClick={() => setConfirmEmpty(false)} />
          <div style={{ position:'relative', width:'100%', maxWidth:400, borderRadius:12, padding:28, background:'var(--bg-surface)', border:'1px solid rgba(224,82,82,0.3)', boxShadow:'0 20px 60px rgba(0,0,0,0.6)' }}>
            <div style={{ width:48, height:48, borderRadius:'50%', background:'rgba(224,82,82,0.1)', border:'1px solid rgba(224,82,82,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px' }}>
              <Trash2 size={22} style={{ color:'#e05252' }}/>
            </div>
            <h3 style={{ fontFamily:"'Outfit',sans-serif", fontSize:18, fontWeight:600, color:'#fff', textAlign:'center', marginBottom:8 }}>
              Kosongkan Semua Sampah?
            </h3>
            <p style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:11, color:'rgba(255,255,255,0.45)', textAlign:'center', lineHeight:1.7, marginBottom:24 }}>
              Semua <strong style={{ color:'#fff' }}>{docs.length} dokumen</strong> di sampah akan dihapus selamanya.<br/>
              <strong style={{ color:'#e05252' }}>Tindakan ini tidak dapat dibatalkan.</strong>
            </p>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={() => setConfirmEmpty(false)}
                style={{ flex:1, padding:'10px', borderRadius:8, border:'1px solid var(--border-mid)', color:'rgba(255,255,255,0.6)', background:'transparent', cursor:'pointer', fontSize:13, fontWeight:500, transition:'all 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.background='var(--bg-raised)'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                Batal
              </button>
              <button onClick={handleEmptyTrash} disabled={processing}
                style={{ flex:1, padding:'10px', borderRadius:8, border:'none', background:'#e05252', color:'#fff', cursor:'pointer', fontSize:13, fontWeight:600, transition:'all 0.15s' }}
                onMouseEnter={e=>e.currentTarget.style.background='#c94444'}
                onMouseLeave={e=>e.currentTarget.style.background='#e05252'}>
                {processing ? 'Menghapus…' : 'Ya, Kosongkan'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  )
}
