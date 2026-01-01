'use client';

import React, { useState, useEffect } from 'react';
import { Card, Button, Icon, Badge } from '../ui/UIComponents';
import { createRedeemCode, broadcastAnnouncement, getRedemptionHistory, getAnnouncements } from '@/app/actions/adminActions';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlertStore } from '@/store/alert-store';

const TEMPLATES: Record<string, { title: string, content: string }> = {
    info: {
        title: "PENGUMUMAN SIRKEL! 📢",
        content: "Dengerin nih sirkel! Ada info penting biar grinding lo makin lancar jaya. Jangan sampe skip instruksi ini kalau gak mau dibilang cupu. Stay savvy! 💅"
    },
    update: {
        title: "META BARU RILIS! 🚀",
        content: "Meta baru sudah rilis sirkel! Ada fitur baru yang bikin progress lo makin gacor. Langsung cobain sekarang sebelum kena nerf sama admin. Letsgooo! ✨"
    },
    reward: {
        title: "REZEKI NOMPLOK! 💎",
        content: "Waduh sirkel, ada rezeki nomplok nih! Cek profil lo sekarang dan masukan kode ini LG26L di kode promo, ada extra crystal buat lo yang rajin grinding. Jangan lupa sikat habis hadiahnya! 🔥"
    }
};

export function PromoAndBroadcastHub({ initialCodes }: { initialCodes: any[] }) {
    const { showAlert } = useAlertStore();
    const [activeSection, setActiveSection] = useState<'promo' | 'broadcast' | 'history'>('promo');
    const [codes, setCodes] = useState(initialCodes);
    const [redemptions, setRedemptions] = useState<any[]>([]);
    const [announcements, setAnnouncements] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Form States
    const [promoForm, setPromoForm] = useState({
        code: '',
        reward_gems: 100,
        reward_xp: 500,
        max_uses: 10,
        expires_at: ''
    });

    const [broadcastForm, setBroadcastForm] = useState({
        title: TEMPLATES.info.title,
        content: TEMPLATES.info.content,
        type: 'info' as 'info' | 'update' | 'reward'
    });

    useEffect(() => {
        if (activeSection === 'history') {
            fetchHistory();
        }
    }, [activeSection]);

    const applyTemplate = (type: 'info' | 'update' | 'reward') => {
        setBroadcastForm({
            ...TEMPLATES[type],
            type
        });
    };

    const fetchHistory = async () => {
        setLoading(true);
        const [redRes, annRes] = await Promise.all([
            getRedemptionHistory(),
            getAnnouncements()
        ]);
        if (redRes.success) setRedemptions(redRes.data || []);
        if (annRes.success) setAnnouncements(annRes.data || []);
        setLoading(false);
    };

    const handlePromoSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await createRedeemCode(promoForm);
        if (res.success) {
            setPromoForm({ code: '', reward_gems: 100, reward_xp: 500, max_uses: 10, expires_at: '' });
            showAlert({
                title: 'Artifact Forged! 🛠️',
                message: `Artifact ${promoForm.code} berhasil dibuat sirkel! Siap-siap diledakkan ke user.`,
                type: 'success'
            });
        } else {
            showAlert({
                title: 'Forge Failed! ❌',
                message: res.error,
                type: 'error'
            });
        }
        setLoading(false);
    };

    const handleBroadcastSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await broadcastAnnouncement(broadcastForm);
        if (res.success) {
            showAlert({
                title: 'Signal Sent! 📡',
                message: 'All users notified sirkel! Signal kamu sudah terkirim ke Mainframe sirkel.',
                type: 'success'
            });
            if (activeSection === 'history') fetchHistory();
        } else {
            showAlert({
                title: 'Transmission Error! 🛰️',
                message: res.error,
                type: 'error'
            });
        }
        setLoading(false);
    };

    return (
        <div className="space-y-8 h-full flex flex-col pb-20">
            {/* HUB HEADER & NAV */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black uppercase italic tracking-tighter">Command Hub</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Forge signals and promo artifacts</p>
                </div>

                <div className="flex bg-[#0a0a0f] border border-white/5 p-1 rounded-2xl">
                    <HubNavBtn
                        active={activeSection === 'promo'}
                        onClick={() => setActiveSection('promo')}
                        icon="confirmation_number"
                        label="Forge"
                    />
                    <HubNavBtn
                        active={activeSection === 'broadcast'}
                        onClick={() => setActiveSection('broadcast')}
                        icon="campaign"
                        label="Signal"
                    />
                    <HubNavBtn
                        active={activeSection === 'history'}
                        onClick={() => setActiveSection('history')}
                        icon="history"
                        label="Logs"
                    />
                </div>
            </div>

            <div className="flex-1">
                <AnimatePresence mode="wait">
                    {activeSection === 'promo' && (
                        <motion.div
                            key="promo"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                        >
                            <Card className="lg:col-span-1 p-8 bg-[#0a0a0f] border-white/5 space-y-6">
                                <div className="space-y-1">
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-primary">Artifact Forge</h3>
                                    <p className="text-[10px] uppercase font-black text-slate-500">Create new redeem artifacts</p>
                                </div>
                                <form onSubmit={handlePromoSubmit} className="space-y-4">
                                    <FormInput
                                        label="Artifact Code"
                                        value={promoForm.code}
                                        onChange={(v: string) => setPromoForm({ ...promoForm, code: v })}
                                        placeholder="EX: SIRKELPOWER"
                                    />
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormInput
                                            label="Gems"
                                            type="number"
                                            value={promoForm.reward_gems}
                                            onChange={(v: string) => setPromoForm({ ...promoForm, reward_gems: parseInt(v) || 0 })}
                                        />
                                        <FormInput
                                            label="XP"
                                            type="number"
                                            value={promoForm.reward_xp}
                                            onChange={(v: string) => setPromoForm({ ...promoForm, reward_xp: parseInt(v) || 0 })}
                                        />
                                    </div>
                                    <FormInput
                                        label="Stock / Max Uses"
                                        type="number"
                                        value={promoForm.max_uses}
                                        onChange={(v: string) => setPromoForm({ ...promoForm, max_uses: parseInt(v) || 1 })}
                                    />
                                    <Button variant="primary" fullWidth loading={loading} className="mt-4 py-4 uppercase italic font-black shadow-lg shadow-primary/20">
                                        Ignite Artifact
                                    </Button>
                                </form>
                            </Card>

                            <div className="lg:col-span-2 space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                <h4 className="text-xs font-black uppercase text-slate-500 tracking-widest px-2">Active Artifacts</h4>
                                {initialCodes.map(code => (
                                    <Card key={code.id} className="p-4 bg-[#0a0a0f]/40 border-white/5 flex items-center justify-between group hover:border-primary/30 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                                <Icon name="confirmation_number" className="text-primary" size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-black text-lg uppercase italic text-white tracking-tight">{code.code}</h4>
                                                <div className="flex gap-4 mt-1">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">{code.current_uses}/{code.max_uses} Redeemed</span>
                                                    <span className="text-[10px] font-bold text-emerald-500 uppercase">{code.reward_gems} Gems</span>
                                                    <span className="text-[10px] font-bold text-blue-500 uppercase">{code.reward_xp} XP</span>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant={code.current_uses >= code.max_uses ? 'xp' : 'primary'}>
                                            {code.current_uses >= code.max_uses ? 'DEPLETED' : 'STABLE'}
                                        </Badge>
                                    </Card>
                                ))}
                                {initialCodes.length === 0 && <div className="p-12 text-center opacity-30 italic">No artifacts forged yet</div>}
                            </div>
                        </motion.div>
                    )}

                    {activeSection === 'broadcast' && (
                        <motion.div
                            key="broadcast"
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.98 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-12"
                        >
                            {/* FORM COLUMN */}
                            <Card className="p-8 bg-[#0a0a0f] border-white/5 space-y-8">
                                <div>
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-emerald-500">Signal Transmitter</h3>
                                    <p className="text-[10px] uppercase font-black text-slate-500">Broadcast meta signals</p>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex gap-2">
                                        {(['info', 'update', 'reward'] as const).map(t => (
                                            <button
                                                key={t}
                                                type="button"
                                                onClick={() => applyTemplate(t)}
                                                className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${broadcastForm.type === t ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-[#06060a] border border-white/5 text-slate-500 hover:text-slate-300'}`}
                                            >
                                                {t}
                                            </button>
                                        ))}
                                    </div>

                                    <form onSubmit={handleBroadcastSubmit} className="space-y-4">
                                        <FormInput
                                            label="Signal Headline"
                                            value={broadcastForm.title}
                                            onChange={(v: string) => setBroadcastForm({ ...broadcastForm, title: v })}
                                            placeholder="Headline..."
                                        />
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Signal Body</label>
                                            <textarea
                                                rows={4}
                                                required
                                                className="w-full bg-[#06060a] border border-white/10 rounded-2xl px-5 py-4 font-bold text-white focus:border-primary/50 transition-all outline-none"
                                                value={broadcastForm.content}
                                                onChange={e => setBroadcastForm({ ...broadcastForm, content: e.target.value })}
                                                placeholder="Transmission..."
                                            />
                                        </div>
                                        <Button variant="primary" fullWidth loading={loading} size="lg" className="h-14 rounded-2xl font-black text-sm italic uppercase tracking-tighter shadow-2xl shadow-primary/30 mt-4">
                                            <Icon name="sensors" className="mr-3" />
                                            Live Broadcast
                                        </Button>
                                    </form>
                                </div>
                            </Card>

                            {/* PREVIEW COLUMN */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 px-2">
                                    <div className="size-2 bg-emerald-500 rounded-full animate-ping" />
                                    <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 italic">Live Signal Preview</h4>
                                </div>

                                <div className="relative">
                                    {/* Mock Notification Panel */}
                                    <Card className="p-0 overflow-hidden border-primary/20 bg-[#0a0a0f] shadow-2xl max-w-sm mx-auto">
                                        <div className="p-4 bg-primary/5 border-b border-white/5 flex items-center gap-3">
                                            <Icon name="notifications" className="text-primary" size={18} filled />
                                            <h5 className="font-black text-xs uppercase italic tracking-tighter">Sirkel Notification</h5>
                                        </div>
                                        <div className="p-6 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <Badge variant={broadcastForm.type === 'reward' ? 'diamond' : broadcastForm.type === 'update' ? 'xp' : 'primary'}>
                                                    {broadcastForm.type}
                                                </Badge>
                                                <span className="text-[8px] font-bold text-slate-500 uppercase">JUST NOW</span>
                                            </div>
                                            <h4 className="font-black text-base uppercase italic tracking-tight leading-none text-white">{broadcastForm.title || 'Headline...'}</h4>
                                            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
                                                {broadcastForm.content || 'Transmission body will appear here...'}
                                            </p>
                                        </div>
                                        <div className="px-6 py-4 bg-white/5 border-t border-white/5 text-center">
                                            <p className="text-[8px] font-bold text-slate-600 uppercase tracking-[0.2em]">Preview Generated at Headquarters</p>
                                        </div>
                                    </Card>

                                    {/* Floating Element Decoration */}
                                    <div className="absolute -z-10 -bottom-10 -right-10 size-40 bg-primary/10 blur-[60px] rounded-full" />
                                    <div className="absolute -z-10 -top-10 -left-10 size-40 bg-emerald-500/10 blur-[60px] rounded-full" />
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {activeSection === 'history' && (
                        <motion.div
                            key="history"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                        >
                            {/* REDEMPTION LOGS */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 px-2">
                                    <Icon name="receipt_long" size={20} className="text-emerald-500" />
                                    <h4 className="text-sm font-black uppercase tracking-widest text-white italic">Artifact Extraction Logs</h4>
                                </div>
                                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {loading ? (
                                        <div className="p-12 text-center opacity-50 uppercase font-black text-xs">Accessing Mainframe...</div>
                                    ) : redemptions.length === 0 ? (
                                        <div className="p-12 text-center opacity-30 italic">No artifacts extracted yet</div>
                                    ) : redemptions.map((r, i) => (
                                        <Card key={r.id} className="p-4 bg-[#0a0a0f] border-white/5 flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="size-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                                                    <Icon name="person" size={18} className="text-emerald-500" />
                                                </div>
                                                <div>
                                                    <p className="font-black text-xs uppercase italic text-white leading-none">{(r.users as any)?.name || 'Anonymous User'}</p>
                                                    <p className="text-[10px] font-bold text-slate-500 mt-1">Extracted <span className="text-primary font-black">{(r.redeem_codes as any)?.code}</span></p>
                                                </div>
                                            </div>
                                            <span className="text-[8px] font-black text-slate-600 uppercase">
                                                {new Date(r.redeemed_at).toLocaleTimeString()}
                                            </span>
                                        </Card>
                                    ))}
                                </div>
                            </div>

                            {/* SIGNAL LOGS */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 px-2">
                                    <Icon name="history_edu" size={20} className="text-purple-500" />
                                    <h4 className="text-sm font-black uppercase tracking-widest text-white italic">Transmission Archive</h4>
                                </div>
                                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                    {loading ? (
                                        <div className="p-12 text-center opacity-50 uppercase font-black text-xs">Syncing signals...</div>
                                    ) : announcements.length === 0 ? (
                                        <div className="p-12 text-center opacity-30 italic">No signals archived</div>
                                    ) : announcements.map((a, i) => (
                                        <Card key={a.id} className="p-5 bg-[#0a0a0f] border-white/5 space-y-3 group hover:border-purple-500/30 transition-all">
                                            <div className="flex items-center justify-between">
                                                <Badge variant={a.type === 'reward' ? 'diamond' : a.type === 'update' ? 'xp' : 'primary'}>{a.type}</Badge>
                                                <span className="text-[9px] font-bold text-slate-500 uppercase">{new Date(a.created_at).toLocaleDateString()}</span>
                                            </div>
                                            <h5 className="font-black text-sm uppercase italic text-slate-200">{a.title}</h5>
                                            <p className="text-[10px] text-slate-500 line-clamp-2">{a.content}</p>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function HubNavBtn({ active, onClick, icon, label }: any) {
    return (
        <button
            onClick={onClick}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
        >
            <Icon name={icon} filled={active} size={16} />
            <span className="text-[10px] font-black uppercase tracking-widest">{label}</span>
        </button>
    );
}

function FormInput({ label, type = 'text', value, onChange, placeholder }: any) {
    return (
        <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{label}</label>
            <input
                type={type}
                required
                className="w-full bg-[#06060a] border border-white/10 rounded-xl px-4 py-3 font-bold text-white focus:border-primary/50 transition-all outline-none placeholder:text-slate-700"
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder={placeholder}
            />
        </div>
    );
}

export function UserMonitor({ users }: { users: any[] }) {
    const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchTerm.toLowerCase());

        if (!matchesSearch) return false;
        if (activeFilter === 'all') return true;

        const lastActive = u.last_login_at ? new Date(u.last_login_at) : null;
        if (!lastActive) return false;

        const now = new Date();
        const diffInDays = (now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24);

        if (activeFilter === 'today') return diffInDays < 1;
        if (activeFilter === 'week') return diffInDays < 7;
        if (activeFilter === 'month') return diffInDays < 30;

        return true;
    });

    return (
        <div className="space-y-6 md:space-y-10 pb-20">
            {/* RADAR HEADER SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 items-center bg-[#050508] border border-white/5 rounded-3xl md:rounded-[3rem] p-6 md:p-10 relative overflow-hidden">
                {/* Background Decoration */}
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[100px] -z-10" />

                <div className="lg:col-span-2 space-y-4 md:space-y-6">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="size-2 md:size-3 bg-primary rounded-full animate-ping" />
                        <h2 className="text-2xl md:text-4xl font-black uppercase italic tracking-tighter">Global <span className="text-primary">Node Radar</span></h2>
                    </div>
                    <p className="text-slate-400 font-bold max-w-xl text-xs md:text-base leading-relaxed">
                        Sistem deteksi sirkel aktif secara real-time. Memantau distribusi XP, fluktuasi Crystal,
                        dan aktivitas node di seluruh mainframe LinguaGame.
                    </p>

                    <div className="flex flex-wrap gap-3 md:gap-4 pt-2 md:pt-4">
                        <div className="bg-white/5 border border-white/10 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl flex flex-col">
                            <span className="text-[7px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Nodes</span>
                            <span className="text-xl md:text-2xl font-black italic tracking-tighter text-white">{users.length}</span>
                        </div>
                        <div className="bg-white/5 border border-white/10 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl flex flex-col">
                            <span className="text-[7px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Admin Clearance</span>
                            <span className="text-xl md:text-2xl font-black italic tracking-tighter text-primary">
                                {users.filter(u => u.is_admin).length}
                            </span>
                        </div>
                        <div className="bg-white/5 border border-white/10 px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl flex flex-col">
                            <span className="text-[7px] md:text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Flux</span>
                            <span className="text-xl md:text-2xl font-black italic tracking-tighter text-emerald-500">
                                {users.reduce((acc, u) => acc + (u.total_xp || 0), 0).toLocaleString()} XP
                            </span>
                        </div>
                    </div>
                </div>

                {/* VISUAL RADAR ANIMATION */}
                <div className="hidden lg:flex items-center justify-center relative scale-110">
                    <div className="size-48 rounded-full border border-primary/20 relative">
                        <div className="absolute inset-0 rounded-full border border-primary/10 scale-75" />
                        <div className="absolute inset-0 rounded-full border border-primary/5 scale-50" />

                        {/* Radar Sweep */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(0,183,255,0.2)_90deg,transparent_91deg)] rounded-full"
                        />

                        {/* User Dots */}
                        {users.slice(0, 8).map((u, i) => (
                            <motion.div
                                key={u.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: [0, 1, 0] }}
                                transition={{ duration: 2, repeat: Infinity, delay: i * 0.5 }}
                                className="absolute size-2 bg-primary rounded-full shadow-[0_0_10px_#00b7ff]"
                                style={{
                                    top: `${20 + Math.random() * 60}%`,
                                    left: `${20 + Math.random() * 60}%`
                                }}
                            />
                        ))}

                        <div className="absolute inset-0 flex items-center justify-center">
                            <Icon name="radar" size={32} className="text-primary opacity-50" />
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTROLS */}
            <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
                <div className="flex flex-col md:flex-row gap-4 w-full xl:w-auto">
                    <div className="relative w-full md:w-80 group">
                        <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-primary transition-colors">
                            <Icon name="search" size={16} />
                        </div>
                        <input
                            type="text"
                            placeholder="Scan sinyal node..."
                            className="w-full bg-[#0a0a0f] border border-white/5 rounded-xl md:rounded-2xl pl-12 md:pl-14 pr-6 py-3 md:py-4 font-bold text-xs md:text-sm text-white outline-none focus:border-primary/50 transition-all placeholder:text-slate-700"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex bg-[#0a0a0f] border border-white/5 p-1 rounded-xl md:rounded-2xl overflow-x-auto no-scrollbar">
                        {(['all', 'today', 'week', 'month'] as const).map(filter => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`whitespace-nowrap px-3 md:px-4 py-2 md:py-3 rounded-lg md:rounded-xl transition-all text-[7px] md:text-[9px] font-black uppercase tracking-widest ${activeFilter === filter ? 'bg-white/10 text-primary shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                {filter === 'all' ? 'Semua Sinyal' : filter === 'today' ? 'Aktif Hari Ini' : filter === 'week' ? '7H Denyut' : '30H Pantauan'}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex bg-[#0a0a0f] border border-white/5 p-1 rounded-2xl self-end xl:self-auto">
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Icon name="grid_view" size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Kotak</span>
                    </button>
                    <button
                        onClick={() => setViewMode('table')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${viewMode === 'table' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Icon name="reorder" size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Tabel</span>
                    </button>
                </div>
            </div>

            {/* VIEW RENDERER */}
            <AnimatePresence mode="wait">
                {viewMode === 'grid' ? (
                    <motion.div
                        key="grid"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
                    >
                        {filteredUsers.map((user, idx) => (
                            <motion.div
                                key={user.id}
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.05 }}
                            >
                                <Card className="p-6 bg-[#0a0a0f] border-white/5 hover:border-primary/30 transition-all group overflow-hidden relative">
                                    {/* Holographic Border Effect */}
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[40px] rounded-full -z-10 opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="flex items-start gap-5">
                                        <div className="relative shrink-0">
                                            <div className="size-16 rounded-[1.5rem] bg-slate-800 border-2 border-white/10 overflow-hidden relative shadow-2xl">
                                                {user.image ? (
                                                    <img src={user.image} alt={user.name} className="size-full object-cover" />
                                                ) : (
                                                    <div className="size-full flex items-center justify-center font-black text-2xl text-slate-600 bg-gradient-to-br from-slate-900 to-slate-800 uppercase italic">
                                                        {user.name?.[0]}
                                                    </div>
                                                )}
                                            </div>
                                            {user.is_admin && (
                                                <div className="absolute -top-1 -right-1 bg-primary text-white p-1 rounded-lg border-2 border-[#0a0a0f] shadow-lg">
                                                    <Icon name="verified_user" size={12} filled />
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <h4 className="font-black text-lg uppercase italic text-white group-hover:text-primary transition-colors tracking-tight truncate">
                                                        {user.name}
                                                    </h4>
                                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                                        {user.is_admin ? 'Level: Administrator' : 'Level: Standard Node'}
                                                    </p>
                                                </div>
                                                <button className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-600 hover:text-white transition-colors">
                                                    <Icon name="more_vert" size={16} />
                                                </button>
                                            </div>

                                            <div className="mt-4 grid grid-cols-2 gap-4">
                                                <div className="space-y-1">
                                                    <p className="text-xl font-black text-white italic leading-none">{user.total_xp.toLocaleString()}</p>
                                                    <p className="text-[7px] font-black text-slate-600 uppercase tracking-[0.2em]">Flux XP</p>
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-xl font-black text-amber-500 italic leading-none">{user.gems.toLocaleString()}</p>
                                                    <p className="text-[7px] font-black text-slate-600 uppercase tracking-[0.2em]">Crystals</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Footnotes */}
                                    <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <TacticalPulse date={user.last_login_at} />
                                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Status Sinyal</span>
                                            </div>
                                            <TacticalTimeAgo date={user.last_login_at} />
                                        </div>
                                        <div className="flex gap-2">
                                            <button className="px-3 py-1.5 bg-white/5 rounded-lg text-[8px] font-black text-slate-400 hover:text-white uppercase transition-colors">Detil</button>
                                            <button className="px-3 py-1.5 bg-primary/10 rounded-lg text-[8px] font-black text-primary hover:bg-primary hover:text-white uppercase transition-colors">Kontrol</button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        key="table"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="overflow-hidden rounded-[2.5rem] bg-[#0a0a0f] border border-white/5 shadow-2xl"
                    >
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-[#0f0f16]">
                                <tr>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Node / User</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Flux Values</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Last Sync</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Clearance</th>
                                    <th className="px-8 py-6 text-[10px] font-black uppercase text-slate-500 tracking-[0.3em]">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filteredUsers.map(user => (
                                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group text-white">
                                        <td className="px-8 py-6 text-white">
                                            <div className="flex items-center gap-4 text-white">
                                                <div className="size-12 rounded-2xl bg-slate-800 border border-white/10 overflow-hidden relative shadow-inner">
                                                    {user.image ? (
                                                        <img src={user.image} alt={user.name} className="size-full object-cover" />
                                                    ) : (
                                                        <div className="size-full flex items-center justify-center font-black text-slate-600 bg-gradient-to-br from-slate-900 to-slate-800 uppercase italic">
                                                            {user.name?.[0]}
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-black text-base uppercase italic text-white group-hover:text-primary transition-colors tracking-tight">{user.name}</p>
                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex gap-10">
                                                <div>
                                                    <p className="text-xl font-black text-white italic leading-none">{user.total_xp}</p>
                                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">Total XP</p>
                                                </div>
                                                <div>
                                                    <p className="text-xl font-black text-amber-500 italic leading-none">{user.gems}</p>
                                                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">Crystals</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <TacticalTimeAgo date={user.last_login_at} className="text-xs" />
                                            <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mt-1">Sinkronisasi</p>
                                        </td>
                                        <td className="px-8 py-6">
                                            {user.is_admin ? (
                                                <div className="flex items-center gap-2 text-primary">
                                                    <Icon name="verified_user" size={14} filled />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Administrator</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Icon name="person" size={14} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Standard Node</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <button className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:bg-primary/20 hover:text-primary transition-all">
                                                <Icon name="settings" size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {filteredUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-20 text-center opacity-30 italic text-white">No nodes detected in this frequency...</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function TacticalTimeAgo({ date, className = "" }: { date: string | null, className?: string }) {
    const [timeAgo, setTimeAgo] = useState('Syncing...');

    useEffect(() => {
        const update = () => {
            if (!date) {
                setTimeAgo('Sinyal Hilang');
                return;
            }
            const now = new Date();
            const past = new Date(date);
            const diffInMs = now.getTime() - past.getTime();
            const diffInS = Math.floor(diffInMs / 1000);
            const diffInMins = Math.floor(diffInS / 60);
            const diffInHours = Math.floor(diffInMins / 60);
            const diffInDays = Math.floor(diffInHours / 24);

            if (diffInS < 60) setTimeAgo('Aktif Sekarang');
            else if (diffInMins < 60) setTimeAgo(`${diffInMins}m yang lalu`);
            else if (diffInHours < 24) setTimeAgo(`${diffInHours}j yang lalu`);
            else setTimeAgo(`${diffInDays}h yang lalu`);
        };

        update();
        const interval = setInterval(update, 30000);
        return () => clearInterval(interval);
    }, [date]);

    return (
        <span className={`text-[10px] font-bold text-white mt-1 uppercase italic tracking-tighter ${className}`}>
            {timeAgo}
        </span>
    );
}

function TacticalPulse({ date }: { date: string | null }) {
    const [status, setStatus] = useState<'live' | 'recent' | 'offline'>('offline');

    useEffect(() => {
        if (!date) {
            setStatus('offline');
            return;
        }
        const diff = (new Date().getTime() - new Date(date).getTime()) / (1000 * 60);
        if (diff < 5) setStatus('live');
        else if (diff < 60 * 24 * 7) setStatus('recent');
        else setStatus('offline');
    }, [date]);

    return (
        <div className={`size-1.5 rounded-full animate-pulse ${status === 'live' ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' :
            status === 'recent' ? 'bg-amber-500 shadow-[0_0_10px_#f59e0b]' :
                'bg-slate-600'
            }`} />
    );
}

// Keep the old components for backward compatibility/during transition
export function RedeemCodeManager({ existingCodes }: { existingCodes: any[] }) {
    return <PromoAndBroadcastHub initialCodes={existingCodes} />;
}

export function AnnouncementBroadcaster() {
    return null; // Integrated into Hub
}
