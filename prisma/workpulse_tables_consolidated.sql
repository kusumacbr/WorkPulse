-- ====================================================================
-- WORKPULSE COMPLETE SUPABASE CONSOLIDATED TABLES SCHEMA
-- Run this in your Supabase SQL Editor:
-- Supabase Dashboard -> SQL Editor -> New Query -> Paste & Click Run
-- ====================================================================

-- 1. NOTIFICATIONS TABLE (HR broadcasts & alerts)
CREATE TABLE IF NOT EXISTS public.notifications (
  id                  TEXT PRIMARY KEY DEFAULT ('notif-' || gen_random_uuid()::text),
  user_id             TEXT NOT NULL DEFAULT 'all',  -- 'all' for company broadcast, or specific employee_id
  actor_id            TEXT,                         -- broadcaster / sender id (e.g. 'hr-rachel')
  announcement_id     TEXT,                         -- linked announcement id if any
  type                TEXT NOT NULL DEFAULT 'GENERAL',
  title               TEXT NOT NULL,
  message             TEXT NOT NULL,
  link_url            TEXT,
  read                BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. NOTIFICATION READS TABLE (Tracks permanent per-user read status)
CREATE TABLE IF NOT EXISTS public.notification_reads (
  id                  TEXT PRIMARY KEY DEFAULT ('nr-' || gen_random_uuid()::text),
  notification_id     TEXT NOT NULL,
  user_id             TEXT NOT NULL,
  read_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(notification_id, user_id)
);

-- 3. NOTIFICATION DELETES TABLE (Tracks permanent per-user delete status for broadcasts)
CREATE TABLE IF NOT EXISTS public.notification_deletes (
  id                  TEXT PRIMARY KEY DEFAULT ('nd-' || gen_random_uuid()::text),
  notification_id     TEXT NOT NULL,
  user_id             TEXT NOT NULL,
  deleted_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(notification_id, user_id)
);

-- 4. ASSIGNED TASKS TABLE (Lead work assignment & live acknowledgements)
CREATE TABLE IF NOT EXISTS public.assigned_tasks (
  id                     TEXT PRIMARY KEY DEFAULT ('atask-' || gen_random_uuid()::text),
  title                  TEXT NOT NULL,
  category               TEXT NOT NULL DEFAULT 'General',
  priority               TEXT NOT NULL DEFAULT 'MEDIUM',
  status                 TEXT NOT NULL DEFAULT 'NOT_STARTED',
  progress               INTEGER NOT NULL DEFAULT 0,
  assigned_by            TEXT NOT NULL,
  assigned_by_id         TEXT,
  target_employee_id     TEXT NOT NULL,
  target_employee_name   TEXT,
  target_employee_email  TEXT,
  acknowledged           BOOLEAN NOT NULL DEFAULT false,
  acknowledged_at        TEXT,
  acknowledgement_note   TEXT,
  assigned_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. LEAD TASKS TABLE (Team lead personal tasks & priorities)
CREATE TABLE IF NOT EXISTS public.lead_tasks (
  id                     TEXT PRIMARY KEY DEFAULT ('lt-' || gen_random_uuid()::text),
  lead_id                TEXT NOT NULL,
  title                  TEXT NOT NULL,
  category               TEXT NOT NULL DEFAULT 'Code Review',
  priority               TEXT NOT NULL DEFAULT 'MEDIUM',
  status                 TEXT NOT NULL DEFAULT 'NOT_STARTED',
  progress               INTEGER NOT NULL DEFAULT 0,
  time_slot              TEXT NOT NULL DEFAULT 'Today',
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. GOALS & OKRS TABLE (Personal and team quarterly objectives)
CREATE TABLE IF NOT EXISTS public.goals (
  id                     TEXT PRIMARY KEY DEFAULT ('goal-' || gen_random_uuid()::text),
  employee_id            TEXT NOT NULL,
  title                  TEXT NOT NULL,
  description            TEXT,
  category               TEXT NOT NULL DEFAULT 'Operations',
  progress               INTEGER NOT NULL DEFAULT 0,
  status                 TEXT NOT NULL DEFAULT 'IN_PROGRESS',
  target_date            TEXT NOT NULL DEFAULT 'This Month',
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. BIOMETRIC PUNCHES TABLE (Real-time physical & virtual biometric punches)
CREATE TABLE IF NOT EXISTS public.biometric_punches (
  id                     TEXT PRIMARY KEY DEFAULT ('punch-' || gen_random_uuid()::text),
  employee_id            TEXT NOT NULL,
  employee_name          TEXT,
  punch_time             TIMESTAMPTZ NOT NULL DEFAULT now(),
  punch_type             TEXT NOT NULL, -- 'IN' or 'OUT'
  terminal_id            TEXT DEFAULT 'TERM-BLR-01',
  location               TEXT DEFAULT 'Bangalore HQ',
  method                 TEXT DEFAULT 'BIOMETRIC',
  status                 TEXT DEFAULT 'VERIFIED',
  raw_payload            JSONB DEFAULT '{}'::jsonb,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_reads_user ON public.notification_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_assigned_tasks_target ON public.assigned_tasks(target_employee_id);
CREATE INDEX IF NOT EXISTS idx_assigned_tasks_lead ON public.assigned_tasks(assigned_by_id);
CREATE INDEX IF NOT EXISTS idx_lead_tasks_lead ON public.lead_tasks(lead_id);
CREATE INDEX IF NOT EXISTS idx_goals_employee ON public.goals(employee_id);
CREATE INDEX IF NOT EXISTS idx_biometric_punches_emp ON public.biometric_punches(employee_id, punch_time DESC);

-- Enable RLS & open policies for service role & authenticated API
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_deletes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assigned_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometric_punches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to notifications" ON public.notifications;
CREATE POLICY "Allow all access to notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to notification_reads" ON public.notification_reads;
CREATE POLICY "Allow all access to notification_reads" ON public.notification_reads FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to notification_deletes" ON public.notification_deletes;
CREATE POLICY "Allow all access to notification_deletes" ON public.notification_deletes FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to assigned_tasks" ON public.assigned_tasks;
CREATE POLICY "Allow all access to assigned_tasks" ON public.assigned_tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to lead_tasks" ON public.lead_tasks;
CREATE POLICY "Allow all access to lead_tasks" ON public.lead_tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to goals" ON public.goals;
CREATE POLICY "Allow all access to goals" ON public.goals FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to biometric_punches" ON public.biometric_punches;
CREATE POLICY "Allow all access to biometric_punches" ON public.biometric_punches FOR ALL USING (true) WITH CHECK (true);

-- Grant privileges
GRANT ALL ON TABLE public.notifications TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.notification_reads TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.notification_deletes TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.assigned_tasks TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.lead_tasks TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.goals TO anon, authenticated, service_role;
GRANT ALL ON TABLE public.biometric_punches TO anon, authenticated, service_role;
