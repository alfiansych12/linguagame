'use server';

import { supabaseAdmin as supabase } from '@/lib/db/supabase-admin';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

export async function registerUser(formData: any) {
    try {
        const { name, email, password } = formData;

        if (!name || !email || !password) {
            return { success: false, error: 'Semua field harus diisi bro!' };
        }

        // 1. Check if user already exists
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return { success: false, error: 'Email sudah terdaftar nih. Coba login!' };
        }

        // 2. Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // 3. Create user
        const userId = uuidv4();
        const { error: insertError } = await supabase
            .from('users')
            .insert({
                id: userId,
                name,
                email,
                password: hashedPassword,
                inventory: { hint: 0, focus: 0, shield: 0, booster: 0, timefreeze: 0, autocorrect: 0 },
                gems: 100, // Welcome bonus
                total_xp: 0,
                current_streak: 0,
                is_admin: false,
                created_at: new Date().toISOString()
            });

        if (insertError) {
            console.error('Registration insert error:', insertError);
            return { success: false, error: 'Gagal membuat akun bro. Coba lagi ya!' };
        }

        return { success: true };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, error: 'Internal system error bro!' };
    }
}
