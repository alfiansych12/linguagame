'use client';

import React, { useState } from 'react';
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
 * Home Page - Main learning path entry point
 */
export default function Home() {
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

  // Filter levels based on mode and selected category
  const levels = mode === 'VOCAB'
    ? ALL_LEVELS.filter(l => l.id.startsWith('vocab'))
    : (selectedGrammarCat
      ? ALL_LEVELS.filter(l => l.category === selectedGrammarCat)
      : [] // Categories shown instead
    );

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
      <div className="flex flex-col items-center justify-center mb-8 md:mb-12 text-center space-y-3 md:space-y-4 px-4 mt-6 md:mt-8 lg:mt-12">
        <div className="px-3 md:px-4 py-1 md:py-1.5 rounded-full bg-primary/10 text-primary text-[8px] md:text-[10px] font-black uppercase tracking-widest animate-bounce-gentle">
          {isAuthenticated ? 'Target Hari Ini: +50 XP' : 'Gabung dan Mulai Belajar!'}
        </div>
        <h2 className="text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter max-w-2xl italic uppercase px-2">
          {isAuthenticated ? (
            <>Siap belajar, <span className="text-primary">{userStats.name.split(' ')[0]}</span>? ✨</>
          ) : (
            <>Kuasai Bahasa Inggris, <span className="text-primary">Sekarang Juga!</span> 💅</>
          )}
        </h2>

        {/* MODE SELECTOR */}
        <div className="flex items-center gap-1.5 md:gap-2 p-1.5 md:p-2 bg-slate-100 dark:bg-slate-900 rounded-2xl md:rounded-[2rem] mt-6 md:mt-8 w-full max-w-sm mx-auto shadow-inner">
          <button
            onClick={() => { playSound('CLICK'); setMode('VOCAB'); setSelectedGrammarCat(null); }}
            className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 py-2 md:py-3 rounded-xl md:rounded-[1.5rem] font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${mode === 'VOCAB' ? 'bg-white dark:bg-slate-800 text-primary shadow-lg scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name="translate" size={16} mdSize={18} />
            <span className="hidden sm:inline">Jalur Kosakata</span>
            <span className="sm:hidden">Kosakata</span>
          </button>
          <button
            onClick={() => { playSound('CLICK'); setMode('GRAMMAR'); }}
            className={`flex-1 flex items-center justify-center gap-1.5 md:gap-2 py-2 md:py-3 rounded-xl md:rounded-[1.5rem] font-black text-[10px] md:text-xs uppercase tracking-widest transition-all ${mode === 'GRAMMAR' ? 'bg-white dark:bg-slate-800 text-purple-600 shadow-lg scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
          >
            <Icon name="history_edu" size={16} mdSize={18} />
            <span className="hidden sm:inline">Jalur Tata Bahasa</span>
            <span className="sm:hidden">Tata Bahasa</span>
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
                      Belajar teori dulu sirkel biar gak bingung pas mabar!
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
