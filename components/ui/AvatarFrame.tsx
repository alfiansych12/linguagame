'use client';

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Icon } from './UIComponents';

export type BorderId = 'default' | 'silver_warrior' | 'gold_champion' | 'diamond_master' | 'admin_glitch' | 'emerald_mythic' | 'royal_obsidian' | 'infinity_void' | 'celestial_dragon';

interface AvatarFrameProps {
    src?: string | null;
    alt?: string;
    borderId?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
    className?: string;
    fallbackInitial?: string;
}

export const AvatarFrame: React.FC<AvatarFrameProps> = memo(({
    src,
    alt = 'Avatar',
    borderId = 'default',
    size = 'md',
    className = '',
    fallbackInitial = '?'
}) => {
    // Adding hardware acceleration hint
    const accelClass = "translate-z-0 backface-hidden";
    // Size Mappings
    const sizeMap = {
        sm: { container: 'size-8', image: 32 },
        md: { container: 'size-12', image: 48 },
        lg: { container: 'size-16', image: 64 },
        xl: { container: 'size-24', image: 96 },
        '2xl': { container: 'size-32', image: 128 },
        '3xl': { container: 'size-40', image: 160 }
    };

    const currentSize = sizeMap[size] || sizeMap.md;

    // Gradient Fallback
    const getGradient = (seed: string) => {
        const gradients = [
            'from-blue-400 to-indigo-500',
            'from-purple-400 to-pink-500',
            'from-emerald-400 to-teal-500',
            'from-orange-400 to-red-500'
        ];
        return gradients[seed.length % gradients.length];
    };

    // Border Configuration: CSS-based is default for premium animated effects
    const borderConfig: Record<string, { type: 'image' | 'css', imagePath?: string }> = {
        'gold_champion': { type: 'css' },
        'diamond_master': { type: 'css' },
        'silver_warrior': { type: 'css' },
        'admin_glitch': { type: 'css' },
        'emerald_mythic': { type: 'css' },
        'royal_obsidian': { type: 'css' },
        'infinity_void': { type: 'css' },
        'celestial_dragon': { type: 'css' },
        'default': { type: 'css' }
    };

    const currentBorderConfig = borderConfig[borderId] || borderConfig.default;

    // --- CSS-BASED ULTRA PREMIUM BORDERS (Fallback) ---

    const SilverBorder = () => (
        <div className="absolute inset-[-15%] z-20 pointer-events-none">
            {/* Advanced SVG Filter for Metallic Effect */}
            <svg className="absolute inset-0 size-full opacity-0">
                <defs>
                    <filter id="silver-metallic">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="3" result="blur" />
                        <feSpecularLighting in="blur" surfaceScale="5" specularConstant="0.8" specularExponent="20" lightingColor="#e0e0e0" result="spec">
                            <fePointLight x="-5000" y="-10000" z="20000" />
                        </feSpecularLighting>
                        <feComposite in="spec" in2="SourceAlpha" operator="in" result="specOut" />
                        <feComposite in="SourceGraphic" in2="specOut" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" />
                    </filter>
                </defs>
            </svg>

            <div className="absolute inset-0 rounded-full border-[3px] border-slate-400 bg-gradient-to-b from-slate-200 to-slate-600 opacity-50 shadow-[inset_0_2px_4px_rgba(255,255,255,0.5)]" />

            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[2%] rounded-full border-2 border-dashed border-slate-300/60"
            />

            <div className="absolute -top-[5%] left-1/2 -translate-x-1/2 w-[60%] h-[20%] bg-gradient-to-b from-slate-100 via-slate-300 to-slate-400 rounded-b-xl shadow-lg border-t-2 border-slate-50" />
            <div className="absolute -bottom-[5%] left-1/2 -translate-x-1/2 w-[60%] h-[15%] bg-gradient-to-t from-slate-800 via-slate-600 to-slate-500 rounded-t-xl shadow-lg border-b-2 border-slate-600" />

            <div className="absolute top-[10%] left-[10%] size-1.5 md:size-2 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan,0_0_20px_cyan] animate-pulse" />
            <div className="absolute top-[10%] right-[10%] size-1.5 md:size-2 bg-cyan-400 rounded-full shadow-[0_0_10px_cyan,0_0_20px_cyan] animate-pulse" />
        </div>
    );

    const GoldBorder = () => (
        <div className="absolute inset-[-25%] z-20 pointer-events-none">
            <svg className="absolute inset-0 size-full opacity-0">
                <defs>
                    <filter id="gold-glow">
                        <feGaussianBlur stdDeviation="10" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <radialGradient id="gold-gradient">
                        <stop offset="0%" stopColor="#FCD34D" />
                        <stop offset="50%" stopColor="#F59E0B" />
                        <stop offset="100%" stopColor="#B45309" />
                    </radialGradient>
                </defs>
            </svg>

            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0deg,rgba(251,191,36,0.3)_30deg,transparent_60deg)] opacity-60 rounded-full"
            />

            <div className="absolute inset-[8%] rounded-full border-[4px] md:border-[6px] border-transparent shadow-[0_0_25px_rgba(251,191,36,0.5)]"
                style={{
                    background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 50%, #B45309 100%) border-box',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude'
                }}
            />

            <div className="absolute -top-[5%] left-1/2 -translate-x-1/2 w-[80%] h-[10%] bg-gradient-to-r from-yellow-300 via-yellow-100 to-yellow-300 rounded-full shadow-[0_0_20px_gold] blur-[1px]" />
            <div className="absolute top-[0%] left-1/2 -translate-x-1/2 size-3 md:size-4 rotate-45 bg-yellow-100 border-2 border-yellow-600 z-10 shadow-[0_0_15px_gold,0_0_30px_rgba(251,191,36,0.5)]" />

            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-[20%] -right-[5%] size-1.5 md:size-2 bg-white rounded-full shadow-[0_0_15px_white,0_0_30px_rgba(255,255,255,0.8)]"
            />
            <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute bottom-[20%] -left-[5%] size-1 md:size-1.5 bg-yellow-200 rounded-full shadow-[0_0_10px_yellow]"
            />
            <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                className="absolute bottom-[30%] right-[5%] size-1 bg-amber-300 rounded-full shadow-[0_0_10px_amber]"
            />
        </div>
    );

    const DiamondBorder = () => (
        <div className={`absolute inset-[-35%] z-20 pointer-events-none ${accelClass}`}>
            <div className="absolute inset-[10%] rounded-full bg-cyan-400/20 blur-[40px] animate-pulse" />
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 border-[1px] border-cyan-400/20 rounded-full"
            />
            {[...Array(6)].map((_, i) => (
                <motion.div
                    key={i}
                    animate={{ rotate: 360, scale: [1, 1.2, 1], y: [-5, 5, -5] }}
                    transition={{ duration: 15 + i * 2, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-0"
                    style={{ transform: `rotate(${i * 60}deg)` }}
                >
                    <div className="absolute top-0 left-1/2 -ml-2 w-4 h-6 bg-gradient-to-br from-cyan-200 to-white/40 drop-shadow-[0_0_12px_rgba(34,211,238,0.8)]" style={{ clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)' }} />
                </motion.div>
            ))}
            <div className="absolute inset-[15%] rounded-full border-[5px] border-transparent shadow-[0_0_50px_rgba(6,182,212,0.6),inset_0_0_20px_rgba(255,255,255,0.4)]"
                style={{
                    background: 'conic-gradient(from 0deg, #06b6d4, #22d3ee, #fff, #22d3ee, #06b6d4) border-box',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude'
                }}
            />
            <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.2, 0.5, 0.2] }} transition={{ duration: 3, repeat: Infinity }} className="absolute inset-[15%] rounded-full border-[2px] border-cyan-300" />
        </div>
    );

    const EmeraldBorder = () => (
        <div className={`absolute inset-[-40%] z-20 pointer-events-none ${accelClass}`}>
            <div className="absolute inset-[10%] rounded-full bg-emerald-500/25 blur-[50px] animate-pulse" />
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute inset-0">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="absolute inset-0 border-2 border-emerald-400/20 rounded-full" style={{ transform: `scale(${0.8 + i * 0.1}) skew(${i * 10}deg)` }} />
                ))}
            </motion.div>

            {/* LUXURY PARTICLES */}
            {[...Array(12)].map((_, i) => (
                <motion.div
                    key={`p-${i}`}
                    initial={{ opacity: 0, scale: 0, y: 0 }}
                    animate={{
                        opacity: [0, 0.8, 0],
                        scale: [0, 1.2, 0],
                        y: [-10, -60],
                        x: [0, (i % 2 === 0 ? 30 : -30) * Math.random()]
                    }}
                    transition={{
                        duration: 2 + Math.random() * 2,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeOut"
                    }}
                    className="absolute top-1/2 left-1/2 size-1 bg-emerald-400 rounded-full blur-[1px] shadow-[0_0_10px_#10b981]"
                />
            ))}

            {[...Array(4)].map((_, i) => (
                <motion.div key={i} animate={{ rotate: 360, y: [-8, 8, -8] }} transition={{ duration: 20, repeat: Infinity, ease: "linear", delay: i * 5 }} className="absolute inset-0" style={{ transform: `rotate(${i * 90}deg)` }}>
                    <div className="absolute top-0 left-1/2 -ml-3 w-6 h-8 bg-emerald-400 border border-emerald-200/50 shadow-[0_0_20px_#10b981]" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }} />
                </motion.div>
            ))}
            <div className="absolute inset-[18%] rounded-full border-[6px] border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.7),inset_0_0_20px_rgba(16,185,129,0.3)] overflow-hidden">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute inset-[-100%] bg-[conic-gradient(from_0deg,transparent,rgba(52,211,153,0.4),transparent)]" />
            </div>
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 px-3 py-0.5 bg-emerald-900 border border-emerald-400 rounded-full text-[8px] text-emerald-100 font-black tracking-widest shadow-[0_0_15px_#10b981]">MYTHIC SOUL</div>
        </div>
    );

    const ObsidianBorder = () => (
        <div className={`absolute inset-[-25%] z-20 pointer-events-none ${accelClass}`}>
            <div className="absolute inset-0 rounded-full bg-slate-950 shadow-[0_0_60px_rgba(147,51,234,0.4)] border-2 border-purple-900/50" />
            <div className="absolute inset-0 overflow-hidden rounded-full">
                <motion.div animate={{ scale: [1, 1.2, 1], rotate: 360, opacity: [0.4, 0.7, 0.4] }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute inset-[-50%] bg-[radial-gradient(circle,rgba(88,28,135,0.4)_0%,transparent_70%)] blur-[25px]" />
            </div>

            {/* VOID PARTICLES */}
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={`v-${i}`}
                    initial={{ scale: 0, x: (Math.random() - 0.5) * 100, y: (Math.random() - 0.5) * 100, opacity: 0 }}
                    animate={{
                        scale: [0, 1.5, 0],
                        x: 0,
                        y: 0,
                        opacity: [0, 1, 0],
                        rotate: 360
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: i * 0.2,
                        ease: "circIn"
                    }}
                    className="absolute top-1/2 left-1/2 size-1 bg-purple-400 rounded-full shadow-[0_0_8px_purple] blur-[0.5px]"
                />
            ))}

            <div className="absolute inset-[8%] rounded-full border-[7px] border-transparent shadow-[inset_0_0_30px_black]"
                style={{
                    background: 'linear-gradient(135deg, #000 0%, #3b0764 25%, #7e22ce 50%, #3b0764 75%, #000 100%) border-box',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude'
                }}
            />
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 px-3 py-1 bg-black border border-purple-600 rounded-lg text-[9px] text-purple-400 font-black italic tracking-tighter shadow-[0_0_20px_purple] uppercase">Obsidian Wrath</div>
        </div>
    );

    const InfinityBorder = () => (
        <div className={`absolute inset-[-35%] z-20 pointer-events-none overflow-hidden rounded-full ${accelClass}`}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="absolute inset-[-40%] bg-[conic-gradient(from_0deg,#000_0%,#1e1b4b_20%,#312e81_40%,#6366f1_50%,#312e81_60%,#1e1b4b_80%,#000_100%)] blur-[40px] opacity-80" />
            <div className="absolute inset-0">
                {[...Array(20)].map((_, i) => (
                    <motion.div key={i} animate={{ scale: [0, 1.5, 0], opacity: [0, 1, 0] }} transition={{ duration: 4 + Math.random() * 4, repeat: Infinity, delay: i * 0.4 }} className="absolute size-1 bg-white rounded-full shadow-[0_0_8px_white]" style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, filter: 'blur(0.5px)' }} />
                ))}
            </div>
            <motion.div animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-[10%]">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 size-4 bg-white rounded-full blur-[2px] shadow-[0_0_30px_white,0_0_60px_rgba(255,255,255,0.5)]" />
            </motion.div>
            <div className="absolute inset-[12%] rounded-full border-[10px] border-transparent shadow-[0_0_50px_rgba(99,102,241,0.4)]"
                style={{
                    background: 'linear-gradient(135deg, #000, #333, #fff, #333, #000) border-box',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude'
                }}
            />
        </div>
    );

    const CelestialBorder = () => (
        <div className={`absolute inset-[-40%] z-20 pointer-events-none ${accelClass}`}>
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }} className="absolute inset-[-20%] flex items-center justify-center opacity-60">
                {[...Array(16)].map((_, i) => (
                    <div key={i} className="absolute w-2 h-[150%] bg-gradient-to-b from-transparent via-amber-300/40 to-transparent" style={{ transform: `rotate(${i * 22.5}deg)` }} />
                ))}
            </motion.div>
            {[0, 90, 180, 270].map((deg) => (
                <motion.div key={deg} animate={{ scale: [1, 1.2, 1], opacity: [0.6, 1, 0.6] }} transition={{ duration: 3, repeat: Infinity, delay: deg / 90 }} className="absolute inset-0 flex items-center justify-center" style={{ transform: `rotate(${deg}deg)` }}>
                    <div className="absolute top-2">
                        <Icon name="auto_awesome" size={24} mdSize={32} className="text-yellow-400 drop-shadow-[0_0_20px_gold]" filled />
                    </div>
                </motion.div>
            ))}
            <div className="absolute inset-[20%] rounded-full border-[10px] border-transparent shadow-[0_0_70px_rgba(251,191,36,0.9),inset_0_0_30px_rgba(251,191,36,0.5)]"
                style={{
                    background: 'linear-gradient(135deg, #d97706, #fbbf24, #fffbeb, #fbbf24, #d97706) border-box',
                    WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                    WebkitMaskComposite: 'xor',
                    maskComposite: 'exclude'
                }}
            />

            {/* DIVINE PARTICLES */}
            <div className="absolute inset-[15%]">
                {[...Array(20)].map((_, i) => (
                    <motion.div
                        key={`d-${i}`}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: [0, 1, 0],
                            scale: [0, Math.random() * 1.5, 0],
                            y: [0, -40, -80],
                            x: [(Math.random() - 0.5) * 60, (Math.random() - 0.5) * 100],
                            rotate: [0, 180, 360]
                        }}
                        transition={{
                            duration: 2 + Math.random() * 3,
                            repeat: Infinity,
                            delay: i * 0.15,
                            ease: "easeOut"
                        }}
                        className="absolute top-1/2 left-1/2 size-1.5 md:size-2 bg-yellow-100 rounded-full shadow-[0_0_12px_#fbbf24] blur-[0.5px]"
                    />
                ))}
            </div>

            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-40 px-5 py-2 bg-gradient-to-r from-amber-700 via-yellow-400 to-amber-700 border-2 border-white rounded-full text-xs md:text-sm text-black font-black uppercase italic tracking-tighter shadow-[0_0_30px_gold] flex items-center gap-2">
                <Icon name="verified" size={16} />
                Celestial Sovereign
            </div>
        </div>
    );

    const AdminBorder = () => (
        <div className="absolute inset-[-15%] z-20 pointer-events-none overflow-hidden rounded-full">
            <div className="absolute inset-0 bg-red-500/10 mix-blend-overlay" />

            <div className="absolute inset-[10%] rounded-full border-2 border-red-600 opacity-80 animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.8)]" />
            <motion.div
                animate={{ x: [-2, 2, -2], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 0.2, repeat: Infinity }}
                className="absolute inset-[10%] rounded-full border-2 border-blue-500 opacity-50 mix-blend-screen"
            />

            <motion.div
                animate={{ scaleX: [-1, 1] }}
                transition={{ duration: 0.3, repeat: Infinity }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/20 to-transparent"
            />

            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-black border border-red-500 text-[8px] text-red-500 px-2 py-0.5 font-mono shadow-[0_0_10px_rgba(239,68,68,0.6)]">
                SYSTEM_OVERRIDE
            </div>
        </div>
    );

    const DefaultBorder = () => (
        <div className="absolute inset-0 z-20 pointer-events-none">
            <div className="absolute inset-0 rounded-full ring-2 ring-slate-100 dark:ring-slate-800" />
        </div>
    );

    // --- RENDER ---
    return (
        <div className={`relative ${currentSize.container} shrink-0 ${className} ${accelClass}`}>
            {/* Border Layer */}
            {currentBorderConfig.type === 'image' && currentBorderConfig.imagePath ? (
                <div className={`absolute inset-[-30%] z-20 pointer-events-none ${accelClass}`}>
                    <Image
                        src={currentBorderConfig.imagePath}
                        alt={`${borderId} border`}
                        fill
                        className="object-contain"
                    />
                </div>
            ) : (
                <div className={`absolute inset-0 ${accelClass}`}>
                    {borderId === 'silver_warrior' && <SilverBorder />}
                    {borderId === 'gold_champion' && <GoldBorder />}
                    {borderId === 'diamond_master' && <DiamondBorder />}
                    {borderId === 'admin_glitch' && <AdminBorder />}
                    {borderId === 'emerald_mythic' && <EmeraldBorder />}
                    {borderId === 'royal_obsidian' && <ObsidianBorder />}
                    {borderId === 'infinity_void' && <InfinityBorder />}
                    {borderId === 'celestial_dragon' && <CelestialBorder />}
                    {borderId === 'default' && <DefaultBorder />}
                </div>
            )}

            {/* Avatar Image Layer */}
            <div className={`absolute inset-0 rounded-full overflow-hidden bg-slate-200 dark:bg-slate-800 z-10 ${accelClass}`}>
                {src ? (
                    <img src={src} alt={alt} className="size-full object-cover" />
                ) : (
                    <div className={`size-full bg-gradient-to-br ${getGradient(alt)} flex items-center justify-center text-white font-black`}>
                        <span className={size === 'sm' ? 'text-xs' : size === 'xl' ? 'text-3xl' : 'text-lg'}>
                            {fallbackInitial.charAt(0).toUpperCase()}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
});
