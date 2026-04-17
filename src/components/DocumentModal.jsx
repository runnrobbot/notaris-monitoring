import { useState, useEffect } from 'react'
import PdfUploadField from './PdfUploadField'

const JENIS_AKAD = ['KPR','KPA','KKB','Multiguna','Komersial','Lainnya']
const BANKS = ['BTN','BTN Syariah','BRI','BRI Syariah','BNI','BNI Syariah','Mandiri','BSI','CIMB Niaga','Danamon','Permata','Lainnya']
const KEGIATAN = [
  { key: 'tanggal_pengecekan',      label: 'Pengecekan' },
  { key: 'tanggal_znt',             label: 'ZNT' },
  { key: 'tanggal_alih_media',      label: 'Alih Media' },
  { key: 'tanggal_balik_nama',      label: 'Balik Nama' },
  { key: 'tanggal_peningkatan_shm', label: 'Peningkatan (SHM)' },
  { key: 'tanggal_ht',              label: 'HT' },
  { key: 'tanggal_roya',            label: 'Roya' },
]
const EMPTY = {
  no:'', pihak_pertama:'', pihak_kedua:'', jenis_akad:'', bank:'', company_id:'',
  tanggal_pinjam:'', tanggal_diterima:'', tanggal_bayar_pajak:'', tanggal_akta:'',
  tanggal_pengecekan:'', tanggal_znt:'', tanggal_alih_media:'', tanggal_balik_nama:'',
  tanggal_peningkatan_shm:'', tanggal_ht:'', tanggal_roya:'',
  tanggal_selesai:'', pdf_selesai:null, tanggal_register:'', pdf_register:null, keterangan:'',
}
const iS = { width:'100%', background:'var(--bg-raised)', border:'1px solid var(--border-strong)', color:'var(--text-primary)', borderRadius:'8px', padding:'8px 12px', fontSize:'13px', outline:'none' }
const iE = { ...iS, borderColor:'#e05252' }
const lS = { display:'block', fontSize:'10px', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em', color:'var(--text-secondary)', marginBottom:5 }
const sT = { fontFamily:"'Cormorant Garamond', serif", fontSize:'15px', fontWeight:600, color:'var(--gold)', borderBottom:'1px solid var(--gold-border)', paddingBottom:6, marginBottom:14 }

// Ubah string kosong ke null untuk field integer & date
function cleanForm(form) {
  const INTEGER_FIELDS = ['no']
  const DATE_FIELDS = [
    'tanggal_pinjam','tanggal_diterima','tanggal_bayar_pajak','tanggal_akta',
    'tanggal_pengecekan','tanggal_znt','tanggal_alih_media','tanggal_balik_nama',
    'tanggal_peningkatan_shm','tanggal_ht','tanggal_roya','tanggal_selesai','tanggal_register',
  ]
  const cleaned = { ...form }
  INTEGER_FIELDS.forEach(f => {
    if (cleaned[f] === '' || cleaned[f] === null || cleaned[f] === undefined) {
      cleaned[f] = null
    } else {
      const n = parseInt(cleaned[f], 10)
      cleaned[f] = isNaN(n) ? null : n
    }
  })
  DATE_FIELDS.forEach(f => {
    if (!cleaned[f]) cleaned[f] = null
  })
  return cleaned
}

export default function DocumentModal({ isOpen, onClose, onSave, record, companies, defaultCompanyId }) {
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (isOpen) {
      setForm(record ? { ...EMPTY, ...record } : { ...EMPTY, company_id: defaultCompanyId || '' })
      setErrors({})
    }
  }, [isOpen, record, defaultCompanyId])

  function set(k, v) { setForm(f => ({ ...f, [k]: v })); if (errors[k]) setErrors(e => ({ ...e, [k]: '' })) }

  function validate() {
    const e = {}
    if (!form.pihak_pertama?.trim()) e.pihak_pertama = 'Wajib diisi'
    if (!form.jenis_akad) e.jenis_akad = 'Pilih jenis akad'
    if (!form.bank) e.bank = 'Pilih bank'
    if (!form.company_id) e.company_id = 'Pilih perusahaan'
    setErrors(e); return Object.keys(e).length === 0
  }

  async function handleSubmit() {
    if (!validate()) return
    setSaving(true)
    try {
      const cleaned = cleanForm(form)
      await onSave(cleaned)
      onClose()
    } finally { setSaving(false) }
  }

  if (!isOpen) return null
  const isEdit = !!record?.id

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background:'rgba(0,0,0,0.8)' }}>
      <div className="w-full max-w-3xl max-h-[92vh] flex flex-col rounded-xl overflow-hidden"
        style={{ background:'var(--bg-surface)', border:'1px solid var(--border-strong)' }}>
        <div className="flex items-center justify-between px-6 py-4 flex-shrink-0" style={{ borderBottom:'1px solid var(--border)' }}>
          <h2 style={{ fontFamily:"'Cormorant Garamond', serif", fontSize:'22px', fontWeight:600, color:'var(--text-primary)' }}>
            {isEdit ? 'Edit Record' : 'Tambah Record Baru'}
          </h2>
          <button onClick={onClose} style={{ color:'var(--text-muted)', background:'none', border:'none', cursor:'pointer', fontSize:18 }}>✕</button>
        </div>
        <div className="overflow-y-auto flex-1 px-6 py-5 scrollbar-thin">

          <div style={{ marginBottom:20 }}>
            <p style={sT}>Identitas</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label style={lS}>No</label>
                <input type="number" style={iS} value={form.no ?? ''} onChange={e=>set('no',e.target.value)} placeholder="Nomor urut"/>
              </div>
              <div>
                <label style={lS}>Perusahaan <span style={{color:'#e05252'}}>*</span></label>
                <select style={errors.company_id?iE:iS} value={form.company_id} onChange={e=>set('company_id',e.target.value)}>
                  <option value="">-- Pilih --</option>
                  {companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
                {errors.company_id&&<p style={{fontSize:11,color:'#e05252',marginTop:3}}>{errors.company_id}</p>}
              </div>
            </div>
            <div className="mt-3">
              <label style={lS}>Pihak Pertama (Debitur) <span style={{color:'#e05252'}}>*</span></label>
              <input style={errors.pihak_pertama?iE:iS} value={form.pihak_pertama} onChange={e=>set('pihak_pertama',e.target.value)} placeholder="Nama debitur"/>
              {errors.pihak_pertama&&<p style={{fontSize:11,color:'#e05252',marginTop:3}}>{errors.pihak_pertama}</p>}
            </div>
            <div className="mt-3">
              <label style={lS}>Pihak Kedua</label>
              <input style={iS} value={form.pihak_kedua} onChange={e=>set('pihak_kedua',e.target.value)} placeholder="Nama pihak kedua"/>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-3">
              <div>
                <label style={lS}>Jenis Akad <span style={{color:'#e05252'}}>*</span></label>
                <select style={errors.jenis_akad?iE:iS} value={form.jenis_akad} onChange={e=>set('jenis_akad',e.target.value)}>
                  <option value="">-- Pilih --</option>{JENIS_AKAD.map(j=><option key={j}>{j}</option>)}
                </select>
                {errors.jenis_akad&&<p style={{fontSize:11,color:'#e05252',marginTop:3}}>{errors.jenis_akad}</p>}
              </div>
              <div>
                <label style={lS}>Bank <span style={{color:'#e05252'}}>*</span></label>
                <select style={errors.bank?iE:iS} value={form.bank} onChange={e=>set('bank',e.target.value)}>
                  <option value="">-- Pilih --</option>{BANKS.map(b=><option key={b}>{b}</option>)}
                </select>
                {errors.bank&&<p style={{fontSize:11,color:'#e05252',marginTop:3}}>{errors.bank}</p>}
              </div>
            </div>
          </div>

          <div style={{ marginBottom:20 }}>
            <p style={sT}>Akad & Pajak</p>
            <div className="grid grid-cols-2 gap-4">
              {[['tanggal_pinjam','Tanggal Pinjam'],['tanggal_diterima','Tanggal Diterima'],['tanggal_bayar_pajak','Tanggal Bayar Pajak'],['tanggal_akta','Tanggal Akta']].map(([k,lbl])=>(
                <div key={k}><label style={lS}>{lbl}</label><input type="date" style={iS} value={form[k]||''} onChange={e=>set(k,e.target.value)}/></div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom:20 }}>
            <p style={sT}>Kegiatan</p>
            <p style={{fontSize:11,color:'var(--text-muted)',marginBottom:12}}>Isi tanggal saat kegiatan selesai dilakukan.</p>
            <div className="grid grid-cols-2 gap-4">
              {KEGIATAN.map(({key,label})=>(
                <div key={key}><label style={lS}>{label}</label><input type="date" style={iS} value={form[key]||''} onChange={e=>set(key,e.target.value)}/></div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom:20 }}>
            <p style={sT}>Selesai & Register</p>
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3 p-4 rounded-lg" style={{background:'var(--bg-raised)',border:'1px solid var(--border))'}}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{color:'var(--gold)',opacity:0.8}}>Selesai</p>
                <div><label style={lS}>Tanggal Selesai</label><input type="date" style={iS} value={form.tanggal_selesai||''} onChange={e=>set('tanggal_selesai',e.target.value)}/></div>
                <PdfUploadField label="Dokumen PDF" value={form.pdf_selesai} onChange={v=>set('pdf_selesai',v)} docId={record?.id} fieldName="selesai"/>
              </div>
              <div className="space-y-3 p-4 rounded-lg" style={{background:'var(--bg-raised)',border:'1px solid var(--border)'}}>
                <p className="text-xs font-semibold uppercase tracking-wider" style={{color:'var(--gold)',opacity:0.8}}>Register (Penyerahan ke Bank)</p>
                <div><label style={lS}>Tanggal Register</label><input type="date" style={iS} value={form.tanggal_register||''} onChange={e=>set('tanggal_register',e.target.value)}/></div>
                <PdfUploadField label="Dokumen PDF" value={form.pdf_register} onChange={v=>set('pdf_register',v)} docId={record?.id} fieldName="register"/>
              </div>
            </div>
          </div>

          <div style={{ marginBottom:20 }}>
            <p style={sT}>Keterangan</p>
            <textarea style={{...iS,resize:'none'}} rows={3} value={form.keterangan||''} onChange={e=>set('keterangan',e.target.value)} placeholder="Catatan tambahan…"/>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 flex-shrink-0" style={{borderTop:'1px solid var(--border)',background:'var(--bg-raised)'}}>
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm" style={{border:'1px solid var(--border-strong)',color:'var(--text-secondary)',background:'transparent'}}>Batal</button>
          <button onClick={handleSubmit} disabled={saving} className="px-5 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
            style={{background:'var(--gold-dim)',color:'var(--gold)',border:'1px solid var(--gold-border)'}}>
            {saving&&<svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle style={{opacity:0.25}} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path style={{opacity:0.75}} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
            {saving?'Menyimpan…':isEdit?'Simpan Perubahan':'Tambah Record'}
          </button>
        </div>
      </div>
    </div>
  )
}
