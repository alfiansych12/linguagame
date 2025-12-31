export interface BorderDef {
    id: string;
    name: string;
    description: string;
    rarity: 'common' | 'rare' | 'epic' | 'legendary';
    price?: number; // In gems
    condition?: string; // e.g. "Level 10", "100 Wins"
}

export const BORDERS: Record<string, BorderDef> = {
    'default': {
        id: 'default',
        name: 'Sirkel Basic',
        description: 'Bingkai standar untuk pemula.',
        rarity: 'common',
        price: 0
    },
    'silver_warrior': {
        id: 'silver_warrior',
        name: 'Silver Guardian',
        description: 'Tanda ketangguhan. Unlocked at Level 5.',
        rarity: 'rare',
        price: 1000,
        condition: 'Level 5'
    },
    'gold_champion': {
        id: 'gold_champion',
        name: 'Golden Glory',
        description: 'Hanya untuk para juara sejati. Unlocked at 50 Wins.',
        rarity: 'epic',
        price: 5000,
        condition: '50 Wins'
    },
    'diamond_master': {
        id: 'diamond_master',
        name: 'Diamond Sovereign',
        description: 'Simbol kekayaan dan kekuasaan mutlak.',
        rarity: 'legendary',
        price: 10000
    },
    'admin_glitch': {
        id: 'admin_glitch',
        name: 'System Override',
        description: 'Bingkai terlarang para admin.',
        rarity: 'legendary',
        price: 999999
    }
};
