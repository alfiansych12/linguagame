import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';

export interface DuelRoom {
    id: string;
    code: string;
    host_id: string | null;
    status: 'WAITING' | 'STARTING' | 'PLAYING' | 'FINISHED';
    max_players: number;
    time_limit: number;
    created_at: string;
}

export interface DuelPlayer {
    id: string;
    room_id: string;
    user_id: string | null;
    name: string;
    score: number;
    is_ready: boolean;
}

/**
 * Creates a new duel room with a unique 4-digit code
 */
export async function createDuelRoom(hostName: string, userId: string | null = null) {
    // Generate a random 4-digit numeric code
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // 1. Create the room
    const { data: room, error: roomError } = await supabase
        .from('duel_rooms')
        .insert({
            code,
            status: 'WAITING',
            max_players: 5,
            time_limit: 60
        })
        .select()
        .single();

    if (roomError) throw roomError;

    // 2. Add the host as the first player
    const playerPayload: any = {
        room_id: room.id,
        name: hostName,
        is_ready: true
    };

    // Only add user_id if it looks like a valid UUID to match the DB column type
    if (userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
        playerPayload.user_id = userId;
    }

    const { data: player, error: playerError } = await supabase
        .from('duel_players')
        .insert(playerPayload)
        .select()
        .single();

    if (playerError) throw playerError;

    return { room, player };
}

/**
 * Joins an existing duel room using a code
 */
export async function joinDuelRoom(code: string, playerName: string, userId: string | null = null) {
    // 1. Find the room
    const { data: room, error: roomError } = await supabase
        .from('duel_rooms')
        .select('*')
        .eq('code', code)
        .eq('status', 'WAITING')
        .single();

    if (roomError) throw new Error('Room not found or game already started');

    // 2. Check player count
    const { count, error: countError } = await supabase
        .from('duel_players')
        .select('*', { count: 'exact', head: true })
        .eq('room_id', room.id);

    if (countError) throw countError;
    if (count && count >= room.max_players) throw new Error('Bro full! Room is at max capacity.');

    // 3. Add the player
    const playerPayload: any = {
        room_id: room.id,
        name: playerName,
        is_ready: false
    };

    if (userId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId)) {
        playerPayload.user_id = userId;
    }

    const { data: player, error: playerError } = await supabase
        .from('duel_players')
        .insert(playerPayload)
        .select()
        .single();

    if (playerError) throw playerError;

    return { room, player };
}

/**
 * Gets all players in a room
 */
export async function getRoomPlayers(roomId: string) {
    const { data, error } = await supabase
        .from('duel_players')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
}

/**
 * Updates player ready status
 */
export async function setPlayerReady(playerId: string, isReady: boolean) {
    const { error } = await supabase
        .from('duel_players')
        .update({ is_ready: isReady })
        .eq('id', playerId);

    if (error) throw error;
}

/**
 * Updates player score
 */
export async function updatePlayerScore(playerId: string, score: number) {
    const { error } = await supabase
        .from('duel_players')
        .update({ score })
        .eq('id', playerId);

    if (error) throw error;
}

/**
 * Starts the game in a room
 */
export async function startDuel(roomId: string) {
    const { error } = await supabase
        .from('duel_rooms')
        .update({ status: 'STARTING' })
        .eq('id', roomId);

    if (error) throw error;
}

/**
 * Updates room settings
 */
export async function updateRoomSettings(roomId: string, timeLimit: number, settings: any) {
    const { error } = await supabase
        .from('duel_rooms')
        .update({
            time_limit: timeLimit,
            settings: settings
        })
        .eq('id', roomId);

    if (error) throw error;
}

/**
 * Ends the game in a room
 */
export async function endDuel(roomId: string) {
    const { error } = await supabase
        .from('duel_rooms')
        .update({ status: 'FINISHED' })
        .eq('id', roomId);

    if (error) throw error;
}
