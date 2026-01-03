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
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/db/supabase';
import { calculateXp, calculateStars } from '@/lib/game-logic/xp-calculator';
import { submitGameScore } from '@/app/actions/gameActions';
import { ALL_LEVELS } from '@/lib/data/mockLevels';
import { useSound } from '@/hooks/use-sound';
import { getTacticalFeedback } from '@/app/actions/aiActions';
import { TacticalAITutor } from './TacticalAITutor';
import { PremiumAIModal } from './PremiumAIModal';
import { AdSenseContainer } from '../ui/AdSenseContainer';

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

    const { addGems, addXp, addVocab, inventory, useCrystal, isPro } = useUserStore();
    const { completeLevel, unlockLevel, getLevelProgress } = useProgressStore();
    const { playSound } = useSound();
    const { data: session } = useSession();
    const userId = session?.user?.id || 'guest';

    const [shieldActive, setShieldActive] = useState(false);
    const [boosterActive, setBoosterActive] = useState(false);
    const [pendingHintPiece, setPendingHintPiece] = useState<string | null>(null);
    const [showOracle, setShowOracle] = useState(false);
    const [aiFeedback, setAiFeedback] = useState<{ explanation: string; tip: string } | null>(null);
    const [showAiTutor, setShowAiTutor] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    const currentTask = tasks[currentIndex];

    const theme = (() => {
        if (level.id === 'grammar-1') return { title: 'Era Modern', highlight: 'Present', color: 'text-primary' };
        if (level.id.includes('past')) return { title: 'Gudang Sejarah', highlight: 'Past', color: 'text-orange-500' };
        return { title: 'Perbatasan Masa Depan', highlight: 'Future', color: 'text-purple-500' };
    })();

    useEffect(() => {
        if (currentTask) {
            const allPieces = [...currentTask.solution, ...currentTask.distractors]
                .sort(() => Math.random() - 0.5);
            setAvailablePieces(allPieces);
            setSelectedPieces([]);
            setFeedback(null);
            setShieldActive(false);
            setPendingHintPiece(null);
            setShowOracle(false);
        }
    }, [currentIndex, tasks]);

    const handlePieceClick = (piece: string, isSelected: boolean) => {
        if (feedback?.type === 'success') return;
        if (feedback?.type === 'error') setFeedback(null);
        playSound('CLICK');
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
            playSound('CORRECT');
            setFeedback({ type: 'success', message: 'Perfect! ' + currentTask.explanation });
            confetti({ particleCount: 40, spread: 60, origin: { y: 0.8 } });
        } else {
            // Check for Shield Crystal (Manual Activation)
            if (shieldActive) {
                playSound('CRYSTAL');
                setShieldActive(false);
                setFeedback({ type: 'error', message: 'Shield Protected! Try refining the timeline.' });
                setTimeout(() => setFeedback(null), 2000);
                return;
            }

            playSound('WRONG');
            setMistakes(prev => prev + 1);
            const nextLives = Math.max(0, lives - 1);
            setLives(nextLives);

            if (nextLives === 0) {
                // Check for Slay Crystal
                if (inventory.slay > 0) {
                    useCrystal('slay').then(used => {
                        if (used) {
                            playSound('SUCCESS');
                            setLives(5);
                            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#f43f5e'] });
                            return;
                        } else {
                            playSound('GAMEOVER');
                            setFeedback({ type: 'error', message: 'Energy habis! Tetap semangat, gas lagi yuk.' });
                            setTimeout(() => setPhase('GAMEOVER'), 1500);
                        }
                    });
                    return;
                }

                playSound('GAMEOVER');
                setFeedback({ type: 'error', message: 'Energy habis! Tetap semangat, gas lagi yuk.' });
                setTimeout(() => setPhase('GAMEOVER'), 1500);
            } else {
                setFeedback({ type: 'error', message: 'Wah, susunannya masih kurang tepat bro. Ayo coba bongkar pasang lagi!' });

                // QUANTUM AI TUTOR: Fetch feedback on grammar mistake
                getTacticalFeedback(
                    currentTask.indonesian,
                    selectedPieces.join(' '),
                    currentTask.solution.join(' '),
                    'grammar',
                    userId
                ).then((res: any) => {
                    if (res.success) {
                        setAiFeedback({ explanation: res.explanation, tip: res.tip });
                        setShowAiTutor(true);
                    } else if (res.isNotPro) {
                        setShowPremiumModal(true);
                    }
                });
            }
        }
    };

    const handleUseShield = async () => {
        if (inventory.shield > 0 && !shieldActive && !feedback) {
            const used = await useCrystal('shield');
            if (used) {
                playSound('CRYSTAL');
                setShieldActive(true);
            }
        }
    };

    const handleUseVision = async () => {
        if (inventory.hint > 0 && currentTask && !feedback) {
            // Hint shows the NEXT required piece
            const nextPiece = currentTask.solution[selectedPieces.length];
            if (nextPiece) {
                const used = await useCrystal('hint');
                if (used) {
                    playSound('CRYSTAL');
                    setPendingHintPiece(nextPiece);
                }
            }
        }
    };

    const handleUseDivineEye = async () => {
        if (inventory.autocorrect > 0 && !feedback) {
            const used = await useCrystal('autocorrect');
            if (used) {
                playSound('CRYSTAL');
                setSelectedPieces(currentTask.solution);
                setAvailablePieces([]);
                setFeedback({ type: 'success', message: 'Divine Eye! Automatic synchronization complete.' });
                confetti({ particleCount: 60, spread: 70, origin: { y: 0.7 } });
            }
        }
    };

    const handleUseBooster = async () => {
        if (inventory.booster > 0 && !boosterActive && !feedback) {
            const used = await useCrystal('booster');
            if (used) {
                playSound('CRYSTAL');
                setBoosterActive(true);
            }
        }
    };

    const handleUseEraser = async () => {
        if (inventory.eraser > 0 && !feedback) {
            const used = await useCrystal('eraser');
            if (used) {
                playSound('CRYSTAL');
                setAvailablePieces(prev => prev.filter(p => currentTask.solution.includes(p)));
                setSelectedPieces(prev => prev.filter(p => currentTask.solution.includes(p)));
            }
        }
    };

    const handleUseTimeWarp = async () => {
        if (inventory.timewarp > 0 && lives < 10) {
            const used = await useCrystal('timewarp');
            if (used) {
                playSound('SUCCESS');
                setLives(prev => Math.min(10, prev + 5));
            }
        }
    };

    const handleUseOracle = async () => {
        if (inventory.oracle > 0 && !showOracle && !feedback) {
            const used = await useCrystal('oracle');
            if (used) {
                playSound('CRYSTAL');
                setShowOracle(true);
            }
        }
    };

    const handleLevelComplete = async () => {
        const timeTaken = (Date.now() - startTime) / 1000;
        const maxTime = tasks.length * 20;

        const xpResults = calculateXp({
            mistakes,
            totalTasks: tasks.length,
            timeRemaining: Math.max(0, maxTime - timeTaken),
            maxTime,
            maxStreak: 0,
            crystalActive: boosterActive,
            isPro: isPro
        });

        const accuracy = (tasks.length - Math.min(tasks.length, mistakes)) / tasks.length;
        const isPassed = accuracy >= 0.7;
        const winStars = calculateStars(accuracy);

        setXpBreakdown(xpResults.breakdown);
        setFinalScore(xpResults.total);

        // SECURE SYNC TO SERVER
        if (userId !== 'guest' && isPassed) {
            const result = await submitGameScore({
                levelId: level.id,
                score: xpResults.total,
                stars: winStars,
                timeTaken: Math.round(timeTaken)
            });

            if (result.success) {
                await Promise.all([
                    useUserStore.getState().syncWithDb(userId),
                    useProgressStore.getState().syncWithDb(userId)
                ]);
            }
        }

        setTimeout(() => {
            if (isPassed) {
                playSound('SUCCESS');
                confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });

                // Rewards are now handled server-side
                completeLevel(level.id, xpResults.total, winStars);

                const allLevelsIndex = ALL_LEVELS.findIndex(l => l.id === level.id);
                if (allLevelsIndex !== -1 && allLevelsIndex < ALL_LEVELS.length - 1) {
                    unlockLevel(ALL_LEVELS[allLevelsIndex + 1].id);
                }
            } else {
                playSound('GAMEOVER');
            }

            setPhase('RESULTS');
        }, 1200);
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
                        <div className="size-12 md:size-16 bg-primary/10 rounded-xl md:rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
                            <Icon name="history_edu" className="text-primary" size={24} mdSize={32} />
                        </div>
                        <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase px-2">Time Machine <span className={theme.color}>{theme.highlight}</span></h1>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-base md:text-lg lg:text-xl leading-relaxed max-w-lg mx-auto">
                            Selamat datang di <span className={theme.color}>{theme.title}</span>. Yuk benerin linimasa tata bahasa dan kuasai tense <span className="italic">{theme.highlight}</span> bareng-bareng.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 text-left px-2">
                        <div className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 md:mb-4">Target Linimasa</h4>
                            <p className="text-sm md:text-base text-slate-900 dark:text-white font-bold">Susun {tasks.length} kalimat yang bener buat memulihkan akurasi sejarah.</p>
                        </div>
                        <div className="p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] bg-slate-50 dark:bg-slate-900/50 border border-slate-200/50">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 md:mb-4">Bonus Keahlian</h4>
                            <p className="text-sm md:text-base text-slate-900 dark:text-white font-bold">Dapatkan sampai 200+ XP dan 50+ Crystal buat sinkronisasi yang sempurna.</p>
                        </div>
                    </div>

                    <Button variant="primary" fullWidth className="py-7 rounded-[2rem] text-xl font-black uppercase tracking-widest shadow-xl"
                        onClick={() => {
                            playSound('START');
                            setPhase('PLAYING');
                            setStartTime(Date.now());
                        }}>
                        Buka Era
                    </Button>
                </motion.div>
            </div>
        );
    }

    if (phase === 'GAMEOVER') {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0a0a0f] flex flex-col items-center justify-center p-6 text-center">
                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-md w-full space-y-8">
                    <div className="size-20 md:size-24 lg:size-32 bg-error/10 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center mx-auto">
                        <Icon name="heart_broken" className="text-error" size={40} mdSize={64} filled />
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">Timeline Glitch!</h2>
                        <p className="text-base md:text-lg text-slate-500 font-bold px-4">Waduh, energy habis! Timeline-nya berantakan, kita ulang ya biar makin gacor.</p>
                    </div>
                    <div className="flex flex-col gap-4">
                        <Button variant="primary" fullWidth className="py-6 rounded-[2rem] font-black uppercase tracking-widest" onClick={restartLevel}>Re-Sync Era</Button>
                        <Button variant="ghost" fullWidth className="py-4 font-black uppercase tracking-widest text-slate-400" onClick={() => router.back()}>Quit to Map</Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (phase === 'RESULTS') {
        const levelData = getLevelProgress(level.id);
        const accuracyPercentage = Math.round(((tasks.length - Math.min(tasks.length, mistakes)) / tasks.length) * 100);
        const isPassed = accuracyPercentage >= 60; // Minimal 60% (2 dari 3 soal)

        return (
            <div className="min-h-screen bg-white dark:bg-[#0a0a0f] flex flex-col items-center justify-center p-6 text-center">
                <motion.div initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-md w-full space-y-12">
                    {isPassed ? (
                        <>
                            <div className="size-32 md:size-48 bg-gradient-to-br from-primary to-primary-dark rounded-[2rem] md:rounded-[4rem] flex flex-col items-center justify-center mx-auto shadow-2xl border-4 md:border-8 border-white/10 relative">
                                <span className="text-[10px] font-black text-white/60 uppercase tracking-widest mt-2">XP Earned</span>
                                <span className="text-4xl md:text-6xl font-black text-white tracking-tighter">{finalScore.toLocaleString('id-ID')}</span>
                                {isPro && (
                                    <div className="absolute -bottom-2 bg-primary text-[8px] font-black px-2 py-0.5 rounded-full border border-white/20 shadow-lg">
                                        PRO 1.5X BOOST
                                    </div>
                                )}
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">Mastery Slay! ✨</h2>
                                <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 font-bold">Gokil! Kamu udah paham banget bahasa era <span className={theme.color}>{theme.highlight}</span>.</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="size-32 md:size-48 bg-error/10 text-error rounded-[2rem] md:rounded-[4rem] flex flex-col items-center justify-center mx-auto border-4 md:border-8 border-error/5 relative space-y-2">
                                <Icon name="sentiment_dissatisfied" size={40} mdSize={64} />
                                <span className="text-2xl md:text-3xl font-black">{accuracyPercentage}%</span>
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase px-4">Era Failed!</h2>
                                <p className="text-base md:text-lg text-slate-500 dark:text-slate-400 font-bold leading-relaxed px-4">
                                    Akurasi kamu cuma <span className="text-error font-black">{accuracyPercentage}%</span>. Minimal harus 60% buat kalibrasi era ini. Coba lagi bro!
                                </p>
                            </div>
                        </>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 px-2">
                        <div className="bg-white dark:bg-slate-900/40 p-3 md:p-6 rounded-xl md:rounded-[2rem] border border-slate-200/50">
                            <Icon name="star" className="text-yellow-400 mb-1 md:mb-2" size={20} mdSize={32} filled />
                            <p className="text-lg md:text-2xl font-black text-slate-900 dark:text-white">{levelData?.stars || 0}</p>
                            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Stars</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900/40 p-3 md:p-6 rounded-xl md:rounded-[2rem] border border-slate-200/50">
                            <Icon name="diamond" className="text-blue-500 mb-1 md:mb-2" size={20} mdSize={32} filled />
                            <p className="text-lg md:text-2xl font-black text-slate-900 dark:text-white">+{(30 + (levelData?.stars || 0) * 15).toLocaleString('id-ID')}</p>
                            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Crystal</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900/40 p-3 md:p-6 rounded-xl md:rounded-[2rem] border border-slate-200/50 col-span-2 md:col-span-1">
                            <Icon name="speed" className="text-purple-500 mb-1 md:mb-2" size={20} mdSize={32} filled />
                            <p className="text-lg md:text-2xl font-black text-slate-900 dark:text-white">{xpBreakdown?.speed > 15 ? 'Elite' : 'Nice'}</p>
                            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Accuracy</p>
                        </div>
                    </div>

                    {isPassed ? (
                        <div className="space-y-6">
                            <Button variant="primary" fullWidth className="py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-xl" onClick={() => router.back()}>
                                Gas Terus!
                            </Button>

                            {/* TACTICAL ADSENSE UNIT */}
                            <AdSenseContainer
                                slot="grammar_results_bottom"
                                className="rounded-2xl border border-slate-700/30"
                            />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <Button variant="primary" fullWidth className="py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-xl bg-error hover:bg-error-dark" onClick={restartLevel}>
                                Retry Era
                            </Button>
                            <AdSenseContainer
                                slot="grammar_fail_bottom"
                                className="rounded-2xl border border-slate-700/30"
                            />
                        </div>
                    )}
                </motion.div>
            </div >
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0f] flex flex-col">
            <GameHeader progress={progress} lives={lives} onPause={() => router.back()} />
            <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-6 max-w-4xl mx-auto w-full pb-20 md:pb-6">
                <div className="text-center space-y-2 md:space-y-4 mb-6 md:mb-12">
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Time: {theme.highlight} Era</span>
                    <h1 className="text-2xl md:text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase px-2">{currentTask.indonesian}</h1>
                </div>

                {/* Oracle Hint */}
                <AnimatePresence>
                    {showOracle && currentTask.explanation && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="w-full mb-8 p-4 md:p-6 bg-amber-500/10 border-2 border-dashed border-amber-500/30 rounded-xl md:rounded-[2rem] text-center relative overflow-hidden group shadow-lg"
                        >
                            <div className="absolute top-0 left-0 p-2 opacity-10">
                                <Icon name="visibility" size={40} className="text-amber-500" />
                            </div>
                            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-amber-500 mb-2">Pencerahan Mata Batin</p>
                            <p className="text-sm md:text-lg font-bold text-slate-700 dark:text-slate-300 italic px-4">
                                {currentTask.explanation}
                            </p>
                            <div className="absolute bottom-0 right-0 p-2 opacity-10">
                                <Icon name="psychology" size={40} className="text-amber-500" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="w-full bg-slate-50 dark:bg-slate-900/50 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border-2 border-slate-200/50 dark:border-slate-800/50 min-h-[120px] md:min-h-[160px] flex flex-wrap gap-2 md:gap-3 items-center justify-center mb-6 md:mb-12 shadow-sm">
                    <AnimatePresence>
                        {selectedPieces.map((piece, i) => (
                            <motion.button key={`selected-${i}-${piece}`} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }}
                                onClick={() => handlePieceClick(piece, true)} className="px-4 md:px-6 py-2 md:py-3 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-xl md:rounded-2xl font-bold text-sm md:text-lg shadow-sm border border-slate-200 dark:border-slate-700 hover:border-primary transition-colors">
                                <NoTranslate>{piece}</NoTranslate>
                            </motion.button>
                        ))}
                    </AnimatePresence>
                    {selectedPieces.length === 0 && <p className="text-slate-400 font-bold text-sm md:text-lg select-none">Bangun kalimatmu disini...</p>}
                </div>

                <div className="flex flex-wrap gap-2 md:gap-3 justify-center mb-8 md:mb-16">
                    {availablePieces.map((piece, idx) => (
                        <motion.button
                            key={`available-${idx}-${piece}`}
                            layout
                            onClick={() => handlePieceClick(piece, false)}
                            className="px-4 md:px-6 py-2 md:py-3 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl md:rounded-2xl font-bold text-sm md:text-lg border-2 border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-200 transition-all relative overflow-hidden"
                        >
                            <NoTranslate>{piece}</NoTranslate>
                            {pendingHintPiece === piece && (
                                <div className="absolute inset-0 bg-blue-500/20 animate-pulse" />
                            )}
                        </motion.button>
                    ))}
                </div>

                <div className="w-full max-w-md">
                    <AnimatePresence mode="wait">
                        {feedback ? (
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                className={`p-8 rounded-[2rem] border-2 mb-8 ${feedback.type === 'success' ? 'bg-success/10 border-success text-success' : 'bg-error/10 border-error text-error'}`}
                            >
                                <h3 className="text-xl font-black mb-1 uppercase italic tracking-tight">
                                    {feedback.type === 'success' ? 'Slay! ✨' : 'Ups... 🧐'}
                                </h3>
                                <p className="font-bold opacity-80">{feedback.message}</p>
                                {feedback.type === 'success' ? (
                                    <Button variant="success" fullWidth className="mt-6 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg" onClick={nextTask}>
                                        Lanjut Misi
                                    </Button>
                                ) : (
                                    <Button variant="error" fullWidth className="mt-6 py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg bg-red-500 border-none" onClick={() => setFeedback(null)}>
                                        Coba Lagi
                                    </Button>
                                )}
                            </motion.div>
                        ) : (
                            <div className="space-y-8">
                                <Button
                                    variant="primary"
                                    fullWidth
                                    className="py-7 rounded-[2rem] text-xl font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                                    disabled={selectedPieces.length === 0}
                                    onClick={checkAnswer}
                                >
                                    Cek Linimasa
                                </Button>

                                <div className="flex items-center justify-center gap-6">
                                    <CrystalButton
                                        icon="security"
                                        count={inventory.shield}
                                        label="Shield"
                                        active={shieldActive}
                                        onClick={handleUseShield}
                                        disabled={!!feedback || shieldActive}
                                    />
                                    <CrystalButton
                                        icon="psychology"
                                        count={inventory.hint}
                                        label="Vision"
                                        active={!!pendingHintPiece}
                                        onClick={handleUseVision}
                                        disabled={!!feedback || !!pendingHintPiece}
                                    />
                                    <CrystalButton
                                        icon="remove_red_eye"
                                        count={inventory.autocorrect}
                                        label="Divine"
                                        onClick={handleUseDivineEye}
                                        disabled={!!feedback}
                                    />
                                    <CrystalButton
                                        icon="bolt"
                                        count={inventory.booster}
                                        label="2x XP"
                                        active={boosterActive}
                                        onClick={handleUseBooster}
                                        disabled={!!feedback || boosterActive}
                                    />
                                    <CrystalButton
                                        icon="update"
                                        count={inventory.timewarp || 0}
                                        label="Recovery"
                                        onClick={handleUseTimeWarp}
                                        disabled={lives >= 10}
                                    />
                                    <CrystalButton
                                        icon="auto_fix_high"
                                        count={inventory.eraser || 0}
                                        label="Eraser"
                                        onClick={handleUseEraser}
                                        disabled={!!feedback}
                                    />
                                    <CrystalButton
                                        icon="visibility"
                                        count={inventory.oracle || 0}
                                        label="Oracle"
                                        onClick={handleUseOracle}
                                        active={showOracle}
                                        disabled={!!feedback || showOracle}
                                    />
                                    <CrystalButton
                                        icon="auto_awesome"
                                        count={inventory.slay}
                                        label="Phoenix"
                                        onClick={() => { }} // Auto used when dead
                                        disabled={true}
                                    />
                                </div>


                                {/* Construction Area */}
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </main>

            <TacticalAITutor
                isVisible={showAiTutor}
                explanation={aiFeedback?.explanation || ''}
                tip={aiFeedback?.tip || ''}
                onClose={() => setShowAiTutor(false)}
            />
        </div>
    );
};

interface CrystalButtonProps {
    icon: string;
    count: number;
    label: string;
    onClick?: () => void;
    active?: boolean;
    disabled?: boolean;
}

const CrystalButton: React.FC<CrystalButtonProps> = ({ icon, count, label, onClick, active, disabled }) => {
    if (count <= 0) return null;

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex flex-col items-center gap-1 group transition-all hover:scale-110 active:scale-95`}
        >
            <div className={`size-12 rounded-xl flex items-center justify-center relative border-2 transition-all
            ${active
                    ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-110'
                    : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 group-hover:border-primary/50 group-hover:text-primary'}
            ${!active && !disabled ? 'ring-2 ring-primary/20 ring-offset-2 dark:ring-offset-[#0a0a0f]' : ''}
        `}>
                <Icon name={icon} size={24} filled={active} />
                <div className="absolute -top-2 -right-2 size-5 bg-primary text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-md border-2 border-white dark:border-[#0a0a0f]">
                    {count}
                </div>
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">{label}</span>
        </button>
    );
};
