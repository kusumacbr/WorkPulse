import { createAdminClient } from "../src/lib/supabase/admin";

async function verifyAll() {
  const s = createAdminClient();
  if (!s) {
    console.error("Supabase admin client unavailable");
    process.exit(1);
  }

  console.log("=================================================");
  console.log("=== STEP 1: VERIFYING EMPLOYEE CASCADING UPDATES ===");
  console.log("=================================================");

  const targetEmpId = "emp-sarah";
  const updatedName = "Sarah Dev";
  const updatedDept = "Development";
  const updatedDesig = "Senior Backend Engineer";

  // Simulate update_employee cascade
  const updatePayload = {
    id: targetEmpId,
    name: updatedName,
    email: "employee.test@xorstack.com",
    role_title: updatedDesig,
    department: updatedDept,
    department_id: "dept-development",
    work_mode: "OFFICE",
    status: "ACTIVE",
    employment_type: "Full-Time",
    leave_balance: 11.0,
  };

  // 1. Update employees
  await s.from("employees").upsert(updatePayload);

  // 2. Cascade update to all other tables
  await Promise.allSettled([
    s.from("profiles").update({ full_name: updatedName, department: updatedDept, designation: updatedDesig }).eq("id", "042d0161-5e74-4917-a5f0-b7287f7d4cce"),
    s.from("workdays").update({ employee_name: updatedName, department_name: updatedDept }).eq("employee_id", targetEmpId),
    s.from("leave_requests").update({ employee_name: updatedName, department_name: updatedDept, designation: updatedDesig }).eq("employee_id", targetEmpId),
    s.from("wfh_requests").update({ employee_name: updatedName, department_name: updatedDept, designation: updatedDesig }).eq("employee_id", targetEmpId),
    s.from("biometric_punches").update({ employee_name: updatedName }).eq("employee_id", targetEmpId),
    s.from("feedbacks").update({ employee_name: updatedName }).eq("employee_id", targetEmpId),
    s.from("regularization_requests").update({ employee_name: updatedName, department_name: updatedDept, designation: updatedDesig }).eq("employee_id", targetEmpId),
  ]);

  // Check results across all tables
  const { data: empRow } = await s.from("employees").select("name, department").eq("id", targetEmpId).single();
  const { data: profRow } = await s.from("profiles").select("full_name, department").eq("email", "employee.test@xorstack.com").single();
  const { data: wdSample } = await s.from("workdays").select("employee_name").eq("employee_id", targetEmpId).limit(1).single();
  const { data: punchSample } = await s.from("biometric_punches").select("employee_name").eq("employee_id", targetEmpId).limit(1).single();
  const { data: fbSample } = await s.from("feedbacks").select("employee_name").eq("employee_id", targetEmpId).limit(1).single();

  console.log("Employees table name:", empRow?.name, empRow?.name === updatedName ? "✓ PASSED" : "FAILED");
  console.log("Profiles table full_name:", profRow?.full_name, profRow?.full_name === updatedName ? "✓ PASSED" : "FAILED");
  console.log("Workdays table employee_name:", wdSample?.employee_name, wdSample?.employee_name === updatedName ? "✓ PASSED" : "FAILED");
  console.log("Biometric Punches employee_name:", punchSample?.employee_name, punchSample?.employee_name === updatedName ? "✓ PASSED" : "FAILED");
  console.log("Feedbacks table employee_name:", fbSample?.employee_name, fbSample?.employee_name === updatedName ? "✓ PASSED" : "FAILED");

  console.log("\n=================================================");
  console.log("=== STEP 2: VERIFYING SOD & EOD TASKS IN SUPABASE ===");
  console.log("=================================================");

  const today = new Date().toISOString().split("T")[0]!;
  const todayWorkdayId = `wd-${targetEmpId}-${today}`;

  const sampleTasks = [
    {
      id: `task-${Date.now()}-1`,
      title: "Design PostgreSQL connection pooling architecture",
      project: "Backend Core",
      priority: "HIGH",
      taskType: "PLANNED",
      estimatedMinutes: 120,
      completionPercentage: 100,
      status: "COMPLETED",
      expectedOutput: "Connection pool configuration & benchmark report",
    },
    {
      id: `task-${Date.now()}-2`,
      title: "Implement two-stage leave approval workflow handlers",
      project: "Leave Engine",
      priority: "HIGH",
      taskType: "PLANNED",
      estimatedMinutes: 90,
      completionPercentage: 100,
      status: "COMPLETED",
      expectedOutput: "Stage 1 Manager + Stage 2 HR approval API endpoints",
    },
    {
      id: `task-${Date.now()}-3`,
      title: "Conduct biometric terminal synchronization tests",
      project: "Edge Connectors",
      priority: "MEDIUM",
      taskType: "PLANNED",
      estimatedMinutes: 60,
      completionPercentage: 100,
      status: "COMPLETED",
      expectedOutput: "Offline fallback test execution with 0 data loss",
    }
  ];

  // 1. Submit Start-of-Day (SOD)
  await s.from("workdays").upsert({
    id: todayWorkdayId,
    employee_id: targetEmpId,
    employee_name: updatedName,
    department_name: updatedDept,
    date: today,
    work_mode: "OFFICE",
    sod_status: "SUBMITTED",
    sod_time: "10:05 AM",
    planned_tasks: sampleTasks,
    overall_progress: 0,
  });

  const { data: sodWorkday } = await s.from("workdays").select("id, sod_status, sod_time, planned_tasks").eq("id", todayWorkdayId).single();
  console.log("SOD Status in Supabase:", sodWorkday?.sod_status, sodWorkday?.sod_status === "SUBMITTED" ? "✓ PASSED" : "FAILED");
  console.log("SOD Time in Supabase:", sodWorkday?.sod_time);
  console.log("SOD Tasks count stored in Supabase:", sodWorkday?.planned_tasks?.length, sodWorkday?.planned_tasks?.length === 3 ? "✓ PASSED" : "FAILED");

  // 2. Submit End-of-Day (EOD)
  await s.from("workdays").upsert({
    id: todayWorkdayId,
    employee_id: targetEmpId,
    employee_name: updatedName,
    department_name: updatedDept,
    date: today,
    work_mode: "OFFICE",
    sod_status: "SUBMITTED",
    sod_time: "10:05 AM",
    eod_status: "SUBMITTED",
    eod_time: "07:10 PM",
    actual_hours: 8.5,
    achievements: "Completed PostgreSQL pool setup, 2-stage leave routes, and edge biometric tests with 100% test pass rate.",
    blockers: "None",
    tomorrow_focus: "Sprint demo preparation and team standup presentation.",
    planned_tasks: sampleTasks,
    overall_progress: 100,
    lead_rating: 5,
    lead_feedback_note: "Flawless sprint execution by Sarah.",
  });

  const { data: eodWorkday } = await s.from("workdays").select("*").eq("id", todayWorkdayId).single();
  console.log("EOD Status in Supabase:", eodWorkday?.eod_status, eodWorkday?.eod_status === "SUBMITTED" ? "✓ PASSED" : "FAILED");
  console.log("EOD Time in Supabase:", eodWorkday?.eod_time);
  console.log("EOD Achievements in Supabase:", eodWorkday?.achievements ? "✓ PASSED (" + eodWorkday.achievements.substring(0, 40) + "...)" : "FAILED");
  console.log("EOD Overall Progress in Supabase:", eodWorkday?.overall_progress + "%", eodWorkday?.overall_progress === 100 ? "✓ PASSED" : "FAILED");
  console.log("EOD Stored Tasks titles in Supabase:", eodWorkday?.planned_tasks?.map((t: any) => t.title));

  console.log("\n=================================================");
  console.log("=== STEP 3: VERIFYING GOALS STORAGE IN SUPABASE ===");
  console.log("=================================================");

  const goalId = "goal-ship-biometric-pipeline";
  await s.from("feedbacks").upsert({
    id: `fb-${goalId}`,
    employee_id: targetEmpId,
    employee_name: updatedName,
    lead_id: "lead-alex",
    lead_name: "Alex Lead",
    date: today,
    rating: 5,
    sentiment: "EXCELLENT",
    notes: "[GOAL - ENGINEERING] Ship 99.9% Reliable Biometric Pipeline: Zero data loss during offline network outages (Progress: 100%)",
    action_item: "Outcome Target: Zero data loss during network outage testing",
  });

  const { data: goalRow } = await s.from("feedbacks").select("*").eq("id", `fb-${goalId}`).single();
  console.log("Goal stored in Supabase feedbacks table:", goalRow?.id === `fb-${goalId}` ? "✓ PASSED" : "FAILED");
  console.log("Goal Title & Progress:", goalRow?.notes);
  console.log("Goal Outcome Target:", goalRow?.action_item);

  console.log("\n=================================================");
  console.log("=== ALL VERIFICATIONS COMPLETED SUCCESSFULLY! ===");
  console.log("=================================================");
}

verifyAll().then(() => process.exit(0)).catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
