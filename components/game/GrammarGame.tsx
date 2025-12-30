'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, Button, NoTranslate } from '../ui/UIComponents';
import { GameHeader } from '../layout/Navigation';
import { Level } from '@/types';
import { GrammarTask } from '@/lib/data/grammar';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { useProgressStore } from '@/store/progress-store';
import { calculateXp, calculateStars } from '@/lib/game-logic/xp-calculator';
import { CURRICULUM_LEVELS } from '@/lib/data/mockLevels';

interface GrammarGameProps {
    level: Level;
    tasks: GrammarTask[];
}

type GamePhase = 'INTRO' | 'PLAYING' | 'RESULTS' | 'GAMEOVER';

export const GrammarGame: React.FC<GrammarGameProps> = ({ level, tasks }) => {
    const router = useRouter();
    const [phase, setPhase] = useState<GamePhase>('INTRO');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedPieces, setSelectedPieces] = useState<string[]>([]);
    const [availablePieces, setAvailablePieces] = useState<string[]>([]);
    const [lives, setLives] = useState(10);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const [mistakes, setMistakes] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [xpBreakdown, setXpBreakdown] = useState<any>(null);
    const [finalScore, setFinalScore] = useState(0);

    const { addGems, addXp } = useUserStore();
    const { completeLevel, unlockLevel, getLevelProgress } = useProgressStore();

    const currentTask = tasks[currentIndex];

    const theme = (() => {
        if (level.id === 'grammar-1') return { title: 'Modern Era', highlight: 'Present', color: 'text-primary' };
        if (level.id === 'grammar-2') return { title: 'History Vault', highlight: 'Past', color: 'text-orange-500' };
        return { title: 'Future Frontier', highlight: 'Future', color: 'text-purple-500' };
    })();

    useEffect(() => {
        if (currentTask) {
            const allPieces = [...currentTask.solution, ...currentTask.distractors]
                .sort(() => Math.random() - 0.5);
            setAvailablePieces(allPieces);
            setSelectedPieces([]);
            setFeedback(null);
        }
    }, [currentIndex, tasks]);

    const handlePieceClick = (piece: string, isSelected: boolean) => {
        if (feedback) return;
        if (isSelected) {
            setSelectedPieces(prev => prev.filter(p => p !== piece));
            setAvailablePieces(prev => [...prev, piece]);
        } else {
            setSelectedPieces(prev => [...prev, piece]);
            setAvailablePieces(prev => prev.filter(p => p !== piece));
        }
    };

    const checkAnswer = () => {
        const isCorrect = JSON.stringify(selectedPieces) === JSON.stringify(currentTask.solution);

        if (isCorrect) {
            setFeedback({ type: 'success', message: 'Perfect! ' + currentTask.explanation });
            confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
        } else {
            setMistakes(prev => prev + 1);
            const nextLives = Math.max(0, lives - 1);
            setLives(nextLives);

            if (nextLives === 0) {
                setFeedback({ type: 'error', message: 'Energy habis! Tetap semangat, gas lagi yuk.' });
                setTimeout(() => setPhase('GAMEOVER'), 1500);
            } else {
                setFeedback({ type: 'error', message: 'Not quite right. Coba cek lagi piece-nya!' });
            }
        }
    };

    const handleLevelComplete = () => {
        const timeTaken = (Date.now() - startTime) / 1000;
        const maxTime = tasks.length * 20;

        const xpResults = calculateXp({
            mistakes,
            totalTasks: tasks.length,
            timeRemaining: Math.max(0, maxTime - timeTaken),
            maxTime,
            maxStreak: 0,
            crystalActive: false
        });

        const winStars = calculateStars((tasks.length - Math.min(tasks.length, mistakes)) / tasks.length);

        setXpBreakdown(xpResults.breakdown);
        setFinalScore(xpResults.total);

        setTimeout(() => {
            confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
            addGems(30 + (winStars * 15));
            addXp(xpResults.total);
            completeLevel(level.id, xpResults.total, winStars);

            const curriculumIndex = CURRICULUM_LEVELS.findIndex(l => l.id === level.id);
            if (curriculumIndex !== -1 && curriculumIndex < CURRICULUM_LEVELS.length - 1) {
                unlockLevel(CURRICULUM_LEVELS[curriculumIndex + 1].id);
            }

            setPhase('RESULTS');
        }, 1000);
    };

    const restartLevel = () => {
        setCurrentIndex(0);
        setLives(10);
        setMistakes(0);
        setSelectedPieces([]);
        setFeedback(null);
        setPhase('INTRO');
    };

    const nextTask = () => {
        if (currentIndex < tasks.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            handleLevelComplete();
        }
    };

    const progress = ((currentIndex + 1) / tasks.length) * 100;

    if (phase === 'INTRO') {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0a0a0f] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-2xl w-full space-y-12">
                    <div className="space-y-4">
                        <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Icon name="history_edu" className="text-primary" size={32} />
                        </div>
                        <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">Time Machine <span className={theme.color}>{theme.highlight}</span></h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-xl leading-relaxed max-w-lg mx-auto">
                            Welcome to the <span className={theme.color}>{theme.title}</span>. Let's fix the grammar timeline and master the {theme.highlight} tense together.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                        <div className="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Timeline Goal</h4>
                            <p className="text-slate-900 dark:text-white font-bold">Construct {tasks.length} correct sentences to restore historical accuracy.</p>
                        </div>
                        <div className="p-8 rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50">
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4">Mastery Bonus</h4>
                            <p className="text-slate-900 dark:text-white font-bold">Earn up to 200+ XP and 50+ Crystals for perfect synchronization.</p>
                        </div>
                    </div>

                    <Button variant="primary" fullWidth className="py-7 rounded-[2rem] text-xl font-black uppercase tracking-widest shadow-xl"
                        onClick={() => {
                            setPhase('PLAYING');
                            setStartTime(Date.now());
                        }}>
                        Unlock Era
                    </Button>
                </motion.div>
            </div>
        );
    }

    if (phase === 'GAMEOVER') {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0a0a0f] flex flex-col items-center justify-center p-6 text-center">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full space-y-8">
                    <div className="size-32 bg-error/10 rounded-[2.5rem] flex items-center justify-center mx-auto">
                        <Icon name="heart_broken" className="text-error" size={64} filled />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic">Timeline Glitch!</h2>
                        <p className="text-slate-500 font-bold text-lg">Waduh, energy habis! Timeline-nya berantakan, kita ulang ya biar makin gacor.</p>
                    </div>
                    <div className="flex flex-col gap-4">
                        <Button variant="primary" fullWidth className="py-6 rounded-[2rem] font-black uppercase tracking-widest" onClick={restartLevel}>Re-Sync Era</Button>
                        <Button variant="ghost" fullWidth className="py-4 font-black uppercase tracking-widest text-slate-400" onClick={() => router.push('/')}>Quit to Map</Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (phase === 'RESULTS') {
        const levelData = getLevelProgress(level.id);
        return (
            <div className="min-h-screen bg-white dark:bg-[#0a0a0f] flex flex-col items-center justify-center p-6 text-center">
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-md w-full space-y-12">
                    <div className="size-48 bg-gradient-to-br from-primary to-primary-dark rounded-[4rem] flex flex-col items-center justify-center mx-auto shadow-2xl border-8 border-white/10 relative">
                        <span className="text-xs font-black text-white/60 uppercase tracking-widest mt-2">XP Earned</span>
                        <span className="text-6xl font-black text-white tracking-tighter">{finalScore}</span>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">Mastery Slay! ✨</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-lg">Gokil! Kamu udah paham banget bahasa era <span className={theme.color}>{theme.highlight}</span>.</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[2rem] border border-slate-200/50">
                            <Icon name="star" className="text-yellow-400 mb-2" size={32} filled />
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{levelData?.stars || 0}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stars</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[2rem] border border-slate-200/50">
                            <Icon name="diamond" className="text-blue-500 mb-2" size={32} filled />
                            <p className="text-2xl font-black text-slate-900 dark:text-white">+{30 + (levelData?.stars || 0) * 15}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gems</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900/40 p-6 rounded-[2rem] border border-slate-200/50">
                            <Icon name="speed" className="text-purple-500 mb-2" size={32} filled />
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{xpBreakdown?.speed > 15 ? 'Elite' : 'Nice'}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Accuracy</p>
                        </div>
                    </div>

                    <Button variant="primary" fullWidth className="py-6 rounded-[2.5rem] font-black uppercase tracking-widest shadow-xl" onClick={() => router.push('/')}>Gas Terus!</Button>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0f] flex flex-col">
            <GameHeader progress={progress} lives={lives} onPause={() => router.push('/')} />
            <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full">
                <div className="text-center space-y-4 mb-12">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Time: {theme.highlight} Era</span>
                    <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">{currentTask.indonesian}</h1>
                </div>

                <div className="w-full bg-slate-50 dark:bg-slate-900/50 p-10 rounded-[3rem] border-2 border-slate-200/50 dark:border-slate-800/50 min-h-[160px] flex flex-wrap gap-3 items-center justify-center mb-12 shadow-sm">
                    <AnimatePresence>
                        {selectedPieces.map((piece, i) => (
                            <motion.button key={`selected-${i}-${piece}`} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                                onClick={() => handlePieceClick(piece, true)} className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-bold text-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:border-primary transition-colors">
                                <NoTranslate>{piece}</NoTranslate>
                            </motion.button>
                        ))}
                    </AnimatePresence>
                    {selectedPieces.length === 0 && <p className="text-slate-400 font-bold text-lg select-none">Bangun kalimatmu disini...</p>}
                </div>

                <div className="flex flex-wrap gap-3 justify-center mb-16">
                    {availablePieces.map((piece, i) => (
                        <motion.button key={`available-${i}-${piece}`} layout onClick={() => handlePieceClick(piece, false)} className="px-6 py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl font-bold text-lg border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-200 transition-all">
                            <NoTranslate>{piece}</NoTranslate>
                        </motion.button>
                    ))}
                </div>

                <div className="w-full max-w-md">
                    <AnimatePresence mode="wait">
                        {feedback ? (
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -20, opacity: 0 }} className={`p-8 rounded-[2rem] border-2 mb-8 ${feedback.type === 'success' ? 'bg-success/10 border-success text-success' : 'bg-error/10 border-error text-error'}`}>
                                <h3 className="text-xl font-black mb-1 uppercase italic tracking-tight">{feedback.type === 'success' ? 'Slay! ✨' : 'Wait...'}</h3>
                                <p className="font-bold opacity-80">{feedback.message}</p>
                                {feedback.type === 'success' && <Button variant="success" fullWidth className="mt-6 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg" onClick={nextTask}>Next Jump</Button>}
                            </motion.div>
                        ) : (
                            <Button variant="primary" fullWidth className="py-7 rounded-[2rem] text-xl font-black uppercase tracking-widest shadow-xl shadow-primary/20" disabled={selectedPieces.length === 0} onClick={checkAnswer}>Check Timeline</Button>
                        )}
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};
