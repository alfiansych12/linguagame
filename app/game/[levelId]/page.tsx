'use client';

import { VocabularyGame } from '@/components/game/VocabularyGame';
import { GrammarGame } from '@/components/game/GrammarGame';
import { SpeedBlitzGame } from '@/components/game/SpeedBlitzGame';
import { ALL_LEVELS } from '@/lib/data/mockLevels';
import { VOCABULARY_DATA } from '@/lib/data/vocabulary';
import { GRAMMAR_DATA } from '@/lib/data/grammar';
import { BLITZ_DATA } from '@/lib/data/blitz';
import { useRouter } from 'next/navigation';
import { useProgressStore } from '@/store/progress-store';
import { use, useEffect, useState } from 'react';
import { Icon, Button } from '@/components/ui/UIComponents';
import { motion } from 'framer-motion';
import { useSound } from '@/hooks/use-sound';

export default function GamePage({ params }: { params: Promise<{ levelId: string }> }) {
    const { levelId } = use(params);
    const { isLevelUnlocked } = useProgressStore();
    const router = useRouter();
    const [isCheating, setIsCheating] = useState(false);

    const { playSound } = useSound();

    // 1. Find the level
    const level = ALL_LEVELS.find(l => l.id === levelId);

    useEffect(() => {
        if (!level || !isLevelUnlocked(levelId)) {
            setIsCheating(true);
            playSound('GAMEOVER'); // Play alert sound for cheaters
        }
    }, [level, levelId, isLevelUnlocked, playSound]);

    if (isCheating) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center overflow-hidden">
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{
                        scale: [1, 1.05, 1],
                        rotate: [-1, 1, -1, 1, 0],
                        opacity: 1
                    }}
                    transition={{
                        duration: 0.2,
                        rotate: { repeat: Infinity, duration: 0.1 }
                    }}
                    className="max-w-[340px] w-full space-y-6 bg-black border-4 border-red-600 p-8 rounded-[2.5rem] shadow-[0_0_60px_rgba(239,68,68,0.3)] relative"
                >
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-2 rounded-xl font-black text-lg rotate-3 shadow-xl whitespace-nowrap uppercase tracking-tighter">
                        Cepu Alert! 🚨
                    </div>

                    <div className="size-24 bg-red-600 rounded-full flex items-center justify-center mx-auto animate-bounce shadow-lg shadow-red-600/20">
                        <Icon name="gavel" size={48} className="text-white" filled />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-3xl font-black text-white tracking-tighter italic uppercase leading-none">JANGAN CURANG!</h2>
                        <p className="text-red-500 font-bold text-sm leading-relaxed">
                            Selesaiin misi lo dari awal bro! <br />
                            Gak sopan main loncat-loncat. 💅
                        </p>
                    </div>

                    <Button
                        variant="primary"
                        fullWidth
                        className="py-4 rounded-xl font-black uppercase tracking-widest bg-white text-black hover:bg-slate-200 border-none shadow-xl text-sm"
                        onClick={() => router.push('/')}
                    >
                        Ampun Bang 🙏
                    </Button>

                    <p className="text-[9px] text-slate-700 font-black uppercase tracking-[0.2em] animate-pulse">
                        Admin is watching you...
                    </p>
                </motion.div>
            </div>
        );
    }

    if (!level) return null;

    // 2. Decide game type based on ID prefix
    if (levelId.startsWith('vocab-')) {
        let words = [];

        if (level.isExam) {
            const phaseLevels = ALL_LEVELS.filter(l => l.phase === level.phase && !l.isExam).map(l => l.id);
            const allPhaseWords = VOCABULARY_DATA.filter(w => phaseLevels.includes(w.levelId));
            words = allPhaseWords.sort(() => Math.random() - 0.5).slice(0, 20);
        } else {
            words = VOCABULARY_DATA.filter(w => w.levelId === levelId);
        }

        if (words.length === 0) {
            return (
                <div className="min-h-screen flex items-center justify-center p-8 text-center bg-slate-50 dark:bg-[#0a0a0f]">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">{level.isExam ? 'Exam' : 'Vocabulary'} Coming Soon</h2>
                        <p className="text-slate-500">We are adding 100+ words to {level.title}.</p>
                        <Button variant="primary" onClick={() => router.push('/')}>Go Back</Button>
                    </div>
                </div>
            );
        }

        return <VocabularyGame level={level} words={words} />;
    }

    if (levelId === 'grammar-blitz') {
        return <SpeedBlitzGame level={level} tasks={BLITZ_DATA} />;
    }

    if (levelId.startsWith('grammar-')) {
        const tasks = GRAMMAR_DATA.filter(t => t.levelId === levelId);

        if (tasks.length === 0) {
            return (
                <div className="min-h-screen flex items-center justify-center p-8 text-center bg-slate-50 dark:bg-[#0a0a0f]">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Grammar Coming Soon</h2>
                        <p className="text-slate-500">The Time Machine for {level.title} is being calibrated.</p>
                        <Button variant="primary" onClick={() => router.push('/')}>Go Back</Button>
                    </div>
                </div>
            );
        }

        return <GrammarGame level={level} tasks={tasks} />;
    }

    return null;
}
