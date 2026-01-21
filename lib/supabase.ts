
import { createClient } from '@supabase/supabase-js';

// Prioritize environment variables for deployment, fallback to provided defaults for local use.
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://nheyogmibaowjcmmrzuv.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_gfndxc0lwkrEwbVhMVhWzg_ILtuCATg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
