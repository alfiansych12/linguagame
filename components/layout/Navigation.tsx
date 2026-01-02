import React from 'react';
import Link from 'next/link';
import { Icon, Card, Badge, Button } from '../ui/UIComponents';
import { StreakIndicator } from '../ui/StreakIndicator';
import { useUserStore } from '@/store/user-store';
import { motion } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/db/supabase';
import { useSound } from '@/hooks/use-sound';
import { NotificationCenter } from '../ui/NotificationCenter';

interface HeaderProps {
    user: {
        name: string;
        image: string;
        totalXp: number;
        currentStreak: number;
    };
}

export const Header: React.FC<HeaderProps> = ({ user }) => {
    const { data: session, status } = useSession();
    const [mounted, setMounted] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [hasUnread, setHasUnread] = useState(false);

    useEffect(() => {
        setMounted(true);
        checkUnread();
    }, []);

    const checkUnread = async () => {
        const lastSeen = localStorage.getItem('last_seen_announcement');
        const { data } = await supabase
            .from('announcements')
            .select('created_at')
            .order('created_at', { ascending: false })
            .limit(1);

        if (data?.[0]) {
            const latestDate = new Date(data[0].created_at).getTime();
            if (!lastSeen || latestDate > parseInt(lastSeen)) {
                setHasUnread(true);
            }
        }
    };

    const handleOpenNotif = () => {
        setIsNotifOpen(true);
        setHasUnread(false);
        localStorage.setItem('last_seen_announcement', Date.now().toString());
    };

    const isAuthenticated = status === 'authenticated' && mounted;

    return (
        <header className="sticky top-0 z-40 w-full bg-slate-50/80 dark:bg-[#0a0a0f]/80 backdrop-blur-md lg:bg-transparent lg:backdrop-blur-none border-b border-slate-200/50 dark:border-slate-800/50 lg:border-none">
            <div className="w-full px-4 sm:px-6 lg:px-0 h-20 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-3 group lg:hidden">
                    <div className="size-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:rotate-6 transition-transform">
                        <Icon name="translate" className="text-white" size={22} />
                    </div>
                    <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                        Lingua<span className="text-primary italic">Game</span>
                    </h1>
                </Link>

                <div className="hidden lg:block">
                    {/* REDUNDANT TITLE REMOVED FOR CLEANER LOOK */}
                </div>

                <div className="flex items-center gap-2 md:gap-4 bg-white/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-white/50 dark:border-slate-700/30 shadow-sm lg:shadow-none lg:bg-transparent lg:border-none">
                    <div className="hidden sm:flex items-center gap-2 mr-2">
                        <StreakIndicator />
                        <Badge variant="xp" icon="bolt" className="bg-white dark:bg-slate-900/60 shadow-sm border-0">
                            {user.totalXp.toLocaleString('id-ID')}
                        </Badge>
                        <GemBadge />
                    </div>

                    {isAuthenticated ? (
                        <>
                            <button
                                onClick={handleOpenNotif}
                                className="relative size-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors mr-1"
                            >
                                <Icon name="notifications" size={20} className="text-slate-500" />
                                {hasUnread && (
                                    <span className="absolute top-2.5 right-2.5 size-2 bg-error rounded-full ring-2 ring-white dark:ring-slate-800" />
                                )}
                            </button>

                            <Link href="/profile">
                                <div className="size-10 rounded-xl bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-600 shadow-sm overflow-hidden cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all">
                                    {session.user?.image ? (
                                        <img src={session.user.image} alt={session.user.name || ''} className="size-full object-cover" />
                                    ) : (
                                        <div className="size-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700">
                                            <Icon name="person" className="text-slate-400" size={24} />
                                        </div>
                                    )}
                                </div>
                            </Link>
                        </>
                    ) : (
                        <Link href="/login">
                            <Button size="sm" className="rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-primary text-white hover:bg-primary-dark">
                                Login
                            </Button>
                        </Link>
                    )}
                </div>
            </div>

            <NotificationCenter isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
        </header>
    );
};

const GemBadge = () => {
    const gems = useUserStore(state => state.gems);
    return (
        <Badge variant="diamond" icon="diamond" className="bg-white dark:bg-slate-900/60 shadow-sm border-0">
            {gems.toLocaleString('id-ID')}
        </Badge>
    );
};

export const Sidebar: React.FC<{ activeTab: string }> = ({ activeTab }) => {
    const { status } = useSession();
    const gems = useUserStore(state => state.gems);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const isAuthenticated = status === 'authenticated' && mounted;

    return (
        <aside className="hidden lg:flex flex-col w-72 xl:w-80 h-screen sticky top-0 border-r border-slate-200/50 dark:border-slate-800/50 bg-white/40 dark:bg-[#0a0a0f]/40 p-8 z-50 transition-all duration-300">
            <Link href="/" className="flex items-center gap-3 group mb-8 px-2">
                <div className="size-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:rotate-12 transition-transform duration-500">
                    <Icon name="translate" className="text-white" size={28} />
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter notranslate" translate="no">
                    Lingua<span className="text-primary italic">Game</span>
                </h1>
            </Link>

            <nav className="flex flex-col gap-2">
                <SidebarItem
                    id="nav-home"
                    href="/"
                    icon="home"
                    label="Leveling Up"
                    active={activeTab === 'home'}
                />
                <SidebarItem
                    id="nav-leaderboard"
                    href="/leaderboard"
                    icon="leaderboard"
                    label="Bro Board"
                    active={activeTab === 'leaderboard'}
                />
                <SidebarItem
                    id="nav-profile"
                    href="/profile"
                    icon="person"
                    label="Personal Branding"
                    active={activeTab === 'profile'}
                />
                <SidebarItem
                    id="nav-duel"
                    href="/duel"
                    icon="groups"
                    label="Bro Arena"
                    active={activeTab === 'duel'}
                />
                <SidebarItem
                    id="nav-forge"
                    href="/shop"
                    icon="shopping_basket"
                    label="Crystal Forge"
                    active={activeTab === 'shop'}
                />
            </nav>

            {isAuthenticated ? (
                <div className="mt-8 p-4 rounded-3xl bg-blue-500/5 border border-blue-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="size-10 bg-blue-500/10 rounded-xl flex items-center justify-center">
                            <Icon name="diamond" size={20} className="text-blue-500" filled />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 leading-none mb-1">Crystals</p>
                            <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{gems.toLocaleString('id-ID')}</p>
                        </div>
                    </div>
                    <Link href="/shop" className="size-8 rounded-lg bg-blue-500 text-white flex items-center justify-center hover:scale-110 transition-transform">
                        <Icon name="add" size={18} />
                    </Link>
                </div>
            ) : (
                <div className="mt-8">
                    <Link href="/login">
                        <Button className="w-full py-6 rounded-[2rem] border-2 border-primary/20 bg-primary/5 hover:bg-primary text-primary hover:text-white transition-all duration-300 group shadow-lg shadow-primary/10">
                            <div className="flex items-center justify-center gap-3">
                                <Icon name="login" size={24} className="group-hover:translate-x-1 transition-transform" />
                                <span className="font-black uppercase tracking-widest text-xs">Join the Bro</span>
                            </div>
                        </Button>
                    </Link>
                </div>
            )}

            <div className="mt-auto pt-3">
                {isAuthenticated ? (
                    <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-primary-dark text-white shadow-lg shadow-primary/20 overflow-hidden relative group cursor-pointer hover:shadow-xl transition-all duration-500">
                        <div className="relative z-10">
                            <div className="size-6 rounded-lg bg-white/20 flex items-center justify-center mb-1.5 group-hover:scale-110 transition-transform">
                                <Icon name="workspace_premium" size={14} />
                            </div>
                            <p className="text-[7px] font-black uppercase tracking-widest opacity-80 mb-0.5">DuoPlus</p>
                            <p className="text-xs font-black mb-1.5 leading-tight">Zero Ads, Energy Unlimited!</p>
                            <button
                                onClick={() => {
                                    useSound().playSound('CLICK');
                                    // Subscription logic
                                }}
                                className="w-full py-1.5 bg-white text-primary text-[9px] font-black uppercase tracking-widest rounded-lg shadow-lg group-hover:bg-slate-50 transition-colors"
                            >
                                Upgrade Now
                            </button>
                        </div>
                        <Icon name="bolt" size={60} className="absolute -bottom-4 -right-4 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-1000" filled />
                    </div>
                ) : (
                    <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                        <Icon name="info" className="text-slate-400 mb-1.5" size={18} />
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">Guest Mode</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-0.5 line-clamp-2">Login buat save progress & unlock arena!</p>
                    </div>
                )}

                {isAuthenticated && (
                    <button
                        onClick={() => signOut()}
                        className="w-full mt-2 flex items-center justify-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-error transition-colors py-1"
                    >
                        <Icon name="logout" size={14} />
                        Logout
                    </button>
                )}
            </div>
        </aside>
    );
};

const SidebarItem = ({ href, icon, label, active, id }: { href: string; icon: string; label: string; active: boolean; id?: string }) => {
    const { playSound } = useSound();
    return (
        <Link
            id={id}
            href={href}
            onClick={() => playSound('CLICK')}
            className={`flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-300 group ${active
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-slate-500 hover:bg-white dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent hover:border-slate-100 dark:hover:border-slate-800'
                }`}
        >
            <Icon name={icon} filled={active} size={26} className={active ? 'scale-110' : 'group-hover:scale-120 group-hover:rotate-3 transition-transform'} />
            <span className={`text-[15px] font-black tracking-tight notranslate ${active ? 'opacity-100' : 'opacity-80'}`} translate="no">
                {label}
            </span>
        </Link>
    );
};

export const RightSidebar: React.FC<{ user: any }> = ({ user }) => {
    return null;
};

const QuestCard = ({ icon, title, progress, target, color, completed = false }: any) => (
    <div className="bg-white/60 dark:bg-slate-900/40 rounded-3xl p-4 border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
            <div className={`size-10 rounded-xl bg-${color}/10 flex items-center justify-center`}>
                <Icon name={icon} className={`text-${color}`} size={20} filled />
            </div>
            <div className="flex-1">
                <p className="text-xs font-black text-slate-900 dark:text-white notranslate" translate="no">{title}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest notranslate" translate="no">{target}</p>
            </div>
            {completed && <Icon name="check_circle" className="text-success" size={20} filled />}
        </div>
        <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full bg-${color}`} style={{ width: `${progress}%` }}></div>
        </div>
    </div>
);

interface GameHeaderProps {
    progress: number;
    lives: number;
    onPause: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({ progress, lives, onPause }) => {
    return (
        <header className="w-full bg-background-light dark:bg-background-dark py-4 md:py-6 px-4 md:px-8 flex justify-center sticky top-0 z-40 backdrop-blur-sm">
            <div className="w-full max-w-5xl flex items-center gap-4 md:gap-8">
                <button
                    onClick={onPause}
                    className="size-10 md:size-12 rounded-xl md:rounded-2xl bg-white dark:bg-surface-dark shadow-soft-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-95 shrink-0"
                >
                    <Icon name="close" size={20} mdSize={24} />
                </button>

                <div className="flex-1 relative h-3 md:h-4">
                    <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="w-full h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:24px_24px] animate-[progress_stripe_1s_linear_infinite]"></div>
                        </div>
                    </div>
                </div>

                <div className={`flex items-center gap-2 md:gap-3 px-3 md:px-5 py-1.5 md:py-2.5 rounded-xl md:rounded-2xl border transition-all shadow-sm shrink-0 ${lives > 6 ? 'bg-success/10 border-success/20 text-success' :
                    lives > 3 ? 'bg-yellow-400/10 border-yellow-400/20 text-yellow-500' :
                        'bg-error/10 border-error/20 text-error animate-pulse-gentle'
                    }`}>
                    <Icon name="bolt" size={16} mdSize={20} filled={lives > 0} />
                    <div className="flex flex-col items-start leading-none">
                        <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest opacity-70">Energy</span>
                        <span className="font-black text-base md:text-xl">{lives}/10</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

interface BottomNavProps {
    activeTab: 'home' | 'leaderboard' | 'profile' | 'shop' | 'duel';
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab }) => {
    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden px-4 pb-4 pt-4 bg-gradient-to-t from-white via-white/40 to-transparent dark:from-[#0a0a0f] dark:via-[#0a0a0f]/40 dark:to-transparent pointer-events-none">
            <div className="max-w-[440px] mx-auto bg-white/80 dark:bg-slate-900/80 backdrop-blur-3xl border border-white/40 dark:border-slate-800/40 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.2)] p-1.5 flex items-center justify-between gap-1 pointer-events-auto relative">
                <BottomNavItem
                    id="nav-forge"
                    href="/shop"
                    icon="shopping_basket"
                    label="Forge"
                    active={activeTab === 'shop'}
                />
                <BottomNavItem
                    id="nav-duel"
                    href="/duel"
                    icon="groups"
                    label="Arena"
                    active={activeTab === 'duel'}
                />
                <BottomNavItem
                    id="nav-home"
                    href="/"
                    icon="home"
                    label="Misi"
                    active={activeTab === 'home'}
                />
                <BottomNavItem
                    id="nav-leaderboard"
                    href="/leaderboard"
                    icon="leaderboard"
                    label="Leader"
                    active={activeTab === 'leaderboard'}
                />
                <BottomNavItem
                    id="nav-profile"
                    href="/profile"
                    icon="person"
                    label="Profil"
                    active={activeTab === 'profile'}
                />
            </div>
        </nav>
    );
};

const BottomNavItem = ({ href, icon, label, active, id }: { href: string; icon: string; label: string; active: boolean; id: string }) => {
    const { playSound } = useSound();
    return (
        <Link
            id={id}
            href={href}
            onClick={() => playSound('CLICK')}
            className="flex-1 relative flex flex-col items-center justify-center py-2 sm:py-3 transition-all duration-500 group outline-none"
        >
            <div className={`relative z-10 flex flex-col items-center gap-1 transition-all duration-500 ${active ? '-translate-y-1' : 'opacity-60'}`}>
                <div className={`p-2 rounded-2xl transition-all duration-500 ${active ? 'bg-primary text-white shadow-[0_8px_20px_rgba(59,130,246,0.3)]' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'}`}>
                    <Icon name={icon} filled={active} size={22} className={active ? 'scale-110' : 'group-hover:scale-110 transition-transform'} />
                </div>
                <span className={`text-[8px] font-black uppercase tracking-[0.1em] transition-all duration-500 ${active ? 'text-primary' : 'text-slate-400'}`}>
                    {label}
                </span>
            </div>

            {active && (
                <motion.div
                    layoutId="nav-glow-indicator"
                    className="absolute inset-x-2 inset-y-1 bg-primary/5 dark:bg-primary/10 rounded-3xl -z-0"
                    transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                />
            )}

            {active && (
                <motion.div
                    layoutId="nav-dot"
                    className="absolute -bottom-1 size-1 bg-primary rounded-full"
                    transition={{ type: 'spring', bounce: 0.3, duration: 0.6 }}
                />
            )}
        </Link>
    );
};
