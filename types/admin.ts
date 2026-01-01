export interface RedeemCode {
    id: string;
    code: string;
    reward_gems: number;
    reward_xp: number;
    max_uses: number;
    current_uses: number;
    expires_at: string | null;
    created_at: string;
}

export interface Announcement {
    id: string;
    title: string;
    content: string;
    type: 'info' | 'update' | 'reward';
    created_at: string;
}

export interface UserStats {
    id: string;
    name: string;
    email: string;
    image: string | null;
    total_xp: number;
    current_streak: number;
    gems: number;
    is_admin: boolean;
    last_login_at: string | null;
    created_at: string;
}
