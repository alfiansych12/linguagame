export interface BlitzTask {
    id: string;
    english: string;
    choices: string[]; // Usually 2 choices for speed
    correctIndex: number;
    tense: 'Present' | 'Past' | 'Future';
}

export const BLITZ_DATA: BlitzTask[] = [
    // Mixed Tense Challenges (Short & Fast)
    { id: 'b1', english: 'Yesterday, I ___ to the store.', choices: ['go', 'went'], correctIndex: 1, tense: 'Past' },
    { id: 'b2', english: 'She ___ coffee every day.', choices: ['drinks', 'drink'], correctIndex: 0, tense: 'Present' },
    { id: 'b3', english: 'We ___ football tomorrow.', choices: ['play', 'will play'], correctIndex: 1, tense: 'Future' },
    { id: 'b4', english: 'They ___ to Bali last year.', choices: ['traveled', 'travel'], correctIndex: 0, tense: 'Past' },
    { id: 'b5', english: 'He ___ his teeth now.', choices: ['brushes', 'is brushing'], correctIndex: 1, tense: 'Present' },
    { id: 'b6', english: 'I ___ you next week.', choices: ['visit', 'will visit'], correctIndex: 1, tense: 'Future' },
    { id: 'b7', english: 'Look! The bird ___.', choices: ['flies', 'is flying'], correctIndex: 1, tense: 'Present' },
    { id: 'b8', english: 'It ___ raining an hour ago.', choices: ['starts', 'started'], correctIndex: 1, tense: 'Past' },
    { id: 'b9', english: 'Robots ___ the world soon.', choices: ['rule', 'will rule'], correctIndex: 1, tense: 'Future' },
    { id: 'b10', english: 'Water ___ at 100°C.', choices: ['boil', 'boils'], correctIndex: 1, tense: 'Present' },
    // Adding more questions for variety (Total 20)
    { id: 'b11', english: 'I ___ an apple just now.', choices: ['eat', 'ate'], correctIndex: 1, tense: 'Past' },
    { id: 'b12', english: 'She ___ sad yesterday.', choices: ['was', 'is'], correctIndex: 0, tense: 'Past' },
    { id: 'b13', english: 'We ___ happy today.', choices: ['are', 'were'], correctIndex: 0, tense: 'Present' },
    { id: 'b14', english: 'He ___ a doctor in 2030.', choices: ['will be', 'is'], correctIndex: 0, tense: 'Future' },
    { id: 'b15', english: 'They ___ studying when I called.', choices: ['were', 'are'], correctIndex: 0, tense: 'Past' },
    { id: 'b16', english: 'My cat ___ cute.', choices: ['is', 'are'], correctIndex: 0, tense: 'Present' },
    { id: 'b17', english: 'I ___ finished my work.', choices: ['have', 'has'], correctIndex: 0, tense: 'Present' }, // Present Perfect
    { id: 'b18', english: 'She ___ seen that movie.', choices: ['had', 'have'], correctIndex: 0, tense: 'Past' }, // Past Perfect Context (implied) - simple check
    { id: 'b19', english: 'Do you ___ me?', choices: ['love', 'loves'], correctIndex: 0, tense: 'Present' },
    { id: 'b20', english: 'Did she ___ you?', choices: ['call', 'called'], correctIndex: 0, tense: 'Past' }
];
