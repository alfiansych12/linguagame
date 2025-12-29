'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../ui/UIComponents';
import type { Word } from '@/types';

interface StageSpeedBlitzProps {
    words: Word[];
    onComplete: () => void;
    onScoreUpdate: (points: number) => void;
}

interface Question {
    word: string;
    translation: string;
    isCorrect: boolean;
}

/**
 * Stage E: Speed Blitz
 * Rapid-fire True/False questions within 30 seconds
 */
export const StageSpeedBlitz: React.FC<StageSpeedBlitzProps> = ({
    words,
    onComplete,
    onScoreUpdate
}) => {
    const [timeLeft, setTimeLeft] = useState(30);
    const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
    const [combo, setCombo] = useState(0);

    // Function to generate a new question
    const generateQuestion = useCallback(() => {
        const randomWord = words[Math.floor(Math.random() * words.length)];
        const isCorrect = Math.random() > 0.5;

        let translation = randomWord.indonesian;
        if (!isCorrect) {
            // Pick a different random word's translation
            let wrongWord = words[Math.floor(Math.random() * words.length)];
            while (wrongWord.id === randomWord.id) {
                wrongWord = words[Math.floor(Math.random() * words.length)];
            }
            translation = wrongWord.indonesian;
        }

        setCurrentQuestion({
            word: randomWord.english,
            translation,
            isCorrect
        });
        setFeedback(null);
    }, [words]);

    // Initial question
    useEffect(() => {
        generateQuestion();
    }, [generateQuestion]);

    // Timer logic
    useEffect(() => {
        if (timeLeft <= 0) {
            onComplete();
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [timeLeft, onComplete]);

    const handleAnswer = (userAnswer: boolean) => {
        if (!currentQuestion || feedback) return;

        if (userAnswer === currentQuestion.isCorrect) {
            setFeedback('correct');
            const bonus = 5 + (combo * 2);
            onScoreUpdate(bonus);
            setCombo(prev => prev + 1);
        } else {
            setFeedback('wrong');
            setCombo(0);
        }

        setTimeout(generateQuestion, 500);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-primary/5 dark:bg-background-dark px-4 overflow-hidden relative">
            {/* Background Pulsing UI */}
            <motion.div
                className="absolute inset-0 bg-primary/5 pointer-events-none"
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
            />

            <div className="w-full max-w-xl z-10 text-center space-y-12">
                {/* Timer & Combo */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col items-start">
                        <span className="text-xs font-black text-slate-400 uppercase">Combo</span>
                        <div className="text-4xl font-black text-primary italic">x{combo}</div>
                    </div>

                    <div className="relative size-24">
                        <svg className="size-full" viewBox="0 0 100 100">
                            <circle
                                cx="50" cy="50" r="45"
                                fill="none" stroke="currentColor" strokeWidth="8"
                                className="text-slate-200 dark:text-slate-800"
                            />
                            <motion.circle
                                cx="50" cy="50" r="45"
                                fill="none" stroke="currentColor" strokeWidth="8"
                                strokeDasharray="283"
                                animate={{ strokeDashoffset: 283 - (283 * timeLeft / 30) }}
                                className={timeLeft <= 5 ? 'text-error' : 'text-primary'}
                                transform="rotate(-90 50 50)"
                            />
                        </svg>
                        <div className={`absolute inset-0 flex items-center justify-center text-3xl font-black ${timeLeft <= 5 ? 'text-error animate-pulse' : 'text-slate-900 dark:text-white'}`}>
                            {timeLeft}
                        </div>
                    </div>
                </div>

                {/* Question Card */}
                <AnimatePresence mode="wait">
                    {currentQuestion && (
                        <motion.div
                            key={currentQuestion.word}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 1.2, opacity: 0 }}
                            className={`bg-white dark:bg-surface-dark p-12 rounded-[3rem] shadow-2xl border-b-8 transition-colors ${feedback === 'correct' ? 'border-green-500' : feedback === 'wrong' ? 'border-red-500' : 'border-slate-100 dark:border-slate-800'
                                }`}
                        >
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white mb-2">
                                        {currentQuestion.word}
                                    </h3>
                                    <div className="text-slate-400 font-bold uppercase tracking-widest text-xs">is</div>
                                    <h3 className="text-4xl md:text-5xl font-black text-primary mt-2">
                                        {currentQuestion.translation}
                                    </h3>
                                </div>
                                <div className="text-slate-400 font-bold">Is this correct?</div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-6 pt-8">
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAnswer(false)}
                        className="h-24 bg-error text-white rounded-3xl shadow-lg shadow-error/30 flex items-center justify-center gap-3 text-2xl font-black hover:brightness-110 active:scale-95 transition-all"
                    >
                        <Icon name="close" size={32} />
                        FALSE
                    </motion.button>

                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleAnswer(true)}
                        className="h-24 bg-success text-white rounded-3xl shadow-lg shadow-success/30 flex items-center justify-center gap-3 text-2xl font-black hover:brightness-110 active:scale-95 transition-all"
                    >
                        <Icon name="check" size={32} />
                        TRUE
                    </motion.button>
                </div>
            </div>

            {/* Visual Feedback Overlays */}
            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={`fixed inset-0 pointer-events-none z-50 flex items-center justify-center ${feedback === 'correct' ? 'bg-green-500/10' : 'bg-red-500/10'
                            }`}
                    >
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 2, opacity: 0 }}
                        >
                            <Icon
                                name={feedback === 'correct' ? 'check_circle' : 'cancel'}
                                className={feedback === 'correct' ? 'text-success' : 'text-error'}
                                size={150}
                                filled
                            />
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
