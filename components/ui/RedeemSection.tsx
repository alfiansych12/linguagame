'use client';

import React, { useState } from 'react';
import { Icon, Button } from './UIComponents';
import { redeemPromoCode } from '@/app/actions/userActions';
import { motion, AnimatePresence } from 'framer-motion';

export function RedeemSection() {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    const handleRedeem = async () => {
        if (!code.trim()) return;
        setLoading(true);
        setMessage(null);

        try {
            const res = await redeemPromoCode(code);
            if (res.success) {
                setMessage({ text: res.message || 'Berhasil!', type: 'success' });
                setCode('');
            } else {
                setMessage({ text: res.error || 'Gagal redeem.', type: 'error' });
            }
        } catch (err) {
            setMessage({ text: 'Terjadi kesalahan.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full space-y-3 mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
            <div className="flex items-center gap-2 mb-1">
                <Icon name="confirmation_number" size={14} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Punya Kode Promo?</span>
            </div>

            <div className="relative group">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="INPUT KODE DISINI"
                    className="w-full bg-slate-50 dark:bg-white/5 border-2 border-slate-100 dark:border-slate-800 rounded-xl px-4 py-3 text-xs font-black uppercase tracking-widest focus:border-primary outline-none transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
                    onKeyDown={(e) => e.key === 'Enter' && handleRedeem()}
                />
                <button
                    onClick={handleRedeem}
                    disabled={loading || !code.trim()}
                    className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 disabled:opacity-50 disabled:grayscale transition-all"
                >
                    {loading ? <Icon name="progress_activity" size={12} className="animate-spin" /> : 'REDEEM'}
                </button>
            </div>

            <AnimatePresence>
                {message && (
                    <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className={`text-[9px] font-bold text-center uppercase tracking-wider ${message.type === 'success' ? 'text-success' : 'text-error'}`}
                    >
                        {message.text}
                    </motion.p>
                )}
            </AnimatePresence>
        </div>
    );
}
