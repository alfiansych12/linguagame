import { z } from 'zod';

/**
 * Schema for submitting game scores.
 * Enforces strict limits to prevent impossible scores.
 */
export const SubmitScoreSchema = z.object({
    levelId: z.string().min(1),
    score: z.number().int().min(0).max(2000), // Max score per level (e.g., 2000 XP)
    stars: z.number().int().min(0).max(3),
    timeTaken: z.number().int().min(1).optional(), // Time in seconds
});

export type SubmitScoreInput = z.infer<typeof SubmitScoreSchema>;
