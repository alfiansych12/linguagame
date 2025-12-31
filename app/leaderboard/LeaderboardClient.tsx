'use client';

import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, Icon, Badge } from '@/components/ui/UIComponents';
import { UserProfileOverlay } from '@/components/ui/UserProfileOverlay';
import { useSound } from '@/hooks/use-sound';

interface LeaderboardClientProps {
    top3: any[];
    others: any[];
    currentUserId?: string;
}

export default function LeaderboardClient({ top3, others, currentUserId }: LeaderboardClientProps) {
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
            <div className="text-center mb-10 md:mb-20">
                <div className="inline-block px-4 py-1.5 bg-primary/10 rounded-full mb-4 border border-primary/20">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] leading-none">Weekly Tournament</span>
                </div>
                <h1 className="text-5xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter leading-none italic uppercase">
                    HALL OF <span className="text-primary">FAME</span>
                </h1>
                <p className="text-[11px] md:text-xl text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest max-w-sm md:max-w-2xl mx-auto leading-relaxed">
                    Sirkel paling kenceng grinding-nya minggu ini. Literally tak terbendung!
                </p>
            </div>

            {/* Premium Podium Section */}
            <div className="relative mb-16 md:mb-40 flex items-end justify-center gap-1.5 md:gap-8 max-w-3xl mx-auto pt-12 md:pt-24 px-4 h-[260px] md:h-[480px]">
                {/* Decorative Background Guncang */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[300px] md:size-[600px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[100px] -z-10" />

                {/* Rank 2 - Silver */}
                <div
                    onClick={() => handleUserClick(top3[1])}
                    className="flex flex-col items-center flex-1 transition-transform hover:scale-105 cursor-pointer"
                >
                    <div className="relative mb-2 md:mb-6">
                        <div className="size-14 md:size-28 rounded-[1.5rem] md:rounded-[2rem] bg-gradient-to-br from-slate-200 to-slate-400 dark:from-slate-700 dark:to-slate-900 p-0.5 shadow-xl ring-2 md:ring-4 ring-slate-100 dark:ring-slate-800">
                            <div className="size-full rounded-[1.4rem] md:rounded-[1.9rem] bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center">
                                {top3[1]?.image ? (
                                    <img src={top3[1].image} className="size-full object-cover" />
                                ) : (
                                    <div className={`size-full bg-gradient-to-br ${getGradient(top3[1]?.id || '2')} flex items-center justify-center text-white font-black text-xl md:text-2xl`}>
                                        {getInitials(top3[1]?.name)}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="absolute -bottom-1.5 -right-1.5 size-5 md:size-10 bg-slate-300 text-slate-700 rounded-lg md:rounded-2xl border-2 md:border-4 border-white dark:border-slate-900 flex items-center justify-center font-black text-[9px] md:text-base">2</div>
                    </div>
                    <div className="w-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-t-xl md:rounded-t-[3rem] p-2 md:p-8 text-center h-16 md:h-36 shadow-lg relative overflow-hidden group">
                        <div className="absolute top-0 inset-x-0 h-0.5 md:h-1 bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-50" />
                        <h3 className="text-[9px] md:text-lg font-black truncate text-slate-800 dark:text-white mb-0.5 md:mb-1 uppercase tracking-tight italic group-hover:text-primary transition-colors">{top3[1]?.name || 'Empty'}</h3>
                        <div className="text-xs md:text-2xl font-black text-primary">{top3[1]?.total_xp || 0} <span className="text-[7px] md:text-xs text-slate-400 font-bold uppercase tracking-widest">XP</span></div>
                    </div>
                </div>

                {/* Rank 1 - Golden King */}
                <div
                    onClick={() => handleUserClick(top3[0])}
                    className="flex flex-col items-center flex-1 z-20 -translate-y-4 md:-translate-y-12 transition-transform hover:scale-110 cursor-pointer"
                >
                    <div className="relative mb-3 md:mb-8">
                        <Icon name="military_tech" className="absolute -top-7 md:-top-20 left-1/2 -translate-x-1/2 text-yellow-500 animate-[bounce_2s_infinite] drop-shadow-[0_0_20px_rgba(234,179,8,0.5)]" size={30} mdSize={80} filled />
                        <div className="size-20 md:size-44 rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 p-0.5 md:p-1 shadow-[0_0_30px_rgba(234,179,8,0.3)] ring-2 md:ring-8 ring-yellow-400/20">
                            <div className="size-full rounded-[1.9rem] md:rounded-[2.4rem] bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center">
                                {top3[0]?.image ? (
                                    <img src={top3[0].image} className="size-full object-cover" />
                                ) : (
                                    <div className={`size-full bg-gradient-to-br ${getGradient(top3[0]?.id || '1')} flex items-center justify-center text-white font-black text-2xl md:text-4xl`}>
                                        {getInitials(top3[0]?.name)}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="absolute -bottom-2 -right-2 size-8 md:size-16 bg-yellow-400 text-yellow-900 rounded-xl md:rounded-3xl border-2 md:border-8 border-white dark:border-slate-900 flex items-center justify-center font-black text-[10px] md:text-2xl shadow-lg">1</div>
                    </div>
                    <div className="w-full bg-white dark:bg-slate-900 border-x border-t-2 border-yellow-400/40 rounded-t-2xl md:rounded-t-[4rem] p-2.5 md:p-10 text-center h-24 md:h-52 shadow-2xl relative overflow-hidden group">
                        <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute top-0 inset-x-0 h-1 md:h-1.5 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
                        <h3 className="text-[10px] md:text-2xl font-black truncate text-slate-900 dark:text-white mb-0.5 md:mb-2 uppercase italic tracking-tighter group-hover:text-yellow-500 transition-colors">{top3[0]?.name || 'Empty'}</h3>
                        <div className="text-sm md:text-4xl font-black text-yellow-500 drop-shadow-sm">{top3[0]?.total_xp || 0} <span className="text-[8px] md:text-base text-yellow-500/50">XP</span></div>
                        <Badge variant="streak" className="mt-1 md:mt-4 mx-auto block w-fit py-0 px-2 md:px-4 text-[6px] md:text-[10px]">ULTIMATE GACOR</Badge>
                    </div>
                </div>

                {/* Rank 3 - Bronze */}
                <div
                    onClick={() => handleUserClick(top3[2])}
                    className="flex flex-col items-center flex-1 transition-transform hover:scale-105 cursor-pointer"
                >
                    <div className="relative mb-1.5 md:mb-5">
                        <div className="size-12 md:size-24 rounded-[1.3rem] md:rounded-[1.8rem] bg-gradient-to-br from-orange-300 to-orange-500 dark:from-orange-800 dark:to-slate-950 p-0.5 shadow-xl ring-2 md:ring-4 ring-orange-100 dark:ring-slate-800">
                            <div className="size-full rounded-[1.2rem] md:rounded-[1.7rem] bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center">
                                {top3[2]?.image ? (
                                    <img src={top3[2].image} className="size-full object-cover" />
                                ) : (
                                    <div className={`size-full bg-gradient-to-br ${getGradient(top3[2]?.id || '3')} flex items-center justify-center text-white font-black text-lg md:text-xl`}>
                                        {getInitials(top3[2]?.name)}
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="absolute -bottom-1 -right-1 size-4 md:size-9 bg-orange-400 text-orange-900 rounded-md md:rounded-xl border md:border-4 border-white dark:border-slate-900 flex items-center justify-center font-black text-[8px] md:text-sm">3</div>
                    </div>
                    <div className="w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-lg border border-slate-200/50 dark:border-slate-800/50 rounded-t-lg md:rounded-t-[2.5rem] p-1.5 md:p-6 text-center h-14 md:h-28 shadow-md relative overflow-hidden group">
                        <div className="absolute top-0 inset-x-0 h-0.5 md:h-1 bg-gradient-to-r from-transparent via-orange-400/50 to-transparent opacity-40" />
                        <h3 className="text-[8px] md:text-base font-black truncate text-slate-700 dark:text-slate-200 mb-0 md:mb-1 uppercase tracking-tight italic group-hover:text-primary transition-colors">{top3[2]?.name || 'Empty'}</h3>
                        <div className="text-[10px] md:text-xl font-black text-primary">{top3[2]?.total_xp || 0} <span className="text-[6px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest">XP</span></div>
                    </div>
                </div>
            </div>

            {/* Optimized Rankings List */}
            <div className="max-w-4xl mx-auto space-y-2.5 md:space-y-4 px-2 md:px-4">
                <div className="flex items-center justify-between px-6 py-2 mb-2">
                    <span className="text-[10px] md:text-xs font-black uppercase text-slate-400 tracking-[0.2em]">Sirkel Rank</span>
                    <span className="text-[10px] md:text-xs font-black uppercase text-slate-400 tracking-[0.2em]">Power Level</span>
                </div>

                {others.map((user, index) => {
                    const isMe = user.id === currentUserId;
                    const rank = index + 4;
                    const isTrending = Math.random() > 0.7; // Simulating trending status (would come from DB ideally)

                    return (
                        <Card
                            key={user.id}
                            onClick={() => handleUserClick(user)}
                            className={`group relative p-2 md:p-5 flex items-center gap-3 md:gap-4 transition-all hover:translate-x-1 outline-none cursor-pointer ${isMe ? 'bg-primary/5 border-primary ring-1 ring-primary/20' : 'bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 hover:border-primary/20'
                                }`}
                        >
                            <div className="w-5 md:w-10 font-black text-slate-300 group-hover:text-primary transition-colors text-[10px] md:text-2xl font-mono leading-none flex items-center justify-center shrink-0 tracking-tighter">
                                {String(rank).padStart(2, '0')}
                            </div>

                            <div className="size-9 md:size-16 rounded-lg md:rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 border md:border-2 border-white dark:border-slate-700 shadow-sm relative overflow-hidden">
                                {user.image ? (
                                    <img src={user.image} alt={user.name} className="size-full object-cover" />
                                ) : (
                                    <div className={`size-full bg-gradient-to-br ${getGradient(user.id)} flex items-center justify-center text-white font-black text-[10px] md:text-base`}>
                                        {getInitials(user.name)}
                                    </div>
                                )}
                                {isMe && <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] flex items-center justify-center">
                                    <Icon name="stars" className="text-primary" size={12} mdSize={16} />
                                </div>}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 md:gap-2 mb-0.5">
                                    <span className={`font-black text-[11px] md:text-xl truncate uppercase italic tracking-tight group-hover:text-primary transition-colors ${isMe ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                                        {user.name}
                                    </span>
                                    {isMe && <Badge variant="primary" className="py-0 px-1 text-[6px] md:text-[8px]">YOU</Badge>}
                                    {isTrending && <Icon name="trending_up" className="text-emerald-500 animate-pulse-gentle" size={12} mdSize={18} />}
                                </div>
                                <div className="flex items-center gap-2 md:gap-3">
                                    <div className="flex items-center gap-1">
                                        <Icon name="local_fire_department" className="text-orange-500" size={8} mdSize={14} filled />
                                        <span className="text-[8px] md:text-xs font-black text-slate-400 uppercase tracking-widest">{user.current_streak}D Streak</span>
                                    </div>
                                </div>
                            </div>

                            <div className="text-right shrink-0">
                                <div className={`text-xs md:text-3xl font-black tracking-tighter leading-none ${isMe ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                                    {user.total_xp}
                                </div>
                                <div className="text-[7px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mt-0.5 md:mt-1">
                                    XP Points
                                </div>
                            </div>
                        </Card>
                    );
                })}

                {/* Bottom Observer Shadow */}
                <div className="h-20 md:h-32 pointer-events-none bg-gradient-to-t from-background via-background/80 to-transparent absolute bottom-0 inset-x-0 z-10" />
            </div>

            <UserProfileOverlay
                user={selectedUser}
                onClose={() => setSelectedUser(null)}
            />
        </PageLayout>
    );
}
