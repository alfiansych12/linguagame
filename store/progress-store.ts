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
    syncWithDb: (userId: string) => Promise<void>;
    completeLevel: (levelId: string, score: number, stars: number) => void;
    unlockLevel: (levelId: string) => void;
    isLevelUnlocked: (levelId: string) => boolean;
    getLevelProgress: (levelId: string) => LevelProgress | null;
    resetPhaseProgress: (levelIds: string[]) => void;
}

import { supabase } from '@/lib/db/supabase';

// Initial unlocked levels (usually just the first one)
const INITIAL_UNLOCKED = ['vocab-1', 'vocab-2']; // Giving a headstart

export const useProgressStore = create<ProgressState>()(
    persist(
        (set, get) => ({
            completedLevels: {},
            unlockedLevelIds: INITIAL_UNLOCKED,

            syncWithDb: async (userId) => {
                if (!userId || userId === 'guest') return;

                const { data, error } = await supabase
                    .from('user_progress')
                    .select('*')
                    .eq('user_id', userId);

                if (data && !error) {
                    const mapped: Record<string, LevelProgress> = {};
                    const unlocked = [...INITIAL_UNLOCKED];

                    data.forEach((p: any) => {
                        mapped[p.level_id] = {
                            levelId: p.level_id,
                            score: p.score,
                            stars: p.stars,
                            completed: p.status === 'COMPLETED'
                        };
                        if (!unlocked.includes(p.level_id)) {
                            unlocked.push(p.level_id);
                        }
                    });

                    // Logic to unlock the NEXT level if all current are completed
                    // This is handled by CURRICULUM data usually, but for sync we just take what's in DB
                    set({ completedLevels: mapped, unlockedLevelIds: unlocked });
                }
            },

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
