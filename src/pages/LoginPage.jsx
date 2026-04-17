import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../contexts/AuthContext'
import { Scale, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPw, setShowPw]   = useState(false)
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm()

  async function onSubmit(data) {
    setLoading(true)
    try {
      await login(data.email, data.password)
      // Tunggu sebentar biar onAuthStateChange + fetchUserProfile selesai
      // sebelum navigate, supaya ProtectedRoute tidak lihat loading=true
      await new Promise(r => setTimeout(r, 300))
      toast.success('Selamat datang kembali!')
      navigate('/dashboard')
    } catch (err) {
      const msg =
        err.message?.includes('Invalid login credentials')
          ? 'Email atau password salah'
          : err.message?.includes('Email not confirmed')
          ? 'Cek email untuk konfirmasi akun'
          : 'Login gagal. Periksa kredensial Anda.'
      toast.error(msg)
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)',
        backgroundSize: '48px 48px',
        opacity: 0.4,
      }} />

      <div className="relative w-full max-w-sm">
        <div className="rounded-2xl p-8" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-strong)' }}>

          <div className="text-center mb-8">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl"
              style={{ background: 'var(--gold-dim)', border: '1px solid var(--gold-border)' }}>
              <Scale className="h-7 w-7" style={{ color: 'var(--gold)' }} />
            </div>
            <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '28px', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>
              DocuMonitor
            </h1>
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>Legal Document Tracking System</p>
          </div>

          <div className="mb-6 h-px" style={{ background: 'linear-gradient(90deg, transparent, var(--gold-border), transparent)' }} />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 6 }}>
                Email
              </label>
              <input type="email" autoComplete="email" placeholder="admin@company.com"
                style={{
                  width: '100%', background: 'var(--bg-raised)', padding: '10px 14px',
                  border: errors.email ? '1px solid #e05252' : '1px solid var(--border-strong)',
                  borderRadius: 8, fontSize: 13, color: 'var(--text-primary)', outline: 'none',
                }}
                {...register('email', { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ })}
              />
              {errors.email && <p style={{ fontSize: 11, color: '#e05252', marginTop: 4 }}>Email tidak valid</p>}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 6 }}>
                Password
              </label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} autoComplete="current-password" placeholder="••••••••"
                  style={{
                    width: '100%', background: 'var(--bg-raised)', padding: '10px 40px 10px 14px',
                    border: errors.password ? '1px solid #e05252' : '1px solid var(--border-strong)',
                    borderRadius: 8, fontSize: 13, color: 'var(--text-primary)', outline: 'none',
                  }}
                  {...register('password', { required: true, minLength: 6 })}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition"
                  style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer' }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: 11, color: '#e05252', marginTop: 4 }}>Password minimal 6 karakter</p>}
            </div>

            <button type="submit" disabled={loading}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold transition-all uppercase tracking-wider"
              style={{
                background: 'var(--gold-dim)', color: 'var(--gold)',
                border: '1px solid var(--gold-border)', opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'rgba(201,168,76,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--gold-dim)' }}>
              {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Masuk…</> : 'Masuk'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
            Hubungi administrator untuk mendapatkan akses
          </p>
        </div>

        <p className="mt-4 text-center text-xs" style={{ color: 'var(--text-muted)', opacity: 0.5 }}>
          DocuMonitor · Powered by Supabase
        </p>
      </div>
    </div>
  )
}
