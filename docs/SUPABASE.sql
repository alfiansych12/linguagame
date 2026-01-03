create table public."Account" (
  id text not null,
  "userId" text not null,
  type text not null,
  provider text not null,
  "providerAccountId" text not null,
  refresh_token text null,
  access_token text null,
  expires_at integer null,
  token_type text null,
  scope text null,
  id_token text null,
  session_state text null,
  constraint Account_pkey primary key (id),
  constraint Account_provider_providerAccountId_key unique (provider, "providerAccountId"),
  constraint Account_userId_fkey foreign KEY ("userId") references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public."Session" (
  id text not null,
  "sessionToken" text not null,
  "userId" text not null,
  expires timestamp without time zone not null,
  constraint Session_pkey primary key (id),
  constraint Session_sessionToken_key unique ("sessionToken"),
  constraint Session_userId_fkey foreign KEY ("userId") references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.announcements (
  id uuid not null default extensions.uuid_generate_v4 (),
  title text not null,
  content text not null,
  type text null default 'info'::text,
  created_at timestamp with time zone null default now(),
  constraint announcements_pkey primary key (id),
  constraint announcements_type_check check (
    (
      type = any (
        array['info'::text, 'update'::text, 'reward'::text]
      )
    )
  )
) TABLESPACE pg_default;

create table public.duel_rooms (
  id uuid not null default extensions.uuid_generate_v4 (),
  code text not null,
  host_id uuid null,
  status text not null default 'WAITING'::text,
  max_players integer null default 5,
  time_limit integer null default 60,
  created_at timestamp with time zone null default now(),
  settings jsonb null default '{}'::jsonb,
  constraint duel_rooms_pkey primary key (id),
  constraint duel_rooms_code_key unique (code),
  constraint duel_rooms_status_check check (
    (
      status = any (
        array[
          'WAITING'::text,
          'STARTING'::text,
          'PLAYING'::text,
          'FINISHED'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_duel_rooms_code on public.duel_rooms using btree (code) TABLESPACE pg_default;

create table public.duel_players (
  id uuid not null default extensions.uuid_generate_v4 (),
  room_id uuid null,
  user_id uuid null,
  name text not null,
  score integer null default 0,
  is_ready boolean null default false,
  last_ping timestamp with time zone null default now(),
  finished_at timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  constraint duel_players_pkey primary key (id),
  constraint duel_players_room_id_fkey foreign KEY (room_id) references duel_rooms (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_duel_players_room_id on public.duel_players using btree (room_id) TABLESPACE pg_default;

create table public.levels (
  id text not null default (gen_random_uuid ())::text,
  title text not null,
  description text null,
  difficulty integer not null default 1,
  order_index integer not null default 0,
  icon text null,
  is_published boolean null default true,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  constraint levels_pkey primary key (id)
) TABLESPACE pg_default;

create table public.words (
  id text not null default (gen_random_uuid ())::text,
  level_id text not null,
  english text not null,
  indonesian text not null,
  example_sentence text null,
  image_url text null,
  constraint words_pkey primary key (id),
  constraint words_level_id_fkey foreign KEY (level_id) references levels (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.redeem_codes (
  id uuid not null default extensions.uuid_generate_v4 (),
  code text not null,
  reward_gems integer null default 0,
  reward_xp integer null default 0,
  max_uses integer null default 1,
  current_uses integer null default 0,
  expires_at timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  constraint redeem_codes_pkey primary key (id),
  constraint redeem_codes_code_key unique (code)
) TABLESPACE pg_default;

create table public.users (
  id text not null,
  name text null,
  email text null,
  email_verified timestamp without time zone null,
  image text null,
  total_xp integer null default 0,
  current_streak integer null default 0,
  longest_streak integer null default 0,
  last_played_at timestamp without time zone null,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
  current_vocab_phase integer null default 1,
  current_grammar_phase integer null default 1,
  vocab_count integer null default 0,
  duel_wins integer null default 0,
  total_spent integer null default 0,
  referral_code text null,
  referred_by text null,
  referral_count integer null default 0,
  claimed_milestones text[] null default '{}'::text[],
  gems integer null default 0,
  has_seen_tutorial boolean null default false,
  inventory jsonb null default '{"hint": 0, "focus": 0, "shield": 0, "booster": 0, "timefreeze": 0, "autocorrect": 0}'::jsonb,
  unlocked_achievements text[] null default '{}'::text[],
  equipped_border text null default 'default'::text,
  unlocked_borders text[] null default '{default}'::text[],
  is_admin boolean null default false,
  last_login_at timestamp with time zone null default now(),
  password text null,
  last_streak_date date null,
  is_pro boolean null default false,
  pro_until timestamp with time zone null,
  constraint users_pkey primary key (id),
  constraint users_email_key unique (email),
  constraint users_referral_code_key unique (referral_code),
  constraint users_referred_by_fkey foreign KEY (referred_by) references users (id)
) TABLESPACE pg_default;

create table public.user_redeems (
  id uuid not null default extensions.uuid_generate_v4 (),
  user_id text null,
  code_id uuid null,
  redeemed_at timestamp with time zone null default now(),
  constraint user_redeems_pkey primary key (id),
  constraint user_redeems_user_id_code_id_key unique (user_id, code_id),
  constraint user_redeems_code_id_fkey foreign KEY (code_id) references redeem_codes (id) on delete CASCADE,
  constraint user_redeems_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.user_achievements (
  id uuid not null default gen_random_uuid (),
  user_id text null,
  achievement_id text not null,
  title text not null,
  unlocked_at timestamp with time zone null default now(),
  constraint user_achievements_pkey primary key (id),
  constraint user_achievements_user_id_achievement_id_key unique (user_id, achievement_id),
  constraint user_achievements_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create table public.user_progress (
  id text not null default (gen_random_uuid ())::text,
  user_id text not null,
  level_id text not null,
  status public.ProgressStatus null default 'LOCKED'::"ProgressStatus",
  high_score integer null default 0,
  stars integer null default 0,
  updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
  score integer null default 0,
  constraint user_progress_pkey primary key (id),
  constraint user_progress_user_id_level_id_key unique (user_id, level_id),
  constraint user_progress_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_user_progress_level on public.user_progress using btree (level_id) TABLESPACE pg_default;

create table public.user_quests (
  id uuid not null default gen_random_uuid (),
  user_id text null,
  quest_id text not null,
  target integer not null,
  progress integer null default 0,
  reward_gems integer null default 100,
  status text null default 'ACTIVE'::text,
  created_at timestamp with time zone null default now(),
  constraint user_quests_pkey primary key (id),
  constraint user_quests_user_id_fkey foreign KEY (user_id) references users (id) on delete CASCADE
) TABLESPACE pg_default;

-- Admin Logs for Security V3.0
create table public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target TEXT,
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
) TABLESPACE pg_default;

create index IF not exists idx_admin_logs_admin_id ON public.admin_logs(admin_id);
create index IF not exists idx_admin_logs_timestamp ON public.admin_logs(timestamp DESC);
create index IF not exists idx_admin_logs_action ON public.admin_logs(action);

-- TRIGGERS & FUNCTIONS
create trigger trigger_update_xp
after INSERT
or
update on user_progress for EACH row
execute FUNCTION update_user_total_xp ();

create trigger on_auth_user_created BEFORE INSERT on users for EACH row
execute FUNCTION handle_new_user ();

create trigger on_user_created BEFORE INSERT on users for EACH row
execute FUNCTION handle_new_user_referral ();

create trigger trigger_generate_referral_code BEFORE INSERT on users for EACH row
execute FUNCTION generate_unique_referral_code ();

CREATE OR REPLACE FUNCTION public.increment_referral_count(user_id text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  UPDATE users 
  SET referral_count = referral_count + 1 
  WHERE id = user_id;
END;
$function$;