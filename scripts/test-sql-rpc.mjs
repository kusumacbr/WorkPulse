import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Supabase URL:", supabaseUrl);

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const sql = `
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
    ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
    DROP POLICY IF EXISTS "Allow all access to goals" ON public.goals;
    CREATE POLICY "Allow all access to goals" ON public.goals FOR ALL USING (true) WITH CHECK (true);
  `;

  // Method 1: Try common RPCs
  const rpcs = ["exec_sql", "run_sql", "execute_sql", "pg_query", "sql"];
  for (const rpc of rpcs) {
    const { data, error } = await supabase.rpc(rpc, { sql, query: sql });
    if (!error) {
      console.log(`✅ Success creating table via RPC '${rpc}'!`);
      return;
    } else {
      console.log(`RPC '${rpc}' failed:`, error.message);
    }
  }

  // Method 2: Test if table goals already exists
  const { data, error } = await supabase.from("goals").select("id").limit(1);
  if (error) {
    console.log("Table 'goals' select error:", error.code, error.message);
  } else {
    console.log("Table 'goals' ALREADY EXISTS! Data:", data);
  }
}

main();
