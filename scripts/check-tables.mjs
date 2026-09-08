import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  const tables = [
    "notifications",
    "notification_reads",
    "goals",
    "biometric_punches",
    "assigned_tasks",
    "lead_tasks",
    "sod_submissions",
    "eod_submissions",
    "daily_tasks",
    "feedbacks",
  ];

  for (const t of tables) {
    const { data, error } = await supabase.from(t).select("*").limit(1);
    if (error) {
      console.log(`❌ ${t}: ${error.message} (code: ${error.code})`);
    } else {
      console.log(`✅ ${t}: EXISTS (${data.length} rows sample)`);
    }
  }
}

main();
