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
  const title = TITLES[location.pathname] || 'DocuMonitor'

  async function handleLogout() {
    try {
      await logout()
      navigate('/login')
      toast.success('Berhasil keluar')
    } catch {
      toast.error('Gagal logout')
    }
  }

  return (
    <header
      className="flex h-14 items-center justify-between px-4 md:px-6 flex-shrink-0"
      style={{
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      <div className="flex items-center gap-3">
        <button onClick={onMenuClick} className="lg:hidden p-1.5 rounded-lg transition"
          style={{ color: 'var(--text-secondary)' }}>
          <Menu className="h-5 w-5" />
        </button>
        <h1 style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '20px',
          fontWeight: 600,
          color: 'var(--text-primary)',
          lineHeight: 1,
        }}>
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden sm:block text-right">
          <p className="text-xs font-medium" style={{ color: 'var(--text-primary)' }}>
            {userProfile?.name || userProfile?.email}
          </p>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: 'var(--gold)', opacity: 0.8 }}>
            {userProfile?.role}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition"
          style={{
            color: 'var(--text-secondary)',
            border: '1px solid var(--border-strong)',
            background: 'var(--bg-raised)',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  )
}
