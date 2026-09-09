-- ====================================================================
-- WORKPULSE: GOALS & OKRS TABLE CREATION & DATA MIGRATION
-- Run in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/cqjnsznacqnzudpkgjjj/sql/new
-- ====================================================================

-- 1. Create Goals / OKRs Table
CREATE TABLE IF NOT EXISTS public.goals (
  id                  TEXT PRIMARY KEY DEFAULT ('goal-' || substr(md5(random()::text), 1, 8)),
  employee_id         TEXT NOT NULL,
  title               TEXT NOT NULL,
  description         TEXT,
  category            TEXT DEFAULT 'Operations',
  progress            NUMERIC(5,1) DEFAULT 0,
  status              TEXT DEFAULT 'IN_PROGRESS',
  target_date         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Index for high performance employee lookups
CREATE INDEX IF NOT EXISTS idx_goals_employee_id ON public.goals(employee_id);

-- 3. Row Level Security & Permissions
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to goals" ON public.goals;
CREATE POLICY "Allow all access to goals" ON public.goals FOR ALL USING (true) WITH CHECK (true);

-- 4. Migrate any existing goals from feedbacks table into public.goals
INSERT INTO public.goals (id, employee_id, title, description, category, progress, status, target_date, created_at)
SELECT 
  id, 
  employee_id, 
  action_item AS title, 
  COALESCE(notes, '') AS description, 
  lead_name AS category, 
  COALESCE(rating * 20, 0) AS progress, 
  sentiment AS status, 
  'This Month' AS target_date, 
  created_at
FROM public.feedbacks 
WHERE lead_id = 'GOAL'
ON CONFLICT (id) DO NOTHING;
