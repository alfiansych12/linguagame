'use client';

import React, { useState, useEffect } from 'react';
import { Card, Icon, Badge, Button } from '@/components/ui/UIComponents';
import { useUserStore } from '@/store/user-store';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/db/supabase';
import { useSession } from 'next-auth/react';
import { useSound } from '@/hooks/use-sound';
import { useAlertStore } from '@/store/alert-store';
import { claimQuestReward } from '@/app/actions/userActions';

interface Quest {
    id: string;
    title: string;
    desc: string;
    target: number;
    current: number;
    reward: number;
    icon: string;
    claimed: boolean;
}

export function QuestGacor() {
    const { addGems } = useUserStore();
    const { data: session } = useSession();
    const { playSound } = useSound();
    const { showAlert } = useAlertStore();
    const [quests, setQuests] = useState<Quest[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchQuests = async () => {
            if (!session?.user?.id) return;
            setLoading(true);

            const { data, error } = await supabase
                .from('user_quests')
                .select('*')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (data) {
                const mappedQuests: Quest[] = data.map(q => ({
                    id: q.id,
                    title: q.quest_id === 'xp' ? 'XP Hunter' : q.quest_id === 'streak' ? 'Stay Hot' : 'Elite Grinder',
                    desc: q.quest_id === 'xp' ? `Collect ${q.target.toLocaleString('id-ID')} XP to slay.` : `Complete ${q.target.toLocaleString('id-ID')} activities today.`,
                    target: q.target,
                    current: q.progress,
                    reward: q.reward_gems,
                    icon: q.quest_id === 'xp' ? 'bolt' : 'local_fire_department',
                    claimed: q.status === 'CLAIMED'
                }));
                setQuests(mappedQuests);
            }
            setLoading(false);
        };

        fetchQuests();
    }, [session?.user?.id]);

    const handleClaim = async (quest: Quest) => {
        if (quest.current >= quest.target && !quest.claimed) {
            try {
                const result = await claimQuestReward(quest.id);

                if (!result.success) throw new Error(result.error);

                playSound('SUCCESS');
                addGems(quest.reward);
                setQuests(prev => prev.map(q => q.id === quest.id ? { ...q, claimed: true } : q));

                showAlert({
                    title: 'Reward Cair! 💎',
                    message: `Berhasil ambil ${quest.reward.toLocaleString('id-ID')} Crystal. Gass terus bro!`,
                    type: 'success'
                });
            } catch (err: any) {
                console.error('Error claiming quest:', err);
                showAlert({
                    title: 'Waduh Bro...',
                    message: err.message || 'Gagal ambil reward. Coba cek sinyal atau login ulang!',
                    type: 'error'
                });
            }
        }
    };

    return (
        <Card className="p-3 sm:p-6 lg:p-8 border border-primary/10 sm:border-2 sm:border-primary/20 bg-gradient-to-br from-white to-primary/5 dark:from-slate-900 dark:to-primary/10 relative overflow-hidden">
            {/* Header Section - Responsive */}
            <div className="relative z-10 space-y-4 sm:space-y-6 lg:space-y-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                    <div className="flex-1">
                        <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight notranslate" translate="no">
                            Quest <span className="text-primary">Gacor</span>
                        </h2>
                        <p className="text-[9px] sm:text-xs lg:text-sm font-bold text-slate-500 mt-0.5">
                            Daily tasks buat jajan di Forge.
                        </p>
                    </div>
                    <Badge variant="xp" icon="schedule" className="whitespace-nowrap text-[8px] sm:text-xs self-start sm:self-auto">
                        Reset in 14h
                    </Badge>
                </div>

                {/* Quest Grid - Mobile: 1 col, Tablet: 1 col, Desktop: 2 cols */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                    {quests.map((quest) => (
                        <motion.div
                            key={quest.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`p-3 sm:p-4 lg:p-5 rounded-xl sm:rounded-2xl lg:rounded-3xl border-2 transition-all ${quest.claimed
                                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 opacity-60'
                                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-primary/40 hover:shadow-lg'
                                }`}
                        >
                            {/* Quest Header */}
                            <div className="flex items-start gap-2 sm:gap-3 lg:gap-4 mb-3 sm:mb-4">
                                <div className={`size-8 sm:size-10 lg:size-12 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0 ${quest.claimed
                                    ? 'bg-emerald-500 text-white'
                                    : 'bg-primary/10 text-primary'
                                    }`}>
                                    <Icon
                                        name={quest.claimed ? 'check' : quest.icon}
                                        size={16}
                                        className="sm:size-5 lg:size-6"
                                        filled
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h4 className="font-black text-slate-900 dark:text-white uppercase text-[10px] sm:text-xs lg:text-sm notranslate truncate" translate="no">
                                            {quest.title}
                                        </h4>
                                        <div className="flex items-center gap-0.5 sm:gap-1 bg-primary/10 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg shrink-0">
                                            <Icon name="diamond" size={10} className="sm:size-3 text-primary" filled />
                                            <span className="text-[9px] sm:text-[10px] lg:text-xs font-black text-primary notranslate" translate="no">
                                                +{quest.reward.toLocaleString('id-ID')}
                                            </span>
                                        </div>
                                    </div>
                                    <p className="text-[9px] sm:text-[10px] lg:text-xs font-bold text-slate-500 leading-tight line-clamp-2">
                                        {quest.desc}
                                    </p>
                                </div>
                            </div>

                            {/* Progress Bar & Action */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 lg:gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between text-[8px] sm:text-[9px] lg:text-[10px] font-black uppercase text-slate-400 mb-1 sm:mb-1.5">
                                        <span>Progress</span>
                                        <span>{quest.current.toLocaleString('id-ID')}/{quest.target.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="h-1.5 sm:h-2 lg:h-2.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(quest.current / quest.target) * 100}%` }}
                                            className={`h-full transition-all duration-700 ${quest.claimed ? 'bg-emerald-500' : 'bg-gradient-to-r from-primary to-purple-500'
                                                }`}
                                        />
                                    </div>
                                </div>
                                <Button
                                    variant={quest.current >= quest.target && !quest.claimed ? 'primary' : 'secondary'}
                                    disabled={quest.current < quest.target || quest.claimed}
                                    onClick={() => handleClaim(quest)}
                                    className="px-3 sm:px-4 lg:px-6 h-7 sm:h-8 lg:h-10 text-[9px] sm:text-[10px] lg:text-xs rounded-lg sm:rounded-xl notranslate shrink-0"
                                    translate="no"
                                >
                                    {quest.claimed ? '✓ CLAIMED' : 'AMBIL'}
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Empty State */}
                {quests.length === 0 && !loading && (
                    <div className="text-center py-8 sm:py-12 lg:py-16">
                        <Icon name="inbox" size={48} className="sm:size-16 lg:size-20 text-slate-300 dark:text-slate-700 mx-auto mb-3 sm:mb-4" />
                        <p className="text-xs sm:text-sm lg:text-base font-bold text-slate-400">
                            Belum ada quest hari ini, bro!
                        </p>
                    </div>
                )}
            </div>

            {/* Background Decoration - Hidden on mobile for performance */}
            <Icon
                name="psychology"
                size={100}
                className="hidden sm:block absolute -bottom-8 -left-8 sm:size-32 lg:size-40 opacity-5 -z-0 rotate-12"
            />
        </Card>
    );
}
