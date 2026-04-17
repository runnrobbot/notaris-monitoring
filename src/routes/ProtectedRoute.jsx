import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

export function ProtectedRoute({ adminOnly = false }) {
  const { currentUser, userProfile, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ display:'flex', height:'100vh', alignItems:'center', justifyContent:'center', background:'#0f0f0f', flexDirection:'column', gap:12 }}>
        <div style={{
          width:32, height:32, borderRadius:'50%',
          border:'2px solid #C9A84C', borderTopColor:'transparent',
          animation:'spin 0.8s linear infinite'
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        <p style={{ color:'#888', fontSize:11, letterSpacing:'0.1em', textTransform:'uppercase' }}>Loading…</p>
      </div>
    )
  }

  if (!currentUser) return <Navigate to="/login" replace />
  if (adminOnly && userProfile?.role !== 'admin') return <Navigate to="/dashboard" replace />

  return <Outlet />
}
