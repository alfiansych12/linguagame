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
    const { name, addGems } = useUserStore();

    // Internal States
    const [room, setRoom] = useState<any>(null);
    const [players, setPlayers] = useState<Player[]>([]);
    const [currentPlayerId, setCurrentPlayerId] = useState<string | null>(null);
    const [gameState, setGameState] = useState<'WAITING' | 'STARTING' | 'PLAYING' | 'FINISHED'>('WAITING');
    const [countdown, setCountdown] = useState(3);
    const [gameTimer, setGameTimer] = useState(60);
    const [loading, setLoading] = useState(true);

    // Game Content State
    const [currentQuestion, setCurrentQuestion] = useState<any>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [localScore, setLocalScore] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);

    // Refs for real-time
    const channelRef = useRef<any>(null);
    const timerRef = useRef<any>(null);

    useEffect(() => {
        // 1. Identify local player
        const savedPlayerId = sessionStorage.getItem(`duel_player_${roomCode}`);
        if (!savedPlayerId) {
            router.push('/duel');
            return;
        }
        setCurrentPlayerId(savedPlayerId);

        // 2. Fetch initial room state
        const initRoom = async () => {
            console.log('📡 Fetching Room Data for:', roomCode);
            const { data: roomData, error } = await supabase
                .from('duel_rooms')
                .select('*')
                .eq('code', roomCode)
                .single();

            if (error || !roomData) {
                console.error('❌ Room Fetch Error:', error);
                router.push('/duel');
                return;
            }

            setRoom(roomData);
            setGameState(roomData.status);

            // Fetch players
            console.log('👥 Fetching initial players for room:', roomData.id);
            const { data: playerData, error: playerFetchError } = await supabase
                .from('duel_players')
                .select('*')
                .eq('room_id', roomData.id)
                .order('created_at', { ascending: true });

            if (playerFetchError) {
                console.error('❌ Players Initial Fetch Error:', playerFetchError.message, playerFetchError.details, playerFetchError.hint);
            } else if (playerData) {
                console.log('✅ Found players:', playerData.length);
                setPlayers(playerData);
            }

            setLoading(false);

            // 3. Setup Realtime Channel
            console.log('🔌 Connecting to Realtime for Room ID:', roomData.id);
            const channel = supabase.channel(`room:${roomCode}`, {
                config: {
                    broadcast: { self: true },
                }
            });

            channel
                .on('postgres_changes', {
                    event: '*',
                    schema: 'public',
                    table: 'duel_players',
                    filter: `room_id=eq.${roomData.id}`
                }, async (payload) => {
                    console.log('⚡️ Database Change Detected!', payload.eventType);

                    // Refetch players only if it's an important change
                    const { data: updatedPlayers, error: refetchError } = await supabase
                        .from('duel_players')
                        .select('*')
                        .eq('room_id', roomData.id)
                        .order('created_at', { ascending: true });

                    if (refetchError) {
                        console.error('❌ Refetch Error:', refetchError.message);
                    } else if (updatedPlayers) {
                        console.log('👥 Updated Players List:', updatedPlayers.length);
                        setPlayers(updatedPlayers);
                    }
                })
                .on('postgres_changes', {
                    event: 'UPDATE',
                    schema: 'public',
                    table: 'duel_rooms',
                    filter: `id=eq.${roomData.id}`
                }, (payload) => {
                    const updatedRoom = payload.new as any;
                    console.log('🏠 Room Status Update:', updatedRoom.status);
                    setGameState(updatedRoom.status);
                    setRoom(updatedRoom);
                })
                .on('broadcast', { event: 'score_update' }, (payload) => {
                    const { playerId, score } = payload.payload;
                    setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, score } : p));
                })
                .subscribe((status) => {
                    console.log('📡 Realtime Subscription Status:', status);
                });

            channelRef.current = channel;
        };

        initRoom();

        return () => {
            if (channelRef.current) supabase.removeChannel(channelRef.current);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [roomCode, router]);

    // Re-fetch helper (if needed elsewhere)
    const fetchPlayers = async (roomId?: string) => {
        if (!roomId) return;
        const { data } = await supabase
            .from('duel_players')
            .select('*')
            .eq('room_id', roomId)
            .order('created_at', { ascending: true });
        if (data) setPlayers(data);
    };

    // Handle Game Startup
    useEffect(() => {
        if (gameState === 'STARTING') {
            const int = setInterval(() => {
                setCountdown(prev => {
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
    }, [gameState]);

    const generateQuestion = () => {
        const randomIndex = Math.floor(Math.random() * VOCABULARY_DATA.length);
        const question = VOCABULARY_DATA[randomIndex];
        setCurrentQuestion(question);

        // Generate options (1 correct + 3 random)
        const others = VOCABULARY_DATA
            .filter(w => w.id !== question.id)
            .sort(() => 0.5 - Math.random())
            .slice(0, 3)
            .map(w => w.indonesian);

        setOptions([question.indonesian, ...others].sort(() => 0.5 - Math.random()));
    };

    const handleAnswer = (answer: string) => {
        if (answer === currentQuestion.indonesian) {
            const newScore = localScore + 10;
            setLocalScore(newScore);
            setCorrectCount(prev => prev + 1);

            // Update local state for immediate feedback
            setPlayers(prev => prev.map(p => p.id === currentPlayerId ? { ...p, score: newScore } : p));

            // Broadcast score to others
            channelRef.current.send({
                type: 'broadcast',
                event: 'score_update',
                payload: { playerId: currentPlayerId, score: newScore }
            });

            generateQuestion();
        } else {
            // Shake effect or penalty? Let's just go next to keep speed
            generateQuestion();
        }
    };

    const handleGameEnd = async () => {
        setLoading(true);
        if (currentPlayerId) {
            try {
                // Force final update to DB
                await updatePlayerScore(currentPlayerId, localScore);

                // Final refetch to ensure we have the absolute truth for results
                const { data } = await supabase
                    .from('duel_players')
                    .select('*')
                    .eq('room_id', room.id)
                    .order('score', { ascending: false });
                if (data) setPlayers(data);
            } catch (err) {
                console.error('Final score sync error:', err);
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

    return (
        <PageLayout activeTab="home">
            <div className="max-w-6xl mx-auto py-8 md:py-12 px-4">

                {/* Lobby / Waiting Phase */}
                {gameState === 'WAITING' && (
                    <div className="space-y-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b-2 border-slate-100 dark:border-slate-800 pb-8">
                            <div className="text-center md:text-left">
                                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                                    Sirkel Ready?
                                </h1>
                                <p className="text-slate-500 font-bold">Waiting for everyone to lock in.</p>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                                <div className="bg-slate-900 text-white px-8 py-4 rounded-3xl flex items-center gap-4 shadow-xl">
                                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Room Code</span>
                                    <span className="text-4xl font-black tracking-[0.2em]">{roomCode}</span>
                                </div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Share this with the sirkel</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {/* Players List */}
                            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {players.map((p, idx) => (
                                    <Card key={p.id} className={`p-6 flex items-center justify-between border-2 ${p.is_ready ? 'border-success/30 bg-success/5' : 'border-slate-100 dark:border-slate-800'}`}>
                                        <div className="flex items-center gap-4">
                                            <div className="size-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <h4 className="font-black text-slate-900 dark:text-white truncate max-w-[120px]">
                                                    {sanitizeDisplayName(p.name, p.id)} {p.id === currentPlayerId && '(You)'}
                                                </h4>
                                                <p className="text-xs font-bold text-slate-500">{p.is_ready ? 'Ready to Slay' : 'Literally Unready'}</p>
                                            </div>
                                        </div>
                                        {p.is_ready ? (
                                            <div className="size-8 bg-success text-white rounded-full flex items-center justify-center">
                                                <Icon name="check" size={20} />
                                            </div>
                                        ) : (
                                            <div className="size-8 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded-full flex items-center justify-center">
                                                <Icon name="hourglass_empty" size={20} className="animate-pulse" />
                                            </div>
                                        )}
                                    </Card>
                                ))}

                                {/* Slot placeholders */}
                                {[...Array(Math.max(0, 5 - players.length))].map((_, i) => (
                                    <div key={i} className="p-6 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl flex items-center justify-center text-slate-300 dark:text-slate-800 italic font-bold">
                                        Empty Slot
                                    </div>
                                ))}
                            </div>

                            {/* Lobby Controls */}
                            <div className="space-y-4">
                                <Button
                                    variant={players.find(p => p.id === currentPlayerId)?.is_ready ? 'secondary' : 'primary'}
                                    fullWidth
                                    className="py-6 h-auto"
                                    onClick={toggleReady}
                                >
                                    {players.find(p => p.id === currentPlayerId)?.is_ready ? 'I\'m Not Ready! (Wait)' : 'LFG! READY'}
                                </Button>

                                {isHost && (
                                    <Button
                                        variant="success"
                                        fullWidth
                                        className="py-6 h-auto"
                                        disabled={players.length < 2 || !allReady}
                                        onClick={startRoomGame}
                                    >
                                        <div className="flex flex-col items-center">
                                            <span className="text-xl">START GAME</span>
                                            <span className="text-[10px] opacity-70">Requires 2+ Players Ready</span>
                                        </div>
                                    </Button>
                                )}

                                <Card className="p-6 bg-amber-50 dark:bg-amber-950/20 border-amber-200/50">
                                    <h5 className="text-amber-600 dark:text-amber-400 font-black text-xs uppercase mb-2">Rules of Arena</h5>
                                    <ul className="text-xs text-amber-500 font-bold space-y-2">
                                        <li>• 1 Minute of pure chaos</li>
                                        <li>• +10 XP per correct answer</li>
                                        <li>• Top score takes the crown</li>
                                    </ul>
                                </Card>
                            </div>
                        </div>
                    </div>
                )}

                {/* Starting Countdown */}
                {gameState === 'STARTING' && (
                    <div className="h-96 flex flex-col items-center justify-center text-center">
                        <motion.h1
                            key={countdown}
                            initial={{ scale: 2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-9xl font-black text-primary italic"
                        >
                            {countdown}
                        </motion.h1>
                        <p className="text-2xl font-black text-slate-400 uppercase tracking-widest mt-8">Prepare to Gacor!</p>
                    </div>
                )}

                {/* Playing Phase */}
                {gameState === 'PLAYING' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
                        {/* Live Leaderboard Sidebar */}
                        <div className="lg:col-span-3 space-y-4 sticky top-24">
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase italic mb-4">Live Standings</h3>
                            {players.sort((a, b) => b.score - a.score).map((p, idx) => (
                                <Card key={p.id} className={`p-4 flex items-center justify-between border-2 transition-all ${p.id === currentPlayerId ? 'border-primary ring-4 ring-primary/10' : 'border-transparent'}`}>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs font-black text-slate-400">#{idx + 1}</span>
                                        <span className="font-bold text-slate-700 dark:text-slate-300 truncate max-w-[100px]">
                                            {sanitizeDisplayName(p.name, p.id)}
                                        </span>
                                    </div>
                                    <span className="font-black text-primary">{p.score}</span>
                                </Card>
                            ))}
                        </div>

                        {/* Game Arena */}
                        <div className="lg:col-span-9 space-y-8">
                            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-4">
                                    <div className="size-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                                        <Icon name="timer" size={32} className="text-primary" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Time Left</p>
                                        <p className={`text-3xl font-black ${gameTimer < 10 ? 'text-error animate-pulse' : 'text-slate-900 dark:text-white'}`}>{gameTimer}s</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Your Score</p>
                                    <Badge variant="xp" className="text-2xl px-6 py-2">
                                        {localScore}
                                    </Badge>
                                </div>
                            </div>

                            <Card className="p-8 md:p-12 text-center space-y-12">
                                <div className="space-y-4">
                                    <span className="text-xs font-black text-primary uppercase tracking-[0.3em]">Translate This</span>
                                    <h2 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic underline decoration-primary/20 decoration-8 underline-offset-8">
                                        <NoTranslate>{currentQuestion?.english}</NoTranslate>
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {options.map((opt, i) => (
                                        <Button
                                            key={i}
                                            variant="secondary"
                                            className="h-24 md:h-32 text-xl md:text-2xl font-black rounded-3xl hover:bg-primary hover:text-white hover:scale-[1.02] border-b-8 border-slate-200 dark:border-slate-800 active:border-b-0 transition-all uppercase"
                                            onClick={() => handleAnswer(opt)}
                                        >
                                            <NoTranslate>{opt}</NoTranslate>
                                        </Button>
                                    ))}
                                </div>
                            </Card>
                        </div>
                    </div>
                )}

                {/* Results Phase */}
                {gameState === 'FINISHED' && (
                    <div className="max-w-2xl mx-auto space-y-12 text-center py-12">
                        <div className="space-y-4">
                            <h1 className="text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
                                Sirkel <span className="text-primary">Conquered!</span>
                            </h1>
                            <p className="text-slate-500 font-bold text-xl">The dust has settled. Who is the most gacor?</p>
                        </div>

                        <div className="space-y-4">
                            {players.sort((a, b) => b.score - a.score).map((p, idx) => (
                                <motion.div
                                    key={p.id}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Card className={`p-8 flex items-center justify-between border-4 ${idx === 0 ? 'border-yellow-400 bg-yellow-400/5' : 'border-slate-100 dark:border-slate-800'}`}>
                                        <div className="flex items-center gap-6">
                                            <div className={`size-16 rounded-2xl flex items-center justify-center text-2xl font-black ${idx === 0 ? 'bg-yellow-400 text-white' :
                                                idx === 1 ? 'bg-slate-300 text-slate-600' :
                                                    idx === 2 ? 'bg-amber-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                                                }`}>
                                                {idx + 1}
                                            </div>
                                            <div className="text-left">
                                                <h4 className="text-2xl font-black text-slate-900 dark:text-white">
                                                    {sanitizeDisplayName(p.name, p.id)}
                                                </h4>
                                                {idx === 0 && <span className="text-[10px] font-black uppercase text-yellow-500">🏆 The Actual Sepuh</span>}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{p.score}</p>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Score</p>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        <div className="pt-8">
                            <Button variant="primary" fullWidth className="py-6 h-auto text-xl rounded-3xl shadow-2xl" onClick={() => router.push('/duel')}>
                                Back to Arena Lobby
                            </Button>
                        </div>
                    </div>
                )}

            </div>
        </PageLayout>
    );
}
