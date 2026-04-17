/**
 * useDocuments.js
 * ================
 * Custom hook that handles fetching companies + documents
 * with role-aware filtering (admin sees all, staff sees assigned only).
 * Centralises the load/refresh logic shared across Dashboard and Documents pages.
 */

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  getCompanies,
  getDocuments,
  getDocumentsByCompanies,
} from '../services/supabaseService'
import toast from 'react-hot-toast'

export function useDocuments() {
  const { isAdmin, userProfile } = useAuth()

  const [docs, setDocs] = useState([])
  const [companies, setCompanies] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [companiesData, docsData] = await Promise.all([
        getCompanies(),
        isAdmin
          ? getDocuments()
          : getDocumentsByCompanies(userProfile?.assigned_companies || []),
      ])
      setCompanies(companiesData)
      setDocs(docsData)
    } catch (err) {
      setError(err.message)
      toast.error('Gagal memuat data')
    } finally {
      setLoading(false)
    }
  }, [isAdmin, userProfile?.assigned_companies?.join(',')])

  useEffect(() => { load() }, [load])

  /** Map of companyId → company name for fast lookups */
  const companyMap = Object.fromEntries(companies.map((c) => [c.id, c.name]))
  const getCompanyName = (id) => companyMap[id] || '—'

  return { docs, companies, loading, error, reload: load, getCompanyName }
}
