/**
 * useCompanies.js
 * ================
 * Lightweight hook for components that only need the companies list.
 */

import { useState, useEffect, useCallback } from 'react'
import { getCompanies } from '../services/supabaseService'
import toast from 'react-hot-toast'

export function useCompanies() {
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getCompanies()
      setCompanies(data)
    } catch {
      toast.error('Gagal memuat perusahaan')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  return { companies, loading, reload: load }
}
