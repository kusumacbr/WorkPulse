import pg from "pg";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

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
        connectionTimeoutMillis: 10000,
      });
      await client.connect();
      console.log("✅ Successfully connected to Supabase Postgres!");
      return client;
    } catch (e) {
      console.warn("❌ Failed connection attempt:", e.message);
    }
  }
  return null;
}

async function main() {
  console.log("🚀 Starting Supabase goals table migration...");
  const client = await getClient();
  if (!client) {
    console.error("❌ Could not connect via pg pooler");
    process.exit(1);
  }

  const sql = `
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

    CREATE INDEX IF NOT EXISTS idx_goals_employee_id ON public.goals(employee_id);

    -- 2. Row Level Security
    ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Allow all access to goals" ON public.goals;
    CREATE POLICY "Allow all access to goals" ON public.goals FOR ALL USING (true) WITH CHECK (true);
  `;

  try {
    await client.query(sql);
    console.log("✅ Successfully created 'public.goals' table in Supabase!");

    // Verify table exists by running a test query
    const res = await client.query("SELECT COUNT(*) FROM public.goals;");
    console.log(`✅ Verified 'public.goals' table exists in Supabase. Current row count: ${res.rows[0].count}`);

    // Migrate any existing goal records stored in feedbacks table into public.goals
    const copySql = `
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
    `;
    await client.query(copySql);
    console.log("✅ Migrated existing goals from feedbacks table into 'public.goals'!");

    const finalCount = await client.query("SELECT COUNT(*) FROM public.goals;");
    console.log(`🎉 Supabase 'public.goals' table migration complete! Total active goals rows: ${finalCount.rows[0].count}`);

  } catch (err) {
    console.error("❌ Migration SQL Error:", err.message);
  } finally {
    await client.end();
  }
}

main();
