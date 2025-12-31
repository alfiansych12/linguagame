import { z } from 'zod';

export const UpdateProfileSchema = z.object({
    name: z.string().min(2).max(50).optional(),
    image: z.string().url().optional(),
    has_seen_tutorial: z.boolean().optional(),
    equippedBorder: z.string().optional(),
});

export const EquipBorderSchema = z.object({
    borderId: z.string().min(1),
});

export const UseCrystalSchema = z.object({
    crystalType: z.enum(['shield', 'booster', 'hint', 'focus', 'slay', 'timefreeze', 'autocorrect', 'adminvision']),
});
