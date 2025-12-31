import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ Missing Supabase Admin credentials! Check SUPABASE_SERVICE_ROLE_KEY in your environment variables.');
}

/**
 * Supabase Admin Client
 * WARNING: This client bypasses RLS. ONLY use in Server Actions or API Routes.
 * Never use this on the client-side.
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});
