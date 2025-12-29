export interface BlitzTask {
    id: string;
    english: string;
    choices: string[];
    correctIndex: number;
    tense: 'Present' | 'Past' | 'Future';
}

export const BLITZ_DATA: BlitzTask[] = [
    { id: 'b1', english: 'Yesterday, I ___ to the store.', choices: ['go', 'went'], correctIndex: 1, tense: 'Past' },
    { id: 'b2', english: 'Every morning, she ___ coffee.', choices: ['drinks', 'drink'], correctIndex: 0, tense: 'Present' },
    { id: 'b3', english: 'Tomorrow, we ___ football.', choices: ['play', 'will play'], correctIndex: 1, tense: 'Future' },
    { id: 'b4', english: 'They ___ to Bali last summer.', choices: ['traveled', 'travel'], correctIndex: 0, tense: 'Past' },
    { id: 'b5', english: 'He ___ his teeth every night.', choices: ['brushes', 'brush'], correctIndex: 0, tense: 'Present' },
    { id: 'b6', english: 'I ___ you next week.', choices: ['visit', 'will visit'], correctIndex: 1, tense: 'Future' },
    { id: 'b7', english: 'Look! The bird ___ now.', choices: ['flies', 'is flying'], correctIndex: 1, tense: 'Present' },
    { id: 'b8', english: 'Two hours ago, it ___ to rain.', choices: ['starts', 'started'], correctIndex: 1, tense: 'Past' },
    { id: 'b9', english: 'One day, robots ___ the world.', choices: ['rule', 'will rule'], correctIndex: 1, tense: 'Future' },
    { id: 'b10', english: 'Water ___ at 100 degrees Celsius.', choices: ['boil', 'boils'], correctIndex: 1, tense: 'Present' },
];
