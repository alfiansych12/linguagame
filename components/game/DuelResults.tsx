'use client';

import React from 'react';
import { Card, Icon, Button, Badge } from '@/components/ui/UIComponents';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { resetMatchForRematch } from '@/app/actions/duelActions';
import { AdSenseContainer } from '../ui/AdSenseContainer';
import { useUserStore } from '@/store/user-store';

interface DuelResultsProps {
    results: {
        hostScore: number;
        opponentScore: number;
        winnerId: string | null;
    };
    matchId: string;
    onRematch: () => void;
    onExit: () => void;
}

export const DuelResults: React.FC<DuelResultsProps> = ({ results, matchId, onRematch, onExit }) => {
    const { data: session } = useSession();
    const { isPro } = useUserStore();
    const [loading, setLoading] = React.useState(false);
    const isWinner = results.winnerId === session?.user?.id;
    const isDraw = results.winnerId === null;

    const handleRematch = async () => {
        setLoading(true);
        try {
            await resetMatchForRematch(matchId);
            onRematch();
        } catch (err) {
            console.error('Rematch failed:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto py-6 md:py-10 px-4 text-center">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4 md:space-y-8"
            >
                {/* VICTORY/DEFEAT HEADER */}
                <div className="relative pt-4">
                    <motion.div
                        animate={{ y: [0, -5, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                    >
                        {isDraw ? (
                            <Icon name="balance" size={80} className="text-yellow-500 mx-auto" />
                        ) : isWinner ? (
                            <Icon name="workspace_premium" size={80} className="text-primary mx-auto" />
                        ) : (
                            <Icon name="heart_broken" size={80} className="text-red-500 mx-auto" />
                        )}
                    </motion.div>

                    <h1 className={`text-3xl md:text-5xl font-black italic tracking-tighter mt-3 ${isDraw ? 'text-yellow-500' : isWinner ? 'text-primary' : 'text-red-500'
                        }`}>
                        {isDraw ? 'DRAW BATTLE' : isWinner ? 'VICTORY!' : 'DEFEATED'}
                    </h1>
                </div>

                {/* SCORE BOARD */}
                <Card className="p-4 md:p-6 bg-slate-900/40 border-2 border-slate-800 backdrop-blur-xl">
                    <div className="flex items-center justify-around">
                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase">You</p>
                            <div className="text-3xl md:text-4xl font-black text-white italic">
                                {session?.user?.id === results.winnerId || isDraw ? (
                                    <span className="text-primary">{Math.max(results.hostScore, results.opponentScore)}</span>
                                ) : (
                                    <span className="text-slate-400">{Math.min(results.hostScore, results.opponentScore)}</span>
                                )}
                            </div>
                        </div>

                        <div className="text-xl font-black text-slate-700 italic">VS</div>

                        <div className="space-y-1">
                            <p className="text-[10px] font-black text-slate-500 uppercase">Enemy</p>
                            <div className="text-3xl md:text-4xl font-black text-white italic">
                                {session?.user?.id !== results.winnerId && !isDraw ? (
                                    <span className="text-primary">{Math.max(results.hostScore, results.opponentScore)}</span>
                                ) : (
                                    <span className="text-slate-400">{isDraw ? results.hostScore : Math.min(results.hostScore, results.opponentScore)}</span>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>

                {/* REWARDS */}
                {isWinner && (
                    <div className="flex flex-col gap-3 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="p-4 rounded-2xl bg-primary/10 border border-primary/30 inline-block w-full"
                        >
                            <div className="flex items-center gap-3">
                                <Icon name="diamond" size={28} className="text-primary" />
                                <div className="text-left">
                                    <p className="text-[9px] font-black text-primary uppercase tracking-widest">Tactical Reward</p>
                                    <h3 className="text-lg font-black text-white">+100 CRYSTALS</h3>
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/30 inline-block w-full relative"
                        >
                            <div className="flex items-center gap-3">
                                <Icon name="bolt" size={28} className="text-blue-500" />
                                <div className="text-left">
                                    <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">Experience Gained</p>
                                    <h3 className="text-lg font-black text-white">+{isPro ? '225' : '150'} XP</h3>
                                </div>
                            </div>
                            {isPro && (
                                <div className="absolute top-2 right-2 bg-blue-500 text-[7px] font-black px-1.5 py-0.5 rounded-full text-white uppercase tracking-tighter">
                                    PRO x1.5
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}

                {/* ACTIONS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-4">
                    <Button
                        size="lg"
                        variant="primary"
                        loading={loading}
                        onClick={handleRematch}
                        className="h-14 text-base font-black italic uppercase"
                    >
                        <Icon name="replay" className="mr-2" />
                        REMATCH BRO!
                    </Button>
                    <Button
                        size="lg"
                        variant="white"
                        onClick={onExit}
                        className="h-14 text-base font-black italic uppercase"
                    >
                        <Icon name="logout" className="mr-2" />
                        EXIT ARENA
                    </Button>
                </div>

                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest opacity-60">
                    Battle intelligence synced with tactical database
                </p>

                {/* TACTICAL ADSENSE UNIT */}
                <AdSenseContainer
                    slot="duel_results_bottom"
                    className="rounded-2xl border border-slate-700/30 mt-4"
                />
            </motion.div>
        </div>
    );
};
