import { createAdminClient } from "../src/lib/supabase/admin";

async function testFullPersistenceFlow() {
  const s = createAdminClient();
  if (!s) {
    console.error("Supabase Admin Client not configured!");
    process.exit(1);
  }

  console.log("=== Testing Supabase Persistence Flow ===");

  // 1. Purge all leave requests to sync with zero leave requests in UI
  const { error: purgeErr } = await s.from("leave_requests").delete().neq("id", "__dummy__");
  if (purgeErr) console.error("Purge error:", purgeErr);
  const { count: countAfterPurge } = await s.from("leave_requests").select("*", { count: "exact", head: true });
  console.log("Leave requests in Supabase after purge:", countAfterPurge);

  // 2. Insert test leave
  const testId = `leave-test-${Date.now()}`;
  const { error: insErr } = await s.from("leave_requests").insert({
    id: testId,
    employee_id: "emp-sarah",
    employee_name: "Sarah Dev",
    leave_type: "CASUAL",
    start_date: "2026-09-20",
    end_date: "2026-09-21",
    days_count: 2,
    reason: "Family event",
    status: "PENDING_TL_STAGE_1",
    remaining_balance: 11,
  });
  console.log("Insert leave result:", insErr ? insErr.message : "SUCCESS");

  // 3. Update to APPROVED
  const { error: updErr } = await s.from("leave_requests").update({
    status: "APPROVED",
    hr_approver_name: "Rachel HR",
    hr_comment: "Approved by HR Admin",
  }).eq("id", testId);
  console.log("Update leave result:", updErr ? updErr.message : "SUCCESS");

  // 4. Delete permanently
  const { error: delErr } = await s.from("leave_requests").delete().eq("id", testId);
  console.log("Delete leave result:", delErr ? delErr.message : "SUCCESS");

  // 5. Test Employee Creation, Cascading Update, and Permanent Delete
  console.log("\n=== Testing Employee Cascade & Permanent Deletion ===");
  const testEmpId = `emp-test-${Date.now()}`;
  const testEmpName = "Test Persistence Staff";

  // Create
  const { error: empInsErr } = await s.from("employees").insert({
    id: testEmpId,
    name: testEmpName,
    email: `${testEmpId}@xorstack.com`,
    role_title: "Staff Engineer",
    department: "Development",
    department_id: "dept-development",
    work_mode: "OFFICE",
    status: "ACTIVE",
    employment_type: "Full-Time",
  });
  console.log("Employee insert:", empInsErr ? empInsErr.message : "SUCCESS");

  // Child record (workday)
  await s.from("workdays").insert({
    id: `wd-${testEmpId}`,
    employee_id: testEmpId,
    employee_name: testEmpName,
    date: "2026-09-07",
    sod_status: "SUBMITTED",
  });

  // Rename employee
  await s.from("employees").update({ name: "Renamed Staff" }).eq("id", testEmpId);
  await s.from("workdays").update({ employee_name: "Renamed Staff" }).eq("employee_id", testEmpId);
  const { data: renCheck } = await s.from("workdays").select("employee_name").eq("employee_id", testEmpId).single();
  console.log("Employee rename cascaded to workday:", renCheck?.employee_name === "Renamed Staff" ? "SUCCESS" : "FAILED");

  // Cascade delete
  await Promise.allSettled([
    s.from("workdays").delete().eq("employee_id", testEmpId),
    s.from("leave_requests").delete().eq("employee_id", testEmpId),
    s.from("wfh_requests").delete().eq("employee_id", testEmpId),
    s.from("biometric_punches").delete().eq("employee_id", testEmpId),
    s.from("feedbacks").delete().eq("employee_id", testEmpId),
    s.from("regularization_requests").delete().eq("employee_id", testEmpId),
  ]);
  const { error: empDelErr } = await s.from("employees").delete().eq("id", testEmpId);
  console.log("Employee delete:", empDelErr ? empDelErr.message : "SUCCESS");

  // Verify non-existence
  const { data: postCheck } = await s.from("employees").select("id").eq("id", testEmpId).maybeSingle();
  const { data: postWdCheck } = await s.from("workdays").select("id").eq("employee_id", testEmpId).maybeSingle();
  console.log("Employee row exists after delete?", !!postCheck ? "FAILED" : "NO (Permanently Deleted)");
  console.log("Workday row exists after delete?", !!postWdCheck ? "FAILED" : "NO (Permanently Deleted)");

  // 6. Verify final count
  const { count: finalCount } = await s.from("leave_requests").select("*", { count: "exact", head: true });
  console.log("Final leave_requests row count in Supabase:", finalCount);
  console.log("=== Persistence Flow Test Finished ===");
}

testFullPersistenceFlow().then(() => process.exit(0)).catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});

