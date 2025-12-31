export interface Achievement {
    id: string;
    title: string;
    desc: string;
    icon: string;
    target: number;
    type: 'xp' | 'vocab' | 'streak' | 'gems' | 'wins' | 'spent';
}

export const ACHIEVEMENTS: Achievement[] = [
    {
        id: 'first_blood',
        title: 'Langkah Awal',
        desc: 'Selesaikan misi pertama kamu, literally awal dari segalanya.',
        icon: 'workspace_premium',
        target: 100,
        type: 'xp'
    },
    {
        id: 'vocab_collector',
        title: 'Kolektor Kata',
        desc: 'Kumpulin 50 kosakata baru biar sirkel makin luas.',
        icon: 'menu_book',
        target: 50,
        type: 'vocab'
    },
    {
        id: 'streak_warrior',
        title: 'Pejuang Streak',
        desc: 'Jaga api streak selama 3 hari berturut-turut. Gacor!',
        icon: 'local_fire_department',
        target: 3,
        type: 'streak'
    },
    {
        id: 'crystal_sultan',
        title: 'Sultan Crystal',
        desc: 'Tabung sampai 2000 Crystal. Siap jajan di Forge!',
        icon: 'diamond',
        target: 2000,
        type: 'gems'
    },
    {
        id: 'duel_king',
        title: 'Raja Duel',
        desc: 'Babat habis musuh! Menangkan 10 duel di arena.',
        icon: 'swords',
        target: 1000, // Score base or win base? Let's use wins
        type: 'wins'
    },
    {
        id: 'forge_master',
        title: 'Penghuni Forge',
        desc: 'Belanja 5 kali di Crystal Forge buat upgrade skill.',
        icon: 'hardware',
        target: 5,
        type: 'spent'
    },
    {
        id: 'sepuh_lingua',
        title: 'Sepuh Lingua',
        desc: 'Capai 5000 XP total. Udah pantes jadi sepuh sirkel.',
        icon: 'military_tech',
        target: 5000,
        type: 'xp'
    }
];
