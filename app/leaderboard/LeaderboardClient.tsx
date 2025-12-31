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
            <div className="flex flex-col lg:flex-row lg:gap-12 lg:items-start max-w-7xl mx-auto">

                {/* LEFT SIDE: Header + Podium */}
                <div className="lg:w-[45%] lg:sticky lg:top-0 space-y-6 md:space-y-10">
                    <div className="text-left">
                        <div className="inline-block px-3 py-1 bg-primary/10 rounded-full mb-3 border border-primary/20">
                            <span className="text-[8px] md:text-[9px] font-black text-primary uppercase tracking-[0.2em] leading-none">Weekly Tournament</span>
                        </div>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter leading-none italic uppercase">
                            HALL OF <span className="text-primary">FAME</span>
                        </h1>
                        <p className="text-[9px] md:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest max-w-sm leading-relaxed">
                            Sirkel paling kenceng grinding-nya minggu ini. Literally tak terbendung!
                        </p>
                    </div>

                    {/* Premium Podium Section - Compact */}
                    <div className="relative flex items-end justify-center gap-1 md:gap-4 pt-16 md:pt-24 h-[160px] md:h-[300px] w-full">
                        {/* Decorative Background */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-[200px] md:size-[400px] bg-primary/5 dark:bg-primary/10 rounded-full blur-[60px] -z-10" />

                        {/* Rank 2 - Silver */}
                        <div
                            onClick={() => handleUserClick(top3[1])}
                            className="flex flex-col items-center flex-1 transition-transform hover:scale-105 cursor-pointer max-w-[100px] md:max-w-[140px]"
                        >
                            <div className="relative mb-1 md:mb-3">
                                <div className="size-10 md:size-20 rounded-xl bg-gradient-to-br from-slate-200 to-slate-400 dark:from-slate-700 dark:to-slate-900 p-0.5 shadow-xl ring-2 ring-slate-100 dark:ring-slate-800">
                                    <div className="size-full rounded-[0.5rem] md:rounded-[1.1rem] bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center">
                                        {top3[1]?.image ? (
                                            <img src={top3[1].image} className="size-full object-cover" />
                                        ) : (
                                            <div className={`size-full bg-gradient-to-br ${getGradient(top3[1]?.id || '2')} flex items-center justify-center text-white font-black text-sm md:text-lg`}>
                                                {getInitials(top3[1]?.name)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="absolute -bottom-1 -right-1 size-3.5 md:size-7 bg-slate-300 text-slate-700 rounded-md border-2 border-white dark:border-slate-900 flex items-center justify-center font-black text-[7px] md:text-xs">2</div>
                            </div>
                            <div className="w-full bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-t-lg p-1 md:p-3 text-center h-10 md:h-20 shadow-lg relative overflow-hidden group">
                                <h3 className="text-[7px] md:text-xs font-black truncate text-slate-800 dark:text-white mb-0 uppercase tracking-tight italic">{top3[1]?.name || 'Empty'}</h3>
                                <div className="text-[9px] md:text-sm font-black text-primary">{top3[1]?.total_xp || 0} XP</div>
                            </div>
                        </div>

                        {/* Rank 1 - Golden King */}
                        <div
                            onClick={() => handleUserClick(top3[0])}
                            className="flex flex-col items-center flex-1 z-20 -translate-y-2 md:-translate-y-6 transition-transform hover:scale-110 cursor-pointer max-w-[120px] md:max-w-[180px]"
                        >
                            <div className="relative mb-1.5 md:mb-4">
                                <Icon name="military_tech" className="absolute -top-5 md:-top-12 left-1/2 -translate-x-1/2 text-yellow-500 animate-[bounce_2s_infinite] drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" size={20} mdSize={48} filled />
                                <div className="size-14 md:size-28 rounded-2xl bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 p-0.5 shadow-[0_0_20px_rgba(234,179,8,0.3)] ring-2 md:ring-4 ring-yellow-400/20">
                                    <div className="size-full rounded-[0.8rem] md:rounded-[1.7rem] bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center">
                                        {top3[0]?.image ? (
                                            <img src={top3[0].image} className="size-full object-cover" />
                                        ) : (
                                            <div className={`size-full bg-gradient-to-br ${getGradient(top3[0]?.id || '1')} flex items-center justify-center text-white font-black text-lg md:text-2xl`}>
                                                {getInitials(top3[0]?.name)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="absolute -bottom-1 -right-1 size-5 md:size-10 bg-yellow-400 text-yellow-900 rounded-lg border-2 md:border-4 border-white dark:border-slate-900 flex items-center justify-center font-black text-[8px] md:text-base">1</div>
                            </div>
                            <div className="w-full bg-white dark:bg-slate-900 border-x border-t-2 border-yellow-400/40 rounded-t-xl p-1.5 md:p-4 text-center h-14 md:h-28 shadow-2xl relative overflow-hidden group">
                                <h3 className="text-[8px] md:text-sm font-black truncate text-slate-900 dark:text-white mb-0 uppercase italic tracking-tighter group-hover:text-yellow-500">{top3[0]?.name || 'Empty'}</h3>
                                <div className="text-[10px] md:text-xl font-black text-yellow-500">{top3[0]?.total_xp || 0} XP</div>
                                <Badge variant="streak" className="mt-1 mx-auto block w-fit py-0 px-1 text-[5px] md:text-[7px]">PRO</Badge>
                            </div>
                        </div>

                        {/* Rank 3 - Bronze */}
                        <div
                            onClick={() => handleUserClick(top3[2])}
                            className="flex flex-col items-center flex-1 transition-transform hover:scale-105 cursor-pointer max-w-[80px] md:max-w-[120px]"
                        >
                            <div className="relative mb-1">
                                <div className="size-8 md:size-16 rounded-lg bg-gradient-to-br from-orange-300 to-orange-500 dark:from-orange-800 dark:to-slate-950 p-0.5 ring-2 ring-orange-100 dark:ring-slate-800">
                                    <div className="size-full rounded-[0.4rem] md:rounded-[0.9rem] bg-white dark:bg-slate-900 overflow-hidden flex items-center justify-center">
                                        {top3[2]?.image ? (
                                            <img src={top3[2].image} className="size-full object-cover" />
                                        ) : (
                                            <div className={`size-full bg-gradient-to-br ${getGradient(top3[2]?.id || '3')} flex items-center justify-center text-white font-black text-xs md:text-base`}>
                                                {getInitials(top3[2]?.name)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="absolute -bottom-0.5 -right-0.5 size-3 md:size-6 bg-orange-400 text-orange-900 rounded-sm border md:border-2 border-white dark:border-slate-900 flex items-center justify-center font-black text-[6px] md:text-[10px]">3</div>
                            </div>
                            <div className="w-full bg-white/40 dark:bg-slate-900/40 backdrop-blur-lg border border-slate-200/50 dark:border-slate-800/50 rounded-t-md p-1 md:p-2.5 text-center h-8 md:h-16 shadow-sm relative overflow-hidden">
                                <h3 className="text-[6px] md:text-[10px] font-black truncate text-slate-700 dark:text-slate-200 mb-0 uppercase tracking-tight italic">{top3[2]?.name || 'Empty'}</h3>
                                <div className="text-[8px] md:text-xs font-black text-primary">{top3[2]?.total_xp || 0} XP</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Ranking List */}
                <div className="flex-1 w-full lg:max-h-[calc(100vh-200px)] lg:overflow-y-auto hide-scrollbar mt-12 lg:mt-0">
                    <div className="flex items-center justify-between px-4 py-3 sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 rounded-t-2xl">
                        <span className="text-[9px] md:text-xs font-black uppercase text-slate-400 tracking-[0.2em]">Rank Sirkel</span>
                        <span className="text-[9px] md:text-xs font-black uppercase text-slate-400 tracking-[0.2em]">Power Level</span>
                    </div>

                    <div className="space-y-2 md:space-y-3 px-1">
                        {others.map((user, index) => {
                            const isMe = user.id === currentUserId;
                            const rank = index + 4;
                            const isTrending = Math.random() > 0.7;

                            return (
                                <Card
                                    key={user.id}
                                    onClick={() => handleUserClick(user)}
                                    className={`group relative p-1.5 md:p-3 flex items-center gap-3 md:gap-4 transition-all hover:translate-x-1 outline-none cursor-pointer ${isMe ? 'bg-primary/5 border-primary ring-1 ring-primary/20' : 'bg-white dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 hover:border-primary/20'
                                        }`}
                                >
                                    <div className="w-5 md:w-8 font-black text-slate-300 group-hover:text-primary transition-colors text-[10px] md:text-xl font-mono leading-none flex items-center justify-center shrink-0 tracking-tighter">
                                        {String(rank).padStart(2, '0')}
                                    </div>

                                    <div className="size-8 md:size-11 rounded-lg bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 border md:border-2 border-white dark:border-slate-700 shadow-sm relative overflow-hidden">
                                        {user.image ? (
                                            <img src={user.image} alt={user.name} className="size-full object-cover" />
                                        ) : (
                                            <div className={`size-full bg-gradient-to-br ${getGradient(user.id)} flex items-center justify-center text-white font-black text-[9px] md:text-xs`}>
                                                {getInitials(user.name)}
                                            </div>
                                        )}
                                        {isMe && <div className="absolute inset-0 bg-primary/20 backdrop-blur-[1px] flex items-center justify-center">
                                            <Icon name="stars" className="text-primary" size={10} mdSize={14} />
                                        </div>}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 md:gap-2">
                                            <span className={`font-black text-[10px] md:text-base truncate uppercase italic tracking-tight group-hover:text-primary transition-colors ${isMe ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                                                {user.name}
                                            </span>
                                            {isTrending && <Icon name="trending_up" className="text-emerald-500 animate-pulse-gentle" size={10} mdSize={14} />}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Icon name="local_fire_department" className="text-orange-500" size={8} mdSize={12} filled />
                                            <span className="text-[7px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">{user.current_streak}D Streak</span>
                                        </div>
                                    </div>

                                    <div className="text-right shrink-0">
                                        <div className={`text-xs md:text-2xl font-black tracking-tighter leading-none ${isMe ? 'text-primary' : 'text-slate-900 dark:text-white'}`}>
                                            {user.total_xp}
                                        </div>
                                        <div className="text-[6px] md:text-[8px] font-black text-slate-400 uppercase tracking-widest leading-none mt-0.5">
                                            XP
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
