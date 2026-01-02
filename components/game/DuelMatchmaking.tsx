'use client';

import React, { useEffect, useState } from 'react';
import { Card, Icon, Button, Badge } from '@/components/ui/UIComponents';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/db/supabase';
import { startDuelMatch, updatePresence, getDuelMatch, joinBotToMatch } from '@/app/actions/duelActions';
import { useSession } from 'next-auth/react';

interface DuelMatchmakingProps {
    matchId: string;
    role: 'HOST' | 'OPPONENT';
    onStart: () => void;
}

export const DuelMatchmaking: React.FC<DuelMatchmakingProps> = ({ matchId, role, onStart }) => {
    const { data: session } = useSession();
    const [match, setMatch] = useState<any>(null);
    const [opponentPresence, setOpponentPresence] = useState({ online: false, lastSeen: 0 });
    const [loading, setLoading] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [matchmakingTimer, setMatchmakingTimer] = useState(0);
    const [showBotOption, setShowBotOption] = useState(false);

    useEffect(() => {
        // 1. Initial Match Fetch
        fetchMatch();

        // 2. Realtime Subscription
        const channel = supabase
            .channel(`duel:${matchId}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'duel_matches',
                filter: `id=eq.${matchId}`
            }, (payload) => {
                setMatch(payload.new);
                if (payload.new.status === 'PLAYING') {
                    onStart();
                }
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'duel_presence',
                filter: `match_id=eq.${matchId}`
            }, (payload) => {
                // Check if it's the other player
                if (payload.new.user_id !== session?.user?.id) {
                    setOpponentPresence({
                        online: payload.new.is_online,
                        lastSeen: Date.now()
                    });
                }
            })
            .subscribe();

        // 3. Heartbeat Interval
        const heartbeat = setInterval(() => {
            updatePresence(matchId);
        }, 10000);

        return () => {
            channel.unsubscribe();
            clearInterval(heartbeat);
        };
    }, [matchId, session?.user?.id, onStart]);

    // Matchmaking Timer Logic
    useEffect(() => {
        if (!match || match.opponent_id || match.status !== 'WAITING') return;

        const interval = setInterval(() => {
            setMatchmakingTimer(prev => {
                const next = prev + 1;
                if (next >= 15) setShowBotOption(true);
                return next;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [match]);

    const fetchMatch = async () => {
        setLoading(true);
        try {
            const result = await getDuelMatch(matchId);
            if (result.success && result.match) {
                setMatch(result.match);
                // Race condition: if already playing, start
                if (result.match.status === 'PLAYING') {
                    onStart();
                }
            } else {
                console.error('Match fetch error:', result.error);
            }
        } catch (err) {
            console.error('Fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReady = async () => {
        setLoading(true);
        try {
            const result = await startDuelMatch(matchId);
            if (result.success && result.started) {
                onStart();
            }
        } catch (error) {
            console.error('Ready error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCallBot = async (difficulty: 'EASY' | 'MEDIUM' | 'HARD') => {
        setLoading(true);
        try {
            const result = await joinBotToMatch(matchId, difficulty);
            if (result.success) {
                // The realtime subscription will trigger onStart via status: 'PLAYING'
            }
        } catch (error) {
            console.error('Bot join error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!match) return (
        <div className="flex items-center justify-center p-20 text-white font-black italic">
            CONNECTING TO ARENA...
        </div>
    );

    const isHost = role === 'HOST';
    const isPlayerReady = isHost ? match.host_ready : match.opponent_ready;
    const isOpponentReady = isHost ? match.opponent_ready : match.host_ready;
    const opponent = isHost ? match.opponent : match.host;

    return (
        <div className="w-full max-w-3xl mx-auto py-6 md:py-10 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="grid grid-cols-1 md:grid-cols-7 gap-4 md:gap-6 items-center"
            >
                {/* HOST CARD */}
                <div className="md:col-span-3">
                    <PlayerCard
                        user={match.host}
                        isReady={match.host_ready}
                        isSelf={isHost}
                        label="COMMANDER"
                    />
                </div>

                {/* VS CENTER */}
                <div className="md:col-span-1 text-center py-4 md:py-0">
                    <div className="relative inline-block md:block">
                        <motion.div
                            animate={{ scale: [1, 1.05, 1], rotate: [0, 2, -2, 0] }}
                            transition={{ repeat: Infinity, duration: 4 }}
                            className="text-4xl md:text-5xl font-black text-primary italic tracking-tighter"
                        >
                            VS
                        </motion.div>
                        <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full -z-10" />
                    </div>
                </div>

                {/* OPPONENT CARD */}
                <div className="md:col-span-3">
                    <PlayerCard
                        user={match.opponent}
                        isReady={match.opponent_ready}
                        isSelf={!isHost}
                        label="CHALLENGER"
                        waiting={!match.opponent_id}
                    />
                </div>
            </motion.div>

            {/* ACTION CENTER */}
            <div className="mt-8 max-w-sm mx-auto space-y-4">
                <div className="space-y-1 text-center">
                    <p className="text-[10px] font-black text-slate-600 tracking-widest uppercase">Room Tactical Code</p>
                    <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700 font-mono text-xl font-black text-white tracking-[0.3rem] select-all">
                        {match.room_code}
                    </div>
                </div>

                <div className="pt-2">
                    {showBotOption && !match.opponent_id ? (
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-2">
                                {(['EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
                                    <Button
                                        key={diff}
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => handleCallBot(diff)}
                                        loading={loading}
                                        className="text-[10px] font-black italic"
                                    >
                                        {diff}
                                    </Button>
                                ))}
                            </div>
                            <p className="text-[10px] text-primary font-bold text-center uppercase tracking-widest animate-pulse">
                                Deploy AI Tactical Support?
                            </p>
                        </div>
                    ) : (
                        <>
                            <Button
                                variant={isPlayerReady ? "success" : "primary"}
                                size="lg"
                                fullWidth
                                loading={loading}
                                onClick={handleReady}
                                disabled={isPlayerReady || !match.opponent_id}
                                className="h-14 text-lg font-black uppercase italic"
                            >
                                <Icon name={isPlayerReady ? "check_circle" : "bolt"} className="mr-2" />
                                {isPlayerReady ? "READY SET" : "READY TACTICAL"}
                            </Button>
                            <p className="text-[10px] text-slate-600 font-bold mt-2 text-center uppercase tracking-wider">
                                {isOpponentReady ? "Enemy is ready for battle!" :
                                    !match.opponent_id ? `Matchmaking... ${matchmakingTimer}s` :
                                        "Waiting for opponent response..."}
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* Match Info Footer */}
            <div className="mt-10 grid grid-cols-3 gap-3">
                {[
                    { label: 'MODE', value: match.game_mode, icon: 'sports_esports' },
                    { label: 'ROUNDS', value: match.max_rounds, icon: 'numbers' },
                    { label: 'REWARD', value: '100 CRYSTALS', icon: 'diamond' }
                ].map((stat, i) => (
                    <div key={i} className="p-3 rounded-xl bg-slate-800/10 border border-slate-700/20 text-center">
                        <Icon name={stat.icon} size={16} className="text-primary/60 mb-1 mx-auto" />
                        <div className="text-[9px] font-black text-slate-600 uppercase tracking-tighter">{stat.label}</div>
                        <div className="text-xs font-black text-white italic">{stat.value}</div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const PlayerCard = ({ user, isReady, isSelf, label, waiting = false }: any) => (
    <Card className={`p-4 md:p-6 border ${isReady ? 'border-primary shadow-[0_0_20px_rgba(20,184,166,0.1)]' : 'border-slate-800/50'} bg-slate-900/40 transition-all text-center relative overflow-hidden`}>
        {isReady && (
            <div className="absolute top-0 right-0 p-2">
                <Icon name="verified" size={18} className="text-primary" />
            </div>
        )}

        <div className="relative z-10 space-y-3">
            <div className={`size-16 md:size-20 rounded-2xl mx-auto overflow-hidden border-2 ${isSelf ? 'border-primary/40' : 'border-slate-800'} bg-slate-800 flex items-center justify-center`}>
                {waiting ? (
                    <div className="animate-pulse flex flex-col items-center">
                        <Icon name="pending" size={32} className="text-slate-700" />
                    </div>
                ) : user?.image ? (
                    <img src={user.image} alt={user.name} className="size-full object-cover" />
                ) : (
                    <Icon name="person" size={40} className="text-slate-700" />
                )}
            </div>

            <div>
                <Badge variant="primary" className="text-[9px] font-black mb-1 p-0.5 px-2">{label}</Badge>
                <h3 className="text-lg md:text-xl font-black text-white uppercase italic truncate">
                    {waiting ? 'WAITING...' : user?.name || 'ANONYMOUS'}
                </h3>
            </div>

            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${isReady ? 'bg-primary text-white' : 'bg-slate-800/80 text-slate-600'
                }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isReady ? 'bg-white' : 'bg-slate-700'} ${isReady ? 'animate-pulse' : ''}`} />
                {isReady ? 'READY' : 'PREPARING'}
            </div>
        </div>

        {isSelf && (
            <div className="absolute -bottom-0.5 inset-x-0 h-0.5 bg-primary" />
        )}
    </Card>
);
