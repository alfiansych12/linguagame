'use client';

import React, { useState, useEffect } from 'react';
import { Card, Icon, Badge, Button, ProgressBar } from '@/components/ui/UIComponents';
import { useUserStore } from '@/store/user-store';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/db/supabase';
import { useSession } from 'next-auth/react';
import { useSound } from '@/hooks/use-sound';

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
                    desc: q.quest_id === 'xp' ? `Collect ${q.target} XP to slay.` : `Complete ${q.target} activities today.`,
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
                // Update in Supabase
                const { error } = await supabase
                    .from('user_quests')
                    .update({ status: 'CLAIMED' })
                    .eq('id', quest.id);

                if (error) throw error;

                // Update local store/state
                playSound('SUCCESS');
                addGems(quest.reward);
                setQuests(prev => prev.map(q => q.id === quest.id ? { ...q, claimed: true } : q));
            } catch (err) {
                console.error('Error claiming quest:', err);
                alert('Gagal ambil reward sirkel. Coba lagi nanti!');
            }
        }
    };

    return (
        <Card className="p-8 border-2 border-primary/20 bg-gradient-to-br from-white to-primary/5 dark:from-slate-900 dark:to-primary/10 relative overflow-hidden">
            <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight notranslate" translate="no">Quest <span className="text-primary">Gacor</span></h2>
                        <p className="text-sm font-bold text-slate-500">Daily tasks buat jajan di Forge.</p>
                    </div>
                    <Badge variant="xp" icon="schedule">Reset in 14h</Badge>
                </div>

                <div className="space-y-4">
                    {quests.map((quest) => (
                        <div key={quest.id} className={`p-6 rounded-3xl border-2 transition-all ${quest.claimed ? 'bg-emerald-50 border-emerald-200 opacity-60' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-800'}`}>
                            <div className="flex items-center gap-4 mb-4">
                                <div className={`size-12 rounded-2xl flex items-center justify-center ${quest.claimed ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-primary'}`}>
                                    <Icon name={quest.claimed ? 'check' : quest.icon} size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm notranslate" translate="no">{quest.title}</h4>
                                        <span className="text-xs font-black text-primary notranslate" translate="no">+{quest.reward} Crystals</span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 leading-tight">{quest.desc}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                                    <div className="flex justify-between text-[10px] font-black uppercase text-slate-400 mb-1">
                                        <span>Progress</span>
                                        <span>{quest.current}/{quest.target}</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-700 ${quest.claimed ? 'bg-emerald-500' : 'bg-primary'}`}
                                            style={{ width: `${(quest.current / quest.target) * 100}%` }}
                                        />
                                    </div>
                                </div>
                                <Button
                                    variant={quest.current >= quest.target && !quest.claimed ? 'primary' : 'secondary'}
                                    disabled={quest.current < quest.target || quest.claimed}
                                    onClick={() => handleClaim(quest)}
                                    className="px-6 h-10 text-xs rounded-xl notranslate"
                                    translate="no"
                                >
                                    {quest.claimed ? 'CLAIMED' : 'AMBIL'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Icon name="psychology" size={150} className="absolute -bottom-10 -left-10 opacity-5 -z-0 rotate-12" />
        </Card>
    );
}
