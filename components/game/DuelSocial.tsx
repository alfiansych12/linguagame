'use client';

import React, { useEffect, useState } from 'react';
import { Card, Icon, Button, Badge } from '@/components/ui/UIComponents';
import { motion, AnimatePresence } from 'framer-motion';
import { getFriendsList, getDuelInvites, sendDuelInvite, getFriendRequests, acceptFriend, declineFriend } from '@/app/actions/socialActions';
import { createDuelMatch } from '@/app/actions/duelActions';
import { supabase } from '@/lib/db/supabase';
import { useSession } from 'next-auth/react';
import { useSound } from '@/hooks/use-sound';
import Link from 'next/link';

interface DuelSocialProps {
    currentMatchId?: string;
    onJoinInvite: (matchId: string) => void;
    onJoinMatch: (matchId: string, role: 'HOST' | 'OPPONENT') => void;
}

export const DuelSocial: React.FC<DuelSocialProps> = ({ currentMatchId, onJoinInvite, onJoinMatch }) => {
    const { data: session } = useSession();
    const { playSound } = useSound();
    const [friends, setFriends] = useState<any[]>([]);
    const [invites, setInvites] = useState<any[]>([]);
    const [friendRequests, setFriendRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [challengingId, setChallengingId] = useState<string | null>(null);
    const [showModeSelect, setShowModeSelect] = useState<string | null>(null);
    const [inviteSentTo, setInviteSentTo] = useState<string[]>([]);

    useEffect(() => {
        if (!session?.user?.id) return;

        fetchSocialData();

        // Subscribe to NEW INVITES
        const channel = supabase
            .channel(`social:${session.user.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'duel_invites',
                filter: `receiver_id=eq.${session.user.id}`
            }, () => {
                fetchInvites();
                playSound('SUCCESS'); // Use as notification sound
            })
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'friends',
                filter: `friend_id=eq.${session.user.id}`
            }, () => {
                fetchFriendRequests();
                playSound('CRYSTAL'); // Sweet notification sound
            })
            .subscribe();

        // Expire invites checker (local UI)
        const expiryTimer = setInterval(() => {
            setInvites(prev => prev.filter(inv => {
                const age = Date.now() - new Date(inv.created_at).getTime();
                return age < 120000; // 2 minutes
            }));
        }, 5000);

        return () => {
            channel.unsubscribe();
            clearInterval(expiryTimer);
        };
    }, [session?.user?.id]);

    const fetchSocialData = async () => {
        setLoading(true);
        await Promise.all([fetchFriends(), fetchInvites(), fetchFriendRequests()]);
        setLoading(false);
    };

    const fetchFriends = async () => {
        const result = await getFriendsList();
        if (result.success) setFriends(result.friends || []);
    };

    const fetchInvites = async () => {
        const result = await getDuelInvites();
        if (result.success) setInvites(result.invites || []);
    };

    const fetchFriendRequests = async () => {
        const result = await getFriendRequests();
        if (result.success) setFriendRequests(result.requests || []);
    };

    const handleAcceptFriend = async (friendId: string) => {
        playSound('SUCCESS');
        const res = await acceptFriend(friendId);
        if (res.success) {
            fetchFriendRequests();
            fetchFriends();
        }
    };

    const handleDeclineFriend = async (friendId: string) => {
        playSound('WRONG');
        const res = await declineFriend(friendId);
        if (res.success) {
            fetchFriendRequests();
        }
    };

    const handleSendInvite = async (friendId: string) => {
        if (!currentMatchId) return;
        playSound('CLICK');
        setInviteSentTo(prev => [...prev, friendId]);
        await sendDuelInvite(friendId, currentMatchId);
    };

    const handleDirectChallenge = async (friendId: string, gameMode: 'VOCAB' | 'GRAMMAR' | 'SPEED_BLITZ') => {
        setChallengingId(friendId);
        setShowModeSelect(null);
        playSound('START');

        try {
            const res = await createDuelMatch({ gameMode, maxRounds: 10 });

            if (res.success && res.match) {
                const matchId = res.match.id;
                await sendDuelInvite(friendId, matchId);
                setInviteSentTo(prev => [...prev, friendId]);
                onJoinMatch(matchId, 'HOST');
            }
        } catch (err) {
            console.error('Challenge failed:', err);
        } finally {
            setChallengingId(null);
        }
    };


    if (!session) return null;

    return (
        <div className="space-y-6">
            {/* INCOMING INVITES */}
            <AnimatePresence>
                {invites.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                    >
                        <h3 className="text-xs font-black text-primary uppercase tracking-widest flex items-center gap-2">
                            <Icon name="notification_important" size={16} /> Incoming Challenges
                        </h3>
                        {invites.map(invite => {
                            const timeLeftSec = Math.max(0, Math.floor((120000 - (Date.now() - new Date(invite.created_at).getTime())) / 1000));

                            return (
                                <Card key={invite.id} className="p-3 bg-primary/10 border-primary/30 flex items-center justify-between overflow-hidden relative group">
                                    {/* Expiry Progress Mini-bar */}
                                    <div className="absolute bottom-0 left-0 h-0.5 bg-primary/30 w-full">
                                        <motion.div
                                            initial={{ width: '100%' }}
                                            animate={{ width: '0%' }}
                                            transition={{ duration: timeLeftSec, ease: 'linear' }}
                                            className="h-full bg-primary"
                                        />
                                    </div>

                                    <div className="flex items-center gap-3 relative z-10">
                                        <img src={invite.sender.image} className="size-8 rounded-lg border border-primary/20" />
                                        <div>
                                            <p className="text-[10px] font-black text-white leading-none">{invite.sender.name}</p>
                                            <p className="text-[8px] font-bold text-primary uppercase">
                                                {invite.match.game_mode} Arena <span className="text-white/40 ml-1">({timeLeftSec}s)</span>
                                            </p>
                                        </div>
                                    </div>
                                    <Button size="sm" variant="primary" onClick={() => onJoinInvite(invite.match.id)} className="relative z-10">
                                        JOIN
                                    </Button>
                                </Card>
                            )
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FRIEND REQUESTS */}
            <AnimatePresence>
                {friendRequests.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                    >
                        <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest flex items-center gap-2">
                            <Icon name="person_add" size={16} /> New Friend Requests
                        </h3>
                        {friendRequests.map(req => (
                            <Card key={req.id} className="p-3 bg-blue-500/5 border-blue-500/20 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={req.sender.image} className="size-8 rounded-lg border border-blue-500/20" />
                                    <div>
                                        <p className="text-[10px] font-black text-white leading-none">{req.sender.name}</p>
                                        <p className="text-[8px] font-bold text-blue-500 uppercase">{req.sender.total_xp} XP</p>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleDeclineFriend(req.sender.id)}
                                        className="size-7 rounded-lg bg-slate-800 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-500/10 transition-all"
                                    >
                                        <Icon name="close" size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleAcceptFriend(req.sender.id)}
                                        className="size-7 rounded-lg bg-primary/20 flex items-center justify-center text-primary hover:bg-primary transition-all hover:text-white"
                                    >
                                        <Icon name="check" size={16} />
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* FRIENDS LIST */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Icon name="groups" size={16} /> Online Friends
                    </h3>
                    <Badge variant="xp" className="text-[8px]">{friends.length}</Badge>
                </div>

                <div className="space-y-2">
                    {friends.length === 0 ? (
                        <div className="p-8 text-center border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
                            <Icon name="person_add" size={32} className="text-slate-700 mb-3" />
                            <p className="text-xs font-black text-slate-500 uppercase tracking-tighter">Belum ada teman online bro</p>
                            <p className="text-[9px] font-bold text-slate-600 uppercase mt-2 leading-relaxed">
                                Coba cek <Link href="/leaderboard" className="text-primary hover:underline">Leaderboard</Link> buat cari rival dan tambah teman!
                            </p>
                        </div>
                    ) : (
                        friends.map(friend => {
                            const isOnline = (Date.now() - new Date(friend.last_login_at || 0).getTime()) < 600000; // 10 mins threshold
                            const hasInvite = inviteSentTo.includes(friend.id);
                            const isChallenging = challengingId === friend.id;

                            return (
                                <Card key={friend.id} className="p-3 bg-slate-900/40 border-slate-800 flex items-center justify-between group">
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <img src={friend.image} className="size-9 rounded-xl grayscale group-hover:grayscale-0 transition-all" />
                                            {isOnline && <div className="absolute -bottom-1 -right-1 size-3 bg-green-500 border-2 border-slate-900 rounded-full" />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-white">{friend.name}</p>
                                            <p className="text-[8px] font-bold text-slate-500 uppercase">{friend.duel_wins} Arena Wins</p>
                                        </div>
                                    </div>
                                    {currentMatchId ? (
                                        <Button
                                            size="sm"
                                            variant={hasInvite ? "secondary" : "ghost"}
                                            disabled={hasInvite || !isOnline}
                                            onClick={() => handleSendInvite(friend.id)}
                                        >
                                            <Icon name={hasInvite ? "check" : "bolt"} size={14} className="mr-1" />
                                            {hasInvite ? "SENT" : "INVITE"}
                                        </Button>
                                    ) : (
                                        <div className="relative">
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                disabled={!isOnline || isChallenging}
                                                onClick={() => setShowModeSelect(showModeSelect === friend.id ? null : friend.id)}
                                                className="px-3"
                                            >
                                                {isChallenging ? (
                                                    <div className="size-4 animate-spin border-2 border-white/30 border-t-white rounded-full" />
                                                ) : (
                                                    <>
                                                        <Icon name="swords" size={14} className="mr-1" />
                                                        CHALLENGE
                                                    </>
                                                )}
                                            </Button>

                                            {/* Mode Selection Popover */}
                                            <AnimatePresence>
                                                {showModeSelect === friend.id && (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                                                        animate={{ opacity: 1, scale: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                                                        className="absolute right-0 bottom-full mb-2 bg-slate-900 border border-slate-700 p-2 rounded-2xl shadow-2xl z-50 flex flex-col gap-1 min-w-[160px] md:min-w-[140px]"
                                                    >
                                                        <div className="px-2 py-1 mb-1 border-b border-white/5 md:hidden">
                                                            <p className="text-[9px] font-black text-slate-500 uppercase">Select Arena</p>
                                                        </div>
                                                        {[
                                                            { id: 'VOCAB', label: 'VOCABULARY', color: 'text-orange-500' },
                                                            { id: 'GRAMMAR', label: 'GRAMMAR', color: 'text-blue-500' },
                                                            { id: 'SPEED_BLITZ', label: 'SPEED BLITZ', color: 'text-yellow-500' }
                                                        ].map(mode => (
                                                            <button
                                                                key={mode.id}
                                                                onClick={() => handleDirectChallenge(friend.id, mode.id as any)}
                                                                className="w-full text-left p-2.5 md:p-2 rounded-xl hover:bg-white/5 flex items-center gap-2 group/mode"
                                                            >
                                                                <div className={`size-2 rounded-full bg-current ${mode.color}`} />
                                                                <span className="text-[11px] md:text-[10px] font-black text-white italic group-hover/mode:translate-x-1 transition-transform">{mode.label}</span>
                                                            </button>
                                                        ))}
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    )}
                                </Card>
                            )
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
