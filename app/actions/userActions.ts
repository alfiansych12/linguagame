'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabase } from '@/lib/db/supabase';
import { checkBorderUnlocked } from '@/lib/utils/borderUnlocks';
import { EquipBorderSchema, UpdateProfileSchema } from '@/lib/validations/user';
import { revalidatePath } from 'next/cache';

/**
 * SECURE: Equip Border Action
 * Derives userId from server session, validates input with Zod.
 */
export async function equipBorder(data: { borderId: string }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const validation = EquipBorderSchema.safeParse(data);
        if (!validation.success) return { success: false, error: 'Input tidak valid' };

        const { borderId } = validation.data;
        const userId = session.user.id;

        // Fetch user data to check unlock status
        const { data: userData, error: fetchError } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (fetchError || !userData) return { success: false, error: 'User not found' };

        if (!checkBorderUnlocked(borderId, userData)) {
            return { success: false, error: 'Border masih terkunci sirkel!' };
        }

        const { error: updateError } = await supabase
            .from('users')
            .update({ equipped_border: borderId })
            .eq('id', userId);

        if (updateError) return { success: false, error: 'Update failed' };

        revalidatePath('/profile');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Internal Error' };
    }
}

/**
 * SECURE: Update Profile Action
 * Prevents editing other users' profiles via secure session lookup.
 */
export async function updateProfile(data: any) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const validation = UpdateProfileSchema.safeParse(data);
        if (!validation.success) return { success: false, error: 'Data tidak valid' };

        const userId = session.user.id;
        const updates = validation.data;

        const { error } = await supabase
            .from('users')
            .update(updates)
            .eq('id', userId);

        if (error) return { success: false, error: 'Update failed' };

        revalidatePath('/profile');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Internal Error' };
    }
}

/**
 * SECURE: Consume Crystal Action
 * Decrements inventory on the server.
 */
export async function consumeCrystal(data: { crystalType: string }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        const { crystalType } = data;
        const userId = session.user.id;

        const { data: user } = await supabase.from('users').select('inventory').eq('id', userId).single();
        if (!user || (user.inventory[crystalType] || 0) <= 0) {
            return { success: false, error: 'Crystal tidak cukup' };
        }

        const newInventory = { ...user.inventory };
        newInventory[crystalType] -= 1;

        const { error } = await supabase.from('users').update({
            inventory: newInventory
        }).eq('id', userId);

        if (error) return { success: false, error: 'Failed to use crystal' };

        revalidatePath('/shop'); // Update balance display if any
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Internal Error' };
    }
}
