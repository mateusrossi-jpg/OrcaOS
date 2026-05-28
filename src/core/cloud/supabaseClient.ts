import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isCloudEnabled = Boolean(supabaseUrl && supabaseAnonKey);

/**
 * Supabase Client Bridge
 * Used for Phase 3: CLOUD & SAAS.
 * Handles optional cloud sync and multi-device collaboration.
 */
export const supabase = isCloudEnabled 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as unknown as SupabaseClient);
