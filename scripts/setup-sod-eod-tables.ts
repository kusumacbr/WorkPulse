import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createTables() {
  console.log("Creating sod_submissions, eod_submissions, and daily_tasks tables...");

  const { error: err } = await supabase.rpc("exec_sql", {
    sql: `
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

      -- 3. Daily Tasks Table
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

      -- Add open public policies
      DROP POLICY IF EXISTS "Allow all access to sod_submissions" ON public.sod_submissions;
      CREATE POLICY "Allow all access to sod_submissions" ON public.sod_submissions FOR ALL USING (true) WITH CHECK (true);

      DROP POLICY IF EXISTS "Allow all access to eod_submissions" ON public.eod_submissions;
      CREATE POLICY "Allow all access to eod_submissions" ON public.eod_submissions FOR ALL USING (true) WITH CHECK (true);

      DROP POLICY IF EXISTS "Allow all access to daily_tasks" ON public.daily_tasks;
      CREATE POLICY "Allow all access to daily_tasks" ON public.daily_tasks FOR ALL USING (true) WITH CHECK (true);
    `,
  });

  if (err) {
    console.warn("RPC not available or failed:", err);
  } else {
    console.log("Tables created successfully via RPC.");
  }
}

createTables().catch(console.error);
