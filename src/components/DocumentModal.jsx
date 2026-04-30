import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import PdfUploadField from './PdfUploadField'
import { getBanks, getJenisAkad } from '../services/supabaseService'
import { supabase } from '../supabase'

const KEGIATAN = [
  { key:'tanggal_pengecekan',      label:'Pengecekan' },
  { key:'tanggal_znt',             label:'ZNT' },
  { key:'tanggal_alih_media',      label:'Alih Media' },
  { key:'tanggal_balik_nama',      label:'Balik Nama' },
  { key:'tanggal_peningkatan_shm', label:'Peningkatan (SHM)' },
  { key:'tanggal_ht',              label:'HT' },
  { key:'tanggal_roya',            label:'Roya' },
]
const EMPTY = {
  no:'', pihak_pertama:'', pihak_kedua:'', jenis_akad:'', bank:'', company_id:'',
  tanggal_pinjam:'', pdf_pinjam:null,
  tanggal_diterima:'', pdf_diterima:null,
  tanggal_bayar_pajak:'', pdf_bayar_pajak:null,
  tanggal_akta:'',
  tanggal_akad:'',
  tanggal_pengecekan:'', tanggal_znt:'', tanggal_alih_media:'', tanggal_balik_nama:'',
  tanggal_peningkatan_shm:'', tanggal_ht:'', tanggal_roya:'',
  tanggal_selesai:'', pdf_selesai:null,
  tanggal_register:'', pdf_register:null,
  keterangan:'',
}

const S = {
  overlay: {
    position:'fixed', inset:0, zIndex:9999,
    display:'flex', alignItems:'center', justifyContent:'center',
    padding:16, background:'rgba(5,10,18,0.82)',
  },
  modal: {
    position:'relative', width:'100%', maxWidth:700,
    height:'88vh', display:'flex', flexDirection:'column',
    borderRadius:14, overflow:'hidden',
    background:'var(--navy-800)',
    border:'1px solid rgba(255,255,255,0.12)',
    boxShadow:'0 24px 64px rgba(0,0,0,0.6)',
  },
  header: {
    display:'flex', alignItems:'center', justifyContent:'space-between',
    padding:'16px 24px', borderBottom:'1px solid rgba(255,255,255,0.09)', flexShrink:0,
  },
  body: { flex:1, overflowY:'auto', padding:'20px 24px' },
  footer: {
    display:'flex', justifyContent:'flex-end', gap:10,
    padding:'14px 24px', borderTop:'1px solid rgba(255,255,255,0.09)',
    background:'var(--navy-900)', flexShrink:0,
  },
  secTitle: {
    fontFamily:"'Outfit', sans-serif", fontSize:13, fontWeight:600,
    color:'rgba(255,255,255,0.5)', textTransform:'uppercase', letterSpacing:'0.08em',
    borderBottom:'1px solid rgba(255,255,255,0.08)', paddingBottom:8, marginBottom:16,
  },
  card: {
    background:'var(--navy-900)', border:'1px solid rgba(255,255,255,0.09)',
    borderRadius:10, padding:16, display:'flex', flexDirection:'column', gap:12,
  },
  cardLbl: {
    fontFamily:"'JetBrains Mono', monospace", fontSize:9, fontWeight:500,
    letterSpacing:'0.14em', textTransform:'uppercase', color:'rgba(255,255,255,0.4)',
  },
  grid2: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 },
}

const fld = (err) => ({
  width:'100%', background:'rgba(255,255,255,0.06)',
  border:`1px solid ${err ? '#e05252' : 'rgba(255,255,255,0.12)'}`,
  borderRadius:7, padding:'9px 12px', fontSize:13,
  color:'#FFFFFF', outline:'none',
  fontFamily:"'Outfit', sans-serif", transition:'border-color 0.15s',
})
const lbl = {
  display:'block', fontSize:11, fontWeight:500,
  color:'rgba(255,255,255,0.55)', marginBottom:6,
}
const errTxt = { fontSize:11, color:'#e05252', marginTop:3 }

function focusGold(e) { e.target.style.borderColor = 'rgba(201,153,26,0.5)' }
function blurNorm(e)   { e.target.style.borderColor = 'rgba(255,255,255,0.12)' }

function cleanForm(f) {
  const INT  = ['no']
  const DATE = [
    'tanggal_pinjam','tanggal_diterima','tanggal_bayar_pajak','tanggal_akta','tanggal_akad',
    'tanggal_pengecekan','tanggal_znt','tanggal_alih_media','tanggal_balik_nama',
    'tanggal_peningkatan_shm','tanggal_ht','tanggal_roya','tanggal_selesai','tanggal_register',
  ]
  const c = {...f}
  INT.forEach(k  => { c[k] = (c[k]===''||c[k]==null) ? null : (isNaN(parseInt(c[k],10)) ? null : parseInt(c[k],10)) })
  DATE.forEach(k => { if (!c[k]) c[k] = null })
  return c
}

export default function DocumentModal({ isOpen, onClose, onSave, record, companies, defaultCompanyId }) {
  const [form, setForm]         = useState(EMPTY)
  const [saving, setSaving]     = useState(false)
  const [errors, setErrors]     = useState({})
  const [bankList, setBankList]         = useState([])
  const [jenisAkadList, setJenisAkadList] = useState([])

  // Fetch banks & jenis_akad from DB, dengan realtime
  useEffect(() => {
    getBanks().then(setBankList)
    getJenisAkad().then(setJenisAkadList)

    const ch = supabase.channel('modal-refs')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'banks' }, () => getBanks().then(setBankList))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'jenis_akad' }, () => getJenisAkad().then(setJenisAkadList))
      .subscribe()
    return () => supabase.removeChannel(ch)
  }, [])

  useEffect(() => {
    if (isOpen) {
      setForm(record ? {...EMPTY, ...record} : {...EMPTY, company_id: defaultCompanyId || ''})
      setErrors({})
    }
  }, [isOpen, record, defaultCompanyId])

  const set = (k, v) => {
    setForm(f => ({...f, [k]: v}))
    if (errors[k]) setErrors(e => ({...e, [k]: ''}))
  }

  const setPihakPertama = (companyName) => {
    const matched = companies.find(c => c.name === companyName)
    setForm(f => ({...f, pihak_pertama: companyName, company_id: matched ? matched.id : f.company_id}))
    if (errors.pihak_pertama) setErrors(e => ({...e, pihak_pertama:''}))
  }

  function validate() {
    const e = {}
    if (!form.pihak_pertama) e.pihak_pertama = 'Pilih perusahaan'
    if (!form.jenis_akad)    e.jenis_akad    = 'Pilih jenis akad'
    if (!form.bank)          e.bank          = 'Pilih bank'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setSaving(true)
    try { await onSave(cleanForm(form)); onClose() }
    finally { setSaving(false) }
  }

  if (!isOpen) return null
  const isEdit = !!record?.id

  const modal = (
    <div style={S.overlay}>
      <div style={{ position:'absolute', inset:0 }} onClick={onClose} />

      <div style={S.modal}>

        {/* ── Header ── */}
        <div style={S.header}>
          <div>
            <p style={{ fontFamily:"'JetBrains Mono', monospace", fontSize:9, letterSpacing:'0.14em', color:'rgba(255,255,255,0.35)', textTransform:'uppercase', marginBottom:3 }}>
              {isEdit ? 'Edit' : 'Tambah Baru'}
            </p>
            <h2 style={{ fontFamily:"'Outfit', sans-serif", fontSize:20, fontWeight:600, color:'#FFFFFF', lineHeight:1 }}>
              {isEdit ? 'Edit Record' : 'Record Baru'}
            </h2>
          </div>
          <button onClick={onClose}
            style={{ width:32, height:32, borderRadius:7, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', color:'rgba(255,255,255,0.5)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, transition:'all 0.15s' }}
            onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.1)'; e.currentTarget.style.color='#fff' }}
            onMouseLeave={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='rgba(255,255,255,0.5)' }}>
            ✕
          </button>
        </div>

        {/* ── Body ── */}
        <div className="scrollbar-thin" style={S.body}>

          {/* Identitas */}
          <div style={{ marginBottom:24 }}>
            <p style={S.secTitle}>Identitas</p>
            <div style={S.grid2}>
              <div>
                <label style={lbl}>No</label>
                <input type="number" style={fld(false)} value={form.no??''} onChange={e=>set('no',e.target.value)} placeholder="Nomor urut" onFocus={focusGold} onBlur={blurNorm}/>
              </div>
              <div>
                <label style={lbl}>Jenis Akad <span style={{color:'#e05252'}}>*</span></label>
                <select style={fld(errors.jenis_akad)} value={form.jenis_akad} onChange={e=>set('jenis_akad',e.target.value)}>
                  <option value="">-- Pilih --</option>
                  {jenisAkadList.map(j=><option key={j.id} value={j.name}>{j.name}</option>)}
                </select>
                {errors.jenis_akad && <p style={errTxt}>{errors.jenis_akad}</p>}
              </div>
            </div>

            <div style={{...S.grid2, marginTop:12}}>
              <div>
                <label style={lbl}>Pihak Pertama (Perusahaan) <span style={{color:'#e05252'}}>*</span></label>
                <select style={fld(errors.pihak_pertama)} value={form.pihak_pertama} onChange={e=>setPihakPertama(e.target.value)}>
                  <option value="">-- Pilih Perusahaan --</option>
                  {companies.map(c=><option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
                {errors.pihak_pertama && <p style={errTxt}>{errors.pihak_pertama}</p>}
              </div>
              <div>
                <label style={lbl}>Pihak Kedua</label>
                <input style={fld(false)} value={form.pihak_kedua} onChange={e=>set('pihak_kedua',e.target.value)} placeholder="Nama pihak kedua" onFocus={focusGold} onBlur={blurNorm}/>
              </div>
            </div>

            <div style={{...S.grid2, marginTop:12}}>
              <div>
                <label style={lbl}>Bank <span style={{color:'#e05252'}}>*</span></label>
                <select style={fld(errors.bank)} value={form.bank} onChange={e=>set('bank',e.target.value)}>
                  <option value="">-- Pilih --</option>
                  {bankList.map(b=><option key={b.id} value={b.name}>{b.name}</option>)}
                </select>
                {errors.bank && <p style={errTxt}>{errors.bank}</p>}
              </div>
            </div>
          </div>

          {/* Akad & Pajak */}
          <div style={{ marginBottom:24 }}>
            <p style={S.secTitle}>Akad &amp; Pajak</p>
            <div style={S.grid2}>

              {/* Tanggal Pinjam + PDF */}
              <div style={S.card}>
                <p style={S.cardLbl}>Tanggal Pinjam</p>
                <div>
                  <label style={lbl}>Tanggal</label>
                  <input type="date" style={fld(false)} value={form.tanggal_pinjam||''} onChange={e=>set('tanggal_pinjam',e.target.value)}/>
                </div>
                <PdfUploadField label="Dokumen PDF" value={form.pdf_pinjam} onChange={v=>set('pdf_pinjam',v)} docId={record?.id} fieldName="pinjam"/>
              </div>

              {/* Tanggal Diterima + PDF */}
              <div style={S.card}>
                <p style={S.cardLbl}>Tanggal Diterima</p>
                <div>
                  <label style={lbl}>Tanggal</label>
                  <input type="date" style={fld(false)} value={form.tanggal_diterima||''} onChange={e=>set('tanggal_diterima',e.target.value)}/>
                </div>
                <PdfUploadField label="Dokumen PDF" value={form.pdf_diterima} onChange={v=>set('pdf_diterima',v)} docId={record?.id} fieldName="diterima"/>
              </div>

              {/* Tanggal Bayar Pajak + PDF */}
              <div style={S.card}>
                <p style={S.cardLbl}>Tanggal Bayar Pajak</p>
                <div>
                  <label style={lbl}>Tanggal</label>
                  <input type="date" style={fld(false)} value={form.tanggal_bayar_pajak||''} onChange={e=>set('tanggal_bayar_pajak',e.target.value)}/>
                </div>
                <PdfUploadField label="Dokumen PDF" value={form.pdf_bayar_pajak} onChange={v=>set('pdf_bayar_pajak',v)} docId={record?.id} fieldName="bayar_pajak"/>
              </div>

              {/* Tanggal Akta — plain */}
              <div>
                <label style={lbl}>Tanggal Akta</label>
                <input type="date" style={fld(false)} value={form.tanggal_akta||''} onChange={e=>set('tanggal_akta',e.target.value)}/>
              </div>

              {/* Tanggal Akad — plain, full width */}
              <div style={{ gridColumn:'1 / -1' }}>
                <label style={lbl}>Tanggal Akad</label>
                <input type="date" style={fld(false)} value={form.tanggal_akad||''} onChange={e=>set('tanggal_akad',e.target.value)}/>
              </div>

            </div>
          </div>

          {/* Kegiatan */}
          <div style={{ marginBottom:24 }}>
            <p style={S.secTitle}>Kegiatan</p>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.35)', marginBottom:14 }}>Isi tanggal saat kegiatan selesai dilakukan.</p>
            <div style={S.grid2}>
              {KEGIATAN.map(({key, label:kLabel}) => (
                <div key={key}>
                  <label style={lbl}>{kLabel}</label>
                  <input type="date" style={fld(false)} value={form[key]||''} onChange={e=>set(key,e.target.value)}/>
                </div>
              ))}
            </div>
          </div>

          {/* Selesai & Register */}
          <div style={{ marginBottom:24 }}>
            <p style={S.secTitle}>Selesai &amp; Register</p>
            <div style={S.grid2}>
              <div style={S.card}>
                <p style={S.cardLbl}>Selesai</p>
                <div>
                  <label style={lbl}>Tanggal Selesai</label>
                  <input type="date" style={fld(false)} value={form.tanggal_selesai||''} onChange={e=>set('tanggal_selesai',e.target.value)}/>
                </div>
                <PdfUploadField label="Dokumen PDF" value={form.pdf_selesai} onChange={v=>set('pdf_selesai',v)} docId={record?.id} fieldName="selesai"/>
              </div>
              <div style={S.card}>
                <p style={S.cardLbl}>Register (Penyerahan ke Bank)</p>
                <div>
                  <label style={lbl}>Tanggal Register</label>
                  <input type="date" style={fld(false)} value={form.tanggal_register||''} onChange={e=>set('tanggal_register',e.target.value)}/>
                </div>
                <PdfUploadField label="Dokumen PDF" value={form.pdf_register} onChange={v=>set('pdf_register',v)} docId={record?.id} fieldName="register"/>
              </div>
            </div>
          </div>

          {/* Keterangan */}
          <div style={{ marginBottom:8 }}>
            <p style={S.secTitle}>Keterangan</p>
            <textarea style={{...fld(false), resize:'none', lineHeight:1.6}} rows={3}
              value={form.keterangan||''} onChange={e=>set('keterangan',e.target.value)}
              placeholder="Catatan tambahan…" onFocus={focusGold} onBlur={blurNorm}/>
          </div>
        </div>

        {/* ── Footer ── */}
        <div style={S.footer}>
          <button onClick={onClose}
            style={{ padding:'9px 20px', borderRadius:8, border:'1px solid rgba(255,255,255,0.12)', color:'rgba(255,255,255,0.6)', background:'transparent', fontSize:13, cursor:'pointer', transition:'all 0.15s' }}
            onMouseEnter={e=>{ e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.color='#fff' }}
            onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(255,255,255,0.6)' }}>
            Batal
          </button>
          <button onClick={handleSubmit} disabled={saving}
            style={{ padding:'9px 22px', borderRadius:8, border:'none', background:saving?'var(--navy-600)':'var(--gold-500)', color:saving?'rgba(255,255,255,0.4)':'var(--navy-900)', fontSize:13, fontWeight:600, cursor:saving?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:7, transition:'all 0.15s' }}
            onMouseEnter={e=>{ if(!saving) e.currentTarget.style.background='var(--gold-400)' }}
            onMouseLeave={e=>{ if(!saving) e.currentTarget.style.background='var(--gold-500)' }}>
            {saving && (
              <svg style={{width:14,height:14,animation:'spin 1s linear infinite'}} fill="none" viewBox="0 0 24 24">
                <circle style={{opacity:0.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path style={{opacity:0.75}} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            )}
            {saving ? 'Menyimpan…' : isEdit ? 'Simpan Perubahan' : 'Tambah Record'}
          </button>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform:rotate(0deg) } to { transform:rotate(360deg) } }`}</style>
    </div>
  )

  return createPortal(modal, document.body)
}
