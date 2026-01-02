import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { supabaseAdmin as supabase } from '@/lib/db/supabase-admin';
import { getSuspiciousActivities, getViolationCount } from '@/lib/ratelimit';

/**
 * GET /api/admin/security
 * Returns security analytics for admin dashboard
 */
export async function GET() {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user?.id) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check admin status
        const { data: user } = await supabase
            .from('users')
            .select('is_admin')
            .eq('id', session.user.id)
            .single();

        if (!user?.is_admin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        // Get suspicious activities from Redis
        const activities = await getSuspiciousActivities(100);

        // Get recent violations count
        const uniqueIPs = [...new Set(activities.map(a => a.ip))];
        let recentViolations = 0;

        for (const ip of uniqueIPs) {
            const count = await getViolationCount(ip);
            if (count > 0) recentViolations++;
        }

        // Get blacklist count from admin_logs
        const { count: blacklistCount } = await supabase
            .from('admin_logs')
            .select('*', { count: 'exact', head: true })
            .eq('action', 'BLACKLIST_IP');

        return NextResponse.json({
            success: true,
            activities: activities.slice(0, 50), // Last 50 activities
            stats: {
                totalBlacklisted: blacklistCount || 0,
                recentViolations,
                suspiciousActivities: activities.length
            }
        });
    } catch (error) {
        console.error('Security API error:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
