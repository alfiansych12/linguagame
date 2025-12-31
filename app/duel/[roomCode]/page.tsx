'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, Icon, Button, Badge, ProgressBar, NoTranslate } from '@/components/ui/UIComponents';
import { useUserStore } from '@/store/user-store';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/db/supabase';
import { setPlayerReady, startDuel, updatePlayerScore, endDuel } from '@/lib/db/duel';
import { VOCABULARY_DATA } from '@/lib/data/vocabulary';
import confetti from 'canvas-confetti';
import { sanitizeDisplayName } from '@/lib/utils/anonymize';
import { useSound } from '@/hooks/use-sound';

interface Player {
    id: string;
    name: string;
    score: number;
    is_ready: boolean;
}

export default function DuelRoomPage() {
    const params = useParams();
    const router = useRouter();
    const roomCode = params.roomCode as string;
    const { name, addGems, inventory, useCrystal } = useUserStore();

    // Internal States
    const [room, setRoom] = useState<any>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
    const [gameState, setGameState] = useState<'WAITING' | 'STARTING' | 'PLAYING' | 'FINISHED'>('WAITING');
    const [countdown, setCountdown] = useState(3);
    const [gameTimer, setGameTimer] = useState(60);
    const [loading, setLoading] = useState(true);
    const { playSound } = useSound();

    // Game Content State
    const [currentQuestion, setCurrentQuestion] = useState<any>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [localScore, setLocalScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);

    // Power-up States
    const [isFrozen, setIsFrozen] = useState(false);
    const [activeBooster, setActiveBooster] = useState(0);
    const [isDivineEyeActive, setIsDivineEyeActive] = useState(0);

    // Refs for real-time
    const channelRef = useRef<any>(null);
    const timerRef = useRef<any>(null);
    const scoreRef = useRef(0);

    useEffect(() => {
        const savedPlayerId = sessionStorage.getItem(`duel_player_${roomCode}`);
        if (!savedPlayerId) {
            router.push('/duel');
            return;
        }
        setCurrentPlayerId(savedPlayerId);

        const initRoom = async () => {
            const { data: roomData, error } = await supabase
                .from('duel_rooms')
                .select('*')
                .eq('code', roomCode)
                .single();

            if (error || !roomData) {
                router.push('/duel');
                return;
            }

            setRoom(roomData);
            setGameState(roomData.status);

            const { data: playerData } = await supabase
                .from('duel_players')
                .select('*')
                .eq('room_id', roomData.id)
                .order('created_at', { ascending: true });

            if (playerData) setPlayers(playerData);
            setLoading(false);

            const channel = supabase.channel(`room:${roomCode}`, {
                config: { broadcast: { self: true } }
            });

            channel
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'duel_players',
                    filter: `room_id=eq.${roomData.id}`
                }, async () => {
                    const { data: updatedPlayers } = await supabase
                        .from('duel_players')
                        .select('*')
                        .eq('room_id', roomData.id)
                        .order('created_at', { ascending: true });
                    if (updatedPlayers) setPlayers(updatedPlayers);
                })
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'duel_rooms',
                    filter: `id=eq.${roomData.id}`
                }, (payload) => {
                    const updatedRoom = payload.new as any;
                    setGameState(updatedRoom.status);
                    setRoom(updatedRoom);
                })
                .on('broadcast', { event: 'score_update' }, (payload) => {
                    const { playerId, score } = payload.payload;
                    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, score } : p));
                })
                .on('broadcast', { event: 'power_up_used' }, (payload) => {
                    const { type, senderId } = payload.payload;
                    if (type === 'freeze' && senderId !== savedPlayerId) {
                        setIsFrozen(true);
                        playSound('WRONG');
                        setTimeout(() => setIsFrozen(false), 3000);
                    }
                })
                .subscribe();

            channelRef.current = channel;
        };

        initRoom();

        return () => {
            if (channelRef.current) supabase.removeChannel(channelRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [roomCode, router, playSound]);

    useEffect(() => {
        if (gameState === 'STARTING') {
            const int = setInterval(() => {
                setCountdown(prev => {
                    if (prev === 3) playSound('START');
                    if (prev <= 1) {
                        clearInterval(int);
                        setGameState('PLAYING');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(int);
        }

        if (gameState === 'PLAYING') {
            generateQuestion();
            const int = setInterval(() => {
                setGameTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(int);
                        handleGameEnd();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            timerRef.current = int;
            return () => clearInterval(int);
        }
    }, [gameState, playSound]);

    const generateQuestion = () => {
        const randomIndex = Math.floor(Math.random() * VOCABULARY_DATA.length);
        const question = VOCABULARY_DATA[randomIndex];
        setCurrentQuestion(question);

        const others = VOCABULARY_DATA
            .filter(w => w.id !== question.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map(w => w.indonesian);

        setOptions([question.indonesian, ...others].sort(() => 0.5 - Math.random()));
    };

    useEffect(() => {
        if (isDivineEyeActive > 0 && currentQuestion && gameState === 'PLAYING' && !isFrozen) {
            const timer = setTimeout(() => {
                handleAnswer(currentQuestion.indonesian);
                setIsDivineEyeActive(prev => prev - 1);
            }, 600);
            return () => clearTimeout(timer);
        }
    }, [isDivineEyeActive, currentQuestion, gameState, isFrozen]);

    const handleAnswer = (answer: string) => {
        if (isFrozen || !currentQuestion) return;

        if (answer === currentQuestion.indonesian) {
            playSound('CORRECT');
            const pointsToAdd = activeBooster > 0 ? 20 : 10;
            if (activeBooster > 0) setActiveBooster(prev => prev - 1);

            const newScore = scoreRef.current + pointsToAdd;
            scoreRef.current = newScore;
            setLocalScore(newScore);
            setCorrectCount(prev => prev + 1);

            setPlayers(prev => prev.map(p => p.id === currentPlayerId ? { ...p, score: newScore } : p));
            channelRef.current.send({
                type: 'broadcast',
                event: 'score_update',
                payload: { playerId: currentPlayerId, score: newScore }
            });

            generateQuestion();
        } else {
            playSound('WRONG');
            generateQuestion();
        }
    };

    const handleUsePowerUp = async (type: 'stasis' | 'divine' | 'overflow') => {
        if (gameState !== 'PLAYING' || isFrozen) return;

        try {
            if (type === 'stasis') {
                const success = await useCrystal('timefreeze');
                if (success) {
                    playSound('SUCCESS');
                    channelRef.current.send({
                        type: 'broadcast',
                        event: 'power_up_used',
                        payload: { type: 'freeze', senderName: name, senderId: currentPlayerId }
                    });
                }
            } else if (type === 'divine') {
                const success = await useCrystal('autocorrect');
                if (success) {
                    playSound('SUCCESS');
                    setIsDivineEyeActive(prev => prev + 3);
                }
            } else if (type === 'overflow') {
                const success = await useCrystal('booster');
                if (success) {
                    playSound('SUCCESS');
                    setActiveBooster(prev => prev + 5);
                }
            }
        } catch (err) {
            console.error('Power-up error:', err);
        }
    };

    const handleGameEnd = async () => {
        setLoading(true);
        if (currentPlayerId) {
            try {
                await updatePlayerScore(currentPlayerId, scoreRef.current);
                await new Promise(r => setTimeout(r, 1500));
                const { data } = await supabase
                    .from('duel_players')
                    .select('*')
                    .eq('room_id', room.id)
                    .order('score', { ascending: false });
                if (data) {
                    setPlayers(data);
                    const winner = data[0];
                    if (winner && winner.id === currentPlayerId) {
                        playSound('SPECIAL_WIN');
                    } else {
                        playSound('SUCCESS');
                    }
                }
            } catch (err) {
                console.error('Final score sync error:', err);
                playSound('SUCCESS');
            }
        }

        setGameState('FINISHED');
        setLoading(false);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
        addGems(50);
    };

    const toggleReady = async () => {
        if (!currentPlayerId) return;
        const p = players.find(p => p.id === currentPlayerId);
        await setPlayerReady(currentPlayerId, !p?.is_ready);
    };

    const startRoomGame = async () => {
        if (room?.id) await startDuel(room.id);
    };

    if (loading) return (
        <PageLayout activeTab="home">
            <div className="h-96 flex items-center justify-center">
                <Icon name="progress_activity" size={48} className="animate-spin text-primary" />
            </div>
        </PageLayout>
    );

    const isHost = players.length > 0 && players[0].id === currentPlayerId;
    const allReady = players.length > 1 && players.every(p => p.is_ready);

    // --- PHASE: PLAYING (Full Screen Header) ---
    if (gameState === 'PLAYING') {
        return (
            <div className="min-h-screen bg-slate-50 dark:bg-[#06060a] flex flex-col overflow-hidden relative selection:bg-primary/30">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-1/4 -left-1/4 size-[100%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
                    <div className="absolute -bottom-1/4 -right-1/4 size-[100%] bg-purple-500/5 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
                </div>

                <header className="relative z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800/50 shadow-sm">
                    <div className="max-w-5xl mx-auto px-4 h-16 md:h-20 flex items-center gap-4">
                        <Button variant="ghost" className="size-10 md:size-12 rounded-xl" onClick={() => router.push('/duel')}>
                            <Icon name="close" size={20} />
                        </Button>

                        <div className="flex-1 flex flex-col gap-1.5">
                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <span className="flex items-center gap-1.5"><Icon name="timer" size={12} /> Time Remaining</span>
                                <span className={`${gameTimer < 10 ? 'text-error animate-pulse' : 'text-slate-600 dark:text-slate-300'} font-black text-xs`}>{gameTimer}s</span>
                            </div>
                            <div className="h-2.5 sm:h-3.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner relative">
                                <motion.div
                                    className={`h-full bg-gradient-to-r ${gameTimer < 10 ? 'from-error to-error-light' : 'from-primary to-primary-light'}`}
                                    initial={{ width: '100%' }}
                                    animate={{ width: `${(gameTimer / 60) * 100}%` }}
                                    transition={{ duration: 1, ease: 'linear' }}
                                />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700/50 px-3 sm:px-6 py-2 sm:py-3 rounded-2xl flex items-center gap-3 shadow-xl">
                            <Icon name="emoji_events" size={20} className="text-primary" filled />
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Score</span>
                                <span className="font-black text-base sm:text-2xl text-slate-900 dark:text-white">{localScore}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 max-w-6xl mx-auto w-full relative z-10">
                    {/* Floating Leaderboard (Desktop) */}
                    <div className="hidden lg:flex fixed left-12 top-1/2 -translate-y-1/2 flex-col gap-3 w-64 bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl p-5 rounded-[2.5rem] border border-white/20 shadow-2xl">
                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 italic mb-2">Live Rankings</h3>
                        <div className="space-y-2">
                            {[...players].sort((a, b) => b.score - a.score).map((p, idx) => (
                                <motion.div
                                    key={p.id}
                                    layout
                                    className={`p-3.5 rounded-2xl border-2 flex items-center justify-between transition-all ${p.id === currentPlayerId ? 'bg-primary border-primary shadow-lg shadow-primary/20 scale-[1.05]' : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm'}`}
                                >
                                    <div className="flex items-center gap-3">
                                        <span className={`text-[10px] font-black ${p.id === currentPlayerId ? 'text-white/60' : 'text-slate-400'}`}>#{idx + 1}</span>
                                        <span className={`text-xs font-bold truncate max-w-[100px] ${p.id === currentPlayerId ? 'text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                            {sanitizeDisplayName(p.name, p.id)}
                                        </span>
                                    </div>
                                    <span className={`text-sm font-black ${p.id === currentPlayerId ? 'text-white' : 'text-primary'}`}>{p.score}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Power-ups Sidebar / Bottom Bar */}
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 lg:left-auto lg:right-12 lg:top-1/2 lg:-translate-y-1/2 z-40 w-[95%] max-w-[400px] lg:w-72 px-2 lg:px-0">
                        <div className="flex flex-row lg:flex-col gap-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl p-2 sm:p-4 rounded-[2rem] sm:rounded-[3rem] border border-white/30 shadow-2xl">
                            <h3 className="hidden lg:block text-xs font-black text-slate-400 uppercase tracking-widest px-3 italic mb-3">Crystals Arsenal</h3>
                            <PowerUpButton
                                icon="ac_unit"
                                label="Stasis"
                                count={inventory.timefreeze || 0}
                                color="blue"
                                onClick={() => handleUsePowerUp('stasis')}
                                disabled={isFrozen || !inventory.timefreeze}
                            />
                            <PowerUpButton
                                icon="visibility"
                                label="Divine"
                                count={inventory.autocorrect || 0}
                                color="purple"
                                onClick={() => handleUsePowerUp('divine')}
                                disabled={isFrozen || !inventory.autocorrect || isDivineEyeActive > 0}
                            />
                            <PowerUpButton
                                icon="bolt"
                                label="Double"
                                count={inventory.booster || 0}
                                color="yellow"
                                onClick={() => handleUsePowerUp('overflow')}
                                disabled={isFrozen || !inventory.booster || activeBooster > 0}
                            />
                        </div>
                    </div>

                    {/* Arena Area */}
                    <div className="w-full max-w-2xl relative">
                        <AnimatePresence>
                            {isFrozen && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 z-50 bg-blue-500/20 backdrop-blur-md rounded-[3rem] sm:rounded-[4rem] flex flex-col items-center justify-center text-center p-8 border-4 border-blue-400 shadow-xl"
                                >
                                    <Icon name="ac_unit" size={64} className="text-white animate-pulse mb-6" />
                                    <h2 className="text-5xl sm:text-7xl font-black text-white italic drop-shadow-lg uppercase">FROZEN!</h2>
                                    <p className="text-sm sm:text-lg font-black text-blue-100 uppercase mt-4 tracking-widest opacity-80">Someone used Stasis on you</p>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="flex flex-col items-center gap-10 sm:gap-14">
                            <div className="flex gap-4">
                                {activeBooster > 0 && (
                                    <Badge variant="streak" icon="bolt" className="px-6 py-2.5 shadow-xl bg-yellow-500 text-white animate-pulse border-none">
                                        SCORE 2X ({activeBooster})
                                    </Badge>
                                )}
                                {isDivineEyeActive > 0 && (
                                    <Badge variant="xp" icon="visibility" className="px-6 py-2.5 shadow-xl bg-purple-600 text-white animate-bounce border-none">
                                        DIVINE EYE ({isDivineEyeActive})
                                    </Badge>
                                )}
                            </div>

                            <div className="w-full text-center space-y-4">
                                <span className="text-xs sm:text-sm font-black text-primary uppercase tracking-[0.4em]">Translate This</span>
                                <motion.h2
                                    key={currentQuestion?.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-4xl sm:text-6xl md:text-8xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-tight"
                                >
                                    <NoTranslate>{currentQuestion?.english}</NoTranslate>
                                </motion.h2>
                                <div className="w-32 h-2 bg-primary/10 rounded-full mx-auto" />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 w-full max-w-4xl">
                                {options.map((opt, i) => (
                                    <Button
                                        key={i}
                                        variant="secondary"
                                        className="h-16 sm:h-26 md:h-36 text-lg sm:text-2xl md:text-3xl font-black rounded-2xl sm:rounded-[3rem] bg-white dark:bg-slate-900 hover:bg-primary hover:text-white hover:scale-[1.03] active:scale-95 border-b-[4px] sm:border-b-[12px] border-slate-200 dark:border-slate-800 active:border-b-0 transition-all uppercase shadow-2xl"
                                        onClick={() => handleAnswer(opt)}
                                        disabled={isFrozen}
                                    >
                                        <NoTranslate>{opt}</NoTranslate>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // --- MAIN RETURN (WAITING, STARTING, FINISHED) ---
    return (
        <PageLayout activeTab="home">
            <div className="max-w-6xl mx-auto px-4 relative z-10">
                {/* LOBBY PHASE */}
                {gameState === 'WAITING' && (
                    <div className="space-y-12">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-10 border-b-2 border-slate-100 dark:border-slate-800 pb-12">
                            <div className="text-center md:text-left space-y-2">
                                <h1 className="text-4xl sm:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                                    Sirkel <span className="text-primary italic">Ready?</span>
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 font-bold text-lg sm:text-xl">Waiting for everyone to lock in.</p>
                            </div>

                            <div className="flex flex-col items-center gap-3 w-full md:w-auto">
                                <div className="bg-slate-900 dark:bg-slate-800 text-white px-8 sm:px-12 py-5 sm:py-7 rounded-[2.5rem] flex items-center gap-6 shadow-2xl border-4 border-white/5">
                                    <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">Code</span>
                                    <span className="text-4xl sm:text-6xl font-black tracking-[0.3em] font-mono text-primary">{roomCode}</span>
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Share with your homies</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6">
                                {players.map((p, idx) => (
                                    <Card key={p.id} className={`p-6 sm:p-10 flex items-center justify-between border-4 ${p.is_ready ? 'border-success/30 bg-success/5' : 'border-slate-100 dark:border-slate-800'}`}>
                                        <div className="flex items-center gap-6">
                                            <div className="size-16 rounded-[1.5rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-2xl text-slate-400">
                                                {idx + 1}
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="font-black text-slate-900 dark:text-white text-xl uppercase italic">
                                                    {sanitizeDisplayName(p.name, p.id)}
                                                </h4>
                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-tighter">
                                                    {p.is_ready ? 'Ready to Slay' : 'Waiting...'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className={`size-12 rounded-full flex items-center justify-center shrink-0 ${p.is_ready ? 'bg-success text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-300'}`}>
                                            <Icon name={p.is_ready ? 'check' : 'hourglass_empty'} size={24} className={p.is_ready ? '' : 'animate-pulse'} />
                                        </div>
                                    </Card>
                                ))}
                                {[...Array(Math.max(0, 5 - players.length))].map((_, i) => (
                                    <div key={i} className="p-10 border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] flex items-center justify-center text-slate-300 dark:text-slate-800 font-black text-xs uppercase tracking-widest italic">
                                        Empty Slot
                                    </div>
                                ))}
                            </div>

                            <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border-2 border-slate-100 dark:border-slate-800 shadow-2xl h-fit space-y-6">
                                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest italic">Lobby Controls</h3>
                                <Button
                                    variant={players.find(p => p.id === currentPlayerId)?.is_ready ? 'secondary' : 'primary'}
                                    fullWidth
                                    className="py-6 h-auto text-xl rounded-[2rem]"
                                    onClick={toggleReady}
                                >
                                    {players.find(p => p.id === currentPlayerId)?.is_ready ? 'I\'m Not Ready' : 'READY!'}
                                </Button>
                                {isHost && (
                                    <Button
                                        variant="success"
                                        fullWidth
                                        className="py-8 h-auto rounded-[2rem] shadow-2xl"
                                        disabled={players.length < 2 || !allReady}
                                        onClick={startRoomGame}
                                    >
                                        <div className="flex flex-col items-center">
                                            <span className="text-2xl font-black italic">START DUEL</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">2+ Players Ready</span>
                                        </div>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* STARTING PHASE */}
                {gameState === 'STARTING' && (
                    <div className="h-96 flex flex-col items-center justify-center text-center">
                        <motion.h1
                            key={countdown}
                            initial={{ scale: 3, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-[15rem] font-black text-primary italic leading-none"
                        >
                            {countdown}
                        </motion.h1>
                        <p className="text-3xl font-black text-slate-400 uppercase tracking-[1em] mt-8">Get Ready!</p>
                    </div>
                )}

                {/* RESULTS PHASE */}
                {gameState === 'FINISHED' && (
                    <div className="max-w-4xl mx-auto space-y-8 sm:space-y-16 pb-10 sm:pb-20 text-center">
                        <div className="space-y-4 sm:space-y-6">
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
                                Sirkel <span className="text-primary">Conquered!</span>
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm sm:text-lg md:text-xl px-4">The dust has settled. Who is the most gacor?</p>
                        </div>

                        <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
                            {[...players].sort((a, b) => b.score - a.score).map((p, idx) => (
                                <motion.div
                                    key={p.id}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Card className={`p-4 sm:p-8 md:p-10 flex items-center justify-between border-2 sm:border-4 ${idx === 0 ? 'border-yellow-400 bg-yellow-400/5 shadow-2xl' :
                                        p.id === currentPlayerId ? 'border-primary/40 bg-primary/5' : 'border-slate-100 dark:border-slate-800'}`}>
                                        <div className="flex items-center gap-4 sm:gap-8">
                                            <div className={`size-12 sm:size-14 md:size-16 rounded-[1.2rem] sm:rounded-2xl flex items-center justify-center text-xl sm:text-xl md:text-2xl font-black ${idx === 0 ? 'bg-yellow-400 text-white' :
                                                idx === 1 ? 'bg-slate-300 text-slate-600' :
                                                    idx === 2 ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                                }`}>
                                                {idx + 1}
                                            </div>
                                            <div className="text-left">
                                                <h4 className="text-xl sm:text-2xl md:text-2xl font-black text-slate-900 dark:text-white uppercase italic truncate max-w-[120px] sm:max-w-none">
                                                    {sanitizeDisplayName(p.name, p.id)}
                                                </h4>
                                                {idx === 0 && <span className="text-[10px] sm:text-xs font-black uppercase text-yellow-500">🏆 The Actual Sepuh</span>}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl sm:text-4xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{p.score}</p>
                                            <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Score</p>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex gap-4 justify-center">
                            <Button variant="primary" className="py-4 sm:py-6 px-10 sm:px-16 h-auto text-sm sm:text-xl rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl" onClick={() => router.push('/duel')}>
                                Back to Arena Lobby
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </PageLayout>
    );
}

const PowerUpButton = ({ icon, label, count, color, onClick, disabled }: any) => {
    const colorClasses: any = {
        blue: 'from-blue-500/10 to-blue-500/20 border-blue-500/30 text-blue-600 hover:from-blue-500 hover:to-blue-600 hover:text-white shadow-blue-500/10 hover:shadow-blue-500/40',
        purple: 'from-purple-500/10 to-purple-500/20 border-purple-500/30 text-purple-600 hover:from-purple-500 hover:to-purple-600 hover:text-white shadow-purple-500/10 hover:shadow-purple-500/40',
        yellow: 'from-yellow-500/10 to-yellow-500/20 border-yellow-500/30 text-yellow-600 hover:from-yellow-500 hover:to-yellow-600 hover:text-white shadow-yellow-500/10 hover:shadow-yellow-500/40'
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled || count <= 0}
            className={`flex items-center justify-between p-1.5 sm:p-4 rounded-xl sm:rounded-[2rem] border-2 transition-all group disabled:opacity-40 disabled:grayscale bg-gradient-to-br shadow-xl flex-1 lg:flex-none min-w-[70px] lg:min-w-[240px] ${colorClasses[color]}`}
        >
            <div className="flex items-center gap-1 sm:gap-4 shrink-0">
                <div className="size-6 sm:size-12 rounded-lg sm:rounded-2xl bg-white/50 dark:bg-black/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform shrink-0">
                    <Icon name={icon} size={12} mdSize={28} filled className="group-hover:rotate-12 transition-transform" />
                </div>
                <div className="text-left">
                    <p className="text-[5px] sm:text-[10px] font-black uppercase tracking-widest opacity-60 leading-tight">Use {label}</p>
                    <p className="font-black text-[8px] sm:text-base leading-tight whitespace-nowrap">
                        {count} <span className="opacity-60 font-bold uppercase text-[5px] sm:text-[10px]">Pcs</span>
                    </p>
                </div>
            </div>
            <div className="hidden lg:flex size-8 rounded-full bg-black/5 items-center justify-center group-hover:translate-x-1 transition-transform shrink-0">
                <Icon name="chevron_right" size={16} />
            </div>
        </button>
    );
};
