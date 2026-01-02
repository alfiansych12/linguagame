import { supabase } from '@/lib/db/supabase';
import { sanitizeDisplayName } from '@/lib/utils/anonymize';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LeaderboardClient from './LeaderboardClient';

export const revalidate = 0; // Ensure data is always fresh

/**
 * Leaderboard Page - Server Component for Data Fetching
 */
export default async function LeaderboardPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
    const { type = 'xp' } = await searchParams;
    const isTactical = type === 'duel';

    // Fetch top users from Supabase with richer data
    let query = supabase
        .from('users')
        .select('id, name, total_xp, current_streak, image, vocab_count, duel_wins, equipped_border');

    if (isTactical) {
        query = query.gt('duel_wins', 0).order('duel_wins', { ascending: false });
    } else {
        query = query.gt('total_xp', 0).order('total_xp', { ascending: false });
    }

    const { data: users, error } = await query.limit(25);

    if (error) {
        console.error('Error fetching leaderboard:', error);
    }

    // Sanitize names for privacy
    const sanitizedUsers = users?.map(user => ({
        ...user,
        name: sanitizeDisplayName(user.name, user.id)
    }));

    const topUsers = sanitizedUsers && sanitizedUsers.length > 0 ? sanitizedUsers : [];

    // Get current session for highlighting
    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id;

    // Split into Top 3 and Others
    const top3 = topUsers.slice(0, 3);
    const others = topUsers.slice(3);

    return (
        <LeaderboardClient
            top3={top3}
            others={others}
            currentUserId={currentUserId}
            type={type as 'xp' | 'duel'}
        />
    );
}
