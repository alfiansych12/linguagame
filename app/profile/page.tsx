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
import { redeemPromoCode } from '@/app/actions/userActions';

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

        try {
            // First try as Admin Promo Code
            const promoResult = await redeemPromoCode(refCodeInput);
            if (promoResult.success) {
                showAlert({
                    title: 'Mantap Sirkel! 💎',
                    message: promoResult.message || 'Kode berhasil di-redeem!',
                    type: 'success'
                });
                setRefCodeInput('');
                syncWithDb(session?.user?.id || ''); // Refresh gems/stats
                setLoadingRef(false);
                return;
            }

            // If not found or failed, try as Referral Code
            const result = await applyReferralCode(refCodeInput);

            if (result.success) {
                showAlert({
                    title: 'Literally Gacor! ✨',
                    message: result.message || 'Referral berhasil diaplikasikan!',
                    type: 'crystal'
                });
                setRefCodeInput('');
            } else {
                showAlert({
                    title: 'Wait sirkel...',
                    message: result.message || promoResult.error || 'Kode tidak valid.',
                    type: 'error'
                });
            }
        } catch (err) {
            showAlert({ title: 'Error', message: 'Terjadi kesalahan sistem.', type: 'error' });
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

        const userId = useUserStore.getState().userId || '';
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
                <div className="flex flex-col lg:flex-row lg:gap-12 xl:gap-16 lg:items-start max-w-7xl mx-auto">

                    {/* LEFT SIDE: Profile Branding & Settings - Responsive */}
                    <div className="lg:w-[38%] lg:sticky lg:top-0 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4 sm:space-y-6 lg:space-y-8">

                        {/* Avatar Section - Responsive */}
                        <div className="relative group">
                            <div className="relative">
                                <AvatarFrame
                                    src={image || session?.user?.image}
                                    alt={name}
                                    size="2xl"
                                    borderId={
                                        name?.toLowerCase().includes('admin') || session?.user?.email?.toLowerCase().includes('admin')
                                            ? 'gold_champion'
                                            : (equippedBorder || 'default')
                                    }
                                    fallbackInitial={name?.charAt(0) || '?'}
                                />
                                <label className="absolute inset-0 z-30 cursor-pointer rounded-full overflow-hidden opacity-0 hover:opacity-100 transition-opacity">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoUpload}
                                        className="hidden"
                                    />
                                    <div className="size-full bg-primary/40 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                                        <Icon name="photo_camera" size={20} className="sm:size-6 lg:size-8" />
                                        <span className="text-[7px] sm:text-[8px] lg:text-[10px] font-black uppercase mt-1">Upload</span>
                                    </div>
                                </label>
                            </div>

                            <button
                                onClick={() => setIsEditingName(true)}
                                className="absolute bottom-1 -right-1 size-8 sm:size-10 lg:size-12 bg-white dark:bg-slate-800 text-primary rounded-lg sm:rounded-xl border-2 sm:border-4 border-slate-100 dark:border-slate-700 flex items-center justify-center shadow-lg hover:scale-110 transition-all z-40"
                            >
                                <Icon name="edit" size={12} className="sm:size-4 lg:size-5" />
                            </button>

                            <Button
                                variant="primary"
                                size="sm"
                                onClick={() => setShowBorderSelector(true)}
                                className="absolute -top-3 -right-6 rotate-12 shadow-lg shadow-primary/20 bg-primary z-40 py-1 h-auto text-[7px] sm:text-[8px] lg:text-xs px-2 sm:px-3"
                            >
                                <Icon name="palette" size={8} className="sm:size-2.5 lg:size-3 mr-1" />
                                Border
                            </Button>
                        </div>

                        {/* Name & Level Section - Responsive */}
                        <div className="w-full space-y-3 sm:space-y-4">
                            {isEditingName ? (
                                <div className="flex flex-col items-center lg:items-start gap-3 sm:gap-4">
                                    <input
                                        type="text"
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        className="text-xl sm:text-3xl lg:text-4xl font-black bg-transparent border-b-2 sm:border-b-4 border-primary outline-none text-slate-900 dark:text-white uppercase italic tracking-tighter w-full"
                                        autoFocus
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                setName(tempName);
                                                setIsEditingName(false);
                                            }
                                        }}
                                    />
                                    <div className="flex gap-2">
                                        <Button variant="primary" size="sm" className="rounded-lg sm:rounded-xl px-3 sm:px-4 text-[9px] sm:text-xs" onClick={async () => {
                                            await setName(tempName);
                                            setIsEditingName(false);
                                        }}>Save</Button>
                                        <Button variant="ghost" size="sm" className="rounded-lg sm:rounded-xl px-3 sm:px-4 text-[9px] sm:text-xs" onClick={() => {
                                            setTempName(name);
                                            setIsEditingName(false);
                                        }}>Cancel</Button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-1">
                                        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">
                                            {name || 'Explorer'}
                                        </h2>
                                        <p className="text-slate-500 dark:text-slate-400 font-bold text-[9px] sm:text-[10px] lg:text-xs uppercase tracking-widest flex items-center justify-center lg:justify-start gap-2">
                                            Member since 2025 <span className="size-1 rounded-full bg-slate-400"></span> LVL {currentLevel}
                                        </p>
                                    </div>

                                    <div className="space-y-1.5 sm:space-y-2 max-w-sm mx-auto lg:mx-0">
                                        <div className="flex justify-between text-[8px] sm:text-[9px] lg:text-[10px] font-black uppercase tracking-widest text-slate-400">
                                            <span>Progress</span>
                                            <span>{levelXp}/1000 XP</span>
                                        </div>
                                        <div className="h-2 sm:h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200/50 dark:border-slate-700/50">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${progressToNext}%` }}
                                                className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Action Buttons Linkage - Responsive */}
                        <div className="w-full flex flex-col gap-2 max-w-sm">
                            <Button variant="primary" fullWidth className="py-2.5 sm:py-3 h-auto rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] lg:text-xs font-black uppercase tracking-widest" onClick={() => setIsEditingName(true)}>
                                <Icon name="settings" size={12} className="mr-2 sm:size-3.5 lg:size-4" />
                                Edit Branding
                            </Button>
                            <Button
                                variant="ghost"
                                fullWidth
                                className="py-2.5 sm:py-3 h-auto rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] lg:text-xs font-black uppercase tracking-widest border border-primary/10 sm:border-2 text-primary hover:bg-primary/5"
                                onClick={() => window.open('https://linguagame-handbook.vercel.app', '_blank')}
                            >
                                <Icon name="menu_book" size={12} className="mr-2 sm:size-3.5 lg:size-4" />
                                User Handbook
                            </Button>
                            <Button
                                variant="ghost"
                                fullWidth
                                className="text-slate-400 hover:text-error hover:bg-error/5 py-2.5 sm:py-3 h-auto rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] lg:text-xs font-black uppercase tracking-widest border border-slate-200/50 dark:border-slate-800/50"
                                onClick={() => signOut({ callbackUrl: '/' })}
                            >
                                <Icon name="logout" size={12} className="mr-2 sm:size-3.5 lg:size-4" />
                                Sign Out sirkel
                            </Button>

                            {/* ADMIN DASHBOARD BUTTON */}
                            {session?.user?.isAdmin && (
                                <Link href="/admin" className="w-full">
                                    <Button
                                        variant="primary"
                                        fullWidth
                                        className="py-4 sm:py-5 lg:py-6 h-auto rounded-2xl sm:rounded-3xl text-xs sm:text-sm font-black uppercase italic tracking-tighter bg-slate-900 border-none hover:bg-black shadow-xl shadow-slate-900/20 mt-3 sm:mt-4"
                                    >
                                        <Icon name="shield" size={16} className="mr-2 sm:mr-3 sm:size-5" filled />
                                        Admin Dashboard
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* RIGHT SIDE: Stats, Referral & Achievements - Responsive */}
                    <div className="flex-1 w-full space-y-6 sm:space-y-8 lg:space-y-10 mt-8 sm:mt-12 lg:mt-0">
                        {/* Stats Summary - Responsive Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                            {stats.map((stat) => (
                                <Card key={stat.label} className="p-2 sm:p-3 lg:p-5 flex flex-col items-center text-center hover:shadow-floating transition-all border-b-2 border-transparent hover:border-primary">
                                    <div className={`size-7 sm:size-10 lg:size-12 ${stat.bg} ${stat.color} rounded-lg sm:rounded-xl flex items-center justify-center mb-1.5 sm:mb-2`}>
                                        <Icon name={stat.icon} size={14} className="sm:size-5 lg:size-6" filled />
                                    </div>
                                    <div className="text-base sm:text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-none mb-0.5">
                                        {stat.value}
                                    </div>
                                    <div className="text-[6px] sm:text-[8px] lg:text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                        {stat.label}
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Referral Section Card - Responsive */}
                        <div className="space-y-3 sm:space-y-4">
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                <Card className="flex-1 p-4 sm:p-5 lg:p-6 bg-gradient-to-br from-primary/10 to-purple-500/10 border-primary/20 relative overflow-hidden group">
                                    <div className="relative z-10 space-y-3 sm:space-y-4">
                                        <div>
                                            <h4 className="text-xs sm:text-sm lg:text-lg font-black text-slate-900 dark:text-white uppercase italic">Sirkel Invite</h4>
                                            <p className="text-[8px] sm:text-[9px] lg:text-xs text-slate-500">Ajak mabar, bonus Crystal menanti!</p>
                                        </div>
                                        <div className="bg-white dark:bg-slate-900 border border-primary/30 sm:border-2 p-2 sm:p-3 rounded-lg sm:rounded-xl flex items-center justify-between">
                                            <span className="text-base sm:text-xl lg:text-2xl font-black tracking-widest text-primary">{referralCode || 'GACORE'}</span>
                                            <Button variant="ghost" size="sm" onClick={() => {
                                                navigator.clipboard.writeText(referralCode || 'GACORE');
                                                showAlert({ title: 'Copied! ✨', message: 'Sikat sirkel!', type: 'info', autoClose: 2000 });
                                            }}>
                                                <Icon name="content_copy" size={14} className="sm:size-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>

                                <Card className="flex-1 p-4 sm:p-5 lg:p-6 border-slate-200 dark:border-slate-800 space-y-3 sm:space-y-4">
                                    <h4 className="font-black text-slate-900 dark:text-white uppercase italic text-[9px] sm:text-[10px] lg:text-xs">Milestones</h4>
                                    <div className="space-y-3 sm:space-y-4">
                                        <MilestoneItem target={1} current={referralCount} reward="500 Crystals" claimed={claimedMilestones.includes('1_referral')} />
                                        <MilestoneItem target={3} current={referralCount} reward="1000 Crystals" claimed={claimedMilestones.includes('3_referrals')} />
                                    </div>
                                </Card>
                            </div>

                            <Card className="p-4 sm:p-5 bg-slate-900 text-white flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                                <div className="flex items-center gap-3 sm:gap-4 flex-1">
                                    <div className="size-9 sm:size-10 rounded-lg sm:rounded-xl bg-primary/20 flex items-center justify-center shrink-0">
                                        <Icon name="confirmation_number" size={18} className="sm:size-5 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs sm:text-sm font-black uppercase italic">Punya Kode Promo?</h4>
                                        <p className="text-[8px] sm:text-[9px] text-slate-400 font-bold">Instan Crystal buat sirkel gacor.</p>
                                    </div>
                                </div>
                                <div className="flex w-full sm:w-auto gap-2">
                                    <input
                                        type="text"
                                        placeholder="KODE..."
                                        value={refCodeInput}
                                        onChange={(e) => setRefCodeInput(e.target.value.toUpperCase())}
                                        className="bg-white/10 border border-white/5 sm:border-2 rounded-lg sm:rounded-xl px-3 sm:px-4 py-1.5 sm:py-2 text-[10px] sm:text-xs font-black text-white focus:outline-none focus:border-primary/50 flex-1 sm:w-28 lg:w-32"
                                    />
                                    <Button variant="primary" size="sm" className="rounded-lg sm:rounded-xl font-black italic shadow-lg text-[9px] sm:text-xs px-3 sm:px-4" loading={loadingRef} onClick={handleApplyReferral}>GAS</Button>
                                </div>
                            </Card>
                        </div>

                        {/* Achievements Grid - Responsive */}
                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base sm:text-xl lg:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic">Recent Achievements</h3>
                                <Link href="/profile/achievements" className="text-primary font-black text-[8px] sm:text-[9px] lg:text-xs uppercase tracking-widest flex items-center gap-1 hover:underline">
                                    SEE ALL <Icon name="arrow_forward" size={10} className="sm:size-3" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                                {ACHIEVEMENTS.slice(0, 4).map((ach) => {
                                    const isUnlocked = unlockedAchievements.includes(ach.id);
                                    let currentVal = 0;
                                    switch (ach.type) {
                                        case 'xp': currentVal = totalXp; break;
                                        case 'vocab': currentVal = vocabCount; break;
                                        case 'streak': currentVal = currentStreak; break;
                                        case 'wins': currentVal = duelWins; break;
                                    }
                                    const progress = Math.min(100, (currentVal / ach.target) * 100);
                                    return <AchievementItem key={ach.id} icon={ach.icon} title={ach.title} desc={ach.desc} progress={progress} unlocked={isUnlocked} reward={ach.reward} />;
                                })}
                            </div>
                        </div>
                    </div>
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
        <div className="space-y-1.5 sm:space-y-2">
            <div className="flex items-center justify-between text-[9px] sm:text-[10px] lg:text-xs font-black uppercase tracking-widest">
                <span className={claimed ? 'text-emerald-500' : 'text-slate-400'}>{reward}</span>
                <span className="text-slate-900 dark:text-white font-black">{current}/{target}</span>
            </div>
            <div className="w-full h-1.5 sm:h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-1000 ${claimed ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-primary'}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
            {claimed && <p className="text-[7px] sm:text-[8px] font-black text-emerald-500 uppercase tracking-widest">Literally Claimed!</p>}
        </div>
    );
}

function AchievementItem({ icon, title, desc, progress, unlocked = false, reward }: {
    icon: string, title: string, desc: string, progress: number, unlocked?: boolean, reward: number
}) {
    return (
        <Card className={`p-2 sm:p-3 lg:p-4 flex items-center gap-2 sm:gap-3 lg:gap-4 transition-all hover:scale-[1.02] ${!unlocked ? 'opacity-60 grayscale' : 'border-l-2 sm:border-l-4 border-l-yellow-400'}`}>
            <div className={`size-9 sm:size-12 lg:size-14 rounded-lg sm:rounded-xl lg:rounded-2xl flex items-center justify-center shrink-0 ${unlocked ? 'bg-yellow-50 text-yellow-500' : 'bg-slate-100 text-slate-400'
                }`}>
                <Icon name={icon} size={18} className="sm:size-6 lg:size-8" filled={unlocked} />
            </div>
            <div className="flex-1 min-w-0 text-left">
                <div className="flex justify-between items-start">
                    <h4 className="font-bold text-[10px] sm:text-xs lg:text-base text-slate-900 dark:text-white truncate">{title}</h4>
                    <div className="flex items-center gap-0.5 sm:gap-1 bg-primary/10 px-1 sm:px-1.5 py-0.5 rounded-md sm:rounded-lg">
                        <Icon name="diamond" size={8} className="sm:size-2.5 text-primary" filled />
                        <span className="text-[7px] sm:text-[8px] font-black text-primary">{reward}</span>
                    </div>
                </div>
                <p className="text-[8px] sm:text-[9px] lg:text-xs text-slate-400 truncate mb-1 lg:mb-2">{desc}</p>
                <div className="w-full h-1 sm:h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className={`h-full ${unlocked ? 'bg-yellow-500' : 'bg-primary'}`}
                    />
                </div>
            </div>
            {unlocked && (
                <div className="size-5 sm:size-6 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg">
                    <Icon name="check" size={12} className="sm:size-4" />
                </div>
            )}
        </Card>
    );
}
