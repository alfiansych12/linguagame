'use server';

import { supabaseAdmin } from '@/lib/supabase-admin';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

/**
 * Server Action to upload profile photo
 * Bypasses RLS using Service Role Key
 */
export async function uploadProfilePhoto(formData: FormData) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return { success: false, message: 'Unauthorized: Kamu harus login dulu!' };
        }

        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, message: 'File tidak ditemukan' };
        }

        // Validate size (2MB)
        if (file.size > 2 * 1024 * 1024) {
            return { success: false, message: 'File terlalu besar (Hanya boleh < 2MB)' };
        }

        const userId = session.user.id;
        const fileExt = file.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        // Convert file to Buffer for Supabase upload
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Upload using Admin Client (Bypasses RLS)
        const { data, error: uploadError } = await supabaseAdmin.storage
            .from('avatars')
            .upload(filePath, buffer, {
                contentType: file.type,
                upsert: true
            });

        if (uploadError) {
            console.error('Supabase upload error:', uploadError);
            return { success: false, message: `Upload error: ${uploadError.message}` };
        }

        // Get Public URL
        const { data: { publicUrl } } = supabaseAdmin.storage
            .from('avatars')
            .getPublicUrl(filePath);

        // Update User Image in Database
        const { error: dbError } = await supabaseAdmin
            .from('users')
            .update({ image: publicUrl })
            .eq('id', userId);

        if (dbError) {
            console.error('Database update error:', dbError);
            return { success: false, message: `Database error: ${dbError.message}` };
        }

        return { success: true, url: publicUrl };

    } catch (error: any) {
        console.error('Profile upload action error:', error);
        return { success: false, message: 'Terjadi kesalahan sistem' };
    }
}
