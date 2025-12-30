'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon, Button } from './UIComponents';
import { useUserStore } from '@/store/user-store';
import { useSession } from 'next-auth/react';
import { useSound } from '@/hooks/use-sound';

interface Step {
    targetId?: string;
    text: string;
    title: string;
    position: 'center' | 'bottom' | 'top' | 'left' | 'right';
    image: string;
}

const Typewriter = ({ text }: { text: string }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
        setDisplayedText('');
        let i = 0;
        const timer = setInterval(() => {
            setDisplayedText((prev) => prev + text.charAt(i));
            i++;
            if (i >= text.length) clearInterval(timer);
        }, 30);
        return () => clearInterval(timer);
    }, [text]);

    return <span>{displayedText}</span>;
};

export const OnboardingOverlay: React.FC = () => {
    const { data: session, status } = useSession();
    const { hasSeenTutorial, setHasSeenTutorial } = useUserStore();
    const { playSound } = useSound();
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

    const steps: Step[] = [
        {
            title: "Literally Welcome!",
            text: "Gue Mentor sirkel lo. Siap bikin lo jadi sepuh bahasa Inggris yang paling gacor!",
            position: 'center',
            image: '/assets/mascot_welcome.png'
        },
        {
            targetId: 'nav-home',
            title: "Misi Utama",
            text: "Di sini tempat lo battle kata-kata. Slay Phase 1 sampe 3 buat tamatin Journey lo!",
            position: 'bottom',
            image: '/assets/mascot_misi.png'
        },
        {
            targetId: 'nav-duel',
            title: "Arena Duel",
            text: "Bosen belajar sendiri? Mabar or duel adu mekanik lawan sirkel lo di sini!",
            position: 'bottom',
            image: '/assets/mascot_arena.png'
        },
        {
            targetId: 'nav-forge',
            title: "The Forge",
            text: "Belanja Crystal & item rare di sini. Pake Booster biar progress lo makin melesat!",
            position: 'bottom',
            image: '/assets/mascot_forge.png'
        },
        {
            targetId: 'nav-leaderboard',
            title: "Sirkel Board",
            text: "Pantau rival lo. Jangan sampe kegeser dari tahta paling gacor!",
            position: 'bottom',
            image: '/assets/mascot_board.png'
        },
        {
            targetId: 'nav-profile',
            title: "Branding lo",
            text: "Urus profile paling kece & baca Handbook buat info spefik tentang sirkel ini.",
            position: 'bottom',
            image: '/assets/mascot_branding.png'
        },
        {
            title: "Gas Sekarang!",
            text: "Enjoy the slay journey, literally. Let's get that XP!",
            position: 'center',
            image: '/assets/mascot_welcome.png'
        }
    ];

    useEffect(() => {
        if (!hasSeenTutorial && status === 'authenticated') {
            const timer = setTimeout(() => setIsVisible(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [hasSeenTutorial, status]);

    useEffect(() => {
        const targetId = steps[currentStep].targetId;
        if (targetId && isVisible) {
            const el = document.getElementById(targetId);
            if (el) {
                setTargetRect(el.getBoundingClientRect());
            }
        } else {
            setTargetRect(null);
        }
    }, [currentStep, isVisible]);

    const handleNext = () => {
        playSound('CLICK');
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            setIsVisible(false);
            setHasSeenTutorial(true);
        }
    };

    if (!isVisible) return null;

    const step = steps[currentStep];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden">
                {/* Backdrop with Dynamic Spotlight Hole */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{
                        opacity: 1,
                        // Membuat "lubang" (hole) di tengah backdrop menggunakan clip-path
                        clipPath: targetRect
                            ? `polygon(
                                0% 0%, 0% 100%, 
                                ${targetRect.left}px 100%, 
                                ${targetRect.left}px ${targetRect.top}px, 
                                ${targetRect.right}px ${targetRect.top}px, 
                                ${targetRect.right}px ${targetRect.bottom}px, 
                                ${targetRect.left}px ${targetRect.bottom}px, 
                                ${targetRect.left}px 100%, 
                                100% 100%, 100% 0%
                              )`
                            : 'polygon(0% 0%, 0% 100%, 100% 100%, 100% 0%)'
                    }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                    onClick={handleNext}
                />

                {/* Content */}
                <div className="relative z-10 w-full max-w-lg px-6 flex flex-col items-center animate-float">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -20 }}
                        className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 md:p-12 shadow-2xl border-4 border-primary/20 relative"
                    >
                        {/* Mascot */}
                        <motion.div
                            key={`mascot-${currentStep}`}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            className="absolute -top-32 left-1/2 -translate-x-1/2 w-48 h-48 drop-shadow-2xl"
                        >
                            <img
                                src={step.image}
                                alt="Mascot"
                                className="w-full h-full object-contain"
                            />
                        </motion.div>

                        <div className="pt-8 text-center space-y-6">
                            <div className="space-y-2">
                                <h3 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white italic uppercase tracking-tighter">
                                    {step.title}
                                </h3>
                                <p className="text-slate-500 dark:text-slate-400 font-bold text-lg leading-relaxed min-h-[4.5rem]">
                                    <Typewriter text={step.text} />
                                </p>
                            </div>

                            <div className="flex flex-col items-center gap-4">
                                <Button
                                    variant="primary"
                                    fullWidth
                                    className="py-5 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl"
                                    onClick={handleNext}
                                >
                                    {currentStep === steps.length - 1 ? 'Slay! 🔥' : 'Lanjut Gan'}
                                </Button>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em] animate-pulse">
                                    Click anywhere to continue
                                </p>
                            </div>
                        </div>

                        {/* Progress Dots */}
                        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
                            {steps.map((_: any, i: number) => (
                                <div
                                    key={i}
                                    className={`size-2 rounded-full transition-all duration-300 ${i === currentStep ? 'w-8 bg-primary' : 'bg-slate-700'}`}
                                />
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* UI Highlight Pulse (Dynamic Position) */}
                {targetRect && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="fixed pointer-events-none border-4 border-primary rounded-2xl md:rounded-[2rem] z-[110]"
                        style={{
                            top: targetRect.top - 8,
                            left: targetRect.left - 8,
                            width: targetRect.width + 16,
                            height: targetRect.height + 16,
                        }}
                    >
                        <div className="absolute inset-0 bg-primary/20 rounded-2xl md:rounded-[2rem] animate-ping" />
                    </motion.div>
                )}
            </div>
        </AnimatePresence>
    );
};
