'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar, BottomNav, Header, RightSidebar } from './Navigation';
import { OnboardingOverlay } from '../ui/OnboardingOverlay';
import { useUserStore } from '@/store/user-store';
import { useProgressStore } from '@/store/progress-store';
import { useSession } from 'next-auth/react';

interface PageLayoutProps {
    children: React.ReactNode;
    activeTab: 'home' | 'leaderboard' | 'profile' | 'shop' | 'duel';
    user?: {
        name: string;
        image: string;
        totalXp: number;
        currentStreak: number;
    };
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children, activeTab, user: propUser }) => {
    const { totalXp, currentStreak, syncWithDb: syncUser, userId: storeUserId } = useUserStore();
    const { syncWithDb: syncProgress } = useProgressStore();
    const { data: session, status } = useSession();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // AUTO SYNC BRIDGE
    useEffect(() => {
        if (status === 'authenticated' && session?.user?.id && storeUserId !== session.user.id) {
            Promise.all([
                syncUser(session.user.id),
                syncProgress(session.user.id)
            ]);
        }
    }, [session, status, storeUserId, syncUser, syncProgress]);

    const user = propUser || {
        name: 'Alex',
        image: '',
        totalXp,
        currentStreak
    };

    if (!mounted) return null; // Prevent flicker/crash during hydration
    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#06060a] flex justify-center selection:bg-primary/20">
            {/* Main Centered Container */}
            <div className="w-full max-w-[1440px] flex relative">

                {/* Sidebar - Left Column */}
                <Sidebar activeTab={activeTab} />

                {/* Main Content Area - Middle Column */}
                <div className="flex-1 flex flex-col min-w-0 md:px-6 lg:px-8 xl:px-16">
                    {/* Header - Aligned with Content Column */}
                    <Header user={user} />

                    <main className="flex-1 py-4 md:py-8 lg:py-12 pb-32 md:pb-48 lg:pb-16 h-[calc(100vh-80px)] overflow-y-auto hide-scrollbar transition-all duration-500">
                        {/* THE MAIN CARD */}
                        <div className="bg-white/95 dark:bg-slate-900/80 rounded-[2rem] md:rounded-[3rem] lg:rounded-[4rem] shadow-soft-xl border border-slate-200/50 dark:border-white/5 p-4 sm:p-8 md:p-12 lg:p-16 xl:p-20 min-h-full backdrop-blur-xl hover:shadow-glow transition-all duration-700">
                            {children}
                        </div>
                    </main>
                </div>

                {/* Right Sidebar - Right Column (Desktop only) */}
                <RightSidebar user={user} />
            </div>

            {/* Bottom Navigation for Mobile */}
            <BottomNav activeTab={activeTab} />

            {/* Onboarding Tutorial Overlay */}
            <OnboardingOverlay />

            {/* Decorative Background Elements */}
            <div className="fixed top-0 left-0 right-0 bottom-0 -z-10 pointer-events-none opacity-40 overflow-hidden">
                <div className="absolute top-[-10%] left-[-5%] size-[600px] bg-primary/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] right-[-5%] size-[600px] bg-purple-500/5 rounded-full blur-[120px]"></div>
            </div>
        </div>
    );
};
