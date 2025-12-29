'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, Button } from '../ui/UIComponents';
import type { Word } from '@/types';

interface StageTypingProps {
    words: Word[];
    onComplete: () => void;
    onScoreUpdate: (points: number) => void;
}

/**
 * Stage D: Typing Recall
 * User sees Indonesian word and must type the English translation
 */
export const StageTyping: React.FC<StageTypingProps> = ({
    words,
    onComplete,
    onScoreUpdate
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [inputValue, setInputValue] = useState('');
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [shake, setShake] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const currentWord = words[currentIndex];

    useEffect(() => {
        inputRef.current?.focus();
    }, [currentIndex]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputValue.trim() || status !== 'idle') return;

        const isCorrect = inputValue.trim().toLowerCase() === currentWord.english.toLowerCase();

        if (isCorrect) {
            setStatus('success');
            onScoreUpdate(20); // Higher reward for typing

            setTimeout(() => {
                if (currentIndex < words.length - 1) {
                    setCurrentIndex(currentIndex + 1);
                    setInputValue('');
                    setStatus('idle');
                } else {
                    onComplete();
                }
            }, 1200);
        } else {
            setStatus('error');
            setShake(true);
            setTimeout(() => setShake(false), 500);

            // Allow retry after a short delay
            setTimeout(() => {
                setStatus('idle');
                setInputValue('');
                inputRef.current?.focus();
            }, 1000);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark px-4 py-8">
            <div className="w-full max-w-2xl">
                {/* Progress Bar */}
                <div className="flex items-center gap-4 mb-12">
                    <div className="flex-1 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-primary"
                            animate={{ width: `${((currentIndex) / words.length) * 100}%` }}
                        />
                    </div>
                    <span className="text-sm font-bold text-slate-400">
                        {currentIndex + 1} / {words.length}
                    </span>
                </div>

                <div className="text-center space-y-8">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">
                            Type the translation
                        </span>
                        <h2 className="text-5xl md:text-6xl font-black text-slate-900 dark:text-white">
                            {currentWord.indonesian}
                        </h2>
                    </motion.div>

                    {/* Typing Area */}
                    <form onSubmit={handleSubmit} className="relative max-w-md mx-auto mt-12">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            placeholder="Type in English..."
                            disabled={status !== 'idle'}
                            className={`w-full bg-white dark:bg-surface-dark border-b-4 p-6 text-2xl md:text-3xl font-bold text-center outline-none transition-all rounded-2xl shadow-sm ${status === 'success'
                                    ? 'border-green-500 text-green-600 bg-green-50'
                                    : status === 'error'
                                        ? 'border-red-500 text-red-600 bg-red-50'
                                        : 'border-slate-200 dark:border-slate-800 focus:border-primary focus:shadow-lg'
                                } ${shake ? 'animate-shake' : ''}`}
                        />

                        <AnimatePresence>
                            {status === 'success' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute -right-12 top-1/2 -translate-y-1/2 text-green-500"
                                >
                                    <Icon name="check_circle" size={40} filled />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </form>

                    <div className="pt-8">
                        <Button
                            variant="primary"
                            size="lg"
                            onClick={handleSubmit}
                            disabled={!inputValue.trim() || status !== 'idle'}
                            className="px-12 rounded-2xl py-6 text-xl shadow-xl shadow-primary/20"
                        >
                            Check Answer
                        </Button>
                    </div>

                    <p className="text-slate-400 dark:text-slate-500 text-sm italic">
                        Press Enter to check
                    </p>
                </div>
            </div>
        </div>
    );
};
