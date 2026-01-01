'use client';

import { useCallback, useRef } from 'react';

type SoundType = 'CORRECT' | 'WRONG' | 'CLICK' | 'CRYSTAL' | 'SUCCESS' | 'GAMEOVER' | 'START' | 'SPECIAL_WIN' | 'INTRUDER';

const SOUND_FILES: Record<SoundType, string[]> = {
    CORRECT: ['/sounds/correct.mp3', '/sounds/correct.2.mp3', '/sounds/correct.3.mp3', '/sounds/correct.4.mp3'],
    WRONG: ['/sounds/wrong.mp3', '/sounds/wrong.2.mp3'],
    CLICK: ['/sounds/click.mp3'],
    CRYSTAL: ['/sounds/crystal.mp3', '/sounds/crystal.2.mp3'],
    SUCCESS: ['/sounds/successe.mp3', '/sounds/success.2.mp3'],
    GAMEOVER: ['/sounds/gameover.mp3', '/sounds/gameover.2.mp3', '/sounds/gameover.3.mp3', '/sounds/gameover.4.mp3'],
    START: ['/sounds/start.mp3'],
    SPECIAL_WIN: ['/sounds/special-win.1.mp3', '/sounds/special-win.2.mp3'],
    INTRUDER: ['/sounds/intruder.mp3'],
};

// Global audio cache to prevent "lag" and excessive garbage collection
const audioCache: Record<string, HTMLAudioElement> = {};

export const useSound = () => {
    const playSound = useCallback((type: SoundType) => {
        try {
            const variations = SOUND_FILES[type];
            if (!variations || variations.length === 0) return;

            const randomIndex = Math.floor(Math.random() * variations.length);
            const soundPath = variations[randomIndex];

            if (typeof Audio === 'undefined') return;

            let audio = audioCache[soundPath];

            if (!audio) {
                audio = new Audio(soundPath);
                audio.volume = 0.5;
                audioCache[soundPath] = audio;
            } else {
                audio.currentTime = 0;
            }

            const playPromise = audio.play();

            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    if (error.name === 'NotAllowedError') {
                        console.warn(`[SoundSystem] Blocked for ${type}. Queuing for next interaction.`);

                        // Fallback: Play on next click anywhere on the document
                        const playOnInteraction = () => {
                            audio.play().catch(() => { });
                            document.removeEventListener('click', playOnInteraction);
                        };
                        document.addEventListener('click', playOnInteraction);
                    } else {
                        console.error(`[SoundSystem] Error playing ${type}:`, error);
                    }
                });
            }
        } catch (error) {
            console.error('Sound system error:', error);
        }
    }, []);

    return { playSound };
};
