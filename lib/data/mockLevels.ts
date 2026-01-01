import { Level } from '@/types';

export const CURRICULUM_LEVELS: Level[] = [
    // PHASE 1: VOCABULARY JOURNEY (LEVEL 1-10)
    { id: 'vocab-1', title: 'Action Words I', description: 'Common verbs for daily activities', difficulty: 1, orderIndex: 1, icon: 'directions_run', isPublished: true, phase: 1 },
    { id: 'vocab-2', title: 'At Home', description: 'Vocabulary for objects around the house', difficulty: 1, orderIndex: 2, icon: 'home', isPublished: true, phase: 1 },
    { id: 'vocab-3', title: 'Food & Drinks', description: 'Master the menu and kitchen basics', difficulty: 1, orderIndex: 3, icon: 'restaurant', isPublished: true, phase: 1 },
    { id: 'vocab-4', title: 'Nature Explorers', description: 'Animals, weather, and world elements', difficulty: 2, orderIndex: 4, icon: 'forest', isPublished: true, phase: 1 },
    { id: 'vocab-5', title: 'Social Circle', description: 'Family, friends, and emotions', difficulty: 2, orderIndex: 5, icon: 'group', isPublished: true, phase: 1 },
    { id: 'vocab-6', title: 'Travel Vibes', description: 'Everything you need for your next trip', difficulty: 2, orderIndex: 6, icon: 'flight_takeoff', isPublished: true, phase: 1 },
    { id: 'vocab-7', title: 'Health & Body', description: 'Body parts and well-being', difficulty: 3, orderIndex: 7, icon: 'monitor_heart', isPublished: true, phase: 1 },
    { id: 'vocab-8', title: 'Digital World', description: 'Technology and internet essentials', difficulty: 3, orderIndex: 8, icon: 'computer', isPublished: true, phase: 1 },
    { id: 'vocab-9', title: 'Career & Work', description: 'Job titles and office vocabulary', difficulty: 3, orderIndex: 9, icon: 'work', isPublished: true, phase: 1 },
    { id: 'vocab-exam-1', title: 'Phase 1 Final Exam', description: 'Pass with 80% to unlock Phase 2!', difficulty: 4, orderIndex: 10, icon: 'verified_user', isPublished: true, phase: 1, isExam: true },

    // PHASE 2: INTERMEDIATE LIFE (LEVEL 11-20)
    { id: 'vocab-15', title: 'Urban Living', description: 'Navigate the city and infrastructure', difficulty: 2, orderIndex: 11, icon: 'apartment', isPublished: true, phase: 2 },
    { id: 'vocab-16', title: 'Modern Health', description: 'Advanced well-being and recovery', difficulty: 2, orderIndex: 12, icon: 'medication', isPublished: true, phase: 2 },
    { id: 'vocab-17', title: 'Social Media', description: 'The language of digital interaction', difficulty: 2, orderIndex: 13, icon: 'share', isPublished: true, phase: 2 },
    { id: 'vocab-18', title: 'Work Culture', description: 'Leadership and innovation at work', difficulty: 3, orderIndex: 14, icon: 'foundation', isPublished: true, phase: 2 },
    { id: 'vocab-19', title: 'Planet Earth', description: 'Sustainability and conservation', difficulty: 3, orderIndex: 15, icon: 'public', isPublished: true, phase: 2 },
    { id: 'vocab-20', title: 'Leisure Time', description: 'Hobbies, arts, and photography', difficulty: 3, orderIndex: 16, icon: 'palette', isPublished: true, phase: 2 },
    { id: 'vocab-21', title: 'Intermediate I', description: 'Expand your daily conversations', difficulty: 3, orderIndex: 17, icon: 'chat', isPublished: true, phase: 2 },
    { id: 'vocab-22', title: 'Intermediate II', description: 'More complex situations', difficulty: 3, orderIndex: 18, icon: 'forum', isPublished: true, phase: 2 },
    { id: 'vocab-11', title: 'Advanced Actions', description: 'Sophisticated verbs for work', difficulty: 4, orderIndex: 19, icon: 'smart_toy', isPublished: true, phase: 2 },
    { id: 'vocab-exam-2', title: 'Phase 2 Final Exam', description: 'Pass with 80% to unlock Phase 3!', difficulty: 4, orderIndex: 20, icon: 'verified_user', isPublished: true, phase: 2, isExam: true },

    // PHASE 3: ADVANCED & PROFESSIONAL (LEVEL 21-30)
    { id: 'vocab-23', title: 'Strategy & Finance', description: 'The language of business growth', difficulty: 4, orderIndex: 21, icon: 'trending_up', isPublished: true, phase: 3 },
    { id: 'vocab-24', title: 'Global Affairs', description: 'Diplomacy and international relations', difficulty: 4, orderIndex: 22, icon: 'travel_explore', isPublished: true, phase: 3 },
    { id: 'vocab-25', title: 'The Human Mind', description: 'Psychology and mental resilience', difficulty: 4, orderIndex: 23, icon: 'psychology', isPublished: true, phase: 3 },
    { id: 'vocab-26', title: 'The Arts', description: 'Literature, prose, and masterpieces', difficulty: 4, orderIndex: 24, icon: 'history_edu', isPublished: true, phase: 3 },
    { id: 'vocab-27', title: 'Future Science', description: 'Galaxy, hypothesis, and discovery', difficulty: 4, orderIndex: 25, icon: 'science', isPublished: true, phase: 3 },
    { id: 'vocab-28', title: 'Society & Soul', description: 'Ethics, values, and diversity', difficulty: 4, orderIndex: 26, icon: 'diversity_3', isPublished: true, phase: 3 },
    { id: 'vocab-29', title: 'Philosophy 101', description: 'Gratitude, purpose, and balance', difficulty: 4, orderIndex: 27, icon: 'self_improvement', isPublished: true, phase: 3 },
    { id: 'vocab-30', title: 'Digital Frontier', description: 'AI, Blockchain, and Cybersecurity', difficulty: 5, orderIndex: 28, icon: 'terminal', isPublished: true, phase: 3 },
    { id: 'vocab-12', title: 'Professional Talk', description: 'Communication in the workplace', difficulty: 5, orderIndex: 29, icon: 'business_center', isPublished: true, phase: 3 },
    { id: 'vocab-exam-3', title: 'Phase 3 Final Exam', description: 'Prove you are a literal Sepuh!', difficulty: 5, orderIndex: 30, icon: 'verified_user', isPublished: true, phase: 3, isExam: true },
];

// GENERATE GRAMMAR LEVELS (PHASE 1)
const CATEGORIES = ['Simple Present', 'Present Continuous', 'Present Perfect'];
const SUB_TYPES = ['POSITIVE', 'NEGATIVE', 'QUESTION'] as const;

// Custom Titles & Descriptions for Grammar Missions
const GRAMMAR_METADATA: Record<string, { title: string; desc: string }[]> = {
    'Simple Present-POSITIVE': [
        { title: 'Kebiasaan Pribadi', desc: 'Kata kerja umum buat rutinitasmu (I/You/We/They)' },
        { title: 'Kehidupan Sehari-hari', desc: 'Kuasai aturan akhiran -s/es buat Dia (She/He/It)' },
        { title: 'Nama & Orang Lain', desc: 'Cara ngomongin rutinitas teman atau benda spesifik' },
        { title: 'Dunia Kerja & Sekolah', desc: 'Kebiasaan di kantor, kampus, atau tempat belajar' },
        { title: 'Selalu & Gak Pernah', desc: 'Pake kata frekuensi buat ceritain rutinitasmu' },
        { title: 'Hobi & Hiburan', desc: 'Ungkapin apa yang biasa kamu lakuin buat asik-asikan' },
        { title: 'Pola Hidup Sehat', desc: 'Rutinitas makan, tidur, dan kesehatanmu' },
        { title: 'Gaya Hidup Digital', desc: 'Kebiasaan main game dan sosmed di dunia nyata' },
        { title: 'Alam & Fakta Umum', desc: 'Kebenaran umum tentang dunia di sekitar kita' },
        { title: 'Misi Penguasaan', desc: 'Ujian pamungkas buat tes skill Habit-mu!' },
    ],
    'Simple Present-NEGATIVE': [
        { title: 'Bukan Kebiasaanku', desc: 'Pake "don\'t" buat I, You, We, dan They' },
        { title: 'Bukan Kebiasaannya', desc: 'Pake "doesn\'t" buat Dia (She, He, It)' },
        { title: 'Cek Fakta', desc: 'Menyangkal fakta yang emang gak bener' },
        { title: 'Libur Kerja', desc: 'Hal-hal yang biasanya gak kita lakuin di kantor' },
        { title: 'Aturan Ketat', desc: 'Hal yang gak bakal pernah terjadi di sirkel kita' },
        { title: 'Makanan Gak Suka', desc: 'Ungkapin makanan yang gak doyan kamu makan' },
        { title: 'Masalah Teknologi', desc: 'Pas gadget gak berfungsi sesuai keinginan' },
        { title: 'Fakta Hewan', desc: 'Hal-hal yang sebenernya gak dilakuin hewan-hewan' },
        { title: 'Mitos Terpecahkan', desc: 'Membuktikan mitos rutinitas itu salah' },
        { title: 'Master Negatif', desc: 'Tantangan terakhir buat kalimat Negatif!' },
    ],
    'Simple Present-QUESTION': [
        { title: 'Tanya Jawab Simpel', desc: 'Tanya "Do you...?" buat cari tahu rutinitas' },
        { title: 'Kepo-in Dia', desc: 'Pake "Does...?" buat nanyain kebiasaan Dia' },
        { title: 'Wawancara Harian', desc: 'Nanyain temen soal kebiasaan unik mereka' },
        { title: 'Bantuan Teknologi', desc: 'Nanyain gimana cara kerja alat-alat digital' },
        { title: 'Seputar Traveling', desc: 'Tanya-tanya soal perjalanan yang sering dilakuin' },
        { title: 'Kepo Sosial', desc: 'Apakah kita kenal mereka? Apakah mereka suka kita?' },
        { title: 'Pertanyaan Mendalam', desc: 'Nanyain soal tujuan hidup dan mimpi besar' },
        { title: 'Kuis Alam', desc: 'Apakah burung terbang? Apakah matahari terbit?' },
        { title: 'Cek Rutinitas', desc: 'Apakah Budi makan nasi? Apakah Ani belajar?' },
        { title: 'Master Teka-Teki', desc: 'Kuis akhir buat skill kalimat tanya!' },
    ],
};

export const GRAMMAR_LEVELS: Level[] = [];

let orderIndex = 100;
CATEGORIES.forEach(cat => {
    SUB_TYPES.forEach(type => {
        const metadataKey = `${cat}-${type}`;
        const metadata = GRAMMAR_METADATA[metadataKey];

        for (let i = 1; i <= 10; i++) {
            const custom = metadata?.[i - 1];

            GRAMMAR_LEVELS.push({
                id: `grammar-p1-${cat.toLowerCase().replace(' ', '-')}-${type.toLowerCase()}-${i}`,
                title: custom ? custom.title : `${cat} ${i}`,
                description: custom ? custom.desc : `${type === 'POSITIVE' ? 'Kalimat Positif' : type === 'NEGATIVE' ? 'Kalimat Negatif' : 'Kalimat Tanya'} - Misi ${i}`,
                difficulty: cat === 'Simple Present' ? 1 : cat === 'Present Continuous' ? 2 : 3,
                orderIndex: orderIndex++,
                icon: type === 'POSITIVE' ? 'add_circle' : type === 'NEGATIVE' ? 'do_not_disturb_on' : 'help_center',
                isPublished: true,
                phase: 1,
                category: cat,
                subType: type
            });
        }
    });
});

export const ALL_LEVELS = [...CURRICULUM_LEVELS, ...GRAMMAR_LEVELS];
