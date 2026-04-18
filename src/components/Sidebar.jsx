import { NavLink } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { LayoutDashboard, FileText, Building2, Users, X, Trash2 } from 'lucide-react'
import logoSrc from '../assets/logo.png'

const NAV = [
  { to: '/dashboard', label: 'Dashboard',  icon: LayoutDashboard },
  { to: '/documents', label: 'Dokumen',    icon: FileText },
  { to: '/companies', label: 'Perusahaan', icon: Building2 },
  { to: '/trash',     label: 'Sampah',     icon: Trash2 },
]
const ADMIN_NAV = [{ to: '/users', label: 'Pengguna', icon: Users }]

export function Sidebar({ open, onClose }) {
  const { userProfile, isAdmin } = useAuth()

  return (
    <aside
      style={{
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-mid)',
        width: '15rem',
        flexShrink: 0,
        transition: 'transform 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
      className={`fixed inset-y-0 left-0 z-30 lg:relative lg:translate-x-0 lg:z-auto ${open ? 'translate-x-0' : '-translate-x-full'}`}
    >
      {/* ── Logo ── */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
            <img
              src={logoSrc}
              alt="Logo"
              style={{ height: 38, width: 'auto', objectFit: 'contain', flexShrink: 0, filter: 'drop-shadow(0 1px 4px rgba(201,153,26,0.18))' }}
            />
            <div style={{ minWidth: 0 }}>
              <p style={{ fontFamily: "'EB Garamond', serif", fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Monitoring Notaris/PPAT
              </p>
              <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 8, letterSpacing: '0.12em', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                Yusef Hudaya, SH., MKn
              </p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, flexShrink: 0 }}>
            <X size={16} />
          </button>
        </div>
      </div>

      {/* ── User ── */}
      <div style={{ margin: '12px 14px', borderRadius: 10, padding: '10px 14px', background: 'var(--bg-raised)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--gold-dim)', border: '1.5px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'EB Garamond', serif", fontSize: 16, fontWeight: 700, color: 'var(--gold-400)', flexShrink: 0 }}>
            {(userProfile?.name || userProfile?.email || 'U')[0].toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {userProfile?.name || userProfile?.email}
            </p>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.10em', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', marginTop: 1 }}>
              {userProfile?.role}
            </p>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: '4px 10px' }}>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '8px 10px 6px' }}>Menu</p>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} onClick={onClose}
            className={({ isActive }) => isActive ? 'nav-active' : ''}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 10, borderRadius: 8, padding: '9px 12px',
              fontSize: 13, fontWeight: 500, transition: 'all 0.15s', textDecoration: 'none',
              border: '1px solid transparent', marginBottom: 2,
              color: isActive ? 'var(--gold-400)' : 'var(--text-secondary)',
              background: isActive ? 'var(--gold-dim)' : 'transparent',
              borderColor: isActive ? 'var(--gold-border)' : 'transparent',
            })}
          >
            {({ isActive }) => (
              <>
                <Icon size={15} style={{ color: isActive ? 'var(--gold-400)' : 'var(--text-muted)', flexShrink: 0 }} />
                {label}
              </>
            )}
          </NavLink>
        ))}

        {isAdmin && (
          <>
            <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.14em', color: 'var(--text-muted)', textTransform: 'uppercase', padding: '14px 10px 6px' }}>Admin</p>
            {ADMIN_NAV.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} onClick={onClose}
                style={({ isActive }) => ({
                  display: 'flex', alignItems: 'center', gap: 10, borderRadius: 8, padding: '9px 12px',
                  fontSize: 13, fontWeight: 500, transition: 'all 0.15s', textDecoration: 'none',
                  border: '1px solid transparent', marginBottom: 2,
                  color: isActive ? 'var(--gold-400)' : 'var(--text-secondary)',
                  background: isActive ? 'var(--gold-dim)' : 'transparent',
                  borderColor: isActive ? 'var(--gold-border)' : 'transparent',
                })}
              >
                {({ isActive }) => (
                  <>
                    <Icon size={15} style={{ color: isActive ? 'var(--gold-400)' : 'var(--text-muted)', flexShrink: 0 }} />
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </>
        )}
      </nav>

      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, color: 'var(--text-muted)', letterSpacing: '0.10em', textTransform: 'uppercase' }}>v1.0 · Monitoring Notaris/PPAT</p>
      </div>
    </aside>
  )
}
