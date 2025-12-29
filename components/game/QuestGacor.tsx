'use client';

import React, { useState, useEffect } from 'react';
import { Card, Icon, Badge, Button, ProgressBar } from '@/components/ui/UIComponents';
import { useUserStore } from '@/store/user-store';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [quests, setQuests] = useState<Quest[]>([
        {
            id: 'login',
            title: 'Sapa Sirkel',
            desc: 'Login hari ini buat absen gacor.',
            target: 1,
            current: 1,
            reward: 50,
            icon: 'waving_hand',
            claimed: false
        },
        {
            id: 'duel_win',
            title: 'Arena Conqueror',
            desc: 'Win 1 match di Sirkel Arena.',
            target: 1,
            current: 0,
            reward: 200,
            icon: 'military_tech',
            claimed: false
        },
        {
            id: 'lesson_3',
            title: 'Grinding Sepuh',
            desc: 'Selesaikan 3 level journey mumpung semangat.',
            target: 3,
            current: 1,
            reward: 500,
            icon: 'menu_book',
            claimed: false
        }
    ]);

    const handleClaim = (quest: Quest) => {
        if (quest.current >= quest.target && !quest.claimed) {
            addGems(quest.reward);
            setQuests(prev => prev.map(q => q.id === quest.id ? { ...q, claimed: true } : q));
        }
    };

    return (
        <Card className="p-8 border-2 border-primary/20 bg-gradient-to-br from-white to-primary/5 dark:from-slate-900 dark:to-primary/10 relative overflow-hidden">
            <div className="relative z-10 space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Quest <span className="text-primary">Gacor</span></h2>
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
                                        <h4 className="font-black text-slate-900 dark:text-white uppercase text-sm">{quest.title}</h4>
                                        <span className="text-xs font-black text-primary">+{quest.reward} Crystals</span>
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
                                    className="px-6 h-10 text-xs rounded-xl"
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
