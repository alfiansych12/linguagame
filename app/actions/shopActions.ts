'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin as supabase } from '@/lib/db/supabase-admin';
import { PurchaseBorderSchema, PurchaseCrystalSchema } from '@/lib/validations/shop';
import { revalidatePath } from 'next/cache';
import { strictRatelimit } from '@/lib/ratelimit';

/**
 * SECURE: Purchase Crystal Action
 * Includes server-side balance check and IDOR protection.
 */
export async function purchaseCrystal(data: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Harap login sirkel!' };

        // Rate Limit (Prevent spam forge)
        const { success: limitSuccess } = await strictRatelimit.limit(session.user.id);
        if (!limitSuccess) return { success: false, error: 'Sabar bang, mesin forgenya overheat! (Rate Limited)' };

        const validation = PurchaseCrystalSchema.safeParse(data);
        if (!validation.success) return { success: false, error: 'Data tidak valid' };

        const { crystalId, quantity, costPerItem } = validation.data;
        const totalCost = costPerItem * quantity;
        const userId = session.user.id;

        // Fetch user data for balance check
        const { data: user } = await supabase.from('users').select('gems, inventory').eq('id', userId).single();
        if (!user) return { success: false, error: 'User tidak ditemukan' };

        if (user.gems < totalCost) {
            return { success: false, error: 'Crystal tidak cukup bang!' };
        }

        const newInventory = { ...user.inventory };
        newInventory[crystalId] = (newInventory[crystalId] || 0) + quantity;

        const { error } = await supabase.from('users').update({
            gems: user.gems - totalCost,
            inventory: newInventory
        }).eq('id', userId);

        if (error) return { success: false, error: 'Transaksi gagal' };

        revalidatePath('/shop');
        revalidatePath('/profile');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Internal Error' };
    }
}

/**
 * SECURE: Purchase Border Action
 */
export async function purchaseBorder(data: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Harap login sirkel!' };

        // Rate Limit
        const { success: limitSuccess } = await strictRatelimit.limit(session.user.id);
        if (!limitSuccess) return { success: false, error: 'Antri sirkel, jangan borong terus! (Rate Limited)' };

        const validation = PurchaseBorderSchema.safeParse(data);
        if (!validation.success) return { success: false, error: 'Data tidak valid' };

        const { borderId, cost } = validation.data;
        const userId = session.user.id;

        const { data: user } = await supabase.from('users').select('gems, unlocked_borders').eq('id', userId).single();
        if (!user) return { success: false, error: 'User tidak ditemukan' };

        if (user.gems < cost) return { success: false, error: 'Crystal tidak cukup' };
        if (user.unlocked_borders?.includes(borderId)) return { success: false, error: 'Sudah punya!' };

        const newUnlocked = [...(user.unlocked_borders || []), borderId];

        const { error } = await supabase.from('users').update({
            gems: user.gems - cost,
            unlocked_borders: newUnlocked
        }).eq('id', userId);

        if (error) return { success: false, error: 'Transaksi gagal' };

        revalidatePath('/shop');
        revalidatePath('/profile');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Internal Error' };
    }
}

/**
 * SECURE: Redeem Promo Code Action
 */
export async function redeemPromoCode(code: string) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Harap login sirkel!' };

        const userId = session.user.id;
        const normalizedCode = code.trim().toUpperCase();

        // VALIDATION: Special Code LG26
        if (normalizedCode !== 'LG26') {
            return { success: false, error: 'Kode promo tidak valid atau kadaluarsa.' };
        }

        // Fetch user to check if already used
        const { data: user } = await supabase.from('users').select('gems, claimed_milestones').eq('id', userId).single();
        if (!user) return { success: false, error: 'User tidak ditemukan' };

        const claimed = user.claimed_milestones || [];
        if (claimed.includes('PROMO_LG26')) {
            return { success: false, error: 'Kode ini sudah kamu gunakan sirkel!' };
        }

        // Apply reward: 10000 crystals
        const rewardAmount = 10000;
        const newClaimed = [...claimed, 'PROMO_LG26'];

        const { error } = await supabase.from('users').update({
            gems: (user.gems || 0) + rewardAmount,
            claimed_milestones: newClaimed
        }).eq('id', userId);

        if (error) return { success: false, error: 'Gagal klaim promo' };

        revalidatePath('/shop');
        revalidatePath('/profile');
        return { success: true, amount: rewardAmount };
    } catch (error) {
        return { success: false, error: 'Internal Error' };
    }
}
