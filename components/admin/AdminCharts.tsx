'use client';

import React, { useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ArcElement,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Card, Icon } from '../ui/UIComponents';
import { motion, AnimatePresence } from 'framer-motion';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    ArcElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

export function AdvancedAnalytics({ users }: { users: any[] }) {
    const [chartMode, setChartMode] = useState<'engagement' | 'growth' | 'distribution' | 'wealth'>('engagement');
    const [timeframe, setTimeframe] = useState<'today' | 'week' | 'month' | 'year'>('month');
    const [isModeMenuOpen, setIsModeMenuOpen] = useState(false);
    const [isTimeMenuOpen, setIsTimeMenuOpen] = useState(false);

    // REAL TIME DATA CALCULATIONS
    const now = new Date();
    const getDaysAgo = (days: number) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const activeToday = users.filter(u => u.last_login_at && new Date(u.last_login_at) > getDaysAgo(1)).length;
    const active7d = users.filter(u => u.last_login_at && new Date(u.last_login_at) > getDaysAgo(7)).length;
    const active30d = users.filter(u => u.last_login_at && new Date(u.last_login_at) > getDaysAgo(30)).length;
    const activeYear = users.filter(u => u.last_login_at && new Date(u.last_login_at) > getDaysAgo(365)).length;

    const newUsers = users.filter(u => u.created_at && new Date(u.created_at) > getDaysAgo(7)).length;
    const adminNodes = users.filter(u => u.is_admin).length;

    // REAL DATA GROUPING LOGIC
    const getTimeframeLabels = () => {
        if (timeframe === 'today') return Array.from({ length: 12 }, (_, i) => `${i * 2}:00`);
        if (timeframe === 'week') return ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
        if (timeframe === 'month') return ['Mgg 1', 'Mgg 2', 'Mgg 3', 'Mgg 4'];
        return ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    };

    const processData = (type: 'last_login_at' | 'created_at') => {
        const labels = getTimeframeLabels();
        const data = new Array(labels.length).fill(0);

        users.forEach(u => {
            const dateStr = u[type];
            if (!dateStr) return;
            const date = new Date(dateStr);
            const diffDays = (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24);

            if (timeframe === 'today' && diffDays <= 1) {
                const hour = date.getHours();
                const bucket = Math.floor(hour / 2);
                if (data[bucket] !== undefined) data[bucket]++;
            } else if (timeframe === 'week' && diffDays <= 7) {
                const day = date.getDay();
                const mappedDay = day === 0 ? 6 : day - 1;
                if (data[mappedDay] !== undefined) data[mappedDay]++;
            } else if (timeframe === 'month' && diffDays <= 31) {
                const dayOfMonth = date.getDate();
                const bucket = Math.min(Math.floor((dayOfMonth - 1) / 8), 3);
                if (data[bucket] !== undefined) data[bucket]++;
            } else if (timeframe === 'year' && diffDays <= 365) {
                const month = date.getMonth();
                if (data[month] !== undefined) data[month]++;
            }
        });
        return data;
    };

    const performanceData = {
        labels: getTimeframeLabels(),
        datasets: [
            {
                label: 'Aktivitas Sirkel',
                data: processData('last_login_at'),
                borderColor: '#00b7ff',
                borderWidth: 4,
                pointBackgroundColor: '#fff',
                fill: true,
                backgroundColor: (context: any) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, 'rgba(0, 183, 255, 0.3)');
                    gradient.addColorStop(1, 'rgba(0, 183, 255, 0)');
                    return gradient;
                },
                tension: 0.4,
            }
        ]
    };

    const growthData = {
        labels: getTimeframeLabels(),
        datasets: [
            {
                label: 'Node Baru Bergabung',
                data: processData('created_at'),
                backgroundColor: 'rgba(168, 85, 247, 0.4)',
                borderColor: '#a855f7',
                borderWidth: 2,
                borderRadius: 8,
            }
        ]
    };

    const wealthData = {
        labels: users.slice(0, 10).map(u => u.name?.split(' ')[0] || 'Node'),
        datasets: [
            {
                label: 'Kekayaan (Gems)',
                data: users.slice(0, 10).map(u => u.gems),
                backgroundColor: 'rgba(245, 158, 11, 0.4)',
                borderColor: '#f59e0b',
                borderWidth: 2,
                borderRadius: 8,
            }
        ]
    };

    const options: any = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: '#050508',
                padding: 12,
                titleFont: { size: 12, weight: 'black' },
                bodyFont: { size: 10, weight: 'bold' },
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)'
            }
        },
        scales: {
            y: {
                grid: { color: 'rgba(255,255,255,0.03)', drawBorder: false },
                ticks: { color: '#475569', font: { size: 10, weight: 'bold' } }
            },
            x: {
                grid: { display: false },
                ticks: { color: '#475569', font: { size: 10, weight: 'bold' } }
            }
        }
    };

    return (
        <Card className="p-10 bg-[#050508] border-white/5 relative overflow-hidden">
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-10 mb-12">
                <div className="space-y-4 md:space-y-6">
                    <div>
                        <div className="flex items-center gap-2 md:gap-3 text-primary mb-2 md:mb-3">
                            <Icon name="analytics" size={18} />
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em] md:tracking-[0.4em]">Intelijen Quantum</span>
                        </div>
                        <h3 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter text-white">Performa <span className="text-primary">Sistem</span></h3>
                    </div>

                    <div className="flex flex-wrap gap-4 md:gap-8">
                        <QuickStat label="Aktif Hari Ini" value={activeToday} color="text-emerald-500" />
                        <QuickStat label="User Baru" value={newUsers} color="text-blue-500" />
                        <QuickStat label="Admin Core" value={adminNodes} color="text-primary" />
                        <QuickStat label="30H Denyut" value={active30d} color="text-amber-500" />
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    {/* TIMEFRAME DROPDOWN */}
                    <div className="relative w-full xl:w-auto">
                        <button
                            onClick={() => { setIsTimeMenuOpen(!isTimeMenuOpen); setIsModeMenuOpen(false); }}
                            className="flex items-center gap-3 md:gap-4 bg-[#0a0a0f] border border-white/10 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl hover:border-primary/50 transition-all w-full md:min-w-[180px] justify-between"
                        >
                            <div className="flex items-center gap-2 md:gap-3">
                                <Icon name="event" size={16} className="text-emerald-500" />
                                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white">
                                    {timeframe === 'today' ? 'Hari Ini' : timeframe === 'week' ? '7 Hari' : timeframe === 'month' ? '30 Hari' : '1 Tahun'}
                                </span>
                            </div>
                            <Icon name="expand_more" size={14} className={`text-slate-500 transition-transform ${isTimeMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isTimeMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full right-0 mt-3 w-48 bg-[#0a0a0f] border border-white/10 p-2 rounded-2xl shadow-2xl z-[101] backdrop-blur-xl"
                                >
                                    {(['today', 'week', 'month', 'year'] as const).map(t => (
                                        <button
                                            key={t}
                                            onClick={() => { setTimeframe(t); setIsTimeMenuOpen(false); }}
                                            className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors ${timeframe === t ? 'bg-emerald-500/10 text-emerald-500' : 'text-slate-400 hover:bg-white/5'}`}
                                        >
                                            {t === 'today' ? 'Hari Ini' : t === 'week' ? '7 Hari' : t === 'month' ? '30 Hari' : '1 Tahun'}
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* MODE DROPDOWN */}
                    <div className="relative w-full xl:w-auto">
                        <button
                            onClick={() => { setIsModeMenuOpen(!isModeMenuOpen); setIsTimeMenuOpen(false); }}
                            className="flex items-center gap-3 md:gap-4 bg-[#0a0a0f] border border-white/10 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl hover:border-primary/50 transition-all w-full md:min-w-[220px] justify-between group"
                        >
                            <div className="flex items-center gap-2 md:gap-3">
                                <Icon name="insert_chart" size={16} className="text-primary" />
                                <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white">
                                    {chartMode === 'engagement' ? 'Kecepatan Denyut' : chartMode === 'growth' ? 'Perekrutan' : chartMode === 'distribution' ? 'Tingkatan Node' : 'Inti Kekayaan'}
                                </span>
                            </div>
                            <Icon name="expand_more" size={14} className={`text-slate-500 transition-transform ${isModeMenuOpen ? 'rotate-180' : ''}`} />
                        </button>

                        <AnimatePresence>
                            {isModeMenuOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                    className="absolute top-full right-0 mt-3 w-64 bg-[#0a0a0f] border border-white/10 p-2 rounded-2xl shadow-2xl z-[100] backdrop-blur-xl"
                                >
                                    <ModeOption
                                        active={chartMode === 'engagement'}
                                        onClick={() => { setChartMode('engagement'); setIsModeMenuOpen(false); }}
                                        label="Kecepatan Denyut" sub="Tren keterlibatan user" icon="show_chart"
                                    />
                                    <ModeOption
                                        active={chartMode === 'growth'}
                                        onClick={() => { setChartMode('growth'); setIsModeMenuOpen(false); }}
                                        label="Perekrutan" sub="Akuisisi user baru" icon="bar_chart"
                                    />
                                    <ModeOption
                                        active={chartMode === 'distribution'}
                                        onClick={() => { setChartMode('distribution'); setIsModeMenuOpen(false); }}
                                        label="Tingkatan Node" sub="Distribusi rank & XP" icon="pie_chart"
                                    />
                                    <ModeOption
                                        active={chartMode === 'wealth'}
                                        onClick={() => { setChartMode('wealth'); setIsModeMenuOpen(false); }}
                                        label="Inti Kekayaan" sub="Analisis ekonomi Crystal" icon="toll"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <div className="h-[250px] md:h-[400px] w-full relative">
                <AnimatePresence mode="wait">
                    <motion.div key={`${chartMode}-${timeframe}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full w-full">
                        {chartMode === 'engagement' && <Line data={performanceData} options={options} />}
                        {chartMode === 'growth' && <Bar data={growthData} options={options} />}
                        {chartMode === 'wealth' && <Bar data={wealthData} options={options} />}
                        {chartMode === 'distribution' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10 h-full items-center">
                                <XpDistributionChart users={users} hideCard />
                                <div className="space-y-3 md:space-y-4 text-center lg:text-left">
                                    <h4 className="text-lg md:text-xl font-black italic uppercase tracking-tighter">Distribusi Node</h4>
                                    <p className="text-slate-500 text-[10px] md:text-xs font-bold leading-relaxed max-w-md mx-auto lg:mx-0">
                                        Analisis penyebaran user berdasarkan akumulasi XP dalam mainframe.
                                        <span className="text-primary text-xs md:text-sm"> Sepuh</span> node merepresentasikan user paling loyal.
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 md:gap-3 pt-2 md:pt-4">
                                        <div className="p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/5">
                                            <p className="text-[7px] md:text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">Efisiensi Real-time</p>
                                            <p className="text-lg md:text-xl font-black text-white italic">{Math.round((activeToday / users.length) * 100)}%</p>
                                        </div>
                                        <div className="p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl border border-white/5">
                                            <p className="text-[7px] md:text-[8px] font-black uppercase text-slate-500 tracking-widest mb-1">Indeks Pertumbuhan</p>
                                            <p className="text-lg md:text-xl font-black text-primary italic">+{Math.round((newUsers / users.length) * 100)}%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </Card>
    );
}

function QuickStat({ label, value, color }: { label: string, value: number, color: string }) {
    return (
        <div className="flex flex-col gap-0.5 md:gap-1">
            <p className="text-[7px] md:text-[9px] font-black uppercase text-slate-600 tracking-widest">{label}</p>
            <p className={`text-2xl md:text-4xl font-black italic tracking-tighter ${color}`}>{value}</p>
        </div>
    );
}

function ModeOption({ active, onClick, label, sub, icon }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all ${active ? 'bg-primary/10 text-primary' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
        >
            <div className={`size-10 rounded-lg flex items-center justify-center ${active ? 'bg-primary text-white' : 'bg-white/5'}`}>
                <Icon name={icon} size={18} />
            </div>
            <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-widest leading-none">{label}</p>
                <p className="text-[8px] font-bold text-slate-500 uppercase mt-1 tracking-wider">{sub}</p>
            </div>
        </button>
    );
}

export function XpDistributionChart({ users, hideCard = false }: { users: any[], hideCard?: boolean }) {
    const chartData = {
        labels: ['Sipit', 'Penjelajah', 'Grinder', 'Sepuh'],
        datasets: [
            {
                data: [
                    users.filter(u => u.total_xp < 1000).length,
                    users.filter(u => u.total_xp >= 1000 && u.total_xp < 5000).length,
                    users.filter(u => u.total_xp >= 5000 && u.total_xp < 15000).length,
                    users.filter(u => u.total_xp >= 15000).length,
                ],
                backgroundColor: [
                    'rgba(148, 163, 184, 0.4)',
                    'rgba(59, 130, 246, 0.6)',
                    'rgba(168, 85, 247, 0.6)',
                    'rgba(245, 158, 11, 0.8)',
                ],
                borderColor: 'rgba(255,255,255,0.05)',
                borderWidth: 4,
                hoverOffset: 30,
                spacing: 10,
                borderRadius: 15
            }
        ]
    };

    const content = (
        <div className="h-[300px] w-full flex items-center justify-center">
            <Doughnut
                data={chartData}
                options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'right' as any,
                            labels: {
                                color: '#94a3b8', boxWidth: 12, font: { size: 11, weight: 'bold' }, padding: 20
                            }
                        }
                    },
                    cutout: '75%',
                }}
            />
        </div>
    );

    if (hideCard) return content;

    return (
        <Card className="p-8 bg-[#0a0a0f] border-white/5 h-full">
            <h3 className="text-xl font-black uppercase italic tracking-tighter mb-1">Radar Peringkat</h3>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-8">Distribusi Tingkatan User</p>
            {content}
        </Card>
    );
}

export function UserGrowthChart({ data }: { data: any[] }) {
    return <AdvancedAnalytics users={data} />;
}
