
import { createClient } from '@supabase/supabase-js';

// Access variables via process.env which is pre-configured in this environment
const supabaseUrl = (process.env as any).VITE_SUPABASE_URL;
const supabaseAnonKey = (process.env as any).VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing. Check Environment Variables.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder'
);
