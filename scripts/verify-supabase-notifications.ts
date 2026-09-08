import { createAdminClient } from "../src/lib/supabase/admin";
import { NotificationService } from "../src/server/services/notification-service";
import { AnnouncementService } from "../src/server/services/announcement-service";
import { AuthActor } from "../src/lib/authorization/types";

const hrActor: AuthActor = {
  userId: "hr-rachel",
  employeeId: "hr-rachel",
  roles: ["HR", "EMPLOYEE"],
  departmentId: "dept-hr",
  email: "rachel.hr@xorstack.com",
};

async function verifyNotificationSync() {
  const supabase = createAdminClient();
  if (!supabase) {
    console.error("Supabase client unavailable");
    process.exit(1);
  }

  console.log("=========================================================");
  console.log("=== STEP 1: HR BROADCASTS NOTIFICATION -> STORED IN SUPABASE ===");
  console.log("=========================================================");

  const testTitle = "Q4 Annual Performance Appraisals Open";
  const testMessage = "Self-evaluations and peer reviews are now accessible in the Reviews hub.";
  const notif = await NotificationService.send({
    userId: "all",
    actorId: hrActor.userId,
    type: "GENERAL",
    title: testTitle,
    message: testMessage,
    linkUrl: "/reviews",
  });

  console.log("Sent notification with ID:", notif.id);

  // Check Supabase feedbacks table where lead_id = 'NOTIFICATION'
  const { data: fbRow, error: fbErr } = await supabase
    .from("feedbacks")
    .select("*")
    .eq("id", notif.id)
    .single();

  if (fbErr || !fbRow) {
    console.error("❌ Failed to find notification in Supabase feedbacks table:", fbErr);
    process.exit(1);
  }

  console.log("Found row in Supabase:", {
    id: fbRow.id,
    lead_id: fbRow.lead_id,
    title: fbRow.employee_name,
    message: fbRow.notes,
    read_rating: fbRow.rating,
  });

  if (fbRow.employee_name === testTitle && fbRow.notes === testMessage && fbRow.lead_id === "NOTIFICATION") {
    console.log("✓ PASSED: Notification broadcast correctly stored in Supabase feedbacks table.");
  } else {
    console.error("❌ Notification content mismatch in Supabase.");
    process.exit(1);
  }

  console.log("\n=========================================================");
  console.log("=== STEP 2: NOTIFICATION MARKED AS READ -> UPDATES IN SUPABASE ===");
  console.log("=========================================================");

  await NotificationService.markAsRead(notif.id, "emp-sarah");

  const { data: readRow } = await supabase
    .from("feedbacks")
    .select("rating")
    .eq("id", notif.id)
    .single();

  console.log("Updated rating in Supabase:", readRow?.rating);
  if (readRow?.rating === 1.0) {
    console.log("✓ PASSED: Notification read status updated to 1.0 in Supabase.");
  } else {
    console.error("❌ Notification read status failed to update in Supabase.");
    process.exit(1);
  }

  console.log("\n=========================================================");
  console.log("=== STEP 3: MODIFY NOTIFICATION CONTENT -> UPDATES IN SUPABASE ===");
  console.log("=========================================================");

  const updatedTitle = "URGENT: Q4 Appraisals Deadline Extended";
  const updatedMessage = "Self-evaluations submission deadline extended to Friday 6:00 PM.";

  await NotificationService.updateNotification(notif.id, {
    title: updatedTitle,
    message: updatedMessage,
  });

  const { data: modifiedRow } = await supabase
    .from("feedbacks")
    .select("employee_name, notes")
    .eq("id", notif.id)
    .single();

  console.log("Modified title in Supabase:", modifiedRow?.employee_name);
  console.log("Modified notes in Supabase:", modifiedRow?.notes);

  if (modifiedRow?.employee_name === updatedTitle && modifiedRow?.notes === updatedMessage) {
    console.log("✓ PASSED: Notification content update correctly persisted to Supabase.");
  } else {
    console.error("❌ Notification content modification failed in Supabase.");
    process.exit(1);
  }

  console.log("\n=========================================================");
  console.log("=== STEP 4: DELETE NOTIFICATION -> REMOVED FROM SUPABASE ===");
  console.log("=========================================================");

  await NotificationService.deleteNotification(notif.id, "emp-sarah");

  const { data: deletedRow } = await supabase
    .from("feedbacks")
    .select("id")
    .eq("id", notif.id)
    .maybeSingle();

  if (!deletedRow) {
    console.log("✓ PASSED: Notification row confirmed deleted from Supabase.");
  } else {
    console.error("❌ Notification row still exists in Supabase after deletion.");
    process.exit(1);
  }

  console.log("\n=========================================================");
  console.log("=== STEP 5: HR BROADCASTS ANNOUNCEMENT -> STORED IN SUPABASE ===");
  console.log("=========================================================");

  const ancTitle = "All-Hands Foundation Gala Announcement";
  const ancBody = "Annual technology symposium and engineering showcase kickoff.";

  const anc = await AnnouncementService.createAnnouncement({
    actor: hrActor,
    input: {
      title: ancTitle,
      body: ancBody,
      category: "COMPANY_NEWS",
      priority: "HIGH",
      audienceType: "ALL",
      acknowledgementRequired: true,
      authorName: "HR - Rachel",
    },
  });

  // Also dispatch linked notification
  const ancNotif = await NotificationService.send({
    userId: "all",
    actorId: hrActor.userId,
    type: "GENERAL",
    title: anc.title,
    message: anc.body,
    linkUrl: "/announcements",
    announcementId: anc.id,
  });

  console.log("Created announcement ID:", anc.id);
  console.log("Created linked notification ID:", ancNotif.id);

  // Check Supabase feedbacks table for announcement
  const { data: ancRow } = await supabase
    .from("feedbacks")
    .select("*")
    .eq("id", anc.id)
    .single();

  // Check Supabase feedbacks table for linked notification
  const { data: ancNotifRow } = await supabase
    .from("feedbacks")
    .select("*")
    .eq("id", ancNotif.id)
    .single();

  if (ancRow && ancNotifRow) {
    console.log("✓ PASSED: Both announcement and its notification are saved in Supabase.");
  } else {
    console.error("❌ Failed to find announcement or notification in Supabase.");
    process.exit(1);
  }

  console.log("\n=========================================================");
  console.log("=== STEP 6: HR MODIFIES ANNOUNCEMENT -> UPDATES IN SUPABASE ===");
  console.log("=========================================================");

  const updatedAncTitle = "REVISED: All-Hands Foundation Gala 2026";
  const updatedAncBody = "Symposium kickoff rescheduled to Main Auditorium at 3:00 PM.";

  await AnnouncementService.updateAnnouncement({
    actor: hrActor,
    announcementId: anc.id,
    input: {
      title: updatedAncTitle,
      body: updatedAncBody,
    },
  });

  const { data: revisedAncRow } = await supabase
    .from("feedbacks")
    .select("employee_name, notes")
    .eq("id", anc.id)
    .single();

  console.log("Revised announcement in Supabase:", revisedAncRow?.employee_name);
  if (revisedAncRow?.employee_name === updatedAncTitle) {
    console.log("✓ PASSED: Announcement modification persisted in Supabase.");
  } else {
    console.error("❌ Announcement modification not reflected in Supabase.");
    process.exit(1);
  }

  console.log("\n=========================================================");
  console.log("=== STEP 7: HR DELETES ANNOUNCEMENT -> CASCADES TO NOTIFICATIONS IN SUPABASE ===");
  console.log("=========================================================");

  await AnnouncementService.deleteAnnouncement({
    actor: hrActor,
    announcementId: anc.id,
  });

  // Check announcement is deleted from Supabase
  const { data: checkAnc } = await supabase
    .from("feedbacks")
    .select("id")
    .eq("id", anc.id)
    .maybeSingle();

  // Check linked notification is deleted from Supabase
  const { data: checkNotif } = await supabase
    .from("feedbacks")
    .select("id")
    .eq("id", ancNotif.id)
    .maybeSingle();

  console.log("Announcement row exists after delete?", Boolean(checkAnc));
  console.log("Linked notification row exists after delete?", Boolean(checkNotif));

  if (!checkAnc && !checkNotif) {
    console.log("✓ PASSED: Announcement and its broadcast notification were cascaded and completely removed from Supabase.");
  } else {
    console.error("❌ Announcement or notification remained in Supabase after deletion.");
    process.exit(1);
  }

  console.log("\n=========================================================");
  console.log("=== ALL NOTIFICATION & ANNOUNCEMENT SUPABASE TESTS PASSED! ===");
  console.log("=========================================================");
}

verifyNotificationSync().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
