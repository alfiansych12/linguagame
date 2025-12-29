'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, Button, Card } from './UIComponents';
import Link from 'next/link';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    description?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
    isOpen,
    onClose,
    title = "Sabar Dulu, Slay!",
    description = "Kamu harus login dulu biar progress kamu literally ke-save dan bisa pamer di Sirkel Board."
}) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100]"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed inset-0 flex items-center justify-center pointer-events-none z-[101] p-4"
                    >
                        <Card className="w-full max-w-md p-8 border-2 border-primary/20 bg-white dark:bg-slate-900 shadow-2xl rounded-[3rem] pointer-events-auto relative overflow-hidden">
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                            >
                                <Icon name="close" size={24} />
                            </button>

                            <div className="flex flex-col items-center text-center">
                                <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                                    <Icon name="lock" className="text-primary" size={32} filled />
                                </div>

                                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">
                                    {title}
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 font-bold mb-8 leading-relaxed">
                                    {description}
                                </p>

                                <div className="w-full space-y-3">
                                    <Link href="/login">
                                        <Button className="w-full py-4 rounded-2xl bg-primary text-white font-black uppercase tracking-widest text-xs shadow-lg shadow-primary/30 active:scale-95 transition-all">
                                            Gas Login Sekarang!
                                        </Button>
                                    </Link>
                                    <button
                                        onClick={onClose}
                                        className="w-full py-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-black uppercase tracking-widest text-[10px] transition-colors"
                                    >
                                        Nanti Aja, Masih Mau Liat-Liat
                                    </button>
                                </div>
                            </div>

                            {/* Decorative element */}
                            <div className="absolute -bottom-4 -left-4 size-24 bg-primary/5 rounded-full blur-2xl"></div>
                        </Card>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
