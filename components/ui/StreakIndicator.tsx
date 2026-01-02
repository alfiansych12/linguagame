'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from './UIComponents';
import { useUserStore } from '@/store/user-store';
import { useSession } from 'next-auth/react';

/**
 * Streak Indicator Component
 * Shows current streak with fire animation and Phoenix Crystal status
 */
export const StreakIndicator: React.FC<{ className?: string }> = ({ className = '' }) => {
    const { currentStreak, inventory } = useUserStore();
    const { data: session } = useSession();
    const [showPhoenixGlow, setShowPhoenixGlow] = useState(false);

    const hasPhoenix = (inventory?.slay || 0) > 0;

    useEffect(() => {
        if (hasPhoenix) {
            const interval = setInterval(() => {
                setShowPhoenixGlow(prev => !prev);
            }, 2000);
            return () => clearInterval(interval);
        }
    }, [hasPhoenix]);

    if (!session) return null;

    return (
        <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`relative ${className}`}
        >
            {/* Phoenix Glow Effect */}
            <AnimatePresence>
                {hasPhoenix && showPhoenixGlow && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1.2 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 bg-rose-500/30 rounded-2xl blur-xl -z-10"
                    />
                )}
            </AnimatePresence>

            <div className={`
                flex items-center gap-2 px-4 py-2 rounded-2xl
                ${hasPhoenix
                    ? 'bg-gradient-to-r from-rose-500/20 to-orange-500/20 border-2 border-rose-500/30'
                    : 'bg-orange-500/10 border-2 border-orange-500/20'
                }
                backdrop-blur-sm
            `}>
                {/* Fire Icon */}
                <div className="relative">
                    <Icon
                        name="local_fire_department"
                        filled
                        size={24}
                        className={`
                            ${currentStreak >= 7 ? 'text-orange-500' : 'text-orange-400'}
                            ${currentStreak >= 30 ? 'animate-pulse' : ''}
                        `}
                    />
                    {currentStreak >= 30 && (
                        <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="absolute -top-1 -right-1"
                        >
                            <Icon name="auto_awesome" filled size={12} className="text-yellow-400" />
                        </motion.div>
                    )}
                </div>

                {/* Streak Count */}
                <div className="flex flex-col items-start">
                    <span className="text-xs font-black text-orange-500 leading-none">
                        {currentStreak} Hari
                    </span>
                    {hasPhoenix && (
                        <span className="text-[8px] font-bold text-rose-500 leading-none mt-0.5">
                            Phoenix Ready
                        </span>
                    )}
                </div>

                {/* Phoenix Icon */}
                {hasPhoenix && (
                    <Icon
                        name="auto_awesome"
                        filled
                        size={16}
                        className="text-rose-500 animate-pulse"
                    />
                )}
            </div>

            {/* Streak Milestone Badges */}
            {currentStreak >= 7 && (
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-[8px] font-black px-2 py-0.5 rounded-full shadow-lg">
                    {currentStreak >= 30 ? '🔥 LEGEND' : currentStreak >= 14 ? '⚡ ELITE' : '✨ HOT'}
                </div>
            )}
        </motion.div>
    );
};
