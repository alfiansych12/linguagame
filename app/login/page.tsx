'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Icon, Button, Card } from '@/components/ui/UIComponents';
import Link from 'next/link';

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-[#f8fafc] dark:bg-[#06060a] flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-5%] size-[600px] bg-primary/10 rounded-full blur-[120px] animate-pulse-gentle"></div>
            <div className="absolute bottom-[-10%] right-[-5%] size-[600px] bg-purple-500/10 rounded-full blur-[120px] animate-pulse-gentle" style={{ animationDelay: '2s' }}></div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg z-10"
            >
                <Card className="p-8 md:p-12 border-2 border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl shadow-2xl rounded-[3rem] relative overflow-hidden">
                    {/* Header */}
                    <div className="flex flex-col items-center text-center mb-10">
                        <motion.div
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="size-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 mb-6 group-hover:rotate-12 transition-transform duration-500"
                        >
                            <Icon name="translate" className="text-white" size={36} />
                        </motion.div>

                        <motion.h1
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter mb-2"
                        >
                            Ready to <span className="text-primary italic text-shadow-sm">Slay</span>? ✨
                        </motion.h1>
                        <motion.p
                            initial={{ y: -10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="text-slate-500 dark:text-slate-400 font-bold text-lg"
                        >
                            Login dulu biar progress kamu <br />
                            <span className="text-slate-900 dark:text-white underline decoration-primary decoration-4">Literally Gacor!</span>
                        </motion.p>
                    </div>

                    {/* Actions */}
                    <div className="space-y-4">
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.5 }}
                        >
                            <Button
                                className="w-full py-4 bg-white dark:bg-slate-800 text-slate-900 dark:text-white border-2 border-slate-100 dark:border-slate-700 hover:border-primary/50 flex items-center justify-center gap-3 group transition-all duration-300"
                                onClick={() => signIn('google', { callbackUrl: '/' })}
                            >
                                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                <span className="font-black uppercase tracking-widest text-[13px]">
                                    Sign in with Google
                                </span>
                            </Button>
                        </motion.div>

                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                        >
                            <Link href="/">
                                <Button
                                    variant="ghost"
                                    className="w-full py-4 text-slate-400 hover:text-primary font-black uppercase tracking-widest text-[11px]"
                                >
                                    Eits, mau nge-Guest dulu? Boleh bgt!
                                </Button>
                            </Link>
                        </motion.div>
                    </div>

                    {/* Footer Info */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="mt-10 pt-8 border-t border-slate-100 dark:border-slate-800 text-center"
                    >
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mb-4">
                            Powered by Supabase & NextAuth
                        </p>
                        <div className="flex justify-center gap-4">
                            <Icon name="verified" className="text-primary" size={20} filled />
                            <Icon name="security" className="text-secondary" size={20} filled />
                            <Icon name="rocket_launch" className="text-orange-500" size={20} filled />
                        </div>
                    </motion.div>

                    {/* Badge */}
                    <div className="absolute -top-4 -right-4 bg-primary text-white text-[10px] font-black px-4 py-2 rounded-xl rotate-12 shadow-lg">
                        NEW THEME V2
                    </div>
                </Card>
            </motion.div>

            {/* Floaties */}
            <motion.div
                animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-[20%] right-[15%] hidden lg:block opacity-20"
            >
                <Icon name="auto_awesome" size={64} className="text-primary" />
            </motion.div>
            <motion.div
                animate={{ y: [0, 20, 0], rotate: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-[20%] left-[10%] hidden lg:block opacity-20"
            >
                <Icon name="diamond" size={48} className="text-blue-500" />
            </motion.div>
        </div>
    );
}
