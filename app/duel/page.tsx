'use client';

import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { DuelLobby } from '@/components/game/DuelLobby';
import { DuelMatchmaking } from '@/components/game/DuelMatchmaking';
import { LiveDuelGame } from '@/components/game/LiveDuelGame';
import { DuelResults } from '@/components/game/DuelResults';
import { DuelSocial } from '@/components/game/DuelSocial';
import { joinDuelMatchById } from '@/app/actions/duelActions';
import { motion, AnimatePresence } from 'framer-motion';

type DuelState = 'LOBBY' | 'MATCHMAKING' | 'GAME' | 'RESULTS';

export default function DuelPage() {
    const [state, setState] = useState<DuelState>('LOBBY');
    const [matchInfo, setMatchInfo] = useState<{ id: string; role: 'HOST' | 'OPPONENT' } | null>(null);
    const [results, setResults] = useState<any>(null);

    const handleJoinMatch = async (matchId: string, role: 'HOST' | 'OPPONENT') => {
        if (role === 'OPPONENT') {
            const res = await joinDuelMatchById(matchId);
            if (!res.success) {
                alert(res.error || 'Gagal masuk arena');
                return;
            }
        }

        setMatchInfo({ id: matchId, role });
        setState('MATCHMAKING');
    };

    const handleStartGame = () => {
        setState('GAME');
    };

    return (
        <PageLayout activeTab="duel">
            <div className="max-w-7xl mx-auto py-6 sm:py-10 px-4">
                <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">

                    {/* MAIN ARENA (LEFT/CENTER) */}
                    <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[60vh]">
                        <AnimatePresence mode="wait">
                            {state === 'LOBBY' && (
                                <motion.div
                                    key="lobby"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 1.1 }}
                                    className="w-full"
                                >
                                    <DuelLobby onJoin={handleJoinMatch} />
                                </motion.div>
                            )}

                            {state === 'MATCHMAKING' && matchInfo && (
                                <motion.div
                                    key="matchmaking"
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 1, scale: 1.1 }}
                                    className="w-full"
                                >
                                    <DuelMatchmaking
                                        matchId={matchInfo.id}
                                        role={matchInfo.role}
                                        onStart={handleStartGame}
                                    />
                                </motion.div>
                            )}

                            {state === 'GAME' && matchInfo && (
                                <motion.div
                                    key="game"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="w-full"
                                >
                                    <LiveDuelGame
                                        matchId={matchInfo.id}
                                        role={matchInfo.role}
                                        onComplete={(res) => {
                                            setResults(res);
                                            setState('RESULTS');
                                        }}
                                    />
                                </motion.div>
                            )}

                            {state === 'RESULTS' && matchInfo && results && (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="w-full"
                                >
                                    <DuelResults
                                        results={results}
                                        matchId={matchInfo.id}
                                        onRematch={() => setState('MATCHMAKING')}
                                        onExit={() => setState('LOBBY')}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* SOCIAL PANEL (RIGHT) - Sticky on Desktop */}
                    {(state === 'LOBBY' || state === 'MATCHMAKING') && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="lg:w-80 w-full lg:sticky lg:top-24 space-y-4"
                        >
                            <DuelSocial
                                currentMatchId={state === 'MATCHMAKING' ? matchInfo?.id : undefined}
                                onJoinInvite={(mId) => handleJoinMatch(mId, 'OPPONENT')}
                                onJoinMatch={handleJoinMatch}
                            />
                        </motion.div>
                    )}
                </div>
            </div>
        </PageLayout>
    );
}
