import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { supabase } from '../supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading]         = useState(true)

  // Flag untuk skip onAuthStateChange saat createStaffUser sedang berjalan
  const skipNextAuthEvent = useRef(false)

  async function fetchUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()
      if (error) { console.error('fetchUserProfile error:', error.message); return null }
      return data
    } catch (err) {
      console.error('fetchUserProfile exception:', err)
      return null
    }
  }

  async function refreshProfile() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.user) {
      const profile = await fetchUserProfile(session.user.id)
      setUserProfile(profile)
    }
  }

  async function login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }

  async function logout() {
    await supabase.auth.signOut()
    setCurrentUser(null)
    setUserProfile(null)
  }

  async function createStaffUser(email, password, name, assignedCompanies = []) {
    // Simpan sesi admin sebelum signUp
    const { data: { session: adminSession } } = await supabase.auth.getSession()

    // Skip 2 event berikutnya: SIGNED_IN staff baru + SIGNED_IN restore admin
    skipNextAuthEvent.current = 2

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      skipNextAuthEvent.current = 0
      throw error
    }

    const uid = data.user?.id
    if (!uid) {
      skipNextAuthEvent.current = 0
      throw new Error('User ID tidak ditemukan')
    }

    // Insert profil staff ke tabel users
    const { error: profileError } = await supabase.from('users').insert({
      id: uid, email, name, role: 'staff',
      assigned_companies: assignedCompanies,
      created_at: new Date().toISOString(),
    })
    if (profileError) {
      skipNextAuthEvent.current = 0
      throw profileError
    }

    // Restore sesi admin
    if (adminSession) {
      await supabase.auth.setSession({
        access_token:  adminSession.access_token,
        refresh_token: adminSession.refresh_token,
      })
    }

    return data
  }

  async function updateUserProfile(uid, updates) {
    const { error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', uid)
    if (error) throw error
  }

  useEffect(() => {
    let mounted = true
    let initDone = false

    // Init: cek sesi yang sudah ada
    supabase.auth.getSession().then(async ({ data: { session }, error }) => {
      if (!mounted) return
      if (error) console.error('getSession error:', error.message)

      if (session?.user) {
        setCurrentUser(session.user)
        const profile = await fetchUserProfile(session.user.id)
        if (mounted) setUserProfile(profile)
      } else {
        setCurrentUser(null)
        setUserProfile(null)
      }

      initDone = true
      if (mounted) setLoading(false)
    })

    // Dengarkan perubahan sesi setelah init
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return
        if (!initDone) return

        // Skip event yang dipicu oleh createStaffUser
        if (skipNextAuthEvent.current > 0) {
          skipNextAuthEvent.current--
          return
        }

        if (event === 'SIGNED_OUT' || !session) {
          setCurrentUser(null)
          setUserProfile(null)
          return
        }

        if (session?.user) {
          setCurrentUser(session.user)
          const profile = await fetchUserProfile(session.user.id)
          if (mounted) setUserProfile(profile)
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  const isAdmin = userProfile?.role === 'admin'
  const isStaff = userProfile?.role === 'staff'

  return (
    <AuthContext.Provider value={{
      currentUser, userProfile, loading,
      login, logout, createStaffUser, updateUserProfile, refreshProfile,
      isAdmin, isStaff,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
