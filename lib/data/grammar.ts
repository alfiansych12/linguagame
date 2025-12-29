export interface GrammarTask {
    id: string;
    levelId: string;
    english: string;
    indonesian: string;
    solution: string[]; // Ordered pieces
    distractors: string[]; // Extra pieces
    explanation: string;
}

export const GRAMMAR_DATA: GrammarTask[] = [
    // Level 11: Simple Present (Daily Habits & General Truths)
    {
        id: 'g1',
        levelId: 'grammar-1',
        english: 'I eat an apple every day.',
        indonesian: 'Saya makan apel setiap hari.',
        solution: ['I', 'eat', 'an', 'apple', 'every', 'day'],
        distractors: ['eats', 'eating', 'ate'],
        explanation: 'Untuk kebiasaan (every day), gunakan Verb 1 (eat).'
    },
    {
        id: 'g2',
        levelId: 'grammar-1',
        english: 'She drinks water.',
        indonesian: 'Dia minum air.',
        solution: ['She', 'drinks', 'water'],
        distractors: ['drink', 'drinking', 'drank'],
        explanation: 'Untuk subjek He/She/It, tambahkan -s pada kata kerja.'
    },
    {
        id: 'g3',
        levelId: 'grammar-1',
        english: 'The sun rises in the east.',
        indonesian: 'Matahari terbit di timur.',
        solution: ['The', 'sun', 'rises', 'in', 'the', 'east'],
        distractors: ['rise', 'rising', 'rose'],
        explanation: 'Gunakan Simple Present untuk menyatakan fakta umum/alam.'
    },
    {
        id: 'g4',
        levelId: 'grammar-1',
        english: 'They play football on Sundays.',
        indonesian: 'Mereka bermain bola pada hari Minggu.',
        solution: ['They', 'play', 'football', 'on', 'Sundays'],
        distractors: ['plays', 'playing', 'played'],
        explanation: 'Untuk subjek jamak (They), kata kerja tidak perlu tambahan -s.'
    },

    // Level 12: Simple Past (Completed Actions in the Past)
    {
        id: 'g5',
        levelId: 'grammar-2',
        english: 'I ate an apple yesterday.',
        indonesian: 'Saya makan apel kemarin.',
        solution: ['I', 'ate', 'an', 'apple', 'yesterday'],
        distractors: ['eat', 'eats', 'eating'],
        explanation: 'Untuk kejadian masa lalu (yesterday), gunakan Verb 2 (ate).'
    },
    {
        id: 'g6',
        levelId: 'grammar-2',
        english: 'She bought a new house last year.',
        indonesian: 'Dia membeli rumah baru tahun lalu.',
        solution: ['She', 'bought', 'a', 'new', 'house', 'last', 'year'],
        distractors: ['buy', 'buys', 'buying'],
        explanation: 'Verb 2 dari "buy" adalah "bought" (irregular verb).'
    },
    {
        id: 'g7',
        levelId: 'grammar-2',
        english: 'We went to the beach.',
        indonesian: 'Kami pergi ke pantai.',
        solution: ['We', 'went', 'to', 'the', 'beach'],
        distractors: ['go', 'goes', 'going'],
        explanation: 'Kata "went" adalah bentuk lampau dari "go".'
    },

    // Level 13: Simple Future (Plans, Predictions, or Promises)
    {
        id: 'g8',
        levelId: 'grammar-3',
        english: 'I will eat an apple tomorrow.',
        indonesian: 'Saya akan makan apel besok.',
        solution: ['I', 'will', 'eat', 'an', 'apple', 'tomorrow'],
        distractors: ['ate', 'going', 'would'],
        explanation: 'Gunakan "will + Verb 1" untuk menyatakan rencana masa depan.'
    },
    {
        id: 'g9',
        levelId: 'grammar-3',
        english: 'It will rain tonight.',
        indonesian: 'Ini akan hujan malam ini.',
        solution: ['It', 'will', 'rain', 'tonight'],
        distractors: ['rains', 'raining', 'rained'],
        explanation: 'Gunakan "will" untuk membuat prediksi cuaca.'
    },
    {
        id: 'g10',
        levelId: 'grammar-3',
        english: 'We will visit you next week.',
        indonesian: 'Kami akan mengunjungimu minggu depan.',
        solution: ['We', 'will', 'visit', 'you', 'next', 'week'],
        distractors: ['visited', 'visiting', 'visits'],
        explanation: 'Janji atau rencana masa depan menggunakan "will".'
    }
];
