import { createAdminClient } from "../src/lib/supabase/admin";

async function inspectSupabase() {
  const s = createAdminClient();
  if (!s) {
    console.error("No admin client");
    process.exit(1);
  }

  const candidateTables = [
    "employees", "profiles", "workdays", "tasks", "goals", "weekly_goals",
    "leave_requests", "wfh_requests", "biometric_punches", "feedbacks",
    "regularization_requests", "departments", "teams", "announcements",
    "notifications", "audit_logs"
  ];

  for (const table of candidateTables) {
    const { data, error, count } = await s.from(table).select("*", { count: "exact" }).limit(1);
    if (error) {
      console.log(`TABLE [${table}] -> ERROR: ${error.message}`);
    } else {
      console.log(`TABLE [${table}] -> EXISTS! Rows: ${count}, Columns:`, data && data[0] ? Object.keys(data[0]) : "(empty table)");
      if (data && data[0]) {
        console.log(`Sample from [${table}]:`, JSON.stringify(data[0], null, 2));
      }
    }
  }
}

inspectSupabase().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
