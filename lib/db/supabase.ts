import { createClient } from '@supabase/supabase-js';

// Use PUBLIC env for client-side, but these are also available server-side in Next.js
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    if (process.env.NODE_ENV === 'development') {
        console.warn('⚠️ Supabase credentials not found. Make sure .env.local is populated.');
    }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false // Sesuai untuk server-side/NextAuth usage
    }
});
