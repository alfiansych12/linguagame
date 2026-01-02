'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Icon, Badge, Button } from '@/components/ui/UIComponents';
import { AvatarFrame } from '@/components/ui/AvatarFrame';
import { checkBorderUnlocked, getBorderDisplayName, getBorderDescription, BORDER_UNLOCK_CONDITIONS } from '@/lib/utils/borderUnlocks';
import { useUserStore } from '@/store/user-store';
import { useAlertStore } from '@/store/alert-store';
import { equipBorder } from '../../app/actions/userActions';

interface BorderSelectorProps {
    onClose: () => void;
}

const ALL_BORDERS = ['default', 'silver_warrior', 'gold_champion', 'diamond_master', 'emerald_mythic', 'royal_obsidian', 'infinity_void', 'celestial_dragon', 'admin_glitch'];

export const BorderSelector: React.FC<BorderSelectorProps> = ({ onClose }) => {
    const {
        userId,
        name,
        image,
        totalXp,
        duelWins,
        currentStreak,
        unlockedAchievements,
        unlockedBorders,
        equippedBorder,
        isPro,
        proUntil,
        setEquippedBorder
    } = useUserStore();
    const { showAlert } = useAlertStore();
    const [selectedBorder, setSelectedBorder] = useState(equippedBorder || 'default');
    const [isEquipping, setIsEquipping] = useState(false);

    if (!userId) return null;

    // Memoize user data for unlock check
    const userForCheck = {
        total_xp: totalXp,
        duel_wins: duelWins,
        current_streak: currentStreak,
        unlocked_achievements: unlockedAchievements,
        unlocked_borders: unlockedBorders,
        is_pro: isPro,
        pro_until: proUntil,
        name: name
    };

    const handleEquip = async () => {
        if (selectedBorder === equippedBorder) {
            showAlert({
                title: 'Sudah Terpasang',
                message: 'Border ini sudah kamu pakai sekarang!',
                type: 'info'
            });
            return;
        }

        setIsEquipping(true);
        try {
            const result = await equipBorder({ borderId: selectedBorder });
            if (result.success) {
                setEquippedBorder(selectedBorder);
                showAlert({
                    title: 'Berhasil!',
                    message: 'Border gajor kamu berhasil dipasang! 🎨',
                    type: 'success',
                    autoClose: 3000
                });
                onClose();
            } else {
                showAlert({
                    title: 'Gagal',
                    message: result.error || 'Gagal memasang border',
                    type: 'error'
                });
            }
        } catch (error) {
            showAlert({
                title: 'Error',
                message: 'Terjadi kesalahan sistem, coba lagi nanti.',
                type: 'error'
            });
        } finally {
            setIsEquipping(false);
        }
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4"
            >
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-2xl relative max-h-[90vh] overflow-y-auto hide-scrollbar"
                >
                    {/* Glow Effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/20 blur-[80px] rounded-full -z-10" />

                    <div className="bg-white/90 dark:bg-[#0a0a0f]/95 border border-white/20 dark:border-slate-800 rounded-[2.5rem] p-6 md:p-8 shadow-2xl relative overflow-hidden">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter leading-none mb-1">
                                    Avatar <span className="text-primary">Borders</span>
                                </h2>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest">
                                    Pilih & Equip Border Kamu
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="size-10 rounded-full bg-black/10 dark:bg-white/10 flex items-center justify-center hover:bg-black/20 dark:hover:bg-white/20 transition-colors backdrop-blur-sm group"
                            >
                                <Icon name="close" size={20} className="text-slate-900 dark:text-white group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>

                        {/* Preview */}
                        <div className="bg-slate-50 dark:bg-white/5 rounded-3xl p-6 mb-6 border border-slate-100 dark:border-white/5">
                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <div className="relative">
                                    <AvatarFrame
                                        src={image}
                                        alt={name}
                                        size="3xl"
                                        borderId={selectedBorder}
                                        fallbackInitial={name?.charAt(0) || '?'}
                                    />
                                </div>
                                <div className="flex-1 text-center md:text-left">
                                    <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-2 uppercase italic">
                                        {getBorderDisplayName(selectedBorder)}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                                        {getBorderDescription(selectedBorder)}
                                    </p>
                                    {selectedBorder === equippedBorder ? (
                                        <Badge variant="success" className="text-xs">
                                            <Icon name="check_circle" size={14} className="mr-1" filled />
                                            Currently Equipped
                                        </Badge>
                                    ) : (
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={handleEquip}
                                            disabled={isEquipping || (!unlockedBorders.includes(selectedBorder) && !checkBorderUnlocked(selectedBorder, userForCheck))}
                                        >
                                            {isEquipping ? 'Equipping...' : 'Equip Border'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Border Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {ALL_BORDERS.map((borderId) => {
                                const isUnlocked = checkBorderUnlocked(borderId, userForCheck);
                                const isEquipped = borderId === equippedBorder;
                                const isSelected = borderId === selectedBorder;
                                const condition = BORDER_UNLOCK_CONDITIONS[borderId];

                                return (
                                    <motion.div
                                        key={borderId}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => setSelectedBorder(borderId)}
                                        className={`
                                            relative p-4 rounded-2xl border-2 cursor-pointer transition-all
                                            ${isSelected
                                                ? 'border-primary bg-primary/5'
                                                : 'border-slate-200 dark:border-slate-800 hover:border-primary/50'
                                            }
                                            ${!isUnlocked ? 'opacity-60' : ''}
                                        `}
                                    >
                                        {/* Lock Overlay */}
                                        {!unlockedBorders.includes(borderId) && !checkBorderUnlocked(borderId, userForCheck) && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-2xl z-10 backdrop-blur-sm">
                                                <div className="text-center">
                                                    <Icon name="lock" size={24} className="text-white mb-2 mx-auto" />
                                                    <p className="text-[10px] text-white font-black uppercase tracking-widest px-2 leading-tight">
                                                        {condition.requiresPro && !isPro ? (
                                                            <span className="text-primary flex items-center justify-center gap-1">
                                                                <Icon name="workspace_premium" size={10} /> PRO ONLY
                                                            </span>
                                                        ) : (
                                                            <>
                                                                {condition.type === 'xp' && `${condition.value} XP`}
                                                                {condition.type === 'purchase' && `Forge @ Shop`}
                                                                {condition.type === 'admin' && 'ADMIN ONLY'}
                                                            </>
                                                        )}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Border Preview */}
                                        <div className="flex justify-center mb-3">
                                            <AvatarFrame
                                                src={image}
                                                alt=""
                                                size="xl"
                                                borderId={borderId}
                                                fallbackInitial={name?.charAt(0) || '?'}
                                            />
                                        </div>

                                        {/* Border Name */}
                                        <h4 className="text-xs font-black text-slate-900 dark:text-white text-center uppercase tracking-tight mb-1">
                                            {getBorderDisplayName(borderId)}
                                        </h4>

                                        {/* Status Badge */}
                                        {isEquipped && (
                                            <div className="absolute top-2 right-2">
                                                <Badge variant="success" className="text-[8px] py-0 px-2">
                                                    <Icon name="check" size={10} />
                                                </Badge>
                                            </div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
};
