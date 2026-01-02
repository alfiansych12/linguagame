import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { globalRatelimit, isIPBlacklisted } from '@/lib/ratelimit';

/**
 * V3.0 SECURITY MIDDLEWARE
 * - User-Agent validation
 * - IP blacklist check
 * - Global rate limiting
 * - Bot detection
 */

// Suspicious User-Agent patterns (bots, scrapers, attack tools)
const BLOCKED_USER_AGENTS = [
    'python-requests',
    'curl',
    'wget',
    'scrapy',
    'bot',
    'crawler',
    'spider',
    'postman',
    'insomnia',
    'selenium',
    'puppeteer',
    'playwright',
    'axios',
    'node-fetch',
    'go-http-client',
    'java',
    'perl',
    'ruby',
    'php',
];

// Paths that require strict security
const PROTECTED_PATHS = [
    '/api',
    '/admin',
];

// Paths that bypass middleware (public assets)
const BYPASS_PATHS = [
    '/_next',
    '/favicon.ico',
    '/images',
    '/fonts',
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for bypass paths
    if (BYPASS_PATHS.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // Extract request info
    const userAgent = request.headers.get('user-agent') || '';
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] :
        request.headers.get('x-real-ip') ||
        'unknown';

    // 1. IP BLACKLIST CHECK
    if (ip !== 'unknown') {
        const blacklisted = await isIPBlacklisted(ip);
        if (blacklisted) {
            console.warn(`[SECURITY] Blocked blacklisted IP: ${ip}`);
            return new NextResponse(
                JSON.stringify({
                    error: 'Access Denied',
                    message: 'Your IP has been blocked. Contact admin if this is a mistake.',
                    code: 'IP_BLACKLISTED'
                }),
                {
                    status: 403,
                    headers: { 'Content-Type': 'application/json' }
                }
            );
        }
    }

    // 2. USER-AGENT VALIDATION (for protected paths)
    if (PROTECTED_PATHS.some(path => pathname.startsWith(path))) {
        const isBot = BLOCKED_USER_AGENTS.some(agent =>
            userAgent.toLowerCase().includes(agent.toLowerCase())
        );

        if (isBot) {
            console.warn(`[SECURITY] Blocked suspicious User-Agent: ${userAgent} from IP: ${ip}`);

            // Log suspicious activity
            await logSuspiciousActivity({
                ip,
                userAgent,
                path: pathname,
                reason: 'BLOCKED_USER_AGENT'
            });

            return new NextResponse(
                JSON.stringify({
                    error: 'Forbidden',
                    message: 'Automated access detected. Please use a web browser.',
                    code: 'INVALID_USER_AGENT'
                }),
                {
                    status: 403,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Robots-Tag': 'noindex, nofollow'
                    }
                }
            );
        }
    }

    // 3. GLOBAL RATE LIMITING (for API routes)
    if (pathname.startsWith('/api')) {
        const identifier = ip !== 'unknown' ? ip : 'global';
        const { success, limit, remaining, reset } = await globalRatelimit.limit(identifier);

        if (!success) {
            console.warn(`[SECURITY] Rate limit exceeded for IP: ${ip} on ${pathname}`);

            // Track repeated violations for auto-ban
            await trackRateLimitViolation(ip);

            return new NextResponse(
                JSON.stringify({
                    error: 'Too Many Requests',
                    message: 'Rate limit exceeded. Please try again later.',
                    code: 'RATE_LIMIT_EXCEEDED',
                    limit,
                    remaining: 0,
                    reset
                }),
                {
                    status: 429,
                    headers: {
                        'Content-Type': 'application/json',
                        'X-RateLimit-Limit': limit.toString(),
                        'X-RateLimit-Remaining': '0',
                        'X-RateLimit-Reset': reset.toString(),
                        'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString()
                    }
                }
            );
        }

        // Add rate limit headers to response
        const response = NextResponse.next();
        response.headers.set('X-RateLimit-Limit', limit.toString());
        response.headers.set('X-RateLimit-Remaining', remaining.toString());
        response.headers.set('X-RateLimit-Reset', reset.toString());

        return response;
    }

    // 4. SECURITY HEADERS (for all requests)
    const response = NextResponse.next();

    // Add security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    return response;
}

/**
 * Log suspicious activity for admin review
 */
async function logSuspiciousActivity(data: {
    ip: string;
    userAgent: string;
    path: string;
    reason: string;
}) {
    try {
        const { logSuspiciousActivity: logActivity } = await import('@/lib/ratelimit');
        await logActivity(data);
    } catch (error) {
        console.error('Failed to log suspicious activity:', error);
    }
}

/**
 * Track rate limit violations for auto-ban
 */
async function trackRateLimitViolation(ip: string) {
    try {
        const { trackViolation } = await import('@/lib/ratelimit');
        await trackViolation(ip);
    } catch (error) {
        console.error('Failed to track violation:', error);
    }
}

// Configure which paths use this middleware
export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - _next/static (static files)
         * - _next/image (image optimization)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
