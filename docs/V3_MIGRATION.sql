-- ============================================
-- V3.0 SECURITY TABLES
-- Admin Logs & Security Tracking
-- ============================================

-- Table: admin_logs
-- Purpose: Track all admin security actions (IP blacklisting, user bans, etc)
CREATE TABLE IF NOT EXISTS public.admin_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    action TEXT NOT NULL,
    target TEXT,
    details TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON public.admin_logs(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_timestamp ON public.admin_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_admin_logs_action ON public.admin_logs(action);

-- RLS Policies
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view all logs
CREATE POLICY "Admins can view all logs"
    ON public.admin_logs
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()::text
            AND users.is_admin = true
        )
    );

-- Only admins can insert logs
CREATE POLICY "Admins can insert logs"
    ON public.admin_logs
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()::text
            AND users.is_admin = true
        )
    );

-- ============================================
-- UPDATE USERS TABLE FOR V3.0
-- Add streak tracking and PRO columns
-- ============================================

-- Add last_streak_date column if not exists
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_streak_date DATE;

-- Add PRO columns
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pro_until TIMESTAMPTZ;

-- Create index for streak queries
CREATE INDEX IF NOT EXISTS idx_users_last_streak_date 
ON public.users(last_streak_date);

-- Create index for PRO queries
CREATE INDEX IF NOT EXISTS idx_users_pro_status 
ON public.users(is_pro, pro_until);

-- COMMENT
COMMENT ON COLUMN users.is_pro IS 'Indicates if user has active PRO subscription';
COMMENT ON COLUMN users.pro_until IS 'Expiration date of PRO subscription';


-- ============================================
-- VERIFICATION QUERIES
-- Run these to verify tables were created
-- ============================================

-- Check admin_logs table
SELECT 
    table_name, 
    column_name, 
    data_type 
FROM information_schema.columns 
WHERE table_name = 'admin_logs' 
ORDER BY ordinal_position;

-- Check users table for new columns
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('last_streak_date', 'is_pro', 'pro_until');

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'V3.0 Security & PRO Tables Updated Successfully! 🛡️💎' AS status;
