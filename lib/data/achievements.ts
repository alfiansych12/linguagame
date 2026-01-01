export interface Achievement {
    id: string;
    title: string;
    desc: string;
    icon: string;
    target: number;
    type: 'xp' | 'vocab' | 'streak' | 'gems' | 'wins' | 'spent';
    reward: number; // Crystal reward
}

export const ACHIEVEMENTS: Achievement[] = [
    // --- XP ACHIEVEMENTS ---
    {
        id: 'first_blood',
        title: 'Langkah Awal',
        desc: 'Capai 100 XP pertama. Perjalanan seribu mil dimulai dari sini!',
        icon: 'workspace_premium',
        target: 100,
        type: 'xp',
        reward: 50
    },
    {
        id: 'rising_star',
        title: 'Bintang Muda',
        desc: 'Capai 1,000 XP. Sinar kamu mulai kelihatan di sirkel!',
        icon: 'grade',
        target: 1000,
        type: 'xp',
        reward: 250
    },
    {
        id: 'sepuh_lingua',
        title: 'Sepuh Lingua',
        desc: 'Capai 5,000 XP total. Udah pantes jadi sepuh sirkel.',
        icon: 'military_tech',
        target: 5000,
        type: 'xp',
        reward: 1000
    },
    {
        id: 'legendary_sensei',
        title: 'Legendary Sensei',
        desc: 'Capai 20,000 XP. Kamu adalah mitos yang jadi nyata!',
        icon: 'elderly',
        target: 20000,
        type: 'xp',
        reward: 5000
    },

    // --- VOCAB ACHIEVEMENTS ---
    {
        id: 'vocab_novice',
        title: 'Penabung Kata',
        desc: 'Kuasai 20 kosakata baru. Literasi itu penting, sirkel!',
        icon: 'menu_book',
        target: 20,
        type: 'vocab',
        reward: 100
    },
    {
        id: 'vocab_collector',
        title: 'Kolektor Kata',
        desc: 'Kuasai 100 kosakata baru. Kosakata kamu makin gak ngotak!',
        icon: 'library_books',
        target: 100,
        type: 'vocab',
        reward: 500
    },
    {
        id: 'dictionary_god',
        title: 'Dewa Kamus',
        desc: 'Kuasai 500 kosakata baru. Loe nanya gue jawab, literally kamus jalan.',
        icon: 'auto_stories',
        target: 500,
        type: 'vocab',
        reward: 2000
    },

    // --- STREAK ACHIEVEMENTS ---
    {
        id: 'streak_warrior',
        title: 'Pejuang Streak',
        desc: 'Jaga api streak selama 3 hari. Jangan biarin apinya padam!',
        icon: 'local_fire_department',
        target: 3,
        type: 'streak',
        reward: 150
    },
    {
        id: 'streak_loyalist',
        title: 'Loyalis Sejati',
        desc: 'Jaga streak selama 7 hari (seminggu). Dedikasi tinggi sirkel!',
        icon: 'verified',
        target: 7,
        type: 'streak',
        reward: 500
    },
    {
        id: 'immortal_streak',
        title: 'Apocalypse Survivor',
        desc: 'Jaga streak selama 30 hari. Kamu gak kenal kata libur ya?',
        icon: 'all_inclusive',
        target: 30,
        type: 'streak',
        reward: 3000
    },

    // --- GEMS (SAVINGS) ACHIEVEMENTS ---
    {
        id: 'crystal_hoarder',
        title: 'Penimbun Crystal',
        desc: 'Punya saldo 1,000 Crystal. Tabungan masa depan nih.',
        icon: 'savings',
        target: 1000,
        type: 'gems',
        reward: 200
    },
    {
        id: 'crystal_sultan',
        title: 'Sultan Crystal',
        desc: 'Punya saldo 10,000 Crystal. Dompet sirkel meluber!',
        icon: 'diamond',
        target: 10000,
        type: 'gems',
        reward: 1000
    },

    // --- DUEL WINS ACHIEVEMENTS ---
    {
        id: 'duel_rookie',
        title: 'Rookie Duel',
        desc: 'Menangkan 5 duel di arena. Mental juara!',
        icon: 'sports_kabaddi',
        target: 5,
        type: 'wins',
        reward: 300
    },
    {
        id: 'duel_king',
        title: 'Raja Duel',
        desc: 'Menangkan 50 duel. Arena ini adalah rumah kedua kamu.',
        icon: 'military_tech',
        target: 50,
        type: 'wins',
        reward: 2000
    },
    {
        id: 'arena_overlord',
        title: 'Arena Overlord',
        desc: 'Menangkan 200 duel. Musuh auto-surrender liat nama kamu.',
        icon: 'stars',
        target: 200,
        type: 'wins',
        reward: 10000
    },

    // --- SPENT (SHOPPING) ACHIEVEMENTS ---
    {
        id: 'forge_customer',
        title: 'Langganan Forge',
        desc: 'Belanja 10 kali di Crystal Forge. Pelanggan prioritas!',
        icon: 'shopping_bag',
        target: 10,
        type: 'spent',
        reward: 500
    },
    {
        id: 'whale_investor',
        title: 'Whale Investor',
        desc: 'Belanja 50 kali di Crystal Forge. Ekonomi server stabil gara-gara kamu.',
        icon: 'account_balance_wallet',
        target: 50,
        type: 'spent',
        reward: 5000
    }
];
