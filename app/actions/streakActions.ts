'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin as supabase } from '@/lib/db/supabase-admin';

/**
 * SECURE: Update User Streak
 * Checks last login and updates streak accordingly.
 * - If logged in today: maintain streak
 * - If logged in yesterday: increment streak
 * - If missed a day: reset to 1 (unless Phoenix Crystal is active)
 */
export async function updateUserStreak() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const userId = session.user.id;

        // 1. Fetch user data
        const { data: user, error: fetchError } = await supabase
            .from('users')
            .select('current_streak, last_streak_date, inventory')
            .eq('id', userId)
            .single();

        if (fetchError || !user) {
            return { success: false, error: 'User not found' };
        }

        const today = new Date().toISOString().split('T')[0];
        const lastStreakDate = user.last_streak_date;

        // If already updated today, skip
        if (lastStreakDate === today) {
            return {
                success: true,
                streak: user.current_streak,
                message: 'Streak sudah diupdate hari ini'
            };
        }

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        let newStreak = 1;
        let phoenixUsed = false;

        if (lastStreakDate === yesterdayStr) {
            // Logged in yesterday, increment streak
            newStreak = (user.current_streak || 0) + 1;
        } else if (lastStreakDate && lastStreakDate < yesterdayStr) {
            // Missed a day - check for Phoenix Crystal
            const inventory = user.inventory || {};
            if (inventory.slay && inventory.slay > 0) {
                // Use Phoenix Crystal to save streak
                newStreak = user.current_streak || 1;
                phoenixUsed = true;

                // Decrement Phoenix Crystal
                const newInventory = { ...inventory };
                newInventory.slay -= 1;

                await supabase
                    .from('users')
                    .update({ inventory: newInventory })
                    .eq('id', userId);
            } else {
                // No Phoenix Crystal, reset streak
                newStreak = 1;
            }
        }

        // 2. Update streak and last_streak_date
        const { error: updateError } = await supabase
            .from('users')
            .update({
                current_streak: newStreak,
                last_streak_date: today
            })
            .eq('id', userId);

        if (updateError) {
            return { success: false, error: 'Failed to update streak' };
        }

        return {
            success: true,
            streak: newStreak,
            phoenixUsed,
            message: phoenixUsed
                ? `Phoenix Crystal menyelamatkan streak kamu! 🔥 Streak: ${newStreak} hari`
                : `Streak updated! 🔥 ${newStreak} hari berturut-turut`
        };
    } catch (error) {
        console.error('updateUserStreak error:', error);
        return { success: false, error: 'Internal Error' };
    }
}

/**
 * SECURE: Get User Streak Info
 * Returns current streak and whether user has logged in today
 */
export async function getUserStreakInfo() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const userId = session.user.id;

        const { data: user, error } = await supabase
            .from('users')
            .select('current_streak, last_streak_date')
            .eq('id', userId)
            .single();

        if (error || !user) {
            return { success: false, error: 'User not found' };
        }

        const today = new Date().toISOString().split('T')[0];
        const loggedInToday = user.last_streak_date === today;

        return {
            success: true,
            streak: user.current_streak || 0,
            loggedInToday,
            lastStreakDate: user.last_streak_date
        };
    } catch (error) {
        console.error('getUserStreakInfo error:', error);
        return { success: false, error: 'Internal Error' };
    }
}
