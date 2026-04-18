import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import logoSrc from '../assets/logo.png'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  async function onSubmit(data) {
    setLoading(true)
    try {
      await login(data.email, data.password)
      await new Promise(r => setTimeout(r, 300))
      toast.success('Selamat datang kembali!')
      navigate('/dashboard')
    } catch (err) {
      const msg = err.message?.includes('Invalid login credentials') ? 'Email atau password salah'
        : err.message?.includes('Email not confirmed') ? 'Cek email untuk konfirmasi akun'
        : 'Login gagal. Periksa kredensial Anda.'
      toast.error(msg)
    } finally { setLoading(false) }
  }

  const iStyle = (err) => ({
    width: '100%', background: 'var(--bg-raised)', padding: '11px 14px',
    border: `1px solid ${err ? 'var(--red)' : 'var(--border-mid)'}`,
    borderRadius: 8, fontSize: 13, color: 'var(--text-primary)', outline: 'none',
    fontFamily: "'Outfit', sans-serif", transition: 'border-color 0.15s',
  })

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--navy-900)' }}>

      {/* ── Left panel ── */}
      <div className="hidden lg:flex" style={{ width: 420, flexShrink: 0, flexDirection: 'column', justifyContent: 'space-between', background: 'var(--navy-800)', borderRight: '1px solid var(--border-mid)', padding: '52px 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 30% 70%, rgba(201,153,26,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: 0, right: 0, width: 280, height: 280, borderRadius: '50%', background: 'rgba(201,153,26,0.04)', filter: 'blur(60px)', pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          {/* Logo + nama */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 56 }}>
            <img
              src={logoSrc}
              alt="Logo Notaris"
              style={{ height: 52, width: 'auto', objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 2px 8px rgba(201,153,26,0.2))' }}
            />
            <div>
              <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                Monitoring Kantor<br />Notaris/PPAT
              </p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 4 }}>
                Yusef Hudaya, SH., MKn
              </p>
            </div>
          </div>

          <div style={{ width: 36, height: 2, background: 'var(--gold-400)', marginBottom: 20, borderRadius: 1 }} />
          <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: 34, fontWeight: 400, color: 'var(--text-primary)', lineHeight: 1.3, marginBottom: 16 }}>
            Sistem Monitoring<br /><em style={{ color: 'var(--gold-300)' }}>Dokumen Legal</em>
          </h2>
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            Pantau, kelola, dan lacak seluruh dokumen hukum Anda dalam satu platform terpadu.
          </p>
        </div>

        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase', position: 'relative' }}>
          Powered by runnrobbot
        </p>
      </div>

      {/* ── Right panel ── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '48px 48px', opacity: 0.4, pointerEvents: 'none' }} />

        <div className="fade-up" style={{ width: '100%', maxWidth: 380, position: 'relative' }}>
          <div style={{ borderRadius: 14, padding: '36px 32px', background: 'var(--bg-surface)', border: '1px solid var(--border-mid)', boxShadow: 'var(--shadow-lg)' }}>

            {/* Mobile header — logo + nama */}
            <div className="lg:hidden" style={{ textAlign: 'center', marginBottom: 28 }}>
              <img
                src={logoSrc}
                alt="Logo Notaris"
                style={{ height: 56, width: 'auto', objectFit: 'contain', margin: '0 auto 12px', display: 'block', filter: 'drop-shadow(0 2px 8px rgba(201,153,26,0.2))' }}
              />
              <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.3 }}>
                Monitoring Kantor<br />Notaris/PPAT
              </p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 6 }}>
                Yusef Hudaya, SH., MKn
              </p>
            </div>

            <h2 style={{ fontFamily: "'EB Garamond', serif", fontSize: 24, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>Masuk</h2>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 24 }}>Masukkan kredensial Anda untuk melanjutkan</p>
            <div style={{ height: 1, background: 'linear-gradient(90deg, var(--gold-border), transparent)', marginBottom: 24 }} />

            <form onSubmit={handleSubmit(onSubmit)}>
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.03em' }}>Email</label>
                <input type="email" autoComplete="email" placeholder="admin@company.com" style={iStyle(errors.email)}
                  onFocus={e => { if (!errors.email) e.target.style.borderColor = 'var(--gold-border)' }}
                  onBlur={e => { if (!errors.email) e.target.style.borderColor = 'var(--border-mid)' }}
                  {...register('email', { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })} />
                {errors.email && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>Email tidak valid</p>}
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 6, letterSpacing: '0.03em' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input type={showPw ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••"
                    style={{ ...iStyle(errors.password), paddingRight: 42 }}
                    onFocus={e => { if (!errors.password) e.target.style.borderColor = 'var(--gold-border)' }}
                    onBlur={e => { if (!errors.password) e.target.style.borderColor = 'var(--border-mid)' }}
                    {...register('password', { required: true, minLength: 6 })} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 0 }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--gold-400)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && <p style={{ fontSize: 11, color: 'var(--red)', marginTop: 4 }}>Password minimal 6 karakter</p>}
              </div>

              <button type="submit" disabled={loading}
                style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '12px', borderRadius: 8, border: 'none', background: loading ? 'var(--navy-600)' : 'var(--gold-500)', color: loading ? 'var(--text-muted)' : 'var(--navy-900)', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.15s', letterSpacing: '0.02em' }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--gold-400)' }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.background = 'var(--gold-500)' }}>
                {loading ? <><Loader2 size={16} className="animate-spin" /> Masuk…</> : 'Masuk'}
              </button>
            </form>

            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, color: 'var(--text-muted)', textAlign: 'center', marginTop: 20, letterSpacing: '0.06em' }}>
              Hubungi administrator untuk mendapatkan akses
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
