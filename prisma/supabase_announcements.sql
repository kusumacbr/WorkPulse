-- ====================================================================
-- WORKPULSE: OFFICIAL ANNOUNCEMENTS & CULTURE NOTICES SCHEMA
-- Run this in your Supabase SQL Editor if you wish to provision dedicated tables:
-- Dashboard -> SQL Editor -> New Query
-- ====================================================================

-- 1. Official Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
  id                      TEXT PRIMARY KEY DEFAULT ('anc-' || substr(md5(random()::text), 1, 8)),
  title                   TEXT NOT NULL,
  body                    TEXT NOT NULL,
  category                TEXT NOT NULL DEFAULT 'COMPANY_NEWS' CHECK (category IN ('COMPANY_NEWS', 'FESTIVAL', 'POLICY', 'EMERGENCY', 'GENERAL')),
  priority                TEXT NOT NULL DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
  audience_type           TEXT NOT NULL DEFAULT 'ALL',
  audience_target_id      TEXT,
  publish_date            TIMESTAMPTZ NOT NULL DEFAULT now(),
  expiry_date             DATE,
  attachment_url          TEXT,
  author_name             TEXT NOT NULL DEFAULT 'People Operations',
  author_id               TEXT,
  acknowledgement_required BOOLEAN NOT NULL DEFAULT false,
  acknowledged_by         JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
DROP POLICY IF EXISTS "Allow all access to announcements" ON public.announcements;
CREATE POLICY "Allow all access to announcements"
  ON public.announcements FOR ALL
  USING (true)
  WITH CHECK (true);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_announcements_publish_date ON public.announcements (publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON public.announcements (priority);

-- 2. Seed Initial Notices
INSERT INTO public.announcements (id, title, body, category, priority, author_name, acknowledgement_required, acknowledged_by, publish_date)
VALUES
  (
    'anc-1',
    'Q3 2026 Engineering All-Hands Showcase',
    'All teams gather on Friday, August 28th for sprint demos and quarterly milestone reviews. Presentation links have been shared on Slack.',
    'COMPANY_NEWS',
    'HIGH',
    'David Director',
    true,
    '[]'::jsonb,
    now() - interval '2 days'
  ),
  (
    'anc-2',
    'Diwali Celebration & Holiday Schedule',
    'Diwali festive celebration schedule has been published. Please review your holiday calendar and coordinate shift handovers with your team leads.',
    'FESTIVAL',
    'HIGH',
    'Rachel HR',
    false,
    '["emp-sarah", "hr-rachel"]'::jsonb,
    now() - interval '4 days'
  ),
  (
    'anc-3',
    'POSH 2026 Annual Compliance Notice',
    'Corporate policy update covering respectful workplace practices, POSH cell contacts, and grievance reporting procedures for hybrid teams.',
    'POLICY',
    'HIGH',
    'Rachel HR',
    true,
    '["emp-sarah", "hr-rachel", "emp-rohit"]'::jsonb,
    now() - interval '7 days'
  ),
  (
    'anc-4',
    'Upcoming Cultural Festival Holiday',
    'Please plan sprint deliverables ahead of the upcoming regional festival holidays. On-call rosters will be managed by Marcus Vance.',
    'FESTIVAL',
    'NORMAL',
    'Rachel HR',
    false,
    '["emp-sarah"]'::jsonb,
    now() - interval '10 days'
  )
ON CONFLICT (id) DO NOTHING;
