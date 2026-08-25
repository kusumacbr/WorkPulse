-- ====================================================================
-- WORKPULSE: COMPLETE SUPABASE PRODUCTION SCHEMA & SEED DATA
-- Copy and run this in your Supabase SQL Editor:
-- Dashboard (https://supabase.com/dashboard) -> Project -> SQL Editor -> New Query
-- ====================================================================

-- 1. Leave Requests Table with 2-Stage Approvals
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id                  TEXT PRIMARY KEY DEFAULT ('lr-' || substr(md5(random()::text), 1, 8)),
  employee_id         TEXT NOT NULL,
  employee_name       TEXT NOT NULL,
  employee_email      TEXT,
  department_name     TEXT,
  department_id       TEXT,
  designation         TEXT,
  leave_type          TEXT NOT NULL DEFAULT 'CASUAL',
  start_date          DATE NOT NULL,
  end_date            DATE NOT NULL,
  days_count          NUMERIC(4,1) NOT NULL DEFAULT 1.0,
  reason              TEXT NOT NULL DEFAULT '',
  handover_notes      TEXT,
  backup_person_name  TEXT,
  remaining_balance   NUMERIC(4,1) DEFAULT 12.0,
  status              TEXT NOT NULL DEFAULT 'PENDING_TL_STAGE_1',
  tl_approver_name    TEXT,
  tl_approved_at      TIMESTAMPTZ,
  tl_comment          TEXT,
  hr_approver_name    TEXT,
  hr_approved_at      TIMESTAMPTZ,
  hr_comment          TEXT,
  rejection_reason    TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. WFH Requests Table with 2-Stage Approvals
CREATE TABLE IF NOT EXISTS public.wfh_requests (
  id                  TEXT PRIMARY KEY DEFAULT ('wfh-' || substr(md5(random()::text), 1, 8)),
  employee_id         TEXT NOT NULL,
  employee_name       TEXT NOT NULL,
  employee_email      TEXT,
  department_name     TEXT,
  department_id       TEXT,
  designation         TEXT,
  start_date          DATE NOT NULL,
  end_date            DATE NOT NULL,
  days_count          NUMERIC(4,1) NOT NULL DEFAULT 1.0,
  reason              TEXT NOT NULL DEFAULT '',
  availability_hours  TEXT,
  contact_method      TEXT,
  planned_deliverables TEXT,
  status              TEXT NOT NULL DEFAULT 'PENDING_TL_STAGE_1',
  tl_approver_name    TEXT,
  tl_approved_at      TIMESTAMPTZ,
  tl_comment          TEXT,
  hr_approver_name    TEXT,
  hr_approved_at      TIMESTAMPTZ,
  hr_comment          TEXT,
  rejection_reason    TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Workdays Daily Telemetry Table (SOD & EOD Submissions)
CREATE TABLE IF NOT EXISTS public.workdays (
  id                  TEXT PRIMARY KEY DEFAULT ('wd-' || substr(md5(random()::text), 1, 8)),
  employee_id         TEXT NOT NULL,
  employee_name       TEXT NOT NULL,
  department_name     TEXT,
  date                DATE NOT NULL DEFAULT CURRENT_DATE,
  work_mode           TEXT DEFAULT 'OFFICE',
  sod_status          TEXT DEFAULT 'PENDING',
  sod_time            TEXT,
  eod_status          TEXT DEFAULT 'PENDING',
  eod_time            TEXT,
  planned_tasks       JSONB DEFAULT '[]'::jsonb,
  overall_progress    NUMERIC(5,2) DEFAULT 0,
  actual_hours        NUMERIC(4,2) DEFAULT 0,
  achievements        TEXT,
  blockers            TEXT,
  tomorrow_focus      TEXT,
  lead_feedback_note  TEXT,
  lead_feedback_time  TEXT,
  lead_rating         NUMERIC(3,1),
  lead_sentiment      TEXT,
  lead_action_item    TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Biometric Punches Table
CREATE TABLE IF NOT EXISTS public.biometric_punches (
  id                  TEXT PRIMARY KEY DEFAULT ('punch-' || substr(md5(random()::text), 1, 10)),
  employee_id         TEXT NOT NULL,
  employee_name       TEXT,
  punch_time          TIMESTAMPTZ NOT NULL DEFAULT now(),
  punch_type          TEXT NOT NULL DEFAULT 'IN',
  terminal_id         TEXT DEFAULT 'HQ-GATE-01',
  location            TEXT DEFAULT 'Bangalore HQ',
  method              TEXT DEFAULT 'BIOMETRIC',
  status              TEXT DEFAULT 'VERIFIED',
  raw_payload         JSONB DEFAULT '{}'::jsonb,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Regularization Requests Table
CREATE TABLE IF NOT EXISTS public.regularization_requests (
  id                  TEXT PRIMARY KEY DEFAULT ('reg-' || substr(md5(random()::text), 1, 10)),
  employee_id         TEXT NOT NULL,
  employee_name       TEXT NOT NULL,
  department_name     TEXT,
  designation         TEXT,
  date                DATE NOT NULL DEFAULT CURRENT_DATE,
  punch_type          TEXT NOT NULL DEFAULT 'MISSED_IN',
  actual_time         TEXT NOT NULL,
  reason              TEXT NOT NULL,
  lead_recommendation TEXT,
  status              TEXT NOT NULL DEFAULT 'PENDING',
  action_by           TEXT,
  action_at           TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Lead Feedbacks Table
CREATE TABLE IF NOT EXISTS public.feedbacks (
  id                  TEXT PRIMARY KEY DEFAULT ('fb-' || substr(md5(random()::text), 1, 10)),
  employee_id         TEXT NOT NULL,
  employee_name       TEXT NOT NULL,
  lead_id             TEXT NOT NULL,
  lead_name           TEXT NOT NULL,
  date                DATE NOT NULL DEFAULT CURRENT_DATE,
  rating              NUMERIC(3,1) NOT NULL DEFAULT 5.0,
  sentiment           TEXT NOT NULL DEFAULT 'EXCELLENT',
  notes               TEXT NOT NULL,
  action_item         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS and add public access policies
ALTER TABLE public.leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wfh_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workdays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biometric_punches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regularization_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow all access to leave_requests" ON public.leave_requests;
CREATE POLICY "Allow all access to leave_requests" ON public.leave_requests FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to wfh_requests" ON public.wfh_requests;
CREATE POLICY "Allow all access to wfh_requests" ON public.wfh_requests FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to workdays" ON public.workdays;
CREATE POLICY "Allow all access to workdays" ON public.workdays FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to biometric_punches" ON public.biometric_punches;
CREATE POLICY "Allow all access to biometric_punches" ON public.biometric_punches FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to regularization_requests" ON public.regularization_requests;
CREATE POLICY "Allow all access to regularization_requests" ON public.regularization_requests FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all access to feedbacks" ON public.feedbacks;
CREATE POLICY "Allow all access to feedbacks" ON public.feedbacks FOR ALL USING (true) WITH CHECK (true);

-- Seed Initial 2-Stage Approval Leaves
INSERT INTO public.leave_requests (id, employee_id, employee_name, employee_email, department_name, department_id, designation, leave_type, start_date, end_date, days_count, reason, handover_notes, backup_person_name, remaining_balance, status, tl_approver_name, tl_approved_at, tl_comment, hr_approver_name, hr_approved_at, hr_comment)
VALUES 
  ('leave-req-101', 'emp-sarah', 'Sarah Dev', 'employee.test@xorstack.com', 'Development', 'dept-development', 'Senior Backend Engineer', 'CASUAL', CURRENT_DATE, CURRENT_DATE + interval '1 day', 2.0, 'Attending Distributed Systems Summit in Hyderabad', 'Handed over PostgreSQL migration PRs to Rohit Sharma', 'Rohit Sharma (Frontend)', 11.00, 'FORWARDED_TO_HR', 'Alex Lead', now() - interval '1 hour', 'Sprint 34 deliverables on track. Recommended for Stage-2 HR approval.', NULL, NULL, NULL),
  ('leave-req-102', 'emp-rohit', 'Rohit Sharma', 'rohit.sharma@xorstack.com', 'Development', 'dept-development', 'Frontend Engineer (UI/UX)', 'CASUAL', CURRENT_DATE + interval '2 days', CURRENT_DATE + interval '2 days', 1.0, 'Personal errand and family commitment', 'All sprint UI components committed to main branch', 'Sarah Dev (Senior Backend)', 10.00, 'PENDING_TL_STAGE_1', NULL, NULL, NULL, NULL, NULL, NULL),
  ('leave-req-103', 'emp-karthik', 'Karthik Raja', 'karthik.raja@xorstack.com', 'Devops', 'dept-devops', 'DevOps & Cloud Engineer', 'PRIVILEGE', CURRENT_DATE - interval '5 days', CURRENT_DATE - interval '3 days', 3.0, 'Annual privilege leave for family vacation', 'All cloud monitoring alerts routed to Marcus Vance', 'Marcus Vance (DevOps Lead)', 11.50, 'APPROVED', 'Marcus Vance', now() - interval '6 days', 'Approved by Team Lead', 'Rachel HR', now() - interval '5 days', 'Final HR sign-off granted.'),
  ('leave-req-104', 'emp-sneha', 'Sneha Kapoor', 'sneha.kapoor@xorstack.com', 'Data processing', 'dept-data-processing', 'Data Analytics Engineer', 'CASUAL', CURRENT_DATE + interval '3 days', CURRENT_DATE + interval '3 days', 1.0, 'Medical health checkup appointment', 'Handed over pipeline monitoring scripts to Vikram Rao', 'Vikram Rao (Data Lead)', 9.00, 'FORWARDED_TO_HR', 'Vikram Rao', now() - interval '2 hours', 'Recommended for Stage-2 HR sign-off.', NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- Seed Initial WFH Requests
INSERT INTO public.wfh_requests (id, employee_id, employee_name, employee_email, department_name, department_id, designation, start_date, end_date, days_count, reason, availability_hours, contact_method, planned_deliverables, status, tl_approver_name, tl_approved_at, tl_comment, hr_approver_name, hr_approved_at, hr_comment)
VALUES
  ('wfh-req-201', 'emp-sarah', 'Sarah Dev', 'employee.test@xorstack.com', 'Development', 'dept-development', 'Senior Backend Engineer', CURRENT_DATE + interval '3 days', CURRENT_DATE + interval '3 days', 1.0, 'High-focus deep work for offline biometric cache tests', '10:00 AM – 07:00 PM', 'Slack @sarah & Zoom', 'Complete vitest test coverage assertions on biometric offline queue', 'FORWARDED_TO_HR', 'Alex Lead', now() - interval '2 hours', 'Approved for Stage-2 HR review.', NULL, NULL, NULL),
  ('wfh-req-202', 'emp-rohit', 'Rohit Sharma', 'rohit.sharma@xorstack.com', 'Development', 'dept-development', 'Frontend Engineer (UI/UX)', CURRENT_DATE + interval '2 days', CURRENT_DATE + interval '2 days', 1.0, 'Quiet focus environment for mobile responsive drawer animations', '10:00 AM – 07:00 PM', 'Slack @rohit & Zoom', 'Implement CSS transition optimizations across mobile viewports.', 'PENDING_TL_STAGE_1', NULL, NULL, NULL, NULL, NULL, NULL),
  ('wfh-req-203', 'emp-ananya', 'Ananya Sen', 'ananya.sen@xorstack.com', 'Service Providers (ConfigTap)', 'dept-configtap', 'Automation & Embedded QA Engineer', CURRENT_DATE - interval '1 day', CURRENT_DATE, 2.0, 'Embedded device firmware bench testing in home lab', '10:00 AM – 07:00 PM', 'Slack @ananya & Meet', 'Automated regression test suite runs on Matrix biometric hardware.', 'APPROVED', 'Alex Lead', now() - interval '2 days', 'Approved for remote bench testing.', 'Rachel HR', now() - interval '2 days', 'Stage-2 HR sign-off granted.')
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Workday SOD/EOD Telemetry
INSERT INTO public.workdays (id, employee_id, employee_name, department_name, date, work_mode, sod_status, sod_time, eod_status, eod_time, overall_progress, actual_hours, achievements, blockers, tomorrow_focus, planned_tasks)
VALUES
  ('wd-sarah-today', 'emp-sarah', 'Sarah Dev', 'Development', CURRENT_DATE, 'OFFICE', 'SUBMITTED', '10:15 AM', 'IN_PROGRESS', NULL, 80, 8.2, 'Merged authorization enhancements and reviewed 3 critical PRs.', 'None', 'Finalize EOD wrap-up testing suite.', '[{"id":"st-1","title":"Implement dedicated SOD Carryover section with rolled-over task pile-up","project":"Frontend & UI","priority":"HIGH","estimatedMinutes":180,"completionPercentage":80,"status":"IN_PROGRESS","expectedOutput":"Complete SOD section with carryover deck and morning lock action"},{"id":"st-2","title":"Conduct technical code review on Stage-2 Leave & HR approval PRs","project":"Core Platform","priority":"MEDIUM","estimatedMinutes":90,"completionPercentage":100,"status":"COMPLETED","expectedOutput":"Provide sign-off and merge authorization layer changes"}]'::jsonb),
  ('wd-rohit-today', 'emp-rohit', 'Rohit Sharma', 'Development', CURRENT_DATE, 'OFFICE', 'SUBMITTED', '10:20 AM', 'IN_PROGRESS', NULL, 65, 8.0, 'Shipped PageTransition & AnimatedTabContent components.', 'None', 'Optimize mobile viewport responsiveness.', '[{"id":"rt-1","title":"Design 3D interactive glassmorphism cards and smooth Framer Motion transitions","project":"Frontend & UI","priority":"HIGH","estimatedMinutes":240,"completionPercentage":70,"status":"IN_PROGRESS","expectedOutput":"Smooth page transition component across all views"},{"id":"rt-2","title":"Fix dark mode contrast tokens for secondary badges","project":"Design System","priority":"LOW","estimatedMinutes":60,"completionPercentage":60,"status":"IN_PROGRESS","expectedOutput":"WCAG AAA accessible contrast"}]'::jsonb),
  ('wd-priya-today', 'emp-priya', 'Priya QA', 'R & D', CURRENT_DATE, 'WFH', 'SUBMITTED', '10:05 AM', 'SUBMITTED', '06:55 PM', 100, 8.5, '85/85 unit tests and Playwright regressions green across all suites.', 'None', 'Prepare automated performance benchmarks.', '[{"id":"pt-1","title":"Automate Playwright end-to-end regression test suite for biometric sync","project":"Quality Assurance","priority":"HIGH","estimatedMinutes":180,"completionPercentage":100,"status":"COMPLETED","expectedOutput":"17 test suites passing in CI/CD pipeline"},{"id":"pt-2","title":"Verify RBAC permission boundary tests for HR Stage-2 leave approvals","project":"Security & Auth","priority":"HIGH","estimatedMinutes":120,"completionPercentage":100,"status":"COMPLETED","expectedOutput":"Zero regression leaks on permission elevation"}]'::jsonb),
  ('wd-karthik-today', 'emp-karthik', 'Karthik Raja', 'Devops', CURRENT_DATE, 'OFFICE', 'SUBMITTED', '10:10 AM', 'IN_PROGRESS', NULL, 90, 8.1, 'Automated CI/CD build cache pruning and verified Kubernetes health.', 'None', 'Execute quarterly disaster recovery drill.', '[{"id":"kt-1","title":"Optimize Docker image build caches and reduce pipeline duration","project":"Infrastructure","priority":"HIGH","estimatedMinutes":180,"completionPercentage":100,"status":"COMPLETED","expectedOutput":"Build time reduced by 40%"},{"id":"kt-2","title":"Configure Prometheus alerting rules for Supabase connection pool latency","project":"Observability","priority":"MEDIUM","estimatedMinutes":120,"completionPercentage":80,"status":"IN_PROGRESS","expectedOutput":"Alert triggers under 200ms"}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Biometric Punches
INSERT INTO public.biometric_punches (id, employee_id, employee_name, punch_time, punch_type, terminal_id, location, method, status)
VALUES
  ('punch-101', 'emp-sarah', 'Sarah Dev', now() - interval '3 hours', 'IN', 'HQ-TERMINAL-01', 'Bangalore HQ (Floor 4, Pod B)', 'BIOMETRIC', 'VERIFIED'),
  ('punch-102', 'emp-rohit', 'Rohit Sharma', now() - interval '2 hours 55 minutes', 'IN', 'HQ-TERMINAL-01', 'Bangalore HQ (Floor 4, Pod B)', 'BIOMETRIC', 'VERIFIED'),
  ('punch-103', 'emp-karthik', 'Karthik Raja', now() - interval '3 hours 5 minutes', 'IN', 'HQ-TERMINAL-02', 'Bangalore HQ (Floor 3, Cloud Ops)', 'BIOMETRIC', 'VERIFIED'),
  ('punch-104', 'emp-sneha', 'Sneha Kapoor', now() - interval '2 hours 50 minutes', 'IN', 'HQ-TERMINAL-02', 'Bangalore HQ (Floor 3, Data Lab)', 'BIOMETRIC', 'VERIFIED'),
  ('punch-105', 'emp-ananya', 'Ananya Sen', now() - interval '3 hours 10 minutes', 'IN', 'HQ-TERMINAL-01', 'Bangalore HQ (Floor 1, Embedded Hub)', 'BIOMETRIC', 'VERIFIED')
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Regularization Requests
INSERT INTO public.regularization_requests (id, employee_id, employee_name, department_name, designation, date, punch_type, actual_time, reason, lead_recommendation, status, action_by, action_at)
VALUES
  ('reg-301', 'emp-rohit', 'Rohit Sharma', 'Development', 'Frontend Engineer (UI/UX)', CURRENT_DATE - interval '1 day', 'MISSED_OUT', '07:15 PM', 'Biometric terminal gate 1 was offline during evening exit', 'Verified working at desk until 07:20 PM', 'PENDING', NULL, NULL),
  ('reg-302', 'emp-karthik', 'Karthik Raja', 'Devops', 'DevOps & Cloud Engineer', CURRENT_DATE - interval '2 days', 'MISSED_IN', '10:05 AM', 'Smart card re-issue in progress at security reception desk', 'Verified morning attendance on Slack', 'APPROVED', 'Marcus Vance', now() - interval '1 day'),
  ('reg-303', 'emp-sneha', 'Sneha Kapoor', 'Data processing', 'Data Analytics Engineer', CURRENT_DATE - interval '1 day', 'MISSED_IN', '09:55 AM', 'Client stakeholder sync meeting before checking into HQ floor', 'Client meeting pre-scheduled and approved', 'APPROVED', 'Vikram Rao', now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;

-- Seed Initial Lead Feedbacks
INSERT INTO public.feedbacks (id, employee_id, employee_name, lead_id, lead_name, date, rating, sentiment, notes, action_item)
VALUES
  ('fb-401', 'emp-sarah', 'Sarah Dev', 'lead-alex', 'Alex Lead', CURRENT_DATE, 5.0, 'EXCELLENT', 'Exceptional architecture design on PostgreSQL connection pooling and 2-stage leave workflow.', 'Coordinate PR review with frontend team on Stage-2 sign-off'),
  ('fb-402', 'emp-rohit', 'Rohit Sharma', 'lead-alex', 'Alex Lead', CURRENT_DATE, 4.8, 'GREAT', 'Great progress on 3D interactive dashboard decks and WCAG AAA contrast tokens.', 'Finalize mobile responsive drawer component optimization'),
  ('fb-403', 'emp-karthik', 'Karthik Raja', 'lead-marcus', 'Marcus Vance', CURRENT_DATE, 5.0, 'EXCELLENT', 'Zero downtime deployment pipeline executed smoothly and automated cache cleanups verified.', 'Document SRE runbook updates for on-call engineers'),
  ('fb-404', 'emp-sneha', 'Sneha Kapoor', 'lead-vikram', 'Vikram Rao', CURRENT_DATE, 4.9, 'EXCELLENT', 'Data telemetry aggregation queries running efficiently with under 100ms response time.', 'Prepare executive headcount analytics export for Rachel HR')
ON CONFLICT (id) DO NOTHING;
