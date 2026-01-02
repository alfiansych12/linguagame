'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin as supabase } from '@/lib/db/supabase-admin';
import { blacklistIP, isIPBlacklisted } from '@/lib/ratelimit';
import { headers } from 'next/headers';

/**
 * ADMIN ONLY: Security Management Actions (v3.0)
 * Provides tools for managing IP blacklists and security threats
 */

/**
 * Get current IP of requester
 */
async function getCurrentIP(): Promise<string> {
    const headersList = await headers();
    const forwardedFor = headersList.get('x-forwarded-for');
    return forwardedFor ? forwardedFor.split(',')[0] : headersList.get('x-real-ip') || 'unknown';
}

/**
 * Blacklist an IP address
 */
export async function adminBlacklistIP(data: { ip: string; reason: string }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        // Check admin status
        const { data: user } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();

        if (!user?.is_admin) {
            return { success: false, error: 'Admin access required' };
        }

        const success = await blacklistIP(data.ip, data.reason);

        if (success) {
            // Log the action
            await supabase.from('admin_logs').insert({
                admin_id: session.user.id,
                action: 'BLACKLIST_IP',
                target: data.ip,
                details: data.reason,
                timestamp: new Date().toISOString()
            });

            return { success: true, message: `IP ${data.ip} has been blacklisted` };
        }

        return { success: false, error: 'Failed to blacklist IP' };
    } catch (error) {
        console.error('adminBlacklistIP error:', error);
        return { success: false, error: 'Internal Error' };
    }
}

/**
 * Check if current request IP is blacklisted
 */
export async function checkCurrentIPStatus() {
    try {
        const ip = await getCurrentIP();
        const blacklisted = await isIPBlacklisted(ip);

        return {
            success: true,
            ip,
            blacklisted
        };
    } catch (error) {
        console.error('checkCurrentIPStatus error:', error);
        return { success: false, error: 'Internal Error' };
    }
}

/**
 * Get security analytics
 */
export async function getSecurityAnalytics() {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) return { success: false, error: 'Unauthorized' };

        // Check admin status
        const { data: user } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();

        if (!user?.is_admin) {
            return { success: false, error: 'Admin access required' };
        }

        // Get recent admin logs
        const { data: logs } = await supabase
            .from('admin_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(100);

        return {
            success: true,
            logs: logs || []
        };
    } catch (error) {
        console.error('getSecurityAnalytics error:', error);
        return { success: false, error: 'Internal Error' };
    }
}
