'use client';

import React, { useState, Suspense } from 'react';

export const dynamic = 'force-dynamic';
import { PageLayout } from '@/components/layout/PageLayout';
import { LearningPath } from '@/components/game/LearningPath';
import { QuestGacor } from '@/components/game/QuestGacor';
import { Card, Icon, Button } from '@/components/ui/UIComponents';
import { useRouter, useSearchParams } from 'next/navigation';
import { ALL_LEVELS, GRAMMAR_LEVELS } from '@/lib/data/mockLevels';
import { useUserStore } from '@/store/user-store';
import { useProgressStore } from '@/store/progress-store';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { LoginModal } from '@/components/ui/LoginModal';
import { useSound } from '@/hooks/use-sound';
import Link from 'next/link';

/**
 * Home Page Content - Actual implementation
 */
function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const { totalXp, currentStreak } = useUserStore();
  const { completedLevels, unlockedLevelIds } = useProgressStore();
  const { playSound } = useSound();

  // Initialize state from URL
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [mode, setMode] = useState<'VOCAB' | 'GRAMMAR'>((searchParams.get('mode') as any) || 'VOCAB');
  const [selectedGrammarCat, setSelectedGrammarCat] = useState<string | null>(searchParams.get('cat') || null);

  // Sync state to URL
  React.useEffect(() => {
    const params = new URLSearchParams();
    params.set('mode', mode);
    if (selectedGrammarCat) {
      params.set('cat', selectedGrammarCat);
    }
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, '', newUrl);
  }, [mode, selectedGrammarCat]);

  const isAuthenticated = status === 'authenticated';

  // Update streak on page load (daily login tracking)
  React.useEffect(() => {
    if (isAuthenticated && session?.user?.id) {
      const updateStreak = async () => {
        try {
          const { updateUserStreak } = await import('@/app/actions/streakActions');
          const result = await updateUserStreak();

          if (result.success && result.streak !== undefined) {
            // Update local store with new streak
            useUserStore.getState().updateStreak(result.streak);

            // Show notification if Phoenix was used
            if (result.phoenixUsed) {
              playSound('SUCCESS');
              // Could show a toast notification here
            }
          }
        } catch (error) {
          console.error('Failed to update streak:', error);
        }
      };

      updateStreak();
    }
  }, [isAuthenticated, session?.user?.id, playSound]);

  // Filter levels based on mode and selected category
  const levels = mode === 'VOCAB'
    ? ALL_LEVELS.filter(l => l.id.startsWith('vocab'))
    : (selectedGrammarCat
      ? ALL_LEVELS.filter(l => l.category === selectedGrammarCat)
      : [] // Categories shown instead
    );

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

  const grammarCategories = [
    { title: 'Simple Present', icon: 'schedule', color: 'from-emerald-500 to-emerald-600', desc: 'Kebiasaan & Fakta' },
    { title: 'Present Continuous', icon: 'bolt', color: 'from-purple-500 to-purple-600', desc: 'Lagi Berlangsung' },
    { title: 'Present Perfect', icon: 'done_all', color: 'from-blue-500 to-blue-600', desc: 'Baru Saja Selesai' }
  ];

  // Calculate category progress
  const getCategoryProgress = (categoryTitle: string) => {
    const categoryLevels = GRAMMAR_LEVELS.filter(l => l.category === categoryTitle);
    const completed = categoryLevels.filter(l => completedLevels[l.id]?.completed).length;
    return {
      completed,
      total: categoryLevels.length,
      percent: (completed / categoryLevels.length) * 100
    };
  };

  return (
    <PageLayout activeTab="home" user={userStats}>
      <div className="relative flex flex-col items-center justify-center pt-8 md:pt-16 pb-4 md:pb-6 text-center px-4 overflow-hidden">
        {/* TACTICAL HEADER BACKGROUND */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-transparent to-transparent"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="px-4 md:px-6 py-1.5 md:py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/5 shadow-xl shadow-primary/5 mb-6 md:mb-8 flex items-center gap-3"
        >
          <div className="size-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            {isAuthenticated ? `LINK ESTABLISHED: +${userStats.totalXp.toLocaleString('id-ID')} XP` : 'MAINFRAME OFFLINE: LOGIN REQUIRED'}
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight md:tracking-tighter max-w-4xl italic uppercase px-2 leading-tight md:leading-none mb-4 md:mb-6 relative"
        >
          {isAuthenticated ? (
            <>Siap <span className="text-primary">Mabar</span>, {userStats.name.split(' ')[0]}? <span className="text-primary italic">⚡</span></>
          ) : (
            <>Kuasai <span className="text-primary">Mainframe</span> Inggris! <span className="text-primary italic">💅</span></>
          )}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-[10px] md:text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest md:tracking-[0.3em] max-w-xl leading-relaxed mb-8 md:mb-12"
        >
          Pilih salah satu jalur grinding di bawah ini untuk meningkatkan level bahasa kamu.
        </motion.p>

        {/* MODE SELECTOR */}
        <div className="flex items-center gap-2 md:gap-3 p-2 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-white/5 rounded-[2rem] md:rounded-[2.5rem] w-full max-w-md mx-auto shadow-2xl">
          <button
            onClick={() => { playSound('CLICK'); setMode('VOCAB'); setSelectedGrammarCat(null); }}
            className={`flex-1 flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 rounded-2xl md:rounded-[2rem] font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${mode === 'VOCAB' ? 'bg-primary text-white shadow-xl shadow-primary/30 scale-[1.05]' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Icon name="translate" size={18} mdSize={22} filled={mode === 'VOCAB'} />
            <span>Kosakata</span>
          </button>
          <button
            onClick={() => { playSound('CLICK'); setMode('GRAMMAR'); }}
            className={`flex-1 flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 rounded-2xl md:rounded-[2rem] font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${mode === 'GRAMMAR' ? 'bg-purple-600 text-white shadow-xl shadow-purple-600/30 scale-[1.05]' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
          >
            <Icon name="history_edu" size={18} mdSize={22} filled={mode === 'GRAMMAR'} />
            <span>Tata Bahasa</span>
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 pb-20">
        <AnimatePresence mode="wait">
          {mode === 'GRAMMAR' && !selectedGrammarCat ? (
            <motion.div
              key="grammar-cats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="text-center">
                <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary bg-primary/5 px-6 py-2 rounded-full border border-primary/10">
                  Phase 1: Beginner
                </span>
              </div>

              <Link href="/grammar">
                <Card
                  onClick={() => playSound('CLICK')}
                  className="mb-8 p-4 md:p-6 bg-gradient-to-r from-purple-500/10 to-primary/10 border-2 border-purple-500/20 hover:border-purple-500/40 cursor-pointer group flex items-center gap-4 md:gap-6 shadow-xl shadow-purple-500/5 rounded-3xl"
                >
                  <div className="size-12 md:size-16 bg-purple-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-purple-500/30 group-hover:scale-110 group-hover:rotate-6 transition-all">
                    <Icon name="book" size={24} mdSize={32} filled />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight mb-0.5 md:mb-1">
                      Kitab Tata Bahasa
                    </h3>
                    <p className="text-[9px] md:text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                      Belajar teori dulu bro biar gak bingung pas mabar!
                    </p>
                  </div>
                  <Icon name="arrow_forward" size={20} className="text-slate-300 group-hover:text-purple-500 transition-colors" />
                </Card>
              </Link>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                {grammarCategories.map((cat, idx) => {
                  const progress = getCategoryProgress(cat.title);
                  return (
                    <motion.div
                      key={cat.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.1 }}
                    >
                      <Card
                        onClick={() => { playSound('CLICK'); setSelectedGrammarCat(cat.title); }}
                        className="p-6 md:p-8 h-full flex flex-col items-center text-center cursor-pointer group hover:border-primary/40 hover:shadow-2xl transition-all border-2 border-slate-100 dark:border-slate-800 rounded-[2.5rem] relative overflow-hidden"
                      >
                        <div className={`size-16 md:size-20 bg-gradient-to-br ${cat.color} rounded-3xl flex items-center justify-center text-white mb-6 shadow-lg shadow-current/20 group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                          <Icon name={cat.icon} size={32} mdSize={40} filled />
                        </div>
                        <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter mb-2 leading-none">
                          {cat.title}
                        </h3>
                        <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest mb-6">
                          {cat.desc}
                        </p>

                        <div className="mt-auto w-full space-y-3">
                          <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <span>Progress</span>
                            <span className="text-primary">{progress.completed}/{progress.total} Misi</span>
                          </div>
                          <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress.percent}%` }}
                              className={`h-full bg-gradient-to-r ${cat.color}`}
                            />
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="learning-path"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              {mode === 'GRAMMAR' && (
                <div className="flex items-center justify-between mb-8">
                  <button
                    onClick={() => setSelectedGrammarCat(null)}
                    className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors font-black uppercase text-[10px] tracking-widest group"
                  >
                    <Icon name="arrow_back" size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Categories
                  </button>
                  <div className="text-right">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Category</p>
                    <p className="text-sm font-black text-primary uppercase italic">{selectedGrammarCat}</p>
                  </div>
                </div>
              )}

              <LearningPath
                levels={levels}
                userProgress={userProgress as any}
                onLevelStart={handleLevelStart}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </PageLayout>
  );
}

/**
 * Home Page - Main learning path entry point
 * Wrapped in Suspense to handle useSearchParams during static generation
 */
export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex h-screen items-center justify-center bg-background-light dark:bg-background-dark">
        <div className="flex flex-col items-center gap-4">
          <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-black uppercase tracking-widest text-primary animate-pulse">Initializing Data...</p>
        </div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
