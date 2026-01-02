'use server';

import { supabase } from '@/lib/db/supabase';

export async function createPaymentToken(planId: string, userId: string, userName: string) {
    // TACTICAL DEBUG: Log all MIDTRANS-related env keys (not values)
    const envKeys = Object.keys(process.env).filter(k => k.startsWith('MIDTRANS') || k.startsWith('NEXT_PUBLIC_MIDTRANS'));
    console.log('[Midtrans] Available Env Keys:', envKeys);

    // FRESH ENV CHECK
    const SERVER_KEY = process.env.MIDTRANS_SERVER_KEY?.trim();
    const IS_PRODUCTION = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === 'true';
    const IS_SANDBOX_VAR = process.env.MIDTRANS_IS_SANDBOX === 'true' || process.env.NEXT_PUBLIC_MIDTRANS_IS_SANDBOX === 'true';
    const IS_SANDBOX = !IS_PRODUCTION && (IS_SANDBOX_VAR || SERVER_KEY?.startsWith('SB-'));

    const API_URL = IS_SANDBOX
        ? 'https://app.sandbox.midtrans.com/snap/v1/transactions'
        : 'https://app.midtrans.com/snap/v1/transactions';

    if (!SERVER_KEY) {
        console.error('[Midtrans] SERVER_KEY is missing');
        return { success: false, error: 'Payment setup incomplete' };
    }

    // DEBUG LOGGING
    console.log(`[Midtrans] ENV_IS_SANDBOX: ${process.env.MIDTRANS_IS_SANDBOX}`);
    console.log(`[Midtrans] NEXT_PUBLIC_ENV_IS_SANDBOX: ${process.env.NEXT_PUBLIC_MIDTRANS_IS_SANDBOX}`);
    console.log(`[Midtrans] FINAL_MODE: ${IS_SANDBOX ? 'SANDBOX' : 'PRODUCTION'}`);
    console.log(`[Midtrans] TARGET_API: ${API_URL}`);

    const price = planId === 'weekly' ? 3000 : 10000;
    const durationDays = planId === 'weekly' ? 7 : 30;
    const orderId = `LINGUA-PRO-${planId}-${userId}-${Date.now()}`;

    const payload = {
        transaction_details: {
            order_id: orderId,
            gross_amount: price,
        },
        item_details: [{
            id: planId,
            price: price,
            quantity: 1,
            name: `LinguaGame PRO ${durationDays} Days`,
        }],
        customer_details: {
            first_name: userName,
        },
        metadata: {
            userId: userId,
            planId: planId
        }
    };

    try {
        const authHeader = `Basic ${Buffer.from(SERVER_KEY + ':').toString('base64')}`;

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': authHeader
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.token) {
            console.log('[Midtrans] Token generated successfully');
            return { success: true, token: data.token };
        } else {
            console.error('[Midtrans] Error Response:', JSON.stringify(data, null, 2));
            return { success: false, error: data.error_messages?.[0] || 'Gagal membuat transaksi' };
        }
    } catch (error) {
        console.error('Payment Action Error:', error);
        return { success: false, error: 'Internal server error' };
    }
}

/**
 * SECURE: Verifies and upgrades user. 
 * Note: In a real app, this should only happen via Midtrans Webhook Callback.
 * For this demo/fast implementation, we provide this action for local verification.
 */
export async function upgradeUserToPro(userId: string, planId: string) {
    try {
        const durationDays = planId === 'weekly' ? 7 : 30;
        const now = new Date();
        const proUntil = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

        const { error } = await supabase
            .from('users')
            .update({
                is_pro: true,
                pro_until: proUntil.toISOString()
            })
            .eq('id', userId);

        if (error) throw error;

        return { success: true, proUntil: proUntil.toISOString() };
    } catch (error) {
        console.error('Upgrade Error:', error);
        return { success: false, error: 'Gagal upgrade status PRO' };
    }
}
