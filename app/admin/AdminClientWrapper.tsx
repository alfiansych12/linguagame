'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { UserMonitor, PromoAndBroadcastHub } from '@/components/admin/AdminComponents';
import { AdvancedAnalytics } from '@/components/admin/AdminCharts';
import { Card, Icon, Badge } from '@/components/ui/UIComponents';
import { useSearchParams, useRouter } from 'next/navigation';

export default function AdminClientWrapper({ users, codes, announcements }: { users: any[], codes: any[], announcements: any[] }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const tab = searchParams.get('tab') || 'dashboard';

    return (
        <AdminLayout activeTab={tab as any}>
            {tab === 'dashboard' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {/* STATS OVERVIEW - High-density tactical row */}
                    <div className="flex flex-row flex-nowrap gap-1.5 md:gap-6 w-full overflow-hidden">
                        <StatCard
                            title="Pulse Count"
                            value={users.length}
                            sub="Active Users"
                            icon="groups"
                            color="text-primary"
                            bg="bg-primary/10"
                        />
                        <StatCard
                            title="Xp Flux"
                            value={users.reduce((acc, u) => acc + (u.total_xp || 0), 0).toLocaleString()}
                            sub="Total XP Generated"
                            icon="bolt"
                            color="text-amber-500"
                            bg="bg-amber-500/10"
                        />
                        <StatCard
                            title="Forge Cycles"
                            value={codes.length}
                            sub="Active Promo Codes"
                            icon="confirmation_number"
                            color="text-purple-500"
                            bg="bg-purple-500/10"
                        />
                        <StatCard
                            title="Broadcasts"
                            value={announcements.length}
                            sub="Signals Sent"
                            icon="campaign"
                            color="text-emerald-500"
                            bg="bg-emerald-500/10"
                        />
                    </div>

                    {/* CHARTS SECTION */}
                    <div className="grid grid-cols-1 gap-8">
                        <AdvancedAnalytics users={users} />
                    </div>

                    {/* RECENT ACTIVITY STREAM */}
                    <Card className="p-8 bg-[#0a0a0f] border-white/5 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-black uppercase italic tracking-tighter">HQ Activity Stream</h3>
                            <Badge variant="primary">LIVE FEED</Badge>
                        </div>
                        <div className="space-y-4">
                            {users.slice(0, 5).map(u => (
                                <div key={u.id} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0 hover:bg-white/[0.01] px-4 -mx-4 rounded-xl transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="size-10 rounded-xl bg-slate-800 flex items-center justify-center border border-white/5">
                                            <Icon name="history" size={16} className="text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-200">User <span className="text-primary">{u.name}</span> active in Mainframe</p>
                                            <p className="text-[9px] text-slate-500 uppercase font-black tracking-widest">{u.total_xp} XP • {u.gems} Gems</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-emerald-500 tracking-widest">Connected</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>
            )}

            {tab === 'users' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <UserMonitor users={users} />
                </div>
            )}

            {tab === 'hub' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-full">
                    <PromoAndBroadcastHub initialCodes={codes} />
                </div>
            )}
        </AdminLayout>
    );
}

function StatCard({ title, value, sub, icon, color, bg }: any) {
    return (
        <Card className="flex-1 min-w-0 p-1.5 md:p-6 bg-[#0a0a0f] border-white/5 hover:border-primary/20 transition-all group overflow-hidden relative">
            <div className="relative z-10 flex flex-col gap-1 md:gap-4">
                <div className={`size-6 md:size-12 ${bg} ${color} rounded-md md:rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner`}>
                    <Icon name={icon} size={12} className="md:size-6" filled />
                </div>
                <div className="overflow-hidden">
                    <h4 className="text-[5px] md:text-[10px] font-black uppercase text-slate-500 tracking-widest leading-none mb-0.5 md:mb-1 truncate">{title}</h4>
                    <p className="text-[10px] md:text-3xl font-black text-white italic tracking-tighter leading-none">{value}</p>
                    <p className="hidden md:block text-[10px] font-bold text-slate-400 mt-2 uppercase truncate">{sub}</p>
                </div>
            </div>
        </Card>
    );
}
