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
            const { room, player } = await createDuelRoom(name, session?.user?.id);
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
            const { room, player } = await joinDuelRoom(joinCode, name, session?.user?.id);
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
            <div className="max-w-7xl mx-auto py-6 md:py-12 px-4">
                <div className="flex flex-col lg:flex-row lg:gap-16 lg:items-start">

                    {/* LEFT SIDE: Arena Header & Persona */}
                    <div className="lg:w-[42%] lg:sticky lg:top-0 space-y-8 md:space-y-12 mb-12 lg:mb-0">
                        <div className="space-y-4 text-center lg:text-left">
                            <motion.div
                                initial={{ scale: 0, rotate: -20 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="size-12 md:size-20 bg-primary/10 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto lg:ml-0 mb-4"
                            >
                                <Icon name="groups" size={24} mdSize={48} className="text-primary" filled />
                            </motion.div>

                            <div className="space-y-1">
                                <h1 className="text-4xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">
                                    <span className="text-primary">ARENA</span> DUEL
                                </h1>
                                <p className="text-[10px] md:text-lg text-slate-500 font-bold max-w-md mx-auto lg:ml-0 uppercase tracking-widest leading-relaxed">
                                    Buktikan siapa yang paling <span className="text-primary italic">jago bahasa Inggris</span> di sirkel kamu.
                                </p>
                            </div>
                        </div>

                        {/* Player Card */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="p-4 md:p-8 border-2 border-slate-100 dark:border-slate-800 flex flex-col items-center lg:items-start text-center lg:text-left group hover:border-primary/30 transition-all duration-500 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                                    <Icon name="face" size={80} mdSize={120} />
                                </div>

                                <div className="size-12 md:size-20 rounded-xl md:rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-4 md:mb-6 border-b-4 border-primary">
                                    <Icon name="person" size={24} mdSize={40} className="text-slate-400 group-hover:text-primary transition-colors" />
                                </div>

                                <AnimatePresence mode="wait">
                                    {isEditingName ? (
                                        <motion.div
                                            key="edit"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="w-full space-y-4"
                                        >
                                            <div>
                                                <label className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-2">Nickname Kamu</label>
                                                <input
                                                    type="text"
                                                    value={tempName}
                                                    onChange={(e) => setTempName(e.target.value)}
                                                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 font-black text-lg md:text-2xl focus:border-primary outline-none transition-all dark:text-white uppercase"
                                                    onKeyDown={(e) => e.key === 'Enter' && saveName()}
                                                    autoFocus
                                                />
                                            </div>
                                            <Button variant="primary" fullWidth onClick={saveName} className="py-3 h-auto rounded-xl text-xs font-black uppercase italic tracking-widest">
                                                Simpan Nama
                                            </Button>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="display"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="w-full"
                                        >
                                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Identity</span>
                                            <h2 className="text-2xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic truncate mb-4">{name}</h2>
                                            <Button
                                                variant="ghost"
                                                onClick={() => { setTempName(name); setIsEditingName(true); }}
                                                className="px-0 text-primary font-black uppercase text-[10px] md:text-xs tracking-widest h-auto hover:bg-transparent hover:underline"
                                            >
                                                Ubah Branding
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        </motion.div>
                    </div>

                    {/* RIGHT SIDE: Actions & Features */}
                    <div className="flex-1 w-full space-y-6 md:space-y-10">
                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 md:gap-6">
                            {/* Create Room */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Card className="p-6 md:p-8 bg-primary/10 border-primary/20 hover:bg-primary/[0.15] transition-all cursor-pointer group h-full flex flex-col justify-center overflow-hidden relative" onClick={handleCreateRoom}>
                                    <div className="absolute -bottom-6 -right-6 text-primary/10 group-hover:scale-125 transition-transform duration-1000">
                                        <Icon name="rocket_launch" size={120} mdSize={200} />
                                    </div>
                                    <div className="space-y-4 md:space-y-6 relative z-10">
                                        <div className="size-10 md:size-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                                            {loading === 'create' ? <Icon name="progress_activity" className="animate-spin" /> : <Icon name="add" size={24} mdSize={32} />}
                                        </div>
                                        <div>
                                            <h3 className="text-xl md:text-4xl font-black text-slate-900 dark:text-white leading-none mb-2 uppercase italic tracking-tighter">Buat Room</h3>
                                            <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                                Jadilah Host, ajak sirkel kamu mabar adu mekanik bahasa.
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>

                            {/* Join Room */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Card className="p-6 md:p-8 border-slate-200 dark:border-slate-800 h-full flex flex-col justify-center gap-6 md:gap-8 overflow-hidden relative">
                                    <div className="space-y-2">
                                        <h3 className="text-xl md:text-4xl font-black text-slate-900 dark:text-white leading-none uppercase italic tracking-tighter">Gabung Sirkel</h3>
                                        <p className="text-[10px] md:text-xs text-slate-500 font-bold uppercase tracking-widest">Input 4 digit kode dari temen kamu.</p>
                                    </div>

                                    <div className="space-y-4">
                                        <input
                                            type="text"
                                            maxLength={4}
                                            value={joinCode}
                                            onChange={(e) => setJoinCode(e.target.value.replace(/[^0-9]/g, ''))}
                                            placeholder="0000"
                                            className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-4 py-4 text-center font-black text-2xl md:text-5xl tracking-[0.5em] focus:border-primary outline-none transition-all dark:text-white placeholder:opacity-20"
                                        />
                                        <Button
                                            variant="secondary"
                                            fullWidth
                                            loading={loading === 'join'}
                                            disabled={joinCode.length !== 4}
                                            onClick={handleJoinRoom}
                                            className="py-4 md:py-6 h-auto rounded-2xl text-xs md:text-sm font-black uppercase italic tracking-widest"
                                        >
                                            MASUK ARENA!
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        </div>

                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="p-4 bg-error/10 border-2 border-error/20 rounded-2xl flex items-center justify-center gap-3 text-error font-black uppercase text-[10px] tracking-widest"
                                >
                                    <Icon name="error" filled size={18} />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Info Highlights */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 pt-6">
                            {[
                                { icon: 'timer', color: 'bg-blue-500/10 text-blue-500', title: '60 Detik', desc: 'Adu cepat se-detik pun berharga.' },
                                { icon: 'emoji_events', color: 'bg-amber-500/10 text-amber-500', title: 'Reward Crystal', desc: 'Menang banyak, belanja makin gacor.' },
                                { icon: 'shuffle', color: 'bg-emerald-500/10 text-emerald-500', title: 'Soal Gacor', desc: 'Kosakata diacak biar adil buat semua.' },
                            ].map((info, idx) => (
                                <div key={idx} className="bg-slate-50/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 flex flex-col items-center sm:items-start text-center sm:text-left gap-3">
                                    <div className={`size-10 ${info.color} rounded-xl flex items-center justify-center shrink-0`}>
                                        <Icon name={info.icon} size={20} />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="font-black text-slate-900 dark:text-white uppercase text-[10px] md:text-sm tracking-widest leading-none">{info.title}</h4>
                                        <p className="text-slate-500 text-[9px] md:text-xs font-bold leading-tight">{info.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
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
