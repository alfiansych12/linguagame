'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '../ui/UIComponents';
import Link from 'next/link';

interface PremiumAIModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const PremiumAIModal: React.FC<PremiumAIModalProps> = ({ isOpen, onClose }) => {
    const [dontShowAgain, setDontShowAgain] = useState(false);
    const [shouldRender, setShouldRender] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const lastDismissed = localStorage.getItem('dnsp-ai'); // dnsp = do not show premium
            if (lastDismissed) {
                const date = new Date(parseInt(lastDismissed));
                const now = new Date();
                // Reset if it's a different day
                if (date.getDate() === now.getDate() && date.getMonth() === now.getMonth()) {
                    onClose();
                    return;
                }
            }
            setShouldRender(true);
        } else {
            setShouldRender(false);
        }
    }, [isOpen, onClose]);

    const handleClose = () => {
        if (dontShowAgain) {
            localStorage.setItem('dnsp-ai', Date.now().toString());
        }
        onClose();
    };

    return (
        <AnimatePresence>
            {shouldRender && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleClose}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-sm bg-slate-900 border-2 border-primary/50 rounded-[2rem] p-6 overflow-hidden shadow-2xl shadow-primary/20"
                    >
                        {/* Background Effects */}
                        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/10 to-transparent" />

                        <div className="text-center space-y-5">
                            <div className="flex flex-col items-center gap-3">
                                <div className="inline-flex items-center justify-center size-14 rounded-full bg-primary/20 border-2 border-primary">
                                    <Icon name="psychology" size={28} className="text-primary" />
                                </div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic leading-none">
                                    QUANTUM <span className="text-primary">PRO</span>
                                </h2>
                            </div>

                            <p className="text-slate-400 font-bold text-sm leading-relaxed px-2">
                                Fitur AI Tutor ini khusus member elit. Buka rahasia timeline bahasa bareng mentor Quantum!
                            </p>

                            <div className="space-y-3">
                                <Link
                                    href="/pro"
                                    className="block w-full bg-primary hover:bg-primary-hover text-black py-3 rounded-xl font-black text-base uppercase tracking-widest transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
                                >
                                    <Icon name="bolt" size={18} />
                                    Upgrade
                                </Link>

                                <button
                                    onClick={handleClose}
                                    className="block w-full text-slate-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors py-2"
                                >
                                    Skip dulu
                                </button>
                            </div>

                            {/* Don't show again checkbox */}
                            <div className="flex items-center justify-center gap-2 pt-2 border-t border-white/5">
                                <button
                                    onClick={() => setDontShowAgain(!dontShowAgain)}
                                    className="flex items-center gap-2 group"
                                >
                                    <div className={`size-4 rounded border transition-colors flex items-center justify-center
                                        ${dontShowAgain ? 'bg-primary border-primary' : 'border-slate-600 group-hover:border-slate-400'}`}
                                    >
                                        {dontShowAgain && <Icon name="check" size={12} className="text-black" />}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 group-hover:text-slate-400 uppercase tracking-wide">
                                        Jangan muncul lagi hari ini
                                    </span>
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
