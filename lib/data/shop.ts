export interface ShopCrystal {
    id: string;
    cost: number;
}

export interface ShopBorder {
    id: string;
    cost: number;
}

export const CRYSTAL_PRICES: Record<string, number> = {
    shield: 50,
    booster: 100,
    hint: 150,
    focus: 200,
    slay: 300,
    timefreeze: 2000,
    autocorrect: 5000,
    adminvision: 999999,
};

export const BORDER_PRICES: Record<string, number> = {
    silver_warrior: 1000,
    diamond_master: 5000,
    emerald_mythic: 15000,
    royal_obsidian: 25000,
    infinity_void: 50000,
    celestial_dragon: 99999,
};
