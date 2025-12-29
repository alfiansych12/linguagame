'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../ui/UIComponents';
import type { Word } from '@/types';

interface StageConnectProps {
    words: Word[];
    onComplete: () => void;
    onScoreUpdate: (points: number) => void;
}

interface MatchItem {
    id: string;
    text: string;
    type: 'english' | 'indonesian';
    wordId: string;
}

/**
 * Stage C: Connecting Lines (Match Pairs)
 * User matches English words with their Indonesian translations
 */
export const StageConnect: React.FC<StageConnectProps> = ({
    words,
    onComplete,
    onScoreUpdate
}) => {
    const [items, setItems] = useState<{ left: MatchItem[], right: MatchItem[] }>({ left: [], right: [] });
    const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
    const [selectedRight, setSelectedRight] = useState<string | null>(null);
    const [matchedIds, setMatchedIds] = useState<string[]>([]);
    const [wrongMatch, setWrongMatch] = useState<[string, string] | null>(null);

    // Initialize and shuffle items
    useEffect(() => {
        const leftItems: MatchItem[] = words.map(w => ({
            id: `left-${w.id}`,
            text: w.english,
            type: 'english' as const,
            wordId: w.id || ''
        })).sort(() => Math.random() - 0.5);

        const rightItems: MatchItem[] = words.map(w => ({
            id: `right-${w.id}`,
            text: w.indonesian,
            type: 'indonesian' as const,
            wordId: w.id || ''
        })).sort(() => Math.random() - 0.5);

        setItems({ left: leftItems, right: rightItems });
    }, [words]);

    // Logic to handle matching
    useEffect(() => {
        if (selectedLeft && selectedRight) {
            const leftItem = items.left.find(i => i.id === selectedLeft);
            const rightItem = items.right.find(i => i.id === selectedRight);

            if (leftItem && rightItem && leftItem.wordId === rightItem.wordId) {
                // Correct Match
                setMatchedIds(prev => [...prev, leftItem.wordId]);
                onScoreUpdate(15); // Bonus points for connection
                setSelectedLeft(null);
                setSelectedRight(null);

                // Check if all matched
                if (matchedIds.length + 1 === words.length) {
                    setTimeout(onComplete, 1000);
                }
            } else {
                // Wrong Match
                setWrongMatch([selectedLeft, selectedRight]);
                setTimeout(() => {
                    setWrongMatch(null);
                    setSelectedLeft(null);
                    setSelectedRight(null);
                }, 800);
            }
        }
    }, [selectedLeft, selectedRight, items, matchedIds.length, words.length, onComplete, onScoreUpdate]);

    const isMatched = (wordId: string) => matchedIds.includes(wordId);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background-light dark:bg-background-dark px-4 py-8">
            {/* Header */}
            <div className="w-full max-w-3xl mb-12 text-center">
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                    Match the Pairs
                </h2>
                <p className="text-slate-500 dark:text-slate-400">
                    Connect the English words with their correct translations
                </p>
            </div>

            <div className="grid grid-cols-2 gap-8 md:gap-16 w-full max-w-4xl relative">
                {/* Left Column (English) */}
                <div className="flex flex-col gap-4">
                    <span className="text-xs font-black uppercase tracking-widest text-primary text-center mb-2 block">
                        English
                    </span>
                    {items.left.map((item) => {
                        const matched = isMatched(item.wordId);
                        const selected = selectedLeft === item.id;
                        const wrong = wrongMatch?.[0] === item.id;

                        return (
                            <motion.button
                                key={item.id}
                                disabled={matched}
                                onClick={() => !matched && setSelectedLeft(item.id)}
                                whileHover={!matched ? { scale: 1.02, x: 5 } : {}}
                                whileTap={!matched ? { scale: 0.98 } : {}}
                                className={`relative p-5 rounded-2xl text-lg font-bold transition-all border-2 h-20 flex items-center justify-between ${matched
                                    ? 'bg-green-50 border-green-200 text-green-600 opacity-60'
                                    : selected
                                        ? 'bg-primary/10 border-primary text-primary shadow-glow'
                                        : wrong
                                            ? 'bg-red-50 border-red-300 text-red-600 animate-shake'
                                            : 'bg-white dark:bg-surface-dark border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm hover:shadow-md'
                                    }`}
                            >
                                <span>{item.text}</span>
                                {matched && <Icon name="check_circle" size={20} />}
                                {selected && !matched && <div className="size-3 bg-primary rounded-full animate-pulse"></div>}
                            </motion.button>
                        );
                    })}
                </div>

                {/* Right Column (Indonesian) */}
                <div className="flex flex-col gap-4">
                    <span className="text-xs font-black uppercase tracking-widest text-success text-center mb-2 block">
                        Indonesian
                    </span>
                    {items.right.map((item) => {
                        const matched = isMatched(item.wordId);
                        const selected = selectedRight === item.id;
                        const wrong = wrongMatch?.[1] === item.id;

                        return (
                            <motion.button
                                key={item.id}
                                disabled={matched}
                                onClick={() => !matched && setSelectedRight(item.id)}
                                whileHover={!matched ? { scale: 1.02, x: -5 } : {}}
                                whileTap={!matched ? { scale: 0.98 } : {}}
                                className={`relative p-5 rounded-2xl text-lg font-bold transition-all border-2 h-20 flex items-center justify-between ${matched
                                    ? 'bg-green-50 border-green-200 text-green-600 opacity-60'
                                    : selected
                                        ? 'bg-success/10 border-success text-success shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                                        : wrong
                                            ? 'bg-red-50 border-red-300 text-red-600 animate-shake'
                                            : 'bg-white dark:bg-surface-dark border-slate-100 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm hover:shadow-md'
                                    }`}
                            >
                                {selected && !matched && <div className="size-3 bg-success rounded-full animate-pulse"></div>}
                                <span className="ml-auto">{item.text}</span>
                                {matched && <Icon name="check_circle" className="ml-2" size={20} />}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* Progress Footer */}
            <div className="mt-16 w-full max-w-sm">
                <div className="flex justify-between text-sm font-bold text-slate-500 mb-2">
                    <span>Progress</span>
                    <span>{matchedIds.length} / {words.length} pairs</span>
                </div>
                <div className="w-full h-3 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${(matchedIds.length / words.length) * 100}%` }}
                    />
                </div>
            </div>
        </div>
    );
};
