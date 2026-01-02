'use client';

import React from 'react';
import { Icon, Button } from '../ui/UIComponents';
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
            initial={{ opacity: 0, x: typeof window !== 'undefined' && window.innerWidth < 768 ? 0 : (isEven ? -50 : 50), y: 30 }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className={`flex flex-col md:flex-row gap-4 md:gap-8 w-full mb-8 md:mb-10 relative items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
        >
            {/* Holographic Glowing Base for Active Level */}
            {isActive && (
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-primary/5 blur-[100px] -z-10 animate-pulse"></div>
            )}

            {/* Path Node - Technical Core */}
            <div className="relative z-20 flex-shrink-0">
                <motion.div
                    whileHover={!isLocked ? { scale: 1.15, rotate: 5, boxShadow: '0 0 30px rgba(72, 72, 229, 0.4)' } : {}}
                    whileTap={!isLocked ? { scale: 0.9 } : {}}
                    onClick={!isLocked ? () => { playSound('CLICK'); onStart?.(); } : undefined}
                    className={`size-14 md:size-24 rounded-2xl md:rounded-[2rem] flex items-center justify-center cursor-pointer shadow-2xl transition-all duration-500 relative overflow-hidden group/node ${progress.status === 'COMPLETED' ? 'bg-gradient-to-br from-success to-success-dark text-white border-b-4 border-success-dark/50' :
                        isActive ? 'bg-gradient-to-br from-primary to-primary-dark text-white ring-4 md:ring-8 ring-primary/10 scale-110 shadow-glow border-b-4 border-primary-dark/50' :
                            'bg-slate-200 dark:bg-slate-800 text-slate-400 border-b-4 border-slate-300 dark:border-slate-900/50'
                        }`}
                >
                    <Icon name={level.icon || (isLocked ? 'lock' : 'checklist')} size={24} mdSize={40} filled={isActive || progress.status === 'COMPLETED'} />

                    {/* Techno-Overlay for Active Node */}
                    {isActive && (
                        <>
                            <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:24px_24px] animate-[progress_stripe_1s_linear_infinite] opacity-30"></div>
                            <div className="absolute top-0 left-0 w-full h-0.5 bg-white/40 animate-scan-line"></div>
                        </>
                    )}

                    {/* Completion Shine */}
                    {progress.status === 'COMPLETED' && (
                        <div className="absolute -inset-full bg-gradient-to-tr from-transparent via-white/20 to-transparent rotate-45 animate-[shine_3s_infinite] transition-all duration-1000"></div>
                    )}
                </motion.div>

                {/* Status Indicator Badge */}
                {progress.status === 'COMPLETED' && (
                    <motion.div
                        initial={{ scale: 0, rotate: -20 }}
                        animate={{ scale: 1, rotate: 12 }}
                        className="absolute -top-2 -right-2 size-6 md:size-9 bg-yellow-400 rounded-xl md:rounded-2xl flex items-center justify-center shadow-xl border-2 md:border-4 border-white dark:border-slate-900 z-30"
                    >
                        <Icon name="star" size={12} mdSize={20} className="text-white" filled />
                    </motion.div>
                )}
            </div>

            {/* Content Card - Tactical Glass */}
            <motion.div
                whileHover={!isLocked ? { y: -5, scale: 1.01 } : {}}
                onClick={!isLocked ? (e) => {
                    if ((e.target as HTMLElement).tagName !== 'BUTTON') {
                        playSound('CLICK');
                        onStart?.();
                    }
                } : undefined}
                className={`flex-1 min-w-0 p-4 md:p-7 rounded-3xl md:rounded-[2.5rem] relative overflow-hidden transition-all duration-500 ${isLocked
                    ? 'bg-slate-100/50 dark:bg-slate-900/40 opacity-40 grayscale blur-[1px]'
                    : 'bg-white/90 dark:bg-slate-950/80 backdrop-blur-2xl shadow-xl border border-white/40 dark:border-white/5 hover:border-primary/30 group cursor-pointer'
                    }`}
            >
                {/* Advanced Background Decoration */}
                {!isLocked && (
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                        <Icon name={level.icon || 'star'} size={120} />
                    </div>
                )}

                {/* Scanline Effect for Active Card */}
                {isActive && (
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/0 via-primary/[0.03] to-primary/0 h-[200%] -translate-y-full animate-[scan-line_4s_linear_infinite] pointer-events-none"></div>
                )}

                <div className="flex items-center justify-between mb-2 md:mb-4 relative z-10">
                    <div className="flex items-center gap-2">
                        <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${progress.status === 'COMPLETED' ? 'bg-success/5 text-success border-success/20' :
                            isActive ? 'bg-primary/5 text-primary border-primary/20 animate-pulse' :
                                'bg-slate-100/50 text-slate-500 border-slate-200 dark:border-slate-800'
                            }`}>
                            {progress.status === 'COMPLETED' ? 'Mission Cleared' : isActive ? 'Tactical Entry' : 'Locked Node'}
                        </span>
                        {isActive && <div className="size-1.5 bg-primary rounded-full animate-ping"></div>}
                    </div>

                    {!isLocked && (
                        <div className="flex gap-1 md:gap-1.5 p-1.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                            {[1, 2, 3].map((s) => (
                                <Icon
                                    key={s}
                                    name="star"
                                    size={14}
                                    mdSize={18}
                                    className={s <= (progress.stars || 0) ? 'text-yellow-400' : 'text-slate-200 dark:text-slate-700'}
                                    filled={s <= (progress.stars || 0)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                <div className="relative z-10">
                    <h3 className="text-base md:text-xl lg:text-2xl font-black text-slate-900 dark:text-white mb-1.5 md:mb-2 tracking-tighter group-hover:text-primary transition-colors italic uppercase truncate">
                        {level.title}
                    </h3>

                    <p className="text-xs md:text-base font-bold text-slate-500 dark:text-slate-400 leading-relaxed mb-4 md:mb-6 line-clamp-2 max-w-lg">
                        {level.description}
                    </p>

                    {isActive && (
                        <div className="pt-3 md:pt-4 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6">
                            <div className="flex-1 space-y-1.5 md:space-y-2">
                                <div className="flex justify-between text-[7px] md:text-[10px] font-black uppercase tracking-wider text-slate-400">
                                    <span>Signal Strength</span>
                                    <span>98% Gacor</span>
                                </div>
                                <div className="w-full h-1 md:h-2 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: '65%' }}
                                        className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full shadow-[0_0_10px_rgba(72,72,229,0.5)]"
                                    />
                                </div>
                            </div>
                            <Button
                                size="sm"
                                variant="primary"
                                className="!h-9 md:!h-14 !px-4 md:!px-10 rounded-xl md:rounded-2xl shadow-xl shadow-primary/25 group-hover:scale-105"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    playSound('CLICK');
                                    onStart?.();
                                }}
                            >
                                <span className="text-[9px] md:text-xs">LAUNCH MISSION</span>
                            </Button>
                        </div>
                    )}
                </div>
            </motion.div>
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
        <div className="relative w-full pt-4 md:pt-8 pb-12 md:pb-20 overflow-hidden">
            {/* TECHNICAL BACKGROUND GRID */}
            <div className="absolute inset-0 -z-20">
                <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:32px_32px] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] opacity-50"></div>
                <div className="absolute inset-0 bg-gradient-to-b from-background-light via-transparent to-background-light dark:from-background-dark dark:to-background-dark"></div>
            </div>

            {/* Central Path Core Line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-1 md:w-2.5 -translate-x-1/2 -z-10">
                <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800/40 rounded-full shadow-inner"></div>
                <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: '40%' }}
                    className="absolute top-0 w-full bg-gradient-to-b from-primary via-primary-light to-success rounded-full shadow-glow"
                ></motion.div>

                {/* ANIMATED DATA PACKETS */}
                <div className="absolute inset-0 pointer-events-none">
                    {[1, 2, 3].map(i => (
                        <div
                            key={i}
                            className="absolute left-0 w-full h-10 bg-gradient-to-b from-transparent via-white/40 to-transparent blur-sm"
                            style={{
                                animation: `data-flow ${3 + i}s linear infinite`,
                                animationDelay: `${i * 1.5}s`
                            }}
                        ></div>
                    ))}
                </div>
            </div>

            {/* FLOATING DECORATIONS - Reduced size and hidden some on mobile */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10">
                <DecorativeIcon name="translate" className="top-10 left-[5%] md:left-[10%] opacity-10 blur-[1px]" size={60} mdSize={100} />
                <DecorativeIcon name="auto_awesome" className="top-[40%] right-[5%] md:right-[15%] opacity-5 hover:opacity-10 transition-opacity" size={80} mdSize={150} />
                <DecorativeIcon name="terminal" className="bottom-[10%] left-[10%] md:left-[15%] opacity-10 hidden md:block" size={80} />
                <DecorativeIcon name="security" className="top-[60%] left-[5%] md:left-[8%] opacity-5 hidden md:block" size={120} />
            </div>

            <div className="flex flex-col max-w-3xl mx-auto px-4 md:px-0">
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

                    return (
                        <React.Fragment key={level.id}>
                            {isNewPhase && !level.id.startsWith('grammar') && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    className="mb-8 md:mb-12 mt-4 md:mt-8 text-center relative z-10"
                                >
                                    <div className="inline-flex flex-col items-center gap-4">
                                        <div className="h-px w-20 md:w-32 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                                        <div className="flex items-center gap-4 bg-primary/5 px-8 py-3 rounded-2xl md:rounded-3xl border border-primary/20 backdrop-blur-md shadow-2xl">
                                            <Icon name="radar" className="text-primary animate-spin" size={20} />
                                            <span className="text-xs md:text-base font-black uppercase tracking-[0.4em] text-primary italic">
                                                Phase {level.phase || 1}: {level.phase === 1 ? 'Initialization' : level.phase === 2 ? 'Optimization' : 'Ascension'}
                                            </span>
                                        </div>
                                        <div className="h-px w-20 md:w-32 bg-gradient-to-r from-transparent via-primary/50 to-transparent"></div>
                                    </div>
                                </motion.div>
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

const DecorativeIcon = ({ name, className, size, mdSize }: { name: string, className: string, size: number, mdSize?: number }) => (
    <div className={`absolute animate-[float-technical_5s_ease-in-out_infinite] ${className}`}>
        <Icon name={name} size={size} mdSize={mdSize || size} />
    </div>
);
