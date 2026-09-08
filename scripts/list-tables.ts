import { createAdminClient } from "../src/lib/supabase/admin";

async function main() {
  const s = createAdminClient();
  if (!s) return;

  const testList = [
    "employees", "profiles", "workdays", "leave_requests", "wfh_requests",
    "biometric_punches", "feedbacks", "regularization_requests",
    "tasks", "goals", "weekly_goals", "user_goals", "okrs"
  ];

  for (const t of testList) {
    const { count, error } = await s.from(t).select("*", { count: "exact", head: true });
    if (!error) {
      console.log(`Table '${t}' exists! Row count: ${count}`);
    } else {
      console.log(`Table '${t}' does not exist (${error.message})`);
    }
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
