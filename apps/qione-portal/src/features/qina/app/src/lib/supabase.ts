import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rlaxgslvotishocjrivm.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_fb_klgWvCKZgDSqvY2dPpw_5YTAkxSn';

export const supabase = createClient(supabaseUrl, supabaseKey);
