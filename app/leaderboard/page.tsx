import { supabase } from '@/lib/db/supabase';
import { sanitizeDisplayName } from '@/lib/utils/anonymize';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import LeaderboardClient from './LeaderboardClient';

export const revalidate = 0; // Ensure data is always fresh

/**
 * Leaderboard Page - Server Component for Data Fetching
 */
export default async function LeaderboardPage() {
    // Fetch top users from Supabase with richer data
    const { data: users, error } = await supabase
        .from('users')
        .select('id, name, total_xp, current_streak, image, vocab_count, duel_wins, equipped_border')
        .gt('total_xp', 0)
        .order('total_xp', { ascending: false })
        .limit(25);

    if (error) {
        console.error('Error fetching leaderboard:', error);
    }

    // Sanitize names for privacy
    const sanitizedUsers = users?.map(user => ({
        ...user,
        name: sanitizeDisplayName(user.name, user.id)
    }));

    const topUsers = sanitizedUsers && sanitizedUsers.length > 0 ? sanitizedUsers : [
        { id: '1', name: 'Player #A1B2C3', total_xp: 4500, current_streak: 12, image: '', vocab_count: 150, duel_wins: 45 },
        { id: '2', name: 'Player #D4E5F6', total_xp: 3800, current_streak: 8, image: '', vocab_count: 120, duel_wins: 30 },
        { id: '3', name: 'Player #G7H8I9', total_xp: 3200, current_streak: 15, image: '', vocab_count: 200, duel_wins: 55 },
    ];

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
        />
    );
}
