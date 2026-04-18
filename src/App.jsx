import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './contexts/AuthContext'
import { ProtectedRoute } from './routes/ProtectedRoute'
import { AppLayout } from './layouts/AppLayout'
import LandingPage   from './pages/LandingPage'
import LoginPage     from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import DocumentsPage from './pages/DocumentsPage'
import CompaniesPage from './pages/CompaniesPage'
import UsersPage     from './pages/UsersPage'
import TrashPage     from './pages/TrashPage'

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "'Outfit', sans-serif",
            borderRadius: '8px',
            background: '#162844',
            color: '#E8E0D0',
            fontSize: '13px',
            border: '1px solid rgba(201,153,26,0.2)',
          },
          success: { iconTheme: { primary: '#C9991A', secondary: '#0A1628' } },
          error:   { iconTheme: { primary: '#e05252', secondary: '#fff' } },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/"      element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Protected — semua di dalam ProtectedRoute + AppLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/companies" element={<CompaniesPage />} />
            <Route path="/trash"     element={<TrashPage />} />

            <Route element={<ProtectedRoute adminOnly />}>
              <Route path="/users" element={<UsersPage />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
