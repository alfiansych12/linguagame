-- ============================================
-- MIGRATION: Add PRO Membership Columns
-- Version: v3.4 (Quantum PRO Update)
-- Date: 2026-01-02
-- ============================================

-- Add PRO status columns to users table
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS pro_until TIMESTAMPTZ;

-- Create index for faster PRO status queries
CREATE INDEX IF NOT EXISTS idx_users_pro_status ON users(is_pro, pro_until);

-- Add comment for documentation
COMMENT ON COLUMN users.is_pro IS 'Indicates if user has active PRO subscription';
COMMENT ON COLUMN users.pro_until IS 'Expiration date of PRO subscription (NULL = lifetime)';

-- ============================================
-- VERIFICATION QUERY (Run after migration)
-- ============================================
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'users' 
-- AND column_name IN ('is_pro', 'pro_until');
