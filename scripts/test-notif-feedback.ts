import { createAdminClient } from "@/lib/supabase/admin";

async function testFeedbackNotificationPersistence() {
  const supabase = createAdminClient();
  if (!supabase) return;
  const testUserId = "emp-sarah";
  const testNotifId = "notif-test-123";

  console.log("1. Upserting NOTIFICATION_READ into feedbacks...");
  const readRecord = {
    id: `nr-${testUserId}-${testNotifId}`,
    employee_id: testUserId,
    employee_name: "Notification Read Receipt",
    lead_id: "NOTIFICATION_READ",
    lead_name: testNotifId,
    date: new Date().toISOString().split("T")[0],
    rating: 5,
    sentiment: "READ",
    notes: testNotifId,
    action_item: JSON.stringify({ notificationId: testNotifId, userId: testUserId, readAt: new Date().toISOString() }),
  };

  const { error: readErr } = await supabase.from("feedbacks").upsert(readRecord);
  console.log("Read upsert error:", readErr);

  console.log("2. Upserting NOTIFICATION_CLEAR_ALL into feedbacks...");
  const clearRecord = {
    id: `nd-all-${testUserId}`,
    employee_id: testUserId,
    employee_name: "Clear All Receipt",
    lead_id: "NOTIFICATION_CLEAR_ALL",
    lead_name: testUserId,
    date: new Date().toISOString().split("T")[0],
    rating: 1,
    sentiment: "CLEARED_ALL",
    notes: "All notifications cleared",
    action_item: JSON.stringify({ userId: testUserId, clearedAllAt: Date.now() }),
  };
  const { error: clearErr } = await supabase.from("feedbacks").upsert(clearRecord);
  console.log("Clear upsert error:", clearErr);

  console.log("3. Querying feedbacks for notification records...");
  const { data, error: qErr } = await supabase
    .from("feedbacks")
    .select("*")
    .in("lead_id", ["NOTIFICATION_READ", "NOTIFICATION_READ_ALL", "NOTIFICATION_DELETE", "NOTIFICATION_CLEAR_ALL"])
    .eq("employee_id", testUserId);
  console.log("Queried rows:", data?.length, "error:", qErr);

  console.log("4. Cleaning up test records...");
  await supabase.from("feedbacks").delete().eq("id", `nr-${testUserId}-${testNotifId}`);
  await supabase.from("feedbacks").delete().eq("id", `nd-all-${testUserId}`);
  console.log("Cleanup complete!");
}
testFeedbackNotificationPersistence();
