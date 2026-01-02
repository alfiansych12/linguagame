'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin as supabase } from '@/lib/db/supabase-admin';
import { SubmitScoreSchema } from '@/lib/validations/game';
import { revalidatePath } from 'next/cache';
import { strictRatelimit, detectBotBehavior, isIPBlacklisted } from '@/lib/ratelimit';
import { headers } from 'next/headers';

/**
 * SECURE: Submit Score Action (v3.0 Enhanced)
 * - Derives userId from secure server session
 * - Validates input with Zod
 * - Prevents IDOR
 * - Prevents Logically Impossible Scores
 * - DDoS Protection with IP blacklist check
 * - Bot behavior detection
 */
export async function submitGameScore(data: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Harap login bro!' };

        // 0. IP Blacklist Check
        const headersList = await headers();
        const forwardedFor = headersList.get('x-forwarded-for');
        const ip = forwardedFor ? forwardedFor.split(',')[0] : headersList.get('x-real-ip') || 'unknown';

        if (await isIPBlacklisted(ip)) {
            console.warn(`Blocked request from blacklisted IP: ${ip}`);
            return { success: false, error: 'Access denied.' };
        }

        // 0.1 Rate Limiting (Prevent Script Abuse)
        const { success: limitSuccess } = await strictRatelimit.limit(session.user.id);
        if (!limitSuccess) {
            return { success: false, error: 'Sabar bro, jangan buru-buru submit! (Rate Limited)' };
        }

        // 0.2 Bot Behavior Detection
        const isBotLike = await detectBotBehavior(session.user.id, 'submit_score');
        if (isBotLike) {
            console.warn(`Suspicious bot behavior detected for user: ${session.user.id}`);
            return { success: false, error: 'Aktivitas mencurigakan terdeteksi. Hubungi admin jika ini kesalahan.' };
        }

        // 1. Zod Validation
        const validation = SubmitScoreSchema.safeParse(data);
        if (!validation.success) return { success: false, error: 'Data tidak valid.' };

        const { levelId, score, stars, timeTaken } = validation.data;
        const userId = session.user.id;

        // 2. Logic Check: Impossible Time/Score ratio
        // Example: If a level has 10 words, it's impossible to finish in < 2 seconds.
        if (timeTaken && timeTaken < 2) {
            return { success: false, error: 'Kecepatan dewa? Stop cheating bang.' };
        }

        // 3. Fetch current user and progress
        const [{ data: existingProgress }, { data: userData }] = await Promise.all([
            supabase.from('user_progress').select('*').eq('user_id', userId).eq('level_id', levelId).single(),
            supabase.from('users').select('total_xp, gems, vocab_count, is_pro, pro_until').eq('id', userId).single()
        ]);

        const isNewBest = !existingProgress || score > (existingProgress.score || 0);

        if (isNewBest || !existingProgress) {
            // Update Progress
            const progressUpdate: any = {
                user_id: userId,
                level_id: levelId,
                status: 'COMPLETED',
                score: score,
                stars: stars,
                updated_at: new Date().toISOString()
            };

            // If it's a new best, also update high_score (common in trigger-based XP systems)
            if (isNewBest) {
                progressUpdate.high_score = score;
            }

            await supabase.from('user_progress').upsert(progressUpdate, { onConflict: 'user_id,level_id' });

            // Reward Calculations
            let xpDiff = existingProgress ? Math.max(0, score - existingProgress.score) : score;

            // PRO XP BOOST (1.5x)
            const isPro = userData?.is_pro && userData?.pro_until && new Date(userData.pro_until) > new Date();
            if (isPro) {
                xpDiff = Math.floor(xpDiff * 1.5);
            }

            const gemReward = 30 + (stars * 15);
            const vocabReward = 10; // Default increment per level

            const updates = {
                total_xp: (userData?.total_xp || 0) + xpDiff,
                gems: (userData?.gems || 0) + gemReward,
                vocab_count: (userData?.vocab_count || 0) + vocabReward
            };

            await supabase.from('users').update(updates).eq('id', userId);
        }

        revalidatePath('/leaderboard');
        revalidatePath('/profile');
        revalidatePath('/'); // For progress on dashboard

        return { success: true, isNewBest };
    } catch (error: any) {
        console.error('submitGameScore error details:', {
            message: error.message,
            code: error.code,
            details: error.details
        });
        return { success: false, error: 'Internal Error' };
    }
}

/**
 * SECURE: Submit Duel Victory
 * Increments duel_wins for the authenticated user
 */
export async function submitDuelWin() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const userId = session.user.id;

        // 0. Rate Limit (Prevent Spamming Wins)
        const { success: limitSuccess } = await strictRatelimit.limit(`duel_win_${userId}`);
        if (!limitSuccess) return { success: false, error: 'Sabar bro, jangan farming terus! (Rate Limited)' };

        // 1. Fetch current duel wins
        const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('duel_wins, gems')
            .eq('id', userId)
            .single();

        if (fetchError || !userData) {
            console.error('Error fetching user for duel win:', fetchError);
            return { success: false, error: 'User not found' };
        }

        // 2. Increment wins and add a small gem reward
        const { error: updateError } = await supabase
            .from('users')
            .update({
                duel_wins: (userData.duel_wins || 0) + 1,
                gems: (userData.gems || 0) + 100 // Bonus for winning duel (Increased for balance)
            })
            .eq('id', userId);

        if (updateError) {
            console.error('Error updating duel win:', updateError);
            return { success: false, error: 'Failed to update wins' };
        }

        revalidatePath('/profile');
        revalidatePath('/leaderboard');

        return { success: true };
    } catch (error) {
        console.error('submitDuelWin error:', error);
        return { success: false, error: 'Internal Error' };
    }
}

/**
 * SECURE: Reset Level Progress
 * Used when failing an exam to reset the current phase.
 */
export async function resetLevelProgress(levelIds: string[]) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const userId = session.user.id;

        const { error } = await supabase
            .from('user_progress')
            .delete()
            .eq('user_id', userId)
            .in('level_id', levelIds);

        if (error) {
            console.error('Error resetting progress:', error);
            return { success: false, error: 'Failed to reset progress' };
        }

        revalidatePath('/');
        return { success: true };
    } catch (error) {
        console.error('resetLevelProgress error:', error);
        return { success: false, error: 'Internal Error' };
    }
}
