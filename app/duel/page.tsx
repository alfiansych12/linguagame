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
            <div className="max-w-7xl mx-auto py-3 sm:py-8 lg:py-12 px-3 sm:px-4 lg:px-6">
                <div className="flex flex-col lg:flex-row lg:gap-12 xl:gap-16 lg:items-start">

                    {/* LEFT SIDE: Arena Header, Player Card & Info Highlights - Responsive */}
                    <div className="lg:w-[42%] lg:sticky lg:top-0 space-y-4 sm:space-y-6 lg:space-y-8 mb-8 sm:mb-10 lg:mb-0">
                        <div className="space-y-2 sm:space-y-3 lg:space-y-4 text-center lg:text-left">
                            <motion.div
                                initial={{ scale: 0, rotate: -20 }}
                                animate={{ scale: 1, rotate: 0 }}
                                className="size-10 sm:size-14 lg:size-20 bg-primary/10 rounded-xl sm:rounded-2xl lg:rounded-3xl flex items-center justify-center mx-auto lg:ml-0 mb-3 sm:mb-4"
                            >
                                <Icon name="groups" size={20} className="sm:size-7 lg:size-12 text-primary" filled />
                            </motion.div>

                            <div className="space-y-1">
                                <h1 className="text-3xl sm:text-5xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">
                                    <span className="text-primary">ARENA</span> DUEL
                                </h1>
                                <p className="text-[9px] sm:text-xs lg:text-lg text-slate-500 font-bold max-w-md mx-auto lg:ml-0 uppercase tracking-widest leading-relaxed">
                                    Buktikan siapa yang paling <span className="text-primary italic">jago bahasa Inggris</span> di sirkel kamu.
                                </p>
                            </div>
                        </div>

                        {/* Player Card - Responsive */}
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                        >
                            <Card className="p-4 sm:p-6 lg:p-8 border border-slate-200 dark:border-slate-700 sm:border-2 sm:border-slate-100 dark:sm:border-slate-800 flex flex-col items-center lg:items-start text-center lg:text-left group hover:border-primary/30 transition-all duration-500 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none group-hover:scale-110 transition-transform">
                                    <Icon name="face" size={60} className="sm:size-20 lg:size-32" />
                                </div>

                                <div className="size-10 sm:size-14 lg:size-20 rounded-lg sm:rounded-xl lg:rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-3 sm:mb-4 lg:mb-6 border-b-2 sm:border-b-4 border-primary">
                                    <Icon name="person" size={20} className="sm:size-7 lg:size-10 text-slate-400 group-hover:text-primary transition-colors" />
                                </div>

                                <AnimatePresence mode="wait">
                                    {isEditingName ? (
                                        <motion.div
                                            key="edit"
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            className="w-full space-y-3 sm:space-y-4"
                                        >
                                            <div>
                                                <label className="text-[7px] sm:text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1.5 sm:mb-2">Nickname Kamu</label>
                                                <input
                                                    type="text"
                                                    value={tempName}
                                                    onChange={(e) => setTempName(e.target.value)}
                                                    className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2 sm:py-3 font-black text-base sm:text-xl lg:text-2xl focus:border-primary outline-none transition-all dark:text-white uppercase"
                                                    onKeyDown={(e) => e.key === 'Enter' && saveName()}
                                                    autoFocus
                                                />
                                            </div>
                                            <Button variant="primary" fullWidth onClick={saveName} className="py-2.5 sm:py-3 h-auto rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-black uppercase italic tracking-widest">
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
                                            <span className="text-[7px] sm:text-[8px] lg:text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block mb-1">Identity</span>
                                            <h2 className="text-xl sm:text-3xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic truncate mb-3 sm:mb-4">{name}</h2>
                                            <Button
                                                variant="ghost"
                                                onClick={() => { setTempName(name); setIsEditingName(true); }}
                                                className="px-0 text-primary font-black uppercase text-[9px] sm:text-[10px] lg:text-xs tracking-widest h-auto hover:bg-transparent hover:underline"
                                            >
                                                Ubah Branding
                                            </Button>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Card>
                        </motion.div>
                    </div>

                    {/* RIGHT SIDE: Actions Only - Responsive */}
                    <div className="flex-1 w-full space-y-4 sm:space-y-6 lg:space-y-10">
                        {/* Single Column Layout - No side-by-side to prevent truncation */}
                        <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:gap-6">
                            {/* Create Room - Responsive */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                <Card className="p-4 sm:p-6 lg:p-8 bg-primary/10 border border-primary/20 sm:border-2 hover:bg-primary/[0.15] transition-all cursor-pointer group h-full flex flex-col justify-center overflow-hidden relative" onClick={handleCreateRoom}>
                                    <div className="absolute -bottom-6 -right-6 text-primary/10 group-hover:scale-125 transition-transform duration-1000">
                                        <Icon name="rocket_launch" size={80} className="sm:size-32 lg:size-48" />
                                    </div>
                                    <div className="space-y-3 sm:space-y-4 lg:space-y-6 relative z-10">
                                        <div className="size-10 sm:size-12 lg:size-16 rounded-xl sm:rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform">
                                            {loading === 'create' ? <Icon name="progress_activity" size={20} className="sm:size-6 lg:size-8 animate-spin" /> : <Icon name="add" size={20} className="sm:size-6 lg:size-8" />}
                                        </div>
                                        <div>
                                            <h3 className="text-lg sm:text-2xl lg:text-4xl font-black text-slate-900 dark:text-white leading-none mb-1.5 sm:mb-2 uppercase italic tracking-tighter">Buat Room</h3>
                                            <p className="text-[9px] sm:text-[10px] lg:text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
                                                Jadilah Host, ajak sirkel kamu mabar adu mekanik bahasa.
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>

                            {/* Join Room - Responsive */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <Card className="p-4 sm:p-6 lg:p-8 border border-slate-200 dark:border-slate-700 sm:border-2 dark:sm:border-slate-800 h-full flex flex-col justify-center gap-4 sm:gap-6 lg:gap-8 overflow-hidden relative">
                                    <div className="space-y-1.5 sm:space-y-2">
                                        <h3 className="text-lg sm:text-2xl lg:text-4xl font-black text-slate-900 dark:text-white leading-none uppercase italic tracking-tighter">Gabung Sirkel</h3>
                                        <p className="text-[9px] sm:text-[10px] lg:text-xs text-slate-500 font-bold uppercase tracking-widest">Input 4 digit kode dari temen kamu.</p>
                                    </div>

                                    <div className="space-y-3 sm:space-y-4">
                                        <input
                                            type="text"
                                            maxLength={4}
                                            value={joinCode}
                                            onChange={(e) => setJoinCode(e.target.value.replace(/[^0-9]/g, ''))}
                                            placeholder="0000"
                                            className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl sm:rounded-2xl px-3 sm:px-4 py-3 sm:py-4 text-center font-black text-xl sm:text-3xl lg:text-5xl tracking-[0.5em] focus:border-primary outline-none transition-all dark:text-white placeholder:opacity-20"
                                        />
                                        <Button
                                            variant="secondary"
                                            fullWidth
                                            loading={loading === 'join'}
                                            disabled={joinCode.length !== 4}
                                            onClick={handleJoinRoom}
                                            className="py-3 sm:py-4 lg:py-6 h-auto rounded-xl sm:rounded-2xl text-[10px] sm:text-xs lg:text-sm font-black uppercase italic tracking-widest"
                                        >
                                            MASUK ARENA!
                                        </Button>
                                    </div>
                                </Card>
                            </motion.div>
                        </div>

                        {/* Error Message */}
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    className="p-3 sm:p-4 bg-error/10 border border-error/20 sm:border-2 rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 sm:gap-3 text-error font-black uppercase text-[9px] sm:text-[10px] tracking-widest"
                                >
                                    <Icon name="error" filled size={16} className="sm:size-5" />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                description="Untuk masuk ke Arena, kamu harus login terlebih dahulu!"
            />
        </PageLayout >
    );
}
