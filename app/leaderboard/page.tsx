import { PageLayout } from '@/components/layout/PageLayout';
import { Card, Icon, Badge } from '@/components/ui/UIComponents';
import { supabase } from '@/lib/db/supabase';
import { sanitizeDisplayName } from '@/lib/utils/anonymize';

/**
 * Leaderboard Page - Displays top users by XP
 */
export default async function LeaderboardPage() {
    // Fetch top users from Supabase
    const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .order('total_xp', { ascending: false })
        .limit(20);

    if (error) {
        console.error('Error fetching leaderboard:', error);
    }

    // Sanitize names for privacy
    const sanitizedUsers = users?.map(user => ({
        ...user,
        name: sanitizeDisplayName(user.name, user.id)
    }));

    // Placeholder if DB is empty or during setup
    const topUsers = sanitizedUsers && sanitizedUsers.length > 0 ? sanitizedUsers : [
        { id: '1', name: 'Player #A1B2C3', total_xp: 4500, current_streak: 12, image: '' },
        { id: '2', name: 'Player #D4E5F6', total_xp: 3800, current_streak: 8, image: '' },
        { id: '3', name: 'Player #G7H8I9', total_xp: 3200, current_streak: 15, image: '' },
        { id: '4', name: 'Player #J1K2L3', total_xp: 2900, current_streak: 5, image: '' },
        { id: '5', name: 'Player #M4N5O6', total_xp: 2500, current_streak: 3, image: '' },
    ];

    // Mock currentUser for highlighting (will come from session later)
    const currentUserId = 'user1';
    const mockUser = { name: 'Player #XYZ', totalXp: 1250, currentStreak: 5, image: '' };

    return (
        <PageLayout activeTab="leaderboard" user={mockUser}>
            <div className="text-center mb-8 md:mb-16">
                <h1 className="text-3xl sm:text-5xl md:text-7xl font-black text-slate-900 dark:text-white mb-2 tracking-tight leading-none italic uppercase">
                    Sirkel Board
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-xs md:text-lg uppercase tracking-widest">Explorer Paling Kece Week Ini</p>
            </div>

            {/* Podium Section (Top 3) */}
            <div className="flex items-end justify-center gap-1 md:gap-6 mb-12 md:mb-20 h-48 md:h-80 max-w-lg mx-auto">
                {/* Rank 2 */}
                <div className="flex flex-col items-center flex-1">
                    <div className="w-full bg-gradient-to-br from-slate-100/50 to-slate-200/50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-t-2xl md:rounded-t-3xl p-2 md:p-5 text-center h-20 md:h-28 shadow-lg border border-slate-300/30 dark:border-slate-700/30">
                        <div className="text-[7px] md:text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-1">🥈 Runner Up</div>
                        <div className="text-[10px] md:text-sm font-bold truncate text-slate-800 dark:text-slate-100 mb-0.5 md:mb-1">
                            {topUsers[1]?.name}
                        </div>
                        <div className="text-xs md:text-lg text-primary font-black leading-none">{topUsers[1]?.total_xp} <span className="text-[8px] opacity-60">XP</span></div>
                    </div>
                </div>

                {/* Rank 1 */}
                <div className="flex flex-col items-center flex-1 z-10 scale-[1.05] md:scale-110">
                    <div className="relative mb-2 md:mb-4">
                        <div className="absolute -top-6 md:-top-10 left-1/2 -translate-x-1/2 text-yellow-500 animate-bounce text-2xl md:text-5xl">
                            👑
                        </div>
                        <div className="size-16 md:size-36 rounded-full border-2 md:border-4 border-yellow-400 bg-gradient-to-b from-white to-yellow-50 dark:from-slate-700 dark:to-slate-800 shadow-2xl shadow-yellow-500/30 overflow-hidden ring-4 md:ring-8 ring-yellow-400/20">
                            <div className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-slate-400">
                                <Icon name="person" size={40} mdSize={80} />
                            </div>
                        </div>
                    </div>
                    <div className="w-full bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-primary/30 dark:to-primary/20 rounded-t-2xl md:rounded-t-3xl p-3 md:p-6 text-center h-28 md:h-44 shadow-2xl border-x border-t-2 border-yellow-400/40 dark:border-primary/50">
                        <div className="text-[8px] md:text-xs font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-widest mb-1 md:mb-2 italic">🏆 Most Gacor</div>
                        <div className="text-xs md:text-lg font-black truncate text-slate-900 dark:text-white mb-1 md:mb-2">
                            {topUsers[0]?.name}
                        </div>
                        <div className="text-sm md:text-2xl text-yellow-600 dark:text-yellow-400 font-black tracking-tight">{topUsers[0]?.total_xp} <span className="text-[10px] opacity-60">XP</span></div>
                    </div>
                </div>

                {/* Rank 3 */}
                <div className="flex flex-col items-center flex-1">
                    <div className="size-10 md:size-20 rounded-full border-2 md:border-4 border-orange-300 bg-gradient-to-b from-white to-orange-50 dark:from-slate-700 dark:to-slate-800 shadow-lg overflow-hidden mb-2 relative">
                        <div className="absolute inset-0 flex items-center justify-center text-slate-300 dark:text-slate-400">
                            <Icon name="person" size={24} mdSize={40} />
                        </div>
                    </div>
                    <div className="w-full bg-gradient-to-br from-orange-50/50 to-orange-100/50 dark:from-slate-800/50 dark:to-slate-900/50 rounded-t-2xl md:rounded-t-3xl p-2 md:p-5 text-center h-16 md:h-24 shadow-lg border border-orange-300/30 dark:border-slate-700/30">
                        <div className="text-[7px] md:text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-1">🥉 Top 3 Slay</div>
                        <div className="text-[10px] md:text-xs font-bold truncate text-slate-700 dark:text-slate-300 mb-0.5 md:mb-1">
                            {topUsers[2]?.name}
                        </div>
                        <div className="text-[10px] md:text-sm text-primary font-black leading-none">{topUsers[2]?.total_xp} <span className="text-[7px] opacity-60">XP</span></div>
                    </div>
                </div>
            </div>

            {/* Other Rankings List */}
            <div className="space-y-2 md:space-y-4">
                {topUsers.map((user, index) => {
                    const isMe = user.id === currentUserId;

                    return (
                        <Card
                            key={user.id}
                            className={`p-3 md:p-5 flex items-center gap-3 md:gap-4 border-l-4 transition-all hover:scale-[1.02] active:scale-[0.98] ${isMe ? 'border-primary bg-primary/5 ring-2 ring-primary/10' : 'border-transparent dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/60'
                                }`}
                        >
                            <div className="size-6 md:size-8 font-black text-slate-400 text-center shrink-0 text-sm md:text-xl font-mono leading-none flex items-center justify-center">
                                {index + 1}
                            </div>

                            <div className="size-10 md:size-14 rounded-xl md:rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center shadow-inner overflow-hidden shrink-0 border-2 border-white dark:border-slate-700">
                                {user.image ? (
                                    <img src={user.image} alt={user.name} className="size-full object-cover" />
                                ) : (
                                    <Icon name="person" className="text-slate-400" size={20} mdSize={28} />
                                )}
                            </div>

                            <div className="flex-1 flex flex-col min-w-0">
                                <span className="font-black text-slate-900 dark:text-white flex items-center gap-1.5 md:gap-2 text-sm md:text-lg tracking-tight truncate">
                                    {user.name}
                                    {isMe && <Badge variant="primary" className="py-0 px-1 text-[7px] md:text-[9px] font-black">YOU</Badge>}
                                </span>
                                <div className="flex items-center gap-2 md:gap-3">
                                    <span className="text-[9px] md:text-xs font-bold text-slate-400 flex items-center gap-1">
                                        <Icon name="local_fire_department" className="text-orange-500" size={10} mdSize={16} filled />
                                        {user.current_streak}D
                                    </span>
                                </div>
                            </div>

                            <div className="text-right">
                                <div className="text-sm md:text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none mb-0.5">
                                    {user.total_xp}
                                </div>
                                <div className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] md:tracking-[0.2em] leading-none">
                                    XP
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </PageLayout>
    );
}
