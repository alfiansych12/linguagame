import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

/**
 * GLOBAL RATE LIMITER (v3.0 Security Layer)
 * Uses Upstash Redis for distributed rate limiting across all Vercel Edge instances
 * 
 * Setup Required:
 * 1. Create Upstash Redis database at https://console.upstash.com
 * 2. Add to .env.local:
 *    UPSTASH_REDIS_REST_URL=your_url
 *    UPSTASH_REDIS_REST_TOKEN=your_token
 */

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null;

/**
 * Strict Rate Limiter for Critical Actions
 * - Game Score Submission: 10 requests per minute
 * - Prevents rapid-fire bot submissions
 */
export const strictRatelimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, '1 m'),
        analytics: true,
        prefix: 'linguagame:strict',
    })
    : {
        limit: async () => ({ success: true, limit: 10, remaining: 10, reset: 0 }),
    };

/**
 * Moderate Rate Limiter for Shop Actions
 * - Crystal Purchase: 30 requests per minute
 * - Prevents spam purchasing
 */
export const moderateRatelimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, '1 m'),
        analytics: true,
        prefix: 'linguagame:moderate',
    })
    : {
        limit: async () => ({ success: true, limit: 30, remaining: 30, reset: 0 }),
    };

/**
 * Aggressive Rate Limiter for Auth Endpoints
 * - Login/Register: 5 attempts per 5 minutes
 * - DDoS protection for authentication
 */
export const authRatelimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, '5 m'),
        analytics: true,
        prefix: 'linguagame:auth',
    })
    : {
        limit: async () => ({ success: true, limit: 5, remaining: 5, reset: 0 }),
    };

/**
 * Global API Rate Limiter
 * - General API calls: 100 requests per minute per IP
 * - Baseline DDoS protection
 */
export const globalRatelimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(100, '1 m'),
        analytics: true,
        prefix: 'linguagame:global',
    })
    : {
        limit: async () => ({ success: true, limit: 100, remaining: 100, reset: 0 }),
    };

/**
 * IP Blacklist Check
 * Checks if an IP is in the blacklist (manually added by admin)
 */
export async function isIPBlacklisted(ip: string): Promise<boolean> {
    if (!redis) return false;

    try {
        const blacklisted = await redis.sismember('linguagame:blacklist:ips', ip);
        return blacklisted === 1;
    } catch (error) {
        console.error('IP blacklist check failed:', error);
        return false;
    }
}

/**
 * Add IP to Blacklist
 * Admin function to permanently block malicious IPs
 */
export async function blacklistIP(ip: string, reason?: string): Promise<boolean> {
    if (!redis) return false;

    try {
        await redis.sadd('linguagame:blacklist:ips', ip);
        if (reason) {
            await redis.hset('linguagame:blacklist:reasons', { [ip]: reason });
        }
        return true;
    } catch (error) {
        console.error('Failed to blacklist IP:', error);
        return false;
    }
}

/**
 * Behavioral Analysis: Detect Bot Patterns
 * Returns true if request pattern is suspicious
 */
export async function detectBotBehavior(userId: string, action: string): Promise<boolean> {
    if (!redis) return false;

    try {
        const key = `linguagame:behavior:${userId}:${action}`;
        const count = await redis.incr(key);
        await redis.expire(key, 10); // 10 second window

        // If more than 5 identical actions in 10 seconds, flag as bot
        return count > 5;
    } catch (error) {
        console.error('Bot detection failed:', error);
        return false;
    }
}

/**
 * Track rate limit violations and auto-ban repeat offenders
 */
export async function trackViolation(ip: string): Promise<{ violations: number; shouldBan: boolean }> {
    if (!redis) return { violations: 0, shouldBan: false };

    try {
        const key = `linguagame:violations:${ip}`;
        const violations = await redis.incr(key);
        await redis.expire(key, 3600); // 1 hour window

        // Auto-ban after 10 violations in 1 hour
        const shouldBan = violations >= 10;

        if (shouldBan) {
            await blacklistIP(ip, `Auto-banned: ${violations} rate limit violations in 1 hour`);
            console.warn(`[AUTO-BAN] IP ${ip} banned after ${violations} violations`);
        }

        return { violations, shouldBan };
    } catch (error) {
        console.error('Track violation failed:', error);
        return { violations: 0, shouldBan: false };
    }
}

/**
 * Get violation count for an IP
 */
export async function getViolationCount(ip: string): Promise<number> {
    if (!redis) return 0;

    try {
        const key = `linguagame:violations:${ip}`;
        const count = await redis.get(key);
        return count ? parseInt(count as string) : 0;
    } catch (error) {
        console.error('Get violation count failed:', error);
        return 0;
    }
}

/**
 * Clear violations for an IP (admin action)
 */
export async function clearViolations(ip: string): Promise<boolean> {
    if (!redis) return false;

    try {
        const key = `linguagame:violations:${ip}`;
        await redis.del(key);
        return true;
    } catch (error) {
        console.error('Clear violations failed:', error);
        return false;
    }
}

/**
 * Get recent suspicious activities
 */
export async function getSuspiciousActivities(limit: number = 50): Promise<any[]> {
    if (!redis) return [];

    try {
        const activities = await redis.lrange('linguagame:suspicious', 0, limit - 1);
        return activities.map(item => {
            try {
                return typeof item === 'string' ? JSON.parse(item) : item;
            } catch {
                return item;
            }
        });
    } catch (error) {
        console.error('Get suspicious activities failed:', error);
        return [];
    }
}

/**
 * Log suspicious activity
 */
export async function logSuspiciousActivity(data: {
    ip: string;
    userAgent: string;
    path: string;
    reason: string;
}): Promise<void> {
    if (!redis) return;

    try {
        const entry = JSON.stringify({
            timestamp: Date.now(),
            ...data
        });

        await redis.lpush('linguagame:suspicious', entry);
        // Keep only last 1000 entries
        await redis.ltrim('linguagame:suspicious', 0, 999);
    } catch (error) {
        console.error('Log suspicious activity failed:', error);
    }
}

/**
 * Security Headers Helper
 * Returns recommended security headers for API responses
 */
export const securityHeaders = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
};
