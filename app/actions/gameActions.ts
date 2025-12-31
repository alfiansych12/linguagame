'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db/supabase';
import { SubmitScoreSchema } from '@/lib/validations/game';
import { revalidatePath } from 'next/cache';
import { strictRatelimit } from '@/lib/ratelimit';

/**
 * SECURE: Submit Score Action
 * - Derives userId from secure server session
 * - Validates input with Zod
 * - Prevents IDOR
 * - Prevents Logically Impossible Scores
 */
export async function submitGameScore(data: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Harap login sirkel!' };

        // 0. Rate Limiting (Prevent Script Abuse)
        const { success: limitSuccess } = await strictRatelimit.limit(session.user.id);
        if (!limitSuccess) {
            return { success: false, error: 'Sabar sirkel, jangan buru-buru submit! (Rate Limited)' };
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
            supabase.from('users').select('total_xp, gems, vocab_count').eq('id', userId).single()
        ]);

        const isNewBest = !existingProgress || score > (existingProgress.score || 0);

        if (isNewBest || !existingProgress) {
            // Update Progress
            await supabase.from('user_progress').upsert({
                user_id: userId,
                level_id: levelId,
                status: 'COMPLETED',
                score: score,
                stars: stars,
                updated_at: new Date().toISOString()
            }, { onConflict: 'user_id,level_id' });

            // Reward Calculations
            const xpDiff = existingProgress ? Math.max(0, score - existingProgress.score) : score;
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
    } catch (error) {
        console.error('submitGameScore error:', error);
        return { success: false, error: 'Internal Error' };
    }
}
