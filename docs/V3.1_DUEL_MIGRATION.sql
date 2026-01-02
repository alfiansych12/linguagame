-- ============================================
-- V3.1 REAL-TIME DUEL ARENA 2.0
-- Enhanced PvP System with Live Synchronization
-- ============================================

-- Table: duel_matches (Enhanced)
-- Purpose: Track live duel matches with real-time state
CREATE TABLE IF NOT EXISTS public.duel_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code TEXT NOT NULL UNIQUE,
    host_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    opponent_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'WAITING',
    game_mode TEXT NOT NULL DEFAULT 'VOCAB',
    max_rounds INTEGER DEFAULT 10,
    current_round INTEGER DEFAULT 0,
    host_score INTEGER DEFAULT 0,
    opponent_score INTEGER DEFAULT 0,
    host_ready BOOLEAN DEFAULT false,
    opponent_ready BOOLEAN DEFAULT false,
    winner_id TEXT REFERENCES public.users(id),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    CONSTRAINT valid_status CHECK (status IN ('WAITING', 'READY', 'PLAYING', 'FINISHED', 'CANCELLED')),
    CONSTRAINT valid_game_mode CHECK (game_mode IN ('VOCAB', 'GRAMMAR', 'SPEED_BLITZ'))
);

-- Table: duel_rounds
-- Purpose: Track each round's state in real-time
CREATE TABLE IF NOT EXISTS public.duel_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES public.duel_matches(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    question_id TEXT NOT NULL,
    host_answer TEXT,
    opponent_answer TEXT,
    host_time_ms INTEGER,
    opponent_time_ms INTEGER,
    host_correct BOOLEAN,
    opponent_correct BOOLEAN,
    started_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    CONSTRAINT unique_match_round UNIQUE (match_id, round_number)
);

-- Table: duel_presence
-- Purpose: Track player presence for disconnect detection
CREATE TABLE IF NOT EXISTS public.duel_presence (
    user_id TEXT PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    match_id UUID REFERENCES public.duel_matches(id) ON DELETE CASCADE,
    last_heartbeat TIMESTAMPTZ DEFAULT NOW(),
    is_online BOOLEAN DEFAULT true
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_duel_matches_room_code ON public.duel_matches(room_code);
CREATE INDEX IF NOT EXISTS idx_duel_matches_status ON public.duel_matches(status);
CREATE INDEX IF NOT EXISTS idx_duel_matches_host ON public.duel_matches(host_id);
CREATE INDEX IF NOT EXISTS idx_duel_rounds_match ON public.duel_rounds(match_id);
CREATE INDEX IF NOT EXISTS idx_duel_presence_match ON public.duel_presence(match_id);

-- ============================================
-- RLS POLICIES
-- ============================================

ALTER TABLE public.duel_matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duel_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duel_presence ENABLE ROW LEVEL SECURITY;

-- Duel Matches Policies
CREATE POLICY "Users can view matches they're in"
    ON public.duel_matches
    FOR SELECT
    USING (
        auth.uid()::text = host_id 
        OR auth.uid()::text = opponent_id
    );

CREATE POLICY "Users can create matches"
    ON public.duel_matches
    FOR INSERT
    WITH CHECK (auth.uid()::text = host_id);

CREATE POLICY "Participants can update their match"
    ON public.duel_matches
    FOR UPDATE
    USING (
        auth.uid()::text = host_id 
        OR auth.uid()::text = opponent_id
    );

-- Duel Rounds Policies
CREATE POLICY "Users can view rounds in their matches"
    ON public.duel_rounds
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.duel_matches
            WHERE duel_matches.id = duel_rounds.match_id
            AND (duel_matches.host_id = auth.uid()::text 
                 OR duel_matches.opponent_id = auth.uid()::text)
        )
    );

CREATE POLICY "Users can insert rounds in their matches"
    ON public.duel_rounds
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.duel_matches
            WHERE duel_matches.id = match_id
            AND (duel_matches.host_id = auth.uid()::text 
                 OR duel_matches.opponent_id = auth.uid()::text)
        )
    );

-- Presence Policies
CREATE POLICY "Users can manage their own presence"
    ON public.duel_presence
    FOR ALL
    USING (auth.uid()::text = user_id);

-- ============================================
-- REALTIME PUBLICATION
-- Enable Realtime for these tables
-- ============================================

-- Enable realtime for duel_matches
ALTER PUBLICATION supabase_realtime ADD TABLE public.duel_matches;

-- Enable realtime for duel_rounds
ALTER PUBLICATION supabase_realtime ADD TABLE public.duel_rounds;

-- Enable realtime for duel_presence
ALTER PUBLICATION supabase_realtime ADD TABLE public.duel_presence;

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function: Update presence heartbeat
CREATE OR REPLACE FUNCTION update_duel_presence()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.duel_presence (user_id, match_id, last_heartbeat, is_online)
    VALUES (NEW.host_id, NEW.id, NOW(), true)
    ON CONFLICT (user_id) 
    DO UPDATE SET 
        match_id = NEW.id,
        last_heartbeat = NOW(),
        is_online = true;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Auto-create presence on match creation
CREATE TRIGGER on_match_created
    AFTER INSERT ON public.duel_matches
    FOR EACH ROW
    EXECUTE FUNCTION update_duel_presence();

-- Function: Auto-finish match if player disconnects
CREATE OR REPLACE FUNCTION check_player_disconnect()
RETURNS void AS $$
BEGIN
    UPDATE public.duel_matches
    SET status = 'CANCELLED',
        ended_at = NOW()
    WHERE id IN (
        SELECT match_id 
        FROM public.duel_presence
        WHERE last_heartbeat < NOW() - INTERVAL '30 seconds'
        AND is_online = true
    )
    AND status IN ('WAITING', 'READY', 'PLAYING');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT 'V3.1 Real-time Duel Arena Tables Created! 🎮⚔️' AS status;

-- Check tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'duel_%'
ORDER BY table_name;
