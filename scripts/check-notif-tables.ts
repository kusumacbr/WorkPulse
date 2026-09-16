import { createAdminClient } from "@/lib/supabase/admin";

async function checkNotifTables() {
  const supabase = createAdminClient();
  if (!supabase) return;
  const res1 = await supabase.from("notifications").select("*").limit(3);
  console.log("notifications table sample:", res1.data?.length, "error:", res1.error);
  if (res1.data && res1.data[0]) console.log("notifications columns:", Object.keys(res1.data[0]));

  const res2 = await supabase.from("notification_reads").select("*").limit(3);
  console.log("notification_reads table sample:", res2.data?.length, "error:", res2.error);
  if (res2.data && res2.data[0]) console.log("notification_reads columns:", Object.keys(res2.data[0]));

  const res3 = await supabase.from("notification_deletes").select("*").limit(3);
  console.log("notification_deletes table sample:", res3.data?.length, "error:", res3.error);
  if (res3.data && res3.data[0]) console.log("notification_deletes columns:", Object.keys(res3.data[0]));
}
checkNotifTables();
