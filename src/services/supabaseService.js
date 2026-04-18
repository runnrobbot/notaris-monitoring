/**
 * supabaseService.js
 * ==================
 * Semua operasi CRUD ke Supabase PostgreSQL.
 *
 * Tables:
 *   public.companies   — PT/developer
 *   public.documents   — monitoring records
 *   public.users       — profil user (linked ke auth.users)
 *
 * Soft-delete: kolom deleted_at (timestamptz, nullable)
 *   - Hapus  → set deleted_at = now()
 *   - Restore → set deleted_at = null
 *   - Hapus permanen → DELETE fisik
 */

import { supabase } from '../supabase'
import { SEED_COMPANIES } from '../utils/columnMap'

function throwIf(error, context = '') {
  if (error) {
    console.error(`[supabaseService] ${context}:`, error.message)
    throw new Error(error.message)
  }
}

// ─── COMPANIES ────────────────────────────────────────────────────────────────

export async function getCompanies() {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('name', { ascending: true })
  throwIf(error, 'getCompanies')
  return data
}

export async function getCompanyById(id) {
  const { data, error } = await supabase
    .from('companies').select('*').eq('id', id).single()
  throwIf(error, 'getCompanyById')
  return data
}

export async function addCompany(payload) {
  const { data, error } = await supabase
    .from('companies')
    .insert({ ...payload, created_at: new Date().toISOString() })
    .select().single()
  throwIf(error, 'addCompany')
  return data
}

export async function updateCompany(id, payload) {
  const { data, error } = await supabase
    .from('companies')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id).select().single()
  throwIf(error, 'updateCompany')
  return data
}

export async function deleteCompany(id) {
  const { error: docError } = await supabase.from('documents').delete().eq('company_id', id)
  throwIf(docError, 'deleteCompany → delete docs')
  const { error } = await supabase.from('companies').delete().eq('id', id)
  throwIf(error, 'deleteCompany')
}

export async function seedCompaniesFromNamaDeveloper() {
  const existing = await getCompanies()
  const existingNames = new Set(existing.map(c => c.name.trim().toUpperCase()))
  const toInsert = SEED_COMPANIES
    .filter(name => !existingNames.has(name.trim().toUpperCase()))
    .map(name => ({ name: name.trim(), created_at: new Date().toISOString(), source: 'seed_nama_developer' }))
  if (!toInsert.length) return { added: 0, skipped: SEED_COMPANIES.length }
  const { error } = await supabase.from('companies').insert(toInsert)
  throwIf(error, 'seedCompanies')
  return { added: toInsert.length, skipped: SEED_COMPANIES.length - toInsert.length }
}

// ─── DOCUMENTS (aktif — deleted_at IS NULL) ───────────────────────────────────

export async function getDocuments(companyId = null) {
  let query = supabase
    .from('documents').select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
  if (companyId) query = query.eq('company_id', companyId)
  const { data, error } = await query
  throwIf(error, 'getDocuments')
  return data
}

export async function getDocumentsByCompanies(companyIds) {
  if (!companyIds?.length) return []
  const { data, error } = await supabase
    .from('documents').select('*')
    .is('deleted_at', null)
    .in('company_id', companyIds)
    .order('created_at', { ascending: false })
  throwIf(error, 'getDocumentsByCompanies')
  return data
}

export async function addDocument(payload, createdBy) {
  const clean = stripUndefined(payload)
  const { data, error } = await supabase
    .from('documents')
    .insert({
      ...clean,
      deleted_at: null,
      created_by: createdBy,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select().single()
  throwIf(error, 'addDocument')
  return data
}

export async function updateDocument(id, payload) {
  const clean = stripUndefined(payload)
  const { data, error } = await supabase
    .from('documents')
    .update({ ...clean, updated_at: new Date().toISOString() })
    .eq('id', id).select().single()
  throwIf(error, 'updateDocument')
  return data
}

// ─── SOFT DELETE / RESTORE / PERMANENT DELETE ────────────────────────────────

/** Pindahkan ke sampah — set deleted_at = now() */
export async function softDeleteDocument(id) {
  const { error } = await supabase
    .from('documents')
    .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    .eq('id', id)
  throwIf(error, 'softDeleteDocument')
}

/** Restore dari sampah — set deleted_at = null */
export async function restoreDocument(id) {
  const { error } = await supabase
    .from('documents')
    .update({ deleted_at: null, updated_at: new Date().toISOString() })
    .eq('id', id)
  throwIf(error, 'restoreDocument')
}

/** Hapus permanen dari database */
export async function permanentDeleteDocument(id) {
  const { error } = await supabase.from('documents').delete().eq('id', id)
  throwIf(error, 'permanentDeleteDocument')
}

/** Ambil semua dokumen di sampah (deleted_at IS NOT NULL) */
export async function getTrashedDocuments() {
  const { data, error } = await supabase
    .from('documents').select('*')
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false })
  throwIf(error, 'getTrashedDocuments')
  return data
}

/** Kosongkan semua sampah sekaligus (hapus permanen semua) */
export async function emptyTrash() {
  const { error } = await supabase
    .from('documents')
    .delete()
    .not('deleted_at', 'is', null)
  throwIf(error, 'emptyTrash')
}

// ─── BATCH IMPORT ─────────────────────────────────────────────────────────────

export async function batchImportDocuments(rows, companyId, createdBy) {
  const CHUNK = 500
  const now = new Date().toISOString()
  for (let i = 0; i < rows.length; i += CHUNK) {
    const chunk = rows.slice(i, i + CHUNK).map(row => ({
      ...stripUndefined(row),
      company_id: companyId,
      deleted_at: null,
      created_by: createdBy,
      created_at: now,
      updated_at: now,
    }))
    const { error } = await supabase.from('documents').insert(chunk)
    throwIf(error, `batchImport chunk ${i}`)
  }
}

// ─── USERS ────────────────────────────────────────────────────────────────────

export async function getUsers() {
  const { data, error } = await supabase
    .from('users').select('*').order('created_at', { ascending: false })
  throwIf(error, 'getUsers')
  return data
}

export async function getUserById(id) {
  const { data, error } = await supabase
    .from('users').select('*').eq('id', id).single()
  throwIf(error, 'getUserById')
  return data
}

export async function updateUser(id, payload) {
  const { data, error } = await supabase
    .from('users')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id).select().single()
  throwIf(error, 'updateUser')
  return data
}

export async function deleteUser(id) {
  const { error } = await supabase.from('users').delete().eq('id', id)
  throwIf(error, 'deleteUser')
}

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────

export function computeDashboardStats(docs, companies) {
  const ACTIVITY_FIELDS = [
    'tanggal_pengecekan','tanggal_znt','tanggal_alih_media',
    'tanggal_balik_nama','tanggal_peningkatan_shm','tanggal_ht','tanggal_roya',
  ]
  const totalDocs = docs.length
  const selesai = docs.filter(d => !!d.tanggal_selesai).length
  const proses  = docs.filter(d => !d.tanggal_selesai && ACTIVITY_FIELDS.some(f => !!d[f])).length
  const belum   = totalDocs - selesai - proses
  const completionRate = totalDocs > 0 ? Math.round((selesai / totalDocs) * 100) : 0
  return { totalDocs, selesai, proses, belum, totalCompanies: companies.length, completionRate }
}

// ─── PRIVATE ─────────────────────────────────────────────────────────────────

function stripUndefined(obj) {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined))
}
