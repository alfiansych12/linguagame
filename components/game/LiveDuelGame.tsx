'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, Icon, Button, Badge } from '@/components/ui/UIComponents';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/db/supabase';
import { submitDuelAnswer, finishDuelMatch, submitBotAnswer } from '@/app/actions/duelActions';
import { useSession } from 'next-auth/react';

interface LiveDuelGameProps {
    matchId: string;
    role: 'HOST' | 'OPPONENT';
    onComplete: (results: any) => void;
}

export const LiveDuelGame: React.FC<LiveDuelGameProps> = ({ matchId, role, onComplete }) => {
    const { data: session } = useSession();
    const [currentRound, setCurrentRound] = useState(1);
    const [question, setQuestion] = useState<any>(null);
    const [options, setOptions] = useState<string[]>([]);
    const [matchData, setMatchData] = useState<any>(null);
    const [roundData, setRoundData] = useState<any[]>([]);
    const [isAnswering, setIsAnswering] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [timeLeft, setTimeLeft] = useState(15);
    const [gameStatus, setGameStatus] = useState<'PLAYING' | 'WAITING_NEXT' | 'FINISHED'>('PLAYING');
    const [activeEmotes, setActiveEmotes] = useState<{ id: string; emoji: string; userId: string; side: 'left' | 'right' }[]>([]);

    const startTimeRef = useRef<number>(0);
    const channelRef = useRef<any>(null);
    const matchDataRef = useRef<any>(null);
    const botTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Sync ref with state for use in real-time callbacks
    useEffect(() => {
        matchDataRef.current = matchData;
    }, [matchData]);

    useEffect(() => {
        const init = async () => {
            // Already initialized?
            if (matchDataRef.current) return;

            const { data } = await supabase
                .from('duel_matches')
                .select(`
                    *,
                    host:host_id(id, name, image),
                    opponent:opponent_id(id, name, image)
                `)
                .eq('id', matchId)
                .single();

            if (data) {
                setMatchData(data);
                generateQuestion(data);
            }
        };
        init();

        // Real-time subscription to see opponent's performance
        const channel = supabase
            .channel(`duel_game:${matchId}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'duel_rounds',
                filter: `match_id=eq.${matchId}`
            }, (payload) => {
                setRoundData(prev => [...prev.filter(r => r.round_number !== payload.new.round_number), payload.new]);
            })
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'duel_rounds',
                filter: `match_id=eq.${matchId}`
            }, (payload) => {
                setRoundData(prev => prev.map(r => r.id === payload.new.id ? payload.new : r));
            })
            .on('broadcast', { event: 'emote' }, (payload) => {
                // Use ref to avoid stale closure or infinite loop dependency
                const hostId = matchDataRef.current?.host_id;
                const side: 'left' | 'right' = payload.payload.userId === hostId ? 'left' : 'right';
                const newEmote = {
                    id: Math.random().toString(36).substr(2, 9),
                    emoji: payload.payload.emoji,
                    userId: payload.payload.userId,
                    side
                };
                setActiveEmotes(prev => [...prev, newEmote]);
                setTimeout(() => {
                    setActiveEmotes(prev => prev.filter(e => e.id !== newEmote.id));
                }, 3000);
            })
            .subscribe();

        channelRef.current = channel;

        return () => {
            channel.unsubscribe();
        };
    }, [matchId]); // ONLY depend on matchId to prevent reset loops

    // Timer Logic
    useEffect(() => {
        if (gameStatus !== 'PLAYING' || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft(prev => Math.max(0, prev - 1));
        }, 1000);

        return () => clearInterval(timer);
    }, [gameStatus, timeLeft]);

    // Handle Timeout Safely (Outside functional state updates)
    useEffect(() => {
        if (gameStatus === 'PLAYING' && timeLeft === 0 && !selectedAnswer && !isAnswering) {
            handleTimeUp();
        }
    }, [timeLeft, gameStatus, selectedAnswer, isAnswering]);

    const fetchMatchDetails = async () => {
        const { data } = await supabase.from('duel_matches').select('*').eq('id', matchId).single();
        if (data) setMatchData(data);
        return data;
    };

    const generateQuestion = async (passedMatchData?: any) => {
        const activeMatchData = passedMatchData || matchData;
        if (!activeMatchData) return;

        let q: any = null;
        let opts: string[] = [];

        if (activeMatchData.game_mode === 'VOCAB') {
            const { VOCABULARY_DATA } = await import('@/lib/data/vocabulary');
            const word = VOCABULARY_DATA[Math.floor(Math.random() * VOCABULARY_DATA.length)];
            const distractors = VOCABULARY_DATA
                .filter(w => w.id !== word.id)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map(w => w.indonesian);

            q = { q: `Apa arti dari "${word.english}"?`, a: word.indonesian, o: distractors };
        } else if (activeMatchData.game_mode === 'GRAMMAR') {
            const { GRAMMAR_DATA } = await import('@/lib/data/grammar');
            const task = GRAMMAR_DATA[Math.floor(Math.random() * GRAMMAR_DATA.length)];
            const distractors = GRAMMAR_DATA
                .filter(t => t.id !== task.id)
                .sort(() => Math.random() - 0.5)
                .slice(0, 3)
                .map(t => t.solution.join(' '));

            q = { q: `Susun kalimat: "${task.indonesian}"`, a: task.solution.join(' '), o: distractors };
        } else {
            const { BLITZ_DATA } = await import('@/lib/data/blitz');
            const task = BLITZ_DATA[Math.floor(Math.random() * BLITZ_DATA.length)];
            q = {
                q: task.english,
                a: task.choices[task.correctIndex],
                o: task.choices.filter((_, i) => i !== task.correctIndex)
            };
        }

        setQuestion(q);
        setOptions([...q.o, q.a].sort(() => Math.random() - 0.5));
        startTimeRef.current = Date.now();
        setTimeLeft(15);
        setSelectedAnswer(null);
        setIsAnswering(false);
        setGameStatus('PLAYING');

        // Trigger Bot Simulation if I am Host and opponent is Bot
        if (role === 'HOST' && activeMatchData.opponent_id?.startsWith('BOT_')) {
            simulateBotTurn(activeMatchData.opponent_id, q);
        }
    };

    const simulateBotTurn = (botId: string, currentQuestion: any) => {
        if (botTimerRef.current) clearTimeout(botTimerRef.current);

        // Difficulty Config
        const difficulty = botId.split('_')[1] || 'EASY';
        let accuracy = 0.6;
        let minTime = 5000;
        let maxTime = 10000;

        if (difficulty === 'MEDIUM') {
            accuracy = 0.85;
            minTime = 3000;
            maxTime = 6000;
        } else if (difficulty === 'HARD') {
            accuracy = 0.98;
            minTime = 1000;
            maxTime = 3000;
        }

        const waitTime = Math.floor(Math.random() * (maxTime - minTime)) + minTime;
        const willBeCorrect = Math.random() < accuracy;
        const botAnswer = willBeCorrect ? currentQuestion.a :
            currentQuestion.o[Math.floor(Math.random() * currentQuestion.o.length)];

        botTimerRef.current = setTimeout(async () => {
            try {
                await submitBotAnswer({
                    matchId,
                    roundNumber: currentRound,
                    answer: botAnswer,
                    timeMs: waitTime,
                    isCorrect: willBeCorrect
                });
            } catch (err) {
                console.error('Bot submission failed:', err);
            }
        }, waitTime);
    };

    const handleAnswer = async (answer: string) => {
        if (isAnswering || gameStatus !== 'PLAYING' || !question) return;

        setIsAnswering(true);
        setSelectedAnswer(answer);
        const timeTaken = Date.now() - startTimeRef.current;
        const isCorrect = answer === question.a;

        try {
            await submitDuelAnswer({
                matchId,
                roundNumber: currentRound,
                answer,
                timeMs: timeTaken,
                isCorrect
            });
        } catch (err) {
            console.error('Failed to submit answer:', err);
        }

        setGameStatus('WAITING_NEXT');
    };

    const handleTimeUp = () => {
        if (selectedAnswer) return;
        handleAnswer('TIMEOUT');
    };

    const nextRound = async () => {
        if (currentRound >= (matchData?.max_rounds || 10)) {
            setGameStatus('FINISHED');
            const result = await finishDuelMatch(matchId);
            if (result.success) {
                // Wrap in timeout to avoid "Cannot update a component (Router) while rendering a different component"
                setTimeout(() => onComplete(result.result), 100);
            }
        } else {
            setCurrentRound(prev => prev + 1);
            generateQuestion();
        }
        if (botTimerRef.current) clearTimeout(botTimerRef.current);
    };

    // Calculate Scores from roundData
    const hostScore = roundData.filter(r => r.host_correct).length;
    const opponentScore = roundData.filter(r => r.opponent_correct).length;
    const isHost = role === 'HOST';

    // Round check: Did both players answer?
    const currentRoundState = roundData.find(r => r.round_number === currentRound);
    const bothAnswered = currentRoundState?.host_answer && currentRoundState?.opponent_answer;

    useEffect(() => {
        if (bothAnswered && gameStatus === 'WAITING_NEXT') {
            const timeout = setTimeout(nextRound, 2000);
            return () => clearTimeout(timeout);
        }
    }, [bothAnswered, gameStatus]);

    return (
        <div className="w-full max-w-4xl mx-auto py-2 md:py-6 px-4">
            {/* DUEL HUD */}
            <div className="relative flex items-center justify-between mb-4 md:mb-8 bg-slate-800/20 p-2 md:p-4 rounded-2xl border border-slate-700/30">
                {/* Host Info */}
                <div className={`flex items-center gap-2 md:gap-3 ${isHost ? 'text-primary' : 'text-slate-500'}`}>
                    <div className="text-right hidden sm:block">
                        <div className="text-[9px] font-black uppercase opacity-60">P1 (Host)</div>
                        <div className="text-lg font-black italic">{hostScore} pts</div>
                    </div>
                    <div className={`size-10 md:size-12 rounded-xl bg-slate-900 border-2 ${isHost ? 'border-primary' : 'border-slate-800'} flex items-center justify-center overflow-hidden`}>
                        {matchData?.host?.image ? <img src={matchData.host.image} className="size-full" /> : <Icon name="person" size={20} />}
                    </div>
                </div>

                {/* Match Center */}
                <div className="text-center absolute left-1/2 -translate-x-1/2">
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">
                        RD {currentRound}/{matchData?.max_rounds || 10}
                    </div>
                    <div className={`text-2xl md:text-3xl lg:text-4xl font-black italic leading-none ${timeLeft <= 5 ? 'text-red-500' : 'text-white'}`}>
                        {timeLeft}s
                    </div>
                </div>

                {/* Opponent Info */}
                <div className={`flex items-center gap-2 md:gap-3 ${!isHost ? 'text-primary' : 'text-slate-500'}`}>
                    <div className={`size-10 md:size-12 rounded-xl bg-slate-900 border-2 ${!isHost ? 'border-primary' : 'border-slate-800'} flex items-center justify-center overflow-hidden`}>
                        {matchData?.opponent?.image ? <img src={matchData.opponent.image} className="size-full" /> : <Icon name="person" size={20} />}
                    </div>
                    <div className="hidden sm:block">
                        <div className="text-[9px] font-black uppercase opacity-60">P2 (Enemy)</div>
                        <div className="text-lg font-black italic">{opponentScore} pts</div>
                    </div>
                </div>
            </div>

            {/* EMOTE OVERLAYS */}
            <div className="relative h-0 w-full pointer-events-none z-50">
                <AnimatePresence>
                    {activeEmotes.map(emote => (
                        <motion.div
                            key={emote.id}
                            initial={{ opacity: 0, y: 0, x: emote.side === 'left' ? -20 : 20, scale: 0.5 }}
                            animate={{ opacity: 1, y: -100, x: emote.side === 'left' ? -40 : 40, scale: 1.5 }}
                            exit={{ opacity: 0, scale: 0.5 }}
                            className={`absolute top-0 ${emote.side === 'left' ? 'left-4' : 'right-4'} text-4xl`}
                        >
                            {emote.emoji}
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* PROGRESS BARS - THINNER */}
            <div className="grid grid-cols-2 gap-2 mb-6 md:mb-10 px-1">
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(hostScore / (matchData?.max_rounds || 10)) * 100}%` }}
                        className="h-full bg-primary shadow-[0_0_8px_rgba(20,184,166,0.4)]"
                    />
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden flex justify-end">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(opponentScore / (matchData?.max_rounds || 10)) * 100}%` }}
                        className="h-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]"
                    />
                </div>
            </div>

            {/* QUESTION AREA */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentRound}
                    initial={{ opacity: 0, scale: 0.98, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.02, y: -10 }}
                    className="space-y-4 md:space-y-6"
                >
                    <Card className="p-6 md:p-10 text-center bg-slate-900/40 border-2 border-slate-800 relative overflow-hidden group min-h-[120px] md:min-h-[160px] flex items-center justify-center">
                        <div className="absolute top-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
                        <h2 className="text-xl md:text-3xl lg:text-5xl font-black text-white italic tracking-tight leading-snug">
                            "{question?.q}"
                        </h2>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        {options.map((option, i) => {
                            const isSelected = selectedAnswer === option;
                            const isCorrect = option === question?.a;
                            const showResult = gameStatus === 'WAITING_NEXT' && bothAnswered;

                            return (
                                <motion.button
                                    key={i}
                                    whileHover={!isAnswering ? { scale: 1.01, x: 4 } : {}}
                                    whileTap={!isAnswering ? { scale: 0.99 } : {}}
                                    onClick={() => handleAnswer(option)}
                                    disabled={isAnswering}
                                    className={`
                                        p-4 md:p-5 rounded-2xl md:rounded-3xl border-2 text-left transition-all relative group
                                        ${isSelected ? 'bg-primary/10 border-primary' : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'}
                                        ${showResult && isCorrect ? 'bg-green-500/10 border-green-500/50 shadow-[0_0_15px_rgba(34,197,94,0.15)]' : ''}
                                        ${showResult && isSelected && !isCorrect ? 'bg-red-500/10 border-red-500/50' : ''}
                                        ${isAnswering && !isSelected ? 'opacity-50 grayscale-[0.5]' : ''}
                                    `}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`size-8 md:size-9 rounded-xl flex items-center justify-center font-black text-sm md:text-lg
                                            ${isSelected ? 'bg-primary text-white' : 'bg-slate-800 text-slate-500 group-hover:text-slate-300'}
                                        `}>
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                        <div className="text-base md:text-lg font-black text-white/90 truncate">{option}</div>
                                    </div>

                                    {/* Reveal Opponent Answer Indicator */}
                                    {showResult && currentRoundState?.[isHost ? 'opponent_answer' : 'host_answer'] === option && (
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                                            <div className="size-6 md:size-7 rounded-lg bg-blue-500/80 p-1 backdrop-blur-sm border border-blue-400/50 flex items-center justify-center">
                                                <Icon name="person" size={14} className="text-white" />
                                            </div>
                                        </div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* STATUS MESSAGE */}
            <div className="mt-6 text-center h-6 overflow-hidden">
                <AnimatePresence>
                    {isAnswering && !bothAnswered && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            <span className="animate-pulse">Locking on... Waiting for opponent strike</span>
                        </motion.div>
                    )}
                    {bothAnswered && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-primary text-xs font-black uppercase tracking-widest italic"
                        >
                            Next tactical round starting... ⚔️
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            {/* INTERACTION HUB */}
            <div className="mt-8 flex items-center justify-center gap-2">
                {['🔥', '💀', '🤡', '⚡', '😎', '🤝'].map(emoji => (
                    <motion.button
                        key={emoji}
                        whileHover={{ scale: 1.2, y: -4 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                            if (channelRef.current && session?.user?.id) {
                                channelRef.current.send({
                                    type: 'broadcast',
                                    event: 'emote',
                                    payload: { emoji, userId: session.user.id }
                                });
                                // Also show for self
                                const side: 'left' | 'right' = isHost ? 'left' : 'right';
                                const newEmote = { id: Math.random().toString(), emoji, userId: session.user.id, side };
                                setActiveEmotes(prev => [...prev, newEmote]);
                                setTimeout(() => setActiveEmotes(prev => prev.filter(e => e.id !== newEmote.id)), 3000);
                            }
                        }}
                        className="size-10 md:size-12 rounded-xl bg-slate-800/40 border border-slate-700 flex items-center justify-center text-xl md:text-2xl hover:bg-slate-700/60 transition-colors"
                    >
                        {emoji}
                    </motion.button>
                ))}
            </div>
        </div>
    );
};
