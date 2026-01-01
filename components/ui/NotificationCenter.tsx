'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Icon, Badge } from './UIComponents';
import { supabase } from '@/lib/db/supabase';
import { Announcement } from '@/types/admin';

export function NotificationCenter({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const [notifications, setNotifications] = useState<Announcement[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    const fetchNotifications = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('announcements')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (data) setNotifications(data);
        setLoading(false);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-black/20 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20, x: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20, x: 20 }}
                        className="fixed top-24 right-4 md:right-8 w-[320px] md:w-[400px] z-[101]"
                    >
                        <Card className="p-0 overflow-hidden border-slate-200 dark:border-slate-800 shadow-2xl h-[500px] flex flex-col bg-white dark:bg-[#0a0a0f]">
                            {/* Header */}
                            <div className="p-6 bg-white dark:bg-[#0f0f16] border-b border-slate-100 dark:border-slate-800 flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-2">
                                    <Icon name="notifications" className="text-primary" size={20} filled />
                                    <h3 className="font-black uppercase italic tracking-tighter text-lg text-slate-900 dark:text-white">Announcements</h3>
                                </div>
                                <button onClick={onClose} className="size-8 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center transition-colors">
                                    <Icon name="close" size={18} className="text-slate-400" />
                                </button>
                            </div>

                            {/* Notifications List */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 hide-scrollbar bg-slate-50 dark:bg-[#08080c]">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center h-full space-y-2 opacity-50">
                                        <Icon name="progress_activity" size={24} className="animate-spin text-primary" />
                                        <p className="text-[10px] font-black uppercase text-slate-500">Loading sirkel info...</p>
                                    </div>
                                ) : notifications.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-full space-y-4 opacity-50 text-center px-8">
                                        <Icon name="drafts" size={48} className="text-slate-300" />
                                        <div>
                                            <p className="text-xs font-black uppercase text-slate-900 dark:text-white">Belum ada info baru</p>
                                            <p className="text-[10px] font-bold mt-1 text-slate-500">Sirkel lagi adem ayem nih, pantau terus ya!</p>
                                        </div>
                                    </div>
                                ) : (
                                    notifications.map((n) => (
                                        <div
                                            key={n.id}
                                            className={`p-5 rounded-2xl border-2 space-y-3 group transition-all hover:scale-[1.02] ${n.type === 'reward'
                                                    ? 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-500/20 shadow-sm shadow-blue-500/5'
                                                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <Badge variant={n.type === 'reward' ? 'diamond' : n.type === 'update' ? 'xp' : 'primary'}>
                                                    {n.type}
                                                </Badge>
                                                <span className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
                                                    {new Date(n.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className={`font-black text-sm uppercase italic tracking-tight leading-tight ${n.type === 'reward' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-900 dark:text-white'
                                                    }`}>
                                                    {n.title}
                                                </h4>
                                                <p className={`text-[11px] font-bold leading-relaxed ${n.type === 'reward' ? 'text-slate-600 dark:text-blue-100/70' : 'text-slate-500 dark:text-slate-400'
                                                    }`}>
                                                    {n.content}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {/* Footer */}
                            <div className="p-4 bg-white dark:bg-[#0f0f16] border-t border-slate-100 dark:border-slate-800 text-center">
                                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                    Tetap update biar gak ketinggalan meta!
                                </p>
                            </div>
                        </Card>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
