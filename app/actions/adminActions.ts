'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin as supabase } from '@/lib/db/supabase-admin';
import { revalidatePath } from 'next/cache';
import { RedeemCode, Announcement, UserStats } from '@/types/admin';

async function checkAdmin() {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
        throw new Error('Unauthorized: Admin access only');
    }
    return session;
}

/**
 * ADMIN: Get All Users
 */
export async function getAllUsers(): Promise<{ success: boolean; data?: UserStats[]; error?: string }> {
    try {
        await checkAdmin();
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .order('total_xp', { ascending: false });

        if (error) throw error;
        return { success: true, data };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * ADMIN: Create Redeem Code
 */
export async function createRedeemCode(data: Partial<RedeemCode>) {
    try {
        await checkAdmin();
        const { code, reward_gems, reward_xp, max_uses, expires_at } = data;

        const { error } = await supabase
            .from('redeem_codes')
            .insert({
                code: code?.toUpperCase().trim(),
                reward_gems: reward_gems || 0,
                reward_xp: reward_xp || 0,
                max_uses: max_uses || 1,
                current_uses: 0,
                expires_at: expires_at || null
            });

        if (error) throw error;
        revalidatePath('/admin');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * ADMIN: Broadcast Announcement
 */
export async function broadcastAnnouncement(data: Partial<Announcement>) {
    try {
        await checkAdmin();
        const { title, content, type } = data;

        const { error } = await supabase
            .from('announcements')
            .insert({
                title,
                content,
                type: type || 'info'
            });

        if (error) throw error;
        revalidatePath('/');
        return { success: true };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * ADMIN: Get All Codes
 */
export async function getRedeemCodes() {
    try {
        await checkAdmin();
        const { data, error } = await supabase
            .from('redeem_codes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, data };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * ADMIN: Get Redemption History
 */
export async function getRedemptionHistory() {
    try {
        await checkAdmin();
        const { data, error } = await supabase
            .from('user_redeems')
            .select(`
                *,
                users (name, email),
                redeem_codes (code)
            `)
            .order('redeemed_at', { ascending: false });

        if (error) throw error;
        return { success: true, data };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}

/**
 * ADMIN: Get Announcement History
 */
export async function getAnnouncements() {
    try {
        await checkAdmin();
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { success: true, data };
    } catch (err: any) {
        return { success: false, error: err.message };
    }
}
