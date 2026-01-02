'use client';

import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, Icon, Badge } from '@/components/ui/UIComponents';
import { UserProfileOverlay } from '@/components/ui/UserProfileOverlay';
import { AvatarFrame } from '@/components/ui/AvatarFrame';
import { useSound } from '@/hooks/use-sound';

interface LeaderboardClientProps {
    top3: any[];
    others: any[];
    currentUserId?: string;
    type: 'xp' | 'duel';
}

export default function LeaderboardClient({ top3, others, currentUserId, type }: LeaderboardClientProps) {
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const { playSound } = useSound();

    const handleUserClick = (user: any) => {
        if (!user) return;
        playSound('CLICK');
        setSelectedUser(user);
    };

    // Helper for Avatar Fallback
    const getInitials = (name: string) => (name ? name.charAt(0).toUpperCase() : '?');
    const getGradient = (id: string) => {
        const gradients = [
            'from-blue-400 to-indigo-500',
            'from-purple-400 to-pink-500',
            'from-emerald-400 to-teal-500',
            'from-orange-400 to-red-500',
            'from-pink-400 to-rose-500'
        ];
        const index = (id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
        return gradients[index];
    };

    return (
        <PageLayout activeTab="leaderboard">
            <div className="flex flex-col lg:flex-row lg:gap-10 xl:gap-12 lg:items-start max-w-7xl mx-auto px-4 md:px-8">

                {/* LEFT SIDE: Header + Podium - Responsive */}
                <div className="lg:w-[45%] lg:sticky lg:top-0 space-y-4 sm:space-y-6 lg:space-y-10">
                    <div className="text-left">
                        <div className="inline-block px-2 sm:px-3 py-0.5 sm:py-1 bg-primary/10 rounded-full mb-2 sm:mb-3 border border-primary/20">
                            <span className="text-[7px] sm:text-[8px] lg:text-[9px] font-black text-primary uppercase tracking-[0.2em] leading-none">Weekly Tournament</span>
                        </div>
                        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white mb-1.5 sm:mb-2 tracking-tighter leading-none italic uppercase">
                            HALL OF <span className="text-primary">{type === 'xp' ? 'FAME' : 'BATTLE'}</span>
                        </h1>
                        <p className="text-[8px] sm:text-[9px] lg:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest max-w-sm leading-relaxed">
                            {type === 'xp' ? 'Bro paling kenceng grinding-nya minggu ini. Literally tak terbendung!' : 'Para gladiator arena yang sudah mengumpulkan kemenangan terbanyak.'}
                        </p>

                        {/* MODE SELECTOR */}
                        <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800 w-fit mt-4">
                            <button
                                onClick={() => {
                                    playSound('CLICK');
                                    window.location.href = '/leaderboard?type=xp';
                                }}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${type === 'xp' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                XP RANKING
                            </button>
                            <button
                                onClick={() => {
                                    playSound('CLICK');
                                    window.location.href = '/leaderboard?type=duel';
                                }}
                                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${type === 'duel' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
                            >
                                TACTICAL DUELS
                            </button>
                        </div>
                    </div>

                    {/* Premium Podium Section - Ultra Compact for Mobile */}
                    <div className="relative flex items-end justify-center gap-1 sm:gap-2 lg:gap-4 pt-10 sm:pt-16 lg:pt-24 h-[140px] sm:h-[200px] lg:h-[300px] w-full">
                        {/* Decorative Background */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[150px] sm:size-[250px] lg:size-[400px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[40px] sm:blur-[60px] -z-10" />

                        {/* Rank 2 - Silver */}
                        <div
                            onClick={() => handleUserClick(top3[1])}
                            className="flex flex-col items-center flex-1 transition-transform hover:scale-105 cursor-pointer max-w-[70px] sm:max-w-[100px] lg:max-w-[140px]"
                        >
                            <div className="relative mb-3 sm:mb-5 lg:mb-10">
                                <AvatarFrame
                                    src={top3[1]?.image}
                                    alt={top3[1]?.name}
                                    borderId={top3[1]?.equipped_border}
                                    size="lg"
                                />
                                <div className="absolute -bottom-0.5 sm:-bottom-1 -right-0.5 sm:-right-1 z-30 size-3 sm:size-4 lg:size-7 bg-slate-300 text-slate-700 rounded-sm sm:rounded-md border border-white sm:border-2 dark:border-slate-900 flex items-center justify-center font-black text-[6px] sm:text-[7px] lg:text-xs">2</div>
                            </div>
                            <div className="w-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-t-md sm:rounded-t-lg p-0.5 sm:p-1.5 lg:p-3 text-center h-8 sm:h-12 lg:h-20 shadow-lg relative overflow-hidden group">
                                <h3 className="text-[6px] sm:text-[7px] lg:text-xs font-black truncate text-slate-800 dark:text-white mb-0 uppercase tracking-tight italic">{top3[1]?.name || 'Empty'}</h3>
                                <div className="text-[7px] sm:text-[9px] lg:text-sm font-black text-primary">
                                    {type === 'xp' ? `${(top3[1]?.total_xp || 0).toLocaleString('id-ID')} XP` : `${top3[1]?.duel_wins || 0} WINS`}
                                </div>
                            </div>
                        </div>

                        {/* Rank 1 - Golden King */}
                        <div
                            onClick={() => handleUserClick(top3[0])}
                            className="flex flex-col items-center flex-1 z-20 -translate-y-1 sm:-translate-y-2 lg:-translate-y-6 transition-transform hover:scale-110 cursor-pointer max-w-[90px] sm:max-w-[130px] lg:max-w-[180px]"
                        >
                            <div className="relative mb-4 sm:mb-8 lg:mb-16">
                                <Icon name="military_tech" size={16} className="absolute -top-6 sm:-top-10 lg:-top-20 left-1/2 -translate-x-1/2 text-yellow-500 animate-[bounce_2s_infinite] drop-shadow-[0_0_10px_rgba(234,179,8,0.5)] z-40 sm:size-5 lg:size-12" filled />
                                <AvatarFrame
                                    src={top3[0]?.image}
                                    alt={top3[0]?.name}
                                    borderId={top3[0]?.equipped_border}
                                    size="xl"
                                />
                                <div className="absolute -bottom-0.5 sm:-bottom-1 -right-0.5 sm:-right-1 z-30 size-4 sm:size-6 lg:size-10 bg-yellow-400 text-yellow-900 rounded-md sm:rounded-lg border-2 sm:border-3 lg:border-4 border-white dark:border-slate-900 flex items-center justify-center font-black text-[7px] sm:text-[10px] lg:text-base shadow-lg">1</div>
                            </div>
                            <div className="w-full bg-white dark:bg-slate-900 border-x border-t-2 border-yellow-400/40 rounded-t-lg sm:rounded-t-xl p-1 sm:p-2 lg:p-4 text-center h-10 sm:h-16 lg:h-28 shadow-2xl relative overflow-hidden group">
                                <h3 className="text-[7px] sm:text-[9px] lg:text-sm font-black truncate text-slate-900 dark:text-white mb-0 uppercase italic tracking-tighter group-hover:text-yellow-500">{top3[0]?.name || 'Empty'}</h3>
                                <div className="text-[8px] sm:text-xs lg:text-xl font-black text-yellow-500">
                                    {type === 'xp' ? `${(top3[0]?.total_xp || 0).toLocaleString('id-ID')} XP` : `${top3[0]?.duel_wins || 0} WINS`}
                                </div>
                                <Badge variant="streak" className="mt-0.5 sm:mt-1 mx-auto block w-fit py-0 px-0.5 sm:px-1 text-[4px] sm:text-[5px] lg:text-[7px]">PRO</Badge>
                            </div>
                        </div>

                        {/* Rank 3 - Bronze */}
                        <div
                            onClick={() => handleUserClick(top3[2])}
                            className="flex flex-col items-center flex-1 transition-transform hover:scale-105 cursor-pointer max-w-[60px] sm:max-w-[85px] lg:max-w-[120px]"
                        >
                            <div className="relative mb-2 sm:mb-3 lg:mb-6">
                                <AvatarFrame
                                    src={top3[2]?.image}
                                    alt={top3[2]?.name}
                                    borderId={top3[2]?.equipped_border}
                                    size="md"
                                />
                                <div className="absolute -bottom-0.5 -right-0.5 z-30 size-2.5 sm:size-3 lg:size-6 bg-orange-400 text-orange-900 rounded-sm border sm:border border-white dark:border-slate-900 flex items-center justify-center font-black text-[5px] sm:text-[6px] lg:text-[10px]">3</div>
                            </div>
                            <div className="w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-lg border border-slate-200/50 dark:border-slate-800/50 rounded-t-sm sm:rounded-t-md p-0.5 sm:p-1 lg:p-2.5 text-center h-6 sm:h-9 lg:h-16 shadow-sm relative overflow-hidden">
                                <h3 className="text-[5px] sm:text-[6px] lg:text-[10px] font-black truncate text-slate-700 dark:text-slate-200 mb-0 uppercase tracking-tight italic">{top3[2]?.name || 'Empty'}</h3>
                                <div className="text-[6px] sm:text-[8px] lg:text-xs font-black text-primary">
                                    {type === 'xp' ? `${(top3[2]?.total_xp || 0).toLocaleString('id-ID')} XP` : `${top3[2]?.duel_wins || 0} WINS`}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Ranking List - Responsive */}
                <div className="flex-1 w-full lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto hide-scrollbar mt-8 sm:mt-10 lg:mt-0">
                    <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 rounded-t-xl sm:rounded-t-2xl">
                        <span className="text-[8px] sm:text-[9px] lg:text-xs font-black uppercase text-slate-400 tracking-[0.2em]">Rank Bro</span>
                        <span className="text-[8px] sm:text-[9px] lg:text-xs font-black uppercase text-slate-400 tracking-[0.2em]">Power Level</span>
                    </div>

                    <div className="space-y-1.5 sm:space-y-2 lg:space-y-3 px-0.5 sm:px-1">
                        {others.map((user, index) => {
                            const isMe = user.id === currentUserId;
                            const rank = index + 4;
                            const isTrending = Math.random() > 0.7;

                            return (
                                <Card
                                    key={user.id}
                                    onClick={() => handleUserClick(user)}
                                    className={`group relative p-1.5 sm:p-2 lg:p-3 flex items-center gap-2 sm:gap-3 lg:gap-4 transition-all hover:translate-x-1 outline-none cursor-pointer ${isMe ? 'bg-primary/5 border-primary ring-1 ring-primary/20' : 'bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 hover:border-primary/20'
                                        }`}
                                >
                                    <div className="w-4 sm:w-6 lg:w-8 font-black text-slate-300 group-hover:text-primary transition-colors text-[9px] sm:text-xs lg:text-xl font-mono leading-none flex items-center justify-center shrink-0 tracking-tighter">
                                        {String(rank).padStart(2, '0')}
                                    </div>

                                    <div className="shrink-0 relative">
                                        <AvatarFrame
                                            src={user.image}
                                            alt={user.name}
                                            borderId={user.equipped_border}
                                            size="sm"
                                        />
                                        {isMe && <div className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 z-30 bg-primary rounded-full p-0.5 shadow-lg border border-white dark:border-slate-900">
                                            <Icon name="stars" size={7} className="text-white sm:size-2 lg:size-2.5" />
                                        </div>}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1 sm:gap-1.5 lg:gap-2">
                                            <span className={`font-black text-[9px] sm:text-xs lg:text-base truncate uppercase italic tracking-tight group-hover:text-primary transition-colors ${isMe ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                                                {user.name}
                                            </span>
                                            {isTrending && <Icon name="trending_up" size={9} className="text-emerald-500 animate-pulse-gentle sm:size-2.5 lg:size-3.5" />}
                                        </div>
                                        <div className="flex items-center gap-1 sm:gap-1.5">
                                            <Icon name="local_fire_department" size={7} className="text-orange-500 sm:size-2 lg:size-3" filled />
                                            <span className="text-[6px] sm:text-[7px] lg:text-[9px] font-black text-slate-400 uppercase tracking-widest">{user.current_streak.toLocaleString('id-ID')}D Streak</span>
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <div className={`text-[10px] sm:text-sm lg:text-2xl font-black tracking-tighter leading-none ${isMe ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                                            {type === 'xp' ? user.total_xp.toLocaleString('id-ID') : user.duel_wins}
                                        </div>
                                        <div className="text-[5px] sm:text-[6px] lg:text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                                            {type === 'xp' ? 'XP' : 'WINS'}
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                </div>
            </div>

            <UserProfileOverlay
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
            />
        </PageLayout>
    );
}
