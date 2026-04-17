import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LayoutDashboard, FileText, Building2, Users, Scale, X } from 'lucide-react'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/documents', label: 'Dokumen', icon: FileText },
  { to: '/companies', label: 'Perusahaan', icon: Building2 },
]
const ADMIN_NAV = [{ to: '/users', label: 'Pengguna', icon: Users }]

export function Sidebar({ open, onClose }) {
  const { userProfile, isAdmin } = useAuth()

  return (
    <aside
      style={{
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        transition: 'transform 0.3s ease',
      }}
      className={`fixed inset-y-0 left-0 z-30 w-60 flex flex-col
        lg:relative lg:translate-x-0 lg:z-auto
        ${open ? 'translate-x-0' : '-translate-x-full'}`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-5 py-5" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: 'var(--gold-dim)', border: '1px solid var(--gold-border)' }}>
            <Scale className="h-4 w-4" style={{ color: 'var(--gold)' }} />
          </div>
          <div>
            <p className="text-sm font-bold leading-none" style={{ color: 'var(--text-primary)', fontFamily: "'Cormorant Garamond', serif", fontSize: '16px' }}>
              DocuMonitor
            </p>
            <p className="text-[9px] uppercase tracking-widest mt-0.5" style={{ color: 'var(--text-muted)' }}>
              Legal Tracker
            </p>
          </div>
        </div>
        <button onClick={onClose} className="lg:hidden p-1 rounded" style={{ color: 'var(--text-muted)' }}>
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* User */}
      <div className="mx-4 my-4 rounded-xl px-3.5 py-3" style={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'var(--gold-dim)', color: 'var(--gold)' }}>
            {(userProfile?.name || userProfile?.email || 'U')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium truncate" style={{ color: '#ffffff' }}>
              {userProfile?.name || userProfile?.email}
            </p>
            <p className="text-[10px] uppercase tracking-wider mt-0.5" style={{ color: 'var(--gold)', opacity: 0.8 }}>
              {userProfile?.role}
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        <p className="text-[9px] uppercase tracking-widest px-3 pb-2 pt-1" style={{ color: 'var(--text-muted)' }}>Menu</p>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${isActive ? 'active-nav' : ''}`
            }
            style={({ isActive }) => isActive
              ? { background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--gold-border)' }
              : { color: '#bbbbbb', border: '1px solid transparent' }
            }
          >
            {({ isActive }) => (
              <>
                <Icon className="h-4 w-4 flex-shrink-0" style={isActive ? { color: 'var(--gold)' } : {}} />
                {label}
              </>
            )}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <p className="text-[9px] uppercase tracking-widest px-3 pb-2 pt-5" style={{ color: 'var(--text-muted)' }}>Admin</p>
            {ADMIN_NAV.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} onClick={onClose}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all"
                style={({ isActive }) => isActive
                  ? { background: 'var(--gold-dim)', color: 'var(--gold)', border: '1px solid var(--gold-border)' }
                  : { color: '#bbbbbb', border: '1px solid transparent' }
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon className="h-4 w-4 flex-shrink-0" style={isActive ? { color: 'var(--gold)' } : {}} />
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div className="px-5 py-4" style={{ borderTop: '1px solid var(--border)' }}>
        <p className="text-center text-[10px]" style={{ color: 'var(--text-muted)' }}>
          DocuMonitor v1.0
        </p>
      </div>
    </aside>
  )
}
