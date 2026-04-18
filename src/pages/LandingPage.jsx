import logoSrc from '../assets/logo.png'

const SERVICES = [
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
    title: 'Akta Jual Beli',
    desc: 'Pembuatan akta jual beli tanah dan bangunan yang sah secara hukum.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z" />
      </svg>
    ),
    title: 'Balik Nama Sertifikat',
    desc: 'Proses peralihan hak atas tanah dan pendaftaran ke Badan Pertanahan Nasional.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" />
      </svg>
    ),
    title: 'PPAT',
    desc: 'Pejabat Pembuat Akta Tanah resmi untuk segala transaksi properti.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    ),
    title: 'Akta Wasiat & Hibah',
    desc: 'Pembuatan akta wasiat, hibah, dan pembagian harta warisan secara resmi.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
      </svg>
    ),
    title: 'Akta Pendirian PT / CV',
    desc: 'Pembuatan dan pengesahan akta badan hukum perusahaan.',
  },
  {
    icon: (
      <svg width="22" height="22" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
      </svg>
    ),
    title: 'Kredit & Roya',
    desc: 'Pengurusan akad kredit perbankan dan roya (pencoretan) hak tanggungan.',
  },
]

const STEPS = [
  { num:'01', title:'Konsultasi', desc:'Hubungi kami untuk konsultasi awal mengenai kebutuhan dokumen legal Anda.' },
  { num:'02', title:'Persiapan Dokumen', desc:'Tim kami memandu kelengkapan berkas dan persyaratan yang diperlukan.' },
  { num:'03', title:'Proses Akta', desc:'Penandatanganan akta di hadapan Notaris/PPAT sesuai ketentuan hukum.' },
  { num:'04', title:'Penyelesaian', desc:'Dokumen resmi diterbitkan dan diserahkan kepada para pihak.' },
]

export default function LandingPage() {
  return (
    <div style={{ fontFamily:"'Libre Baskerville', Georgia, serif", background:'#0A1628', color:'#E8E0D0', minHeight:'100vh', overflowX:'hidden' }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Cinzel:wght@400;500;600&display=swap');

        :root {
          --navy:  #0A1628;
          --navy-2:#0F1F38;
          --navy-3:#162844;
          --navy-4:#1E3254;
          --gold:  #C9991A;
          --gold-light: #E2B84A;
          --gold-dim:   rgba(201,153,26,0.12);
          --gold-border:rgba(201,153,26,0.28);
          --text: #E8E0D0;
          --text-dim:   rgba(232,224,208,0.6);
          --text-muted: rgba(232,224,208,0.35);
          --border: rgba(201,153,26,0.15);
        }
        * { box-sizing:border-box; margin:0; padding:0; }
        .lp-cinzel     { font-family:'Cinzel', serif; }
        .lp-cormorant  { font-family:'Cormorant Garamond', serif; }
        .lp-baskerville{ font-family:'Libre Baskerville', Georgia, serif; }

        @keyframes lp-fadeUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes lp-shimmer {
          0%,100% { opacity:0.4; }
          50%     { opacity:0.9; }
        }
        .lp-anim-1 { animation: lp-fadeUp 0.8s 0.10s ease both; }
        .lp-anim-2 { animation: lp-fadeUp 0.8s 0.25s ease both; }
        .lp-anim-3 { animation: lp-fadeUp 0.8s 0.40s ease both; }
        .lp-anim-4 { animation: lp-fadeUp 0.8s 0.55s ease both; }
        .lp-anim-5 { animation: lp-fadeUp 0.8s 0.70s ease both; }

        .lp-service-card {
          background: var(--navy-2);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 28px 24px;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .lp-service-card::before {
          content:'';
          position:absolute; top:0; left:0; right:0;
          height:2px;
          background:linear-gradient(90deg, transparent, var(--gold), transparent);
          opacity:0; transition:opacity 0.25s;
        }
        .lp-service-card:hover { border-color:var(--gold-border); transform:translateY(-3px); box-shadow:0 12px 40px rgba(0,0,0,0.4); }
        .lp-service-card:hover::before { opacity:1; }

        .lp-btn-primary {
          display:inline-flex; align-items:center; gap:8px;
          background:var(--gold); color:#0A1628;
          font-family:'Cinzel', serif; font-size:11px; font-weight:600;
          letter-spacing:0.12em; text-transform:uppercase;
          padding:13px 28px; border-radius:4px;
          text-decoration:none; border:none; cursor:pointer;
          transition:all 0.2s;
        }
        .lp-btn-primary:hover { background:var(--gold-light); box-shadow:0 6px 24px rgba(201,153,26,0.35); }

        .lp-btn-ghost {
          display:inline-flex; align-items:center; gap:8px;
          background:transparent; color:var(--gold);
          font-family:'Cinzel', serif; font-size:11px; font-weight:600;
          letter-spacing:0.12em; text-transform:uppercase;
          padding:12px 28px; border-radius:4px;
          border:1px solid var(--gold-border);
          text-decoration:none; cursor:pointer;
          transition:all 0.2s;
        }
        .lp-btn-ghost:hover { background:var(--gold-dim); border-color:var(--gold); }

        .lp-divider      { width:48px; height:2px; background:var(--gold); margin:0 auto 20px; }
        .lp-divider-left { width:48px; height:2px; background:var(--gold); margin-bottom:16px; }

        .lp-ornament { display:flex; align-items:center; gap:12px; justify-content:center; margin-bottom:12px; }
        .lp-ornament-line { flex:1; max-width:60px; height:1px; background:linear-gradient(90deg,transparent,var(--gold)); }
        .lp-ornament-line.right { background:linear-gradient(90deg,var(--gold),transparent); }
        .lp-ornament-diamond { width:6px; height:6px; background:var(--gold); transform:rotate(45deg); flex-shrink:0; }

        @media (max-width: 768px) {
          .lp-tentang-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .lp-hero-name   { font-size:30px !important; }
          .lp-services-grid { grid-template-columns:1fr !important; }
          .lp-steps-grid  { grid-template-columns:1fr 1fr !important; }
          .lp-contact-grid{ grid-template-columns:1fr !important; }
          .lp-hero-btns   { flex-direction:column; align-items:stretch !important; }
          .lp-hero-btns a { text-align:center; justify-content:center; }
        }
        @media (max-width: 400px) {
          .lp-steps-grid { grid-template-columns:1fr !important; }
        }
      `}</style>

      {/* ══════════ NAVBAR ══════════ */}
      <nav style={{ position:'fixed', top:0, left:0, right:0, zIndex:100, background:'rgba(10,22,40,0.93)', backdropFilter:'blur(12px)', borderBottom:'1px solid var(--border)', padding:'0 5%' }}>
        <div style={{ maxWidth:1200, margin:'0 auto', display:'flex', alignItems:'center', height:64 }}>
          {/* Logo + nama — centered di mobile, left di desktop */}
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <img src={logoSrc} alt="Logo Notaris" style={{ height:40, width:'auto', objectFit:'contain' }} />
            <div>
              <p className="lp-cinzel" style={{ fontSize:11, fontWeight:600, color:'var(--gold)', letterSpacing:'0.08em', lineHeight:1 }}>YUSEF HUDAYA, SH., MKn</p>
              <p style={{ fontSize:8, color:'var(--text-muted)', letterSpacing:'0.14em', textTransform:'uppercase', marginTop:3 }}>Notaris &amp; PPAT</p>
            </div>
          </div>
        </div>
      </nav>

      {/* ══════════ HERO ══════════ */}
      <section style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', position:'relative', padding:'120px 5% 80px', overflow:'hidden' }}>

        {/* Background radial glow */}
        <div style={{ position:'absolute', top:'30%', left:'50%', transform:'translate(-50%,-50%)', width:700, height:700, borderRadius:'50%', background:'radial-gradient(circle, rgba(201,153,26,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />

        {/* Corner brackets */}
        <div style={{ position:'absolute', top:80, left:'5%', width:60, height:60, borderTop:'1px solid var(--gold-border)', borderLeft:'1px solid var(--gold-border)', opacity:0.6 }} />
        <div style={{ position:'absolute', top:80, right:'5%', width:60, height:60, borderTop:'1px solid var(--gold-border)', borderRight:'1px solid var(--gold-border)', opacity:0.6 }} />
        <div style={{ position:'absolute', bottom:40, left:'5%', width:60, height:60, borderBottom:'1px solid var(--gold-border)', borderLeft:'1px solid var(--gold-border)', opacity:0.6 }} />
        <div style={{ position:'absolute', bottom:40, right:'5%', width:60, height:60, borderBottom:'1px solid var(--gold-border)', borderRight:'1px solid var(--gold-border)', opacity:0.6 }} />

        <div style={{ maxWidth:800, width:'100%', textAlign:'center', position:'relative' }}>

          {/* Logo besar */}
          <div className="lp-anim-1" style={{ marginBottom:28 }}>
            <img src={logoSrc} alt="Logo Notaris Yusef Hudaya" style={{ height:110, width:'auto', margin:'0 auto', display:'block', objectFit:'contain', filter:'drop-shadow(0 4px 24px rgba(201,153,26,0.25))' }} />
          </div>

          {/* Ornament */}
          <div className="lp-ornament lp-anim-1">
            <div className="lp-ornament-line" />
            <div className="lp-ornament-diamond" />
            <div className="lp-ornament-diamond" style={{ opacity:0.5, transform:'rotate(45deg) scale(0.6)' }} />
            <div className="lp-ornament-diamond" />
            <div className="lp-ornament-line right" />
          </div>

          <p className="lp-cinzel lp-anim-1" style={{ fontSize:10, letterSpacing:'0.24em', color:'var(--gold)', textTransform:'uppercase', marginBottom:16 }}>
            Monitoring Kantor Notaris / PPAT
          </p>

          <h1 className="lp-cormorant lp-anim-2 lp-hero-name" style={{ fontSize:46, fontWeight:600, color:'#FFFFFF', lineHeight:1.15, marginBottom:8, letterSpacing:'0.02em' }}>
            YUSEF HUDAYA, SH., MKn
          </h1>

          <p className="lp-anim-2" style={{ fontSize:12, color:'var(--text-muted)', letterSpacing:'0.20em', textTransform:'uppercase', marginBottom:32 }}>
            Notaris &nbsp;·&nbsp; Pejabat Pembuat Akta Tanah
          </p>

          <p className="lp-baskerville lp-anim-3" style={{ fontSize:15, color:'var(--text-dim)', lineHeight:1.9, maxWidth:560, margin:'0 auto 40px' }}>
            Memberikan layanan hukum yang profesional, terpercaya, dan akurat dalam setiap transaksi properti dan pembuatan akta di Indonesia.
          </p>

          <div className="lp-hero-btns lp-anim-4" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:14, flexWrap:'wrap' }}>
            <a href="#layanan" className="lp-btn-primary">
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              Layanan Kami
            </a>
            <a href="#kontak" className="lp-btn-ghost">Hubungi Kami</a>
          </div>

          {/* Scroll indicator */}
          <div className="lp-anim-5" style={{ marginTop:60, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
            <p style={{ fontSize:9, letterSpacing:'0.18em', color:'var(--text-muted)', textTransform:'uppercase' }}>Scroll</p>
            <div style={{ width:1, height:32, background:'linear-gradient(to bottom, var(--gold), transparent)', animation:'lp-shimmer 2s ease infinite' }} />
          </div>
        </div>
      </section>

      {/* ══════════ TENTANG ══════════ */}
      <section style={{ background:'var(--navy-2)', padding:'80px 5%', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
        <div className="lp-tentang-grid" style={{ maxWidth:1100, margin:'0 auto', display:'grid', gridTemplateColumns:'1fr 1fr', gap:60, alignItems:'center' }}>
          <div>
            <div className="lp-ornament" style={{ justifyContent:'flex-start', marginBottom:16 }}>
              <div className="lp-ornament-line" style={{ maxWidth:36, background:'var(--gold)' }} />
              <div className="lp-ornament-diamond" />
            </div>
            <p className="lp-cinzel" style={{ fontSize:10, letterSpacing:'0.20em', color:'var(--gold)', textTransform:'uppercase', marginBottom:14 }}>Tentang Kantor</p>
            <h2 className="lp-cormorant" style={{ fontSize:38, fontWeight:600, color:'#FFFFFF', lineHeight:1.2, marginBottom:20 }}>
              Keahlian &amp; Integritas<br /><em>dalam Setiap Akta</em>
            </h2>
            <div className="lp-divider-left" />
            <p className="lp-baskerville" style={{ fontSize:14, color:'var(--text-dim)', lineHeight:1.9, marginBottom:16 }}>
              Kantor Notaris/PPAT Yusef Hudaya, SH., MKn hadir untuk memenuhi kebutuhan hukum masyarakat dengan pelayanan yang cermat, profesional, dan berpegang pada nilai kejujuran.
            </p>
            <p className="lp-baskerville" style={{ fontSize:14, color:'var(--text-dim)', lineHeight:1.9 }}>
              Dengan pengalaman di bidang pertanahan dan dokumen hukum, kami siap mendampingi setiap klien dalam proses yang aman dan sesuai regulasi berlaku.
            </p>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {[
              { num:'100%', label:'Legalitas Terjamin' },
              { num:'≤7 Hari', label:'Proses Cepat' },
              { num:'Resmi', label:'Notaris & PPAT Tersertifikasi' },
              { num:'24 Jam', label:'Konsultasi Tersedia' },
            ].map(({ num, label }) => (
              <div key={label} style={{ background:'var(--navy-3)', border:'1px solid var(--border)', borderRadius:8, padding:'22px 18px', textAlign:'center' }}>
                <p className="lp-cormorant" style={{ fontSize:26, fontWeight:700, color:'var(--gold-light)', lineHeight:1, marginBottom:8 }}>{num}</p>
                <p style={{ fontSize:11, color:'var(--text-muted)', letterSpacing:'0.04em', lineHeight:1.4 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ LAYANAN ══════════ */}
      <section id="layanan" style={{ padding:'80px 5%' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <div className="lp-ornament"><div className="lp-ornament-line"/><div className="lp-ornament-diamond"/><div className="lp-ornament-line right"/></div>
            <p className="lp-cinzel" style={{ fontSize:10, letterSpacing:'0.20em', color:'var(--gold)', textTransform:'uppercase', marginBottom:12 }}>Bidang Layanan</p>
            <h2 className="lp-cormorant" style={{ fontSize:38, fontWeight:600, color:'#FFFFFF', lineHeight:1.2 }}>Layanan Notaris &amp; PPAT</h2>
            <div className="lp-divider" style={{ marginTop:16 }} />
          </div>
          <div className="lp-services-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:20 }}>
            {SERVICES.map(({ icon, title, desc }) => (
              <div key={title} className="lp-service-card">
                <div style={{ width:44, height:44, borderRadius:6, background:'var(--gold-dim)', border:'1px solid var(--gold-border)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--gold)', marginBottom:16 }}>
                  {icon}
                </div>
                <h3 className="lp-cormorant" style={{ fontSize:20, fontWeight:600, color:'#FFFFFF', marginBottom:8 }}>{title}</h3>
                <p style={{ fontSize:13, color:'var(--text-dim)', lineHeight:1.75 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ PROSES ══════════ */}
      <section style={{ background:'var(--navy-2)', padding:'80px 5%', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <div className="lp-ornament"><div className="lp-ornament-line"/><div className="lp-ornament-diamond"/><div className="lp-ornament-line right"/></div>
            <p className="lp-cinzel" style={{ fontSize:10, letterSpacing:'0.20em', color:'var(--gold)', textTransform:'uppercase', marginBottom:12 }}>Alur Layanan</p>
            <h2 className="lp-cormorant" style={{ fontSize:38, fontWeight:600, color:'#FFFFFF' }}>Bagaimana Prosesnya?</h2>
            <div className="lp-divider" style={{ marginTop:16 }} />
          </div>
          <div className="lp-steps-grid" style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:24, position:'relative' }}>
            <div style={{ position:'absolute', top:28, left:'12.5%', right:'12.5%', height:1, background:'linear-gradient(90deg, var(--gold), rgba(201,153,26,0.2))', zIndex:0 }} />
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} style={{ textAlign:'center', position:'relative', zIndex:1 }}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:'var(--navy-3)', border:'1.5px solid var(--gold-border)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px' }}>
                  <span className="lp-cinzel" style={{ fontSize:13, fontWeight:600, color:'var(--gold)' }}>{num}</span>
                </div>
                <h4 className="lp-cormorant" style={{ fontSize:20, fontWeight:600, color:'#FFFFFF', marginBottom:8 }}>{title}</h4>
                <p style={{ fontSize:12, color:'var(--text-dim)', lineHeight:1.75 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════ KONTAK ══════════ */}
      <section id="kontak" style={{ padding:'80px 5%' }}>
        <div style={{ maxWidth:1100, margin:'0 auto' }}>
          <div style={{ textAlign:'center', marginBottom:52 }}>
            <div className="lp-ornament"><div className="lp-ornament-line"/><div className="lp-ornament-diamond"/><div className="lp-ornament-line right"/></div>
            <p className="lp-cinzel" style={{ fontSize:10, letterSpacing:'0.20em', color:'var(--gold)', textTransform:'uppercase', marginBottom:12 }}>Hubungi Kami</p>
            <h2 className="lp-cormorant" style={{ fontSize:38, fontWeight:600, color:'#FFFFFF' }}>Informasi Kantor</h2>
            <div className="lp-divider" style={{ marginTop:16 }} />
          </div>

          <div className="lp-contact-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:40, alignItems:'start' }}>
            {/* Info kontak */}
            <div style={{ background:'var(--navy-2)', border:'1px solid var(--border)', borderRadius:12, padding:36 }}>
              <h3 className="lp-cormorant" style={{ fontSize:26, fontWeight:600, color:'#FFFFFF', marginBottom:24 }}>
                Kantor Notaris/PPAT<br /><em style={{ color:'var(--gold-light)' }}>Yusef Hudaya, SH., MKn</em>
              </h3>
              <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                {[
                  {
                    icon:<svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>,
                    label:'Alamat', value:'Jl. [Alamat Kantor], [Kota], Indonesia',
                  },
                  {
                    icon:<svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z"/></svg>,
                    label:'Telepon', value:'(021) XXX-XXXX',
                  },
                  {
                    icon:<svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"/></svg>,
                    label:'Email', value:'notaris@yusefhudaya.com',
                  },
                  {
                    icon:<svg width="17" height="17" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
                    label:'Jam Kerja', value:'Senin – Jumat, 08.00 – 17.00 WIB',
                  },
                ].map(({ icon, label, value }) => (
                  <div key={label} style={{ display:'flex', gap:14, alignItems:'flex-start' }}>
                    <div style={{ width:36, height:36, borderRadius:6, background:'var(--gold-dim)', border:'1px solid var(--gold-border)', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--gold)', flexShrink:0 }}>
                      {icon}
                    </div>
                    <div>
                      <p style={{ fontSize:10, letterSpacing:'0.10em', color:'var(--text-muted)', textTransform:'uppercase', marginBottom:3 }}>{label}</p>
                      <p style={{ fontSize:14, color:'var(--text)', lineHeight:1.5 }}>{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* CTA WhatsApp */}
            <div style={{ background:'linear-gradient(135deg, var(--navy-3), var(--navy-4))', border:'1px solid var(--gold-border)', borderRadius:12, padding:36, textAlign:'center' }}>
              <div style={{ width:64, height:64, borderRadius:'50%', background:'var(--gold-dim)', border:'1.5px solid var(--gold-border)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', color:'var(--gold)' }}>
                <svg width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"/>
                </svg>
              </div>
              <h3 className="lp-cormorant" style={{ fontSize:26, fontWeight:600, color:'#FFFFFF', marginBottom:12 }}>Konsultasi Gratis</h3>
              <p className="lp-baskerville" style={{ fontSize:14, color:'var(--text-dim)', lineHeight:1.8, marginBottom:28 }}>
                Tidak yakin dokumen apa yang dibutuhkan?<br />Hubungi kami untuk konsultasi awal tanpa biaya.
              </p>
              <a href="https://wa.me/62XXXXXXXXXX" className="lp-btn-primary" style={{ width:'100%', justifyContent:'center' }}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.555 4.126 1.527 5.857L.057 23.882l6.197-1.448A11.938 11.938 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.805 9.805 0 01-5.003-1.368l-.36-.214-3.72.87.936-3.416-.235-.373A9.776 9.776 0 012.182 12C2.182 6.573 6.573 2.182 12 2.182c5.428 0 9.818 4.39 9.818 9.818 0 5.427-4.39 9.818-9.818 9.818z"/>
                </svg>
                WhatsApp Kami
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════ FOOTER ══════════ */}
      <footer style={{ background:'var(--navy-2)', borderTop:'1px solid var(--border)', padding:'28px 5%' }}>
        <div style={{ maxWidth:1100, margin:'0 auto', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            <img src={logoSrc} alt="Logo" style={{ height:32, width:'auto', objectFit:'contain', opacity:0.85 }} />
            <div>
              <p className="lp-cinzel" style={{ fontSize:11, fontWeight:600, color:'var(--gold)', letterSpacing:'0.08em' }}>YUSEF HUDAYA, SH., MKn</p>
              <p style={{ fontSize:10, color:'var(--text-muted)', marginTop:2 }}>Notaris &amp; Pejabat Pembuat Akta Tanah</p>
            </div>
          </div>
          <div className="lp-ornament" style={{ margin:0 }}>
            <div className="lp-ornament-line" style={{ maxWidth:24 }} />
            <div className="lp-ornament-diamond" style={{ width:4, height:4 }} />
            <div className="lp-ornament-line right" style={{ maxWidth:24 }} />
          </div>
          <p style={{ fontSize:11, color:'var(--text-muted)' }}>© {new Date().getFullYear()} Monitoring Kantor Notaris/PPAT Yusef Hudaya</p>
        </div>
      </footer>

    </div>
  )
}
