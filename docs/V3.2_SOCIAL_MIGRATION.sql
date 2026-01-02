-- ============================================
-- V3.2 SOCIAL & ENGAGEMENT ENHANCEMENTS
-- Friends, Invites, and Leaderboard Expansion
-- ============================================

-- Table: public.friends
-- Purpose: Direct user-to-user relationships
CREATE TABLE IF NOT EXISTS public.friends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    friend_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT unique_friendship UNIQUE (user_id, friend_id),
    CONSTRAINT friend_not_self CHECK (user_id <> friend_id),
    CONSTRAINT valid_friend_status CHECK (status IN ('PENDING', 'ACCEPTED', 'BLOCKED'))
);

-- Table: public.duel_invites
-- Purpose: Direct invitations to join a match
CREATE TABLE IF NOT EXISTS public.duel_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES public.duel_matches(id) ON DELETE CASCADE,
    sender_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_invite_status CHECK (status IN ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED'))
);

-- RLS POLICIES
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duel_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own friends"
    ON public.friends
    FOR ALL
    USING (auth.uid()::text = user_id OR auth.uid()::text = friend_id);

CREATE POLICY "Users can see invites they sent or received"
    ON public.duel_invites
    FOR ALL
    USING (auth.uid()::text = sender_id OR auth.uid()::text = receiver_id);

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.friends;
ALTER PUBLICATION supabase_realtime ADD TABLE public.duel_invites;

SELECT 'V3.2 Social Schema Initialized! 🤝⚔️' AS status;
