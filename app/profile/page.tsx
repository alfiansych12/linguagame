'use client';

import React, { useEffect, useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, Icon, Badge, Button } from '@/components/ui/UIComponents';
import { supabase } from '@/lib/db/supabase';
import { useUserStore } from '@/store/user-store';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';

/**
 * Profile Page - User statistics and progress overview
 */
export default function ProfilePage() {
    const { data: session, status } = useSession();
    const {
        name, totalXp, currentStreak, referralCount, referralCode, claimedMilestones,
        addGems, checkReferralMilestones, setReferralCode
    } = useUserStore();

    const [wordsCount, setWordsCount] = useState(0);
    const [refCodeInput, setRefCodeInput] = useState('');
    const [loadingRef, setLoadingRef] = useState(false);

    useEffect(() => {
        const fetchStats = async () => {
            if (!session?.user?.id) return;

            const { count } = await supabase
                .from('user_progress')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', session.user.id)
                .eq('status', 'COMPLETED');

            if (count) setWordsCount(count);

            // Sync referral code if missing
            const { data: userData } = await supabase
                .from('users')
                .select('referral_code')
                .eq('id', session.user.id)
                .single();

            if (userData?.referral_code) setReferralCode(userData.referral_code);
        };

        if (status === 'authenticated') {
            fetchStats();
        }
        checkReferralMilestones();
    }, [session?.user?.id, status]);

    const handleApplyReferral = async () => {
        if (!refCodeInput || loadingRef) return;
        setLoadingRef(true);

        // Simulating applying a code
        setTimeout(() => {
            addGems(250); // Bonus for joining via referral
            alert('Literally gacor! Kamu dapet 250 Crystal gratis.');
            setLoadingRef(false);
            setRefCodeInput('');
        }, 1500);
    };

    // Stats for the profile
    const stats = [
        { label: 'XP Gacor', value: totalXp, icon: 'bolt', color: 'text-primary', bg: 'bg-primary/10' },
        { label: 'Kosa Kata', value: wordsCount * 10, icon: 'menu_book', color: 'text-success', bg: 'bg-success/10' },
        { label: 'Streak Harian', value: currentStreak, icon: 'local_fire_department', color: 'text-orange-500', bg: 'bg-orange-50' },
        { label: 'Akurasi', value: '88%', icon: 'target', color: 'text-purple-500', bg: 'bg-purple-50' },
    ];

    const mockUser = {
        name: name,
        totalXp: totalXp,
        currentStreak: currentStreak,
        image: session?.user?.image || ''
    };

    return (
        <PageLayout activeTab="profile" user={mockUser}>
            {/* Profile Header Card */}
            <div className="flex flex-col items-center mb-8 md:mb-16 text-center">
                <div className="relative mb-4 md:mb-8 group">
                    <div className="size-28 md:size-44 rounded-3xl md:rounded-[3rem] border-2 md:border-4 border-white dark:border-slate-700 shadow-soft-xl overflow-hidden bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 flex items-center justify-center group-hover:rotate-2 transition-transform duration-500">
                        {mockUser.image ? (
                            <img src={mockUser.image} alt={mockUser.name} className="size-full object-cover" />
                        ) : (
                            <Icon name="person" size={40} mdSize={80} className="text-slate-300 dark:text-slate-500" />
                        )}
                    </div>
                    <button className="absolute -bottom-1 -right-1 size-10 md:size-14 bg-primary hover:bg-primary-dark text-white rounded-xl md:rounded-2xl border-2 md:border-4 border-white dark:border-[#0a0a0f] flex items-center justify-center shadow-lg hover:scale-110 transition-all active:scale-95 group-hover:-translate-y-1">
                        <Icon name="edit" size={16} mdSize={24} />
                    </button>
                    <div className="absolute -top-3 -left-3 size-8 md:size-12 bg-yellow-400 rounded-lg md:rounded-2xl flex items-center justify-center shadow-lg -rotate-12 animate-bounce-gentle">
                        <Icon name="star" size={16} mdSize={24} className="text-white" filled />
                    </div>
                </div>
                <h2 className="text-2xl md:text-6xl font-black text-slate-900 dark:text-white mb-1 md:mb-2 tracking-tighter italic uppercase">
                    {mockUser.name || 'Linguist Explorer'}
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-bold text-xs md:text-lg flex items-center gap-2 uppercase tracking-widest">
                    Joined Dec 2025 <span className="size-1 rounded-full bg-slate-300"></span> Pro Member
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-12 md:mb-20">
                {stats.map((stat) => (
                    <Card key={stat.label} className="p-4 md:p-8 flex flex-col items-center text-center hover:shadow-floating transition-all border-b-2 md:border-b-4 border-b-transparent hover:border-b-primary">
                        <div className={`size-10 md:size-16 ${stat.bg} ${stat.color} rounded-xl md:rounded-2xl flex items-center justify-center mb-2 md:mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                            <Icon name={stat.icon} size={20} mdSize={32} filled />
                        </div>
                        <div className="text-xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-0.5 md:mb-1">
                            {stat.value}
                        </div>
                        <div className="text-[7px] md:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">
                            {stat.label}
                        </div>
                    </Card>
                ))}
            </div>

            {/* REFERRAL SYSTEM SECTION */}
            <div className="mb-12 md:mb-20 space-y-8">
                <div className="flex flex-col md:flex-row gap-6">
                    {/* Share Code Card */}
                    <Card className="flex-1 p-8 bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20 relative overflow-hidden group">
                        <div className="relative z-10 space-y-6">
                            <div>
                                <h3 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Sirkel Invite</h3>
                                <p className="text-xs md:text-sm font-bold text-slate-500">Ajak sirkel kamu mabar, auto dapet Crystal gratis!</p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="bg-white dark:bg-slate-900 border-2 border-primary/30 p-4 rounded-3xl flex items-center justify-between group-hover:scale-[1.02] transition-transform">
                                    <span className="text-2xl md:text-4xl font-black tracking-[0.2em] text-primary">{referralCode || 'GACORE'}</span>
                                    <Button variant="ghost" className="size-12 rounded-2xl p-0 hover:bg-primary/10" onClick={() => {
                                        navigator.clipboard.writeText(referralCode || 'GACORE');
                                        alert('Code copied! Literal sepuh.');
                                    }}>
                                        <Icon name="content_copy" size={24} />
                                    </Button>
                                </div>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Copy & Share your code</p>
                            </div>
                        </div>
                        <Icon name="group_add" size={120} className="absolute -bottom-8 -right-8 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                    </Card>

                    {/* Milestone Progress */}
                    <Card className="flex-1 p-8 border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h4 className="font-black text-slate-900 dark:text-white uppercase italic">Progress Sirkel</h4>
                                <Badge variant="primary">{referralCount} Invites</Badge>
                            </div>

                            <div className="space-y-4">
                                <MilestoneItem
                                    target={1}
                                    current={referralCount}
                                    reward="500 Crystals"
                                    claimed={claimedMilestones.includes('1_referral')}
                                />
                                <MilestoneItem
                                    target={3}
                                    current={referralCount}
                                    reward="1000 Crystals"
                                    claimed={claimedMilestones.includes('3_referrals')}
                                />
                                <MilestoneItem
                                    target={10}
                                    current={referralCount}
                                    reward="Sirkel King (Admin Vision x1)"
                                    claimed={claimedMilestones.includes('10_referrals')}
                                />
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Redeem Referral Card */}
                <Card className="p-6 md:p-8 bg-slate-900 text-white flex flex-col md:flex-row items-center gap-6">
                    <div className="shrink-0 size-16 rounded-3xl bg-primary/20 flex items-center justify-center">
                        <Icon name="confirmation_number" size={32} className="text-primary" />
                    </div>
                    <div className="flex-1 text-center md:text-left">
                        <h4 className="text-xl font-black uppercase italic tracking-tight">Punya Kode Promo / Referral?</h4>
                        <p className="text-xs font-bold text-slate-400">Masukin kodenya di sini biar dapet Crystal instan.</p>
                    </div>
                    <div className="flex w-full md:w-auto gap-2">
                        <input
                            type="text"
                            placeholder="Ketik di sini..."
                            value={refCodeInput}
                            onChange={(e) => setRefCodeInput(e.target.value.toUpperCase())}
                            className="bg-white/10 border-2 border-white/10 rounded-2xl px-4 py-2 text-white font-black placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all flex-1 md:w-48"
                        />
                        <Button
                            variant="primary"
                            className="rounded-2xl px-6"
                            loading={loadingRef}
                            onClick={handleApplyReferral}
                        >
                            GAS
                        </Button>
                    </div>
                </Card>
            </div>

            {/* Recent Achievements */}
            <div className="space-y-4 md:space-y-8 bg-white/50 dark:bg-slate-900/30 p-4 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-200/50 dark:border-slate-800/50 backdrop-blur-sm shadow-soft-xl">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Achievements</h3>
                    <button className="text-primary font-black text-[8px] md:text-xs hover:text-primary-dark transition-colors uppercase tracking-[0.15em]">Mana lagi? →</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    <AchievementItem
                        icon="workspace_premium"
                        title="First Steps"
                        desc="Complete first lesson"
                        progress={100}
                        unlocked
                    />
                    <AchievementItem
                        icon="local_fire_department"
                        title="Fire Starter"
                        desc="Keep it up"
                        progress={70}
                    />
                    <AchievementItem
                        icon="military_tech"
                        title="Mastery"
                        desc="100 words"
                        progress={40}
                    />
                    <AchievementItem
                        icon="rocket_launch"
                        title="Rocket"
                        desc="Speedrun"
                        progress={15}
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-8 md:mt-12 flex flex-col md:flex-row gap-3 md:gap-4">
                <Button variant="primary" fullWidth className="py-3 md:py-5 h-auto rounded-xl md:rounded-[1.5rem] text-xs md:text-sm font-black uppercase tracking-widest">
                    <Icon name="settings" className="mr-2" size={16} mdSize={20} />
                    Edit Branding
                </Button>
                <Button variant="ghost" fullWidth className="text-slate-400 hover:text-error hover:bg-red-50 dark:hover:bg-red-950/20 py-3 md:py-5 h-auto rounded-xl md:rounded-[1.5rem] text-xs md:text-sm font-black uppercase tracking-widest border border-slate-200/50 dark:border-slate-800/50">
                    <Icon name="logout" className="mr-2" size={16} mdSize={20} />
                    Sign Out Dulu
                </Button>
            </div>
        </PageLayout>
    );
}

function MilestoneItem({ target, current, reward, claimed }: { target: number, current: number, reward: string, claimed: boolean }) {
    const progress = Math.min(100, (current / target) * 100);
    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] md:text-xs font-black uppercase tracking-widest">
                <span className={claimed ? 'text-emerald-500' : 'text-slate-400'}>{reward}</span>
                <span className="text-slate-900 dark:text-white font-black">{current}/{target}</span>
            </div>
            <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-1000 ${claimed ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-primary'}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
            {claimed && <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest">Literally Claimed!</p>}
        </div>
    );
}

function AchievementItem({ icon, title, desc, progress, unlocked = false }: {
    icon: string, title: string, desc: string, progress: number, unlocked?: boolean
}) {
    return (
        <Card className={`p-3 md:p-4 flex items-center gap-3 md:gap-4 transition-all hover:scale-[1.02] ${!unlocked ? 'opacity-60 grayscale' : 'border-l-4 border-l-yellow-400'}`}>
            <div className={`size-10 md:size-14 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 ${unlocked ? 'bg-yellow-50 text-yellow-500' : 'bg-slate-100 text-slate-400'
                }`}>
                <Icon name={icon} size={20} mdSize={32} filled={unlocked} />
            </div>
            <div className="flex-1 min-w-0 text-left">
                <h4 className="font-bold text-xs md:text-base text-slate-900 dark:text-white truncate">{title}</h4>
                <p className="text-[9px] md:text-xs text-slate-400 truncate mb-1 md:mb-2">{desc}</p>
                <div className="w-full h-1 md:h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={`h-full ${unlocked ? 'bg-yellow-500' : 'bg-primary'}`}
                    />
                </div>
            </div>
            {unlocked && (
                <div className="size-6 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg">
                    <Icon name="check" size={16} />
                </div>
            )}
        </Card>
    );
}
