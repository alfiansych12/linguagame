/**
 * Generate anonymous display name from user ID
 * Format: "Player #ABC123" (6 character hash)
 */
export function generateAnonymousName(userId: string): string {
    // Simple hash function to create consistent but anonymous names
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
        const char = userId.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }

    // Convert to alphanumeric code
    const code = Math.abs(hash).toString(36).toUpperCase().slice(0, 6).padStart(6, '0');

    return `Player #${code}`;
}

/**
 * Generate cool anonymous nickname bank
 */
const ANONYMOUS_NICKNAMES = [
    'Shadow Learner',
    'Mystery Scholar',
    'Silent Pro',
    'Hidden Genius',
    'Unknown Sepuh',
    'Ghost Player',
    'Incognito King',
    'Secret Master',
    'Anonymous Ace',
    'Stealth Expert',
    'Phantom Linguist',
    'Masked Challenger',
    'Invisible Legend',
    'Mysterious Wizard',
    'Nameless Hero'
];

/**
 * Get random cool anonymous nickname
 */
export function getAnonymousNickname(seed?: string): string {
    if (seed) {
        // Deterministic based on seed
        let hash = 0;
        for (let i = 0; i < seed.length; i++) {
            hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        }
        const index = Math.abs(hash) % ANONYMOUS_NICKNAMES.length;
        return ANONYMOUS_NICKNAMES[index];
    }
    // Random
    return ANONYMOUS_NICKNAMES[Math.floor(Math.random() * ANONYMOUS_NICKNAMES.length)];
}

/**
 * Sanitize display name - remove email and sensitive info
 * PRIVACY FIRST: Anonymize by default for maximum security
 */
export function sanitizeDisplayName(name: string | null | undefined, userId: string): string {
    if (!name) return generateAnonymousName(userId);

    // ALWAYS anonymize emails
    if (name.includes('@')) {
        return generateAnonymousName(userId);
    }

    // Anonymize if it looks like a full name (contains spaces)
    // Examples: "John Doe", "Alfian Syach Sugiarto" → Player #ABC123
    if (name.trim().includes(' ')) {
        return generateAnonymousName(userId);
    }

    // Anonymize if too long (likely full name or email prefix)
    if (name.length > 15) {
        return generateAnonymousName(userId);
    }

    // If it passes all checks, it's probably a safe username
    return name;
}
