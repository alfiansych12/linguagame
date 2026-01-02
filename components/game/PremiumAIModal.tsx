'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../ui/UIComponents';
import Link from 'next/link';

interface PremiumAIModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PremiumAIModal: React.FC<PremiumAIModalProps> = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-slate-900 border-2 border-primary/50 rounded-[2.5rem] p-8 overflow-hidden shadow-2xl shadow-primary/20"
                    >
                        {/* Background Effects */}
                        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 to-transparent" />
                        <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/20 blur-[80px] rounded-full" />

                        <div className="text-center space-y-6">
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 border-2 border-primary animate-pulse">
                                <Icon name="psychology" size={40} className="text-primary" />
                            </div>

                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-white uppercase tracking-tighter italic">
                                    QUANTUM <span className="text-primary">PRO</span>
                                </h2>
                                <p className="text-slate-400 font-bold leading-relaxed">
                                    "Bro, fitur AI Tutor ini khusus buat member elit PRO. Buka rahasia timeline bahasa bareng mentor Quantum!"
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <Link
                                    href="/pro"
                                    className="col-span-2 group relative bg-primary hover:bg-primary-hover text-black py-4 rounded-2xl font-black text-lg transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2"
                                >
                                    UPGRADE SEKARANG
                                    <Icon name="bolt" size={20} className="group-hover:animate-bounce" />
                                </Link>

                                <button
                                    onClick={onClose}
                                    className="col-span-2 text-slate-500 hover:text-white font-bold text-sm transition-colors"
                                >
                                    Nanti aja, lanjut belajar manual
                                </button>
                            </div>

                            <div className="pt-4 flex flex-wrap justify-center gap-3 opacity-60">
                                <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-700 px-3 py-1 rounded-full">
                                    <Icon name="verified" size={12} /> Realtime AI
                                </div>
                                <div className="flex items-center gap-1 text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-700 px-3 py-1 rounded-full">
                                    <Icon name="verified" size={12} /> Tactical Tips
                                    0% Ads
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
