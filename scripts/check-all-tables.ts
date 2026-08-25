import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function checkTables() {
  const tables = [
    "employees",
    "profiles",
    "leave_requests",
    "wfh_requests",
    "workdays",
    "biometric_punches",
    "attendance_records",
    "regularization_requests",
    "feedbacks",
  ];

  for (const table of tables) {
    const { data, error } = await supabase.from(table).select("*").limit(1);
    if (error) {
      console.log(`❌ Table '${table}': NOT FOUND or error (${error.message})`);
    } else {
      console.log(`✅ Table '${table}': EXISTS (${data.length} sample rows)`);
    }
  }
}

checkTables();
