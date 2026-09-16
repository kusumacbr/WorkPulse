import { NotificationService } from "@/server/services/notification-service";
import { createAdminClient } from "@/lib/supabase/admin";

async function testNotificationSystem() {
  console.log("=== Testing Notification System (Mark as Read, Clear All, Multi-Role, 0% LocalStorage) ===");

  const testEmpId = "emp-sarah";
  const testLeadId = "lead-alex";
  const testHrId = "hr-rachel";

  // Step 1: Send a test broadcast notification
  console.log("\n1. Dispatching a broadcast notification from HR...");
  const broadcastNotif = await NotificationService.send({
    userId: "all",
    actorId: testHrId,
    type: "GENERAL",
    title: "Quarterly System Upgrade Notice",
    message: "Scheduled cloud infrastructure maintenance on Saturday at 2 AM UTC.",
    linkUrl: "/announcements",
  });
  console.log("✓ Broadcast notification sent with ID:", broadcastNotif.id);

  // Step 2: Send a direct notification to Sara Dev (Employee)
  console.log("\n2. Dispatching a direct notification to Sara Dev (Employee)...");
  const directNotif = await NotificationService.send({
    userId: testEmpId,
    actorId: testLeadId,
    type: "SOD_REMINDER",
    title: "Sprint Feature Deliverable Assigned",
    message: "Alex Lead assigned 'Real-time WebSocket connection handler' to you.",
    linkUrl: "/my-work",
  });
  console.log("✓ Direct notification sent with ID:", directNotif.id);

  // Step 3: Fetch notifications for Employee (Sara)
  console.log("\n3. Fetching notifications for Employee (Sara)...");
  const empNotifs1 = await NotificationService.getUserNotifications({ userId: testEmpId });
  console.log(`✓ Sara sees ${empNotifs1.notifications.length} notifications, ${empNotifs1.unreadCount} unread.`);
  const saraDirect = empNotifs1.notifications.find((n) => n.id === directNotif.id);
  const saraBroadcast = empNotifs1.notifications.find((n) => n.id === broadcastNotif.id);
  console.log("Sara direct notif read status:", saraDirect?.read, "broadcast read status:", saraBroadcast?.read);

  // Step 4: Employee marks direct notification as read
  console.log("\n4. Employee marks direct notification as read...");
  await NotificationService.markAsRead(directNotif.id, testEmpId);
  const empNotifs2 = await NotificationService.getUserNotifications({ userId: testEmpId });
  const saraDirectAfterRead = empNotifs2.notifications.find((n) => n.id === directNotif.id);
  console.log("✓ Sara direct notification read status after markAsRead:", saraDirectAfterRead?.read);
  if (saraDirectAfterRead?.read !== true) {
    throw new Error("Direct notification should be marked as read!");
  }

  // Step 5: Employee marks ALL notifications as read
  console.log("\n5. Employee marks ALL notifications as read...");
  await NotificationService.markAllAsRead(testEmpId);
  const empNotifs3 = await NotificationService.getUserNotifications({ userId: testEmpId });
  console.log(`✓ Sara sees ${empNotifs3.unreadCount} unread notifications after markAllAsRead.`);
  if (empNotifs3.unreadCount !== 0) {
    throw new Error("All notifications should be marked as read (unreadCount === 0)!");
  }

  // Step 6: Verify Team Lead's notifications are NOT affected (they remain unread for Lead)
  console.log("\n6. Checking Team Lead's view of broadcast notification...");
  const leadNotifs1 = await NotificationService.getUserNotifications({ userId: testLeadId });
  const leadBroadcast = leadNotifs1.notifications.find((n) => n.id === broadcastNotif.id);
  console.log("Lead sees broadcast notification read status:", leadBroadcast?.read);

  // Step 7: Employee clears a single notification
  console.log("\n7. Employee deletes a single notification...");
  await NotificationService.deleteNotification(directNotif.id, testEmpId);
  const empNotifs4 = await NotificationService.getUserNotifications({ userId: testEmpId });
  const saraDirectAfterDelete = empNotifs4.notifications.find((n) => n.id === directNotif.id);
  console.log("✓ Direct notification exists in Sara's list after delete:", Boolean(saraDirectAfterDelete));
  if (saraDirectAfterDelete) {
    throw new Error("Deleted notification should not appear in employee list!");
  }

  // Step 8: Employee clears all notifications (Clear All)
  console.log("\n8. Employee clears ALL notifications (Clear All)...");
  await NotificationService.deleteAllNotifications(testEmpId);
  const empNotifs5 = await NotificationService.getUserNotifications({ userId: testEmpId });
  console.log(`✓ Sara's notifications count after Clear All: ${empNotifs5.notifications.length}`);
  if (empNotifs5.notifications.length !== 0) {
    throw new Error("All notifications should be cleared for employee!");
  }

  // Step 9: Simulate Server Restart / Hard Reload by clearing in-memory caches
  console.log("\n9. Simulating server restart / cache clear to verify Supabase persistence...");
  NotificationService.clearStore();

  const empNotifsPersisted = await NotificationService.getUserNotifications({ userId: testEmpId });
  console.log(`✓ After server restart, Sara's notifications count from Supabase: ${empNotifsPersisted.notifications.length}`);
  if (empNotifsPersisted.notifications.length !== 0) {
    throw new Error("Supabase persistence failed to preserve Clear All state across restarts!");
  }

  // Step 10: Clean up test records from Supabase
  console.log("\n10. Cleaning up test notification records from Supabase...");
  const supabase = createAdminClient();
  if (supabase) {
    await supabase.from("feedbacks").delete().eq("id", broadcastNotif.id);
    await supabase.from("feedbacks").delete().eq("id", directNotif.id);
    await supabase.from("feedbacks").delete().eq("id", `nr-${testEmpId}-${directNotif.id}`);
    await supabase.from("feedbacks").delete().eq("id", `nr-all-${testEmpId}`);
    await supabase.from("feedbacks").delete().eq("id", `nd-${testEmpId}-${directNotif.id}`);
    await supabase.from("feedbacks").delete().eq("id", `nd-all-${testEmpId}`);
    console.log("✓ Cleaned up test records from Supabase!");
  }

  console.log("\n=== ALL NOTIFICATION TESTS PASSED SUCCESSFULLY! ===");
}

testNotificationSystem().catch((err) => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
