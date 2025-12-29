import { create } from 'zustand';

// Types
export type GameStage = 'MEMORIZE' | 'JUMBLED' | 'CONNECT' | 'TYPING' | 'SPEED_BLITZ';

export interface Word {
  id: string;
  english: string;
  indonesian: string;
  exampleSentence?: string;
  imageUrl?: string;
}

export interface GameState {
  // Game Session
  currentLevelId: string | null;
  currentStage: GameStage;
  currentWordIndex: number;
  words: Word[];
  
  // Progress Tracking
  score: number;
  lives: number;
  timer: number;
  xpEarned: number;
  
  // Stage Results
  correctAnswers: number;
  totalAttempts: number;
  
  // Game Status
  isPlaying: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  
  // Actions
  setLevel: (levelId: string, words: Word[]) => void;
  setStage: (stage: GameStage) => void;
  nextStage: () => void;
  nextWord: () => void;
  
  // Score & Lives Management
  addScore: (points: number) => void;
  loseLife: () => void;
  addXp: (xp: number) => void;
  
  // Timer
  setTimer: (seconds: number) => void;
  decrementTimer: () => void;
  
  // Answers Tracking
  recordAnswer: (isCorrect: boolean) => void;
  
  // Game Control
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  completeGame: () => void;
  resetGame: () => void;
}

const STAGE_ORDER: GameStage[] = ['MEMORIZE', 'JUMBLED', 'CONNECT', 'TYPING', 'SPEED_BLITZ'];

export const useGameStore = create<GameState>((set, get) => ({
  // Initial State
  currentLevelId: null,
  currentStage: 'MEMORIZE',
  currentWordIndex: 0,
  words: [],
  
  score: 0,
  lives: 3,
  timer: 60,
  xpEarned: 0,
  
  correctAnswers: 0,
  totalAttempts: 0,
  
  isPlaying: false,
  isPaused: false,
  isCompleted: false,
  
  // Actions Implementation
  setLevel: (levelId, words) => set({ 
    currentLevelId: levelId, 
    words,
    currentWordIndex: 0,
    currentStage: 'MEMORIZE'
  }),
  
  setStage: (stage) => set({ 
    currentStage: stage,
    currentWordIndex: 0 
  }),
  
  nextStage: () => {
    const { currentStage } = get();
    const currentIndex = STAGE_ORDER.indexOf(currentStage);
    
    if (currentIndex < STAGE_ORDER.length - 1) {
      set({ 
        currentStage: STAGE_ORDER[currentIndex + 1],
        currentWordIndex: 0
      });
    } else {
      // All stages completed
      get().completeGame();
    }
  },
  
  nextWord: () => {
    const { currentWordIndex, words } = get();
    
    if (currentWordIndex < words.length - 1) {
      set({ currentWordIndex: currentWordIndex + 1 });
    } else {
      // All words in this stage done, move to next stage
      get().nextStage();
    }
  },
  
  addScore: (points) => set((state) => ({ 
    score: state.score + points 
  })),
  
  loseLife: () => set((state) => {
    const newLives = state.lives - 1;
    
    // Game Over if no lives left
    if (newLives <= 0) {
      return { 
        lives: 0, 
        isPlaying: false,
        isCompleted: true 
      };
    }
    
    return { lives: newLives };
  }),
  
  addXp: (xp) => set((state) => ({ 
    xpEarned: state.xpEarned + xp 
  })),
  
  setTimer: (seconds) => set({ timer: seconds }),
  
  decrementTimer: () => set((state) => {
    const newTimer = state.timer - 1;
    
    // Auto-advance if timer hits 0 in MEMORIZE stage
    if (newTimer <= 0 && state.currentStage === 'MEMORIZE') {
      setTimeout(() => get().nextStage(), 100);
    }
    
    return { timer: Math.max(0, newTimer) };
  }),
  
  recordAnswer: (isCorrect) => set((state) => ({
    correctAnswers: state.correctAnswers + (isCorrect ? 1 : 0),
    totalAttempts: state.totalAttempts + 1
  })),
  
  startGame: () => set({ 
    isPlaying: true, 
    isPaused: false,
    score: 0,
    lives: 3,
    xpEarned: 0,
    correctAnswers: 0,
    totalAttempts: 0,
    currentWordIndex: 0,
    isCompleted: false
  }),
  
  pauseGame: () => set({ isPaused: true }),
  
  resumeGame: () => set({ isPaused: false }),
  
  completeGame: () => set({ 
    isPlaying: false, 
    isCompleted: true 
  }),
  
  resetGame: () => set({
    currentLevelId: null,
    currentStage: 'MEMORIZE',
    currentWordIndex: 0,
    words: [],
    score: 0,
    lives: 3,
    timer: 60,
    xpEarned: 0,
    correctAnswers: 0,
    totalAttempts: 0,
    isPlaying: false,
    isPaused: false,
    isCompleted: false
  })
}));
