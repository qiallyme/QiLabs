import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://jneuyvckqeymsrqmrobh.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_XYObvOjLhLaIEFF70ZvPjw_araIaCQc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
