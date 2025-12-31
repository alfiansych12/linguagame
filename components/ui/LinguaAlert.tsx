'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAlertStore } from '@/store/alert-store';
import { Icon, Button } from './UIComponents';

export const LinguaAlert = () => {
    const {
        isOpen, title, message, type, confirmLabel, onConfirm,
        cancelLabel, onCancel, closeAlert,
        quantity, setQuantity, pricePerItem, showQuantitySelector
    } = useAlertStore();

    // Close on ESC key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeAlert();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [closeAlert]);

    const getTypeStyles = () => {
        switch (type) {
            case 'success':
                return {
                    icon: 'check_circle',
                    color: 'text-emerald-500',
                    bg: 'bg-emerald-500/10',
                    border: 'border-emerald-500/20',
                    glow: 'shadow-emerald-500/20'
                };
            case 'error':
                return {
                    icon: 'error',
                    color: 'text-error',
                    bg: 'bg-error/10',
                    border: 'border-error/20',
                    glow: 'shadow-error/20'
                };
            case 'crystal':
                return {
                    icon: 'diamond',
                    color: 'text-primary',
                    bg: 'bg-primary/10',
                    border: 'border-primary/20',
                    glow: 'shadow-primary/20'
                };
            case 'xp':
                return {
                    icon: 'bolt',
                    color: 'text-orange-500',
                    bg: 'bg-orange-500/10',
                    border: 'border-orange-500/20',
                    glow: 'shadow-orange-500/20'
                };
            case 'warning':
                return {
                    icon: 'warning',
                    color: 'text-yellow-500',
                    bg: 'bg-yellow-500/10',
                    border: 'border-yellow-500/20',
                    glow: 'shadow-yellow-500/20'
                };
            default:
                return {
                    icon: 'info',
                    color: 'text-blue-500',
                    bg: 'bg-blue-500/10',
                    border: 'border-blue-500/20',
                    glow: 'shadow-blue-500/20'
                };
        }
    };

    const styles = getTypeStyles();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeAlert}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-md"
                    />

                    {/* Alert Card */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className={`relative w-full max-w-[340px] md:max-w-sm bg-white/90 dark:bg-slate-900/90 border-2 ${styles.border} p-6 md:p-8 rounded-[2rem] md:rounded-[2.5rem] shadow-2xl ${styles.glow} backdrop-blur-2xl text-center overflow-hidden`}
                    >
                        {/* Decorative background circle */}
                        <div className={`absolute -top-12 -right-12 size-32 ${styles.bg} rounded-full blur-3xl`} />
                        <div className={`absolute -bottom-12 -left-12 size-32 ${styles.bg} rounded-full blur-3xl`} />

                        {/* Icon Container */}
                        <motion.div
                            initial={{ rotate: -15, scale: 0 }}
                            animate={{ rotate: 0, scale: 1 }}
                            transition={{ type: 'spring', delay: 0.1 }}
                            className={`size-16 md:size-20 ${styles.bg} ${styles.color} rounded-2xl md:rounded-[2rem] flex items-center justify-center mx-auto mb-4 md:mb-6 relative z-10`}
                        >
                            <Icon name={styles.icon} size={32} mdSize={40} filled />
                        </motion.div>

                        {/* Text Content */}
                        <div className="relative z-10 space-y-1 md:space-y-2 mb-6 md:mb-8">
                            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase italic tracking-tight leading-none">
                                {title}
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 font-bold text-[11px] md:text-sm leading-relaxed px-2">
                                {message}
                            </p>
                        </div>

                        {/* Quantity Selector & Total Price */}
                        {showQuantitySelector && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="relative z-10 mb-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border-2 border-slate-100 dark:border-slate-800"
                            >
                                <div className="flex items-center justify-between mb-3 md:mb-4">
                                    <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest">Jumlah</span>
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setQuantity(quantity - 1)}
                                            className="size-10 rounded-xl bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-90"
                                            disabled={quantity <= 1}
                                        >
                                            <Icon name="remove" size={20} />
                                        </button>
                                        <span className="text-xl font-black text-slate-900 dark:text-white w-8">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="size-10 rounded-xl bg-white dark:bg-slate-700 border-2 border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-primary hover:text-white hover:border-primary transition-all active:scale-90"
                                        >
                                            <Icon name="add" size={20} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-3 md:pt-4 border-t border-slate-200 dark:border-slate-800">
                                    <span className="text-[9px] md:text-[10px] font-black uppercase text-slate-400 tracking-widest">Total Harga</span>
                                    <div className="flex items-center gap-1.5 text-primary">
                                        <Icon name="diamond" size={14} mdSize={16} filled />
                                        <span className="text-base md:text-lg font-black tracking-tight">{pricePerItem ? pricePerItem * quantity : 0}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Buttons */}
                        <div className={`relative z-10 flex ${cancelLabel ? 'flex-col sm:flex-row' : 'flex-col'} gap-3`}>
                            {cancelLabel && (
                                <Button
                                    fullWidth
                                    variant="ghost"
                                    className="py-3 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs border-2 border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
                                    onClick={() => {
                                        if (onCancel) onCancel();
                                        closeAlert();
                                    }}
                                >
                                    {cancelLabel}
                                </Button>
                            )}
                            <Button
                                fullWidth
                                variant="primary"
                                className={`py-3 md:py-4 rounded-xl md:rounded-2xl font-black uppercase tracking-widest text-[10px] md:text-xs shadow-lg transition-all active:scale-95 ${type === 'error' ? 'bg-error hover:bg-error-dark' : ''} ${type === 'crystal' ? 'shadow-primary/30' : ''}`}
                                onClick={() => {
                                    if (onConfirm) onConfirm();
                                    closeAlert();
                                }}
                            >
                                {confirmLabel}
                            </Button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
