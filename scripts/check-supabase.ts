import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const { data, error } = await supabase
    .from("employees")
    .select("id, name, email, role_title, department, work_mode, status, leave_balance")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error querying employees:", error.message);
    return;
  }

  console.log(`Found ${data.length} employees in Supabase:`);
  console.table(data);
}

main();
