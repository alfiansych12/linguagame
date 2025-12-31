import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client
// Note: These env vars should be set in Upstash dashboard
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
    : null;

/**
 * Global Rate Limiter
 * Default: 10 requests per 10 seconds per user
 */
export const ratelimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "10 s"),
        analytics: true,
        prefix: "@upstash/ratelimit",
    })
    : { limit: () => Promise.resolve({ success: true }) };

/**
 * Strict Rate Limiter for critical actions (Submit Score, Purchase)
 * Default: 3 requests per 30 seconds per user
 */
export const strictRatelimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(3, "30 s"),
        analytics: true,
        prefix: "@upstash/ratelimit/strict",
    })
    : { limit: () => Promise.resolve({ success: true }) };
