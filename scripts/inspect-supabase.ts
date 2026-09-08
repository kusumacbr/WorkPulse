import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://cqjnsznacqnzudpkgjjj.supabase.co";
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxam5zem5hY3FuenVkcGtnampqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NzU3MzE0OCwiZXhwIjoyMTAzMTQ5MTQ4fQ.Gz5pjB9dhy7tMhxxx-mUOEi8-DXQyvrSKul-FU6UPhU";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log("Connecting to Supabase at:", supabaseUrl);
  
  const { data: leaves, error: lErr } = await supabase.from("leave_requests").select("id, employee_id, employee_name, start_date");
  if (lErr) console.error("Error fetching leaves:", lErr);
  else console.log(`Found ${leaves?.length || 0} leave requests in Supabase:`, leaves);

  const { data: wfh, error: wErr } = await supabase.from("wfh_requests").select("id, employee_id, employee_name, start_date");
  if (wErr) console.error("Error fetching wfh:", wErr);
  else console.log(`Found ${wfh?.length || 0} wfh requests in Supabase:`, wfh);
}

main().catch(console.error);
