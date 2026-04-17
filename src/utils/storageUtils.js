/**
 * storageUtils.js
 * ===============
 * Upload & get PDF URL via Supabase Storage.
 * Bucket: "documents" (public read, auth required to upload)
 *
 * Setup di Supabase Dashboard:
 *   Storage → New Bucket → Name: "documents" → Public: ON
 */

import { supabase } from '../supabase'

const BUCKET = 'documents'

/**
 * Upload PDF ke Supabase Storage
 * @param {File}     file       - File PDF
 * @param {string}   docId      - ID dokumen (untuk nama file)
 * @param {string}   fieldName  - Nama field ("selesai" | "register")
 * @param {function} onProgress - Callback progress 0–100 (opsional)
 * @returns {Promise<{url: string, path: string}>}
 */
export async function uploadPDF(file, docId, fieldName, onProgress) {
  if (!file) throw new Error('File tidak ada')

  const ext      = file.name.split('.').pop() || 'pdf'
  const filePath = `${docId}/${fieldName}_${Date.now()}.${ext}`

  // Supabase JS v2 tidak mendukung progress natively,
  // tapi kita simulasikan dengan set 50% sebelum upload dan 100% setelahnya
  onProgress?.(10)

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      contentType: 'application/pdf',
      upsert: false,
    })

  if (error) {
    console.error('[Supabase Storage] Upload error:', error.message)
    throw new Error('Upload gagal: ' + error.message)
  }

  onProgress?.(100)

  // Ambil public URL — bucket harus Public
  const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(data.path)

  return {
    url:  urlData.publicUrl,
    path: data.path,        // simpan path untuk keperluan delete
  }
}

/**
 * Hapus PDF dari Supabase Storage
 * @param {string} path - path yang disimpan saat upload (bukan URL)
 */
export async function deletePDF(path) {
  if (!path) return
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) console.warn('[Supabase Storage] Delete gagal:', error.message)
}

/**
 * Kembalikan URL langsung — Supabase Storage public URL sudah bisa dibuka di browser.
 * Tidak perlu Google Docs Viewer workaround seperti Cloudinary.
 */
export function getPdfViewUrl(pdfData) {
  if (!pdfData?.url) return null
  return pdfData.url
}
