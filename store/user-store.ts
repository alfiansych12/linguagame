'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CrystalInventory {
    shield: number;    // Tameng Gaib
    booster: number;   // Booster Gacor 
    hint: number;      // Hint Literally
    focus: number;     // Focus Banget
    slay: number;      // Streak Slay
    timefreeze: number; // Beku
    autocorrect: number; // Mata Dewa
    adminvision: number; // Sirkel King
}

import { supabase } from '@/lib/db/supabase';
import { ACHIEVEMENTS } from '@/lib/data/achievements';
import {
    updateProfile,
    consumeCrystal,
    applyReferral as applyReferralAction,
    unlockAchievement,
    initializeUserQuests,
    updateQuestProgressServer
} from '@/app/actions/userActions';
import { useAlertStore } from './alert-store';

interface UserState {
    gems: number;
    inventory: CrystalInventory;
    totalXp: number;
    currentStreak: number;
    name: string;
    referralCode: string | null;
    referralCount: number;
    claimedMilestones: string[];
    hasSeenTutorial: boolean;
    vocabCount: number;
    duelWins: number;
    totalSpent: number;
    unlockedAchievements: string[];
    isLoading: boolean;
    userId: string | null;
    image: string;
    equippedBorder: string;
    unlockedBorders: string[];

    // Actions
    syncWithDb: (userId: string) => Promise<void>;
    setLoading: (val: boolean) => void;
    setHasSeenTutorial: (val: boolean) => void;
    setName: (name: string) => void;
    setImage: (url: string) => Promise<void>;
    setReferralCode: (code: string) => void;
    addGems: (amount: number) => Promise<void>;
    spendGems: (amount: number) => Promise<boolean>;
    addXp: (amount: number) => Promise<void>;
    addVocab: (amount: number) => Promise<void>;
    updateStreak: (days: number) => void;
    checkReferralMilestones: () => Promise<void>;
    checkAchievements: () => Promise<void>;
    setEquippedBorder: (borderId: string) => void;

    // Inventory Actions
    addCrystal: (type: keyof CrystalInventory, amount: number) => Promise<void>;
    unlockBorder: (borderId: string) => Promise<boolean>;
    useCrystal: (type: keyof CrystalInventory) => Promise<boolean>;
    applyReferralCode: (code: string) => Promise<{ success: boolean; message: string }>;
    updateQuestProgress: (type: 'xp' | 'vocab' | 'streak', amount: number) => Promise<void>;
    initializeQuests: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            gems: 0,
            inventory: {
                shield: 0,
                booster: 0,
                hint: 0,
                focus: 0,
                slay: 0,
                timefreeze: 0,
                autocorrect: 0,
                adminvision: 0,
            },
            totalXp: 0,
            currentStreak: 0,
            name: 'Explorer',
            referralCode: null,
            referralCount: 0,
            claimedMilestones: [],
            hasSeenTutorial: false,
            vocabCount: 0,
            duelWins: 0,
            totalSpent: 0,
            unlockedAchievements: [],
            isLoading: false,
            userId: null,
            image: '',
            equippedBorder: 'default',
            unlockedBorders: ['default'],

            setLoading: (isLoading) => set({ isLoading }),

            syncWithDb: async (userId) => {
                if (!userId || userId === 'guest') return;

                set({ isLoading: true });
                const { data, error } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', userId)
                    .single();

                if (data && !error) {
                    set({
                        userId: userId,
                        gems: data.gems || 0,
                        totalXp: data.total_xp || 0,
                        currentStreak: data.current_streak || 0,
                        inventory: data.inventory || get().inventory,
                        name: data.name || get().name,
                        hasSeenTutorial: data.has_seen_tutorial || false,
                        vocabCount: data.vocab_count || 0,
                        duelWins: data.duel_wins || 0,
                        totalSpent: data.total_spent || 0,
                        referralCode: data.referral_code,
                        referralCount: data.referral_count || 0,
                        claimedMilestones: data.claimed_milestones || [],
                        unlockedAchievements: data.unlocked_achievements || [],
                        image: data.image || '',
                        equippedBorder: data.equipped_border || 'default',
                        unlockedBorders: data.unlocked_borders || ['default'],
                    });

                    // Otomatis cek reward kalau ada progres baru
                    get().checkReferralMilestones();
                    get().checkAchievements();

                    // Initialize Quests via secure server action
                    await initializeUserQuests();
                }
                set({ isLoading: false });
            },

            initializeQuests: async () => {
                // Moved to server action initializeUserQuests, 
                // but kept for backward compatibility if needed internally
                await initializeUserQuests();
            },

            updateQuestProgress: async (type, amount) => {
                const userId = get().userId;
                if (!userId || userId === 'guest') return;

                // Use secure server action
                const result = await updateQuestProgressServer(type, amount);

                if (result.success && result.justFinished) {
                    const { showAlert } = useAlertStore.getState();
                    if (showAlert) {
                        showAlert({
                            title: 'Quest Cleared! 🔥',
                            message: `Misi selesai sirkel! Siap-siap ambil reward ${result.rewardGems} Crystal.`,
                            type: 'success'
                        });
                    }
                }
            },

            setHasSeenTutorial: async (val) => {
                set({ hasSeenTutorial: val });
                const userId = get().userId;
                if (userId && userId !== 'guest') {
                    await updateProfile({ has_seen_tutorial: val });
                }
            },
            setName: async (name) => {
                set({ name });
                const userId = get().userId;
                if (userId && userId !== 'guest') {
                    await updateProfile({ name });
                }
            },
            setEquippedBorder: (borderId) => set({ equippedBorder: borderId }),
            setImage: async (url) => {
                set({ image: url });
                const userId = get().userId;
                if (userId && userId !== 'guest') {
                    await updateProfile({ image: url });
                }
            },
            setReferralCode: (referralCode) => set({ referralCode }),
            addGems: async (amount) => {
                // UI only update - Real update happens via server actions (submitGameScore or purchase)
                set({ gems: get().gems + amount });
            },

            spendGems: async (amount) => {
                // Real gem spending should happen on server (purchase actions)
                // This is kept for UI state consistency
                if (get().gems >= amount) {
                    set({ gems: get().gems - amount });
                    return true;
                }
                return false;
            },

            addXp: async (amount) => {
                // UI only update - use submitGameScore for DB sync
                set({ totalXp: get().totalXp + amount });
            },

            addVocab: async (amount) => {
                // UI only update
                set({ vocabCount: get().vocabCount + amount });
            },

            updateStreak: async (days) => {
                set({ currentStreak: days });
                const userId = get().userId;
                if (userId && userId !== 'guest') {
                    await updateProfile({ current_streak: days });
                }
                get().checkAchievements();
            },

            checkReferralMilestones: async () => {
                // This is now purely for local state checking
                // Real rewards should be calculated on server
            },

            applyReferralCode: async (code) => {
                const userId = get().userId;
                if (!userId || userId === 'guest') return { success: false, message: 'Harus login dulu sirkel!' };

                const result = await applyReferralAction(code);

                if (result.success) {
                    await get().syncWithDb(userId);
                    return { success: true, message: result.message || 'Berhasil!' };
                } else {
                    return { success: false, message: result.error || 'Gagal sirkel.' };
                }
            },

            unlockBorder: async (borderId) => {
                const { unlockedBorders } = get();
                if (unlockedBorders.includes(borderId)) return true;
                set({ unlockedBorders: [...unlockedBorders, borderId] });
                return true;
            },

            addCrystal: async (type, amount) => {
                const newInventory = {
                    ...get().inventory,
                    [type]: (get().inventory[type] || 0) + amount
                };
                set({ inventory: newInventory });
            },

            useCrystal: async (type) => {
                const { inventory } = get();
                if (inventory[type] > 0) {
                    const result = await consumeCrystal({ crystalType: type });
                    if (result.success) {
                        set({
                            inventory: {
                                ...inventory,
                                [type]: inventory[type] - 1
                            }
                        });
                        return true;
                    }
                }
                return false;
            },

            checkAchievements: async () => {
                const {
                    totalXp, vocabCount, currentStreak, gems,
                    duelWins, totalSpent, unlockedAchievements, userId
                } = get();

                if (!userId || userId === 'guest') return;

                const newReachedIds: string[] = [];

                ACHIEVEMENTS.forEach(ach => {
                    if (unlockedAchievements.includes(ach.id)) return;

                    let reached = false;
                    switch (ach.type) {
                        case 'xp': reached = totalXp >= ach.target; break;
                        case 'vocab': reached = vocabCount >= ach.target; break;
                        case 'streak': reached = currentStreak >= ach.target; break;
                        case 'gems': reached = gems >= ach.target; break;
                        case 'wins': reached = duelWins >= ach.target; break;
                        case 'spent': reached = totalSpent >= ach.target; break;
                    }

                    if (reached) {
                        newReachedIds.push(ach.id);
                    }
                });

                if (newReachedIds.length > 0) {
                    for (const achId of newReachedIds) {
                        const ach = ACHIEVEMENTS.find(a => a.id === achId);
                        if (!ach) continue;

                        const result = await unlockAchievement(achId);

                        if (result.success) {
                            // Update local state
                            set((state) => ({
                                unlockedAchievements: [...state.unlockedAchievements, achId],
                                gems: state.gems + (result.reward || 0)
                            }));

                            // Show Alert with Reward Info
                            const { showAlert } = useAlertStore.getState();
                            if (showAlert) {
                                showAlert({
                                    title: 'Achievement Unlocked! 🏆',
                                    message: `Selamat sirkel! Kamu dapet badge "${ach.title}" dan bonus ${result.reward} Crystal. Literally sepuh!`,
                                    type: 'xp',
                                    autoClose: 5000
                                });
                            }
                        }
                    }
                }
            },
        }),
        {
            name: 'linguagame-user-storage',
        }
    )
);
