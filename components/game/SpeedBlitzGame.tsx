'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, Button, NoTranslate } from '../ui/UIComponents';
import { GameHeader } from '../layout/Navigation';
import { Level } from '@/types';
import { BlitzTask } from '@/lib/data/blitz';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { useProgressStore } from '@/store/progress-store';
import { calculateXp, calculateStars } from '@/lib/game-logic/xp-calculator';
import { CURRICULUM_LEVELS } from '@/lib/data/mockLevels';

interface SpeedBlitzGameProps {
    level: Level;
    tasks: BlitzTask[];
}

export const SpeedBlitzGame: React.FC<SpeedBlitzGameProps> = ({ level, tasks }) => {
    const router = useRouter();
    const [phase, setPhase] = useState<'INTRO' | 'PLAYING' | 'RESULTS' | 'GAMEOVER'>('INTRO');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [lives, setLives] = useState(10);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [maxStreak, setMaxStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(5);
    const [isPaused, setIsPaused] = useState(false);
    const [feedback, setFeedback] = useState<'CORRECT' | 'WRONG' | null>(null);
    const [mistakes, setMistakes] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [xpBreakdown, setXpBreakdown] = useState<any>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const { addGems, addXp } = useUserStore();
    const { completeLevel, unlockLevel, getLevelProgress } = useProgressStore();

    const currentTask = tasks[currentIndex];

    // Timer logic
    useEffect(() => {
        if (phase === 'PLAYING' && !isPaused && !feedback) {
            if (timeLeft > 0) {
                timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 0.1), 100);
            } else {
                handleAnswer(-1);
            }
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [phase, timeLeft, isPaused, feedback]);

    const handleAnswer = (choiceIndex: number) => {
        if (feedback) return;

        const isCorrect = choiceIndex === currentTask.correctIndex;

        if (isCorrect) {
            setFeedback('CORRECT');
            const newStreak = streak + 1;
            setStreak(newStreak);
            setMaxStreak(prev => Math.max(prev, newStreak));

            if (newStreak >= 3) {
                confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 }, colors: ['#fbbf24', '#f59e0b'] });
            }
        } else {
            setFeedback('WRONG');
            setStreak(0);
            setMistakes(prev => prev + 1);
            const nextLives = Math.max(0, lives - 1);
            setLives(nextLives);

            if (nextLives === 0) {
                setTimeout(() => setPhase('GAMEOVER'), 600);
                return;
            }
        }

        setTimeout(() => {
            if (currentIndex < tasks.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setTimeLeft(Math.max(2, 5 - (streak * 0.2)));
                setFeedback(null);
            } else {
                handleLevelComplete();
            }
        }, 600);
    };

    const handleLevelComplete = () => {
        const timeTaken = (Date.now() - startTime) / 1000;
        const maxTime = tasks.length * 5;

        const xpResults = calculateXp({
            mistakes,
            totalTasks: tasks.length,
            timeRemaining: Math.max(0, maxTime - timeTaken),
            maxTime,
            maxStreak,
            crystalActive: false
        });

        const winStars = calculateStars((tasks.length - mistakes) / tasks.length);

        setXpBreakdown(xpResults.breakdown);
        setScore(xpResults.total);

        setTimeout(() => {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            addGems(30 + (winStars * 20));
            addXp(xpResults.total);
            completeLevel(level.id, xpResults.total, winStars);

            const curriculumIndex = CURRICULUM_LEVELS.findIndex(l => l.id === level.id);
            if (curriculumIndex !== -1 && curriculumIndex < CURRICULUM_LEVELS.length - 1) {
                unlockLevel(CURRICULUM_LEVELS[curriculumIndex + 1].id);
            }

            setPhase('RESULTS');
        }, 600);
    };

    const restartLevel = () => {
        setCurrentIndex(0);
        setScore(0);
        setStreak(0);
        setMaxStreak(0);
        setMistakes(0);
        setLives(10);
        setTimeLeft(5);
        setFeedback(null);
        setPhase('INTRO');
    };

    if (phase === 'INTRO') {
        return (
            <div className="min-h-screen bg-[#06060a] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                <motion.div initial={{ scale: 0.5, rotate: -20, opacity: 0 }} animate={{ scale: 1, rotate: 0, opacity: 1 }} className="max-w-xl w-full space-y-12">
                    <div className="relative">
                        <div className="size-32 bg-primary/20 rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 animate-pulse-gentle">
                            <Icon name="bolt" className="text-primary" size={64} filled />
                        </div>
                        <motion.div animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 3 }} className="absolute -top-4 -right-4 bg-orange-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-lg">High Intensity</motion.div>
                    </div>

                    <div className="space-y-4">
                        <h1 className="text-7xl font-black text-white tracking-tighter italic uppercase underline decoration-primary decoration-8 underline-offset-8 decoration-skip-ink-none">Speed Blitz</h1>
                        <p className="text-slate-400 font-bold text-xl px-12">Literally 5 detik tiap soal! Reflex kamu harus gokil biar gak game over. Slay the grammar!</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-left">
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block mb-2">Rule #1</span>
                            <p className="text-white font-bold leading-snug">Mistakes = Energy loss. Don't blink!</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
                            <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] block mb-2">Rule #2</span>
                            <p className="text-white font-bold leading-snug">Streaks make it FASTER. Gacor reflexes only.</p>
                        </div>
                    </div>

                    <Button variant="primary" fullWidth className="py-7 rounded-[2rem] text-xl font-black uppercase tracking-widest shadow-[0_20px_50px_rgba(8,126,255,0.3)] group overflow-hidden relative"
                        onClick={() => {
                            setPhase('PLAYING');
                            setStartTime(Date.now());
                        }}>
                        <span className="relative z-10">Gas Now! ⚡️</span>
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-dark to-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </Button>
                </motion.div>
            </div>
        );
    }

    if (phase === 'GAMEOVER') {
        return (
            <div className="min-h-screen bg-[#06060a] flex flex-col items-center justify-center p-6 text-center">
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-md w-full space-y-12">
                    <div className="size-40 bg-error/20 rounded-[3rem] flex items-center justify-center mx-auto border-4 border-error/30">
                        <Icon name="bolt" className="text-error" size={80} filled />
                    </div>
                    <div className="space-y-4">
                        <h2 className="text-6xl font-black text-white tracking-tighter italic uppercase">Energy Out! ⚡️</h2>
                        <p className="text-slate-400 font-bold text-lg leading-relaxed">Reflex kamu kurang gacor hari ini! Literally butuh fokus lagi biar streak makin mantap.</p>
                    </div>
                    <div className="flex flex-col gap-4">
                        <Button variant="primary" fullWidth className="py-7 rounded-[2rem] font-black uppercase tracking-widest text-lg shadow-xl shadow-primary/20" onClick={restartLevel}>RESTART BLITZ</Button>
                        <Button variant="ghost" fullWidth className="py-4 font-black uppercase tracking-widest text-slate-500" onClick={() => router.push('/')}>Balik ke Map</Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (phase === 'RESULTS') {
        const levelData = getLevelProgress(level.id);
        return (
            <div className="min-h-screen bg-[#06060a] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-xl w-full space-y-12">
                    <div className="relative">
                        <div className="size-48 bg-gradient-to-br from-primary to-primary-dark rounded-[4rem] flex flex-col items-center justify-center mx-auto shadow-[0_0_60px_rgba(8,126,255,0.4)] border-8 border-white/10">
                            <span className="text-[10px] font-black text-white/60 uppercase tracking-widest mt-2">Blitz Score</span>
                            <span className="text-7xl font-black text-white tracking-tighter">{score}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-7xl font-black text-white tracking-tighter italic uppercase underline decoration-primary decoration-8 underline-offset-8">BLITZ SLAY! ✨</h2>
                        <p className="text-slate-400 font-bold text-lg">Refleks kamu gokil banget! Grammar Master status: Unlocked.</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10">
                            <Icon name="star" className="text-yellow-400 mb-2" size={32} filled />
                            <p className="text-2xl font-black text-white">{levelData?.stars || 0}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Stars</p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10">
                            <Icon name="diamond" className="text-blue-400 mb-2" size={32} filled />
                            <p className="text-2xl font-black text-white">+{30 + (levelData?.stars || 0) * 20}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Gems</p>
                        </div>
                        <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10">
                            <Icon name="speed" className="text-primary mb-2" size={32} filled />
                            <p className="text-2xl font-black text-white">{maxStreak > 5 ? 'Gacor' : 'Mid'}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Reflexes</p>
                        </div>
                    </div>

                    <Button variant="primary" fullWidth className="py-7 rounded-[2rem] font-black uppercase tracking-widest text-xl shadow-[0_20px_50px_rgba(8,126,255,0.2)]" onClick={() => router.push('/')}>Gas Terus!</Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#06060a] flex flex-col selection:bg-primary/30">
            <GameHeader progress={((currentIndex + 1) / tasks.length) * 100} lives={lives} onPause={() => router.push('/')} />
            <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
                <AnimatePresence mode="wait">
                    <motion.div key={currentIndex} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="w-full space-y-12">
                        <div className="text-center space-y-6">
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${streak > 0 ? 'bg-orange-500 text-white' : 'bg-white/10 text-slate-400'}`}>{streak} Streak</span>
                                <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden max-w-[120px]">
                                    <motion.div className="h-full bg-primary" animate={{ width: `${(timeLeft / 5) * 100}%` }} transition={{ duration: 0.1, ease: 'linear' }} />
                                </div>
                                <span className="text-xs font-black text-white w-8">{(timeLeft).toFixed(1)}s</span>
                            </div>
                            <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter italic uppercase underline decoration-white/10 decoration-8 underline-offset-12">
                                <NoTranslate>{currentTask.english}</NoTranslate>
                            </h1>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {currentTask.choices.map((choice, idx) => (
                                <button key={idx} onClick={() => handleAnswer(idx)} disabled={feedback !== null}
                                    className={`p-8 rounded-[2.5rem] text-2xl font-black transition-all duration-200 border-2 flex items-center justify-between group
                                        ${feedback === 'CORRECT' && idx === currentTask.correctIndex ? 'bg-success/20 border-success text-success scale-105' :
                                            feedback === 'WRONG' && idx === currentIndex ? 'bg-error/20 border-error text-error shake' :
                                                'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'}`}>
                                    <NoTranslate>{choice}</NoTranslate>
                                    {feedback === 'CORRECT' && idx === currentTask.correctIndex && <Icon name="check_circle" filled />}
                                    {feedback === 'WRONG' && idx === currentIndex && <Icon name="cancel" filled />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};
