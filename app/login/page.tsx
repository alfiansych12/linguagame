'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, Button, Card } from '@/components/ui/UIComponents';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { registerUser } from '@/app/actions/authActions';
import { useAlertStore } from '@/store/alert-store';

export default function LoginPage() {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const { showAlert } = useAlertStore();
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (mode === 'register') {
                const res = await registerUser(form);
                if (res.success) {
                    showAlert({
                        title: 'Akun Gacor Tercipta! 🎉',
                        message: 'Mantap bro, akun lo sudah aktif. Sekarang login yuk!',
                        type: 'success'
                    });
                    setMode('login');
                } else {
                    showAlert({ title: 'Gagal Nih Bro ❌', message: res.error || 'Terjadi kesalahan', type: 'error' });
                }
            } else {
                const res = await signIn('credentials', {
                    email: form.email,
                    password: form.password,
                    redirect: false,
                });

                if (res?.error) {
                    showAlert({ title: 'Akses Ditolak! 🚫', message: res.error, type: 'error' });
                } else {
                    showAlert({ title: 'Login Berhasil! 🔥', message: 'Sinyal terhubung, saatnya grinding!', type: 'success' });
                    router.push('/');
                    router.refresh();
                }
            }
        } catch (error) {
            showAlert({ title: 'Error System 🛰️', message: 'Koneksi terganggu bro!', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-white dark:bg-[#06060a] transition-colors duration-500">
            {/* Left Side: Cinematic Branding (Desktop Only) */}
            <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden bg-[#0a0a0f] items-center justify-center p-20">
                {/* Tactical Background Effects */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-[-10%] left-[-10%] size-[600px] bg-primary/20 rounded-full blur-[120px] animate-pulse-gentle"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] size-[500px] bg-blue-600/10 rounded-full blur-[100px] animate-pulse-gentle" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
                </div>

                {/* Bokeh Circles */}
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-white/5 rounded-full blur-3xl animate-float"></div>
                <div className="absolute top-1/2 right-1/4 w-48 h-48 bg-primary/5 rounded-full blur-3xl animate-float-delayed"></div>
                <div className="absolute bottom-1/4 left-1/3 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl animate-float"></div>

                <div className="relative z-10 w-full max-w-2xl">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-8"
                    >
                        <div className="flex items-center gap-6">
                            <div className="size-24 bg-primary rounded-[2rem] flex items-center justify-center shadow-2xl shadow-primary/40 rotate-12 hover:rotate-0 transition-all duration-500 border-4 border-white/10">
                                <Icon name="translate" className="text-white" size={48} filled />
                            </div>
                            <div className="h-20 w-1 bg-gradient-to-b from-primary to-transparent rounded-full opacity-50"></div>
                            <div>
                                <h1 className="text-5xl font-black text-white tracking-tighter leading-tight italic">
                                    LINGUA<span className="text-primary not-italic">GAME</span>
                                </h1>
                                <p className="text-primary font-black uppercase tracking-[0.3em] text-xs">Tactical Learning System v2.0</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-8 border-t border-white/5">
                            <h2 className="text-4xl font-bold text-white tracking-tight">
                                Selamat Datang di <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">Knowledge Hub Gacor</span>
                            </h2>
                            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-md">
                                Kuasai bahasa baru dengan metode tactical grinding. Progress lo berharga, skill lo senjata utama. Ready to dominate the leaderboard?
                            </p>
                        </div>

                        <div className="flex gap-12 pt-10">
                            <div className="space-y-1">
                                <p className="text-3xl font-black text-white">500+</p>
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Kosa Kata Baru</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-3xl font-black text-white">10+</p>
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Jalur Belajar</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-3xl font-black text-white">100%</p>
                                <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Metode Tactical</p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Right Side: Clean Auth Column */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-8 bg-white dark:bg-[#06060a] relative overflow-hidden lg:h-screen">
                {/* Mobile Decorative Background */}
                <div className="lg:hidden absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-[-5%] left-[-5%] size-80 bg-primary/10 rounded-full blur-[80px]"></div>
                    <div className="absolute bottom-[-5%] right-[-5%] size-80 bg-blue-500/10 rounded-full blur-[80px]"></div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="w-full max-w-[380px] z-10"
                >
                    {/* Brand for Mobile */}
                    <div className="lg:hidden flex flex-col items-center mb-4">
                        <div className="size-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 mb-2">
                            <Icon name="translate" className="text-white" size={24} filled />
                        </div>
                        <h1 className="text-lg font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
                            LINGUA<span className="text-primary not-italic">GAME</span>
                        </h1>
                    </div>

                    <Card className="p-5 sm:p-7 lg:p-8 border-0 lg:border-2 border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl lg:shadow-2xl rounded-[2rem] md:rounded-[2.5rem]">
                        <div className="mb-4">
                            <h2 className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 mb-0.5">Bro Auth</h2>
                            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                                {mode === 'login' ? 'Welcome Back!' : 'Join the Bro'}
                            </h3>
                        </div>

                        {/* Mode Toggle */}
                        <div className="flex bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl mb-5">
                            <button
                                onClick={() => setMode('login')}
                                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'login' ? 'bg-white dark:bg-slate-900 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                Login
                            </button>
                            <button
                                onClick={() => setMode('register')}
                                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${mode === 'register' ? 'bg-white dark:bg-slate-900 text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                            >
                                Register
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-2.5">
                            <AnimatePresence mode="wait">
                                {mode === 'register' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-1 overflow-hidden"
                                    >
                                        <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="Nama kece..."
                                            className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-primary/50 transition-all placeholder:text-slate-400"
                                            value={form.name}
                                            onChange={e => setForm({ ...form, name: e.target.value })}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Email</label>
                                <input
                                    required
                                    type="email"
                                    placeholder="nama@bro.com"
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-primary/50 transition-all placeholder:text-slate-400"
                                    value={form.email}
                                    onChange={e => setForm({ ...form, email: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black uppercase text-slate-400 tracking-[0.2em] ml-2">Password</label>
                                <input
                                    required
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-primary/50 transition-all placeholder:text-slate-400"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                />
                            </div>

                            <Button
                                type="submit"
                                fullWidth
                                loading={loading}
                                className="h-11 bg-primary text-white font-black uppercase tracking-widest text-[10px] italic shadow-xl shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] transition-all mt-2"
                            >
                                {mode === 'login' ? 'Let\'s Go! 🚀' : 'Authorize! 🔥'}
                            </Button>
                        </form>

                        {/* OR Separator */}
                        <div className="relative my-5 text-center">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100 dark:border-slate-800"></div>
                            </div>
                            <span className="relative bg-white dark:bg-slate-900 px-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">Gateway</span>
                        </div>

                        {/* Social Providers */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => signIn('google', { callbackUrl: '/' })}
                                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all bg-white dark:bg-slate-800/30"
                            >
                                <svg className="size-3.5" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Google</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => signIn('github', { callbackUrl: '/' })}
                                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-slate-100 dark:border-slate-800 hover:border-primary/30 transition-all bg-white dark:bg-slate-800/30"
                            >
                                <svg className="size-3.5 fill-slate-900 dark:fill-white" viewBox="0 0 24 24">
                                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                </svg>
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">GitHub</span>
                            </button>
                        </div>

                        <Link href="/" className="block mt-6 text-center text-[9px] font-black text-slate-400 hover:text-primary uppercase tracking-[0.2em] transition-colors">
                            Guest Mode
                        </Link>
                    </Card>
                </motion.div>

                {/* Footer Credits */}
                <div className="mt-8 text-center opacity-50">
                    <p className="text-[9px] font-black uppercase text-slate-400 tracking-[0.3em]">
                        LINGUAGAME ENGINE © 2026 // SECURED BY RADIANT DEFENSE
                    </p>
                </div>
            </div>
        </div>
    );
}
