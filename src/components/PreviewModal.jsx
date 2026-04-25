const KEGIATAN = [
  { key: 'tanggal_pengecekan',      label: 'Pengecekan' },
  { key: 'tanggal_znt',             label: 'ZNT' },
  { key: 'tanggal_alih_media',      label: 'Alih Media' },
  { key: 'tanggal_balik_nama',      label: 'Balik Nama' },
  { key: 'tanggal_peningkatan_shm', label: 'Peningkatan (SHM)' },
  { key: 'tanggal_ht',              label: 'HT' },
  { key: 'tanggal_roya',            label: 'Roya' },
]

function fmtDate(val) {
  if (!val) return null
  try { return new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) }
  catch { return val }
}

function Section({ title, children }) {
  return (
    <div>
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--gold)', opacity: 0.7, marginBottom: 10, paddingBottom: 6, borderBottom: '1px solid var(--gold-border)' }}>
        {title}
      </p>
      {children}
    </div>
  )
}

function normPdf(val) {
  if (!val) return []
  if (Array.isArray(val)) return val.filter(f => f?.url)
  if (typeof val === 'object' && val.url) return [val]
  return []
}

function PdfList({ files }) {
  if (!files.length) return <p style={{ fontSize: 11, color: 'var(--text-muted)' }}>Tidak ada PDF</p>
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      {files.map((f, i) => (
        <a key={i} href={f.url} target="_blank" rel="noopener noreferrer"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: 'var(--gold)', fontSize: 11, textDecoration: 'none' }}>
          <svg style={{ width: 12, height: 12, flexShrink: 0, color: '#e05252' }} fill="currentColor" viewBox="0 0 20 20">
            <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
          </svg>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
            {f.name || `Dokumen ${i + 1}`}
          </span>
        </a>
      ))}
    </div>
  )
}

export default function PreviewModal({ isOpen, onClose, record, companyName }) {
  if (!isOpen || !record) return null

  const done      = record.tanggal_selesai && record.tanggal_register
  const anyDone   = KEGIATAN.some(f => record[f.key]) || record.tanggal_akta
  const doneCount = KEGIATAN.filter(f => record[f.key]).length
  const pct       = Math.round((doneCount / KEGIATAN.length) * 100)

  const status = done
    ? { label: 'Selesai',      color: 'var(--gold)',           bg: 'var(--gold-dim)',        border: 'var(--gold-border)' }
    : anyDone
    ? { label: 'Dalam Proses', color: 'var(--text-secondary)', bg: 'rgba(255,255,255,0.06)', border: 'var(--border)' }
    : { label: 'Belum Mulai',  color: 'var(--text-muted)',     bg: 'rgba(255,255,255,0.03)', border: 'var(--border)' }

  const rowStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '5px 0', borderBottom: '1px solid var(--border)' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)' }}>
      <div className="w-full max-w-2xl max-h-[92vh] flex flex-col rounded-xl overflow-hidden"
        style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)' }}>

        <div className="flex items-start justify-between px-6 py-5 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '22px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.1 }}>
              {record.pihak_pertama || '—'}
            </h2>
            <p className="text-xs mt-1.5" style={{ color: 'var(--text-muted)' }}>
              {companyName || record.company_id} · {record.jenis_akad} · {record.bank}
            </p>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-widest"
              style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
              {status.label}
            </span>
            <button onClick={onClose} className="p-1 rounded text-lg leading-none transition"
              style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>✕</button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5 scrollbar-thin">

          <div className="p-4 rounded-xl" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
            <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-muted)' }}>Progress Kegiatan</p>
              <p className="text-xs font-semibold" style={{ color: 'var(--gold)' }}>{doneCount}/{KEGIATAN.length}</p>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--gold) 0%, rgba(201,168,76,0.6) 100%)' }} />
            </div>
          </div>

          <Section title="Identitas">
            <div style={rowStyle}><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>No</span><span style={{ fontSize: 11, color: 'var(--text-primary)' }}>{record.no || '—'}</span></div>
            <div style={rowStyle}><span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Pihak Kedua</span><span style={{ fontSize: 11, color: 'var(--text-primary)' }}>{record.pihak_kedua || '—'}</span></div>
          </Section>

          <Section title="Akad & Pajak">
            {[
              ['tanggal_pinjam',      'Tanggal Pinjam',      'pdf_pinjam'],
              ['tanggal_diterima',    'Tanggal Diterima',    'pdf_diterima'],
              ['tanggal_bayar_pajak', 'Tanggal Bayar Pajak', 'pdf_bayar_pajak'],
              ['tanggal_akta',        'Tanggal Akta',        null],
            ].map(([k, lbl, pdfKey]) => (
              <div key={k} style={{ ...rowStyle, alignItems: 'flex-start', flexWrap: 'wrap', gap: 4 }}>
                <span style={{ fontSize: 11, color: 'var(--text-muted)', minWidth: 130 }}>{lbl}</span>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                  <span style={{ fontSize: 11, color: record[k] ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {fmtDate(record[k]) || '—'}
                  </span>
                  {pdfKey && <PdfList files={normPdf(record[pdfKey])} />}
                </div>
              </div>
            ))}
          </Section>

          <Section title="Kegiatan">
            <div className="grid grid-cols-2 gap-x-4">
              {KEGIATAN.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between py-1.5" style={{ borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{label}</span>
                  {record[key]
                    ? <span className="flex items-center gap-1 text-[10px] font-medium" style={{ color: 'var(--gold)' }}>✓ {fmtDate(record[key])}</span>
                    : <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Belum</span>}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Selesai & Register">
            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'Selesai', dateKey: 'tanggal_selesai', pdfKey: 'pdf_selesai' },
                { title: 'Register (Penyerahan ke Bank)', dateKey: 'tanggal_register', pdfKey: 'pdf_register' },
              ].map(({ title, dateKey, pdfKey }) => (
                <div key={dateKey} className="p-3 rounded-lg space-y-2" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
                  <p className="text-[10px] uppercase tracking-widest font-semibold" style={{ color: 'var(--gold)', opacity: 0.8 }}>{title}</p>
                  <p style={{ fontSize: 11, color: record[dateKey] ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                    {fmtDate(record[dateKey]) || 'Belum ada tanggal'}
                  </p>
                  <PdfList files={normPdf(record[pdfKey])} />
                </div>
              ))}
            </div>
          </Section>

          {record.keterangan && (
            <Section title="Keterangan">
              <p style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{record.keterangan}</p>
            </Section>
          )}
        </div>

        <div className="flex justify-end px-6 py-4 flex-shrink-0" style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-raised)' }}>
          <button onClick={onClose} className="px-5 py-2 rounded-lg text-sm transition"
            style={{ border: '1px solid var(--border-strong)', color: 'var(--text-secondary)', background: 'transparent' }}>
            Tutup
          </button>
        </div>
      </div>
    </div>
  )
}