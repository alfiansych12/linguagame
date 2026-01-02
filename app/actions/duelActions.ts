'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin as supabase } from '@/lib/db/supabase-admin';
import { moderateRatelimit } from '@/lib/ratelimit';

/**
 * V3.1 REAL-TIME DUEL ACTIONS
 * Server actions for managing live PvP matches
 */

interface CreateMatchData {
    gameMode: 'VOCAB' | 'GRAMMAR' | 'SPEED_BLITZ';
    maxRounds?: number;
}

interface JoinMatchData {
    roomCode: string;
}

/**
 * Create a new duel match
 */
export async function createDuelMatch(data: CreateMatchData) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        // Rate limiting
        const { success: limitSuccess } = await moderateRatelimit.limit(session.user.id);
        if (!limitSuccess) {
            return { success: false, error: 'Sabar bro, jangan spam create room!' };
        }

        // Generate unique room code
        const roomCode = generateRoomCode();

        // Create match
        const { data: match, error } = await supabase
            .from('duel_matches')
            .insert({
                room_code: roomCode,
                host_id: session.user.id,
                game_mode: data.gameMode,
                max_rounds: data.maxRounds || 10,
                status: 'WAITING'
            })
            .select()
            .single();

        if (error) {
            console.error('Create match error:', error);
            return { success: false, error: 'Failed to create match' };
        }

        return {
            success: true,
            match: {
                id: match.id,
                roomCode: match.room_code,
                gameMode: match.game_mode,
                maxRounds: match.max_rounds
            }
        };
    } catch (error) {
        console.error('createDuelMatch error:', error);
        return { success: false, error: 'Internal Error' };
    }
}

/**
 * Join an existing duel match
 */
export async function joinDuelMatch(data: JoinMatchData) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        // Find match by room code
        const { data: match, error: fetchError } = await supabase
            .from('duel_matches')
            .select('*')
            .eq('room_code', data.roomCode.toUpperCase())
            .eq('status', 'WAITING')
            .single();

        if (fetchError || !match) {
            return { success: false, error: 'Room tidak ditemukan atau sudah penuh!' };
        }

        // Check if user is trying to join their own room
        if (match.host_id === session.user.id) {
            return { success: false, error: 'Kamu tidak bisa join room sendiri bro!' };
        }

        // Check if room already has opponent
        if (match.opponent_id) {
            return { success: false, error: 'Room sudah penuh!' };
        }

        // Join match
        const { error: updateError } = await supabase
            .from('duel_matches')
            .update({
                opponent_id: session.user.id,
                status: 'READY'
            })
            .eq('id', match.id);

        if (updateError) {
            console.error('Join match error:', updateError);
            return { success: false, error: 'Failed to join match' };
        }

        // Create presence for opponent
        await supabase
            .from('duel_presence')
            .insert({
                user_id: session.user.id,
                match_id: match.id,
                is_online: true
            });

        return {
            success: true,
            match: {
                id: match.id,
                roomCode: match.room_code,
                hostId: match.host_id,
                gameMode: match.game_mode
            }
        };
    } catch (error) {
        console.error('joinDuelMatch error:', error);
        return { success: false, error: 'Internal Error' };
    }
}

/**
 * Join an existing duel match by ID (For invites)
 */
export async function joinDuelMatchById(matchId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        // Find match
        const { data: match, error: fetchError } = await supabase
            .from('duel_matches')
            .select('*')
            .eq('id', matchId)
            .single();

        if (fetchError || !match) {
            return { success: false, error: 'Match tidak ditemukan' };
        }

        // If already in match, just return
        if (match.host_id === session.user.id || match.opponent_id === session.user.id) {
            return {
                success: true,
                match: {
                    id: match.id,
                    roomCode: match.room_code,
                    hostId: match.host_id,
                    gameMode: match.game_mode
                }
            };
        }

        // Check if full
        if (match.opponent_id && match.opponent_id !== session.user.id) {
            return { success: false, error: 'Room sudah penuh!' };
        }

        // Join match
        const { error: updateError } = await supabase
            .from('duel_matches')
            .update({
                opponent_id: session.user.id,
                status: 'READY'
            })
            .eq('id', match.id);

        if (updateError) {
            return { success: false, error: 'Failed to join match' };
        }

        // Create presence
        await supabase
            .from('duel_presence')
            .upsert({
                user_id: session.user.id,
                match_id: match.id,
                is_online: true
            });

        return {
            success: true,
            match: {
                id: match.id,
                roomCode: match.room_code,
                hostId: match.host_id,
                gameMode: match.game_mode
            }
        };
    } catch (error) {
        console.error('joinDuelMatchById error:', error);
        return { success: false, error: 'Internal Error' };
    }
}

/**
 * Start the duel match (both players ready)
 */
export async function startDuelMatch(matchId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        // Verify user is in the match
        const { data: match } = await supabase
            .from('duel_matches')
            .select('*')
            .eq('id', matchId)
            .single();

        if (!match) {
            return { success: false, error: 'Match not found' };
        }

        const isParticipant = match.host_id === session.user.id || match.opponent_id === session.user.id;
        if (!isParticipant) {
            return { success: false, error: 'Unauthorized' };
        }

        // Update ready status
        const updateField = match.host_id === session.user.id ? 'host_ready' : 'opponent_ready';

        const { data: updated, error } = await supabase
            .from('duel_matches')
            .update({ [updateField]: true })
            .eq('id', matchId)
            .select()
            .single();

        if (error) {
            return { success: false, error: 'Failed to update ready status' };
        }

        // If both ready, start the match
        if (updated.host_ready && updated.opponent_ready) {
            await supabase
                .from('duel_matches')
                .update({
                    status: 'PLAYING',
                    started_at: new Date().toISOString()
                })
                .eq('id', matchId);

            return { success: true, started: true };
        }

        return { success: true, started: false };
    } catch (error) {
        console.error('startDuelMatch error:', error);
        return { success: false, error: 'Internal Error' };
    }
}

/**
 * Submit answer for current round
 */
export async function submitDuelAnswer(data: {
    matchId: string;
    roundNumber: number;
    answer: string;
    timeMs: number;
    isCorrect: boolean;
}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        // Get match to determine if host or opponent
        const { data: match } = await supabase
            .from('duel_matches')
            .select('host_id, opponent_id')
            .eq('id', data.matchId)
            .single();

        if (!match) {
            return { success: false, error: 'Match not found' };
        }

        const isHost = match.host_id === session.user.id;
        const answerField = isHost ? 'host_answer' : 'opponent_answer';
        const timeField = isHost ? 'host_time_ms' : 'opponent_time_ms';
        const correctField = isHost ? 'host_correct' : 'opponent_correct';

        // Upsert round data
        const { error } = await supabase
            .from('duel_rounds')
            .upsert({
                match_id: data.matchId,
                round_number: data.roundNumber,
                question_id: `q_${data.roundNumber}`,
                [answerField]: data.answer,
                [timeField]: data.timeMs,
                [correctField]: data.isCorrect
            }, {
                onConflict: 'match_id,round_number'
            });

        if (error) {
            console.error('Submit answer error:', error);
            return { success: false, error: 'Failed to submit answer' };
        }

        return { success: true };
    } catch (error) {
        console.error('submitDuelAnswer error:', error);
        return { success: false, error: 'Internal Error' };
    }
}

/**
 * Submit answer for the BOT (V3.4)
 * Only the Host can call this if the opponent is a BOT.
 */
export async function submitBotAnswer(data: {
    matchId: string;
    roundNumber: number;
    answer: string;
    timeMs: number;
    isCorrect: boolean;
}) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        // Get match 
        const { data: match } = await supabase
            .from('duel_matches')
            .select('host_id, opponent_id')
            .eq('id', data.matchId)
            .single();

        if (!match || !match.opponent_id?.startsWith('BOT_')) {
            return { success: false, error: 'Target is not a bot or match not found' };
        }

        // Verify requester is the host
        if (match.host_id !== session.user.id) {
            return { success: false, error: 'Only commander can issue bot orders' };
        }

        // Upsert round data for the bot (opponent)
        const { error } = await supabase
            .from('duel_rounds')
            .upsert({
                match_id: data.matchId,
                round_number: data.roundNumber,
                question_id: `q_${data.roundNumber}`,
                opponent_answer: data.answer,
                opponent_time_ms: data.timeMs,
                opponent_correct: data.isCorrect
            }, {
                onConflict: 'match_id,round_number'
            });

        if (error) {
            console.error('Submit bot answer error:', error);
            return { success: false, error: 'Failed to submit bot strike' };
        }

        return { success: true };
    } catch (error) {
        console.error('submitBotAnswer error:', error);
        return { success: false, error: 'Internal Error' };
    }
}

/**
 * Update presence heartbeat
 */
export async function updatePresence(matchId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false };

        await supabase
            .from('duel_presence')
            .upsert({
                user_id: session.user.id,
                match_id: matchId,
                last_heartbeat: new Date().toISOString(),
                is_online: true
            });

        return { success: true };
    } catch (error) {
        return { success: false };
    }
}

/**
 * Finish match and calculate winner
 */
export async function finishDuelMatch(matchId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        // Get all rounds
        const { data: rounds } = await supabase
            .from('duel_rounds')
            .select('*')
            .eq('match_id', matchId);

        if (!rounds) {
            return { success: false, error: 'No rounds found' };
        }

        // Calculate scores
        let hostScore = 0;
        let opponentScore = 0;

        rounds.forEach(round => {
            if (round.host_correct) hostScore++;
            if (round.opponent_correct) opponentScore++;
        });

        // Determine winner
        const { data: match } = await supabase
            .from('duel_matches')
            .select('host_id, opponent_id')
            .eq('id', matchId)
            .single();

        if (!match) {
            return { success: false, error: 'Match not found' };
        }

        const winnerId = hostScore > opponentScore ? match.host_id :
            opponentScore > hostScore ? match.opponent_id : null;

        // Update match
        const { error } = await supabase
            .from('duel_matches')
            .update({
                status: 'FINISHED',
                host_score: hostScore,
                opponent_score: opponentScore,
                winner_id: winnerId,
                ended_at: new Date().toISOString()
            })
            .eq('id', matchId);

        if (error) {
            return { success: false, error: 'Failed to finish match' };
        }

        // Award Crystals to winner
        if (winnerId) {
            const { data: winner } = await supabase
                .from('users')
                .select('gems, duel_wins, total_xp, is_pro, pro_until')
                .eq('id', winnerId)
                .single();

            if (winner) {
                // Calculate XP Reward (150 base, 225 for PRO)
                const isPro = winner.is_pro && winner.pro_until && new Date(winner.pro_until) > new Date();
                const xpReward = isPro ? 225 : 150;

                await supabase
                    .from('users')
                    .update({
                        gems: (winner.gems || 0) + 100,
                        duel_wins: (winner.duel_wins || 0) + 1,
                        total_xp: (winner.total_xp || 0) + xpReward
                    })
                    .eq('id', winnerId);
            }
        }

        return {
            success: true,
            result: {
                hostScore,
                opponentScore,
                winnerId
            }
        };
    } catch (error) {
        console.error('finishDuelMatch error:', error);
        return { success: false, error: 'Internal Error' };
    }
}

/**
 * Get match details (Server-side bypass RLS)
 */
export async function getDuelMatch(matchId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const { data: match, error } = await supabase
            .from('duel_matches')
            .select(`
                *,
                host:host_id(id, name, image),
                opponent:opponent_id(id, name, image)
            `)
            .eq('id', matchId)
            .single();

        if (error || !match) {
            return { success: false, error: 'Match tidak ditemukan' };
        }

        return { success: true, match };
    } catch (error) {
        return { success: false, error: 'Internal Error' };
    }
}

/**
 * Reset match for a rematch (Maintain room, reset scores and states)
 */
export async function resetMatchForRematch(matchId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        // 1. Reset match status and scores
        const { error: matchError } = await supabase
            .from('duel_matches')
            .update({
                status: 'READY',
                host_ready: false,
                opponent_ready: false,
                host_score: 0,
                opponent_score: 0,
                current_round: 0,
                winner_id: null,
                started_at: null,
                ended_at: null
            })
            .eq('id', matchId);

        if (matchError) {
            console.error('Reset match error:', matchError);
            return { success: false, error: 'Failed to reset match' };
        }

        // 2. Clean up old rounds
        const { error: roundsError } = await supabase
            .from('duel_rounds')
            .delete()
            .eq('match_id', matchId);

        if (roundsError) {
            console.error('Clear rounds error:', roundsError);
        }

        return { success: true };
    } catch (error) {
        console.error('resetMatchForRematch error:', error);
        return { success: false, error: 'Internal Error' };
    }
}

/**
 * Helper: Generate unique room code
 */
function generateRoomCode(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}
/**
 * Join an AI Bot to the match (V3.4)
 */
export async function joinBotToMatch(matchId: string, difficulty: 'EASY' | 'MEDIUM' | 'HARD') {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const botProfiles = {
            EASY: { id: 'BOT_EASY', name: 'Recruit AI', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=easy' },
            MEDIUM: { id: 'BOT_MEDIUM', name: 'Tactical AI', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=medium' },
            HARD: { id: 'BOT_HARD', name: 'Quantum AI Elite', image: 'https://api.dicebear.com/7.x/bottts/svg?seed=hard' }
        };

        const bot = botProfiles[difficulty];

        // Join match as bot
        const { error: updateError } = await supabase
            .from('duel_matches')
            .update({
                opponent_id: bot.id,
                status: 'PLAYING',
                host_ready: true,
                opponent_ready: true,
                started_at: new Date().toISOString()
            })
            .eq('id', matchId);

        if (updateError) {
            console.error('Join bot error:', updateError);
            return { success: false, error: 'Failed to deploy AI unit' };
        }

        return { success: true, bot };
    } catch (error) {
        console.error('joinBotToMatch error:', error);
        return { success: false, error: 'Internal Error' };
    }
}
/**
 * Get count of duel matches played today (V3.4)
 */
export async function getDailyDuelCount() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, count: 0 };

        const userId = session.user.id;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const { count, error } = await supabase
            .from('duel_matches')
            .select('*', { count: 'exact', head: true })
            .or(`host_id.eq.${userId},opponent_id.eq.${userId}`)
            .gte('created_at', today.toISOString());

        if (error) {
            console.error('getDailyDuelCount error:', error);
            return { success: false, count: 0 };
        }

        return { success: true, count: count || 0 };
    } catch (error) {
        return { success: false, count: 0 };
    }
}
