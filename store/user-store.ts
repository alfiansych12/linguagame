'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CrystalInventory {
    shield: number;    // Tameng Gaib
    booster: number;   // Booster Gacor 
    hint: number;      // Hint Literally
    focus: number;     // Focus Banget
    slay: number;      // Streak Slay
    timefreeze: number; // Waktunya Berhenti (New)
    autocorrect: number; // Mata Dewa (New)
    adminvision: number; // Sirkel King (Exclusive)
}

interface UserState {
    gems: number;
    inventory: CrystalInventory;
    totalXp: number;
    currentStreak: number;
    name: string;
    referralCode: string | null;
    referralCount: number;
    claimedMilestones: string[]; // e.g., ['1_referral', '3_referrals', '10_referrals']

    // Actions
    setName: (name: string) => void;
    setReferralCode: (code: string) => void;
    addGems: (amount: number) => void;
    spendGems: (amount: number) => boolean;
    addXp: (amount: number) => void;
    updateStreak: (days: number) => void;
    checkReferralMilestones: () => void;

    // Inventory Actions
    addCrystal: (type: keyof CrystalInventory, amount: number) => void;
    useCrystal: (type: keyof CrystalInventory) => boolean;
}

export const useUserStore = create<UserState>()(
    persist(
        (set, get) => ({
            gems: 500, // Initial gems for testing
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
            totalXp: 1250,
            currentStreak: 5,
            name: 'Explorer',
            referralCode: null,
            referralCount: 0,
            claimedMilestones: [],

            setName: (name) => set({ name }),
            setReferralCode: (referralCode) => set({ referralCode }),
            addGems: (amount) => set((state) => ({ gems: state.gems + amount })),

            spendGems: (amount) => {
                const { gems } = get();
                if (gems >= amount) {
                    set({ gems: gems - amount });
                    return true;
                }
                return false;
            },

            addXp: (amount) => set((state) => ({ totalXp: state.totalXp + amount })),

            updateStreak: (days) => set({ currentStreak: days }),

            checkReferralMilestones: () => {
                const { referralCount, claimedMilestones, addGems, addCrystal } = get();

                // Milestone 1: 500 Gems
                if (referralCount >= 1 && !claimedMilestones.includes('1_referral')) {
                    addGems(500);
                    set((state) => ({ claimedMilestones: [...state.claimedMilestones, '1_referral'] }));
                }

                // Milestone 3: 1000 Gems
                if (referralCount >= 3 && !claimedMilestones.includes('3_referrals')) {
                    addGems(1000);
                    set((state) => ({ claimedMilestones: [...state.claimedMilestones, '3_referrals'] }));
                }

                // Milestone 10: Exclusive Skill (Sirkel King x1)
                if (referralCount >= 10 && !claimedMilestones.includes('10_referrals')) {
                    addCrystal('adminvision', 1);
                    set((state) => ({ claimedMilestones: [...state.claimedMilestones, '10_referrals'] }));
                }
            },

            addCrystal: (type, amount) =>
                set((state) => ({
                    inventory: {
                        ...state.inventory,
                        [type]: (state.inventory[type] || 0) + amount
                    }
                })),

            useCrystal: (type) => {
                const { inventory } = get();
                if (inventory[type] > 0) {
                    set((state) => ({
                        inventory: {
                            ...state.inventory,
                            [type]: state.inventory[type] - 1
                        }
                    }));
                    return true;
                }
                return false;
            },
        }),
        {
            name: 'linguagame-user-storage',
        }
    )
);
