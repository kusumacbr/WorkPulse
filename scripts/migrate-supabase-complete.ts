import { Client } from "pg";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

async function getWorkingClient() {
  const connectionStrings = [
    // 1. Session / Transaction pooler on port 6543
    "postgresql://postgres.cqjnsznacqnzudpkgjjj:WorkPulse2025!Demo@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres",
    // 2. Direct host on db.cqjnsznacqnzudpkgjjj.supabase.co:5432
    "postgresql://postgres:WorkPulse2025!Demo@db.cqjnsznacqnzudpkgjjj.supabase.co:5432/postgres",
    // 3. Pooler on port 5432 with pooler user
    "postgresql://postgres.cqjnsznacqnzudpkgjjj:WorkPulse2025!Demo@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres",
  ];

  for (const cs of connectionStrings) {
    try {
      console.log("Trying connection to:", cs.split("@")[1]);
      const c = new Client({
        connectionString: cs,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
      });
      await c.connect();
      console.log(" Connected successfully to:", cs.split("@")[1]);
      return c;
    } catch (e: any) {
      console.warn("Connection attempt failed:", e.message);
    }
  }
  throw new Error("Could not connect to any Supabase PostgreSQL endpoint");
}

async function runMigration() {
  let client: Client | null = null;
  try {
    client = await getWorkingClient();

    const ddl = `
      -- 1. Leave Requests Table with 2-Stage Approvals
      CREATE TABLE IF NOT EXISTS public.leave_requests (
        id TEXT PRIMARY KEY,
        employee_id TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        employee_email TEXT,
        department_name TEXT,
        department_id TEXT,
        designation TEXT,
        leave_type TEXT NOT NULL DEFAULT 'CASUAL',
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        days_count NUMERIC(4,1) NOT NULL DEFAULT 1.0,
        reason TEXT NOT NULL DEFAULT '',
        handover_notes TEXT,
        backup_person_name TEXT,
        remaining_balance NUMERIC(4,1) DEFAULT 12.0,
        status TEXT NOT NULL DEFAULT 'PENDING_TL_STAGE_1',
        tl_approver_name TEXT,
        tl_approved_at TIMESTAMPTZ,
        tl_comment TEXT,
        hr_approver_name TEXT,
        hr_approved_at TIMESTAMPTZ,
        hr_comment TEXT,
        rejection_reason TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- 2. WFH Requests Table with 2-Stage Approvals
      CREATE TABLE IF NOT EXISTS public.wfh_requests (
        id TEXT PRIMARY KEY,
        employee_id TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        employee_email TEXT,
        department_name TEXT,
        department_id TEXT,
        designation TEXT,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        days_count NUMERIC(4,1) NOT NULL DEFAULT 1.0,
        reason TEXT NOT NULL DEFAULT '',
        availability_hours TEXT,
        contact_method TEXT,
        planned_deliverables TEXT,
        status TEXT NOT NULL DEFAULT 'PENDING_TL_STAGE_1',
        tl_approver_name TEXT,
        tl_approved_at TIMESTAMPTZ,
        tl_comment TEXT,
        hr_approver_name TEXT,
        hr_approved_at TIMESTAMPTZ,
        hr_comment TEXT,
        rejection_reason TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- 3. Workdays Daily Telemetry Table (SOD & EOD Submissions)
      CREATE TABLE IF NOT EXISTS public.workdays (
        id TEXT PRIMARY KEY,
        employee_id TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        department_name TEXT,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        work_mode TEXT DEFAULT 'OFFICE',
        sod_status TEXT DEFAULT 'PENDING',
        sod_time TEXT,
        eod_status TEXT DEFAULT 'PENDING',
        eod_time TEXT,
        planned_tasks JSONB DEFAULT '[]'::jsonb,
        overall_progress NUMERIC(5,2) DEFAULT 0,
        actual_hours NUMERIC(4,2) DEFAULT 0,
        achievements TEXT,
        blockers TEXT,
        tomorrow_focus TEXT,
        lead_feedback_note TEXT,
        lead_feedback_time TEXT,
        lead_rating NUMERIC(3,1),
        lead_sentiment TEXT,
        lead_action_item TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- 4. Biometric Punches Table
      CREATE TABLE IF NOT EXISTS public.biometric_punches (
        id TEXT PRIMARY KEY DEFAULT ('punch-' || substr(md5(random()::text), 1, 10)),
        employee_id TEXT NOT NULL,
        employee_name TEXT,
        punch_time TIMESTAMPTZ NOT NULL DEFAULT now(),
        punch_type TEXT NOT NULL DEFAULT 'IN',
        terminal_id TEXT DEFAULT 'HQ-GATE-01',
        location TEXT DEFAULT 'Bangalore HQ',
        method TEXT DEFAULT 'BIOMETRIC',
        status TEXT DEFAULT 'VERIFIED',
        raw_payload JSONB DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- 5. Regularization Requests Table
      CREATE TABLE IF NOT EXISTS public.regularization_requests (
        id TEXT PRIMARY KEY DEFAULT ('reg-' || substr(md5(random()::text), 1, 10)),
        employee_id TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        department_name TEXT,
        designation TEXT,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        punch_type TEXT NOT NULL DEFAULT 'MISSED_IN',
        actual_time TEXT NOT NULL,
        reason TEXT NOT NULL,
        lead_recommendation TEXT,
        status TEXT NOT NULL DEFAULT 'PENDING',
        action_by TEXT,
        action_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- 6. Lead Feedbacks Table
      CREATE TABLE IF NOT EXISTS public.feedbacks (
        id TEXT PRIMARY KEY DEFAULT ('fb-' || substr(md5(random()::text), 1, 10)),
        employee_id TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        lead_id TEXT NOT NULL,
        lead_name TEXT NOT NULL,
        date DATE NOT NULL DEFAULT CURRENT_DATE,
        rating NUMERIC(3,1) NOT NULL DEFAULT 5.0,
        sentiment TEXT NOT NULL DEFAULT 'EXCELLENT',
        notes TEXT NOT NULL,
        action_item TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- Enable RLS and add public access policies for service role and app
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
    `;

    await client.query(ddl);
    console.log(" All tables created with RLS policies enabled in Supabase!");

    // Seed default records if empty
    const seedSql = `
      INSERT INTO public.leave_requests (id, employee_id, employee_name, department_name, department_id, designation, leave_type, start_date, end_date, days_count, reason, handover_notes, backup_person_name, remaining_balance, status, tl_approver_name, tl_approved_at, tl_comment)
      VALUES 
        ('leave-req-101', 'emp-sarah', 'Sara Dev', 'Development', 'dept-development', 'Senior Backend Engineer', 'CASUAL', '2026-08-25', '2026-08-26', 2.0, 'Attending Distributed Systems & Microservices Summit in Hyderabad', 'Handed over PostgreSQL migration PRs and PR review tasks to Rohit Sharma', 'Rohit Sharma (Frontend)', 11.0, 'FORWARDED_TO_HR', 'Alex Lead (Team Lead)', now() - interval '1 hour', 'Sprint 34 deliverables on track. Recommended for Stage-2 HR approval.'),
        ('leave-req-102', 'emp-rohit', 'Rohit Sharma', 'Development', 'dept-development', 'Frontend Engineer (UI/UX)', 'CASUAL', '2026-08-27', '2026-08-27', 1.0, 'Personal errand and family commitment', 'All sprint UI components committed to main branch', 'Sara Dev (Senior Backend)', 10.0, 'PENDING_TL_STAGE_1', NULL, NULL, NULL)
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO public.wfh_requests (id, employee_id, employee_name, department_name, department_id, designation, start_date, end_date, days_count, reason, availability_hours, contact_method, planned_deliverables, status, tl_approver_name, tl_approved_at, tl_comment)
      VALUES
        ('wfh-req-201', 'emp-sarah', 'Sara Dev', 'Development', 'dept-development', 'Senior Backend Engineer', '2026-08-28', '2026-08-28', 1.0, 'High-focus deep work for offline biometric cache tests', '10:00 AM – 07:00 PM', 'Slack @sara & Zoom', 'Complete vitest test coverage assertions on biometric offline queue', 'FORWARDED_TO_HR', 'Alex Lead (Team Lead)', now() - interval '2 hours', 'Approved for Stage-2 HR review.'),
        ('wfh-req-202', 'emp-rohit', 'Rohit Sharma', 'Development', 'dept-development', 'Frontend Engineer (UI/UX)', '2026-08-27', '2026-08-27', 1.0, 'Quiet focus environment for mobile responsive drawer animations', '10:00 AM – 07:00 PM', 'Slack @rohit & Zoom', 'Implement CSS transition optimizations across mobile viewports.', 'PENDING_TL_STAGE_1', NULL, NULL, NULL)
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO public.workdays (id, employee_id, employee_name, department_name, date, work_mode, sod_status, sod_time, eod_status, eod_time, overall_progress, actual_hours, achievements, blockers, tomorrow_focus, planned_tasks)
      VALUES
        ('wd-sarah-today', 'emp-sarah', 'Sara Dev', 'Development', CURRENT_DATE, 'OFFICE', 'SUBMITTED', '10:15 AM', 'IN_PROGRESS', NULL, 80, 8.2, 'Merged authorization enhancements and reviewed 3 critical PRs.', 'None', 'Finalize EOD wrap-up testing suite.', '[{"id":"st-1","title":"Implement dedicated SOD Carryover section with rolled-over task pile-up","project":"Frontend & UI","priority":"HIGH","estimatedMinutes":180,"completionPercentage":80,"status":"IN_PROGRESS","expectedOutput":"Complete SOD section with carryover deck and morning lock action"},{"id":"st-2","title":"Conduct technical code review on Stage-2 Leave & HR approval PRs","project":"Core Platform","priority":"MEDIUM","estimatedMinutes":90,"completionPercentage":100,"status":"COMPLETED","expectedOutput":"Provide sign-off and merge authorization layer changes"}]'::jsonb),
        ('wd-rohit-today', 'emp-rohit', 'Rohit Sharma', 'Development', CURRENT_DATE, 'OFFICE', 'SUBMITTED', '10:20 AM', 'IN_PROGRESS', NULL, 65, 8.0, 'Shipped PageTransition & AnimatedTabContent components.', 'None', 'Optimize mobile viewport responsiveness.', '[{"id":"rt-1","title":"Design 3D interactive glassmorphism cards and smooth Framer Motion transitions","project":"Frontend & UI","priority":"HIGH","estimatedMinutes":240,"completionPercentage":70,"status":"IN_PROGRESS","expectedOutput":"Smooth page transition component across all views"},{"id":"rt-2","title":"Fix dark mode contrast tokens for secondary badges","project":"Design System","priority":"LOW","estimatedMinutes":60,"completionPercentage":60,"status":"IN_PROGRESS","expectedOutput":"WCAG AAA accessible contrast"}]'::jsonb),
        ('wd-priya-today', 'emp-priya', 'Priya QA', 'R & D', CURRENT_DATE, 'WFH', 'SUBMITTED', '10:05 AM', 'SUBMITTED', '06:55 PM', 100, 8.5, '85/85 unit tests and Playwright regressions green across all suites.', 'None', 'Prepare automated performance benchmarks.', '[{"id":"pt-1","title":"Automate Playwright end-to-end regression test suite for biometric sync","project":"Quality Assurance","priority":"HIGH","estimatedMinutes":180,"completionPercentage":100,"status":"COMPLETED","expectedOutput":"17 test suites passing in CI/CD pipeline"},{"id":"pt-2","title":"Verify RBAC permission boundary tests for HR Stage-2 leave approvals","project":"Security & Auth","priority":"HIGH","estimatedMinutes":120,"completionPercentage":100,"status":"COMPLETED","expectedOutput":"Zero regression leaks on permission elevation"}]'::jsonb)
      ON CONFLICT (id) DO NOTHING;

      INSERT INTO public.biometric_punches (id, employee_id, employee_name, punch_time, punch_type, terminal_id, location, method, status)
      VALUES
        ('punch-101', 'emp-sarah', 'Sara Dev', now() - interval '3 hours', 'IN', 'HQ-TERMINAL-01', 'Bangalore HQ - Floor 4', 'BIOMETRIC', 'VERIFIED'),
        ('punch-102', 'emp-rohit', 'Rohit Sharma', now() - interval '2 hours 55 minutes', 'IN', 'HQ-TERMINAL-01', 'Bangalore HQ - Floor 4', 'BIOMETRIC', 'VERIFIED'),
        ('punch-103', 'emp-karthik', 'Karthik Raja', now() - interval '3 hours 5 minutes', 'IN', 'HQ-TERMINAL-02', 'Bangalore HQ - Floor 3', 'BIOMETRIC', 'VERIFIED')
      ON CONFLICT (id) DO NOTHING;
    `;

    await client.query(seedSql);
    console.log(" Seed data inserted into Supabase tables successfully!");

  } catch (err: any) {
    console.error("Migration error:", err.message);
  } finally {
    if (client) await client.end();
  }
}

runMigration();
