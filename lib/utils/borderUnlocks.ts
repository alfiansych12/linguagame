import { BORDERS } from '@/lib/data/borders';

export interface BorderUnlockCondition {
    type: 'xp' | 'wins' | 'streak' | 'purchase' | 'achievement' | 'admin';
    value?: number;
    price?: number; // In gems
    achievementId?: string;
}

export const BORDER_UNLOCK_CONDITIONS: Record<string, BorderUnlockCondition> = {
    'default': {
        type: 'xp',
        value: 0
    },
    'silver_warrior': {
        type: 'xp',
        value: 500
    },
    'gold_champion': {
        type: 'xp',
        value: 2000
    },
    'diamond_master': {
        type: 'xp',
        value: 5000
    },
    'admin_glitch': {
        type: 'admin'
    },
    'emerald_mythic': {
        type: 'purchase',
        price: 15000
    },
    'royal_obsidian': {
        type: 'purchase',
        price: 25000
    },
    'infinity_void': {
        type: 'purchase',
        price: 50000
    },
    'celestial_dragon': {
        type: 'purchase',
        price: 99999
    }
};

export function checkBorderUnlocked(
    borderId: string,
    user: {
        total_xp: number;
        duel_wins: number;
        current_streak: number;
        unlocked_achievements?: string[];
        unlocked_borders?: string[];
        email?: string;
        name?: string;
    }
): boolean {
    const condition = BORDER_UNLOCK_CONDITIONS[borderId];
    if (!condition) return false;

    // Default always unlocked
    if (borderId === 'default') return true;

    switch (condition.type) {
        case 'xp':
            return user.total_xp >= (condition.value || 0);
        case 'wins':
            return user.duel_wins >= (condition.value || 0);
        case 'streak':
            return user.current_streak >= (condition.value || 0);
        case 'admin':
            return user.email?.toLowerCase().includes('admin') ||
                user.name?.toLowerCase().includes('admin') ||
                false;
        case 'achievement':
            return user.unlocked_achievements?.includes(condition.achievementId || '') || false;
        case 'purchase':
            // Check if the border is in user's unlocked_borders array
            return user.unlocked_borders?.includes(borderId) || false;
        default:
            return false;
    }
}

export function getBorderDisplayName(borderId: string): string {
    const names: Record<string, string> = {
        'default': 'Basic Frame',
        'silver_warrior': 'Silver Warrior',
        'gold_champion': 'Golden Glory',
        'diamond_master': 'Diamond Sovereign',
        'admin_glitch': 'System Override',
        'emerald_mythic': 'Emerald Mythic',
        'royal_obsidian': 'Royal Obsidian',
        'infinity_void': 'Infinity Void',
        'celestial_dragon': 'Celestial Dragon'
    };
    return names[borderId] || borderId;
}

export function getBorderDescription(borderId: string): string {
    const descriptions: Record<string, string> = {
        'default': 'Standard border untuk semua sirkel.',
        'silver_warrior': 'Bingkai tangguh ksatria perak. Unlock di Level 5!',
        'gold_champion': 'Kemegahan raja emas. Tanda juara sejati!',
        'diamond_master': 'Bingkai legendaris sovereign berlian. Ultimate flex!',
        'admin_glitch': 'Forbidden power. Admin only.',
        'emerald_mythic': 'Efek emerald premium dengan partikel mistis yang mempesona.',
        'royal_obsidian': 'Warna deep black dengan aura ungu gelap yang misterius dan mewah.',
        'infinity_void': 'Efek kosmik bintang-bintang bergerak. Mewah nggak ngotak!',
        'celestial_dragon': 'The ultimate border! Aura naga emas dengan partikel dewa.'
    };
    return descriptions[borderId] || 'Mystery border.';
}
