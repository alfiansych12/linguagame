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
      <div className="relative flex flex-col pt-4 md:pt-8 px-4 overflow-hidden mb-8 md:mb-12">
        {!isAuthenticated ? (
          /* HERO SECTION FOR GUESTS - "ORANG AWAM" FRIENDLY */
          <div className="relative rounded-[2.5rem] overflow-hidden min-h-[500px] flex items-center justify-center text-center px-6 mb-12 shadow-2xl">
            <div className="absolute inset-0 z-0">
              <img src="/kamar.jpg" alt="Background" className="w-full h-full object-cover opacity-30" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/80 to-transparent"></div>
            </div>

            <div className="relative z-10 max-w-2xl space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-white mb-4">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest">Live: Season 1</span>
              </div>

              <h1 className="text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase italic tracking-tighter leading-[0.9]">
                Level Up Your <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-400">English Skills</span>
              </h1>

              <p className="text-base md:text-lg text-slate-300 font-medium leading-relaxed max-w-lg mx-auto">
                Cara paling seru belajar bahasa Inggris. Mainkan game, selesaikan misi, dan adu mekanik dengan ribuan player lain. 100% Gratis.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                <Button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="h-14 px-8 rounded-2xl bg-primary text-white text-sm font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-primary/25"
                >
                  Mulai Main Sekarang
                </Button>
                <Link href="/about">
                  <Button
                    variant="ghost"
                    className="h-14 px-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 text-white text-sm font-black uppercase tracking-widest hover:bg-white/10"
                  >
                    Pelajari Lebih Lanjut
                  </Button>
                </Link>
              </div>

              <div className="pt-8 flex items-center justify-center gap-8 opacity-60">
                <div className="text-center">
                  <p className="text-2xl font-black text-white">10K+</p>
                  <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Users</p>
                </div>
                <div className="w-px h-8 bg-white/20"></div>
                <div className="text-center">
                  <p className="text-2xl font-black text-white">500+</p>
                  <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">Missions</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* DASHBOARD FOR LOGGED IN USERS - CLEAN COMMAND CENTER */
          <>
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8 md:mb-12">
              <div className="text-center md:text-left">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-2"
                >
                  <div className="size-2 bg-emerald-500 rounded-full animate-pulse"></div>
                  <span className="text-[10px] font-black uppercase tracking-widest">System Online</span>
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter"
                >
                  Welcome, {userStats.name.split(' ')[0]}
                </motion.h2>
                <p className="text-sm text-slate-500 font-medium max-w-md mt-2">
                  Ready to grind? Pilih mode misi di bawah untuk melanjutkan progress.
                </p>
              </div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex gap-3"
              >
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg text-center min-w-[100px]">
                  <Icon name="bolt" size={24} className="text-primary mx-auto mb-1" filled />
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{userStats.totalXp.toLocaleString()}</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total XP</p>
                </div>
                <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-lg text-center min-w-[100px]">
                  <Icon name="local_fire_department" size={24} className={userStats.currentStreak > 0 ? "text-orange-500" : "text-slate-400"} mx-auto mb-1 filled />
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{userStats.currentStreak}</p>
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Day Streak</p>
                </div>
              </motion.div>
            </div>

            {/* DASHBOARD GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 w-full max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="md:col-span-2"
              >
                <div className="h-full p-6 bg-gradient-to-br from-primary to-purple-600 rounded-[2rem] text-white shadow-2xl shadow-primary/20 relative overflow-hidden group">
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-lg text-[10px] font-black uppercase tracking-widest border border-white/10">
                        <Icon name="radar" size={14} />
                        Active Mission
                      </div>
                      <Icon name="sports_esports" size={24} className="opacity-80" />
                    </div>

                    <h3 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter mb-2">
                      {mode === 'VOCAB' ? 'Vocabulary' : 'Grammar'} Protocol
                    </h3>

                    <div className="flex gap-2 mt-8">
                      <button
                        onClick={() => { playSound('CLICK'); setMode('VOCAB'); setSelectedGrammarCat(null); }}
                        className={`flex-1 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${mode === 'VOCAB' ? 'bg-white text-primary shadow-xl scale-105' : 'bg-black/20 text-white hover:bg-black/30'}`}
                      >
                        <Icon name="translate" size={16} /> Vocab
                      </button>
                      <button
                        onClick={() => { playSound('CLICK'); setMode('GRAMMAR'); }}
                        className={`flex-1 py-3 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${mode === 'GRAMMAR' ? 'bg-white text-purple-600 shadow-xl scale-105' : 'bg-black/20 text-white hover:bg-black/30'}`}
                      >
                        <Icon name="history_edu" size={16} /> Grammar
                      </button>
                    </div>
                  </div>

                  {/* Decorative Elements */}
                  <div className="absolute top-0 right-0 size-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/20 transition-colors"></div>
                  <Icon name="stadia_controller" size={120} className="absolute -bottom-10 -right-10 text-white opacity-10 rotate-12 group-hover:rotate-6 transition-transform" filled />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Link href="/about">
                  <Card className="h-full p-6 flex flex-col border-2 border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 group hover:border-primary/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-2 text-slate-400 mb-4">
                      <Icon name="info" size={20} className="group-hover:text-primary transition-colors" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Base Intel</span>
                    </div>

                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight mb-2">
                      About LinguaGame
                    </h3>
                    <p className="text-xs text-slate-500 leading-relaxed mb-6 flex-1">
                      Pelajari misi, visi, dan cerita di balik markas ini.
                    </p>

                    <div className="mt-auto flex justify-end">
                      <div className="size-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                        <Icon name="arrow_forward" size={16} />
                      </div>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            </div>
          </>
        )}
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

      {/* SEO & CONTENT SECTION FOR ADSENSE VALUATION */}
      <section className="border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 -mx-4 md:-mx-8 lg:-mx-16 px-4 md:px-8 lg:px-16 py-12 md:py-20 mt-12 md:mt-20">
        <div className="max-w-4xl mx-auto space-y-16">

          {/* Main Value Prop */}
          <div className="text-center space-y-6">
            <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
              Platform Belajar Bahasa Inggris <span className="text-primary">#1 Paling Seru</span>
            </h2>
            <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto">
              LinguaGame mengubah cara kamu belajar bahasa Inggris. Lupakan buku tebal membosankan.
              Di sini, setiap kata yang kamu pelajari adalah senjata, dan setiap grammar adalah strategi untuk menaklukkan misi.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="size-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                <Icon name="psychology" size={24} filled />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Metode Gamifikasi</h3>
              <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                Sistem level, XP, dan Rank yang membuat ketagihan. Belajar jadi tidak terasa berat karena kamu sibuk mengejar Rank Sepuh!
              </p>
            </div>

            <div className="space-y-4">
              <div className="size-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <Icon name="school" size={24} filled />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Kurikulum Terstruktur</h3>
              <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                Materi disusun oleh ahli bahasa. Mulai dari Basic Vocabulary hingga Advanced Grammar, semua ada jalurnya.
              </p>
            </div>

            <div className="space-y-4">
              <div className="size-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                <Icon name="trophy" size={24} filled />
              </div>
              <h3 className="text-lg font-black uppercase tracking-tight text-slate-900 dark:text-white">Kompetisi Global</h3>
              <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">
                Adu kemampuan dengan user lain di Leaderboard. Buktikan kalau kamu memang jagoan bahasa Inggris di arena Duel.
              </p>
            </div>
          </div>

          {/* AdSense Policy & Safety Text */}
          <div className="pt-12 border-t border-slate-200 dark:border-slate-800 text-center">
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-4">
              Safety & Quality Standards
            </p>
            <p className="text-xs text-slate-500 max-w-2xl mx-auto leading-relaxed mb-6">
              LinguaGame berkomitmen menyediakan konten edukasi berkualitas tinggi yang aman untuk semua umur.
              Kami mematuhi seluruh kebijakan program Google AdSense dengan memastikan navigasi yang jelas,
              konten orisinal yang bermanfaat, dan pengalaman pengguna yang transparan.
              Hubungi dukungan kami jika menemukan masalah.
            </p>
            <div className="flex justify-center gap-6">
              <Link href="/privacy" className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">Privacy Policy</Link>
              <Link href="/terms" className="text-[10px] font-bold text-slate-400 hover:text-primary transition-colors uppercase tracking-widest">Terms of Service</Link>
            </div>
          </div>

        </div>
      </section>

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
