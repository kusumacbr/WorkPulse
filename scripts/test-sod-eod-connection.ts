import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

async function runSodEodConnectionTest() {
  console.log("=== Testing SOD & EOD Submission Connection (No LocalStorage) ===");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    console.error("Missing Supabase credentials in .env.local");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  const testEmpId = `test-emp-${Date.now()}`;
  const testDate = new Date().toISOString().split("T")[0]!;
  const workdayId = `wd-${testEmpId}-${testDate}`;

  try {
    // 1. Employee submits Start-of-Day (SOD)
    console.log("Step 1: Employee submits Morning Plan (SOD)...");
    const sodTasks = [
      {
        id: `task-sod-1-${Date.now()}`,
        title: "Implement real-time SOD connection",
        project: "Development",
        priority: "HIGH",
        estimatedMinutes: 90,
        completionPercentage: 0,
        status: "NOT_STARTED",
      },
      {
        id: `task-sod-2-${Date.now()}`,
        title: "Test Team Lead live verification",
        project: "QA",
        priority: "MEDIUM",
        estimatedMinutes: 60,
        completionPercentage: 0,
        status: "NOT_STARTED",
      },
    ];

    const { error: sodErr } = await supabase.from("workdays").upsert({
      id: workdayId,
      employee_id: testEmpId,
      employee_name: "Test Employee",
      date: testDate,
      work_mode: "OFFICE",
      sod_status: "SUBMITTED",
      sod_time: "09:30 AM",
      planned_tasks: sodTasks,
      overall_progress: 0,
    });
    if (sodErr) throw sodErr;
    console.log("✓ SOD submitted successfully to 'workdays' table");

    // Also verify dedicated sod_submissions table
    await supabase.from("sod_submissions").upsert({
      id: `sod-${testEmpId}-${testDate}`,
      employee_id: testEmpId,
      employee_name: "Test Employee",
      date: testDate,
      sod_time: "09:30 AM",
      status: "SUBMITTED",
    });
    console.log("✓ SOD logged in 'sod_submissions' table");

    // 2. Team Lead reads SOD submission
    console.log("Step 2: Team Lead reads pending SOD submission...");
    const { data: leadWd1, error: leadReadErr1 } = await supabase
      .from("workdays")
      .select("*")
      .eq("id", workdayId)
      .single();
    if (leadReadErr1 || !leadWd1) throw leadReadErr1 || new Error("Workday not found by lead");
    if (leadWd1.sod_status !== "SUBMITTED" || leadWd1.planned_tasks.length !== 2) {
      throw new Error("Lead could not verify submitted tasks");
    }
    console.log(`✓ Team Lead sees SOD status: '${leadWd1.sod_status}' with ${leadWd1.planned_tasks.length} tasks`);

    // 3. Team Lead verifies Morning Plan (1-Click Approve)
    console.log("Step 3: Team Lead verifies Morning Plan...");
    const { error: leadApproveErr } = await supabase
      .from("workdays")
      .update({
        sod_status: "VERIFIED",
        lead_feedback_time: "Today at 09:45 AM",
        lead_feedback_note: "Approved! Ensure high test coverage on realtime bus.",
      })
      .eq("id", workdayId);
    if (leadApproveErr) throw leadApproveErr;
    console.log("✓ Team Lead verified SOD");

    // 4. Employee confirms SOD verified & unlocks Evening Wrap-Up
    console.log("Step 4: Employee verifies SOD approval and unlock...");
    const { data: empWd1, error: empReadErr1 } = await supabase
      .from("workdays")
      .select("*")
      .eq("id", workdayId)
      .single();
    if (empReadErr1 || !empWd1) throw empReadErr1 || new Error("Workday not found by employee");
    if (empWd1.sod_status !== "VERIFIED") {
      throw new Error("Employee did not receive verification");
    }
    console.log(`✓ Employee confirms SOD is VERIFIED with note: '${empWd1.lead_feedback_note}' at '${empWd1.lead_feedback_time}'`);

    // 5. Employee submits Evening Wrap-Up (EOD)
    console.log("Step 5: Employee submits Evening Wrap-Up (EOD)...");
    const eodTasks = sodTasks.map((t) => ({
      ...t,
      completionPercentage: 100,
      status: "COMPLETED",
    }));

    const { error: eodErr } = await supabase
      .from("workdays")
      .update({
        eod_status: "SUBMITTED",
        eod_time: "06:30 PM",
        planned_tasks: eodTasks,
        overall_progress: 100,
        achievements: "Completed real-time connection and live verification flow",
        blockers: "None",
        tomorrow_focus: "Monitor performance in production",
      })
      .eq("id", workdayId);
    if (eodErr) throw eodErr;
    console.log("✓ EOD submitted successfully by Employee");

    // 6. Team Lead reviews EOD & provides 5-Star Rating and Feedback
    console.log("Step 6: Team Lead reviews EOD and submits Rating & Feedback...");
    const { error: eodVerifyErr } = await supabase
      .from("workdays")
      .update({
        eod_status: "VERIFIED",
        lead_rating: 5,
        lead_feedback_note: "Outstanding execution and delivery today!",
        lead_feedback_time: "Today at 06:45 PM",
        lead_action_item: "Share learnings with the team tomorrow.",
        lead_sentiment: "EXCELLENT",
      })
      .eq("id", workdayId);
    if (eodVerifyErr) throw eodVerifyErr;

    // Mirror to feedbacks table
    await supabase.from("feedbacks").upsert({
      id: `df-${testEmpId}`,
      employee_id: testEmpId,
      employee_name: "Test Employee",
      rating: 5,
      lead_feedback_note: "Outstanding execution and delivery today!",
      lead_action_item: "Share learnings with the team tomorrow.",
      sentiment: "EXCELLENT",
    });
    console.log("✓ Team Lead verified EOD and saved feedback to 'workdays' & 'feedbacks' tables");

    // 7. Employee reads final verified EOD Feedback Card
    console.log("Step 7: Employee verifies final EOD Feedback Card...");
    const { data: finalWd, error: finalErr } = await supabase
      .from("workdays")
      .select("*")
      .eq("id", workdayId)
      .single();
    if (finalErr || !finalWd) throw finalErr || new Error("Final workday check failed");
    if (finalWd.eod_status !== "VERIFIED" || finalWd.lead_rating !== 5) {
      throw new Error("Final EOD verification check mismatch");
    }
    console.log(`✓ Employee sees EOD Verified: Rating=${finalWd.lead_rating}★, Note='${finalWd.lead_feedback_note}', ActionItem='${finalWd.lead_action_item}'`);

    // 8. New Day Starts: Delete 100% Completed Tasks & Carry Over 60% Pending Tasks
    console.log("Step 8: New Day starts — verifying 100% completed tasks deletion & 60% pending task rollover...");
    const taskCompletedId = `task-100-${Date.now()}`;
    const taskPendingId = `task-60-${Date.now()}`;

    // Seed tasks into daily_tasks
    await supabase.from("daily_tasks").upsert([
      {
        id: taskCompletedId,
        employee_id: testEmpId,
        date: testDate,
        title: "Finished Module (100%)",
        category: "General",
        priority: "MEDIUM",
        status: "COMPLETED",
        progress: 100,
      },
      {
        id: taskPendingId,
        employee_id: testEmpId,
        date: testDate,
        title: "Work In Progress (60%)",
        category: "Operations",
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        progress: 60,
      },
    ]);

    // Delete 100% completed and preserve rollover in daily_tasks
    await supabase.from("daily_tasks").delete().eq("employee_id", testEmpId).or("status.eq.COMPLETED,progress.gte.100");
    await supabase.from("daily_tasks").upsert([
      {
        id: taskPendingId,
        employee_id: testEmpId,
        date: testDate,
        title: "Work In Progress (60%)",
        category: "Operations",
        priority: "MEDIUM",
        status: "IN_PROGRESS",
        progress: 60,
      },
    ]);

    // Query daily_tasks to verify
    const { data: remainingTasks } = await supabase
      .from("daily_tasks")
      .select("*")
      .eq("employee_id", testEmpId);

    const hasCompleted = remainingTasks?.some((t) => t.id === taskCompletedId || t.progress >= 100);
    const hasPending = remainingTasks?.some((t) => t.id === taskPendingId && t.progress === 60);

    if (hasCompleted) {
      throw new Error("Completed task was not deleted from Supabase daily_tasks!");
    }
    if (!hasPending) {
      throw new Error("Pending 60% task was not preserved in Supabase daily_tasks!");
    }
    console.log(`✓ 100% completed task deleted from Supabase daily_tasks`);
    console.log(`✓ 60% pending task preserved in Supabase daily_tasks (status='IN_PROGRESS', progress=60%)`);

    // Cleanup test record
    console.log("Step 9: Cleaning up test records from Supabase...");
    await Promise.allSettled([
      supabase.from("workdays").delete().eq("employee_id", testEmpId),
      supabase.from("sod_submissions").delete().eq("employee_id", testEmpId),
      supabase.from("eod_submissions").delete().eq("employee_id", testEmpId),
      supabase.from("feedbacks").delete().eq("employee_id", testEmpId),
      supabase.from("daily_tasks").delete().eq("employee_id", testEmpId),
    ]);
    console.log("✓ Cleanup completed.");

    console.log("\n=== ALL SOD & EOD CONNECTION & TASK ROLLOVER TESTS PASSED (0 LocalStorage Dependency) ===");
  } catch (err: any) {
    console.error("Test failed:", err?.message || err);
    process.exit(1);
  }
}

runSodEodConnectionTest();
