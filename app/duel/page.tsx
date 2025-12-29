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
            setError('Isi nickname kamu dulu biar sirkel tau siapa yang gacor!');
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
            setError(err.message || 'Gagal bikin sirkel. Coba lagi nanti?');
            setLoading(null);
        }
    };

    const handleJoinRoom = async () => {
        if (!isAuthenticated) {
            setIsLoginModalOpen(true);
            return;
        }

        if (!name || name === 'Explorer') {
            setError('Set nickname dulu bang/non!');
            setIsEditingName(true);
            return;
        }

        if (joinCode.length !== 4) {
            setError('Code-nya harus 4 digit ya!');
            return;
        }

        setLoading('join');
        setError(null);
        try {
            const { room, player } = await joinDuelRoom(joinCode, name);
            sessionStorage.setItem(`duel_player_${room.code}`, player.id);
            router.push(`/duel/${room.code}`);
        } catch (err: any) {
            setError(err.message || 'Room gak ketemu atau sudah mulai. Cek kodenya lagi!');
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
            <div className="max-w-4xl mx-auto py-8 md:py-20 px-4">
                <div className="text-center mb-12 space-y-4">
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="size-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6"
                    >
                        <Icon name="groups" size={48} className="text-primary" filled />
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">
                        SIRKEL <span className="text-primary">ARENA</span>
                    </h1>
                    <p className="text-lg md:text-xl text-slate-500 font-bold">
                        Invite your sirkel and prove who's the real <span className="text-primary italic">Linguist Sepuh.</span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* User Profile / Name Card */}
                    <motion.div
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="p-8 h-full border-2 border-slate-100 dark:border-slate-800 flex flex-col items-center text-center">
                            <div className="size-24 rounded-[2rem] bg-slate-50 dark:bg-slate-800 flex items-center justify-center mb-6 border-b-4 border-primary">
                                <Icon name="person" size={56} className="text-slate-300 dark:text-slate-500" />
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
                                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Set Your Nickname</label>
                                            <input
                                                type="text"
                                                value={tempName}
                                                onChange={(e) => setTempName(e.target.value)}
                                                placeholder="e.g. Anak Jaksel"
                                                className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-center font-black text-xl focus:border-primary outline-none transition-all dark:text-white"
                                                onKeyDown={(e) => e.key === 'Enter' && saveName()}
                                                autoFocus
                                            />
                                        </div>
                                        <Button variant="primary" fullWidth onClick={saveName} className="py-4">
                                            Slay This Name
                                        </Button>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="display"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="w-full space-y-6"
                                    >
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">Playing As</span>
                                            <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{name}</h2>
                                        </div>
                                        <Button variant="ghost" fullWidth onClick={() => { setTempName(name); setIsEditingName(true); }} className="py-2 text-primary font-black uppercase text-xs tracking-widest">
                                            Change Name
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
                        className="space-y-4"
                    >
                        {/* Create Room */}
                        <Card className="p-8 border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors cursor-pointer group" onClick={handleCreateRoom}>
                            <div className="flex items-center gap-6">
                                <div className="size-16 rounded-2xl bg-primary text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                    {loading === 'create' ? <Icon name="progress_activity" className="animate-spin" /> : <Icon name="add" size={32} />}
                                </div>
                                <div className="text-left">
                                    <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1 uppercase italic">Create Sirkel</h3>
                                    <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Invite up to 5 friends</p>
                                </div>
                            </div>
                        </Card>

                        {/* Join Room */}
                        <Card className="p-8 border-2 border-slate-100 dark:border-slate-800">
                            <div className="space-y-6">
                                <div className="flex items-center gap-6">
                                    <div className="size-16 rounded-2xl bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-100 dark:border-slate-700 flex items-center justify-center">
                                        <Icon name="tag" size={32} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="text-2xl font-black text-slate-900 dark:text-white leading-none mb-1 uppercase italic">Join Sirkel</h3>
                                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Enter the 4-digit code</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <input
                                        type="text"
                                        maxLength={4}
                                        value={joinCode}
                                        onChange={(e) => setJoinCode(e.target.value.replace(/[^0-9]/g, ''))}
                                        placeholder="0000"
                                        className="w-full bg-slate-50 dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl px-6 py-4 text-center font-black text-3xl tracking-[1em] pl-[1.5em] focus:border-primary outline-none transition-all dark:text-white"
                                    />
                                    <Button
                                        variant="secondary"
                                        fullWidth
                                        loading={loading === 'join'}
                                        disabled={joinCode.length !== 4}
                                        onClick={handleJoinRoom}
                                        className="py-5"
                                    >
                                        HOP IN!
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
                        <h4 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-widest">60s Clash</h4>
                        <p className="text-slate-400 text-sm font-bold">Literally 1 menit buat adu mekanik. Who's faster?</p>
                    </div>
                    <div className="text-center space-y-3">
                        <div className="inline-flex size-12 bg-amber-500/10 text-amber-500 rounded-xl items-center justify-center">
                            <Icon name="emoji_events" size={24} />
                        </div>
                        <h4 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-widest">Bonus Crystals</h4>
                        <p className="text-slate-400 text-sm font-bold">Juara 1 dapet crystals lebih buat jajan di Forge.</p>
                    </div>
                    <div className="text-center space-y-3">
                        <div className="inline-flex size-12 bg-emerald-500/10 text-emerald-500 rounded-xl items-center justify-center">
                            <Icon name="shuffle" size={24} />
                        </div>
                        <h4 className="font-black text-slate-900 dark:text-white uppercase text-xs tracking-widest">Random Bank</h4>
                        <p className="text-slate-400 text-sm font-bold">Soal auto random dari library vocab kita.</p>
                    </div>
                </div>
            </div>
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                description="Masuk ke Arena harus login dulu bang. Biar kita tau siapa yang beneran sepuh!"
            />
        </PageLayout>
    );
}
