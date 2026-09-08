import pg from "pg";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const { Client } = pg;

async function getClient() {
  const base1 = process.env.DIRECT_URL ? process.env.DIRECT_URL.split("?")[0] : null;
  const base2 = process.env.DATABASE_URL ? process.env.DATABASE_URL.split("?")[0] : null;
  const connectionStrings = [
    base1,
    base2,
    "postgresql://postgres.cqjnsznacqnzudpkgjjj:WorkPulse2025!Demo@aws-0-ap-south-1.pooler.supabase.com:5432/postgres",
    "postgresql://postgres.cqjnsznacqnzudpkgjjj:WorkPulse2025!Demo@aws-0-ap-south-1.pooler.supabase.com:6543/postgres",
  ].filter(Boolean);

  for (const cs of connectionStrings) {
    try {
      console.log("Attempting connect to:", cs.replace(/:[^:@]+@/, ":****@"));
      const client = new Client({
        connectionString: cs,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 7000,
      });
      await client.connect();
      console.log("✅ Successfully connected!");
      return client;
    } catch (e) {
      console.warn("❌ Failed:", e.message);
    }
  }
  return null;
}

async function main() {
  const client = await getClient();
  if (!client) {
    console.error("Could not connect via pg");
    process.exit(1);
  }

  const ddl = `
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
    CREATE INDEX IF NOT EXISTS idx_notification_reads_notif ON public.notification_reads(notification_id);

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

    -- 4. Assigned Tasks Table
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

    -- 5. Lead Tasks Table
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

    -- Enable RLS
    ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.notification_reads ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.assigned_tasks ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.lead_tasks ENABLE ROW LEVEL SECURITY;

    -- Open policies for full access
    DROP POLICY IF EXISTS "Allow all access to notifications" ON public.notifications;
    CREATE POLICY "Allow all access to notifications" ON public.notifications FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all access to notification_reads" ON public.notification_reads;
    CREATE POLICY "Allow all access to notification_reads" ON public.notification_reads FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all access to goals" ON public.goals;
    CREATE POLICY "Allow all access to goals" ON public.goals FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all access to assigned_tasks" ON public.assigned_tasks;
    CREATE POLICY "Allow all access to assigned_tasks" ON public.assigned_tasks FOR ALL USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow all access to lead_tasks" ON public.lead_tasks;
    CREATE POLICY "Allow all access to lead_tasks" ON public.lead_tasks FOR ALL USING (true) WITH CHECK (true);
  `;

  console.log("Executing DDL...");
  await client.query(ddl);
  console.log("✅ DDL executed successfully!");
  await client.end();
}

main().catch(console.error);
