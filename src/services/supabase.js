import { createClient } from '@supabase/supabase-js'

// IMPORTANTE: Reemplaza estos valores con tu URL y KEY de Supabase
export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'TU_SUPABASE_URL'
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || 'TU_SUPABASE_KEY'
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase;
