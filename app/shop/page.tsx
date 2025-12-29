'use client';

import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, Icon, Button, Badge } from '@/components/ui/UIComponents';
import { useUserStore, CrystalInventory } from '@/store/user-store';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useSession } from 'next-auth/react';
import { LoginModal } from '@/components/ui/LoginModal';

interface CrystalItem {
    id: keyof CrystalInventory;
    name: string;
    description: string;
    cost: number;
    icon: string;
    color: string;
    glow: string;
}

const CRYSTAL_ITEMS: CrystalItem[] = [
    {
        id: 'shield',
        name: 'Tameng Gaib',
        description: 'Kasih +5 Energy biar gak gampang game over pas lagi grinding.',
        cost: 50,
        icon: 'security',
        color: 'text-emerald-500',
        glow: 'shadow-emerald-500/20'
    },
    {
        id: 'booster',
        name: 'Booster Gacor',
        description: 'XP kamu auto-double buat 3 level kedepan. Literally shortcut sepuh.',
        cost: 100,
        icon: 'bolt',
        color: 'text-amber-500',
        glow: 'shadow-amber-500/20'
    },
    {
        id: 'hint',
        name: 'Hint Literally',
        description: 'Gak tau jawabannya? Click ini buat bocoran jawaban (3x use).',
        cost: 150,
        icon: 'psychology',
        color: 'text-blue-500',
        glow: 'shadow-blue-500/20'
    },
    {
        id: 'focus',
        name: 'Focus Banget',
        description: 'Timer di Speed Blitz auto stop. Bisa mikir santuy tanpa panik.',
        cost: 200,
        icon: 'timer_off',
        color: 'text-purple-500',
        glow: 'shadow-purple-500/20'
    },
    {
        id: 'slay',
        name: 'Streak Slay',
        description: 'Jagain streak kamu biar tetep slay walaupun lupa login 24 jem.',
        cost: 300,
        icon: 'auto_awesome',
        color: 'text-rose-500',
        glow: 'shadow-rose-500/20'
    },
    {
        id: 'timefreeze',
        name: 'Waktunya Berhenti',
        description: 'Literally berhentiin waktu pas duel selama 5 detik. Musuh auto bengong!',
        cost: 2000,
        icon: 'ac_unit',
        color: 'text-cyan-400',
        glow: 'shadow-cyan-400/20'
    },
    {
        id: 'autocorrect',
        name: 'Mata Dewa',
        description: 'Auto-pick jawaban yang bener buat 1 pertanyaan. Literally dewa!',
        cost: 5000,
        icon: 'remove_red_eye',
        color: 'text-orange-400',
        glow: 'shadow-orange-400/20'
    },
    {
        id: 'adminvision',
        name: 'Sirkel King',
        description: 'Exclusive skill dari 10 invites! Liat semua jawaban musuh di arena.',
        cost: 999999,
        icon: 'visibility',
        color: 'text-fuchsia-500',
        glow: 'shadow-fuchsia-500/30'
    }
];

export default function ShopPage() {
    const { data: session, status } = useSession();
    const { gems, inventory, spendGems, addCrystal } = useUserStore();
    const [purchasingId, setPurchasingId] = useState<string | null>(null);
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

    const isAuthenticated = status === 'authenticated';

    const handlePurchase = (item: CrystalItem) => {
        if (!isAuthenticated) {
            setIsLoginModalOpen(true);
            return;
        }
        if (gems < item.cost) return;

        setPurchasingId(item.id);

        // Simulating forge animation
        setTimeout(() => {
            const success = spendGems(item.cost);
            if (success) {
                addCrystal(item.id, 1);
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: [item.color.replace('text-', '#')]
                });
            }
            setPurchasingId(null);
        }, 1000);
    };

    return (
        <PageLayout activeTab="shop">
            <div className="max-w-6xl mx-auto py-8 md:py-12 px-4 sm:px-6 lg:px-8">
                {/* Hero Header */}
                <div className="relative mb-12 md:mb-20 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        <Badge variant="diamond" icon="diamond" className="mx-auto px-4 md:px-6 py-1.5 md:py-2 text-sm md:text-lg">
                            {gems} Crystals Available
                        </Badge>
                        <h1 className="text-5xl sm:text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">
                            CRYSTAL <span className="text-primary border-b-4 md:border-b-8 border-primary/20">FORGE</span>
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 font-bold max-w-2xl mx-auto px-4">
                            Transform your energy into powerful Skill Crystals. <br className="hidden sm:block" />
                            Upgrade your learning game, <span className="text-primary italic underline decoration-wavy decoration-2 underline-offset-4">literally.</span>
                        </p>
                    </motion.div>

                    {/* Background Decorative Elements */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-64 md:size-96 bg-primary/5 blur-[80px] md:blur-[120px] -z-10 rounded-full"></div>
                </div>

                {/* Crystal Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
                    {CRYSTAL_ITEMS.map((item, idx) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                        >
                            <Card
                                className={`h-full p-2 md:p-8 flex flex-col items-center text-center relative overflow-hidden group border-2 hover:border-primary/30 transition-all duration-500 ${item.glow}`}
                            >
                                {/* Active Inventory Count Badge */}
                                <AnimatePresence>
                                    {inventory[item.id] > 0 && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute top-1 right-1 md:top-4 md:right-4 size-5 md:size-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center text-[8px] md:text-base font-black shadow-lg z-20"
                                        >
                                            {inventory[item.id]}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Crystal Icon Container */}
                                <div className={`size-10 md:size-24 rounded-xl md:rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-2 md:mb-8 group-hover:rotate-12 transition-transform duration-500 relative`}>
                                    <Icon name={item.icon} size={20} mdSize={48} className={item.color} filled />
                                    <div className={`absolute inset-0 rounded-xl md:rounded-[2.5rem] ${item.color.replace('text', 'bg')}/10 animate-pulse`}></div>
                                </div>

                                <div className="space-y-1 md:space-y-3 flex-1 mb-2 md:mb-8 min-w-0 w-full">
                                    <h3 className="text-sm md:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic truncate w-full">{item.name}</h3>
                                    <p className="hidden md:block text-slate-500 font-bold text-xs md:text-sm leading-relaxed px-2">
                                        {item.description}
                                    </p>
                                </div>

                                <Button
                                    variant={gems >= item.cost ? 'primary' : 'secondary'}
                                    fullWidth
                                    loading={purchasingId === item.id}
                                    disabled={gems < item.cost}
                                    onClick={() => handlePurchase(item)}
                                    className="py-2 md:py-5 shadow-xl"
                                >
                                    <div className="flex flex-col md:flex-row items-center justify-center gap-0 md:gap-2">
                                        <span className="text-xs md:text-base leading-none mb-1 md:mb-0">{gems < item.cost ? 'Gagal' : 'Forge'}</span>
                                        <div className="flex items-center gap-0.5 md:gap-1 bg-white/20 px-1 md:px-2 py-0.5 rounded-md md:rounded-lg">
                                            <Icon name="diamond" size={10} mdSize={14} filled />
                                            <span className="font-black tracking-tighter text-xs md:text-base">{item.cost}</span>
                                        </div>
                                    </div>
                                </Button>

                                {/* Decoration */}
                                <div className="absolute -bottom-10 -right-10 size-24 md:size-32 bg-primary/5 rounded-full blur-2xl md:blur-3xl group-hover:bg-primary/10 transition-colors"></div>
                            </Card>
                        </motion.div>
                    ))}

                    {/* Mystery Box / Placeholder for Future */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.6 }}
                        className="hidden md:block"
                    >
                        <Card className="h-full p-8 border-2 border-dashed border-slate-200 dark:border-slate-800 bg-transparent flex flex-col items-center justify-center text-center opacity-50">
                            <div className="size-16 md:size-20 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                                <Icon name="lock" size={24} mdSize={32} className="text-slate-400" />
                            </div>
                            <h3 className="text-lg md:text-xl font-black text-slate-400 mb-2 tracking-tight">Wait for It...</h3>
                            <p className="text-xs md:text-xs font-bold text-slate-400 leading-tight">Secret crystals arriving in next update.</p>
                        </Card>
                    </motion.div>
                </div>

                {/* Lab Decoration Footer */}
                <div className="mt-20 md:mt-32 p-8 md:p-12 rounded-[2.5rem] md:rounded-[4rem] bg-slate-900 text-white relative overflow-hidden">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8 text-center md:text-left">
                        <div className="space-y-3 md:space-y-4 max-w-lg">
                            <h2 className="text-2xl md:text-5xl font-black tracking-tighter italic uppercase underline decoration-primary decoration-4 md:decoration-8 underline-offset-4 md:underline-offset-8">The Alchemy Lab</h2>
                            <p className="text-slate-400 font-bold text-sm md:text-lg leading-relaxed">
                                Crystals can be activated during any lesson to give you that extra edge. <br className="hidden md:block" />
                                <span className="text-primary">#GacorLiterally #SlayTheGrammar</span>
                            </p>
                        </div>
                        <div className="flex gap-4">
                            <div className="size-14 md:size-16 rounded-2xl md:rounded-3xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-help">
                                <Icon name="help_outline" size={28} mdSize={32} />
                            </div>
                        </div>
                    </div>
                    {/* Abstract Lab Decorations */}
                    <div className="absolute bottom-0 right-0 w-1/3 h-full bg-primary/20 blur-[60px] md:blur-[100px] pointer-events-none"></div>
                    <div className="absolute top-0 left-0 w-8 md:w-12 h-full bg-white/5 border-r border-white/5 shadow-2xl"></div>
                </div>
            </div>
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                description="Kamu harus login dulu buat jajan Crystal di Forge. Biar inventory kamu literally aman!"
            />
        </PageLayout>
    );
}
