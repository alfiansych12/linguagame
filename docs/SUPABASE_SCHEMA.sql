-- 📁 LINGUAGAME COMPREHENSIVE SCHEMA --
-- Salin semua ke Supabase SQL Editor untuk hasil 100% Gacor --

-- 1. EXTENSIONS --
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL USERS --
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY, -- Cocokkan dengan NextAuth ID (UUID/String)
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    image TEXT,
    total_xp INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    gems INTEGER DEFAULT 500,
    inventory JSONB DEFAULT '{"shield":0,"booster":0,"hint":0,"focus":0,"timefreeze":0,"autocorrect":0,"slay":0,"adminvision":0}'::jsonb,
    referral_code TEXT UNIQUE,
    referred_by TEXT REFERENCES public.users(id),
    referral_count INTEGER DEFAULT 0,
    has_seen_tutorial BOOLEAN DEFAULT false,
    vocab_count INTEGER DEFAULT 0,
    duel_wins INTEGER DEFAULT 0,
    total_spent INTEGER DEFAULT 0,
    unlocked_achievements TEXT[] DEFAULT '{}',
    claimed_milestones TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. TABEL USER PROGRESS (Misi/Level) --
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    level_id TEXT NOT NULL,
    status TEXT DEFAULT 'OPEN', -- 'OPEN', 'COMPLETED', 'LOCKED'
    score INTEGER DEFAULT 0,
    stars INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, level_id)
);

-- 4. TABEL USER QUESTS (Daily Tasks) --
CREATE TABLE IF NOT EXISTS public.user_quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    quest_id TEXT NOT NULL,
    target INTEGER NOT NULL,
    progress INTEGER DEFAULT 0,
    reward_gems INTEGER DEFAULT 100,
    status TEXT DEFAULT 'ACTIVE', -- 'ACTIVE', 'CLAIMED'
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. TABEL ARENA (Duel) --
CREATE TABLE IF NOT EXISTS public.duel_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'WAITING', -- 'WAITING', 'PLAYING', 'FINISHED'
    max_players INTEGER DEFAULT 5,
    time_limit INTEGER DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.duel_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.duel_rooms(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    is_ready BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. SECURITY (RLS) --
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duel_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duel_players ENABLE ROW LEVEL SECURITY;

-- Policies for Users
CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Public profile access" ON public.users FOR SELECT USING (true); -- Untuk Leaderboard

-- Policies for Progress
CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can update own progress" ON public.user_progress FOR ALL USING (auth.uid()::text = user_id);

-- Policies for Quests
CREATE POLICY "Users can view own quests" ON public.user_quests FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can update own quests" ON public.user_quests FOR UPDATE USING (auth.uid()::text = user_id);

-- Policies for Duel
CREATE POLICY "Duel access" ON public.duel_rooms FOR SELECT USING (true);
CREATE POLICY "Duel player access" ON public.duel_players FOR ALL USING (true); -- Simplified for Arena prototype

-- 7. HELPER FUNCTIONS (RPC) --

-- Function: Increment Referral Count & Add Gems
CREATE OR REPLACE FUNCTION public.increment_referral_count(target_code TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.users 
    SET referral_count = referral_count + 1,
        gems = gems + 500 -- Bonus reward
    WHERE referral_code = target_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. REALTIME CONFIGURATION --
begin;
  drop publication if exists supabase_realtime;
  create publication supabase_realtime;
commit;
alter publication supabase_realtime add table duel_rooms, duel_players;

-- 9. SEED INITIAL DATA --
-- Trigger untuk generate referral code otomatis saat user baru daftar
CREATE OR REPLACE FUNCTION public.handle_new_user_referral() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.referral_code := upper(substring(md5(random()::text) from 1 for 6));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_user_created ON public.users;
CREATE TRIGGER on_user_created
    BEFORE INSERT ON public.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_referral();
