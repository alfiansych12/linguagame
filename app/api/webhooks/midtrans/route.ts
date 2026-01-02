import { NextResponse } from 'next/server';
import { supabase } from '@/lib/db/supabase';
import crypto from 'crypto';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const serverKey = process.env.MIDTRANS_SERVER_KEY;

        if (!serverKey) {
            console.error('[Webhook] MIDTRANS_SERVER_KEY not found');
            return NextResponse.json({ message: 'Server key not configured' }, { status: 500 });
        }

        // 1. Verify Signature (Security)
        const { order_id, status_code, gross_amount, signature_key } = body;
        const hash = crypto
            .createHash('sha512')
            .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
            .digest('hex');

        if (hash !== signature_key) {
            console.error('[Webhook] Invalid signature');
            return NextResponse.json({ message: 'Invalid signature' }, { status: 403 });
        }

        const transactionStatus = body.transaction_status;
        const fraudStatus = body.fraud_status;

        console.log(`[Webhook] Order ${order_id} status: ${transactionStatus}`);

        // Handle successful payment
        if (transactionStatus === 'capture' || transactionStatus === 'settlement') {
            if (fraudStatus === 'challenge') {
                console.log(`[Webhook] Transaction ${order_id} is challenged by FDS`);
            } else {
                // SUCCESS: Parse order_id: LINGUA-PRO-{planId}-{userId}-{timestamp}
                const parts = order_id.split('-');
                if (parts.length >= 4) {
                    const planId = parts[2]; // 'weekly' or 'monthly'
                    const userId = parts[3];

                    const durationDays = planId === 'weekly' ? 7 : 30;
                    const now = new Date();
                    const proUntil = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

                    console.log(`[Webhook] Upgrading User ${userId} to PRO until ${proUntil.toISOString()}`);

                    const { error } = await supabase
                        .from('users')
                        .update({
                            is_pro: true,
                            pro_until: proUntil.toISOString()
                        })
                        .eq('id', userId);

                    if (error) {
                        console.error('[Webhook] DB Update Error:', error);
                        return NextResponse.json({ message: 'Database update failed' }, { status: 500 });
                    }

                    console.log(`[Webhook] User ${userId} successfully upgraded to PRO`);
                }
            }
        }

        return NextResponse.json({ message: 'OK' });
    } catch (error) {
        console.error('[Webhook Error]', error);
        return NextResponse.json({ message: 'Internal error' }, { status: 500 });
    }
}
