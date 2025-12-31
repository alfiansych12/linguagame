import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Initialize Redis client
// Note: These env vars should be set in Upstash dashboard
const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
});

/**
 * Global Rate Limiter
 * Default: 10 requests per 10 seconds per user
 */
export const ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: true,
    prefix: "@upstash/ratelimit",
});

/**
 * Strict Rate Limiter for critical actions (Submit Score, Purchase)
 * Default: 3 requests per 30 seconds per user
 */
export const strictRatelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(3, "30 s"),
    analytics: true,
    prefix: "@upstash/ratelimit/strict",
});
