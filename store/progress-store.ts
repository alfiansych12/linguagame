'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LevelProgress {
    levelId: string;
    score: number;
    stars: number;
    completed: boolean;
}

interface ProgressState {
    completedLevels: Record<string, LevelProgress>;
    unlockedLevelIds: string[];

    // Actions
    completeLevel: (levelId: string, score: number, stars: number) => void;
    unlockLevel: (levelId: string) => void;
    isLevelUnlocked: (levelId: string) => boolean;
    getLevelProgress: (levelId: string) => LevelProgress | null;
    resetPhaseProgress: (levelIds: string[]) => void;
}

// Initial unlocked levels (usually just the first one)
const INITIAL_UNLOCKED = ['vocab-1', 'vocab-2']; // Giving a headstart

export const useProgressStore = create<ProgressState>()(
    persist(
        (set, get) => ({
            completedLevels: {},
            unlockedLevelIds: INITIAL_UNLOCKED,

            completeLevel: (levelId, score, stars) => {
                set((state) => ({
                    completedLevels: {
                        ...state.completedLevels,
                        [levelId]: { levelId, score, stars, completed: true }
                    }
                }));

                // Logic to unlock next level (handled by the game component usually)
            },

            unlockLevel: (levelId) => {
                const { unlockedLevelIds } = get();
                if (!unlockedLevelIds.includes(levelId)) {
                    set({ unlockedLevelIds: [...unlockedLevelIds, levelId] });
                }
            },

            isLevelUnlocked: (levelId) => {
                return get().unlockedLevelIds.includes(levelId);
            },

            getLevelProgress: (levelId) => {
                return get().completedLevels[levelId] || null;
            },

            resetPhaseProgress: (levelIds) => {
                const { completedLevels } = get();
                const newCompleted = { ...completedLevels };
                levelIds.forEach(id => delete newCompleted[id]);
                set({ completedLevels: newCompleted });
            }
        }),
        {
            name: 'linguagame-progress-storage',
        }
    )
);
