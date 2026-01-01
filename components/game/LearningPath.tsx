'use client';

import React from 'react';
import { Icon } from '../ui/UIComponents';
import { useSound } from '@/hooks/use-sound';
import type { Level, UserProgress } from '@/types';
import { motion } from 'framer-motion';

interface LevelCardProps {
    level: Level;
    progress: UserProgress;
    isActive: boolean;
    isLocked: boolean;
    onStart?: () => void;
    index: number;
}

export const LevelCard: React.FC<LevelCardProps> = ({
    level,
    progress,
    isActive,
    isLocked,
    onStart,
    index
}) => {
    const isEven = index % 2 === 0;
    const { playSound } = useSound();

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            className={`flex gap-3 md:gap-6 w-full mb-4 md:mb-6 relative items-center ${isEven ? 'flex-row' : 'flex-row-reverse'}`}
        >
            {/* The Path Node (The Circle icon on the line) */}
            <div className="relative z-20 flex-shrink-0">
                <motion.div
                    whileHover={!isLocked ? { scale: 1.1, rotate: 5 } : {}}
                    whileTap={!isLocked ? { scale: 0.9 } : {}}
                    onClick={!isLocked ? () => { playSound('CLICK'); onStart?.(); } : undefined}
                    className={`size-12 md:size-20 rounded-xl md:rounded-[1.5rem] flex items-center justify-center cursor-pointer shadow-lg transition-all duration-300 relative overflow-hidden ${progress.status === 'COMPLETED' ? 'bg-gradient-to-br from-success to-success-dark text-white' :
                        isActive ? 'bg-gradient-to-br from-primary to-primary-dark text-white ring-2 md:ring-4 ring-primary/20 scale-105 shadow-glow' :
                            'bg-slate-200 dark:bg-slate-800 text-slate-400'
                        }`}
                >
                    <Icon name={level.icon || (isLocked ? 'lock' : 'checklist')} size={20} mdSize={32} filled />
                    {isActive && (
                        <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:24px_24px] animate-[progress_stripe_1s_linear_infinite] opacity-20"></div>
                    )}
                </motion.div>

                {/* Status Indicator Badge */}
                {progress.status === 'COMPLETED' && (
                    <div className="absolute -top-1 -right-1 size-5 md:size-7 bg-yellow-400 rounded-lg md:rounded-xl flex items-center justify-center shadow-lg border-2 md:border-3 border-white dark:border-slate-900 rotate-12">
                        <Icon name="star" size={10} mdSize={16} className="text-white" filled />
                    </div>
                )}
            </div>

            {/* Content Card */}
            <div
                onClick={!isLocked ? (e) => {
                    // Prevent double-triggering if clicking on the button inside
                    if ((e.target as HTMLElement).tagName !== 'BUTTON') {
                        playSound('CLICK');
                        onStart?.();
                    }
                } : undefined}
                className={`flex-1 min-w-0 p-3 md:p-5 rounded-xl md:rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl shadow-card border border-white/20 dark:border-white/5 transition-all duration-300 ${isLocked ? 'opacity-50 grayscale' : 'hover:shadow-floating hover:-translate-y-0.5 cursor-pointer group'
                    }`}
            >
                <div className="flex items-center justify-between mb-1.5 md:mb-2 lg:mb-3">
                    <span className={`text-[9px] md:text-xs font-black uppercase tracking-[0.1em] px-2 md:px-2.5 lg:px-3 py-0.5 md:py-1 lg:py-1.5 rounded-md md:rounded-lg lg:rounded-xl ${progress.status === 'COMPLETED' ? 'bg-success/10 text-success' :
                        isActive ? 'bg-primary/10 text-primary animate-pulse' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                        {progress.status === 'COMPLETED' ? 'Slay!' : isActive ? 'Next UP' : 'Keep Calm'}
                    </span>

                    {!isLocked && (
                        <div className="flex gap-0.5">
                            {[1, 2, 3].map((s) => (
                                <Icon key={s} name="star" size={12} mdSize={16} className={s <= (progress.stars || 0) ? 'text-yellow-400' : 'text-slate-200 dark:text-slate-800'} filled={s <= (progress.stars || 0)} />
                            ))}
                        </div>
                    )}
                </div>

                <h3 className="text-sm md:text-lg lg:text-2xl font-black text-slate-900 dark:text-white mb-1 md:mb-1.5 lg:mb-2 tracking-tight group-hover:text-primary transition-colors truncate notranslate" translate="no">
                    {level.title}
                </h3>

                <p className="text-xs md:text-sm lg:text-base font-bold text-slate-500 dark:text-slate-400 leading-snug mb-1.5 md:mb-2 lg:mb-3 line-clamp-2">
                    {level.description}
                </p>

                {isActive && (
                    <div className="flex flex-col gap-1 md:gap-1.5 lg:gap-2.5">
                        <div className="w-full h-1 md:h-1.5 lg:h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '40%' }}
                                className="h-full bg-gradient-to-r from-primary to-primary-light"
                            />
                        </div>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                playSound('CLICK');
                                onStart?.();
                            }}
                            className="w-full py-2 md:py-4 bg-primary text-white font-black text-xs md:text-sm uppercase tracking-[0.15em] rounded-xl md:rounded-2xl shadow-lg shadow-primary/20 group-hover:scale-[1.02] transition-all active:scale-95"
                        >
                            Gas Misi
                        </button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

interface LearningPathProps {
    levels: Level[];
    userProgress: UserProgress[];
    onLevelStart: (levelId: string) => void;
}

export const LearningPath: React.FC<LearningPathProps> = ({
    levels,
    userProgress,
    onLevelStart
}) => {
    return (
        <div className="relative w-full py-8">
            {/* The Central Path Line */}
            <div className="absolute left-1/2 top-12 bottom-12 w-1 md:w-2 -translate-x-1/2 bg-slate-100 dark:bg-slate-800/40 -z-10 rounded-full overflow-hidden">
                <div className="absolute top-0 w-full bg-gradient-to-b from-primary to-success rounded-full" style={{ height: '30%' }}></div>
            </div>

            <div className="flex flex-col max-w-2xl mx-auto px-4 md:px-8">
                {levels.map((level, index) => {
                    const progress = userProgress.find(p => p.levelId === level.id) || {
                        id: '',
                        userId: '',
                        levelId: level.id,
                        status: 'LOCKED' as const,
                        highScore: 0,
                        stars: 0
                    };

                    const prevLevel = index > 0 ? levels[index - 1] : null;
                    const isNewPhase = !prevLevel || prevLevel.phase !== level.phase;
                    const isGrammarStart = level.id.startsWith('grammar') && (!prevLevel || !prevLevel.id.startsWith('grammar'));

                    return (
                        <React.Fragment key={level.id}>
                            {isNewPhase && !level.id.startsWith('grammar') && (
                                <div className="mb-4 md:mb-6 lg:mb-8 mt-6 md:mt-10 lg:mt-12 text-center">
                                    <span className="text-[9px] md:text-xs lg:text-sm font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-primary bg-primary/5 px-3 md:px-5 lg:px-6 py-1.5 md:py-2 lg:py-2.5 rounded-full border border-primary/10 notranslate" translate="no">
                                        Phase {level.phase || 1}: {level.phase === 1 ? 'Beginner' : level.phase === 2 ? 'Intermediate' : 'Advanced'}
                                    </span>
                                </div>
                            )}

                            {isGrammarStart && (
                                <div className="my-10 md:my-16 lg:my-20 text-center">
                                    <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-purple-600 bg-purple-50 dark:bg-purple-950/20 dark:text-purple-400 px-4 md:px-6 py-1.5 md:py-2 rounded-full border border-purple-100 dark:border-purple-900 notranslate" translate="no">
                                        Grammar Mastery
                                    </span>
                                </div>
                            )}

                            {/* GRAMMAR MISSION TYPE HEADERS */}
                            {level.subType && (!prevLevel || prevLevel.subType !== level.subType) && (
                                <div className="my-8 md:my-12 flex items-center gap-4">
                                    <div className="h-px flex-1 bg-gradient-to-r from-transparent to-slate-200 dark:to-slate-800"></div>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className={`px-4 py-1.5 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest border ${level.subType === 'POSITIVE' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                                            level.subType === 'NEGATIVE' ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' :
                                                'bg-blue-500/10 text-blue-600 border-blue-500/20'
                                            }`}>
                                            {level.subType === 'POSITIVE' ? 'Misi Kalimat Positif' :
                                                level.subType === 'NEGATIVE' ? 'Misi Kalimat Negatif' :
                                                    'Misi Kalimat Tanya'}
                                        </div>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Tantangan 1-10: Mastering Habits</p>
                                    </div>
                                    <div className="h-px flex-1 bg-gradient-to-l from-transparent to-slate-200 dark:to-slate-800"></div>
                                </div>
                            )}

                            <LevelCard
                                level={level}
                                progress={progress}
                                isActive={progress.status === 'OPEN'}
                                isLocked={progress.status === 'LOCKED'}
                                index={index}
                                onStart={() => onLevelStart(level.id)}
                            />
                        </React.Fragment>
                    );
                })}
            </div >
        </div >
    );
};
