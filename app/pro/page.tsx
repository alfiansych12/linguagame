'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, Button } from '@/components/ui/UIComponents';
import { useUserStore } from '@/store/user-store';
import { useRouter } from 'next/navigation';
import { createPaymentToken, upgradeUserToPro } from '@/app/actions/paymentActions';
import { useAlertStore } from '@/store/alert-store';

declare global {
    interface Window {
        snap: any;
    }
}

export default function ProPage() {
    const { isPro, proUntil, name, userId, syncWithDb } = useUserStore();
    const { showAlert } = useAlertStore();
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const plans = [
        {
            id: 'weekly',
            name: 'Elite Weekly',
            price: 'Rp 3.000',
            duration: '7 Hari',
            features: [
                'Unlimited Quantum AI Tutor',
                'Tactical "Bro" Mentorship',
                '0% Learning Ads',
                'Special Pro Border'
            ],
            color: 'from-blue-500 to-cyan-500',
            glow: 'shadow-cyan-500/20'
        },
        {
            id: 'monthly',
            name: 'Ultimate Monthly',
            price: 'Rp 10.000',
            duration: '30 Hari',
            features: [
                'Semua Fitur Weekly',
                'Priority AI Response',
                'Exclusive Quantum Badge',
                'Hemat 20% Bro!'
            ],
            color: 'from-primary to-purple-600',
            glow: 'shadow-primary/20',
            popular: true
        }
    ];

    const handleSubscribe = async (planId: string) => {
        if (!userId || userId === 'guest') {
            showAlert({ title: 'Bro!', message: 'Login dulu biar bisa jadi member PRO elit.', type: 'error' });
            return;
        }

        setIsLoading(true);
        const result = await createPaymentToken(planId, userId, name);

        if (result.success && result.token) {
            window.snap.pay(result.token, {
                onSuccess: async (result: any) => {
                    const upgrade = await upgradeUserToPro(userId, planId);
                    if (upgrade.success) {
                        await syncWithDb(userId);
                        showAlert({
                            title: 'SLAY! 🔥',
                            message: 'Selamat bro! Lo sekarang resmi jadi member QUANTUM PRO.',
                            type: 'success'
                        });
                        router.push('/');
                    }
                },
                onPending: () => {
                    showAlert({ title: 'Pending', message: 'Selesaikan pembayarannya ya bro!', type: 'info' });
                    setIsLoading(false);
                },
                onError: () => {
                    showAlert({ title: 'Error', message: 'Waduh, ada masalah pas bayar. Coba lagi nanti!', type: 'error' });
                    setIsLoading(false);
                },
                onClose: () => {
                    setIsLoading(false);
                }
            });
        } else {
            showAlert({ title: 'Error', message: result.error || 'Gagal konek ke payment gateway.', type: 'error' });
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020205] text-white relative overflow-x-hidden">
            {/* --- LUXURY BACKGROUND EFFECTS --- */}
            <div className="fixed inset-0 z-0">
                {/* Quantum Nebula */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[120px] rounded-full" />

                {/* Stars Grid */}
                <div className="absolute inset-0 opacity-30"
                    style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }}
                />
            </div>

            <div className="relative z-10 max-w-6xl mx-auto px-6 md:px-12 pt-10 pb-24 space-y-12">

                {/* --- TACTICAL HEADER --- */}
                <header className="text-center space-y-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-primary/40 text-primary shadow-[0_0_15px_rgba(var(--primary-rgb),0.15)]"
                    >
                        <div className="size-1.5 bg-primary rounded-full animate-ping" />
                        <span className="font-black text-[10px] uppercase tracking-[0.3em]">Quantum Intelligence Core</span>
                    </motion.div>

                    <div className="space-y-1">
                        <h1 className="text-4xl md:text-6xl lg:text-7xl font-[1000] italic tracking-tighter uppercase leading-none">
                            UNCAGE <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-yellow-400 to-orange-500 drop-shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">PRO</span>
                        </h1>
                        <p className="text-slate-400 text-xs md:text-sm font-bold max-w-xl mx-auto leading-relaxed uppercase tracking-wide">
                            Masuki dimensi belajar tanpa batas. Mentor AI taktis menunggu lo di ujung timeline.
                        </p>
                    </div>
                </header>

                {/* --- PRO STATUS (If Active) --- */}
                <AnimatePresence>
                    {isPro && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            className="overflow-hidden"
                        >
                            <div className="bg-gradient-to-r from-primary/20 via-primary/5 to-transparent border-l-4 border-primary rounded-r-2xl p-6 backdrop-blur-xl flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-xl bg-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] flex items-center justify-center rotate-3">
                                        <Icon name="verified" size={28} className="text-black" />
                                    </div>
                                    <div>
                                        <h3 className="font-black text-xl uppercase tracking-tighter italic">Status: Elite Operator</h3>
                                        <p className="text-primary font-bold text-xs tracking-widest uppercase">VALID UNTIL: {proUntil ? new Date(proUntil).toLocaleDateString() : 'INFINITE'}</p>
                                    </div>
                                </div>
                                <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-md text-[9px] font-black uppercase tracking-widest text-primary">Protocol Active</div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* --- PLANS GRID --- */}
                <div className="grid lg:grid-cols-2 gap-6 items-stretch max-w-5xl mx-auto">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={plan.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.1 + idx * 0.1 }}
                            className={`group relative flex flex-col rounded-[2.5rem] p-[2px] transition-all duration-500 hover:scale-[1.01] ${plan.popular
                                ? 'border-primary/50 bg-primary/5 shadow-[0_0_40px_rgba(var(--primary-rgb),0.1)]'
                                : 'border-white/10 bg-white/5'
                                }`}
                        >
                            <div className="relative z-10 bg-[#0a0c14]/95 backdrop-blur-2xl rounded-[2.4rem] p-6 md:p-8 flex flex-col h-full overflow-hidden">
                                <div className={`absolute top-0 right-0 size-48 opacity-10 blur-[80px] rounded-full translate-x-24 -translate-y-24 bg-gradient-to-br ${plan.color}`} />

                                <div className="flex justify-between items-start mb-8">
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-2xl font-black italic uppercase tracking-tighter">{plan.name}</h3>
                                            {plan.popular && <Icon name="bolt" size={20} className="text-primary animate-pulse" />}
                                        </div>
                                        <span className={`text-[9px] font-black uppercase tracking-[0.3em] ${plan.popular ? 'text-primary' : 'text-blue-400'}`}>
                                            Deploy {plan.id}
                                        </span>
                                    </div>
                                    {plan.popular && (
                                        <div className="bg-primary text-black px-3 py-0.5 rounded-full text-[9px] font-[1000] uppercase tracking-tighter">
                                            TOP
                                        </div>
                                    )}
                                </div>

                                <div className="mb-8">
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-4xl md:text-5xl font-[1000] tracking-tighter text-white">{plan.price}</span>
                                        <span className="text-slate-500 font-bold text-lg italic">/{plan.duration}</span>
                                    </div>
                                </div>

                                <div className="grid gap-3 mb-10 flex-grow">
                                    {plan.features.map((f, i) => (
                                        <div key={i} className="flex items-center gap-3">
                                            <div className={`size-5 rounded-md flex items-center justify-center border ${plan.popular ? 'border-primary/30 bg-primary/5' : 'border-blue-500/30 bg-blue-500/5'}`}>
                                                <Icon name="check" size={12} className={plan.popular ? 'text-primary' : 'text-blue-400'} />
                                            </div>
                                            <span className="text-sm font-bold text-slate-300 tracking-tight">{f}</span>
                                        </div>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handleSubscribe(plan.id)}
                                    disabled={isLoading}
                                    className={`relative group/btn w-full py-4 rounded-2xl overflow-hidden transition-all active:scale-[0.98] disabled:opacity-50`}
                                >
                                    <div className={`absolute inset-0 bg-gradient-to-r transition-transform group-hover/btn:scale-105 ${plan.color}`} />
                                    <div className="relative z-10 flex items-center justify-center gap-2 font-black text-xl text-black uppercase tracking-tighter">
                                        {isLoading ? '...' : 'GAS UPGRADE'}
                                        <Icon name="trending_up" size={18} />
                                    </div>
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* --- WHY PRO THEME --- */}
                <section className="relative space-y-8 py-8">
                    <div className="text-center space-y-1">
                        <h2 className="text-2xl md:text-3xl font-black uppercase italic tracking-tighter">TACTICAL <span className="text-primary">ADVANTAGES</span></h2>
                        <p className="text-slate-500 font-bold text-[10px] tracking-widest uppercase">Kenapa Harus PRO</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        {[
                            { icon: 'psychology', title: 'Infinite Intelligence', desc: 'Akses tanpa batas ke Quantum AI Tutor.', color: 'text-blue-400' },
                            { icon: 'speed', title: 'Zero Interference', desc: 'Nol iklan, nol gangguan, 100% fokus.', color: 'text-primary' },
                            { icon: 'military_tech', title: 'Legendary Status', desc: 'Unlock border dan badge eksklusif.', color: 'text-purple-400' }
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="bg-[#0f111a] border border-white/5 rounded-[1.5rem] p-6 space-y-2 text-center md:text-left"
                            >
                                <div className={`size-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 ${item.color}`}>
                                    <Icon name={item.icon} size={24} />
                                </div>
                                <h4 className="text-sm font-black uppercase tracking-tight">{item.title}</h4>
                                <p className="text-slate-500 font-bold text-[10px] uppercase tracking-tight leading-tight">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* --- FOOTER ACTION --- */}
                <footer className="text-center pt-4">
                    <button
                        onClick={() => router.push('/')}
                        className="group flex items-center gap-2 mx-auto px-6 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-slate-500 hover:text-white font-black text-[10px] uppercase tracking-widest"
                    >
                        <Icon name="arrow_back" size={14} className="group-hover:-translate-x-1 transition-transform" />
                        ABORT & RETURN
                    </button>
                </footer>

            </div>
        </div>
    );
}
