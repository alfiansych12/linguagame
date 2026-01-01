'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin as supabase } from '@/lib/db/supabase-admin';
import { checkBorderUnlocked } from '@/lib/utils/borderUnlocks';
import { EquipBorderSchema, UpdateProfileSchema } from '@/lib/validations/user';
import { revalidatePath } from 'next/cache';
import { ACHIEVEMENTS } from '@/lib/data/achievements';

/**
 * SECURE: Equip Border Action
 * Derives userId from server session, validates input with Zod.
 */
export async function equipBorder(data: { borderId: string }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const validation = EquipBorderSchema.safeParse(data);
        if (!validation.success) return { success: false, error: 'Input tidak valid' };

        const { borderId } = validation.data;
        const userId = session.user.id;

        // Fetch user data to check unlock status
        const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (fetchError || !userData) return { success: false, error: 'User not found' };

        if (!checkBorderUnlocked(borderId, userData)) {
            return { success: false, error: 'Border masih terkunci sirkel!' };
        }

        const { error: updateError } = await supabase
            .from('users')
            .update({ equipped_border: borderId })
            .eq('id', userId);

        if (updateError) return { success: false, error: 'Update failed' };

        revalidatePath('/profile');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Internal Error' };
    }
}

/**
 * SECURE: Update Profile Action
 * Prevents editing other users' profiles via secure session lookup.
 */
export async function updateProfile(data: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const validation = UpdateProfileSchema.safeParse(data);
        if (!validation.success) return { success: false, error: 'Data tidak valid' };

        const userId = session.user.id;
        const updates = validation.data;

        const { error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId);

        if (error) return { success: false, error: 'Update failed' };

        revalidatePath('/profile');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Internal Error' };
    }
}

/**
 * SECURE: Consume Crystal Action
 * Decrements inventory on the server.
 */
export async function consumeCrystal(data: { crystalType: string }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const { crystalType } = data;
        const userId = session.user.id;

        const { data: user } = await supabase.from('users').select('inventory').eq('id', userId).single();
        if (!user || (user.inventory[crystalType] || 0) <= 0) {
            return { success: false, error: 'Crystal tidak cukup' };
        }

        const newInventory = { ...user.inventory };
        newInventory[crystalType] -= 1;

        const { error } = await supabase.from('users').update({
            inventory: newInventory
        }).eq('id', userId);

        if (error) return { success: false, error: 'Failed to use crystal' };

        revalidatePath('/shop'); // Update balance display if any
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Internal Error' };
    }
}

/**
 * SECURE: Apply Referral Action
 * Handles rewards for both inviter and invitee on the server.
 */
export async function applyReferral(code: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Harap login sirkel!' };

        const userId = session.user.id;
        const normalizedCode = code.trim().toUpperCase();

        // 1. Fetch current user to check if already referred
        const { data: currentUser, error: userError } = await supabase
            .from('users')
            .select('referred_by, gems')
            .eq('id', userId)
            .single();

        if (userError || !currentUser) return { success: false, error: 'User tidak ditemukan' };
        if (currentUser.referred_by) return { success: false, error: 'Kamu sudah pernah pakai kode referral!' };

        // 2. Find the inviter
        const { data: inviter, error: inviterError } = await supabase
            .from('users')
            .select('id, referral_count')
            .eq('referral_code', normalizedCode)
            .single();

        if (inviterError || !inviter) return { success: false, error: 'Kode tidak valid nih.' };
        if (inviter.id === userId) return { success: false, error: 'Masa pakai kode sendiri? Kocak geming.' };

        // 3. SECURE UPDATE (Transaction-like)
        // Note: In a real app, use a postgres function (RPC) or Supabase transaction
        // But for this MVP, we can do sequential updates

        // Update inviter: count + 1
        await supabase.rpc('increment_referral_count', { user_id: inviter.id });

        // Update invitee: set referred_by and add 250 gems
        const { error: updateError } = await supabase
            .from('users')
            .update({
                referred_by: inviter.id,
                gems: (currentUser.gems || 0) + 250
            })
            .eq('id', userId);

        if (updateError) return { success: false, error: 'Gagal memproses referral' };

        revalidatePath('/profile');
        revalidatePath('/');

        return { success: true, message: 'Berhasil! Bonus 250 Crystal cair.' };
    } catch (error) {
        console.error('applyReferral error:', error);
        return { success: false, error: 'Internal Error' };
    }
}

/**
 * SECURE: Unlock Achievement Action
 * Validates achievement progress on server and grants gems.
 */
export async function unlockAchievement(achievementId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const userId = session.user.id;
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (!achievement) return { success: false, error: 'Achievement not found' };

        // 1. Fetch user to check current progress and already unlocked
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (fetchError || !user) return { success: false, error: 'User not found' };

        const unlocked = user.unlocked_achievements || [];
        if (unlocked.includes(achievementId)) return { success: false, error: 'Already unlocked' };

        // 2. Validate progress
        let reached = false;
        switch (achievement.type) {
            case 'xp': reached = (user.total_xp || 0) >= achievement.target; break;
            case 'vocab': reached = (user.vocab_count || 0) >= achievement.target; break;
            case 'streak': reached = (user.current_streak || 0) >= achievement.target; break;
            case 'gems': reached = (user.gems || 0) >= achievement.target; break;
            case 'wins': reached = (user.duel_wins || 0) >= achievement.target; break;
            case 'spent': reached = (user.total_spent || 0) >= achievement.target; break;
        }

        if (!reached) return { success: false, error: 'Target not reached' };

        // 3. SECURE UPDATE
        const newUnlocked = [...unlocked, achievementId];
        const { error: updateError } = await supabase
            .from('users')
            .update({
                unlocked_achievements: newUnlocked,
                gems: (user.gems || 0) + achievement.reward
            })
            .eq('id', userId);

        if (updateError) return { success: false, error: 'Failed to unlock' };

        revalidatePath('/profile');
        return { success: true, reward: achievement.reward };
    } catch (error) {
        console.error('unlockAchievement error:', error);
        return { success: false, error: 'Internal Error' };
    }
}

/**
 * SECURE: Redeem Promo Code
 * Validates existence, usage limits, expiration, and ensures one-time use per user.
 */
export async function redeemPromoCode(code: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Harap login sirkel!' };

        const userId = session.user.id;
        const normalizedCode = code.trim().toUpperCase();

        // 1. Fetch the code details
        const { data: promo, error: promoError } = await supabase
            .from('redeem_codes')
            .select('*')
            .eq('code', normalizedCode)
            .single();

        if (promoError || !promo) return { success: false, error: 'Kode promo tidak valid atau kadaluarsa.' };

        // 2. Check if expired
        if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
            return { success: false, error: 'Kode ini sudah basi sirkel (kadaluarsa).' };
        }

        // 3. Check if max uses reached
        if (promo.current_uses >= promo.max_uses) {
            return { success: false, error: 'Kode ini sudah mencapai batas pemakaian.' };
        }

        // 4. Check if current user already redeemed it
        const { data: alreadyRedeemed } = await supabase
            .from('user_redeems')
            .select('*')
            .eq('user_id', userId)
            .eq('code_id', promo.id)
            .single();

        if (alreadyRedeemed) return { success: false, error: 'Kamu sudah pernah pakai kode ini!' };

        // 5. SECURE TRANSACTION: Record usage and update user
        // Record redemption
        const { error: recordError } = await supabase
            .from('user_redeems')
            .insert({ user_id: userId, code_id: promo.id });

        if (recordError) return { success: false, error: 'Gagal mencatat pemakaian kode.' };

        // Update code usage count
        await supabase
            .from('redeem_codes')
            .update({ current_uses: promo.current_uses + 1 })
            .eq('id', promo.id);

        // Fetch current user gems/xp
        const { data: user } = await supabase
            .from('users')
            .select('gems, total_xp')
            .eq('id', userId)
            .single();

        if (!user) return { success: false, error: 'User tidak ditemukan.' };

        // Award rewards
        const { error: updateError } = await supabase
            .from('users')
            .update({
                gems: (user.gems || 0) + (promo.reward_gems || 0),
                total_xp: (user.total_xp || 0) + (promo.reward_xp || 0)
            })
            .eq('id', userId);

        if (updateError) return { success: false, error: 'Gagal mengklaim hadiah.' };

        revalidatePath('/profile');
        revalidatePath('/shop');

        return {
            success: true,
            message: `Mantap sirkel! Kamu dapet ${promo.reward_gems} Crystal & ${promo.reward_xp} XP.`
        };
    } catch (error) {
        console.error('redeemPromoCode error:', error);
        return { success: false, error: 'Terjadi kesalahan sistem.' };
    }
}
/**
 * SECURE: Update User Pulse
 * Updates last_login_at to show current activity in Admin Radar.
 */
export async function updateUserPulse() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false };

        const { error } = await supabase
            .from('users')
            .update({ last_login_at: new Date().toISOString() })
            .eq('id', session.user.id);

        if (error) return { success: false };
        return { success: true };
    } catch (error) {
        return { success: false };
    }
}
