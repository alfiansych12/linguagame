'use client';

import React, { useEffect, useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, Icon, Badge, Button } from '@/components/ui/UIComponents';
import { supabase } from '@/lib/db/supabase';
import { useUserStore } from '@/store/user-store';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { useAlertStore } from '@/store/alert-store';
import { ACHIEVEMENTS, Achievement } from '@/lib/data/achievements';
import Link from 'next/link';
import { uploadProfilePhoto } from '@/app/actions/upload';
import { AvatarFrame } from '@/components/ui/AvatarFrame';
import { BorderSelector } from '@/components/ui/BorderSelector';

/**
 * Profile Page - User statistics and progress overview
 */
export default function ProfilePage() {
    const { data: session, status } = useSession();
    const { showAlert } = useAlertStore();
    const {
        name, totalXp, currentStreak, referralCount, referralCode, claimedMilestones,
        vocabCount, duelWins, totalSpent,
        addGems, checkReferralMilestones, setReferralCode, setName, applyReferralCode, syncWithDb,
        unlockedAchievements, gems, image, setImage
    } = useUserStore();

    const [refCodeInput, setRefCodeInput] = useState('');
    const [loadingRef, setLoadingRef] = useState(false);
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(name);
    const [showBorderSelector, setShowBorderSelector] = useState(false);

    const { equippedBorder } = useUserStore();



    const handleApplyReferral = async () => {
        if (!refCodeInput || loadingRef) return;
        setLoadingRef(true);

        const result = await applyReferralCode(refCodeInput);

        if (result.success) {
            showAlert({
                title: 'Literally Gacor! ✨',
                message: result.message,
                type: 'crystal'
            });
            setRefCodeInput('');
        } else {
            showAlert({
                title: 'Wait sirkel...',
                message: result.message,
                type: 'error'
            });
        }

        setLoadingRef(false);
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            showAlert({ title: 'Kegedean sirkel!', message: 'Foto maksimal 2MB ya biar enteng.', type: 'error' });
            return;
        }

        const { userId } = useUserStore.getState();
        if (!userId) return;

        setLoadingRef(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const result = await uploadProfilePhoto(formData);

            if (result.success && result.url) {
                await setImage(result.url);
                showAlert({ title: 'Literally Gacor! ✨', message: 'Foto profil baru berhasil dipasang.', type: 'success' });
            } else {
                showAlert({ title: 'Wait sirkel...', message: result.message || 'Gagal upload foto.', type: 'error' });
            }
        } catch (err: any) {
            console.error('Upload error:', err);
            showAlert({ title: 'Wait sirkel...', message: 'Terjadi kesalahan sistem.', type: 'error' });
        } finally {
            setLoadingRef(false);
        }
    };

    // Level Logic (1000 XP per Level)
    const currentLevel = Math.floor(totalXp / 1000) + 1;
    const levelXp = totalXp % 1000;
    const progressToNext = (levelXp / 1000) * 100;

    // Stats for the profile
    const stats = [
        { label: 'XP Gacor', value: totalXp, icon: 'bolt', color: 'text-primary', bg: 'bg-primary/10' },
        { label: 'Kosa Kata', value: vocabCount, icon: 'menu_book', color: 'text-success', bg: 'bg-success/10' },
        { label: 'Duel Won', value: duelWins, icon: 'swords', color: 'text-error', bg: 'bg-error/10' },
        { label: 'Spent', value: totalSpent, icon: 'shopping_cart', color: 'text-purple-500', bg: 'bg-purple-50' },
    ];

    const mockUser = {
        name: name,
        totalXp: totalXp,
        currentStreak: currentStreak,
        image: image || session?.user?.image || ''
    };

    return (
        <>
            <PageLayout activeTab="profile" user={mockUser}>
                {/* Profile Header Card */}
                <div className="flex flex-col items-center mb-8 md:mb-16 text-center">
                    <div className="relative mb-6 md:mb-12 group">
                        <div className="relative">
                            <AvatarFrame
                                src={image || session?.user?.image}
                                alt={name}
                                size="2xl"
                                borderId={
                                    // Admin gets gold_champion automatically
                                    name?.toLowerCase().includes('admin') || session?.user?.email?.toLowerCase().includes('admin')
                                        ? 'gold_champion'
                                        : (equippedBorder || 'default')
                                }
                                fallbackInitial={name?.charAt(0) || '?'}
                            />

                            {/* Hover Overlay for upload - Absolute positioned center of AvatarFrame */}
                            <label className="absolute inset-0 z-30 cursor-pointer rounded-full overflow-hidden opacity-0 hover:opacity-100 transition-opacity">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handlePhotoUpload}
                                    className="hidden"
                                />
                                <div className="size-full bg-primary/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                                    <Icon name="photo_camera" size={24} mdSize={32} />
                                    <span className="text-[8px] md:text-[10px] font-black uppercase mt-1">Upload</span>
                                </div>
                            </label>
                        </div>

                        <button
                            onClick={() => setIsEditingName(true)}
                            className="absolute bottom-1 -right-1 size-8 md:size-14 bg-white dark:bg-slate-800 text-primary rounded-lg md:rounded-2xl border-2 md:border-4 border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-lg hover:scale-110 transition-all active:scale-95 z-40"
                        >
                            <Icon name="edit" size={12} mdSize={24} />
                        </button>

                        <Button
                            variant="primary"
                            size="sm"
                            onClick={() => setShowBorderSelector(true)}
                            className="absolute -top-3 -right-8 md:-right-12 rotate-12 shadow-lg shadow-primary/20 bg-primary z-40 py-1 h-auto text-[8px] md:text-sm"
                        >
                            <Icon name="palette" size={10} mdSize={14} className="mr-1" />
                            Ganti Border
                        </Button>
                    </div>
                    {isEditingName ? (
                        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
                            <input
                                type="text"
                                value={tempName}
                                onChange={(e) => setTempName(e.target.value)}
                                className="text-2xl md:text-5xl font-black text-center bg-transparent border-b-4 border-primary outline-none text-slate-900 dark:text-white uppercase italic tracking-tighter w-full"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        setName(tempName);
                                        setIsEditingName(false);
                                    }
                                }}
                            />
                            <div className="flex gap-2">
                                <Button variant="primary" className="rounded-xl px-6" onClick={async () => {
                                    await setName(tempName);
                                    setIsEditingName(false);
                                }}>
                                    Save
                                </Button>
                                <Button variant="ghost" className="rounded-xl px-6" onClick={() => {
                                    setTempName(name);
                                    setIsEditingName(false);
                                }}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <h2 className="text-2xl md:text-6xl font-black text-slate-900 dark:text-white mb-1 md:mb-2 tracking-tighter italic uppercase">
                                {name || 'Linguist Explorer'}
                            </h2>
                            <div className="flex flex-col items-center gap-4">
                                <p className="text-slate-500 dark:text-slate-400 font-bold text-xs md:text-lg flex items-center gap-2 uppercase tracking-widest">
                                    Joined Dec 2025 <span className="size-1 rounded-full bg-slate-300"></span> Level {currentLevel} Gacor
                                </p>

                                {/* Level Progress Bar */}
                                <div className="w-full max-w-md space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                        <span>Level {currentLevel}</span>
                                        <span>{levelXp} / 1000 XP</span>
                                    </div>
                                    <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${progressToNext}%` }}
                                            className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full"
                                        />
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 md:gap-6 mb-8 md:mb-20">
                    {stats.map((stat) => (
                        <Card key={stat.label} className="p-3 md:p-8 flex flex-col items-center text-center hover:shadow-floating transition-all border-b-2 md:border-b-4 border-b-transparent hover:border-b-primary">
                            <div className={`size-8 md:size-16 ${stat.bg} ${stat.color} rounded-lg md:rounded-2xl flex items-center justify-center mb-1.5 md:mb-4 shadow-sm group-hover:scale-110 transition-transform`}>
                                <Icon name={stat.icon} size={16} mdSize={32} filled />
                            </div>
                            <div className="text-lg md:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-0.5 md:mb-1">
                                {stat.value}
                            </div>
                            <div className="text-[6px] md:text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">
                                {stat.label}
                            </div>
                        </Card>
                    ))}
                </div>

                {/* REFERRAL SYSTEM SECTION */}
                <div className="mb-10 md:mb-20 space-y-4 md:space-y-8">
                    <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                        {/* Share Code Card */}
                        <Card className="flex-1 p-5 md:p-8 bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20 relative overflow-hidden group">
                            <div className="relative z-10 space-y-4 md:space-y-6">
                                <div>
                                    <h3 className="text-lg md:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight">Sirkel Invite</h3>
                                    <p className="text-[10px] md:text-sm font-bold text-slate-500">Ajak sirkel kamu mabar, auto dapet Crystal gratis!</p>
                                </div>

                                <div className="flex flex-col gap-2 md:gap-4">
                                    <div className="bg-white dark:bg-slate-900 border-2 border-primary/30 p-3 md:p-4 rounded-2xl md:rounded-3xl flex items-center justify-between group-hover:scale-[1.02] transition-transform">
                                        <span className="text-xl md:text-4xl font-black tracking-[0.2em] text-primary">{referralCode || 'GACORE'}</span>
                                        <Button variant="ghost" className="size-10 md:size-12 rounded-xl md:rounded-2xl p-0 hover:bg-primary/10" onClick={() => {
                                            navigator.clipboard.writeText(referralCode || 'GACORE');
                                            showAlert({
                                                title: 'Copied! ✨',
                                                message: 'Code sudah disalin, sebarin ke sirkel kamu!',
                                                type: 'info',
                                                autoClose: 2000
                                            });
                                        }}>
                                            <Icon name="content_copy" size={18} mdSize={24} />
                                        </Button>
                                    </div>
                                    <p className="text-[8px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest text-center">Copy & Share your code</p>
                                </div>
                            </div>
                            <Icon name="group_add" size={80} mdSize={120} className="absolute -bottom-4 -right-4 md:-bottom-8 md:-right-8 opacity-5 -rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                        </Card>

                        {/* Milestone Progress */}
                        <Card className="flex-1 p-5 md:p-8 border-slate-200 dark:border-slate-800 flex flex-col justify-between">
                            <div className="space-y-4 md:space-y-6">
                                <div className="flex items-center justify-between">
                                    <h4 className="font-black text-slate-900 dark:text-white uppercase italic text-xs md:text-base">Progress Sirkel</h4>
                                    <Badge variant="primary" className="text-[8px] md:text-xs">{referralCount} Invites</Badge>
                                </div>

                                <div className="space-y-3 md:space-y-4">
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
                    <Card className="p-5 md:p-8 bg-slate-900 text-white flex flex-col lg:flex-row items-center gap-5 md:gap-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-full bg-primary/5 blur-3xl pointer-events-none"></div>

                        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 flex-1 w-full">
                            <div className="shrink-0 size-12 md:size-16 rounded-2xl md:rounded-3xl bg-primary/20 flex items-center justify-center">
                                <Icon name="confirmation_number" size={24} mdSize={32} className="text-primary" />
                            </div>
                            <div className="text-center md:text-left">
                                <h4 className="text-lg md:text-xl font-black uppercase italic tracking-tight leading-tight">Punya Kode Promo?</h4>
                                <p className="text-[10px] md:text-xs font-bold text-slate-400">Masukin kodenya dapet Crystal instan.</p>
                            </div>
                        </div>

                        <div className="flex w-full lg:w-auto gap-2 items-stretch relative z-10">
                            <input
                                type="text"
                                placeholder="KOTAK..."
                                value={refCodeInput}
                                onChange={(e) => setRefCodeInput(e.target.value.toUpperCase())}
                                className="bg-white/10 border-2 border-white/5 rounded-xl md:rounded-2xl px-4 py-3 text-sm md:text-base text-white font-black placeholder:text-white/20 focus:outline-none focus:border-primary/50 transition-all flex-1 lg:w-48 min-w-0"
                            />
                            <Button
                                variant="primary"
                                className="rounded-xl md:rounded-2xl px-6 md:px-8 font-black italic text-xs md:text-sm shadow-lg shadow-primary/20"
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
                        <Link
                            href="/profile/achievements"
                            className="text-primary font-black text-[8px] md:text-xs hover:text-primary-dark transition-colors uppercase tracking-[0.15em] flex items-center gap-1"
                        >
                            Mana lagi? <Icon name="arrow_forward" size={12} mdSize={14} />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        {ACHIEVEMENTS.map((ach) => {
                            const isUnlocked = unlockedAchievements.includes(ach.id);

                            // Hitung progres
                            let currentVal = 0;
                            switch (ach.type) {
                                case 'xp': currentVal = totalXp; break;
                                case 'vocab': currentVal = vocabCount; break;
                                case 'streak': currentVal = currentStreak; break;
                                case 'gems': currentVal = gems; break;
                                case 'wins': currentVal = duelWins; break;
                                case 'spent': currentVal = totalSpent; break;
                            }

                            const progress = Math.min(100, (currentVal / ach.target) * 100);

                            return (
                                <AchievementItem
                                    key={ach.id}
                                    icon={ach.icon}
                                    title={ach.title}
                                    desc={ach.desc}
                                    progress={progress}
                                    unlocked={isUnlocked}
                                />
                            );
                        })}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-8 md:mt-12 grid grid-cols-1 md:grid-cols-3 gap-2.5 md:gap-4">
                    <Button variant="primary" fullWidth className="py-2.5 md:py-5 h-auto rounded-xl md:rounded-[1.5rem] text-[10px] md:text-sm font-black uppercase tracking-widest" onClick={() => setIsEditingName(true)}>
                        <Icon name="settings" className="mr-2" size={14} mdSize={20} />
                        Edit Branding
                    </Button>
                    <Button
                        variant="ghost"
                        fullWidth
                        className="py-2.5 md:py-5 h-auto rounded-xl md:rounded-[1.5rem] text-[10px] md:text-sm font-black uppercase tracking-widest border-2 border-primary/20 text-primary hover:bg-primary/5"
                        onClick={() => window.open('https://linguagame-handbook.vercel.app', '_blank')}
                    >
                        <Icon name="menu_book" className="mr-2" size={14} mdSize={20} />
                        View Handbook
                    </Button>
                    <Button
                        variant="ghost"
                        fullWidth
                        className="text-slate-400 hover:text-error hover:bg-red-50 dark:hover:bg-red-950/20 py-2.5 md:py-5 h-auto rounded-xl md:rounded-[1.5rem] text-[10px] md:text-sm font-black uppercase tracking-widest border border-slate-200/50 dark:border-slate-800/50"
                        onClick={() => signOut({ callbackUrl: '/' })}
                    >
                        <Icon name="logout" className="mr-2" size={14} mdSize={20} />
                        Sign Out Dulu
                    </Button>
                </div>
            </PageLayout>

            {/* Border Selector Modal */}
            {
                showBorderSelector && (
                    <BorderSelector onClose={() => setShowBorderSelector(false)} />
                )
            }
        </>
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
