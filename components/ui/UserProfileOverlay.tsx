'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Icon, Badge, Button } from '@/components/ui/UIComponents';
import { useSession } from 'next-auth/react';
import { addFriend } from '@/app/actions/socialActions';
import { AvatarFrame } from './AvatarFrame';
import { BorderSelector } from './BorderSelector';
import { RedeemSection } from './RedeemSection';
import Link from 'next/link';

interface UserProfileOverlayProps {
    user: any | null;
    onClose: () => void;
}

export const UserProfileOverlay: React.FC<UserProfileOverlayProps> = ({ user, onClose }) => {
    const { data: session } = useSession();
    const [showBorderSelector, setShowBorderSelector] = useState(false);
    const [friendshipLoading, setFriendshipLoading] = useState(false);
    const [friendshipSent, setFriendshipSent] = useState(false);

    // Check if viewing own profile
    const isMe = session?.user?.id === user?.id;

    if (!user) return null;

    // Helper for Avatar Fallback
    const getInitials = (name: string) => (name ? name.charAt(0).toUpperCase() : '?');
    const getGradient = (id: string) => {
        const gradients = [
            'from-blue-400 to-indigo-500',
            'from-purple-400 to-pink-500',
            'from-emerald-400 to-teal-500',
            'from-orange-400 to-red-500',
            'from-pink-400 to-rose-500'
        ];
        const index = (id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
        return gradients[index];
    };

    return (
        <>
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full max-w-[320px] relative px-2"
                    >
                        {/* Glow Effect */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 blur-[60px] rounded-full -z-10" />

                        <div className="bg-white/95 dark:bg-[#0a0a0f]/98 border border-white/20 dark:border-slate-800 rounded-[2rem] p-5 shadow-2xl relative overflow-hidden">
                            {/* Header Background */}
                            <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800" />

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 z-20 size-8 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center hover:bg-black/20 dark:hover:bg-white/20 transition-colors backdrop-blur-sm group"
                            >
                                <Icon name="close" size={18} className="text-slate-900 dark:text-white group-hover:rotate-90 transition-transform" />
                            </button>

                            {/* Profile Content */}
                            <div className="relative z-10 flex flex-col items-center">
                                {/* Avatar Frame Component */}
                                <div className="mb-3">
                                    <AvatarFrame
                                        src={user.image}
                                        alt={user.name}
                                        size="xl"
                                        borderId={
                                            // Admin gets gold_champion automatically
                                            user.name?.toLowerCase().includes('admin') || user.email?.toLowerCase().includes('admin')
                                                ? 'gold_champion'
                                                : (user.equipped_border || 'default')
                                        }
                                        fallbackInitial={getInitials(user.name)}
                                    />
                                </div>

                                {/* Name & Title */}
                                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter text-center leading-none mb-1">
                                    {user.name}
                                </h2>
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-4 bg-primary/10 px-3 py-0.5 rounded-full">
                                    Bro Member
                                </span>

                                {/* Edit Border Button - Only for me */}
                                {isMe && (
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        onClick={() => setShowBorderSelector(true)}
                                        className="mb-5 py-1 px-4 h-auto text-[10px] rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10"
                                    >
                                        <Icon name="palette" size={12} className="mr-1" />
                                        Ganti Border
                                    </Button>
                                )}

                                {/* Add Friend Button - For others */}
                                {!isMe && session?.user?.id && (
                                    <Button
                                        variant={friendshipSent ? "success" : "primary"}
                                        size="sm"
                                        disabled={friendshipLoading || friendshipSent}
                                        onClick={async () => {
                                            setFriendshipLoading(true);
                                            const res = await addFriend(user.id);
                                            if (res.success) setFriendshipSent(true);
                                            setFriendshipLoading(false);
                                        }}
                                        className="mb-5 py-2 px-6 h-auto text-[10px] rounded-xl font-black italic tracking-widest"
                                    >
                                        <Icon name={friendshipSent ? "check" : "person_add"} size={14} className="mr-2" />
                                        {friendshipLoading ? 'MENGHUBUNGKAN...' : friendshipSent ? 'PERMINTAAN TERKIRIM!' : 'TAMBAH TEMAN'}
                                    </Button>
                                )}

                                {/* Stats Grid */}
                                <div className="w-full grid grid-cols-2 gap-2 mb-4">
                                    <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-col items-center text-center">
                                        <div className="size-7 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center mb-1">
                                            <Icon name="translate" size={16} />
                                        </div>
                                        <span className="text-xl font-black text-slate-900 dark:text-white leading-none">
                                            {(user.vocab_count || 0).toLocaleString('id-ID')}
                                        </span>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                            Vocab
                                        </span>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-col items-center text-center">
                                        <div className="size-7 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-1">
                                            <Icon name="emoji_events" size={16} />
                                        </div>
                                        <span className="text-xl font-black text-slate-900 dark:text-white leading-none">
                                            {(user.duel_wins || 0).toLocaleString('id-ID')}
                                        </span>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                            Wins
                                        </span>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-col items-center text-center">
                                        <div className="size-7 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-1">
                                            <Icon name="bolt" size={16} filled />
                                        </div>
                                        <span className="text-xl font-black text-slate-900 dark:text-white leading-none">
                                            {(user.total_xp || 0).toLocaleString('id-ID')}
                                        </span>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                            Total XP
                                        </span>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5 flex flex-col items-center text-center">
                                        <div className="size-7 rounded-full bg-orange-500/10 text-orange-500 flex items-center justify-center mb-1">
                                            <Icon name="local_fire_department" size={16} filled />
                                        </div>
                                        <span className="text-xl font-black text-slate-900 dark:text-white leading-none">
                                            {(user.current_streak || 0).toLocaleString('id-ID')}
                                        </span>
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                            Streak
                                        </span>
                                    </div>
                                </div>

                                {/* Crystal Inventory - Only for Me */}
                                {isMe && (
                                    <div className="w-full mb-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 px-1">Inventory Crystal</p>
                                        <div className="grid grid-cols-6 gap-2 bg-slate-50 dark:bg-white/5 p-3 rounded-2xl border border-slate-100 dark:border-white/5">
                                            {[
                                                { id: 'shield', icon: 'security', color: 'text-blue-500' },
                                                { id: 'booster', icon: 'bolt', color: 'text-amber-500' },
                                                { id: 'hint', icon: 'psychology', color: 'text-purple-500' },
                                                { id: 'focus', icon: 'timer_off', color: 'text-sky-500' },
                                                { id: 'timefreeze', icon: 'ac_unit', color: 'text-cyan-400' },
                                                { id: 'eraser', icon: 'auto_fix_high', color: 'text-indigo-400' },
                                                { id: 'timewarp', icon: 'update', color: 'text-sky-400' },
                                                { id: 'oracle', icon: 'visibility', color: 'text-amber-400' },
                                                { id: 'slay', icon: 'auto_awesome', color: 'text-rose-500' },
                                                { id: 'autocorrect', icon: 'remove_red_eye', color: 'text-emerald-500' },
                                                { id: 'adminvision', icon: 'visibility', color: 'text-fuchsia-500' },
                                            ].map((item) => {
                                                const count = user.inventory?.[item.id] || 0;
                                                if (count === 0 && !['shield', 'booster', 'hint'].includes(item.id)) return null;
                                                return (
                                                    <div key={item.id} className="flex flex-col items-center group relative cursor-help">
                                                        <div className={`size-8 rounded-lg bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 flex items-center justify-center ${item.color} shadow-sm transition-transform group-hover:scale-110`}>
                                                            <Icon name={item.icon} size={16} filled={count > 0} />
                                                        </div>
                                                        <span className={`text-[10px] font-black mt-1 ${count > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-300 dark:text-slate-600'}`}>
                                                            {count}
                                                        </span>
                                                        {/* Tooltip-like effect on hover could go here */}
                                                    </div>
                                                );
                                            })}
                                            {/* Fill remaining slots if needed or just let it grid */}
                                        </div>
                                    </div>
                                )}

                                {isMe && <RedeemSection />}

                                {/* Admin Link */}
                                {isMe && session?.user?.isAdmin && (
                                    <Link href="/admin" className="w-full mt-4">
                                        <Button variant="primary" fullWidth size="sm" className="bg-slate-900 text-[10px] font-black italic tracking-widest border-none h-10 rounded-xl hover:bg-black transition-all">
                                            <Icon name="shield" size={14} className="mr-2" filled />
                                            ADMIN DASHBOARD
                                        </Button>
                                    </Link>
                                )}

                                {/* Footer */}
                                <div className="w-full pt-4 border-t border-slate-100 dark:border-white/5 text-center mt-4">
                                    <p className="text-[10px] text-slate-400 font-bold italic">
                                        "Terus grinding biar jadi sepuh!"
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence >

            {/* Border Selector Modal */}
            {
                showBorderSelector && (
                    <BorderSelector
                        onClose={() => setShowBorderSelector(false)}
                    />
                )
            }
        </>
    );
};
