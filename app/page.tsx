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

/**
 * Home Page - Main learning path entry point
 */
export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { totalXp, currentStreak } = useUserStore();
  const { completedLevels, unlockedLevelIds } = useProgressStore();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const levels = CURRICULUM_LEVELS;
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
      <div className="flex flex-col items-center justify-center mb-8 md:mb-16 text-center space-y-2 md:space-y-4 px-4">
        <div className="px-3 md:px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[8px] md:text-[10px] font-black uppercase tracking-widest mb-1 md:mb-2 animate-bounce-gentle">
          {isAuthenticated ? 'Target Gacor: +50 XP' : 'Join the Sirkel & Slay!'}
        </div>
        <h2 className="text-3xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter max-w-2xl leading-none italic uppercase">
          {isAuthenticated ? (
            <>Ready to slay, <br className="md:hidden" /> <span className="text-primary">{userStats.name.split(' ')[0]}</span>? ✨</>
          ) : (
            <>Master English, <br className="md:hidden" /> <span className="text-primary leading-none">Literally!</span> 💅</>
          )}
        </h2>
        <p className="text-slate-500 dark:text-slate-400 font-bold text-sm md:text-lg max-w-md mx-auto">
          {isAuthenticated ? (
            <>Streak kamu <span className="text-orange-500">{userStats.currentStreak} hari</span>. Literally gas!</>
          ) : (
            <>Belajar bahasa inggris gaya Jaksel. Gak ribet, which is keren bgt!</>
          )}
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-4">
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
