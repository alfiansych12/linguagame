import React from 'react';
import Link from 'next/link';
import { Icon, Card, Badge, Button } from '../ui/UIComponents';
import { useUserStore } from '@/store/user-store';
import { motion } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { useState, useEffect } from 'react';

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

    useEffect(() => {
        setMounted(true);
    }, []);

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
                    <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                        Misi Utama
                    </h2>
                </div>

                <div className="flex items-center gap-2 md:gap-4 bg-white/50 dark:bg-slate-800/50 p-1.5 rounded-2xl border border-white/50 dark:border-slate-700/30 shadow-sm lg:shadow-none lg:bg-transparent lg:border-none">
                    <div className="hidden sm:flex items-center gap-2 mr-2">
                        <Badge variant="streak" icon="local_fire_department" className="bg-white dark:bg-slate-900/60 shadow-sm border-0">
                            {user.currentStreak}
                        </Badge>
                        <Badge variant="xp" icon="bolt" className="bg-white dark:bg-slate-900/60 shadow-sm border-0">
                            {user.totalXp}
                        </Badge>
                        <GemBadge />
                    </div>

                    {isAuthenticated ? (
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
                    ) : (
                        <Link href="/login">
                            <Button size="sm" className="rounded-xl px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-primary text-white hover:bg-primary-dark">
                                Login
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

const GemBadge = () => {
    const gems = useUserStore(state => state.gems);
    return (
        <Badge variant="diamond" icon="diamond" className="bg-white dark:bg-slate-900/60 shadow-sm border-0">
            {gems}
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
            <Link href="/" className="flex items-center gap-3 group mb-16 px-2">
                <div className="size-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 group-hover:rotate-12 transition-transform duration-500">
                    <Icon name="translate" className="text-white" size={28} />
                </div>
                <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                    Lingua<span className="text-primary italic">Game</span>
                </h1>
            </Link>

            <nav className="flex flex-col gap-2">
                <SidebarItem
                    href="/"
                    icon="home"
                    label="Leveling Up"
                    active={activeTab === 'home'}
                />
                <SidebarItem
                    href="/leaderboard"
                    icon="leaderboard"
                    label="Sirkel Board"
                    active={activeTab === 'leaderboard'}
                />
                <SidebarItem
                    href="/profile"
                    icon="person"
                    label="Personal Branding"
                    active={activeTab === 'profile'}
                />
                <SidebarItem
                    href="/duel"
                    icon="groups"
                    label="Sirkel Arena"
                    active={activeTab === 'duel'}
                />
                <SidebarItem
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
                            <p className="text-lg font-black text-slate-900 dark:text-white leading-none">{gems}</p>
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
                                <span className="font-black uppercase tracking-widest text-xs">Join the Sirkel</span>
                            </div>
                        </Button>
                    </Link>
                </div>
            )}

            <div className="mt-auto pt-8">
                {isAuthenticated ? (
                    <div className="p-6 rounded-[2.5rem] bg-gradient-to-br from-primary to-primary-dark text-white shadow-xl shadow-primary/30 overflow-hidden relative group cursor-pointer hover:shadow-2xl transition-all duration-500">
                        <div className="relative z-10">
                            <div className="size-10 rounded-xl bg-white/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Icon name="workspace_premium" size={24} />
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-80 mb-1">DuoPlus</p>
                            <p className="text-base font-black mb-4 leading-tight">Zero Ads, <br />Energy Unlimited!</p>
                            <button className="w-full py-3 bg-white text-primary text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl group-hover:bg-slate-50 transition-colors">
                                Upgrade Now
                            </button>
                        </div>
                        <Icon name="bolt" size={120} className="absolute -bottom-8 -right-8 opacity-10 rotate-12 group-hover:rotate-45 transition-transform duration-1000" filled />
                    </div>
                ) : (
                    <div className="p-6 rounded-[2.5rem] bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
                        <Icon name="info" className="text-slate-400 mb-2" size={24} />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Guest Mode</p>
                        <p className="text-xs font-bold text-slate-400 mt-1 line-clamp-2">Login buat save progress & unlock arena!</p>
                    </div>
                )}

                {isAuthenticated && (
                    <button
                        onClick={() => signOut()}
                        className="w-full mt-4 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-error transition-colors"
                    >
                        <Icon name="logout" size={16} />
                        Logout
                    </button>
                )}
            </div>
        </aside>
    );
};

const SidebarItem = ({ href, icon, label, active }: { href: string; icon: string; label: string; active: boolean }) => (
    <Link
        href={href}
        className={`flex items-center gap-4 px-5 py-4 rounded-[1.5rem] transition-all duration-300 group ${active
            ? 'bg-primary text-white shadow-lg shadow-primary/20'
            : 'text-slate-500 hover:bg-white dark:hover:bg-slate-900/60 hover:text-slate-900 dark:hover:text-slate-200 border border-transparent hover:border-slate-100 dark:hover:border-slate-800'
            }`}
    >
        <Icon name={icon} filled={active} size={26} className={active ? 'scale-110' : 'group-hover:scale-120 group-hover:rotate-3 transition-transform'} />
        <span className={`text-[15px] font-black tracking-tight ${active ? 'opacity-100' : 'opacity-80'}`}>
            {label}
        </span>
    </Link>
);

export const RightSidebar: React.FC<{ user: any }> = ({ user }) => {
    return (
        <aside className="hidden xl:flex flex-col w-80 h-screen sticky top-0 p-10 gap-10 border-l border-slate-200/50 dark:border-slate-800/50 bg-white/20 dark:bg-white/5 transition-all">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Quest Gacor</h3>
                    <button className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">View All</button>
                </div>

                <QuestCard
                    icon="bolt"
                    title="XP Hunter"
                    progress={65}
                    target="50 XP"
                    color="primary"
                />
                <QuestCard
                    icon="local_fire_department"
                    title="Stay Hot"
                    progress={100}
                    target="1 Day"
                    color="orange-500"
                    completed
                />
            </div>

            <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Sirkel Terkece</h3>
                <div className="bg-white/50 dark:bg-slate-900/50 rounded-3xl p-4 border border-slate-200/50 dark:border-slate-800/50">
                    <div className="flex flex-col gap-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center gap-3">
                                <span className={`size-6 rounded-lg flex items-center justify-center text-[10px] font-black ${i === 1 ? 'bg-yellow-400 text-white' : 'text-slate-400'
                                    }`}>{i}</span>
                                <div className="size-8 rounded-full bg-slate-200 dark:bg-slate-800"></div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">User {i}</p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{1000 - i * 100} XP</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </aside>
    );
};

const QuestCard = ({ icon, title, progress, target, color, completed = false }: any) => (
    <div className="bg-white/60 dark:bg-slate-900/40 rounded-3xl p-4 border border-slate-200/50 dark:border-slate-800/50 shadow-sm">
        <div className="flex items-center gap-3 mb-3">
            <div className={`size-10 rounded-xl bg-${color}/10 flex items-center justify-center`}>
                <Icon name={icon} className={`text-${color}`} size={20} filled />
            </div>
            <div className="flex-1">
                <p className="text-xs font-black text-slate-900 dark:text-white">{title}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{target}</p>
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
        <header className="w-full bg-background-light dark:bg-background-dark py-6 px-4 md:px-8 flex justify-center sticky top-0 z-40 backdrop-blur-sm">
            <div className="w-full max-w-5xl flex items-center gap-4 md:gap-8">
                <button
                    onClick={onPause}
                    className="size-12 rounded-2xl bg-white dark:bg-surface-dark shadow-soft-xl border border-slate-100 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-primary transition-all active:scale-95 shrink-0"
                >
                    <Icon name="close" size={24} />
                </button>

                <div className="flex-1 relative h-4">
                    <div className="absolute inset-0 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="w-full h-full bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:24px_24px] animate-[progress_stripe_1s_linear_infinite]"></div>
                        </div>
                    </div>
                </div>

                <div className={`flex items-center gap-3 px-5 py-2.5 rounded-2xl border transition-all shadow-sm shrink-0 ${lives > 6 ? 'bg-success/10 border-success/20 text-success' :
                    lives > 3 ? 'bg-yellow-400/10 border-yellow-400/20 text-yellow-500' :
                        'bg-error/10 border-error/20 text-error animate-pulse-gentle'
                    }`}>
                    <Icon name="bolt" size={20} filled={lives > 0} />
                    <div className="flex flex-col items-start leading-none">
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Energy</span>
                        <span className="font-black text-xl">{lives}/10</span>
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
        <nav className="fixed bottom-0 left-0 right-0 z-[100] lg:hidden px-4 pb-6 pt-2 bg-gradient-to-t from-white/0 via-white/80 to-transparent dark:from-[#0a0a0f]/0 dark:via-[#0a0a0f]/80 dark:to-transparent pointer-events-none mb-safe">
            <div className="max-w-md mx-auto bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl border-2 border-slate-200/50 dark:border-slate-700/50 rounded-[2.5rem] shadow-floating p-1 flex items-center justify-between gap-1 pointer-events-auto">
                <BottomNavItem
                    href="/shop"
                    icon="shopping_basket"
                    label="Forge"
                    active={activeTab === 'shop'}
                />
                <BottomNavItem
                    href="/duel"
                    icon="groups"
                    label="Arena"
                    active={activeTab === 'duel'}
                />
                <BottomNavItem
                    href="/"
                    icon="home"
                    label="Misi"
                    active={activeTab === 'home'}
                />
                <BottomNavItem
                    href="/leaderboard"
                    icon="leaderboard"
                    label="Board"
                    active={activeTab === 'leaderboard'}
                />
                <BottomNavItem
                    href="/profile"
                    icon="person"
                    label="Branding"
                    active={activeTab === 'profile'}
                />
            </div>
        </nav>
    );
};

const BottomNavItem = ({ href, icon, label, active }: { href: string; icon: string; label: string; active: boolean }) => (
    <Link
        href={href}
        className={`flex-1 flex flex-col items-center justify-center gap-1.5 py-3 rounded-[2rem] transition-all duration-300 ${active
            ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105 -translate-y-1'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 active:scale-90'
            }`}
    >
        <div className="relative">
            <Icon name={icon} filled={active} size={24} className={active ? 'scale-110' : ''} />
            {active && (
                <motion.div
                    layoutId="nav-glow"
                    className="absolute inset-0 bg-white/20 blur-lg rounded-full"
                />
            )}
        </div>
        <span className={`text-[8px] font-black uppercase tracking-[0.2em] ${active ? 'opacity-100' : 'opacity-50'}`}>
            {label}
        </span>
    </Link>
);
