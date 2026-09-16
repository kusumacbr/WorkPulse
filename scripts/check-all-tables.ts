import { createAdminClient } from "@/lib/supabase/admin";

async function listAllTables() {
  const supabase = createAdminClient();
  if (!supabase) return;
  const tables = [
    "workdays",
    "daily_tasks",
    "feedbacks",
    "announcements",
    "announcement_receipts",
    "attendance_punches",
    "sod_submissions",
    "eod_submissions",
    "wfh_requests",
    "regularization_requests",
    "leave_requests",
    "goals",
    "profiles",
    "system_settings",
    "app_settings",
    "notifications",
    "audit_logs"
  ];

  for (const t of tables) {
    const { error, count } = await supabase.from(t).select("*", { count: "exact", head: true });
    if (error) {
      console.log(`Table '${t}': NOT FOUND or error: ${error.message}`);
    } else {
      console.log(`Table '${t}': EXISTS (count: ${count})`);
    }
  }
}
listAllTables();
