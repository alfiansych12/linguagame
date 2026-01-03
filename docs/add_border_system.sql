-- 🎨 BORDER SYSTEM MIGRATION --
-- Run this in Supabase SQL Editor to add border fields

-- Add border fields to users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS equipped_border TEXT DEFAULT 'default',
ADD COLUMN IF NOT EXISTS unlocked_borders TEXT[] DEFAULT '{default}';

-- Update existing users to have default border
UPDATE public.users 
SET equipped_border = 'default', 
    unlocked_borders = '{default}' 
WHERE equipped_border IS NULL;

-- Optional: Give all admins the gold_champion border unlocked
-- UPDATE public.users 
-- SET unlocked_borders = array_append(unlocked_borders, 'gold_champion'),
--     equipped_border = 'gold_champion'
-- WHERE email LIKE '%admin%' OR name LIKE '%admin%';
