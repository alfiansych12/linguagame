'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, Button } from '../ui/UIComponents';
import { useGameStore } from '@/store/game-store';
import type { Word } from '@/types';
import { highlightVocabInSentence } from '@/lib/utils/vocab-highlight';

interface StageMemorizeProps {
    words: Word[];
    onComplete: () => void;
}

/**
 * Stage A: Memorize (Flashcard Learning)
 * User views word cards with countdown timer
 * Can skip early with "I'm Ready" button
 */
export const StageMemorize: React.FC<StageMemorizeProps> = ({ words, onComplete }) => {
    const [timer, setTimer] = useState(60); // 60 seconds default
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // Countdown timer
    useEffect(() => {
        if (isPaused || timer <= 0) return;

        const interval = setInterval(() => {
            setTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    // Auto-advance when timer hits 0
                    setTimeout(onComplete, 500);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isPaused, timer, onComplete]);

    const handleNext = () => {
        if (currentIndex < words.length - 1) {
            setCurrentIndex(currentIndex + 1);
        } else {
            setCurrentIndex(0); // Loop back
        }
    };

    const handlePrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        } else {
            setCurrentIndex(words.length - 1); // Loop to end
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const progress = ((60 - timer) / 60) * 100;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark px-4 py-8">
            {/* Header */}
            <div className="w-full max-w-3xl mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
                        Hafal Kata-Kata Ini
                    </h2>

                    {/* Timer */}
                    <div className="flex items-center gap-3">
                        <div className={`text-3xl font-black ${timer <= 10 ? 'text-error animate-pulse' : 'text-primary'}`}>
                            {formatTime(timer)}
                        </div>
                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className="text-slate-400 hover:text-primary transition-colors"
                        >
                            <Icon name={isPaused ? 'play_circle' : 'pause_circle'} size={32} />
                        </button>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.3 }}
                    />
                </div>

                <p className="text-slate-500 dark:text-slate-400 mt-3 text-center">
                    Belajar {words.length} kata • {currentIndex + 1} dari {words.length}
                </p>
            </div>

            {/* Flashcard */}
            <div className="w-full max-w-2xl mb-8">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, rotateY: -90 }}
                        animate={{ opacity: 1, rotateY: 0 }}
                        exit={{ opacity: 0, rotateY: 90 }}
                        transition={{ duration: 0.3 }}
                        className="relative"
                    >
                        <div className="bg-white dark:bg-surface-dark rounded-3xl shadow-soft-xl border-2 border-primary/20 p-8 md:p-12 min-h-[400px] flex flex-col items-center justify-center">
                            {/* Word Card Content */}
                            <div className="text-center space-y-6">
                                {/* English Word */}
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-primary mb-2 block">
                                        Bahasa Inggris
                                    </span>
                                    <h3 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white mb-4">
                                        {words[currentIndex].english}
                                    </h3>
                                </div>

                                {/* Divider */}
                                <div className="w-24 h-1 bg-gradient-to-r from-primary to-primary-light rounded-full mx-auto"></div>

                                {/* Indonesian Translation */}
                                <div>
                                    <span className="text-xs font-bold uppercase tracking-wider text-success mb-2 block">
                                        Bahasa Indonesia
                                    </span>
                                    <h4 className="text-4xl md:text-5xl font-bold text-success">
                                        {words[currentIndex].indonesian}
                                    </h4>
                                </div>

                                {/* Example Sentence */}
                                {words[currentIndex].exampleSentence && (
                                    <div className="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                                        <p
                                            className="text-slate-600 dark:text-slate-300 italic text-lg"
                                            dangerouslySetInnerHTML={{
                                                __html: `"${highlightVocabInSentence(words[currentIndex].exampleSentence, words[currentIndex].english)}"`
                                            }}
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Card Navigation Dots */}
                            <div className="flex items-center gap-2 mt-8">
                                {words.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentIndex(index)}
                                        className={`rounded-full transition-all ${index === currentIndex
                                            ? 'w-8 h-3 bg-primary'
                                            : 'w-3 h-3 bg-slate-300 dark:bg-slate-600 hover:bg-primary/50'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation Controls */}
            <div className="w-full max-w-2xl flex items-center justify-between gap-4">
                <Button
                    variant="secondary"
                    size="lg"
                    onClick={handlePrevious}
                    icon="arrow_back"
                    iconPosition="left"
                    className="flex-1 md:flex-none"
                >
                    Sebelumnya
                </Button>

                <div className="flex gap-3">
                    <button
                        onClick={handleNext}
                        className="size-14 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center transition-colors"
                    >
                        <Icon name="arrow_forward" size={24} />
                    </button>
                </div>

                <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSkip}
                    icon="check_circle"
                    iconPosition="right"
                    className="flex-1 md:flex-none animate-bounce-gentle"
                >
                    Saya Siap!
                </Button>
            </div>

            {/* Hint Text */}
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-6 text-center max-w-md">
                💡 Tips: Coba ingat kata dalam Bahasa Inggris dan artinya dalam Bahasa Indonesia.
                Kamu akan diuji di tahap berikutnya!
            </p>
        </div>
    );
};
