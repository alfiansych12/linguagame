'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin as supabase } from '@/lib/db/supabase-admin';

/**
 * SOCIAL & FRIEND ACTIONS
 */

export async function addFriend(friendId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const { error } = await supabase
            .from('friends')
            .insert({
                user_id: session.user.id,
                friend_id: friendId,
                status: 'PENDING'
            });

        if (error) {
            if (error.code === '23505') return { success: false, error: 'Sudah berteman atau permintaan terkirim!' };
            return { success: false, error: 'Gagal menambah teman' };
        }

        return { success: true };
    } catch (error) {
        return { success: false, error: 'Internal Error' };
    }
}

export async function acceptFriend(friendId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const { error } = await supabase
            .from('friends')
            .update({ status: 'ACCEPTED' })
            .eq('user_id', friendId)
            .eq('friend_id', session.user.id);

        if (error) return { success: false, error: 'Gagal menerima teman' };

        return { success: true };
    } catch (error) {
        return { success: false, error: 'Internal Error' };
    }
}

export async function declineFriend(friendId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const { error } = await supabase
            .from('friends')
            .delete()
            .eq('user_id', friendId)
            .eq('friend_id', session.user.id);

        if (error) return { success: false, error: 'Gagal menolak pertemanan' };
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Internal Error' };
    }
}

export async function removeFriend(friendId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        await supabase.from('friends').delete().eq('user_id', session.user.id).eq('friend_id', friendId);
        await supabase.from('friends').delete().eq('user_id', friendId).eq('friend_id', session.user.id);

        return { success: true };
    } catch (error) {
        return { success: false, error: 'Internal Error' };
    }
}

export async function getFriendsList() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        // Fetch accepted friends where I am either user_id or friend_id
        const { data, error } = await supabase
            .from('friends')
            .select(`
                status,
                user_id,
                friend_id,
                friend_data:friend_id(id, name, image, total_xp, duel_wins, last_login_at),
                user_data:user_id(id, name, image, total_xp, duel_wins, last_login_at)
            `)
            .or(`user_id.eq.${session.user.id},friend_id.eq.${session.user.id}`)
            .eq('status', 'ACCEPTED');

        if (error) return { success: false, error: 'Gagal mengambil daftar teman' };

        // Format and Deduplicate (just in case)
        const seenIds = new Set();
        const friendsList = data.reduce((acc: any[], f: any) => {
            const isMe = f.user_id === session.user.id;
            let friend = isMe ? f.friend_data : f.user_data;
            if (Array.isArray(friend)) friend = friend[0];

            if (friend && !seenIds.has(friend.id)) {
                seenIds.add(friend.id);
                acc.push(friend);
            }
            return acc;
        }, []);

        return { success: true, friends: friendsList };
    } catch (error) {
        return { success: false, error: 'Internal Error' };
    }
}

export async function getFriendRequests() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const { data, error } = await supabase
            .from('friends')
            .select(`
                id,
                created_at,
                sender:user_id(id, name, image, total_xp)
            `)
            .eq('friend_id', session.user.id)
            .eq('status', 'PENDING');

        if (error) return { success: false, error: 'Gagal mengambil permintaan teman' };
        return { success: true, requests: data };
    } catch (error) {
        return { success: false, error: 'Internal Error' };
    }
}

export async function sendDuelInvite(friendId: string, matchId: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const { error } = await supabase
            .from('duel_invites')
            .insert({
                match_id: matchId,
                sender_id: session.user.id,
                receiver_id: friendId,
                status: 'PENDING'
            });

        if (error) return { success: false, error: 'Gagal mengirim invite' };
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Internal Error' };
    }
}

export async function getDuelInvites() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();

        const { data, error } = await supabase
            .from('duel_invites')
            .select(`
                *,
                sender:sender_id(id, name, image),
                match:match_id(id, room_code, game_mode)
            `)
            .eq('receiver_id', session.user.id)
            .eq('status', 'PENDING')
            .gt('created_at', twoMinutesAgo)
            .order('created_at', { ascending: false });

        if (error) return { success: false, error: 'Gagal mengambil invite' };
        return { success: true, invites: data };
    } catch (error) {
        return { success: false, error: 'Internal Error' };
    }
}
