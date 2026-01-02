'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../ui/UIComponents';

interface TacticalAITutorProps {
    isVisible: boolean;
    explanation: string;
    tip: string;
    onClose: () => void;
}

export const TacticalAITutor: React.FC<TacticalAITutorProps> = ({ isVisible, explanation, tip, onClose }) => {
    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.9 }}
                    className="fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:bottom-8 md:w-80 z-50"
                >
                    <div className="bg-slate-900/90 backdrop-blur-xl border-2 border-primary/50 rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-2xl relative overflow-hidden group">
                        {/* Scanline Effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent h-[200%] w-full animate-scanline pointer-events-none" />

                        {/* Background Grid */}
                        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(var(--primary) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

                        <div className="relative z-10 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/30">
                                        <Icon name="psychology" className="text-primary animate-pulse" size={18} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary italic">Quantum AI Tutor</span>
                                </div>
                                <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
                                    <Icon name="close" size={16} />
                                </button>
                            </div>

                            <div className="space-y-2">
                                <p className="text-sm font-bold text-white leading-relaxed italic">
                                    "{explanation}"
                                </p>
                                <div className="pt-2 border-t border-white/10">
                                    <div className="flex items-start gap-2">
                                        <Icon name="bolt" size={14} className="text-amber-400 mt-0.5 shrink-0" />
                                        <p className="text-[10px] font-black uppercase text-amber-400 tracking-tighter">
                                            Tactical Tip: <span className="text-slate-300 normal-case font-bold">{tip}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Interactive glow on hover */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl md:rounded-3xl pointer-events-none" />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
