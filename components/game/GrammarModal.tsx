'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, Button, Card } from '../ui/UIComponents';

interface GrammarModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const GrammarModal: React.FC<GrammarModalProps> = ({
    isOpen,
    onClose
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
                        <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto p-6 md:p-10 border-2 border-primary/20 bg-white dark:bg-slate-900 shadow-2xl rounded-[2rem] md:rounded-[3rem] pointer-events-auto relative">
                            <button
                                onClick={onClose}
                                className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10"
                            >
                                <Icon name="close" size={24} />
                            </button>

                            <div className="space-y-8">
                                <div className="flex flex-col items-center text-center">
                                    <div className="size-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-6">
                                        <Icon name="book" className="text-primary" size={32} filled />
                                    </div>

                                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2 tracking-tight uppercase italic">
                                        Kitab Tata Bahasa
                                    </h2>
                                    <p className="text-slate-500 dark:text-slate-400 font-bold tracking-widest uppercase text-[10px] md:text-xs">
                                        Master the rules, conquer the Bro!
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    {/* RULE 1: S/ES */}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="size-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                                                <Icon name="potted_plant" size={20} filled />
                                            </div>
                                            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Pemakaian Akhiran "s"</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-2">
                                                    <Badge color="bg-blue-500">I, You, We, They</Badge>
                                                    <span className="text-slate-400">➡️</span>
                                                    <span className="font-black text-slate-900 dark:text-white italic">Verb Asli</span>
                                                </div>
                                                <p className="text-xs text-slate-500 font-bold pl-2">Contoh: I <span className="text-blue-500">eat</span>, They <span className="text-blue-500">drink</span>.</p>
                                            </div>

                                            <div className="flex flex-col gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                                                <div className="flex items-center gap-2">
                                                    <Badge color="bg-rose-500">She, He, It</Badge>
                                                    <span className="text-slate-400">➡️</span>
                                                    <span className="font-black text-slate-900 dark:text-white italic">Verb + s/es</span>
                                                </div>
                                                <p className="text-xs text-slate-500 font-bold pl-2">Contoh: She <span className="text-rose-500">eats</span>, He <span className="text-rose-500">drinks</span>!</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* RULE 2: VERB ING */}
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="size-8 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                                                <Icon name="bolt" size={20} filled />
                                            </div>
                                            <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight italic">Pemakaian Verb-ing</h3>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 text-center space-y-2">
                                                <div className="font-black text-slate-900 dark:text-white text-lg">
                                                    Subjek + <span className="text-purple-500">am/is/are</span> + <span className="text-emerald-500">Verb-ing</span>
                                                </div>
                                                <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest leading-none">Kejadian yang sedang berlangsung</p>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Single Person / He, She, It</p>
                                                    <div className="font-black text-slate-900 dark:text-white">Is <span className="text-emerald-500 italic">eating</span></div>
                                                </div>
                                                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                                    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Plural / You, We, They</p>
                                                    <div className="font-black text-slate-900 dark:text-white">Are <span className="text-emerald-500 italic">eating</span></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <Button fullWidth onClick={onClose} className="py-4 md:py-6 rounded-2xl md:rounded-3xl h-auto">
                                        Paham Sekarang!
                                    </Button>
                                </div>
                            </div>

                            {/* Decorative element */}
                            <div className="absolute -bottom-10 -right-10 size-40 bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
                        </Card>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

const Badge = ({ children, color }: { children: React.ReactNode, color: string }) => (
    <span className={`${color} text-white px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest`}>
        {children}
    </span>
);
