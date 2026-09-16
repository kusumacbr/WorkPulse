import { createAdminClient } from "@/lib/supabase/admin";

async function inspectTables() {
  const supabase = createAdminClient();
  if (!supabase) return;
  const res1 = await supabase.from("announcements").select("*").limit(1);
  console.log("announcements sample:", res1.data, "error:", res1.error);

  const res2 = await supabase.from("announcement_receipts").select("*").limit(1);
  console.log("announcement_receipts sample:", res2.data, "error:", res2.error);

  const res3 = await supabase.from("feedbacks").select("*").limit(1);
  console.log("feedbacks sample:", res3.data, "error:", res3.error);
}
inspectTables();
