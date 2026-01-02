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
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/db/supabase';
import { calculateXp, calculateStars } from '@/lib/game-logic/xp-calculator';
import { submitGameScore } from '@/app/actions/gameActions';
import { CURRICULUM_LEVELS } from '@/lib/data/mockLevels';
import { useSound } from '@/hooks/use-sound';
import { getTacticalFeedback } from '@/app/actions/aiActions';
import { TacticalAITutor } from './TacticalAITutor';
import { PremiumAIModal } from './PremiumAIModal';
import { AdSenseContainer } from '../ui/AdSenseContainer';

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
    const [selectedChoice, setSelectedChoice] = useState<number | null>(null);

    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const { addGems, addXp, inventory, useCrystal, isPro } = useUserStore();
    const { completeLevel, unlockLevel, getLevelProgress } = useProgressStore();
    const { playSound } = useSound();
    const { data: session } = useSession();
    const userId = session?.user?.id || 'guest';

    const [shieldActive, setShieldActive] = useState(false);
    const [isTimeFrozen, setIsTimeFrozen] = useState(false);
    const [showVision, setShowVision] = useState(false);
    const [boosterActive, setBoosterActive] = useState(false);
    const [eliminatedChoices, setEliminatedChoices] = useState<number[]>([]);
    const [aiFeedback, setAiFeedback] = useState<{ explanation: string; tip: string } | null>(null);
    const [showAiTutor, setShowAiTutor] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    const currentTask = tasks[currentIndex];

    // Timer logic
    useEffect(() => {
        if (phase === 'PLAYING' && !isPaused && !feedback && !isTimeFrozen) {
            if (timeLeft > 0) {
                timerRef.current = setTimeout(() => setTimeLeft(prev => prev - 0.1), 100);
            } else {
                handleAnswer(-1);
            }
        }
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [phase, timeLeft, isPaused, feedback, isTimeFrozen]);

    // Keyboard Listeners for Options (1, 2, 3, 4)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (phase !== 'PLAYING' || isPaused || feedback) return;

            const keyMap: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3 };
            if (e.key in keyMap) {
                const idx = keyMap[e.key];
                if (currentTask.choices[idx]) {
                    handleAnswer(idx);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [phase, isPaused, feedback, currentTask]);

    const handleAnswer = (choiceIndex: number) => {
        if (feedback) return;
        setSelectedChoice(choiceIndex);

        const isCorrect = choiceIndex === currentTask.correctIndex;

        if (isCorrect) {
            playSound('CORRECT');
            setFeedback('CORRECT');
            const newStreak = streak + 1;
            setStreak(newStreak);
            setMaxStreak(prev => Math.max(prev, newStreak));

            if (newStreak >= 3) {
                confetti({ particleCount: 20, spread: 40, origin: { y: 0.8 }, colors: ['#fbbf24', '#f59e0b'] });
            }
        } else {
            // Check for Shield Crystal (Manual Activation)
            if (shieldActive) {
                playSound('CRYSTAL');
                setShieldActive(false);
                setFeedback('WRONG');
                setTimeout(() => {
                    setFeedback(null);
                    setTimeLeft(prev => prev + 2); // Small bonus time
                }, 1000);
                return;
            }

            playSound('WRONG');
            setFeedback('WRONG');
            setStreak(0);
            setMistakes(prev => prev + 1);
            const nextLives = Math.max(0, lives - 1);
            setLives(nextLives);

            if (nextLives === 0) {
                // Check for Phoenix (Slay) Crystal
                if (inventory.slay > 0) {
                    useCrystal('slay').then(used => {
                        if (used) {
                            playSound('SUCCESS');
                            setLives(5); // Revive with 5 lives
                            confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 }, colors: ['#f43f5e'] });
                            return;
                        } else {
                            playSound('GAMEOVER');
                            setTimeout(() => setPhase('GAMEOVER'), 600);
                        }
                    });
                    return;
                }

                playSound('GAMEOVER');
                setTimeout(() => setPhase('GAMEOVER'), 600);
                return;
            }

            // QUANTUM AI TUTOR: Fetch feedback on blitz mistake
            getTacticalFeedback(
                currentTask.english,
                choiceIndex === -1 ? 'TIME OUT' : currentTask.choices[choiceIndex],
                currentTask.choices[currentTask.correctIndex],
                'blitz',
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

        setTimeout(() => {
            if (currentIndex < tasks.length - 1) {
                setCurrentIndex(prev => prev + 1);
                setTimeLeft(Math.max(2, 5 - (streak * 0.2)));
                setFeedback(null);
                setShowVision(false);
                setIsTimeFrozen(false);
                setSelectedChoice(null);
                setEliminatedChoices([]);
            } else {
                handleLevelComplete();
            }
        }, 600);
    };

    const handleUseFocus = async () => {
        if (inventory.focus > 0 && phase === 'PLAYING' && !feedback) {
            const used = await useCrystal('focus');
            if (used) {
                playSound('CRYSTAL');
                setTimeLeft(Math.max(5, timeLeft + 3));
            }
        }
    };

    const handleUseTimefreeze = async () => {
        if (inventory.timefreeze > 0 && phase === 'PLAYING' && !feedback && !isTimeFrozen) {
            const used = await useCrystal('timefreeze');
            if (used) {
                playSound('CRYSTAL');
                setIsTimeFrozen(true);
                setTimeout(() => setIsTimeFrozen(false), 5000); // 5 sec freeze
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
        if (inventory.hint > 0 && phase === 'PLAYING' && !feedback && !showVision) {
            const used = await useCrystal('hint');
            if (used) {
                playSound('CRYSTAL');
                setShowVision(true);
            }
        }
    };

    const handleUseBooster = async () => {
        if (inventory.booster > 0 && !boosterActive && phase === 'PLAYING' && !feedback) {
            const used = await useCrystal('booster');
            if (used) {
                playSound('CRYSTAL');
                setBoosterActive(true);
            }
        }
    };

    const handleUseEraser = async () => {
        if (inventory.eraser > 0 && phase === 'PLAYING' && !feedback && eliminatedChoices.length === 0) {
            const used = await useCrystal('eraser');
            if (used) {
                playSound('CRYSTAL');
                const correctIdx = currentTask.correctIndex;
                const wrongIndices = currentTask.choices
                    .map((_, i) => i)
                    .filter(i => i !== correctIdx);
                const toEliminate = wrongIndices.sort(() => Math.random() - 0.5).slice(0, 2);
                setEliminatedChoices(toEliminate);
            }
        }
    };

    const handleUseTimeWarp = async () => {
        if (inventory.timewarp > 0 && phase === 'PLAYING' && !feedback) {
            const used = await useCrystal('timewarp');
            if (used) {
                playSound('CRYSTAL');
                setTimeLeft(prev => prev + 10);
            }
        }
    };

    const handleLevelComplete = async () => {
        const timeTaken = (Date.now() - startTime) / 1000;
        const maxTime = tasks.length * 5;

        const xpResults = calculateXp({
            mistakes,
            totalTasks: tasks.length,
            timeRemaining: Math.max(0, maxTime - timeTaken),
            maxTime,
            maxStreak,
            crystalActive: boosterActive,
            isPro: isPro
        });

        const accuracy = (tasks.length - mistakes) / tasks.length;
        const isPassed = accuracy >= 0.7;
        const winStars = calculateStars(accuracy);

        setScore(xpResults.total);

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
            setTimeout(() => {
                if (isPassed) {
                    playSound('SUCCESS');
                    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });

                    // Rewards are now handled server-side
                    completeLevel(level.id, xpResults.total, winStars);

                    const curriculumIndex = CURRICULUM_LEVELS.findIndex(l => l.id === level.id);
                    if (curriculumIndex !== -1 && curriculumIndex < CURRICULUM_LEVELS.length - 1) {
                        unlockLevel(CURRICULUM_LEVELS[curriculumIndex + 1].id);
                    }
                } else {
                    playSound('GAMEOVER');
                }

                setPhase('RESULTS');
            }, 600);
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

                    <div className="space-y-4 md:space-y-6">
                        <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter italic uppercase underline decoration-primary decoration-4 md:decoration-8 underline-offset-4 md:underline-offset-8 decoration-skip-ink-none px-4">Kilatan Cepat</h1>
                        <p className="text-slate-400 font-bold text-sm md:text-base lg:text-xl px-4 md:px-12 leading-relaxed">Hanya 5 detik tiap soal! Refleks kamu harus sangat cepat agar tidak kalah. Kuasai tata bahasanya!</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 md:gap-4 text-left">
                        <div className="p-3 md:p-6 bg-white/5 rounded-xl md:rounded-3xl border border-white/10">
                            <span className="text-[7px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em] block mb-1 md:mb-2">Aturan #1</span>
                            <p className="text-[10px] md:text-base text-white font-bold leading-snug">Kesalahan = Kehilangan Nyawa. Jangan berkedip!</p>
                        </div>
                        <div className="p-3 md:p-6 bg-white/5 rounded-xl md:rounded-3xl border border-white/10">
                            <span className="text-[7px] md:text-[10px] font-black text-primary uppercase tracking-[0.2em] block mb-1 md:mb-2">Aturan #2</span>
                            <p className="text-[10px] md:text-base text-white font-bold leading-snug">Beruntun = Makin CEPAT. Refleks jagoan saja.</p>
                        </div>
                    </div>

                    <Button variant="primary" fullWidth className="py-4 md:py-7 rounded-xl md:rounded-[2rem] text-sm md:text-xl font-black uppercase tracking-widest shadow-[0_20px_50px_rgba(8,126,255,0.3)] group overflow-hidden relative"
                        onClick={() => {
                            playSound('START');
                            setPhase('PLAYING');
                            setStartTime(Date.now());
                        }}>
                        <span className="relative z-10">Mulai Sekarang! ⚡️</span>
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
                        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter italic uppercase">Nyawa Habis! ⚡️</h2>
                        <p className="text-slate-400 font-bold text-sm md:text-base lg:text-lg leading-relaxed px-6">Refleks kamu kurang cepat hari ini! Kamu butuh fokus lebih agar bisa bertahan lama.</p>
                    </div>
                    <div className="flex flex-col gap-3 md:gap-4">
                        <Button variant="primary" fullWidth className="py-5 md:py-7 rounded-xl md:rounded-[2rem] font-black uppercase tracking-widest text-base md:text-lg shadow-xl shadow-primary/20" onClick={restartLevel}>ULANGI KILATAN</Button>
                        <Button variant="ghost" fullWidth className="py-3 md:py-4 font-black uppercase tracking-widest text-xs md:text-sm text-slate-500" onClick={() => router.back()}>Kembali ke Peta</Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    if (phase === 'RESULTS') {
        const levelData = getLevelProgress(level.id);
        const accuracy = (tasks.length - mistakes) / tasks.length;
        const isPassed = accuracy >= 0.7;

        return (
            <div className="min-h-screen bg-[#06060a] flex flex-col items-center justify-center p-6 text-center overflow-hidden">
                <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-xl w-full space-y-12">
                    {isPassed ? (
                        <>
                            <div className="relative">
                                <div className="size-32 md:size-48 bg-gradient-to-br from-primary to-primary-dark rounded-[2.5rem] md:rounded-[4rem] flex flex-col items-center justify-center mx-auto shadow-[0_0_60px_rgba(8,126,255,0.4)] border-4 md:border-8 border-white/10 relative">
                                    <span className="text-[10px] font-black text-white/60 uppercase tracking-widest mt-2">Skor Kilatan</span>
                                    <span className="text-4xl md:text-7xl font-black text-white tracking-tighter">{score.toLocaleString('id-ID')}</span>
                                    {isPro && (
                                        <div className="absolute -bottom-2 bg-primary text-[8px] font-black px-2 py-0.5 rounded-full border border-white/20 shadow-lg">
                                            PRO 1.5X BOOST
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-3xl md:text-6xl lg:text-7xl font-black text-white tracking-tighter italic uppercase underline decoration-primary decoration-4 md:decoration-8 underline-offset-4 md:underline-offset-8 px-4">KILATAN SELESAI! ✨</h2>
                                <p className="text-slate-400 font-bold text-sm md:text-lg px-4">Refleks kamu luar biasa! Status Master Tata Bahasa: Terbuka.</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="size-32 md:size-48 bg-error/20 text-error rounded-[2.5rem] md:rounded-[4rem] flex flex-col items-center justify-center mx-auto border-4 md:border-8 border-error/20 relative space-y-2">
                                <Icon name="bolt_outline" size={40} mdSize={80} />
                                <span className="text-2xl md:text-3xl font-black">{Math.round(accuracy * 100)}%</span>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-3xl md:text-6xl font-black text-white tracking-tighter italic uppercase text-error px-4">KILATAN GAGAL! ⚡️</h2>
                                <p className="text-slate-400 font-bold text-sm md:text-lg px-4 leading-relaxed">
                                    Akurasi kamu hanya <span className="text-error font-black">{Math.round(accuracy * 100)}%</span>. Minimal harus 70% untuk lulus Kilatan ini. Ayo coba lagi!
                                </p>
                            </div>
                        </>
                    )}

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-4 px-2">
                        <div className="bg-white/5 p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border border-white/10">
                            <Icon name="star" className="text-yellow-400 mb-1 md:mb-2" size={20} mdSize={32} filled />
                            <p className="text-xl md:text-2xl font-black text-white">{levelData?.stars || 0}</p>
                            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">Bintang</p>
                        </div>
                        <div className="bg-white/5 p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border border-white/10">
                            <Icon name="diamond" className="text-blue-400 mb-1 md:mb-2" size={20} mdSize={32} filled />
                            <p className="text-xl md:text-2xl font-black text-white">+{(30 + (levelData?.stars || 0) * 20).toLocaleString('id-ID')}</p>
                            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">Kristal</p>
                        </div>
                        <div className="bg-white/5 p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border border-white/10 col-span-2 md:col-span-1">
                            <Icon name="speed" className="text-primary mb-1 md:mb-2" size={20} mdSize={32} filled />
                            <p className="text-xl md:text-2xl font-black text-white">{maxStreak > 5 ? 'Cepat' : 'Sedang'}</p>
                            <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-500">Refleks</p>
                        </div>
                    </div>

                    {isPassed ? (
                        <div className="space-y-6">
                            <Button variant="primary" fullWidth className="py-5 md:py-7 rounded-xl md:rounded-[2rem] font-black uppercase tracking-widest text-base md:text-xl shadow-[0_20px_50px_rgba(8,126,255,0.2)]" onClick={() => router.back()}>Lanjut!</Button>

                            {/* TACTICAL ADSENSE UNIT */}
                            <AdSenseContainer
                                slot="blitz_results_bottom"
                                className="rounded-2xl border border-white/10"
                            />
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <Button variant="primary" fullWidth className="py-5 md:py-7 rounded-xl md:rounded-[2rem] font-black uppercase tracking-widest text-base md:text-xl bg-error hover:bg-error-dark shadow-xl" onClick={restartLevel}>Coba Lagi</Button>

                            {/* TACTICAL ADSENSE UNIT */}
                            <AdSenseContainer
                                slot="blitz_fail_bottom"
                                className="rounded-2xl border border-white/10"
                            />
                        </div>
                    )}
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#06060a] flex flex-col selection:bg-primary/30">
            <GameHeader progress={((currentIndex + 1) / tasks.length) * 100} lives={lives} onPause={() => router.back()} />
            <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
                <AnimatePresence mode="wait">
                    <motion.div key={currentIndex} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="w-full space-y-12">
                        <div className="text-center space-y-6 relative">
                            <div className="flex items-center justify-center gap-4 mb-4">
                                <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${streak > 0 ? 'bg-orange-500 text-white' : 'bg-white/10 text-slate-400'}`}>{streak} Streak</span>
                                <div className="flex-1 h-3 bg-white/10 rounded-full overflow-hidden max-w-[120px]">
                                    <motion.div className="h-full bg-primary" animate={{ width: `${(timeLeft / 5) * 100}%` }} transition={{ duration: 0.1, ease: 'linear' }} />
                                </div>
                                <span className={`text-xs font-black w-8 ${isTimeFrozen ? 'text-blue-400 animate-pulse' : 'text-white'}`}>{(timeLeft).toFixed(1)}s</span>
                                {isTimeFrozen && <Icon name="ac_unit" size={16} className="text-blue-400 animate-spin" />}
                            </div>
                            <h1 className="text-3xl md:text-5xl lg:text-7xl font-black text-white tracking-tighter italic uppercase underline decoration-white/10 decoration-4 md:decoration-8 underline-offset-8 md:underline-offset-12 px-4">
                                <NoTranslate>{currentTask.english}</NoTranslate>
                            </h1>

                            <AnimatePresence>
                                {shieldActive && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center z-20">
                                        <div className="bg-blue-500 text-white px-6 py-2 rounded-xl font-black uppercase tracking-widest shadow-2xl flex items-center gap-2 border-2 border-white/20">
                                            <Icon name="security" size={16} mdSize={20} filled />
                                            Tameng Aktif!
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:gap-4">
                            {currentTask.choices.map((choice, idx) => {
                                const isSelected = selectedChoice === idx;
                                const isCorrect = idx === currentTask.correctIndex;
                                const showHint = showVision && isCorrect;
                                const isEliminated = eliminatedChoices.includes(idx);

                                return (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(idx)}
                                        disabled={isPaused || feedback !== null || isEliminated}
                                        className={`p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] text-sm md:text-xl font-black transition-all border-2 text-left flex items-center justify-between group relative overflow-hidden
                                            ${isSelected ? (isCorrect ? 'bg-success/10 border-success text-success scale-105' : 'bg-error/10 border-error text-error shake') :
                                                showHint ? 'bg-blue-500/10 border-blue-500 text-blue-500 animate-pulse' :
                                                    isEliminated ? 'opacity-0 pointer-events-none' :
                                                        'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-primary hover:bg-primary/5 hover:scale-[1.02]'}
                                        `}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`size-8 rounded-lg flex items-center justify-center text-xs font-black transition-colors
                                                    ${isSelected ? (isCorrect ? 'bg-white/20 text-white' : 'bg-white/20 text-white') : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:bg-primary group-hover:text-white'}
                                                `}>
                                                {idx + 1}
                                            </div>
                                            <NoTranslate>{choice}</NoTranslate>
                                        </div>
                                        {isSelected && isCorrect && <Icon name="check_circle" filled />}
                                        {isSelected && !isCorrect && <Icon name="cancel" filled />}
                                    </button>
                                );
                            })}
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4 mt-8">
                            <CrystalButton
                                icon="security"
                                count={inventory.shield}
                                label="Shield"
                                active={shieldActive}
                                onClick={handleUseShield}
                                disabled={feedback !== null || shieldActive}
                            />
                            <CrystalButton
                                icon="update"
                                count={inventory.timewarp || 0}
                                label="Time Warp"
                                onClick={handleUseTimeWarp}
                                disabled={feedback !== null}
                            />
                            <CrystalButton
                                icon="timer_off"
                                count={inventory.focus}
                                label="Focus"
                                active={isPaused} // Focus stops timer
                                onClick={handleUseFocus}
                                disabled={feedback !== null}
                            />
                            <CrystalButton
                                icon="psychology"
                                count={inventory.hint}
                                label="Vision"
                                active={showVision}
                                onClick={handleUseVision}
                                disabled={feedback !== null || showVision}
                            />
                            <CrystalButton
                                icon="auto_fix_high"
                                count={inventory.eraser || 0}
                                label="Eraser"
                                onClick={handleUseEraser}
                                disabled={feedback !== null || eliminatedChoices.length > 0}
                            />
                            <CrystalButton
                                icon="bolt"
                                count={inventory.booster}
                                label="2x XP"
                                active={boosterActive}
                                onClick={handleUseBooster}
                                disabled={feedback !== null || boosterActive}
                            />
                            <CrystalButton
                                icon="auto_awesome"
                                count={inventory.slay}
                                label="Phoenix"
                                onClick={() => { }} // Auto-used
                                disabled={true}
                            />
                        </div>
                    </motion.div>
                </AnimatePresence>
            </main>

            <TacticalAITutor
                isVisible={showAiTutor}
                explanation={aiFeedback?.explanation || ''}
                tip={aiFeedback?.tip || ''}
                onClose={() => setShowAiTutor(false)}
            />

            <PremiumAIModal
                isOpen={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
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

const CrystalButton: React.FC<CrystalButtonProps> = ({ icon, count, label, onClick, active, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled || count <= 0}
        className={`flex flex-col items-center gap-1 group transition-all ${count <= 0 ? 'opacity-20 grayscale cursor-not-allowed' : 'hover:scale-110 active:scale-95'}`}
    >
        <div className={`size-12 rounded-xl flex items-center justify-center relative border-2 transition-all
            ${active
                ? 'bg-primary border-primary text-white shadow-lg shadow-primary/30 scale-110'
                : 'bg-white/10 border-white/10 text-slate-400 group-hover:text-primary group-hover:border-primary/30'}
            ${count > 0 && !active && !disabled ? 'ring-2 ring-primary/20 ring-offset-2 ring-offset-[#06060a]' : ''}
        `}>
            <Icon name={icon} size={24} filled={active} />
            <div className="absolute -top-2 -right-2 size-5 bg-primary text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-md border-2 border-[#06060a]">
                {count}
            </div>
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">{label}</span>
    </button>
);
