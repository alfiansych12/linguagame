import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.warn('⚠️ Supabase Admin credentials not found. Server actions may fail.');
}

/**
 * ADMIN: Supabase client with Service Role Key
 * Use ONLY on the server to bypass RLS for trusted operations.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
    }
});
