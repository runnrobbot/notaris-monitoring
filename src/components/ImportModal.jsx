import { useState, useRef } from 'react'
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { parseExcelFile, formatDisplayDate } from '../utils/excelUtils'
import { batchImportDocuments } from '../services/supabaseService'
import toast from 'react-hot-toast'

const S = {
  overlay: { background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)' },
  modal:   { background:'#181818', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16 },
  header:  { borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'16px 24px' },
  footer:  { borderTop:'1px solid rgba(255,255,255,0.08)', padding:'14px 24px' },
  label:   { fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.08em', color:'#888', marginBottom:6, display:'block' },
  input:   { width:'100%', background:'#202020', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'9px 12px', fontSize:13, color:'#fff', outline:'none' },
  btnGold: { background:'#C9A84C', color:'#0f0f0f', borderRadius:8, padding:'8px 20px', fontSize:13, fontWeight:700, cursor:'pointer', border:'none' },
  btnGhost:{ background:'transparent', border:'1px solid rgba(255,255,255,0.12)', color:'#c8c8c8', borderRadius:8, padding:'8px 16px', fontSize:13, fontWeight:500, cursor:'pointer' },
  btnGreen:{ background:'rgba(34,197,94,0.15)', border:'1px solid rgba(34,197,94,0.3)', color:'#4ade80', borderRadius:8, padding:'8px 20px', fontSize:13, fontWeight:700, cursor:'pointer', display:'flex', alignItems:'center', gap:6 },
  th:      { padding:'8px 12px', fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.07em', color:'#C9A84C', whiteSpace:'nowrap', textAlign:'left', borderBottom:'1px solid rgba(255,255,255,0.08)' },
  td:      { padding:'7px 12px', fontSize:11, color:'#c8c8c8', borderBottom:'1px solid rgba(255,255,255,0.05)', whiteSpace:'nowrap' },
}

export function ImportModal({ isOpen, onClose, companies, currentUser, onSuccess }) {
  const [selectedCompany, setSelectedCompany] = useState('')
  const [file, setFile]       = useState(null)
  const [preview, setPreview] = useState([])
  const [step, setStep]       = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const fileRef = useRef()

  function reset() {
    setSelectedCompany(''); setFile(null); setPreview([])
    setStep(1); setError(''); setLoading(false)
    if (fileRef.current) fileRef.current.value = ''
  }
  function handleClose() { reset(); onClose() }

  async function handleFileChange(e) {
    const f = e.target.files[0]
    if (!f) return
    if (!f.name.match(/\.(xlsx|xls|csv)$/i)) { setError('Harap upload file Excel (.xlsx/.xls) atau CSV'); return }
    setError(''); setFile(f); setLoading(true)
    try {
      const rows = await parseExcelFile(f)
      if (rows.length === 0) { setError('File tidak memiliki data. Pastikan data dimulai dari baris 5.'); setLoading(false); return }
      setPreview(rows); setStep(2)
    } catch (err) { setError(`Gagal membaca file: ${err.message}`) }
    finally { setLoading(false) }
  }

  async function handleImport() {
    if (!selectedCompany) { setError('Pilih perusahaan terlebih dahulu'); return }
    setLoading(true)
    try {
      await batchImportDocuments(preview, selectedCompany, currentUser?.id)
      setStep(3)
      toast.success(`${preview.length} record berhasil diimport!`)
      onSuccess?.()
    } catch { toast.error('Import gagal. Coba lagi.') }
    finally { setLoading(false) }
  }

  if (!isOpen) return null

  return (
    <div style={{ position:'fixed', inset:0, zIndex:50, display:'flex', alignItems:'center', justifyContent:'center', padding:16, ...S.overlay }}>
      <div style={{ position:'fixed', inset:0 }} onClick={handleClose} />
      <div style={{ position:'relative', zIndex:10, width:'100%', maxWidth:760, ...S.modal }}>

        <div style={{ ...S.header, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <div style={{ background:'rgba(34,197,94,0.12)', borderRadius:8, padding:8, display:'flex' }}>
              <FileSpreadsheet size={18} style={{ color:'#4ade80' }} />
            </div>
            <div>
              <h2 style={{ fontSize:16, fontWeight:700, color:'#fff', margin:0 }}>Import dari Excel</h2>
              <p style={{ fontSize:11, color:'#888', margin:0 }}>Format sesuai template monitoring</p>
            </div>
          </div>
          <button onClick={handleClose} style={{ background:'transparent', border:'none', cursor:'pointer', padding:6, borderRadius:6, color:'#888' }}>
            <X size={18} />
          </button>
        </div>

        <div style={{ display:'flex', gap:0, borderBottom:'1px solid rgba(255,255,255,0.08)', padding:'0 24px' }}>
          {['Pilih File','Preview','Selesai'].map((label,i) => {
            const idx=i+1; const active=step===idx; const done=step>idx
            return (
              <div key={idx} style={{ display:'flex', alignItems:'center', gap:6, padding:'10px 16px 10px 0', fontSize:11, fontWeight:600,
                color: active?'#C9A84C': done?'#4ade80':'#555',
                borderBottom: active?'2px solid #C9A84C':'2px solid transparent', marginBottom:-1 }}>
                <span style={{ width:18, height:18, borderRadius:'50%', display:'inline-flex', alignItems:'center', justifyContent:'center',
                  background: active?'#C9A84C': done?'rgba(34,197,94,0.2)':'rgba(255,255,255,0.06)',
                  color: active?'#0f0f0f': done?'#4ade80':'#555', fontSize:10, fontWeight:700 }}>
                  {done?'✓':idx}
                </span>
                {label}
              </div>
            )
          })}
        </div>

        <div style={{ padding:'20px 24px', maxHeight:'60vh', overflowY:'auto' }}>
          {step === 1 && (
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              <div>
                <label style={S.label}>Target Perusahaan *</label>
                <select value={selectedCompany} onChange={e=>setSelectedCompany(e.target.value)} style={{ ...S.input, appearance:'none' }}>
                  <option value="" style={{ background:'#181818' }}>Pilih perusahaan…</option>
                  {companies.map(c=><option key={c.id} value={c.id} style={{ background:'#181818' }}>{c.name}</option>)}
                </select>
              </div>
              <div>
                <label style={S.label}>File Excel / CSV *</label>
                <label style={{
                  display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
                  border:`2px dashed ${selectedCompany?'rgba(201,168,76,0.4)':'rgba(255,255,255,0.1)'}`,
                  borderRadius:12, padding:'36px 24px', cursor:selectedCompany?'pointer':'not-allowed',
                  opacity:selectedCompany?1:0.4, transition:'all 0.2s',
                  background:selectedCompany?'rgba(201,168,76,0.03)':'transparent',
                }}>
                  {loading ? <Loader2 size={32} style={{ color:'#C9A84C', animation:'spin 1s linear infinite', marginBottom:8 }} />
                           : <Upload size={32} style={{ color:'#555', marginBottom:8 }} />}
                  <p style={{ fontSize:13, fontWeight:500, color:'#c8c8c8', margin:0 }}>{loading?'Membaca file…':'Klik untuk upload file Excel'}</p>
                  <p style={{ fontSize:11, color:'#555', marginTop:4 }}>Mendukung .xlsx, .xls, .csv</p>
                  <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display:'none' }}
                    onChange={handleFileChange} disabled={!selectedCompany||loading} />
                </label>
              </div>
              <div style={{ background:'rgba(96,165,250,0.07)', border:'1px solid rgba(96,165,250,0.2)', borderRadius:10, padding:'12px 16px' }}>
                <p style={{ fontSize:11, fontWeight:700, color:'#93c5fd', marginBottom:8 }}>Format file yang diharapkan:</p>
                <div style={{ fontSize:11, color:'#7dd3fc', lineHeight:1.7 }}>
                  <div>• <strong>Baris 3:</strong> Header grup</div>
                  <div>• <strong>Baris 4:</strong> Sub-header kolom</div>
                  <div>• <strong>Baris 5+:</strong> Data</div>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(96,165,250,0.07)', border:'1px solid rgba(96,165,250,0.2)', borderRadius:8, padding:'10px 14px' }}>
                <AlertCircle size={15} style={{ color:'#60a5fa', flexShrink:0 }} />
                <p style={{ fontSize:12, color:'#93c5fd', margin:0 }}>
                  <strong>{preview.length} baris</strong> terdeteksi dari <strong>{file?.name}</strong>. Review sebelum import.
                </p>
              </div>
              <div style={{ overflowX:'auto', borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', maxHeight:340 }}>
                <table style={{ width:'100%', borderCollapse:'collapse', background:'#181818' }}>
                  <thead style={{ position:'sticky', top:0, background:'#202020', zIndex:1 }}>
                    <tr>
                      {['No','Pihak Pertama','Pihak Kedua','Jenis Akad','Bank','Pinjam','Pengecekan','Selesai'].map(h=>(
                        <th key={h} style={S.th}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row,i)=>(
                      <tr key={i} onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.03)'}
                        onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                        <td style={{ ...S.td, color:'#555' }}>{row.no||i+1}</td>
                        <td style={{ ...S.td, color:'#fff', fontWeight:500, maxWidth:150, overflow:'hidden', textOverflow:'ellipsis' }}>{row.pihakPertama||row.pihak_pertama||'—'}</td>
                        <td style={{ ...S.td, maxWidth:120, overflow:'hidden', textOverflow:'ellipsis' }}>{row.pihakKedua||row.pihak_kedua||'—'}</td>
                        <td style={S.td}>{row.jenisAkad||row.jenis_akad||'—'}</td>
                        <td style={{ ...S.td, maxWidth:130, overflow:'hidden', textOverflow:'ellipsis' }}>{row.bank||'—'}</td>
                        <td style={S.td}>{formatDisplayDate(row.tanggalPinjam||row.tanggal_pinjam)||'—'}</td>
                        <td style={S.td}>
                          {(row.tanggalPengecekan||row.tanggal_pengecekan)
                            ? <span style={{ color:'#C9A84C', fontWeight:600 }}>{formatDisplayDate(row.tanggalPengecekan||row.tanggal_pengecekan)}</span>
                            : <span style={{ color:'#444' }}>Belum</span>}
                        </td>
                        <td style={S.td}>
                          {(row.tanggalSelesai||row.tanggal_selesai)
                            ? <span style={{ color:'#4ade80', fontWeight:600 }}>{formatDisplayDate(row.tanggalSelesai||row.tanggal_selesai)}</span>
                            : <span style={{ color:'#444' }}>—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {step === 3 && (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 0', textAlign:'center' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'rgba(34,197,94,0.12)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
                <CheckCircle2 size={32} style={{ color:'#4ade80' }} />
              </div>
              <h3 style={{ fontSize:20, fontWeight:700, color:'#fff', margin:'0 0 6px' }}>Import Berhasil!</h3>
              <p style={{ fontSize:13, color:'#888', margin:0 }}>{preview.length} record telah disimpan ke Supabase.</p>
            </div>
          )}

          {error && (
            <div style={{ display:'flex', alignItems:'center', gap:8, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.25)', borderRadius:8, padding:'10px 14px', marginTop:12 }}>
              <AlertCircle size={14} style={{ color:'#f87171', flexShrink:0 }} />
              <p style={{ fontSize:12, color:'#fca5a5', margin:0 }}>{error}</p>
            </div>
          )}
        </div>

        <div style={{ ...S.footer, display:'flex', justifyContent:'flex-end', gap:10 }}>
          {step===3 ? (
            <button onClick={handleClose} style={S.btnGold}>Selesai</button>
          ) : (
            <>
              <button onClick={handleClose} style={S.btnGhost}>Batal</button>
              {step===2 && (
                <>
                  <button onClick={()=>{ setStep(1); setPreview([]); setFile(null) }} style={S.btnGhost}>Kembali</button>
                  <button onClick={handleImport} disabled={loading} style={{ ...S.btnGreen, opacity:loading?0.6:1 }}>
                    {loading&&<Loader2 size={14} style={{ animation:'spin 1s linear infinite' }} />}
                    Import {preview.length} Record
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }`}</style>
    </div>
  )
}
