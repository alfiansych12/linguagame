'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, Button } from '../ui/UIComponents';
import type { Word } from '@/types';

interface StageJumbledProps {
    words: Word[];
    onComplete: () => void;
    onScoreUpdate: (points: number) => void;
}

/**
 * Stage B: Jumbled Word (Letter Scramble)
 * User sees Indonesian word, must arrange English letters in correct order
 * Shake animation on wrong answer, green highlight on correct
 */
export const StageJumbled: React.FC<StageJumbledProps> = ({
    words,
    onComplete,
    onScoreUpdate
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedLetters, setSelectedLetters] = useState<number[]>([]);
    const [scrambledLetters, setScrambledLetters] = useState<string[]>([]);
    const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
    const [shake, setShake] = useState(false);
    const [score, setScore] = useState(0);

    const currentWord = words[currentIndex];

    // Scramble letters on word change
    useEffect(() => {
        const letters = currentWord.english.split('');
        const scrambled = [...letters].sort(() => Math.random() - 0.5);
        setScrambledLetters(scrambled);
        setSelectedLetters([]);
        setIsCorrect(null);
        setShake(false);
    }, [currentIndex, currentWord.english]);

    const handleLetterClick = (index: number) => {
        if (isCorrect !== null || selectedLetters.includes(index)) return;

        const newSelected = [...selectedLetters, index];
        setSelectedLetters(newSelected);

        // Check if complete
        if (newSelected.length === scrambledLetters.length) {
            checkAnswer(newSelected);
        }
    };

    const checkAnswer = (selected: number[]) => {
        const userAnswer = selected.map(i => scrambledLetters[i]).join('');
        const correct = userAnswer.toLowerCase() === currentWord.english.toLowerCase();

        if (correct) {
            setIsCorrect(true);
            const points = 10;
            setScore(score + points);
            onScoreUpdate(points);

            // Auto-advance after success
            setTimeout(() => {
                if (currentIndex < words.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                } else {
                    onComplete();
                }
            }, 1500);
        } else {
            setIsCorrect(false);
            setShake(true);
            setTimeout(() => setShake(false), 500);

            // Reset after 1 second
            setTimeout(() => {
                setSelectedLetters([]);
                setIsCorrect(null);
            }, 1000);
        }
    };

    const handleReset = () => {
        setSelectedLetters([]);
        setIsCorrect(null);
        setShake(false);
    };

    const progress = ((currentIndex + 1) / words.length) * 100;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark px-4 py-8">
            {/* Header */}
            <div className="w-full max-w-3xl mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
                        Arrange the Letters
                    </h2>

                    {/* Score Badge */}
                    <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
                        <Icon name="star" className="text-primary" filled size={20} />
                        <span className="text-lg font-bold text-primary">{score} pts</span>
                    </div>
                </div>

                {/* Progress */}
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                <p className="text-slate-500 dark:text-slate-400 mt-3 text-center">
                    Word {currentIndex + 1} of {words.length}
                </p>
            </div>

            {/* Question Card */}
            <div className="w-full max-w-2xl mb-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {/* Indonesian Prompt */}
                        <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-card p-8 mb-6 text-center">
                            <span className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3 block">
                                Translate to English
                            </span>
                            <h3 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">
                                {currentWord.indonesian}
                            </h3>
                        </div>

                        {/* Answer Area */}
                        <div
                            className={`bg-white dark:bg-surface-dark rounded-3xl shadow-card p-8 mb-6 min-h-[120px] flex items-center justify-center ${shake ? 'animate-shake' : ''
                                }`}
                        >
                            <div className="flex flex-wrap items-center justify-center gap-3">
                                {selectedLetters.length === 0 ? (
                                    <span className="text-slate-400 text-xl">Tap letters below...</span>
                                ) : (
                                    selectedLetters.map((letterIndex, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className={`w-14 h-14 md:w-16 md:h-16 rounded-xl flex items-center justify-center text-2xl md:text-3xl font-black shadow-md ${isCorrect === true
                                                    ? 'bg-success text-white'
                                                    : isCorrect === false
                                                        ? 'bg-error text-white'
                                                        : 'bg-primary/10 text-primary border-2 border-primary/30'
                                                }`}
                                        >
                                            {scrambledLetters[letterIndex]}
                                        </motion.div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Letter Options */}
                        <div className="flex flex-wrap items-center justify-center gap-3">
                            {scrambledLetters.map((letter, index) => (
                                <motion.button
                                    key={index}
                                    onClick={() => handleLetterClick(index)}
                                    disabled={selectedLetters.includes(index) || isCorrect !== null}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`w-14 h-14 md:w-16 md:h-16 rounded-xl text-2xl md:text-3xl font-black transition-all ${selectedLetters.includes(index)
                                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-30'
                                            : 'bg-white dark:bg-surface-dark text-slate-700 dark:text-slate-200 shadow-card hover:shadow-floating hover:-translate-y-1 border-2 border-transparent hover:border-primary/30'
                                        }`}
                                >
                                    {letter}
                                </motion.button>
                            ))}
                        </div>

                        {/* Reset Button */}
                        {selectedLetters.length > 0 && isCorrect === null && (
                            <div className="flex justify-center mt-6">
                                <button
                                    onClick={handleReset}
                                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-600 dark:text-slate-300 font-semibold"
                                >
                                    <Icon name="refresh" size={20} />
                                    Reset
                                </button>
                            </div>
                        )}

                        {/* Feedback */}
                        {isCorrect === true && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center justify-center gap-2 mt-6 text-success font-bold text-xl"
                            >
                                <Icon name="check_circle" filled size={28} />
                                <span>Correct! +10 pts</span>
                            </motion.div>
                        )}

                        {isCorrect === false && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="flex items-center justify-center gap-2 mt-6 text-error font-bold text-xl"
                            >
                                <Icon name="cancel" filled size={28} />
                                <span>Try again!</span>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Hint */}
            <p className="text-slate-400 dark:text-slate-500 text-sm text-center max-w-md">
                💡 Tip: Pay attention to the order of letters!
            </p>
        </div>
    );
};
