'use client';

import React from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, Icon, Badge, Button, ProgressBar } from '@/components/ui/UIComponents';
import { useUserStore } from '@/store/user-store';
import { ACHIEVEMENTS } from '@/lib/data/achievements';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function AchievementsPage() {
    const router = useRouter();
    const {
        unlockedAchievements, totalXp, vocabCount, currentStreak,
        gems, duelWins, totalSpent
    } = useUserStore();

    const getProgress = (ach: any) => {
        let currentVal = 0;
        switch (ach.type) {
            case 'xp': currentVal = totalXp; break;
            case 'vocab': currentVal = vocabCount; break;
            case 'streak': currentVal = currentStreak; break;
            case 'gems': currentVal = gems; break;
            case 'wins': currentVal = duelWins; break;
            case 'spent': currentVal = totalSpent; break;
        }
        return {
            current: currentVal,
            percent: Math.min(100, (currentVal / ach.target) * 100)
        };
    };

    const unlockedCount = unlockedAchievements.length;
    const totalCount = ACHIEVEMENTS.length;

    return (
        <PageLayout activeTab="profile">
            <div className="max-w-4xl mx-auto py-4 md:py px-4">
                {/* Back Button */}
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-8 text-slate-500 hover:text-primary gap-2"
                >
                    <Icon name="arrow_back" size={20} />
                    Balik ke Profil
                </Button>

                {/* Header Section */}
                <div className="relative mb-8 md:mb-12 text-center md:text-left">
                    <div className="relative z-10 space-y-4">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 md:gap-6">
                            <div>
                                <h1 className="text-2xl sm:text-4xl md:text-6xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
                                    HALL OF <span className="text-primary">GACOR</span>
                                </h1>
                                <p className="text-slate-500 font-bold text-xs md:text-lg">
                                    Daftar badge kebanggaan buat sirkel LinguaGame. Literally Sepuh.
                                </p>
                            </div>
                            <div className="bg-slate-900 text-white p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-2 border-primary/20 shadow-xl shadow-primary/10">
                                <div className="text-[8px] md:text-[10px] font-black uppercase text-primary mb-1 pl-1">Total Koleksi</div>
                                <div className="text-2xl md:text-3xl font-black italic">{unlockedCount} <span className="text-[10px] md:text-xs text-slate-500">/ {totalCount}</span></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Achievements List */}
                <div className="space-y-3 md:space-y-4">
                    {ACHIEVEMENTS.map((ach, idx) => {
                        const isUnlocked = unlockedAchievements.includes(ach.id);
                        const progress = getProgress(ach);

                        return (
                            <motion.div
                                key={ach.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className={`relative p-2.5 md:p-5 flex items-center gap-3 md:gap-6 transition-all overflow-hidden ${!isUnlocked ? 'bg-white/40 dark:bg-slate-900/40' : 'border-l-4 border-l-yellow-400 bg-white dark:bg-slate-900 shadow-lg shadow-primary/5'}`}>
                                    {/* Icon Box */}
                                    <div className={`size-10 md:size-16 rounded-lg md:rounded-2xl flex items-center justify-center shrink-0 relative ${isUnlocked ? 'bg-yellow-400 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                                        <Icon name={ach.icon} size={20} mdSize={32} filled={isUnlocked} />
                                        {isUnlocked && (
                                            <div className="absolute -top-1 -right-1 size-4 md:size-5 bg-emerald-500 text-white rounded-full flex items-center justify-center border md:border-2 border-white dark:border-slate-900 shadow-sm">
                                                <Icon name="check" size={8} mdSize={10} />
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Area */}
                                    <div className="flex-1 min-w-0 flex flex-col md:flex-row md:items-center justify-between gap-1.5 md:gap-4">
                                        <div className="min-w-0">
                                            <h3 className={`text-[11px] md:text-lg font-black uppercase italic tracking-tight truncate ${isUnlocked ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                                {ach.title}
                                            </h3>
                                            <p className="text-[9px] md:text-xs font-bold text-slate-500 truncate mt-0.5">
                                                {ach.desc}
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between md:justify-end gap-2 md:gap-3 shrink-0">
                                            <div className="text-right">
                                                <div className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">Status</div>
                                                <div className="text-[9px] md:text-sm font-black text-slate-900 dark:text-white leading-none">
                                                    {progress.current} <span className="text-slate-400 italic">/ {ach.target}</span>
                                                </div>
                                            </div>
                                            {isUnlocked ? (
                                                <Badge variant="xp" className="text-[7px] md:text-[10px] px-1.5 md:px-2 py-0.5 md:py-1">COLLECTED</Badge>
                                            ) : (
                                                <Badge variant="streak" className="text-[7px] md:text-[10px] px-1.5 md:px-2 py-0.5 md:py-1">Misi Aktif</Badge>
                                            )}
                                        </div>
                                    </div>

                                    {/* Progress Bar (Bottom Edge) */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-100 dark:bg-slate-800">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progress.percent}%` }}
                                            className={`h-full ${isUnlocked ? 'bg-yellow-400' : 'bg-primary'}`}
                                        />
                                    </div>
                                </Card>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Footer Motivation */}
                <div className="mt-16 text-center space-y-4 opacity-50">
                    <Icon name="military_tech" size={64} className="mx-auto text-slate-300" />
                    <p className="font-black uppercase italic tracking-[0.2em] text-slate-400">Terus grinding biar jadi sepuh!</p>
                </div>
            </div>
        </PageLayout>
    );
}
