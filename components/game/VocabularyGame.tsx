'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, Button, NoTranslate } from '../ui/UIComponents';
import { GameHeader } from '../layout/Navigation';
import { Level, Word } from '@/types';
import confetti from 'canvas-confetti';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/store/user-store';
import { useProgressStore } from '@/store/progress-store';
import { useSession } from 'next-auth/react';
import { supabase } from '@/lib/db/supabase';
import { calculateXp, calculateStars } from '@/lib/game-logic/xp-calculator';
import { CURRICULUM_LEVELS } from '@/lib/data/mockLevels';
import { useSound } from '@/hooks/use-sound';

interface VocabularyGameProps {
    level: Level;
    words: Word[];
}

type GamePhase = 'INTRO' | 'MEMORIZE' | 'QUIZ' | 'RESULTS' | 'GAMEOVER';

export const VocabularyGame: React.FC<VocabularyGameProps> = ({ level, words }) => {
    const router = useRouter();
    const [phase, setPhase] = useState<GamePhase>('INTRO');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [lives, setLives] = useState(10);
    const [score, setScore] = useState(0);
    const [options, setOptions] = useState<string[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [mistakes, setMistakes] = useState(0);
    const [startTime, setStartTime] = useState(0);
    const [xpBreakdown, setXpBreakdown] = useState<any>(null);

    const { addGems, addXp, inventory, useCrystal } = useUserStore();
    const { completeLevel, unlockLevel, getLevelProgress } = useProgressStore();
    const { playSound } = useSound();

    const [showVision, setShowVision] = useState(false);
    const [shieldActive, setShieldActive] = useState(false);

    // Prepare quiz options when currentIndex changes
    useEffect(() => {
        if (phase === 'QUIZ' && words[currentIndex]) {
            const currentWord = words[currentIndex];
            const otherWords = words
                .filter(w => w.id !== currentWord.id)
                .map(w => w.indonesian);

            const shuffled = [currentWord.indonesian, ...otherWords.slice(0, 3)]
                .sort(() => Math.random() - 0.5);

            setOptions(shuffled);
            setSelectedOption(null);
            setIsCorrect(null);
            setShowVision(false);
            setShieldActive(false);
        }
    }, [phase, currentIndex, words]);

    // Keyboard Listeners for Options (1, 2, 3, 4)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (phase !== 'QUIZ' || selectedOption !== null) return;

            const keyMap: Record<string, number> = { '1': 0, '2': 1, '3': 2, '4': 3 };
            if (e.key in keyMap) {
                const idx = keyMap[e.key];
                if (options[idx]) {
                    handleAnswer(options[idx]);
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [phase, options, selectedOption]);

    const handleAnswer = (answer: string) => {
        if (selectedOption !== null) return;

        setSelectedOption(answer);
        const correct = answer === words[currentIndex].indonesian;
        setIsCorrect(correct);

        if (correct) {
            playSound('CORRECT');
            if (currentIndex === words.length - 1) {
                handleLevelComplete();
            } else {
                setTimeout(() => setCurrentIndex(prev => prev + 1), 1000);
            }
        } else {
            // Check for Shield Crystal (Manual Activation)
            if (shieldActive) {
                playSound('CRYSTAL');
                setShieldActive(false); // Used up
                setSelectedOption(null); // Reset for retry
                setIsCorrect(null);
                return;
            }

            playSound('WRONG');
            setMistakes(prev => prev + 1);
            const nextLives = Math.max(0, lives - 1);
            setLives(nextLives);

            if (nextLives === 0) {
                playSound('GAMEOVER');
                setTimeout(() => setPhase('GAMEOVER'), 1000);
            } else {
                setTimeout(() => {
                    if (currentIndex < words.length - 1) {
                        setCurrentIndex(prev => prev + 1);
                    } else {
                        handleLevelComplete();
                    }
                }, 1500);
            }
        }
    };

    const handleUseShield = () => {
        if (inventory.shield > 0 && !shieldActive && !selectedOption) {
            const used = useCrystal('shield');
            if (used) {
                playSound('CRYSTAL');
                setShieldActive(true);
            }
        }
    };

    const handleUseVision = () => {
        if (inventory.hint > 0 && !showVision && !selectedOption) {
            const used = useCrystal('hint');
            if (used) {
                playSound('CRYSTAL');
                setShowVision(true);
            }
        }
    };

    const handleUseDivineEye = () => {
        if (inventory.autocorrect > 0 && !selectedOption) {
            const used = useCrystal('autocorrect');
            if (used) {
                playSound('CRYSTAL');
                handleAnswer(words[currentIndex].indonesian);
            }
        }
    };

    const { data: session } = useSession();
    const userId = session?.user?.id || 'guest';

    const handleLevelComplete = async () => {
        const timeTaken = (Date.now() - startTime) / 1000;
        const maxTime = words.length * 10;
        const accuracy = (words.length - mistakes) / words.length;

        // Requirement: 80% for exams, 70% for regular levels
        const passThreshold = level.isExam ? 0.8 : 0.7;
        const isPassed = accuracy >= passThreshold;
        const isPerfect = accuracy === 1;

        const xpResults = calculateXp({
            mistakes,
            totalTasks: words.length,
            timeRemaining: Math.max(0, maxTime - timeTaken),
            maxTime,
            maxStreak: 0,
            crystalActive: false
        });

        const winStars = calculateStars(accuracy);

        setXpBreakdown(xpResults.breakdown);
        setScore(xpResults.total);

        // SYNC TO SUPABASE
        if (userId !== 'guest' && isPassed) {
            try {
                // 1. Save Level Progress
                await supabase.from('user_progress').upsert({
                    user_id: userId,
                    level_id: level.id,
                    status: 'COMPLETED',
                    score: xpResults.total,
                    stars: winStars,
                    completed_at: new Date().toISOString()
                });

                // 2. Save Achievement if Perfect Exam
                if (level.isExam && isPerfect) {
                    await supabase.from('user_achievements').upsert({
                        user_id: userId,
                        achievement_id: `vocab_phase_${level.phase}_perfect`,
                        title: `Perfect Phase ${level.phase}`,
                    });
                }
            } catch (err) {
                console.error('Failed to sync with Supabase:', err);
            }
        }

        setTimeout(() => {
            if (isPassed) {
                playSound('SUCCESS');
                confetti({ particleCount: 200, spread: 100, origin: { y: 0.6 } });
                addGems(level.isExam ? 100 : 25 + (winStars * 10));
                addXp(xpResults.total);

                completeLevel(level.id, xpResults.total, winStars);

                const currentIndexInCurriculum = CURRICULUM_LEVELS.findIndex(l => l.id === level.id);
                if (currentIndexInCurriculum !== -1 && currentIndexInCurriculum < CURRICULUM_LEVELS.length - 1) {
                    unlockLevel(CURRICULUM_LEVELS[currentIndexInCurriculum + 1].id);
                }
            } else {
                playSound('GAMEOVER');
            }
            setPhase('RESULTS');
        }, 1000);
    };

    const restartLevel = () => {
        setCurrentIndex(0);
        setLives(10);
        setScore(0);
        setMistakes(0);
        setPhase('INTRO');
    };

    const progress = ((currentIndex + 1) / words.length) * 100;

    if (phase === 'INTRO') {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0a0a0f] flex flex-col items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full text-center space-y-8"
                >
                    <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Icon name={level.icon || 'school'} className="text-primary" size={32} />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">{level.title}</h1>
                        <p className="text-slate-500 font-bold text-base md:text-lg">{level.description}</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 p-6 md:p-8 rounded-2xl md:rounded-[2.5rem] border border-slate-200/50 text-left">
                        <h4 className="text-xs md:text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Mission Goals</h4>
                        <ul className="space-y-3">
                            <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-bold">
                                <div className="size-6 rounded-full bg-success/20 text-success flex items-center justify-center">
                                    <Icon name="check" size={14} />
                                </div>
                                Learn {words.length} new words
                            </li>
                            <li className="flex items-center gap-3 text-slate-600 dark:text-slate-300 font-bold">
                                <div className="size-6 rounded-full bg-primary/20 text-primary flex items-center justify-center">
                                    <Icon name="bolt" size={14} />
                                </div>
                                Earn up to 150+ XP
                            </li>
                        </ul>
                    </div>

                    <Button
                        variant="primary"
                        fullWidth
                        className="py-6 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                        onClick={() => {
                            playSound('START');
                            setStartTime(Date.now());
                            if (level.isExam) {
                                setPhase('QUIZ');
                            } else {
                                setPhase('MEMORIZE');
                            }
                        }}
                    >
                        {level.isExam ? 'Start Final Exam' : 'Gas Belajar!'}
                    </Button>
                </motion.div>
            </div>
        );
    }

    if (phase === 'GAMEOVER') {
        return (
            <div className="min-h-screen bg-white dark:bg-[#0a0a0f] flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full space-y-8"
                >
                    <div className="size-24 md:size-32 bg-error/10 rounded-2xl md:rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                        <Icon name="heart_broken" size={48} mdSize={60} className="text-error" filled />
                    </div>
                    <div>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter italic uppercase">Yah, Energy Habis!</h2>
                        <p className="text-slate-500 font-bold text-base md:text-lg">Literally harus mulai lagi dari awal nih biar makin gacor.</p>
                    </div>
                    <div className="flex flex-col gap-3">
                        <Button variant="primary" fullWidth className="py-6 rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl" onClick={restartLevel}>
                            Restart Level
                        </Button>
                        <Button variant="ghost" fullWidth className="py-4 font-black uppercase tracking-widest text-slate-400" onClick={() => router.push('/')}>
                            Balik ke Home
                        </Button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const handleResetPhase = () => {
        const phaseLevels = CURRICULUM_LEVELS.filter(l => l.phase === level.phase && !l.isExam);
        const levelIdsToReset = phaseLevels.map(l => l.id);

        // Reset in Zusant Store
        const { resetPhaseProgress } = useProgressStore.getState();
        resetPhaseProgress(levelIdsToReset);

        // Go back to the first level of the phase
        if (phaseLevels.length > 0) {
            router.push(`/game/${phaseLevels[0].id}`);
        } else {
            router.push('/');
        }
    };

    if (phase === 'RESULTS') {
        const levelData = getLevelProgress(level.id);
        const accuracy = (words.length - mistakes) / words.length;
        const passThreshold = level.isExam ? 0.8 : 0.7;
        const isPassed = accuracy >= passThreshold;
        const isPerfect = accuracy === 1;

        return (
            <div className="min-h-screen bg-white dark:bg-[#0a0a0f] flex flex-col items-center justify-center p-6 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full space-y-12"
                >
                    {isPassed ? (
                        <>
                            <div className="size-32 md:size-48 bg-gradient-to-br from-primary to-primary-dark rounded-3xl md:rounded-[4rem] flex flex-col items-center justify-center mx-auto shadow-2xl border-4 md:border-8 border-white/10 relative">
                                <span className="text-[10px] md:text-xs font-black text-white/60 uppercase tracking-widest mt-2">XP Earned</span>
                                <span className="text-4xl md:text-6xl font-black text-white tracking-tighter">{score}</span>
                                {isPerfect && level.isExam && (
                                    <div className="absolute -top-2 -right-2 bg-yellow-400 text-white px-3 py-1.5 rounded-lg text-[8px] md:text-[10px] font-black uppercase tracking-widest shadow-lg animate-bounce">
                                        Achievement!
                                    </div>
                                )}
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">
                                    {level.isExam ? 'Phase Passed! 🏆' : 'Level Mastered! ✨'}
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 font-bold text-base md:text-lg">
                                    {isPerfect ? 'Perfect Score! Literal Sepuh momentum.' : `Accuracy: ${Math.round(accuracy * 100)}%. Great job!`}
                                </p>
                            </div>

                            <div className="grid grid-cols-3 gap-3 md:gap-4">
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-200/50">
                                    <Icon name="star" className="text-yellow-400 mb-1 md:mb-2" size={24} mdSize={32} filled />
                                    <p className="text-lg md:text-2xl font-black text-slate-900 dark:text-white">{levelData?.stars || 0}</p>
                                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Stars</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-200/50">
                                    <Icon name="diamond" className="text-blue-500 mb-1 md:mb-2" size={24} mdSize={32} filled />
                                    <p className="text-lg md:text-2xl font-black text-slate-900 dark:text-white">+{25 + (levelData?.stars || 0) * 10}</p>
                                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Gems</p>
                                </div>
                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-200/50">
                                    <Icon name="timer" className="text-purple-500 mb-1 md:mb-2" size={24} mdSize={32} filled />
                                    <p className="text-lg md:text-2xl font-black text-slate-900 dark:text-white">{xpBreakdown?.speed > 15 ? 'Fast' : 'Mid'}</p>
                                    <p className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-slate-400">Speed</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-12">
                            <div className="size-48 bg-error/10 text-error rounded-[4rem] flex flex-col items-center justify-center mx-auto border-8 border-error/5 relative">
                                <Icon name="sentiment_dissatisfied" size={80} />
                                <span className="text-3xl font-black mt-2">{Math.round(accuracy * 100)}%</span>
                            </div>

                            <div className="space-y-4">
                                <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">{level.isExam ? 'Exam Failed!' : 'Level Failed!'}</h2>
                                <p className="text-slate-500 dark:text-slate-400 font-bold text-lg leading-relaxed">
                                    {level.isExam
                                        ? `Waduh! Minimal harus 80% buat lanjut ke Phase berikutnya. Karena gagal, lo harus REPLAY Phase ini dari awal.`
                                        : `Waduh! Akurasi lo cuma ${Math.round(accuracy * 100)}%. Minimal harus 70% biar lulus level ini. Gas coba lagi!`
                                    }
                                </p>
                            </div>

                            <Button
                                variant="primary"
                                fullWidth
                                className="py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-xl bg-error hover:bg-error-dark"
                                onClick={level.isExam ? handleResetPhase : restartLevel}
                            >
                                {level.isExam ? `Replay Phase ${level.phase}` : 'Retry Level'}
                            </Button>
                        </div>
                    )}

                    {isPassed && (
                        <Button variant="primary" fullWidth className="py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-xl" onClick={() => router.push('/')}>
                            Gas Terus!
                        </Button>
                    )}
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white dark:bg-[#0a0a0f] flex flex-col">
            <GameHeader
                progress={progress}
                lives={lives}
                onPause={() => router.push('/')}
            />

            <main className="flex-1 flex flex-col items-center justify-center p-6 max-w-2xl mx-auto w-full">
                <AnimatePresence mode="wait">
                    {phase === 'MEMORIZE' ? (
                        <motion.div
                            key={`mem-${currentIndex}`}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="w-full space-y-12 text-center"
                        >
                            <div className="space-y-4">
                                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-primary">New Word</span>
                                <h2 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter">
                                    <NoTranslate>{words[currentIndex].english}</NoTranslate>
                                </h2>
                                <p className="text-xl md:text-3xl font-bold text-slate-400 dark:text-slate-500 italic">
                                    {words[currentIndex].indonesian}
                                </p>
                            </div>

                            <div className="p-6 md:p-8 bg-slate-50 dark:bg-slate-900/50 rounded-2xl md:rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                                <NoTranslate className="text-slate-600 dark:text-slate-300 font-bold text-lg md:text-xl leading-relaxed">
                                    "{words[currentIndex].exampleSentence}"
                                </NoTranslate>
                            </div>

                            <Button
                                variant="primary"
                                className="px-12 py-5 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                                onClick={() => {
                                    if (currentIndex === words.length - 1) {
                                        setCurrentIndex(0);
                                        setPhase('QUIZ');
                                    } else {
                                        setCurrentIndex(prev => prev + 1);
                                    }
                                }}
                            >
                                {currentIndex === words.length - 1 ? 'Start Quiz' : 'Next Word'}
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            key={`quiz-${currentIndex}`}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full space-y-12"
                        >
                            <div className="text-center space-y-3 md:space-y-4 relative">
                                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] text-purple-500">Pick the meaning</span>
                                <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
                                    <NoTranslate>{words[currentIndex].english}</NoTranslate>
                                </h1>

                                <AnimatePresence>
                                    {shieldActive && (
                                        <motion.div
                                            initial={{ opacity: 0, scale: 0.5 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 1.5 }}
                                            className="absolute inset-0 flex items-center justify-center z-20"
                                        >
                                            <div className="bg-blue-500 text-white px-6 py-2 rounded-full font-black uppercase tracking-widest shadow-xl flex items-center gap-2">
                                                <Icon name="security" size={20} filled />
                                                Shield Activated!
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {options.map((option, idx) => {
                                    const isCorrectOption = option === words[currentIndex].indonesian;
                                    const isSelected = selectedOption === option;
                                    const showHint = showVision && isCorrectOption;

                                    return (
                                        <button
                                            key={idx}
                                            onClick={() => handleAnswer(option)}
                                            disabled={selectedOption !== null}
                                            className={`p-4 md:p-8 rounded-2xl md:rounded-[2rem] text-lg md:text-xl font-black transition-all duration-200 border-2 text-left flex items-center justify-between group relative
                                                ${isSelected ? (isCorrect ? 'bg-success/10 border-success text-success scale-105' : 'bg-error/10 border-error text-error shake') :
                                                    showHint ? 'bg-blue-500/10 border-blue-500 text-blue-500 animate-pulse' :
                                                        'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-primary hover:bg-primary/5 hover:scale-[1.02]'}
                                            `}
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="size-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                                                    {idx + 1}
                                                </div>
                                                {option}
                                            </div>
                                            {isSelected && (isCorrect ? <Icon name="check_circle" filled /> : <Icon name="cancel" filled />)}
                                            {showHint && <Icon name="visibility" size={20} className="animate-bounce" filled />}
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Crystal Action Bar */}
                            <div className="flex items-center justify-center gap-4 mt-8">
                                <CrystalButton
                                    icon="security"
                                    count={inventory.shield}
                                    label="Shield"
                                    active={shieldActive}
                                    onClick={handleUseShield}
                                    disabled={selectedOption !== null || shieldActive}
                                />
                                <CrystalButton
                                    icon="psychology"
                                    count={inventory.hint}
                                    label="Vision"
                                    active={showVision}
                                    onClick={handleUseVision}
                                    disabled={selectedOption !== null || showVision}
                                />
                                <CrystalButton
                                    icon="remove_red_eye"
                                    count={inventory.autocorrect}
                                    label="Divine"
                                    onClick={handleUseDivineEye}
                                    disabled={selectedOption !== null}
                                />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
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
                : 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 group-hover:border-primary/50 group-hover:text-primary'}
            ${count > 0 && !active && !disabled ? 'ring-2 ring-primary/20 ring-offset-2 dark:ring-offset-[#0a0a0f]' : ''}
        `}>
            <Icon name={icon} size={24} filled={active} />
            <div className="absolute -top-2 -right-2 size-5 bg-primary text-white rounded-full text-[10px] font-black flex items-center justify-center shadow-md border-2 border-white dark:border-[#0a0a0f]">
                {count}
            </div>
        </div>
        <span className="text-[8px] font-black uppercase tracking-widest text-slate-500 whitespace-nowrap">{label}</span>
    </button>
);
