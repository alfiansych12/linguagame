'use client';

import React, { useState } from 'react';
import { Card, Icon, Button, Badge } from '@/components/ui/UIComponents';
import { motion, AnimatePresence } from 'framer-motion';
import { createDuelMatch, joinDuelMatch, getDailyDuelCount } from '@/app/actions/duelActions';
import { useSession } from 'next-auth/react';
import { LoginModal } from '@/components/ui/LoginModal';
import { useUserStore } from '@/store/user-store';
import Link from 'next/link';

export const DuelLobby: React.FC<{ onJoin: (matchId: string, role: 'HOST' | 'OPPONENT') => void }> = ({ onJoin }) => {
    const { data: session } = useSession();
    const { isPro } = useUserStore();
    const [mode, setMode] = useState<'SELECT' | 'CREATE' | 'JOIN'>('SELECT');
    const [roomCode, setRoomCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [showLimitModal, setShowLimitModal] = useState(false);
    const [dailyCount, setDailyCount] = useState(0);

    const handleCreate = async (gameMode: 'VOCAB' | 'GRAMMAR' | 'SPEED_BLITZ') => {
        if (!session) {
            setIsLoginModalOpen(true);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Check Daily Limit for Free Users
            if (!isPro) {
                const countRes = await getDailyDuelCount();
                if (countRes.success && countRes.count >= 5) {
                    setDailyCount(countRes.count);
                    setShowLimitModal(true);
                    return;
                }
            }

            const result = await createDuelMatch({ gameMode, maxRounds: 10 });
            if (result.success && result.match) {
                onJoin(result.match.id, 'HOST');
            } else {
                setError(result.error || 'Gagal membuat room');
            }
        } catch (err) {
            setError('Terjadi kesalahan koneksi');
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        if (roomCode.length < 6) return;
        setLoading(true);
        setError(null);
        try {
            const result = await joinDuelMatch({ roomCode });
            if (result.success && result.match) {
                onJoin(result.match.id, 'OPPONENT');
            } else {
                setError(result.error || 'Room tidak ditemukan');
            }
        } catch (err) {
            setError('Terjadi kesalahan koneksi');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto py-4 md:py-8 px-4">
            <AnimatePresence mode="wait">
                {mode === 'SELECT' && (
                    <motion.div
                        key="select"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-4 md:space-y-6"
                    >
                        <div className="text-center space-y-1">
                            <h1 className="text-3xl md:text-4xl font-black text-white tracking-tighter uppercase italic">
                                DUEL <span className="text-primary not-italic">ARENA</span>
                            </h1>
                            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Tactical PvP System v3.1</p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={() => setMode('CREATE')}
                                className="group relative p-6 rounded-2xl bg-slate-800/40 border border-slate-700 hover:border-primary transition-all overflow-hidden text-left"
                            >
                                <div className="relative z-10">
                                    <Icon name="add_circle" size={32} className="text-primary mb-2 group-hover:scale-110 transition-transform" />
                                    <h3 className="text-xl font-black text-white uppercase italic">Create Room</h3>
                                    <p className="text-slate-500 text-xs mt-1">Buat arena baru dan tantang temanmu.</p>
                                </div>
                                <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Icon name="swords" size={80} />
                                </div>
                            </button>

                            <button
                                onClick={() => setMode('JOIN')}
                                className="group relative p-6 rounded-2xl bg-slate-800/40 border border-slate-700 hover:border-blue-500 transition-all overflow-hidden text-left"
                            >
                                <div className="relative z-10">
                                    <Icon name="group_add" size={32} className="text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                                    <h3 className="text-xl font-black text-white uppercase italic">Join Battle</h3>
                                    <p className="text-slate-500 text-xs mt-1">Masukkan kode unik untuk menyerbu.</p>
                                </div>
                                <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                                    <Icon name="key" size={80} />
                                </div>
                            </button>
                        </div>
                    </motion.div>
                )}

                {mode === 'CREATE' && (
                    <motion.div
                        key="create"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="sm" onClick={() => setMode('SELECT')}>
                                <Icon name="arrow_back" size={20} />
                            </Button>
                            <h2 className="text-xl font-black text-white uppercase italic">Pilih Mode Duel</h2>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {[
                                { id: 'VOCAB', name: 'Vocabulary', icon: 'translate', colorClass: 'bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20 text-orange-500' },
                                { id: 'GRAMMAR', name: 'Grammar', icon: 'menu_book', colorClass: 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20 text-blue-500' },
                                { id: 'SPEED_BLITZ', name: 'Speed Blitz', icon: 'bolt', colorClass: 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20 text-yellow-500' }
                            ].map((m) => (
                                <button
                                    key={m.id}
                                    disabled={loading}
                                    onClick={() => handleCreate(m.id as any)}
                                    className={`p-5 rounded-2xl border transition-all text-center space-y-2 disabled:opacity-50 ${m.colorClass.split(' ').slice(0, 3).join(' ')}`}
                                >
                                    {loading ? (
                                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white mx-auto"></div>
                                    ) : (
                                        <>
                                            <Icon name={m.icon} size={32} className={m.colorClass.split(' ').pop()} />
                                            <div className="font-black text-sm text-white uppercase">{m.name}</div>
                                        </>
                                    )}
                                </button>
                            ))}
                        </div>

                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-[10px] font-bold text-center uppercase tracking-wider"
                            >
                                {error}
                            </motion.div>
                        )}
                    </motion.div>
                )}

                {mode === 'JOIN' && (
                    <motion.div
                        key="join"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="space-y-4"
                    >
                        <div className="flex items-center gap-3">
                            <Button variant="ghost" size="sm" onClick={() => setMode('SELECT')}>
                                <Icon name="arrow_back" size={20} />
                            </Button>
                            <h2 className="text-xl font-black text-white uppercase italic">Join Battle Arena</h2>
                        </div>

                        <div className="space-y-3">
                            <div className="relative">
                                <input
                                    type="text"
                                    maxLength={6}
                                    placeholder="KODE"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                    className="w-full p-5 bg-slate-800 border-2 border-slate-700 rounded-2xl text-center text-3xl font-black tracking-[0.5rem] placeholder:text-slate-700 focus:border-primary focus:outline-none transition-all uppercase"
                                />
                                {loading && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 rounded-2xl">
                                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-xl text-red-500 text-[10px] font-bold text-center uppercase tracking-wider">
                                    {error}
                                </div>
                            )}

                            <Button
                                fullWidth
                                size="lg"
                                variant="primary"
                                disabled={roomCode.length < 6 || loading}
                                onClick={handleJoin}
                                className="h-16 text-lg font-black uppercase italic"
                            >
                                <Icon name="login" className="mr-2" />
                                MASUK ARENA
                            </Button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Decoration Elements */}
            <div className="mt-8 p-4 rounded-xl bg-slate-800/20 border border-slate-700/30 backdrop-blur-sm">
                <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-[10px] font-bold text-slate-600 tracking-tighter uppercase">
                    <div className="flex items-center gap-1"><Icon name="groups" size={12} /> 249 Active</div>
                    <div className="w-1 h-1 bg-slate-800 rounded-full hidden md:block" />
                    <div className="flex items-center gap-1"><Icon name="workspace_premium" size={12} /> 100 Crystals</div>
                    <div className="w-1 h-1 bg-slate-800 rounded-full hidden md:block" />
                    <div className="flex items-center gap-1 text-green-600/60"><div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Live PvP</div>
                </div>
            </div>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                description="Kamu harus login dulu buat bikin room duel bro!"
            />

            {/* Daily Limit Modal */}
            <AnimatePresence>
                {showLimitModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowLimitModal(false)}
                            className="absolute inset-0 bg-black/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, y: 20, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.9, y: 20, opacity: 0 }}
                            className="relative w-full max-w-md bg-slate-900 border-2 border-primary/30 rounded-3xl p-8 text-center overflow-hidden"
                        >
                            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />

                            <div className="size-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                                <Icon name="lock" size={40} className="text-primary" />
                            </div>

                            <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">
                                LIMIT REACHED
                            </h2>
                            <p className="text-slate-400 font-bold text-sm mb-8 leading-relaxed">
                                Jatah duel harian kamu sudah habis bro! ({dailyCount}/5)<br />
                                <span className="text-primary">Upgrade ke PRO</span> untuk tawuran tanpa batas di Arena.
                            </p>

                            <div className="space-y-3">
                                <Link href="/pro" className="block w-full">
                                    <Button fullWidth variant="primary" size="lg" className="h-14 font-black uppercase italic">
                                        GO QUANTUM PRO
                                    </Button>
                                </Link>
                                <Button fullWidth variant="ghost" onClick={() => setShowLimitModal(false)} className="text-slate-500 font-black uppercase italic">
                                    Maybe Later
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};
