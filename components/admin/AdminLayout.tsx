'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon, Button } from '../ui/UIComponents';
import { motion } from 'framer-motion';
import { signOut } from 'next-auth/react';

interface AdminLayoutProps {
    children: React.ReactNode;
    activeTab: 'dashboard' | 'users' | 'hub';
}

export function AdminLayout({ children, activeTab }: AdminLayoutProps) {
    return (
        <div className="min-h-screen bg-[#06060a] text-slate-200 flex flex-col sm:flex-row overflow-x-hidden">
            {/* COMMAND SIDEBAR - Activates for Tablet (>600px) and Desktop */}
            <aside className="hidden sm:flex w-64 md:w-72 bg-[#0a0a0f] border-r border-white/5 flex-col p-6 md:p-8 z-50 sticky top-0 h-screen">
                <div className="flex items-center gap-3 mb-16 px-2">
                    <div className="size-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/30 rotate-3">
                        <Icon name="shield" className="text-white" size={20} filled />
                    </div>
                    <div>
                        <h1 className="text-lg font-black text-white tracking-tighter leading-none">
                            HQ <span className="text-primary italic">Lingua</span>
                        </h1>
                        <p className="text-[8px] font-black uppercase tracking-[0.3em] text-slate-500 mt-1">Admin Control</p>
                    </div>
                </div>

                <nav className="flex flex-col gap-2 flex-1">
                    <AdminNavItem
                        href="/admin"
                        icon="dashboard"
                        label="Ringkasan"
                        active={activeTab === 'dashboard'}
                    />
                    <AdminNavItem
                        href="/admin?tab=users"
                        icon="radar"
                        label="Radar Node"
                        active={activeTab === 'users'}
                    />
                    <AdminNavItem
                        href="/admin?tab=hub"
                        icon="settings_input_component"
                        label="Pusat Komando"
                        active={activeTab === 'hub'}
                    />
                </nav>

                <div className="mt-auto pt-8 border-t border-white/5 space-y-4">
                    <Link href="/">
                        <Button variant="ghost" fullWidth className="justify-start text-slate-400 hover:text-white px-4">
                            <Icon name="arrow_back" size={18} className="mr-3" />
                            Kembali ke App
                        </Button>
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="w-full flex items-center gap-3 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-error transition-colors"
                    >
                        <Icon name="logout" size={16} />
                        Hentikan Sesi Admin
                    </button>
                </div>
            </aside>

            {/* HANDPHONE BOTTOM NAV - Only for small mobile screens (<600px) */}
            <nav className="flex sm:hidden fixed bottom-0 left-0 right-0 bg-[#0a0a0f]/90 backdrop-blur-2xl border-t border-white/10 z-[100] px-4 py-3 items-center justify-around shadow-[0_-20px_40px_rgba(0,0,0,0.5)]">
                <MobileTabItem href="/admin" icon="dashboard" active={activeTab === 'dashboard'} />
                <MobileTabItem href="/admin?tab=users" icon="radar" active={activeTab === 'users'} />
                <MobileTabItem href="/admin?tab=hub" icon="settings_input_component" active={activeTab === 'hub'} />
                <button
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="size-12 rounded-2xl flex items-center justify-center text-slate-500"
                >
                    <Icon name="logout" size={24} />
                </button>
            </nav>

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 min-h-screen overflow-x-hidden bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.05),transparent)]">
                {/* ADMIN HEADER */}
                <header className="h-16 sm:h-20 border-b border-white/5 flex items-center justify-between px-6 md:px-12 backdrop-blur-md sticky top-0 z-40 bg-[#06060a]/50">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="size-2 bg-success rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                        <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">System Secure & Online</p>
                    </div>

                    {/* Mobile Logo Title - For phone users */}
                    <div className="sm:hidden text-center">
                        <h1 className="text-sm font-black text-white tracking-tighter leading-none">
                            HQ <span className="text-primary italic">Lingua</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="hidden sm:block text-right">
                            <p className="text-[10px] font-black uppercase text-slate-500">Node Status</p>
                            <p className="text-xs font-bold text-white uppercase italic">Apex Mainframe</p>
                        </div>
                        <div className="size-8 md:size-10 rounded-lg md:rounded-xl bg-slate-800 border border-white/10 flex items-center justify-center">
                            <Icon name="admin_panel_settings" className="text-primary" size={20} />
                        </div>
                    </div>
                </header>

                <div className="p-4 sm:p-8 md:p-12 max-w-7xl mx-auto pb-32 sm:pb-12">
                    {children}
                </div>
            </main>
        </div>
    );
}

function MobileTabItem({ href, icon, active }: { href: string, icon: string, active: boolean }) {
    return (
        <Link href={href} className="flex-1 flex justify-center">
            <div className={`size-12 rounded-2xl flex items-center justify-center transition-all ${active ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' : 'text-slate-500'}`}>
                <Icon name={icon} size={24} filled={active} />
            </div>
        </Link>
    );
}

function AdminNavItem({ href, icon, label, active }: { href: string; icon: string; label: string; active: boolean }) {
    return (
        <Link href={href}>
            <div className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group relative ${active
                ? 'bg-primary/10 text-white'
                : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                }`}>
                {active && (
                    <motion.div
                        layoutId="active-pill"
                        className="absolute left-0 w-1 h-6 bg-primary rounded-full"
                    />
                )}
                <Icon name={icon} filled={active} size={20} className={active ? 'text-primary' : 'group-hover:translate-x-1 transition-transform'} />
                <span className="text-xs font-black uppercase tracking-widest">{label}</span>
            </div>
        </Link>
    );
}
