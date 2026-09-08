-- ====================================================================
-- WORKPULSE: SOD & EOD SEPARATION TABLES
-- Copy and run this in your Supabase SQL Editor
-- ====================================================================

-- 1. SOD Submissions Table
CREATE TABLE IF NOT EXISTS public.sod_submissions (
  id                  TEXT PRIMARY KEY DEFAULT ('sod-' || substr(md5(random()::text), 1, 8)),
  employee_id         TEXT NOT NULL,
  employee_name       TEXT NOT NULL,
  date                DATE NOT NULL DEFAULT CURRENT_DATE,
  sod_time            TEXT,
  status              TEXT DEFAULT 'SUBMITTED',
  verified_by         TEXT,
  verified_at         TEXT,
  notes               TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. EOD Submissions Table
CREATE TABLE IF NOT EXISTS public.eod_submissions (
  id                  TEXT PRIMARY KEY DEFAULT ('eod-' || substr(md5(random()::text), 1, 8)),
  employee_id         TEXT NOT NULL,
  employee_name       TEXT NOT NULL,
  date                DATE NOT NULL DEFAULT CURRENT_DATE,
  eod_time            TEXT,
  status              TEXT DEFAULT 'SUBMITTED',
  achievements        TEXT,
  blockers            TEXT,
  tomorrow_focus      TEXT,
  verified_by         TEXT,
  verified_at         TEXT,
  rating              NUMERIC(3,1),
  sentiment           TEXT,
  comments            TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Daily Tasks Table (Syncs perfectly across Lead and Employee views)
CREATE TABLE IF NOT EXISTS public.daily_tasks (
  id                  TEXT PRIMARY KEY DEFAULT ('tsk-' || substr(md5(random()::text), 1, 8)),
  employee_id         TEXT NOT NULL,
  date                DATE NOT NULL DEFAULT CURRENT_DATE,
  title               TEXT NOT NULL,
  category            TEXT DEFAULT 'General',
  priority            TEXT DEFAULT 'MEDIUM',
  status              TEXT DEFAULT 'NOT_STARTED',
  progress            NUMERIC(4,1) DEFAULT 0,
  assigned_by         TEXT,
  assigned_at         TEXT,
  acknowledged        BOOLEAN DEFAULT false,
  acknowledgement_note TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.sod_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eod_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

-- Add open public policies for seamless integration
DROP POLICY IF EXISTS "Allow all access to sod_submissions" ON public.sod_submissions;
CREATE POLICY "Allow all access to sod_submissions" ON public.sod_submissions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to eod_submissions" ON public.eod_submissions;
CREATE POLICY "Allow all access to eod_submissions" ON public.eod_submissions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to daily_tasks" ON public.daily_tasks;
CREATE POLICY "Allow all access to daily_tasks" ON public.daily_tasks FOR ALL USING (true) WITH CHECK (true);
