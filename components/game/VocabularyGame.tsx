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
import { calculateXp, calculateStars } from '@/lib/game-logic/xp-calculator';
import { CURRICULUM_LEVELS } from '@/lib/data/mockLevels';

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

    const { addGems, addXp } = useUserStore();
    const { completeLevel, unlockLevel, getLevelProgress } = useProgressStore();

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
        }
    }, [phase, currentIndex, words]);

    const handleAnswer = (answer: string) => {
        if (selectedOption !== null) return;

        setSelectedOption(answer);
        const correct = answer === words[currentIndex].indonesian;
        setIsCorrect(correct);

        if (correct) {
            if (currentIndex === words.length - 1) {
                handleLevelComplete();
            } else {
                setTimeout(() => setCurrentIndex(prev => prev + 1), 1000);
            }
        } else {
            setMistakes(prev => prev + 1);
            const nextLives = Math.max(0, lives - 1);
            setLives(nextLives);

            if (nextLives === 0) {
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

    const handleLevelComplete = () => {
        const timeTaken = (Date.now() - startTime) / 1000;
        const maxTime = words.length * 10;

        const xpResults = calculateXp({
            mistakes,
            totalTasks: words.length,
            timeRemaining: Math.max(0, maxTime - timeTaken),
            maxTime,
            maxStreak: 0,
            crystalActive: false
        });

        const winStars = calculateStars((words.length - mistakes) / words.length);

        setXpBreakdown(xpResults.breakdown);
        setScore(xpResults.total);

        setTimeout(() => {
            confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
            addGems(25 + (winStars * 10));
            addXp(xpResults.total);

            completeLevel(level.id, xpResults.total, winStars);

            const currentIndexInCurriculum = CURRICULUM_LEVELS.findIndex(l => l.id === level.id);
            if (currentIndexInCurriculum !== -1 && currentIndexInCurriculum < CURRICULUM_LEVELS.length - 1) {
                unlockLevel(CURRICULUM_LEVELS[currentIndexInCurriculum + 1].id);
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
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">{level.title}</h1>
                        <p className="text-slate-500 font-bold text-lg">{level.description}</p>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-200/50 text-left">
                        <h4 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Mission Goals</h4>
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

                    <Button variant="primary" fullWidth className="py-6 rounded-[1.5rem] text-lg font-black uppercase tracking-widest shadow-xl"
                        onClick={() => {
                            setPhase('MEMORIZE');
                            setStartTime(Date.now());
                        }}>
                        Start Learning
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
                    <div className="size-32 bg-error/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                        <Icon name="heart_broken" size={60} className="text-error" filled />
                    </div>
                    <div>
                        <h2 className="text-5xl font-black text-slate-900 dark:text-white mb-2 tracking-tighter italic uppercase">Yah, Energy Habis!</h2>
                        <p className="text-slate-500 font-bold text-lg">Literally harus mulai lagi dari awal nih biar makin gacor.</p>
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

    if (phase === 'RESULTS') {
        const levelData = getLevelProgress(level.id);

        return (
            <div className="min-h-screen bg-white dark:bg-[#0a0a0f] flex flex-col items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full text-center space-y-12"
                >
                    <div className="size-48 bg-gradient-to-br from-primary to-primary-dark rounded-[4rem] flex flex-col items-center justify-center mx-auto shadow-2xl border-8 border-white/10 relative">
                        <span className="text-xs font-black text-white/60 uppercase tracking-widest mt-2">XP Earned</span>
                        <span className="text-6xl font-black text-white tracking-tighter">{score}</span>
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">Level Mastered! ✨</h2>
                        <p className="text-slate-500 dark:text-slate-400 font-bold text-lg underline decoration-primary decoration-4 underline-offset-4">Gokil! Kamu baru aja belajar {words.length} kata baru.</p>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-200/50">
                            <Icon name="star" className="text-yellow-400 mb-2" size={32} filled />
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{levelData?.stars || 0}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Stars</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-200/50">
                            <Icon name="diamond" className="text-blue-500 mb-2" size={32} filled />
                            <p className="text-2xl font-black text-slate-900 dark:text-white">+{25 + (levelData?.stars || 0) * 10}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Gems</p>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-200/50">
                            <Icon name="timer" className="text-purple-500 mb-2" size={32} filled />
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{xpBreakdown?.speed > 15 ? 'Fast' : 'Mid'}</p>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Speed</p>
                        </div>
                    </div>

                    <Button variant="primary" fullWidth className="py-6 rounded-[2rem] font-black uppercase tracking-widest shadow-xl" onClick={() => router.push('/')}>
                        Gas Terus!
                    </Button>
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
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">New Word</span>
                                <h2 className="text-7xl font-black text-slate-900 dark:text-white tracking-tighter">
                                    <NoTranslate>{words[currentIndex].english}</NoTranslate>
                                </h2>
                                <p className="text-3xl font-bold text-slate-400 dark:text-slate-500 italic">
                                    {words[currentIndex].indonesian}
                                </p>
                            </div>

                            <div className="p-8 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                                <NoTranslate className="text-slate-600 dark:text-slate-300 font-bold text-xl leading-relaxed">
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
                            <div className="text-center space-y-4">
                                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-purple-500">Pick the meaning</span>
                                <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter">
                                    <NoTranslate>{words[currentIndex].english}</NoTranslate>
                                </h1>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {options.map((option, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => handleAnswer(option)}
                                        disabled={selectedOption !== null}
                                        className={`p-6 rounded-[2rem] text-xl font-black transition-all duration-300 border-2 text-left flex items-center justify-between group
                                            ${selectedOption === option
                                                ? isCorrect
                                                    ? 'bg-success/10 border-success text-success'
                                                    : 'bg-error/10 border-error text-error'
                                                : selectedOption !== null && option === words[currentIndex].indonesian
                                                    ? 'bg-success/5 border-success/30 text-success/60'
                                                    : 'bg-slate-50 dark:bg-slate-900/40 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-primary/30 hover:bg-slate-100/50'
                                            }`}
                                    >
                                        <span>{option}</span>
                                        {selectedOption === option && (
                                            <Icon
                                                name={isCorrect ? 'check_circle' : 'cancel'}
                                                className={isCorrect ? 'text-success' : 'text-error'}
                                                filled
                                            />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
};
