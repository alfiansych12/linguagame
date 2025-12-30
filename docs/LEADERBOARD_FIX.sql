-- 📁 COPY-PASTE KE SUPABASE SQL EDITOR --

-- 0. Perbaiki Struktur Tabel (Memastikan kolom 'score' ada)
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_progress' AND column_name='score') THEN
        ALTER TABLE public.user_progress ADD COLUMN score INTEGER DEFAULT 0;
        
        -- Jika ada kolom 'high_score', pindahkan datanya ke 'score'
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='user_progress' AND column_name='high_score') THEN
            UPDATE public.user_progress SET score = high_score WHERE score = 0 OR score IS NULL;
        END IF;
    END IF;
END $$;

-- 1. Fix Fungsi Trigger update_user_total_xp
CREATE OR REPLACE FUNCTION public.update_user_total_xp() 
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.users
    SET total_xp = (
        SELECT COALESCE(SUM(score), 0) 
        FROM public.user_progress 
        WHERE user_id = NEW.user_id
    )
    WHERE id = NEW.user_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Pasang Trigger ke tabel user_progress
DROP TRIGGER IF EXISTS trigger_update_xp ON public.user_progress;

CREATE TRIGGER trigger_update_xp
AFTER INSERT OR UPDATE ON public.user_progress
FOR EACH ROW 
EXECUTE FUNCTION public.update_user_total_xp();

-- 3. Sinkronisasi Data (One-Time Execution)
UPDATE public.users u
SET total_xp = (
    SELECT COALESCE(SUM(score), 0) 
    FROM public.user_progress up
    WHERE up.user_id = u.id
);
