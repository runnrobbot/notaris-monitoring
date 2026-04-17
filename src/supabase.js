// ============================================================
//  SUPABASE CLIENT
//  Ganti firebase.js — satu file untuk Auth, DB, dan Storage
//  Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di .env
// ============================================================

import { createClient } from '@supabase/supabase-js'

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY wajib diisi di .env')
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase
