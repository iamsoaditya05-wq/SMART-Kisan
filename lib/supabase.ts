
import { createClient } from '@supabase/supabase-js';

// Specific project credentials provided by the user
const supabaseUrl = 'https://nheyogmibaowjcmmrzuv.supabase.co';
const supabaseAnonKey = 'sb_publishable_gfndxc0lwkrEwbVhMVhWzg_ILtuCATg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
