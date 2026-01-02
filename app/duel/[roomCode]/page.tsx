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
import { submitDuelWin } from '@/app/actions/gameActions';
import { useSession } from 'next-auth/react';
import { AvatarFrame } from '@/components/ui/AvatarFrame';

interface Player {
    id: string;
    name: string;
    score: number;
    is_ready: boolean;
    user_id?: string;
    users?: {
        image: string;
        equipped_border: string;
    } | null;
}

export default function DuelRoomPage() {
    const params = useParams();
    const router = useRouter();
    const roomCode = params.roomCode as string;
    const { data: session } = useSession();
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
    const [localLives, setLocalLives] = useState(0);
    const [isEliminated, setIsEliminated] = useState(false);

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

            const fetchPlayersWithUsers = async (roomDataId: string) => {
                const { data: playersData } = await supabase
                    .from('duel_players')
                    .select('*')
                    .eq('room_id', roomDataId)
                    .order('created_at', { ascending: true });

                if (playersData && playersData.length > 0) {
                    const userIds = playersData.map(p => p.user_id).filter(Boolean);
                    if (userIds.length > 0) {
                        const { data: usersData } = await supabase
                            .from('users')
                            .select('id, image, equipped_border')
                            .in('id', userIds);

                        if (usersData) {
                            const usersMap = Object.fromEntries(usersData.map(u => [u.id, u]));
                            return playersData.map(p => ({
                                ...p,
                                users: p.user_id ? usersMap[p.user_id] : null
                            }));
                        }
                    }
                    return playersData;
                }
                return [];
            };

            const playersWithUsers = await fetchPlayersWithUsers(roomData.id);
            setPlayers(playersWithUsers);
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
                    const updatedPlayers = await fetchPlayersWithUsers(roomData.id);
                    setPlayers(updatedPlayers);
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

    const updateSettings = async (newTime: number, newSettings: any) => {
        if (!room?.id || !isHost) return;
        try {
            await supabase.from('duel_rooms').update({
                time_limit: newTime,
                settings: newSettings
            }).eq('id', room.id);
        } catch (err) {
            console.error('Update settings error:', err);
        }
    };

    // RESET EFFECT: Clear all local states when room goes back to WAITING
    useEffect(() => {
        if (gameState === 'WAITING') {
            setLocalScore(0);
            scoreRef.current = 0;
            setCorrectCount(0);
            setGameTimer(room?.time_limit || 60);
            setCountdown(3);
            setIsFrozen(false);
            setActiveBooster(0);
            setIsDivineEyeActive(0);
            setLocalLives(room?.settings?.lives || 0);
            setIsEliminated(false);
            setLoading(false);
        }
    }, [gameState, room]);

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
            const initialTime = room?.time_limit || 60;
            setGameTimer(initialTime);
            setLocalLives(room?.settings?.lives || 0);

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
    }, [gameState, playSound, room]);

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

            // LIVES SYSTEM: Penalty for wrong answer
            if (room?.settings?.lives > 0) {
                const nextLives = localLives - 1;
                setLocalLives(nextLives);

                if (nextLives <= 0) {
                    setIsEliminated(true);
                    playSound('GAMEOVER');
                    // Stop answering more questions
                }
            } else {
                // SCORE PENALTY: Prevent spam if no lives system
                const penalty = 5;
                const newScore = Math.max(0, scoreRef.current - penalty);
                scoreRef.current = newScore;
                setLocalScore(newScore);

                channelRef.current.send({
                    type: 'broadcast',
                    event: 'score_update',
                    payload: { playerId: currentPlayerId, score: newScore }
                });
            }

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
                    setIsDivineEyeActive(prev => prev + 1); // Fixed: 1 auto answer per use
                }
            } else if (type === 'overflow') {
                const success = await useCrystal('booster');
                if (success) {
                    playSound('SUCCESS');
                    setActiveBooster(prev => prev + 3);
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
                        // SECURE: Update wins in DB
                        const result = await submitDuelWin();
                        if (result.success) {
                            // Sync with current session user ID
                            const syncId = session?.user?.id || winner.user_id || 'guest';
                            await useUserStore.getState().syncWithDb(syncId);
                        }
                    } else {
                        playSound('SUCCESS');
                    }
                }
            } catch (err) {
                console.error('Final score sync error:', err);
                playSound('SUCCESS');
            }
        }

        if (isHost && room?.id) {
            await endDuel(room.id);
        }

        setGameState('FINISHED');
        setLoading(false);
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    };

    const toggleReady = async () => {
        if (!currentPlayerId) return;
        const p = players.find(p => p.id === currentPlayerId);
        await setPlayerReady(currentPlayerId, !p?.is_ready);
    };

    const startRoomGame = async () => {
        if (room?.id) await startDuel(room.id);
    };

    const restartRoom = async () => {
        if (!room?.id) return;
        setLoading(true);
        try {
            // Reset room status to WAITING
            await supabase.from('duel_rooms').update({ status: 'WAITING' }).eq('id', room.id);
            // Reset all players in this room: score back to 0, not ready
            await supabase.from('duel_players').update({ score: 0, is_ready: false }).eq('room_id', room.id);

            // Local reset for the state
            setLocalScore(0);
            scoreRef.current = 0;
            setCorrectCount(0);
            setGameTimer(60);
            setCountdown(3);
        } catch (err) {
            console.error('Restart error:', err);
        } finally {
            setLoading(false);
        }
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

                        <div className="bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700/50 px-4 sm:px-6 py-2 sm:py-3 rounded-2xl flex items-center gap-3 shadow-xl">
                            <Icon name="emoji_events" size={20} className="text-primary" filled />
                            <div className="flex flex-col items-start leading-none">
                                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">Score</span>
                                <span className="font-black text-xl sm:text-2xl text-slate-900 dark:text-white">{localScore}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 flex flex-col items-center justify-start pt-2 sm:pt-4 md:pt-6 p-4 md:p-8 max-w-6xl mx-auto w-full relative z-10">
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
                    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 lg:left-auto lg:right-12 lg:top-1/2 lg:-translate-y-1/2 z-40 w-[95%] max-w-[500px] lg:w-72 px-2 lg:px-0">
                        <div className="flex flex-row lg:flex-col gap-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl p-3 sm:p-5 rounded-[2rem] sm:rounded-[3rem] border border-white/30 shadow-2xl overflow-x-auto lg:overflow-visible no-scrollbar">
                            <h3 className="hidden lg:block text-xs font-black text-slate-400 uppercase tracking-widest px-3 italic mb-3">Arsenal Skill</h3>
                            {(room?.settings?.allowed_skills || ['stasis', 'divine', 'overflow']).includes('stasis') && (
                                <PowerUpButton
                                    icon="ac_unit"
                                    label="Stasis"
                                    count={inventory.timefreeze || 0}
                                    color="blue"
                                    onClick={() => handleUsePowerUp('stasis')}
                                    disabled={isFrozen || !inventory.timefreeze || isEliminated}
                                />
                            )}
                            {(room?.settings?.allowed_skills || ['stasis', 'divine', 'overflow']).includes('divine') && (
                                <PowerUpButton
                                    icon="visibility"
                                    label="Divine"
                                    count={inventory.autocorrect || 0}
                                    color="purple"
                                    onClick={() => handleUsePowerUp('divine')}
                                    disabled={isFrozen || !inventory.autocorrect || isDivineEyeActive > 0 || isEliminated}
                                />
                            )}
                            {(room?.settings?.allowed_skills || ['stasis', 'divine', 'overflow']).includes('overflow') && (
                                <PowerUpButton
                                    icon="bolt"
                                    label="Double"
                                    count={inventory.booster || 0}
                                    color="yellow"
                                    onClick={() => handleUsePowerUp('overflow')}
                                    disabled={isFrozen || !inventory.booster || activeBooster > 0 || isEliminated}
                                />
                            )}
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
                            <div className="flex flex-wrap justify-center gap-4">
                                {localLives > 0 && (
                                    <div className="flex items-center gap-1.5 px-6 py-2.5 bg-error/90 text-white rounded-full font-black shadow-lg">
                                        <Icon name="favorite" size={16} filled />
                                        {localLives} LIVES
                                    </div>
                                )}
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
                                <AnimatePresence mode="wait">
                                    {isEliminated ? (
                                        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="py-20 flex flex-col items-center">
                                            <Icon name="heart_broken" size={80} className="text-error mb-4" filled />
                                            <h2 className="text-4xl md:text-6xl font-black text-error uppercase italic">ELIMINATED!</h2>
                                            <p className="text-slate-400 font-bold mt-2">You ran out of lives. Waiting for others...</p>
                                        </motion.div>
                                    ) : (
                                        <motion.h2
                                            key={currentQuestion?.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-tight px-4"
                                        >
                                            <NoTranslate>{currentQuestion?.english}</NoTranslate>
                                        </motion.h2>
                                    )}
                                </AnimatePresence>
                                {!isEliminated && <div className="w-32 h-2 bg-primary/10 rounded-full mx-auto" />}
                            </div>

                            {!isEliminated && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 w-full max-w-4xl px-2">
                                    {options.map((opt, i) => (
                                        <Button
                                            key={i}
                                            variant="secondary"
                                            className="h-14 sm:h-20 md:h-28 lg:h-32 text-base sm:text-xl md:text-2xl lg:text-3xl font-black rounded-2xl sm:rounded-[2.5rem] lg:rounded-[3rem] bg-white dark:bg-slate-900 hover:bg-primary hover:text-white hover:scale-[1.02] active:scale-95 border-b-[4px] sm:border-b-[8px] lg:border-b-[12px] border-slate-200 dark:border-slate-800 active:border-b-0 transition-all uppercase shadow-xl"
                                            onClick={() => handleAnswer(opt)}
                                            disabled={isFrozen}
                                        >
                                            <NoTranslate>{opt}</NoTranslate>
                                        </Button>
                                    ))}
                                </div>
                            )}
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
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8 sm:pb-12">
                            <div className="text-center md:text-left space-y-1 relative z-10">
                                <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
                                    Bro- <span className="text-primary italic">Ready?</span>
                                </h1>
                                <p className="text-slate-500 dark:text-slate-400 font-bold text-[10px] sm:text-base">Waiting for everyone to lock in.</p>
                            </div>

                            <div className="flex flex-col items-center gap-2 w-full md:w-auto">
                                <div className="bg-slate-900 dark:bg-slate-800 text-white px-5 sm:px-8 py-3 sm:py-5 rounded-xl sm:rounded-3xl flex items-center gap-4 shadow-xl border-2 border-white/5">
                                    <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest text-slate-400">Code</span>
                                    <span className="text-2xl sm:text-4xl font-black tracking-[0.2em] font-mono text-primary leading-none">{roomCode}</span>
                                </div>
                                <p className="text-[8px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest opacity-60">Share with your homies</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10 items-start">
                            {/* Players Column - Responsive Grid */}
                            <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4 w-full">
                                {players.map((p, idx) => (
                                    <Card
                                        key={p.id}
                                        className={`group relative p-3 sm:p-4 flex items-center gap-3 sm:gap-4 border-2 sm:border-[3px] transition-all duration-300 min-h-[60px] sm:min-h-[80px] overflow-hidden ${p.is_ready
                                            ? 'border-success/40 bg-success/5 shadow-md'
                                            : 'border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50'
                                            }`}
                                    >
                                        {/* Profile Photo & Avatar Border */}
                                        <div className="relative shrink-0 mr-1 sm:mr-2">
                                            <AvatarFrame
                                                src={p.users?.image || null}
                                                alt={p.name}
                                                size="lg"
                                                borderId={
                                                    // Admin/Host check for special border
                                                    p.name?.toLowerCase().includes('admin')
                                                        ? 'admin_glitch'
                                                        : (p.users?.equipped_border || 'default')
                                                }
                                                fallbackInitial={p.name.charAt(0)}
                                            />
                                            {/* Small Rank Badge */}
                                            <div className="absolute -top-1 -left-1 size-5 sm:size-7 bg-slate-900 border-2 border-slate-800 rounded-lg flex items-center justify-center font-black text-[10px] sm:text-sm text-white z-30 shadow-lg italic">
                                                {idx + 1}
                                            </div>
                                        </div>

                                        {/* Player Identity */}
                                        <div className="flex-1 min-w-0 text-left">
                                            <h4 className="font-black text-slate-900 dark:text-white text-xs sm:text-base uppercase italic truncate leading-tight">
                                                {sanitizeDisplayName(p.name, p.id)}
                                            </h4>
                                            <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
                                                <div className={`size-1.5 sm:size-2 rounded-full shrink-0 ${p.is_ready ? 'bg-success' : 'bg-slate-300 dark:bg-slate-700 animate-pulse'}`} />
                                                <p className="text-[8px] sm:text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest truncate">
                                                    {p.is_ready ? 'Ready' : 'Waiting...'}
                                                </p>
                                            </div>
                                        </div>
                                    </Card>
                                ))}

                                {/* Empty Slots */}
                                {[...Array(Math.max(0, 5 - players.length))].map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-[60px] sm:h-[80px] border-2 sm:border-[3px] border-dashed border-slate-100 dark:border-slate-800/50 rounded-xl sm:rounded-2xl flex items-center justify-center text-slate-300 dark:text-slate-800 group opacity-50"
                                    >
                                        <div className="flex flex-col items-center gap-1">
                                            <Icon name="person_add" size={12} mdSize={20} />
                                            <span className="font-black text-[8px] sm:text-xs uppercase tracking-widest italic">Slot</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 sm:p-10 rounded-[2.5rem] border-2 border-slate-100 dark:border-slate-800 shadow-2xl h-fit space-y-8">
                                {isHost ? (
                                    <div className="space-y-8">
                                        <div className="flex items-center justify-between border-b-2 border-slate-100 dark:border-slate-800 pb-5">
                                            <h3 className="text-sm sm:text-lg font-black text-slate-400 uppercase tracking-widest italic">Room Settings</h3>
                                            <Badge variant="primary" className="text-xs">Host Only</Badge>
                                        </div>

                                        <div className="space-y-6">
                                            {/* Time Limit */}
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-xs sm:text-sm font-black uppercase text-slate-500">
                                                    <span>Time Limit</span>
                                                    <span className="text-primary">{room?.time_limit || 60}s</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    {[30, 60, 90, 120].map(t => (
                                                        <button key={t} onClick={() => updateSettings(t, room?.settings || {})} className={`flex-1 py-3 sm:py-4 rounded-xl text-xs sm:text-sm font-black border-2 transition-all ${room?.time_limit === t ? 'bg-primary border-primary text-white shadow-lg shadow-primary/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'}`}>
                                                            {t}s
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Lives */}
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-xs sm:text-sm font-black uppercase text-slate-500">
                                                    <span>Energy / HP</span>
                                                    <span className="text-error">{(room?.settings?.lives || 0) === 0 ? '∞ INF' : room?.settings?.lives + ' HP'}</span>
                                                </div>
                                                <div className="flex gap-2">
                                                    {[0, 3, 5, 10].map(l => (
                                                        <button key={l} onClick={() => updateSettings(room?.time_limit || 60, { ...room?.settings, lives: l })} className={`flex-1 py-3 sm:py-4 rounded-xl text-xs sm:text-sm font-black border-2 transition-all ${room?.settings?.lives === l ? 'bg-error border-error text-white shadow-lg shadow-error/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400'}`}>
                                                            {l === 0 ? '∞' : l}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Skill Selection */}
                                            <div className="space-y-1.5">
                                                <div className="text-[9px] sm:text-[10px] font-black uppercase text-slate-500">Allowed Skills</div>
                                                <div className="grid grid-cols-1 gap-1.5">
                                                    {[
                                                        { id: 'stasis', label: 'Stasis (Freeze)', icon: 'ac_unit' },
                                                        { id: 'divine', label: 'Divine Eye (Auto)', icon: 'visibility' },
                                                        { id: 'overflow', label: 'Double Score', icon: 'bolt' }
                                                    ].map(skill => {
                                                        const allowed = (room?.settings?.allowed_skills || ['stasis', 'divine', 'overflow']).includes(skill.id);
                                                        return (
                                                            <button
                                                                key={skill.id}
                                                                onClick={() => {
                                                                    const current = room?.settings?.allowed_skills || ['stasis', 'divine', 'overflow'];
                                                                    const next = allowed ? current.filter((s: string) => s !== skill.id) : [...current, skill.id];
                                                                    updateSettings(room?.time_limit || 60, { ...room?.settings, allowed_skills: next });
                                                                }}
                                                                className={`flex items-center gap-2.5 p-2 rounded-xl border-2 transition-all ${allowed ? 'bg-indigo-500/10 border-indigo-500 text-indigo-500' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-400 opacity-50'}`}
                                                            >
                                                                <Icon name={skill.icon} size={14} />
                                                                <span className="text-[9px] font-black uppercase">{skill.label}</span>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-2 space-y-2">
                                            <div className="h-px bg-slate-100 dark:bg-slate-800" />
                                            <Button
                                                variant="success"
                                                fullWidth
                                                className="py-4 h-auto rounded-2xl shadow-lg"
                                                disabled={players.length < 2 || !allReady}
                                                onClick={startRoomGame}
                                            >
                                                <div className="flex flex-col items-center">
                                                    <span className="text-base sm:text-lg font-black italic leading-tight">START DUEL</span>
                                                    <span className="text-[7px] font-bold uppercase tracking-widest opacity-70">Rules Locked In</span>
                                                </div>
                                            </Button>
                                            <Button
                                                variant={players.find(p => p.id === currentPlayerId)?.is_ready ? 'secondary' : 'primary'}
                                                fullWidth
                                                className="py-2.5 h-auto text-xs rounded-xl"
                                                onClick={toggleReady}
                                            >
                                                {players.find(p => p.id === currentPlayerId)?.is_ready ? 'Not Ready' : 'Ready Up!'}
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                            <h3 className="text-[9px] sm:text-xs font-black text-slate-400 uppercase tracking-widest italic">Room Info</h3>
                                            <Badge variant="primary" className="text-[7px] sm:text-[9px] px-2 py-0.5">Guest</Badge>
                                        </div>

                                        <div className="space-y-3">
                                            <div className="p-2.5 sm:p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-lg sm:rounded-xl border border-slate-100 dark:border-slate-800">
                                                <p className="text-[6px] sm:text-[9px] font-black uppercase text-slate-400 mb-1">Current Rules</p>
                                                <div className="space-y-1 sm:space-y-1.5">
                                                    <div className="flex items-center gap-1.5 text-[9px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">
                                                        <Icon name="timer" size={10} mdSize={14} className="text-primary" /> {room?.time_limit || 60}s Time
                                                    </div>
                                                    <div className="flex items-center gap-1.5 text-[9px] sm:text-xs font-bold text-slate-700 dark:text-slate-300">
                                                        <Icon name="favorite" size={10} mdSize={14} className="text-error" /> {(room?.settings?.lives || 0) === 0 ? '∞ HP' : room?.settings?.lives + ' HP'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="pt-1">
                                            <Button
                                                variant={players.find(p => p.id === currentPlayerId)?.is_ready ? 'secondary' : 'primary'}
                                                fullWidth
                                                className="py-2.5 sm:py-4 h-auto text-[10px] sm:text-lg rounded-lg sm:rounded-2xl"
                                                onClick={toggleReady}
                                            >
                                                {players.find(p => p.id === currentPlayerId)?.is_ready ? 'Cancel' : 'READY!'}
                                            </Button>
                                            <p className="text-[6px] sm:text-[9px] mt-1.5 text-center font-bold text-slate-400 uppercase animate-pulse">Waiting for host...</p>
                                        </div>
                                    </div>
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
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className={`size-24 sm:size-32 rounded-3xl mx-auto flex items-center justify-center shadow-2xl ${players.sort((a, b) => b.score - a.score)[0]?.id === currentPlayerId ? 'bg-yellow-400' : 'bg-slate-800'}`}
                            >
                                <Icon
                                    name={players.sort((a, b) => b.score - a.score)[0]?.id === currentPlayerId ? 'emoji_events' : 'sentiment_very_dissatisfied'}
                                    size={48}
                                    mdSize={64}
                                    className="text-white"
                                    filled
                                />
                            </motion.div>
                            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic leading-none">
                                {players.sort((a, b) => b.score - a.score)[0]?.id === currentPlayerId ? (
                                    <span className="text-yellow-500">YOU WON! 🏆</span>
                                ) : (
                                    <span className="text-slate-500">DEFEATED 💀</span>
                                )}
                            </h1>
                            <p className="text-slate-500 dark:text-slate-400 font-bold text-sm sm:text-lg md:text-xl px-4">
                                {players.sort((a, b) => b.score - a.score)[0]?.id === currentPlayerId
                                    ? "Gokil! Kamu yang paling gacor di bro ini."
                                    : "Nice try! Tingkatkan lagi biar jadi sepuh sesungguhnya."}
                            </p>
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
                                                <h4 className="text-2xl font-black text-slate-900 dark:text-white uppercase italic truncate max-w-[150px] sm:max-w-none">
                                                    {sanitizeDisplayName(p.name, p.id)}
                                                </h4>
                                                {idx === 0 && <span className="text-xs font-black uppercase text-yellow-500">🏆 The Actual Sepuh</span>}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">{p.score}</p>
                                            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Final Score</p>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            {isHost && (
                                <Button
                                    variant="success"
                                    className="py-4 sm:py-6 px-10 sm:px-16 h-auto text-sm sm:text-xl rounded-[1.5rem] sm:rounded-[2rem] shadow-2xl"
                                    onClick={restartRoom}
                                >
                                    Coba Lagi! 🔄
                                </Button>
                            )}
                            <Button
                                variant="ghost"
                                className="py-4 sm:py-6 px-10 sm:px-16 h-auto text-sm sm:text-lg rounded-[1.5rem] sm:rounded-[2rem] text-slate-400 font-black uppercase tracking-widest"
                                onClick={() => router.push('/duel')}
                            >
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
            className={`flex items-center justify-between p-2 sm:p-4 rounded-xl sm:rounded-[2rem] border-2 transition-all group disabled:opacity-40 disabled:grayscale bg-gradient-to-br shadow-xl flex-1 lg:flex-none min-w-[90px] sm:min-w-[120px] lg:min-w-[240px] ${colorClasses[color]}`}
        >
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                <div className="size-8 sm:size-12 rounded-lg sm:rounded-2xl bg-white/50 dark:bg-black/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform shrink-0">
                    <Icon name={icon} size={16} mdSize={28} filled className="group-hover:rotate-12 transition-transform" />
                </div>
                <div className="text-left">
                    <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest opacity-60 leading-tight">Use {label}</p>
                    <p className="font-black text-xs sm:text-base leading-tight whitespace-nowrap">
                        {count} <span className="opacity-60 font-bold uppercase text-[7px] sm:text-[10px]">Pcs</span>
                    </p>
                </div>
            </div>
            <div className="hidden lg:flex size-8 rounded-full bg-black/5 items-center justify-center group-hover:translate-x-1 transition-transform shrink-0">
                <Icon name="chevron_right" size={16} />
            </div>
        </button>
    );
};
