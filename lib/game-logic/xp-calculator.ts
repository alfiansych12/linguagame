/**
 * XP Calculation Formula for LinguaGame
 * 
 * Base XP: 50 for level completion
 * Accuracy Bonus: Up to 50 XP (scaled by percentage of correct answers)
 * Speed Bonus: Up to 30 XP (scaled by time remaining)
 * Combo Multiplier: 1.x based on max streak in level
 * Crystal Multiplier: x2 if Booster Gacor is active
 */

interface XPParams {
    baseXp?: number;
    mistakes: number;
    totalTasks: number;
    timeRemaining?: number; // seconds
    maxTime?: number;       // seconds
    maxStreak: number;
    crystalActive?: boolean;
    isPro?: boolean;
}

export function calculateXp({
    baseXp = 50,
    mistakes,
    totalTasks,
    timeRemaining = 0,
    maxTime = 1,
    maxStreak,
    crystalActive = false,
    isPro = false
}: XPParams): { total: number; breakdown: { base: number; accuracy: number; speed: number; combo: number; multiplier: number; isProMultiplier: boolean } } {

    // 1. Accuracy Bonus (0 to 50)
    const correctCount = Math.max(0, totalTasks - mistakes);
    const accuracyFactor = correctCount / totalTasks;
    const accuracyBonus = Math.round(accuracyFactor * 50);

    // 2. Speed Bonus (0 to 30)
    const speedFactor = timeRemaining / maxTime;
    const speedBonus = Math.round(speedFactor * 30);

    // 3. Combo Bonus (Max Streak scaling)
    // 10% bonus for every 5 streak
    const comboBonus = Math.round((maxStreak / 5) * 10);

    const subtotal = baseXp + accuracyBonus + speedBonus + comboBonus;

    // 4. Multipliers (e.g. 2x XP crystal, 1.5x PRO boost)
    let multiplier = crystalActive ? 2 : 1;
    let total = Math.round(subtotal * multiplier);

    if (isPro) {
        total = Math.round(total * 1.5);
    }

    return {
        total,
        breakdown: {
            base: baseXp,
            accuracy: accuracyBonus,
            speed: speedBonus,
            combo: comboBonus,
            multiplier,
            isProMultiplier: isPro
        }
    };
}

export function calculateStars(accuracy: number): number {
    if (accuracy >= 1) return 3;
    if (accuracy >= 0.8) return 2;
    if (accuracy >= 0.5) return 1;
    return 0;
}
