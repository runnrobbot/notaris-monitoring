import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Menu, LogOut } from 'lucide-react'
import toast from 'react-hot-toast'

const TITLES = {
  '/dashboard': 'Dashboard',
  '/documents': 'Monitoring Dokumen',
  '/companies': 'Perusahaan',
  '/users': 'Manajemen Pengguna',
}

export function Navbar({ onMenuClick }) {
  const { logout, userProfile } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const title = TITLES[location.pathname] || 'Monitoring Notaris/PPAT'

  async function handleLogout() {
    try { await logout(); navigate('/login'); toast.success('Berhasil keluar') }
    catch { toast.error('Gagal logout') }
  }

  return (
    <header style={{ display: 'flex', height: 52, alignItems: 'center', justifyContent: 'space-between', padding: '0 24px', flexShrink: 0, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-mid)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button onClick={onMenuClick} className="lg:hidden" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4 }}>
          <Menu size={20} />
        </button>
        <h1 style={{ fontFamily: "'EB Garamond', serif", fontSize: 20, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1 }}>{title}</h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div className="hidden sm:block" style={{ textAlign: 'right' }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{userProfile?.name || userProfile?.email}</p>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.10em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginTop: 1 }}>{userProfile?.role}</p>
        </div>
        <div className="hidden sm:block" style={{ width: 1, height: 24, background: 'var(--border-mid)' }} />
        <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 7, border: '1px solid var(--border-mid)', background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--bg-raised)'; e.currentTarget.style.color = 'var(--text-primary)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)' }}>
          <LogOut size={14} />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  )
}
