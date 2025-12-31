'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameHeader } from '../layout/Navigation';
import { StageMemorize } from './StageMemorize';
import { StageJumbled } from './StageJumbled';
import { StageConnect } from './StageConnect';
import { StageTyping } from './StageTyping';
import { StageSpeedBlitz } from './StageSpeedBlitz';
import { Button, Icon, Card } from '../ui/UIComponents';
import { supabase } from '@/lib/db/supabase';
import { useUserStore } from '@/store/user-store';
import type { Word, GameStage } from '@/types';
import confetti from 'canvas-confetti';

interface GameContainerProps {
    levelId: string;
    levelTitle: string;
    words: Word[];
}

export const GameContainer: React.FC<GameContainerProps> = ({
    levelId,
    levelTitle,
    words
}) => {
    const { userId, addXp } = useUserStore();
    const [stage, setStage] = useState<GameStage>('MEMORIZE');
    const [score, setScore] = useState(0);
    const [lives, setLives] = useState(3);
    const [xpEarned, setXpEarned] = useState(0);
    const [isCompleted, setIsCompleted] = useState(false);

    // Trigger confetti when game is complete
    React.useEffect(() => {
        if (isCompleted) {
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                // since particles fall down, start a bit higher than random
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);
        }
    }, [isCompleted]);

    // Stages definition
    const STAGES: GameStage[] = ['MEMORIZE', 'JUMBLED', 'CONNECT', 'TYPING', 'SPEED_BLITZ'];
    const currentStageIndex = STAGES.indexOf(stage);
    const progress = ((currentStageIndex + 1) / STAGES.length) * 100;

    const handleStageComplete = () => {
        const nextIndex = currentStageIndex + 1;
        if (nextIndex < STAGES.length) {
            setStage(STAGES[nextIndex]);
        } else {
            handleGameComplete();
        }
    };

    const handleGameComplete = async () => {
        setIsCompleted(true);
        const finalXp = Math.round(score / 2);
        setXpEarned(finalXp);

        // Save to Supabase (Dynamic User ID)
        if (!userId || userId === 'guest') {
            console.log('Skipping sync: No authenticated user.');
            return;
        }

        try {
            // 1. Update/Upsert Level Progress
            const { error: progressError } = await supabase
                .from('user_progress')
                .upsert({
                    user_id: userId,
                    level_id: levelId,
                    status: 'COMPLETED',
                    high_score: score,
                    stars: score > 80 ? 3 : score > 50 ? 2 : 1,
                    updated_at: new Date().toISOString()
                });

            if (progressError) throw progressError;

            // 2. Update Total XP via store
            await addXp(finalXp);

            console.log('✅ Progress saved successfully!');
        } catch (err) {
            console.error('❌ Error saving progress:', err);
        }
    };

    const addScore = (points: number) => {
        setScore(prev => prev + points);
    };

    if (isCompleted) {
        return (
            <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-full max-w-md text-center"
                >
                    <Card className="p-12 space-y-8 shadow-soft-xl border-t-8 border-primary">
                        <div className="space-y-4">
                            <div className="size-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Icon name="emoji_events" className="text-primary" size={48} filled />
                            </div>
                            <h2 className="text-4xl font-black text-slate-900 dark:text-white">
                                Amazing Job!
                            </h2>
                            <p className="text-slate-500">
                                You've completed {levelTitle}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl">
                                <div className="text-xs font-bold text-slate-400 uppercase">Score</div>
                                <div className="text-2xl font-black text-slate-900 dark:text-white">{score}</div>
                            </div>
                            <div className="bg-primary/5 p-4 rounded-2xl">
                                <div className="text-xs font-bold text-primary uppercase">XP Earned</div>
                                <div className="text-2xl font-black text-primary">+{xpEarned}</div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            <Button
                                variant="primary"
                                size="lg"
                                href="/"
                                className="w-full rounded-2xl py-6 font-bold shadow-lg shadow-primary/20"
                            >
                                Continue Adventure
                            </Button>
                            <Button
                                variant="ghost"
                                size="lg"
                                onClick={() => window.location.reload()}
                            >
                                Play Again
                            </Button>
                        </div>
                    </Card>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
            <GameHeader
                progress={progress}
                lives={lives}
                onPause={() => console.log('Paused')}
            />

            <main className="flex-1 flex flex-col">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={stage}
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="flex-1"
                    >
                        {stage === 'MEMORIZE' && (
                            <StageMemorize words={words} onComplete={handleStageComplete} />
                        )}
                        {stage === 'JUMBLED' && (
                            <StageJumbled
                                words={words}
                                onComplete={handleStageComplete}
                                onScoreUpdate={addScore}
                            />
                        )}
                        {stage === 'CONNECT' && (
                            <StageConnect
                                words={words}
                                onComplete={handleStageComplete}
                                onScoreUpdate={addScore}
                            />
                        )}
                        {stage === 'TYPING' && (
                            <StageTyping
                                words={words}
                                onComplete={handleStageComplete}
                                onScoreUpdate={addScore}
                            />
                        )}
                        {stage === 'SPEED_BLITZ' && (
                            <StageSpeedBlitz
                                words={words}
                                onComplete={handleStageComplete}
                                onScoreUpdate={addScore}
                            />
                        )}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};
