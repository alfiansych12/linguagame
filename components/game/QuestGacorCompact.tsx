'use client';

import React, { useState } from 'react';
import { Card, Icon, Badge, Button } from '@/components/ui/UIComponents';
import { useUserStore } from '@/store/user-store';

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

export function QuestGacorCompact() {
    const { addGems } = useUserStore();
    const [quests, setQuests] = useState<Quest[]>([
        {
            id: 'login',
            title: 'XP Hunter',
            desc: 'Login bonus harian.',
            target: 1,
            current: 1,
            reward: 50,
            icon: 'waving_hand',
            claimed: false
        },
        {
            id: 'streak',
            title: 'Stay Hot',
            desc: 'Maintain streak.',
            target: 1,
            current: 1,
            reward: 100,
            icon: 'local_fire_department',
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
        <Card className="p-6 border-2 border-primary/20 bg-gradient-to-br from-white to-primary/5 dark:from-slate-900 dark:to-primary/10">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Quest <span className="text-primary">Gacor</span></h3>
                        <p className="text-sm font-bold text-slate-500">Daily missions</p>
                    </div>
                    <Badge variant="xp" icon="schedule" className="text-xs">14h</Badge>
                </div>

                <div className="space-y-3">
                    {quests.map((quest) => (
                        <div key={quest.id} className={`p-4 rounded-2xl border-2 transition-all ${quest.claimed ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800 opacity-60' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700'}`}>
                            <div className="flex items-center gap-3 mb-3">
                                <div className={`size-10 rounded-xl flex items-center justify-center ${quest.claimed ? 'bg-emerald-500 text-white' : 'bg-slate-100 dark:bg-slate-700 text-primary'}`}>
                                    <Icon name={quest.claimed ? 'check' : quest.icon} size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h4 className="font-black text-slate-900 dark:text-white text-base truncate">{quest.title}</h4>
                                        <span className="text-sm font-black text-primary whitespace-nowrap">+{quest.reward.toLocaleString('id-ID')}</span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-500 leading-tight">{quest.desc}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <div className="flex justify-between text-xs font-black uppercase text-slate-400 mb-1">
                                        <span>Progress</span>
                                        <span>{quest.current.toLocaleString('id-ID')}/{quest.target.toLocaleString('id-ID')}</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
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
                                    className="px-4 h-8 text-xs rounded-xl font-black"
                                >
                                    {quest.claimed ? 'OK' : 'AMBIL'}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                <button className="w-full text-center text-primary font-black text-sm hover:text-primary-dark transition-colors uppercase tracking-widest">
                    View All Quests →
                </button>
            </div>
        </Card>
    );
}
