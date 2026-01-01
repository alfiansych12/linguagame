import { z } from 'zod';

export const PurchaseCrystalSchema = z.object({
    crystalId: z.enum(['shield', 'booster', 'hint', 'focus', 'slay', 'timefreeze', 'autocorrect', 'adminvision']),
    quantity: z.number().int().min(1).max(99)
});

export const PurchaseBorderSchema = z.object({
    borderId: z.string().min(1)
});
