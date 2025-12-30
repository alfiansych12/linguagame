'use client';

import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { LearningPath } from '@/components/game/LearningPath';
import { QuestGacor } from '@/components/game/QuestGacor';
import { Card, Icon, Button } from '@/components/ui/UIComponents';
import { useRouter } from 'next/navigation';
import { CURRICULUM_LEVELS } from '@/lib/data/mockLevels';
import { useUserStore } from '@/store/user-store';
import { useProgressStore } from '@/store/progress-store';
import { useSession } from 'next-auth/react';
import { LoginModal } from '@/components/ui/LoginModal';
import { useSound } from '@/hooks/use-sound';

/**
 * Home Page - Main learning path entry point
 */
export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { totalXp, currentStreak } = useUserStore();
  const { completedLevels, unlockedLevelIds } = useProgressStore();
  const { playSound } = useSound();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [mode, setMode] = useState<'VOCAB' | 'GRAMMAR'>('VOCAB');
  const levels = CURRICULUM_LEVELS.filter(l => mode === 'VOCAB' ? l.id.startsWith('vocab') : l.id.startsWith('grammar'));
  const isAuthenticated = status === 'authenticated';

  // Convert progress store data to the format expected by LearningPath
  const userProgress = levels.map(level => {
    const progress = completedLevels[level.id];
    const isUnlocked = unlockedLevelIds.includes(level.id);

    return {
      id: progress?.levelId || `prog-${level.id}`,
      userId: session?.user?.id || 'guest',
      levelId: level.id,
      status: progress?.completed ? 'COMPLETED' : (isUnlocked ? 'OPEN' : 'LOCKED'),
      highScore: progress?.score || 0,
      stars: progress?.stars || 0
    };
  });

  const userStats = {
    name: session?.user?.name || 'Explorer',
    image: session?.user?.image || '',
    totalXp,
    currentStreak,
  };

  const handleLevelStart = (levelId: string) => {
    if (!isAuthenticated) {
      setIsLoginModalOpen(true);
      return;
    }
    router.push(`/game/${levelId}`);
  };

  return (
    <PageLayout activeTab="home" user={userStats}>
      <div className="flex flex-col items-center justify-center mb-12 text-center space-y-4 px-4 mt-8 md:mt-12">
        <div className="px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest animate-bounce-gentle">
          {isAuthenticated ? 'Target Gacor: +50 XP' : 'Join the Sirkel & Slay!'}
        </div>
        <h2 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter max-w-2xl italic uppercase">
          {isAuthenticated ? (
            <>Ready to slay, <span className="text-primary">{userStats.name.split(' ')[0]}</span>? ✨</>
          ) : (
            <>Master English, <span className="text-primary">Literally!</span> 💅</>
          )}
        </h2>

        {/* MODE SELECTOR */}
        <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-900 rounded-[2rem] mt-8 w-full max-w-sm mx-auto shadow-inner">
          <button
            onClick={() => { playSound('CLICK'); setMode('VOCAB'); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${mode === 'VOCAB' ? 'bg-white dark:bg-slate-800 text-primary shadow-lg scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name="translate" size={18} />
            Vocab Path
          </button>
          <button
            onClick={() => { playSound('CLICK'); setMode('GRAMMAR'); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-[1.5rem] font-black text-xs uppercase tracking-widest transition-all ${mode === 'GRAMMAR' ? 'bg-white dark:bg-slate-800 text-purple-600 shadow-lg scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name="history_edu" size={18} />
            Grammar Path
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-20">
        <LearningPath
          levels={levels}
          userProgress={userProgress as any}
          onLevelStart={handleLevelStart}
        />
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </PageLayout>
  );
}
