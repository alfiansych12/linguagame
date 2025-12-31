'use client';

import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, Icon, Button } from '@/components/ui/UIComponents';
import { useUserStore } from '@/store/user-store';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { createDuelRoom, joinDuelRoom } from '@/lib/db/duel';
import { useSession } from 'next-auth/react';
import { LoginModal } from '@/components/ui/LoginModal';
import { useEffect } from 'react';

export default function DuelLobby() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { name, setName } = useUserStore();
    const [joinCode, setJoinCode] = useState('');
    const [loading, setLoading] = useState<'create' | 'join' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isEditingName, setIsEditingName] = useState(false);
    const [tempName, setTempName] = useState(name);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const isAuthenticated = status === 'authenticated';

    // Update name from session if available
    useEffect(() => {
        if (session?.user?.name && (!name || name === 'Explorer')) {
            setName(session.user.name);
            setTempName(session.user.name);
        }
    }, [session, name, setName]);

    const handleCreateRoom = async () => {
        if (!isAuthenticated) {
            setIsLoginModalOpen(true);
            return;
        }

        if (!name || name === 'Explorer') {
            setError('Isi nama panggilan kamu terlebih dahulu!');
            setIsEditingName(true);
            return;
        }

        setLoading('create');
        setError(null);
        try {
            const { room, player } = await createDuelRoom(name);
            // We'll store the playerId in local session storage to identify the user in the room
            sessionStorage.setItem(`duel_player_${room.code}`, player.id);
            router.push(`/duel/${room.code}`);
        } catch (err: any) {
            setError(err.message || 'Gagal membuat ruangan. Coba lagi nanti!');
            setLoading(null);
        }
    };

    const handleJoinRoom = async () => {
        if (!isAuthenticated) {
            setIsLoginModalOpen(true);
            return;
        }

        if (!name || name === 'Explorer') {
            setError('Isi nama panggilan terlebih dahulu!');
            setIsEditingName(true);
            return;
        }

        if (joinCode.length !== 4) {
            setError('Kode harus 4 digit!');
            return;
        }

        setLoading('join');
        setError(null);
        try {
            const { room, player } = await joinDuelRoom(joinCode, name);
            sessionStorage.setItem(`duel_player_${room.code}`, player.id);
            router.push(`/duel/${room.code}`);
        } catch (err: any) {
            setError(err.message || 'Ruangan tidak ditemukan atau sudah dimulai. Cek kodenya lagi!');
            setLoading(null);
        }
    };

    const saveName = () => {
        if (tempName.trim()) {
            setName(tempName.trim());
            setIsEditingName(false);
            setError(null);
        }
    };

    return (
        <PageLayout activeTab="duel">
            <div className="max-w-4xl mx-auto py-4 md:py-10 px-4">
                <div className="text-center mb-8 md:mb-12 space-y-3 relative">
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', damping: 15 }}
                        className="size-12 md:size-20 bg-primary/10 rounded-xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-primary/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                        <Icon name="groups" size={24} mdSize={48} className="text-primary relative z-10" filled />
                    </motion.div>
                    <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">
                        <span className="text-primary">ARENA</span> DUEL
                    </h1>
                    <p className="text-xs md:text-xl text-slate-500 font-bold max-w-lg mx-auto">
                        Ajak teman kamu dan buktikan siapa yang paling <span className="text-primary italic">jago bahasa Inggris.</span>
                    </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-2 gap-3 sm:gap-8 relative z-10">
                    {/* User Profile / Name Card */}
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="p-3.5 md:p-8 h-full border-2 border-slate-100 dark:border-slate-800 flex flex-col items-center text-center group hover:border-primary/30 transition-all duration-500 overflow-hidden relative">
                            <div className="absolute -top-10 -right-10 size-20 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all" />

                            <div className="size-14 md:size-24 rounded-xl md:rounded-[2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3 md:mb-6 border-b-2 md:border-b-4 border-primary shadow-inner">
                                <Icon name="person" size={28} mdSize={56} className="text-slate-300 dark:text-slate-500 group-hover:scale-110 transition-transform" />
                            </div>

                            <AnimatePresence mode="wait">
                                {isEditingName ? (
                                    <motion.div
                                        key="edit"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="w-full space-y-2.5 md:space-y-4"
                                    >
                                        <div className="text-center">
                                            <label className="text-[7px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1.5">Nama Panggilan</label>
                                            <input
                                                type="text"
                                                value={tempName}
                                                onChange={(e) => setTempName(e.target.value)}
                                                placeholder="Nama..."
                                                className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl md:rounded-2xl px-3 md:px-6 py-1.5 md:py-4 text-center font-black text-sm md:text-xl focus:border-primary outline-none transition-all dark:text-white"
                                                onKeyDown={(e) => e.key === 'Enter' && saveName()}
                                                autoFocus
                                            />
                                        </div>
                                        <Button variant="primary" fullWidth onClick={saveName} className="py-2 md:py-4 text-[9px] md:text-sm">
                                            Simpan
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="display"
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="w-full space-y-3 md:space-y-6"
                                    >
                                        <div className="min-w-0 overflow-hidden">
                                            <span className="text-[7px] md:text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-0.5">Pemain</span>
                                            <h2 className="text-sm md:text-3xl font-black text-slate-900 dark:text-white tracking-tight truncate px-1">{name}</h2>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            fullWidth
                                            onClick={() => { setTempName(name); setIsEditingName(true); }}
                                            className="py-1 text-primary font-black uppercase text-[7px] md:text-xs tracking-widest h-auto"
                                        >
                                            Ubah
                                        </Button>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </Card>
                    </motion.div>

                    {/* Actions Card */}
                    <motion.div
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-3 sm:space-y-4 h-full flex flex-col"
                    >
                        {/* Create Room */}
                        <Card className="p-3.5 md:p-8 border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-all cursor-pointer group flex-1 flex flex-col justify-center overflow-hidden relative" onClick={handleCreateRoom}>
                            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:rotate-45 transition-transform duration-700">
                                <Icon name="rocket_launch" size={100} />
                            </div>
                            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 relative z-10 text-center md:text-left">
                                <div className="size-9 md:size-16 rounded-xl md:rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform shrink-0">
                                    {loading === 'create' ? <Icon name="progress_activity" className="animate-spin" /> : <Icon name="add" size={20} mdSize={32} />}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-[11px] md:text-2xl font-black text-slate-900 dark:text-white leading-tight mb-0.5 md:mb-1 uppercase italic truncate">Buat Sircel</h3>
                                    <p className="text-[7px] md:text-xs text-slate-500 font-bold uppercase tracking-widest truncate">Ajak Teman</p>
                                </div>
                            </div>
                        </Card>

                        {/* Join Room */}
                        <Card className="p-3.5 md:p-8 border-2 border-slate-100 dark:border-slate-800 flex-1 flex flex-col justify-center overflow-hidden relative">
                            <div className="space-y-3 md:space-y-6">
                                <div className="flex flex-col md:flex-row items-center gap-2 md:gap-6 text-center md:text-left">
                                    <div className="size-9 md:size-16 rounded-xl md:rounded-2xl bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center shrink-0">
                                        <Icon name="tag" size={20} mdSize={32} />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-[11px] md:text-2xl font-black text-slate-900 dark:text-white leading-tight mb-0.5 md:mb-1 uppercase italic truncate">Gabung</h3>
                                        <p className="text-[7px] md:text-xs text-slate-500 font-bold uppercase tracking-widest truncate">Input Kode</p>
                                    </div>
                                </div>

                                <div className="space-y-2.5 md:space-y-4">
                                    <input
                                        type="text"
                                        maxLength={4}
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value.replace(/[^0-9]/g, ''))}
                                        placeholder="0000"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl md:rounded-2xl px-2 md:px-6 py-1.5 md:py-4 text-center font-black text-lg md:text-3xl tracking-[0.2em] md:tracking-[1em] focus:border-primary outline-none transition-all dark:text-white placeholder:opacity-30"
                                    />
                                    <Button
                                        variant="secondary"
                                        fullWidth
                                        loading={loading === 'join'}
                                        disabled={joinCode.length !== 4}
                                        onClick={handleJoinRoom}
                                        className="py-1.5 md:py-5 text-[9px] md:text-sm"
                                    >
                                        GABUNG!
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="mt-8 p-4 bg-error/10 border-2 border-error/20 rounded-2xl flex items-center gap-3 text-error font-bold justify-center"
                        >
                            <Icon name="error" filled size={20} />
                            <span>{error}</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Info Section */}
                <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="text-center space-y-3">
                        <div className="inline-flex size-12 bg-blue-500/10 text-blue-500 rounded-xl items-center justify-center">
                            <Icon name="timer" size={24} />
                        </div>
                        <h4 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-widest">Duel 60 Detik</h4>
                        <p className="text-slate-400 text-sm font-bold">Hanya 1 menit untuk adu cepat. Siapa yang lebih cepat?</p>
                    </div>
                    <div className="text-center space-y-3">
                        <div className="inline-flex size-12 bg-amber-500/10 text-amber-500 rounded-xl items-center justify-center">
                            <Icon name="emoji_events" size={24} />
                        </div>
                        <h4 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-widest">Bonus Kristal</h4>
                        <p className="text-slate-400 text-sm font-bold">Juara 1 mendapat kristal lebih untuk berbelanja di Toko.</p>
                    </div>
                    <div className="text-center space-y-3">
                        <div className="inline-flex size-12 bg-emerald-500/10 text-emerald-500 rounded-xl items-center justify-center">
                            <Icon name="shuffle" size={24} />
                        </div>
                        <h4 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-widest">Soal Acak</h4>
                        <p className="text-slate-400 text-sm font-bold">Soal otomatis acak dari koleksi kosakata kami.</p>
                    </div>
                </div>
            </div>
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                description="Untuk masuk ke Arena, kamu harus login terlebih dahulu!"
            />
        </PageLayout>
    );
}
