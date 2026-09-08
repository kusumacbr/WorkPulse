-- ====================================================================
-- WORKPULSE: ALL NEW TABLES (Run in Supabase SQL Editor)
-- Includes: notifications, goals, biometric_punches, assigned_tasks, lead_tasks
-- ====================================================================

-- 1. Notifications Table (HR broadcasts + system notifications)
CREATE TABLE IF NOT EXISTS public.notifications (
  id                  TEXT PRIMARY KEY DEFAULT ('notif-' || gen_random_uuid()::text),
  user_id             TEXT NOT NULL DEFAULT 'all',
  actor_id            TEXT,
  announcement_id     TEXT,
  type                TEXT NOT NULL DEFAULT 'GENERAL',
  title               TEXT NOT NULL,
  message             TEXT NOT NULL,
  link_url            TEXT,
  read                BOOLEAN NOT NULL DEFAULT false,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);

-- 2. User Notification Read Status (per-user read tracking)
CREATE TABLE IF NOT EXISTS public.notification_reads (
  id                  TEXT PRIMARY KEY DEFAULT ('nr-' || gen_random_uuid()::text),
  notification_id     TEXT NOT NULL,
  user_id             TEXT NOT NULL,
  read_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(notification_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_notification_reads_user ON public.notification_reads(user_id);

-- 3. Goals / OKRs Table
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

CREATE INDEX IF NOT EXISTS idx_goals_employee_id ON public.goals(employee_id);

-- 4. Biometric Punches Table (real-time punch in/out)
CREATE TABLE IF NOT EXISTS public.biometric_punches (
  id                  TEXT PRIMARY KEY DEFAULT ('punch-' || gen_random_uuid()::text),
  employee_id         TEXT NOT NULL,
  employee_email      TEXT,
  punch_type          TEXT NOT NULL CHECK (punch_type IN ('IN', 'OUT')),
  punch_time          TIMESTAMPTZ NOT NULL DEFAULT now(),
  terminal_id         TEXT DEFAULT 'TERM-BLR-01',
  work_mode           TEXT DEFAULT 'OFFICE',
  date                DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_punches_employee ON public.biometric_punches(employee_id);
CREATE INDEX IF NOT EXISTS idx_punches_date ON public.biometric_punches(date);

-- 5. Assigned Tasks Table (Lead assigns work to employees)
CREATE TABLE IF NOT EXISTS public.assigned_tasks (
  id                  TEXT PRIMARY KEY DEFAULT ('atask-' || substr(md5(random()::text), 1, 8)),
  title               TEXT NOT NULL,
  category            TEXT DEFAULT 'General',
  priority            TEXT DEFAULT 'MEDIUM',
  status              TEXT DEFAULT 'NOT_STARTED',
  progress            NUMERIC(4,1) DEFAULT 0,
  assigned_by         TEXT NOT NULL,
  assigned_by_id      TEXT,
  assigned_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  target_employee_id  TEXT NOT NULL,
  target_employee_name TEXT,
  target_employee_email TEXT,
  acknowledged        BOOLEAN DEFAULT false,
  acknowledged_at     TIMESTAMPTZ,
  acknowledgement_note TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assigned_tasks_target ON public.assigned_tasks(target_employee_id);
CREATE INDEX IF NOT EXISTS idx_assigned_tasks_assigned_by ON public.assigned_tasks(assigned_by_id);

-- 6. Lead Personal Tasks Table
CREATE TABLE IF NOT EXISTS public.lead_tasks (
  id                  TEXT PRIMARY KEY DEFAULT ('lt-' || substr(md5(random()::text), 1, 8)),
  lead_id             TEXT NOT NULL,
  title               TEXT NOT NULL,
  category            TEXT DEFAULT 'Code Review',
  priority            TEXT DEFAULT 'MEDIUM',
  status              TEXT DEFAULT 'NOT_STARTED',
  progress            NUMERIC(4,1) DEFAULT 0,
  time_slot           TEXT DEFAULT 'Today',
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_lead_tasks_lead_id ON public.lead_tasks(lead_id);

-- Enable RLS on all tables
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometric_punches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assigned_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_tasks ENABLE ROW LEVEL SECURITY;

-- Open policies for service-role access
DROP POLICY IF EXISTS "Allow all access to notifications" ON public.notifications;
CREATE POLICY "Allow all access to notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to notification_reads" ON public.notification_reads;
CREATE POLICY "Allow all access to notification_reads" ON public.notification_reads FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to goals" ON public.goals;
CREATE POLICY "Allow all access to goals" ON public.goals FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to biometric_punches" ON public.biometric_punches;
CREATE POLICY "Allow all access to biometric_punches" ON public.biometric_punches FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to assigned_tasks" ON public.assigned_tasks;
CREATE POLICY "Allow all access to assigned_tasks" ON public.assigned_tasks FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to lead_tasks" ON public.lead_tasks;
CREATE POLICY "Allow all access to lead_tasks" ON public.lead_tasks FOR ALL USING (true) WITH CHECK (true);
