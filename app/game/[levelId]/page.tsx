import { VocabularyGame } from '@/components/game/VocabularyGame';
import { GrammarGame } from '@/components/game/GrammarGame';
import { SpeedBlitzGame } from '@/components/game/SpeedBlitzGame';
import { CURRICULUM_LEVELS } from '@/lib/data/mockLevels';
import { VOCABULARY_DATA } from '@/lib/data/vocabulary';
import { GRAMMAR_DATA } from '@/lib/data/grammar';
import { BLITZ_DATA } from '@/lib/data/blitz';
import { redirect } from 'next/navigation';

export default async function GamePage({ params }: { params: Promise<{ levelId: string }> }) {
    const { levelId } = await params;

    // 1. Find the level
    const level = CURRICULUM_LEVELS.find(l => l.id === levelId);
    if (!level) redirect('/');

    // 2. Decide game type based on ID prefix
    if (levelId.startsWith('vocab-')) {
        const words = VOCABULARY_DATA.filter(w => w.levelId === levelId);

        if (words.length === 0) {
            return (
                <div className="min-h-screen flex items-center justify-center p-8 text-center bg-slate-50 dark:bg-[#0a0a0f]">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Vocabulary Coming Soon</h2>
                        <p className="text-slate-500">We are adding 100+ words to {level.title}.</p>
                        <a href="/" className="inline-block px-6 py-2 bg-primary text-white rounded-xl">Go Back</a>
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
                        <a href="/" className="inline-block px-6 py-2 bg-primary text-white rounded-xl">Go Back</a>
                    </div>
                </div>
            );
        }

        return <GrammarGame level={level} tasks={tasks} />;
    }

    return redirect('/');
}
