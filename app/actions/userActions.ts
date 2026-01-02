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
            return { success: false, error: 'Border masih terkunci bro!' };
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
        if (!session?.user?.id) return { success: false, error: 'Harap login bro!' };

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
        if (!session?.user?.id) return { success: false, error: 'Harap login bro!' };

        const userId = session.user.id;
        const normalizedCode = code.trim().toUpperCase();

        // 0. SPECIAL CASE: Legacy Placeholder Codes (LG26 / LG26L)
        if (normalizedCode === 'LG26' || normalizedCode === 'LG26L') {
            const { data: user } = await supabase.from('users').select('gems, claimed_milestones').eq('id', userId).single();
            if (!user) return { success: false, error: 'User tidak ditemukan' };

            const claimed = user.claimed_milestones || [];
            if (claimed.includes('PROMO_LG26')) {
                return { success: false, error: 'Kode ini sudah kamu gunakan bro!' };
            }

            const rewardAmount = 10000;
            const newClaimed = [...claimed, 'PROMO_LG26'];

            const { error } = await supabase.from('users').update({
                gems: (user.gems || 0) + rewardAmount,
                claimed_milestones: newClaimed
            }).eq('id', userId);

            if (error) return { success: false, error: 'Gagal klaim promo' };

            revalidatePath('/shop');
            revalidatePath('/profile');
            return {
                success: true,
                amount: rewardAmount,
                message: `JACKPOT! 🎰 Kamu dapet ${rewardAmount.toLocaleString('id-ID')} Crystal instan. Dompet auto meluber!`
            };
        }

        // 1. Fetch the code details from DB
        const { data: promo, error: promoError } = await supabase
            .from('redeem_codes')
            .select('*')
            .eq('code', normalizedCode)
            .single();

        if (promoError || !promo) return { success: false, error: 'Kode promo tidak valid atau kadaluarsa.' };

        // 2. Check if expired
        if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
            return { success: false, error: 'Kode ini sudah basi bro (kadaluarsa).' };
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
            amount: promo.reward_gems,
            message: `Mantap bro! Kamu dapet ${promo.reward_gems.toLocaleString('id-ID')} Crystal & ${promo.reward_xp.toLocaleString('id-ID')} XP.`
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

/**
 * SECURE: Initialize Daily Quests
 * Creates 3 daily quests if they don't exist for today.
 */
export async function initializeUserQuests() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const userId = session.user.id;
        const today = new Date().toISOString().split('T')[0];

        // 1. Check if already initialized for today
        const { data: existing } = await supabase
            .from('user_quests')
            .select('id')
            .eq('user_id', userId)
            .gte('created_at', `${today}T00:00:00`);

        if (existing && existing.length > 0) return { success: true, alreadyExists: true };

        // 2. Insert new daily quests
        const newQuests = [
            { user_id: userId, quest_id: 'xp', target: 500, reward_gems: 100 },
            { user_id: userId, quest_id: 'vocab', target: 20, reward_gems: 150 },
            { user_id: userId, quest_id: 'streak', target: 1, reward_gems: 50 }
        ];

        const { error } = await supabase.from('user_quests').insert(newQuests);
        if (error) throw error;

        return { success: true };
    } catch (error) {
        console.error('initializeUserQuests error:', error);
        return { success: false, error: 'Failed to initialize quests' };
    }
}

/**
 * SECURE: Update Quest Progress
 * Increments progress for active quests.
 */
export async function updateQuestProgressServer(type: 'xp' | 'vocab' | 'streak', amount: number) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const userId = session.user.id;
        const today = new Date().toISOString().split('T')[0];

        // 1. Fetch active quests for today
        const { data: quests } = await supabase
            .from('user_quests')
            .select('*')
            .eq('user_id', userId)
            .eq('quest_id', type)
            .eq('status', 'ACTIVE')
            .gte('created_at', `${today}T00:00:00`);

        if (!quests || quests.length === 0) return { success: true, noActiveQuest: true };

        const quest = quests[0];
        const newProgress = Math.min(quest.target, quest.progress + amount);

        // 2. Update progress
        const { error } = await supabase
            .from('user_quests')
            .update({ progress: newProgress })
            .eq('id', quest.id);

        if (error) throw error;

        // Check if just finished
        const justFinished = newProgress >= quest.target && quest.progress < quest.target;

        return { success: true, justFinished, rewardGems: quest.reward_gems };
    } catch (error) {
        console.error('updateQuestProgressServer error:', error);
        return { success: false, error: 'Failed to update quest' };
    }
}

/**
 * SECURE: Claim Quest Reward
 */
export async function claimQuestReward(questId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const userId = session.user.id;

        // 1. Fetch quest to verify
        const { data: quest } = await supabase
            .from('user_quests')
            .select('*')
            .eq('id', questId)
            .eq('user_id', userId)
            .single();

        if (!quest) return { success: false, error: 'Quest not found' };
        if (quest.status === 'CLAIMED') return { success: false, error: 'Reward already claimed' };
        if (quest.progress < quest.target) return { success: false, error: 'Misi belum selesai bro!' };

        // 2. Claim reward (Update quest status & add gems to user)
        // Set to CLAIMED
        const { error: questError } = await supabase
            .from('user_quests')
            .update({ status: 'CLAIMED' })
            .eq('id', questId);

        if (questError) throw questError;

        // Add crystals to user
        const { data: user } = await supabase.from('users').select('gems').eq('id', userId).single();
        const { error: userError } = await supabase
            .from('users')
            .update({ gems: (user?.gems || 0) + quest.reward_gems })
            .eq('id', userId);

        if (userError) throw userError;

        revalidatePath('/');
        return { success: true, reward: quest.reward_gems };
    } catch (error) {
        console.error('claimQuestReward error:', error);
        return { success: false, error: 'Failed to claim reward' };
    }
}

/**
 * SECURE: Claim Referral Milestone Action
 */
export async function claimReferralMilestone(milestoneId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const userId = session.user.id;

        // 1. Fetch user data
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (fetchError || !user) return { success: false, error: 'User not found' };

        const claimed = user.claimed_milestones || [];
        if (claimed.includes(milestoneId)) return { success: false, error: 'Sudah diklaim bro!' };

        // 2. Define milestones
        const milestones: Record<string, { target: number; reward: number }> = {
            'referral_1': { target: 1, reward: 5000 },
            'referral_3': { target: 3, reward: 10000 }
        };

        const milestone = milestones[milestoneId];
        if (!milestone) return { success: false, error: 'Milestone tidak valid' };

        // 3. Check progress
        if ((user.referral_count || 0) < milestone.target) {
            return { success: false, error: 'Target belum tercapai bro!' };
        }

        // 4. SECURE UPDATE
        const newClaimed = [...claimed, milestoneId];
        const { error: updateError } = await supabase
            .from('users')
            .update({
                claimed_milestones: newClaimed,
                gems: (user.gems || 0) + milestone.reward
            })
            .eq('id', userId);

        if (updateError) return { success: false, error: 'Gagal klaim milestone' };

        revalidatePath('/profile');
        return { success: true, reward: milestone.reward };
    } catch (error) {
        console.error('claimReferralMilestone error:', error);
        return { success: false, error: 'Internal Error' };
    }
}
