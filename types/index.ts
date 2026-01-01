// Global Type Definitions for LinguaGame

export type GameStage = 'MEMORIZE' | 'JUMBLED' | 'CONNECT' | 'TYPING' | 'SPEED_BLITZ';

export type ProgressStatus = 'LOCKED' | 'OPEN' | 'COMPLETED';

export interface Word {
    id: string;
    levelId: string;
    english: string;
    indonesian: string;
    exampleSentence?: string;
    imageUrl?: string;
    audioUrl?: string;
}

export interface Level {
    id: string;
    title: string;
    description?: string;
    difficulty: number;
    orderIndex: number;
    icon?: string;
    isPublished: boolean;
    words?: Word[];
    phase?: number;
    isExam?: boolean;
    category?: string; // e.g. 'Simple Present'
    subType?: 'POSITIVE' | 'NEGATIVE' | 'QUESTION';
}

export interface UserProgress {
    id: string;
    userId: string;
    levelId: string;
    status: ProgressStatus;
    highScore: number;
    stars: number;
}

export interface User {
    id: string;
    name?: string;
    email?: string;
    image?: string;
    totalXp: number;
    currentStreak: number;
    longestStreak: number;
    lastPlayedAt?: Date;
}

export interface GameSession {
    id: string;
    userId: string;
    levelId: string;
    stage: GameStage;
    score: number;
    lives: number;
    timeElapsed: number;
    xpEarned: number;
    isCompleted: boolean;
}

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    name: string;
    avatar?: string;
    xp: number;
    language?: string;
    isCurrentUser?: boolean;
}
