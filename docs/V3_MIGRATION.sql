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

-- Only admins can view logs
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
-- Add streak tracking column
-- ============================================

-- Add last_streak_date column if not exists
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS last_streak_date DATE;

-- Create index for streak queries
CREATE INDEX IF NOT EXISTS idx_users_last_streak_date 
ON public.users(last_streak_date);

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

-- Check users table for new column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name = 'last_streak_date';

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT 'V3.0 Security Tables Created Successfully! 🛡️' AS status;
