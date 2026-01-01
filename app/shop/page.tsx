'use client';

import React, { useState } from 'react';
import { PageLayout } from '@/components/layout/PageLayout';
import { Card, Icon, Button, Badge } from '@/components/ui/UIComponents';
import { useUserStore, CrystalInventory } from '@/store/user-store';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { useSession } from 'next-auth/react';
import { LoginModal } from '@/components/ui/LoginModal';
import { useSound } from '@/hooks/use-sound';
import { useAlertStore } from '@/store/alert-store';
import { AvatarFrame } from '@/components/ui/AvatarFrame';
import { purchaseCrystal, purchaseBorder, redeemPromoCode } from '@/app/actions/shopActions';

interface CrystalItem {
    id: keyof CrystalInventory;
    name: string;
    description: string;
    cost: number;
    icon: string;
    color: string;
    glow: string;
}

interface BorderShopItem {
    id: string;
    name: string;
    description: string;
    cost: number;
    tier: 'rare' | 'epic' | 'legendary' | 'mythic';
}

const CRYSTAL_ITEMS: CrystalItem[] = [
    {
        id: 'shield',
        name: 'Shield Crystal',
        description: 'Jagain Energy lo biar nggak gampang game over pas lagi grinding misi.',
        cost: 50,
        icon: 'security',
        color: 'text-emerald-500',
        glow: 'shadow-emerald-500/20'
    },
    {
        id: 'booster',
        name: 'XP Overflow',
        description: 'Double XP buat 3 level kedepan. Literally shortcut buat jadi sepuh!',
        cost: 100,
        icon: 'bolt',
        color: 'text-amber-500',
        glow: 'shadow-amber-500/20'
    },
    {
        id: 'hint',
        name: 'Vision Crystal',
        description: 'Pusing nggak tau jawabannya? Pake ini buat intip bocoran sirkel pusat.',
        cost: 150,
        icon: 'psychology',
        color: 'text-blue-500',
        glow: 'shadow-blue-500/20'
    },
    {
        id: 'focus',
        name: 'Temporal Crystal',
        description: 'Timer di Speed Blitz auto stop. Bisa mikir santuy tanpa panik, literally.',
        cost: 200,
        icon: 'timer_off',
        color: 'text-purple-500',
        glow: 'shadow-purple-500/20'
    },
    {
        id: 'slay',
        name: 'Phoenix Crystal',
        description: 'Jagain streak lo biar tetep slay walaupun lo lupa login seharian.',
        cost: 300,
        icon: 'auto_awesome',
        color: 'text-rose-500',
        glow: 'shadow-rose-500/20'
    },
    {
        id: 'timefreeze',
        name: 'Stasis Crystal',
        description: 'Literally berhentiin waktu pas duel selama 5 detik. Musuh auto bengong!',
        cost: 2000,
        icon: 'ac_unit',
        color: 'text-cyan-400',
        glow: 'shadow-cyan-400/20'
    },
    {
        id: 'autocorrect',
        name: 'Divine Eye',
        description: 'Auto-pick jawaban bener. Pilihan dewa buat yang pengen cepet beres.',
        cost: 5000,
        icon: 'remove_red_eye',
        color: 'text-orange-400',
        glow: 'shadow-orange-400/20'
    },
    {
        id: 'adminvision',
        name: 'King Vision',
        description: 'Exclusive skill! Intip semua jawaban musuh lo di sirkel duel arena.',
        cost: 999999,
        icon: 'visibility',
        color: 'text-fuchsia-500',
        glow: 'shadow-fuchsia-500/30'
    }
];

const BORDER_ITEMS: BorderShopItem[] = [
    {
        id: 'silver_warrior',
        name: 'Silver Warrior',
        description: 'Efek metallic silver buat kamu yang baru mulai grinding.',
        cost: 1000,
        tier: 'rare'
    },
    {
        id: 'diamond_master',
        name: 'Diamond Master',
        description: 'Aura berlian berkilau, sirkel elit pasti punya ini.',
        cost: 5000,
        tier: 'epic'
    },
    {
        id: 'emerald_mythic',
        name: 'Emerald Mythic',
        description: 'Efek emerald premium dengan partikel mistis yang mempesona.',
        cost: 15000,
        tier: 'mythic'
    },
    {
        id: 'royal_obsidian',
        name: 'Royal Obsidian',
        description: 'Warna deep black dengan aura ungu gelap yang misterius dan mewah.',
        cost: 25000,
        tier: 'legendary'
    },
    {
        id: 'infinity_void',
        name: 'Infinity Void',
        description: 'Efek kosmik bintang-bintang bergerak. Mewah nggak ngotak!',
        cost: 50000,
        tier: 'mythic'
    },
    {
        id: 'celestial_dragon',
        name: 'Celestial Dragon',
        description: 'The ultimate border! Aura naga emas dengan partikel dewa.',
        cost: 99999,
        tier: 'mythic'
    }
];

export default function ShopPage() {
    const { data: session, status } = useSession();
    const { userId, gems, inventory, unlockedBorders, spendGems, addCrystal, unlockBorder } = useUserStore();
    const [purchasingId, setPurchasingId] = useState<string | null>(null);
    const [category, setCategory] = useState<'skills' | 'borders'>('skills');
    const { playSound } = useSound();
    const { showAlert } = useAlertStore();
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const [promoCode, setPromoCode] = useState('');
    const [isRedeeming, setIsRedeeming] = useState(false);

    const isAuthenticated = status === 'authenticated';

    const handlePurchaseCrystal = async (item: CrystalItem) => {
        if (!isAuthenticated) {
            setIsLoginModalOpen(true);
            return;
        }
        if (gems < item.cost) {
            playSound('WRONG');
            showAlert({
                title: 'Saldo Kurang!',
                message: `Crystals kamu cuma ${gems}, butuh ${item.cost} buat forge ${item.name}. Grinding lagi yuk!`,
                type: 'error',
                confirmLabel: 'Siap Sepuh!'
            });
            return;
        }

        showAlert({
            title: 'Forge Crystal? ⚒️',
            message: `Berapa banyak ${item.name} yang mau lo bikin sirkel?`,
            type: 'crystal',
            showQuantitySelector: true,
            pricePerItem: item.cost,
            confirmLabel: 'Forge!',
            cancelLabel: 'Batal',
            onConfirm: () => processPurchaseCrystal(item)
        });
    };

    const processPurchaseCrystal = async (item: CrystalItem) => {
        const qty = useAlertStore.getState().quantity;
        const totalCost = item.cost * qty;

        if (gems < totalCost) {
            playSound('WRONG');
            showAlert({
                title: 'Saldo Gagal! ❌',
                message: `Waduh, buat beli ${qty} crystal lo butuh ${totalCost}, tapi saldo lo cuma ${gems}. Dikurangin dikit porsinya!`,
                type: 'error'
            });
            return;
        }

        setPurchasingId(item.id);
        playSound('CRYSTAL');

        const result = await purchaseCrystal({
            crystalId: item.id as any,
            quantity: qty
        });

        if (result.success) {
            playSound('SUCCESS');
            // Sync local store to reflect server changes
            if (userId) useUserStore.getState().syncWithDb(userId);

            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: [item.color.replace('text-', '#')]
            });

            showAlert({
                title: 'Literally Gacor! ✨',
                message: `${qty}x ${item.name} berhasil di-forge. Inventory makin tebel, sirkel makin solid!`,
                type: 'success',
                autoClose: 3000
            });
        } else {
            showAlert({
                title: 'Transaksi Gagal',
                message: result.error || 'Terjadi kesalahan sistem',
                type: 'error'
            });
        }
        setPurchasingId(null);
    };

    const handlePurchaseBorder = async (item: BorderShopItem) => {
        if (!isAuthenticated) {
            setIsLoginModalOpen(true);
            return;
        }

        if (unlockedBorders.includes(item.id)) {
            showAlert({
                title: 'Sudah Punya! ✨',
                message: `Border ${item.name} sudah ada di koleksi lo sirkel.`,
                type: 'info'
            });
            return;
        }

        if (gems < item.cost) {
            playSound('WRONG');
            showAlert({
                title: 'Saldo Kurang!',
                message: `Crystals kamu cuma ${gems}, butuh ${item.cost} buat beli border ${item.name}.`,
                type: 'error'
            });
            return;
        }

        showAlert({
            title: 'Beli Border Luxury? 🎨',
            message: `Yakin mau beli ${item.name} seharga ${item.cost} Crystal? Penampilan sirkel lo auto level up!`,
            type: 'crystal',
            confirmLabel: 'Beli Sekarang!',
            cancelLabel: 'Batal',
            onConfirm: () => processPurchaseBorder(item)
        });
    };

    const processPurchaseBorder = async (item: BorderShopItem) => {
        setPurchasingId(item.id);
        playSound('SUCCESS');

        const result = await purchaseBorder({
            borderId: item.id
        });

        if (result.success) {
            // Sync local store
            if (userId) useUserStore.getState().syncWithDb(userId);

            playSound('SUCCESS');
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#F59E0B', '#FCD34D', '#FFF']
            });

            showAlert({
                title: 'Vibe Mewah! ✨',
                message: `Border ${item.name} berhasil dibeli. Langsung pake di profil sirkel lo gih!`,
                type: 'success',
                autoClose: 3000
            });
        } else {
            showAlert({
                title: 'Gagal Beli',
                message: result.error || 'Gagal sinkron data',
                type: 'error'
            });
        }
        setPurchasingId(null);
    };

    const handleRedeemPromo = async () => {
        if (!isAuthenticated) {
            setIsLoginModalOpen(true);
            return;
        }

        if (!promoCode.trim()) return;

        setIsRedeeming(true);
        try {
            const result = await redeemPromoCode(promoCode);
            if (result.success) {
                playSound('SUCCESS');
                confetti({
                    particleCount: 200,
                    spread: 100,
                    origin: { y: 0.6 },
                    colors: ['#3B82F6', '#F59E0B', '#10B981']
                });

                showAlert({
                    title: 'JACKPOT! 🎰',
                    message: `Gila bang! Kode promo berhasil, lo dapet ${result.amount?.toLocaleString()} Crystals instan. Dompet auto meluber!`,
                    type: 'success'
                });

                if (userId) useUserStore.getState().syncWithDb(userId);
                setPromoCode('');
            } else {
                playSound('WRONG');
                showAlert({
                    title: 'Yah Gagal...',
                    message: result.error || 'Kode promo salah sirkel.',
                    type: 'error'
                });
            }
        } catch (err) {
            console.error('Redeem error:', err);
        } finally {
            setIsRedeeming(false);
        }
    };

    return (
        <PageLayout activeTab="shop">
            <div className="max-w-6xl mx-auto py-3 sm:py-6 lg:py-8 px-3 sm:px-6 lg:px-8">
                {/* Hero Header - Responsive */}
                <div className="relative mb-6 sm:mb-12 lg:mb-16 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2 sm:space-y-3 lg:space-y-4"
                    >
                        <Badge
                            variant="diamond"
                            icon="diamond"
                            className="mx-auto px-2 sm:px-4 lg:px-6 py-0.5 sm:py-1 lg:py-2 text-[8px] sm:text-xs lg:text-lg"
                        >
                            {gems} Crystals Available
                        </Badge>
                        <h1 className="text-2xl sm:text-4xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase">
                            SHOP <span className="text-primary border-b-2 sm:border-b-4 lg:border-b-8 border-primary/20">ARENA</span>
                        </h1>
                        <p className="text-[10px] sm:text-sm lg:text-xl text-slate-500 font-bold max-w-2xl mx-auto px-2">
                            Pilih perlengkapan tempur sirkel lo. <br className="hidden sm:block" />
                            Upgrade skill atau penampilan, <span className="text-primary italic underline decoration-wavy decoration-2 underline-offset-4">literally mehwah.</span>
                        </p>
                    </motion.div>

                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-48 sm:size-64 lg:size-96 bg-primary/5 blur-[60px] sm:blur-[80px] lg:blur-[120px] -z-10 rounded-full"></div>
                </div>

                {/* Category Tabs - Responsive */}
                <div className="flex justify-center mb-6 sm:mb-10 lg:mb-12">
                    <div className="bg-slate-100 dark:bg-slate-800 p-1 sm:p-1.5 lg:p-2 rounded-xl sm:rounded-2xl lg:rounded-3xl flex gap-1 sm:gap-1.5 lg:gap-2 border border-slate-200 dark:border-slate-700 w-full sm:w-auto">
                        <button
                            onClick={() => setCategory('skills')}
                            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl lg:rounded-[1.25rem] font-black text-[9px] sm:text-xs lg:text-sm uppercase tracking-widest transition-all ${category === 'skills' ? 'bg-primary text-white shadow-lg scale-[1.02]' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <Icon name="bolt" size={14} className="sm:size-4 lg:size-5" filled={category === 'skills'} />
                            <span className="hidden sm:inline">Skill Crystals</span>
                            <span className="sm:hidden">Skills</span>
                        </button>
                        <button
                            onClick={() => setCategory('borders')}
                            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-6 lg:px-8 py-2 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl lg:rounded-[1.25rem] font-black text-[9px] sm:text-xs lg:text-sm uppercase tracking-widest transition-all ${category === 'borders' ? 'bg-primary text-white shadow-lg scale-[1.02]' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            <Icon name="palette" size={14} className="sm:size-4 lg:size-5" filled={category === 'borders'} />
                            <span className="hidden sm:inline">Avatar Borders</span>
                            <span className="sm:hidden">Borders</span>
                        </button>
                    </div>
                </div>

                {/* Content Grid - Mobile: 1 col, Tablet: 2 cols, Desktop: 3 cols */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                    <AnimatePresence mode="wait">
                        {category === 'skills' ? (
                            CRYSTAL_ITEMS.map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card className={`h-full p-3 sm:p-5 lg:p-8 flex flex-col items-center text-center relative overflow-hidden group border border-slate-200 dark:border-slate-700 sm:border-2 hover:border-primary/30 transition-all duration-500 ${item.glow}`}>
                                        <AnimatePresence>
                                            {inventory[item.id] > 0 && (
                                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute top-1.5 right-1.5 sm:top-3 sm:right-3 lg:top-4 lg:right-4 size-5 sm:size-7 lg:size-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center text-[8px] sm:text-xs lg:text-base font-black shadow-lg z-20">
                                                    {inventory[item.id]}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                        <div className={`size-12 sm:size-16 lg:size-24 rounded-xl sm:rounded-2xl lg:rounded-[2.5rem] bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center mb-3 sm:mb-5 lg:mb-8 group-hover:rotate-12 transition-transform duration-500 relative`}>
                                            <Icon name={item.icon} size={24} className={`sm:size-8 lg:size-12 ${item.color}`} filled />
                                            <div className={`absolute inset-0 rounded-xl sm:rounded-2xl lg:rounded-[2.5rem] ${item.color.replace('text', 'bg')}/10 animate-pulse`}></div>
                                        </div>
                                        <div className="space-y-1 sm:space-y-2 lg:space-y-3 flex-1 mb-3 sm:mb-5 lg:mb-8 w-full">
                                            <h3 className="text-xs sm:text-sm lg:text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic truncate">{item.name}</h3>
                                            <p className="text-slate-500 font-bold text-[8px] sm:text-[10px] lg:text-sm leading-relaxed px-1 line-clamp-3">
                                                {item.description}
                                            </p>
                                        </div>
                                        <Button
                                            variant={gems >= item.cost ? 'primary' : 'secondary'}
                                            fullWidth
                                            loading={purchasingId === item.id}
                                            disabled={gems < item.cost}
                                            onClick={() => handlePurchaseCrystal(item)}
                                            className="py-2 sm:py-3 lg:py-5 shadow-xl text-[9px] sm:text-xs lg:text-base"
                                        >
                                            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                                                <span className="leading-none">{gems < item.cost ? 'Gagal' : 'Forge'}</span>
                                                <div className="flex items-center gap-0.5 sm:gap-1 bg-white/20 px-1 sm:px-1.5 lg:px-2 py-0.5 rounded-md lg:rounded-lg">
                                                    <Icon name="diamond" size={10} className="sm:size-3 lg:size-3.5" filled />
                                                    <span className="font-black tracking-tighter">{item.cost}</span>
                                                </div>
                                            </div>
                                        </Button>
                                    </Card>
                                </motion.div>
                            ))
                        ) : (
                            BORDER_ITEMS.map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card className={`h-full p-3 sm:p-5 lg:p-8 flex flex-col items-center text-center relative overflow-hidden group border border-slate-200 dark:border-slate-700 sm:border-2 hover:border-primary/30 transition-all duration-500`}>
                                        <div className="mb-4 sm:mb-6 lg:mb-10 scale-110 sm:scale-125 lg:scale-[1.75] py-2 sm:py-3 lg:py-4">
                                            <AvatarFrame
                                                borderId={item.id}
                                                size="lg"
                                                fallbackInitial={item.name.charAt(0)}
                                            />
                                        </div>
                                        <div className="space-y-1 sm:space-y-2 lg:space-y-3 flex-1 mb-3 sm:mb-5 lg:mb-8 w-full">
                                            <div className="flex justify-center mb-1">
                                                <Badge
                                                    variant={item.tier === 'mythic' ? 'diamond' : item.tier === 'legendary' ? 'streak' : 'primary'}
                                                    className="text-[7px] sm:text-[8px] lg:text-[10px] uppercase font-black px-1.5 sm:px-2"
                                                >
                                                    {item.tier}
                                                </Badge>
                                            </div>
                                            <h3 className="text-xs sm:text-sm lg:text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase italic truncate">{item.name}</h3>
                                            <p className="text-slate-500 font-bold text-[8px] sm:text-[10px] lg:text-sm leading-relaxed px-1 line-clamp-3">
                                                {item.description}
                                            </p>
                                        </div>
                                        <Button
                                            variant={unlockedBorders.includes(item.id) ? 'ghost' : (gems >= item.cost ? 'primary' : 'secondary')}
                                            fullWidth
                                            loading={purchasingId === item.id}
                                            disabled={gems < item.cost && !unlockedBorders.includes(item.id)}
                                            onClick={() => handlePurchaseBorder(item)}
                                            className={`py-2 sm:py-3 lg:py-5 shadow-xl text-[9px] sm:text-xs lg:text-base ${unlockedBorders.includes(item.id) ? 'border-primary/20 text-primary opacity-60 cursor-default' : ''}`}
                                        >
                                            {unlockedBorders.includes(item.id) ? (
                                                <div className="flex items-center gap-1.5 sm:gap-2">
                                                    <Icon name="check_circle" size={14} className="sm:size-4" />
                                                    <span>OWNED</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center justify-center gap-1.5 sm:gap-2">
                                                    <span className="leading-none">Unlock</span>
                                                    <div className="flex items-center gap-0.5 sm:gap-1 bg-white/20 px-1 sm:px-1.5 lg:px-2 py-0.5 rounded-md lg:rounded-lg">
                                                        <Icon name="diamond" size={10} className="sm:size-3 lg:size-3.5" filled />
                                                        <span className="font-black tracking-tighter">{item.cost}</span>
                                                    </div>
                                                </div>
                                            )}
                                        </Button>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                {/* Promo Code Section - Responsive */}
                <div className="mt-10 sm:mt-16 lg:mt-24 mb-6 sm:mb-8">
                    <Card className="max-w-3xl mx-auto p-4 sm:p-8 lg:p-12 border-2 sm:border-4 border-dashed border-primary/20 bg-primary/5 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:rotate-12 transition-transform duration-700">
                            <Icon name="confirmation_number" size={80} className="sm:size-24 lg:size-32" />
                        </div>

                        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8">
                            <div className="flex-1 text-center sm:text-left space-y-1 sm:space-y-2">
                                <h3 className="text-base sm:text-xl lg:text-3xl font-black text-slate-900 dark:text-white uppercase italic">Punya Kode Promo?</h3>
                                <p className="text-[10px] sm:text-sm lg:text-lg text-slate-500 font-bold">Masukin kodenya dapet Crystal instan. <br className="hidden sm:block" /> Rejeki anak sirkel nggak kemana!</p>
                            </div>

                            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2 sm:gap-3">
                                <input
                                    type="text"
                                    placeholder="KODE..."
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value)}
                                    className="px-4 sm:px-5 lg:px-6 py-3 sm:py-3.5 lg:py-4 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl sm:rounded-2xl font-black text-center sm:text-left focus:border-primary outline-none transition-all uppercase tracking-widest text-sm sm:text-base lg:text-lg w-full sm:w-40 lg:w-48 placeholder:text-slate-300 dark:text-white"
                                />
                                <Button
                                    variant="primary"
                                    className="px-6 sm:px-7 lg:px-8 py-3 sm:py-3.5 lg:py-4 h-full rounded-xl sm:rounded-2xl shadow-xl whitespace-nowrap text-[10px] sm:text-xs lg:text-sm"
                                    onClick={handleRedeemPromo}
                                    loading={isRedeeming}
                                    disabled={!promoCode.trim()}
                                >
                                    REDEEM KODE
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Mystery Box Placeholder */}
                <div className="mt-8 sm:mt-10 lg:mt-12 opacity-30 text-center border-t border-slate-200 dark:border-slate-800 pt-6 sm:pt-8">
                    <p className="text-[9px] sm:text-xs lg:text-sm font-black uppercase tracking-widest text-slate-400">Next drop: Secret mythical borders arriving soon...</p>
                </div>

                {/* Lab Decoration Footer - Responsive */}
                <div className="mt-6 sm:mt-16 lg:mt-32 p-4 sm:p-8 lg:p-12 rounded-2xl sm:rounded-[2.5rem] lg:rounded-[4rem] bg-slate-900 text-white relative overflow-hidden">
                    <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-6 lg:gap-8 text-center sm:text-left">
                        <div className="space-y-1 sm:space-y-2 lg:space-y-4 max-w-lg">
                            <h2 className="text-lg sm:text-2xl lg:text-5xl font-black tracking-tighter italic uppercase underline decoration-primary decoration-2 sm:decoration-4 lg:decoration-8 underline-offset-2 sm:underline-offset-4 lg:underline-offset-8">The Alchemy Lab</h2>
                            <p className="text-slate-400 font-bold text-[9px] sm:text-xs lg:text-lg leading-relaxed">
                                Crystals can be activated during any lesson to give you that extra edge. <br className="hidden sm:block" />
                                <span className="text-primary">#GacorLiterally #SlayTheGrammar</span>
                            </p>
                        </div>
                        <div className="flex gap-3 sm:gap-4">
                            <div className="size-11 sm:size-12 lg:size-16 rounded-xl sm:rounded-2xl lg:rounded-3xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors cursor-help">
                                <Icon name="help_outline" size={20} className="sm:size-6 lg:size-8" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <LoginModal
                isOpen={isLoginModalOpen}
                onClose={() => setIsLoginModalOpen(false)}
                description="Kamu harus login dulu buat jajan di Arena Shop. Biar inventory kamu literally aman!"
            />
        </PageLayout>
    );
}
