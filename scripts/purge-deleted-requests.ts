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
  console.log("Purging deleted leave and WFH requests from Supabase...");

  // Delete all leave requests for Sarah Dev that were deleted in app
  const { data: delLeaves, error: lErr } = await supabase
    .from("leave_requests")
    .delete()
    .eq("employee_id", "emp-sarah")
    .select();
  console.log(`Deleted ${delLeaves?.length || 0} Sarah Dev leave requests from Supabase:`, lErr || "OK");

  // Delete all WFH requests for Sarah Dev that were deleted in app
  const { data: delWfh, error: wErr } = await supabase
    .from("wfh_requests")
    .delete()
    .eq("employee_id", "emp-sarah")
    .select();
  console.log(`Deleted ${delWfh?.length || 0} Sarah Dev WFH requests from Supabase:`, wErr || "OK");

  // Also verify remaining leave requests
  const { data: remainingLeaves } = await supabase.from("leave_requests").select("id, employee_id, employee_name, start_date");
  console.log("Remaining leave requests in Supabase:", remainingLeaves);

  // Also verify remaining WFH requests
  const { data: remainingWfh } = await supabase.from("wfh_requests").select("id, employee_id, employee_name, start_date");
  console.log("Remaining WFH requests in Supabase:", remainingWfh);
}

main().catch(console.error);
