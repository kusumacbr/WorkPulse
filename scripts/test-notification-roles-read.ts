import { NotificationService } from "../src/server/services/notification-service";

async function runRoleReadTest() {
  console.log("=================================================================");
  console.log("=== VERIFYING NOTIFICATION BROADCAST & PER-ROLE READ HANDLING ===");
  console.log("=================================================================");

  // 1. HR broadcasts an organization-wide notification
  console.log("\n1. HR broadcasts new company-wide notification...");
  const broadcastNotif = await NotificationService.send({
    userId: "all",
    actorId: "hr-rachel",
    type: "GENERAL",
    title: "Engineering Town Hall & Sprint Reviews",
    message: "Mandatory all-hands sync this Thursday at 4 PM IST on Google Meet.",
    linkUrl: "/announcements",
  });
  console.log("✓ Broadcast sent with ID:", broadcastNotif.id);

  // 2. Sarah (EMPLOYEE) fetches notifications
  console.log("\n2. Sarah Dev (EMPLOYEE) checks notifications...");
  const sarahInitial = await NotificationService.getUserNotifications({ userId: "emp-sarah" });
  const sarahItemInitial = sarahInitial.notifications.find((n) => n.id === broadcastNotif.id);
  console.log(`Sarah sees notification: ${Boolean(sarahItemInitial)}, read status: ${sarahItemInitial?.read}`);
  if (!sarahItemInitial || sarahItemInitial.read !== false) {
    throw new Error("Sarah should see the notification as unread");
  }

  // 3. Alex (TEAM LEAD) checks notifications
  console.log("\n3. Alex Lead (TEAM LEAD) checks notifications...");
  const alexInitial = await NotificationService.getUserNotifications({ userId: "lead-alex" });
  const alexItemInitial = alexInitial.notifications.find((n) => n.id === broadcastNotif.id);
  console.log(`Alex sees notification: ${Boolean(alexItemInitial)}, read status: ${alexItemInitial?.read}`);
  if (!alexItemInitial || alexItemInitial.read !== false) {
    throw new Error("Alex should see the notification as unread");
  }

  // 4. Sarah marks notification as read
  console.log("\n4. Sarah marks notification as read...");
  await NotificationService.markAsRead(broadcastNotif.id, "emp-sarah");
  console.log("✓ Notification marked read by emp-sarah");

  // 5. Sarah checks again (simulating page reload)
  console.log("\n5. Sarah re-fetches notifications after marking read...");
  const sarahReloaded = await NotificationService.getUserNotifications({ userId: "emp-sarah" });
  const sarahItemReloaded = sarahReloaded.notifications.find((n) => n.id === broadcastNotif.id);
  console.log(`Sarah read status after reload: ${sarahItemReloaded?.read}`);
  if (!sarahItemReloaded || sarahItemReloaded.read !== true) {
    throw new Error("Sarah should see the notification as read!");
  }

  // 6. Alex checks again - Alex's copy must REMAIN UNREAD
  console.log("\n6. Alex re-fetches notifications (Alex has NOT read it yet)...");
  const alexReloaded = await NotificationService.getUserNotifications({ userId: "lead-alex" });
  const alexItemReloaded = alexReloaded.notifications.find((n) => n.id === broadcastNotif.id);
  console.log(`Alex read status: ${alexItemReloaded?.read}`);
  if (!alexItemReloaded || alexItemReloaded.read !== false) {
    throw new Error("Alex's notification must remain unread!");
  }
  console.log("✓ PASSED: Read status is isolated per user/role! Sarah is read, Alex is unread.");

  // 7. Alex marks all as read
  console.log("\n7. Alex clicks 'Mark all as read'...");
  await NotificationService.markAllAsRead("lead-alex");
  const alexAfterMarkAll = await NotificationService.getUserNotifications({ userId: "lead-alex" });
  const alexItemAfterAll = alexAfterMarkAll.notifications.find((n) => n.id === broadcastNotif.id);
  console.log(`Alex read status after 'Mark all as read': ${alexItemAfterAll?.read}`);
  if (!alexItemAfterAll || alexItemAfterAll.read !== true) {
    throw new Error("Alex should see the notification as read after Mark All");
  }
  console.log("✓ PASSED: Alex's notification is now marked as read.");

  // 8. Clean up test notification
  console.log("\n8. Cleaning up test notification...");
  await NotificationService.deleteNotification(broadcastNotif.id, "hr-rachel", true);
  console.log("✓ Test notification permanently deleted.");

  console.log("\n=================================================================");
  console.log("=== ALL NOTIFICATION PER-ROLE READ TESTS PASSED SUCCESSFULLY! ===");
  console.log("=================================================================");
}

runRoleReadTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
