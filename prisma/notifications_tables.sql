-- ====================================================================
-- WORKPULSE: DEDICATED NOTIFICATIONS & READ RECEIPTS SCHEMA
-- Run this in your Supabase SQL Editor:
-- Supabase Dashboard -> SQL Editor -> New Query -> Run
-- ====================================================================

-- 1. Notifications Table (Stores HR broadcasts, reminders, alerts)
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

-- 2. Notification Reads Table (Tracks per-user read status permanently)
CREATE TABLE IF NOT EXISTS public.notification_reads (
  id                  TEXT PRIMARY KEY DEFAULT ('nr-' || gen_random_uuid()::text),
  notification_id     TEXT NOT NULL,
  user_id             TEXT NOT NULL,
  read_at             TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(notification_id, user_id)
);

-- 3. Notification Deletes Table (Tracks per-user deleted status for broadcasts)
CREATE TABLE IF NOT EXISTS public.notification_deletes (
  id                  TEXT PRIMARY KEY DEFAULT ('nd-' || gen_random_uuid()::text),
  notification_id     TEXT NOT NULL,
  user_id             TEXT NOT NULL,
  deleted_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(notification_id, user_id)
);

-- Indexes for ultra-fast queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_announcement ON public.notifications(announcement_id);
CREATE INDEX IF NOT EXISTS idx_notification_reads_user ON public.notification_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_reads_notif ON public.notification_reads(notification_id);
CREATE INDEX IF NOT EXISTS idx_notification_deletes_user ON public.notification_deletes(user_id);

-- Enable Row Level Security
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_deletes ENABLE ROW LEVEL SECURITY;

-- Allow unrestricted access for authenticated app services
DROP POLICY IF EXISTS "Allow all access to notifications" ON public.notifications;
CREATE POLICY "Allow all access to notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to notification_reads" ON public.notification_reads;
CREATE POLICY "Allow all access to notification_reads" ON public.notification_reads FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to notification_deletes" ON public.notification_deletes;
CREATE POLICY "Allow all access to notification_deletes" ON public.notification_deletes FOR ALL USING (true) WITH CHECK (true);

-- Initial seed notifications so all roles see active updates immediately
INSERT INTO public.notifications (id, user_id, actor_id, type, title, message, link_url, read, created_at)
VALUES
  (
    'notif-init-welcome',
    'all',
    'hr-rachel',
    'GENERAL',
    'Welcome to WorkPulse Enterprise',
    'Welcome to WorkPulse! Access your Daily SOD/EOD, Leaves, Goals, and Team Analytics from the left navigation.',
    '/dashboard',
    false,
    now() - interval '1 hour'
  ),
  (
    'notif-init-sod',
    'all',
    'system',
    'SOD_REMINDER',
    'Start-of-Day Plan Active',
    'Daily SOD submissions are open. Please submit your daily focus items and priorities before beginning your sprint tasks.',
    '/my-work',
    false,
    now() - interval '30 minutes'
  )
ON CONFLICT (id) DO NOTHING;
