-- 📁 TINGGAL SALIN KE SUPABASE SQL EDITOR --

-- 1. Tabel Users (Menyesuaikan dengan NextAuth yang biasanya pakai TEXT untuk ID)
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY, -- Menggunakan TEXT agar cocok dengan NextAuth UUID/string
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    image TEXT,
    total_xp INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    gems INTEGER DEFAULT 500,
    referral_code TEXT UNIQUE,
    referred_by TEXT REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabel Duel Rooms (Arena)
CREATE TABLE IF NOT EXISTS public.duel_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'WAITING',
    max_players INTEGER DEFAULT 5,
    time_limit INTEGER DEFAULT 60,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabel Duel Players
CREATE TABLE IF NOT EXISTS public.duel_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.duel_rooms(id) ON DELETE CASCADE,
    user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL, -- Diubah jadi TEXT
    name TEXT NOT NULL,
    score INTEGER DEFAULT 0,
    is_ready BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabel User Progress (Misi)
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE, -- Diubah jadi TEXT
    level_id TEXT NOT NULL,
    status TEXT DEFAULT 'OPEN',
    score INTEGER DEFAULT 0,
    stars INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ,
    UNIQUE(user_id, level_id)
);

-- 5. Tabel Referrals
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id TEXT REFERENCES public.users(id) ON DELETE CASCADE, -- Diubah jadi TEXT
    referred_id TEXT REFERENCES public.users(id) ON DELETE CASCADE, -- Diubah jadi TEXT
    reward_claimed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(referred_id)
);

-- 6. Tabel User Quests (Daily Quest Gacor)
CREATE TABLE IF NOT EXISTS public.user_quests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE, -- Diubah jadi TEXT
    quest_id TEXT NOT NULL,
    status TEXT DEFAULT 'ACTIVE',
    progress INTEGER DEFAULT 0,
    target INTEGER DEFAULT 1,
    reward_gems INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT (CURRENT_DATE + interval '1 day')
);

-- 7. ENABLE REALTIME
alter publication supabase_realtime add table duel_rooms;
alter publication supabase_realtime add table duel_players;
alter publication supabase_realtime add table user_quests;

-- 8. Seed referral codes
UPDATE public.users SET referral_code = upper(substring(md5(random()::text) from 1 for 6)) WHERE referral_code IS NULL;
