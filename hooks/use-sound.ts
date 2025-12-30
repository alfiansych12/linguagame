'use client';

import { useCallback } from 'react';

type SoundType = 'CORRECT' | 'WRONG' | 'CLICK' | 'CRYSTAL' | 'SUCCESS' | 'GAMEOVER' | 'START' | 'SPECIAL_WIN';

const SOUND_FILES: Record<SoundType, string[]> = {
    CORRECT: ['/sounds/correct.mp3', '/sounds/correct.2.mp3', '/sounds/correct.3.mp3', '/sounds/correct.4.mp3'],
    WRONG: ['/sounds/wrong.mp3', '/sounds/wrong.2.mp3'],
    CLICK: ['/sounds/click.mp3'],
    CRYSTAL: ['/sounds/crystal.mp3', '/sounds/crystal.2.mp3'],
    SUCCESS: ['/sounds/successe.mp3', '/sounds/success.2.mp3'],
    GAMEOVER: ['/sounds/gameover.mp3', '/sounds/gameover.2.mp3', '/sounds/gameover.3.mp3', '/sounds/gameover.4.mp3'],
    START: ['/sounds/start.mp3'],
    SPECIAL_WIN: ['/sounds/special-win.1.mp3', '/sounds/special-win.2.mp3'],
};

export const useSound = () => {
    const playSound = useCallback((type: SoundType) => {
        try {
            const variations = SOUND_FILES[type];
            const randomIndex = Math.floor(Math.random() * variations.length);
            const audio = new Audio(variations[randomIndex]);
            audio.volume = 0.5;
            audio.play().catch(e => console.log('Audio play failed:', e));
        } catch (error) {
            console.error('Sound error:', error);
        }
    }, []);

    return { playSound };
};
