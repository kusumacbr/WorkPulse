import { createAdminClient } from "../src/lib/supabase/admin";

async function testAllTables() {
  const s = createAdminClient();
  if (!s) throw new Error("No supabase admin client");
  console.log("=== Testing All Supabase Tables CRUD ===");

  // 1. Leave Requests
  const leaveId = `leave-test-${Date.now()}`;
  await s.from("leave_requests").insert({
    id: leaveId,
    employee_id: "emp-sarah",
    employee_name: "Sarah Dev",
    leave_type: "CASUAL",
    start_date: "2026-09-25",
    end_date: "2026-09-26",
    days_count: 2,
    reason: "Integration test",
    status: "PENDING_TL_STAGE_1",
  });
  const { data: lData } = await s.from("leave_requests").select("*").eq("id", leaveId).single();
  console.log("Leave Insert:", lData?.id === leaveId ? "PASSED" : "FAILED");
  await s.from("leave_requests").delete().eq("id", leaveId);
  const { data: lDel } = await s.from("leave_requests").select("*").eq("id", leaveId).maybeSingle();
  console.log("Leave Delete:", lDel === null ? "PASSED" : "FAILED");

  // 2. WFH Requests
  const wfhId = `wfh-test-${Date.now()}`;
  await s.from("wfh_requests").insert({
    id: wfhId,
    employee_id: "emp-sarah",
    employee_name: "Sarah Dev",
    start_date: "2026-09-25",
    end_date: "2026-09-25",
    days_count: 1,
    reason: "WFH Integration test",
    status: "PENDING_TL_STAGE_1",
  });
  const { data: wData } = await s.from("wfh_requests").select("*").eq("id", wfhId).single();
  console.log("WFH Insert:", wData?.id === wfhId ? "PASSED" : "FAILED");
  await s.from("wfh_requests").delete().eq("id", wfhId);
  const { data: wDel } = await s.from("wfh_requests").select("*").eq("id", wfhId).maybeSingle();
  console.log("WFH Delete:", wDel === null ? "PASSED" : "FAILED");

  // 3. Workdays
  const wdId = `wd-test-${Date.now()}`;
  await s.from("workdays").upsert({
    id: wdId,
    employee_id: "emp-sarah",
    employee_name: "Sarah Dev",
    date: "2026-09-25",
    work_mode: "OFFICE",
    sod_status: "SUBMITTED",
  });
  const { data: wdData } = await s.from("workdays").select("*").eq("id", wdId).single();
  console.log("Workday Upsert:", wdData?.id === wdId ? "PASSED" : "FAILED");
  await s.from("workdays").delete().eq("id", wdId);
  const { data: wdDel } = await s.from("workdays").select("*").eq("id", wdId).maybeSingle();
  console.log("Workday Delete:", wdDel === null ? "PASSED" : "FAILED");

  // 4. Biometric Punches
  const { data: bpData, error: bpErr } = await s.from("biometric_punches").insert({
    employee_id: "emp-sarah",
    employee_name: "Sarah Dev",
    punch_type: "IN",
    terminal_id: "HQ-GATE-01",
    status: "VERIFIED",
  }).select().single();
  console.log("Punch Insert:", bpErr ? "FAILED" : "PASSED");
  if (bpData?.id) {
    await s.from("biometric_punches").delete().eq("id", bpData.id);
  }

  // 5. Regularizations
  const { data: sampleReg, error: sErr } = await s.from("regularization_requests").select("*").limit(1);
  console.log("Existing regularization schema sample:", sampleReg, sErr);

  const regId = `reg-test-${Date.now()}`;
  const { error: rInsErr } = await s.from("regularization_requests").insert({
    id: regId,
    employee_id: "emp-sarah",
    employee_name: "Sarah Dev",
    date: "2026-09-25",
    punch_type: "MISSED_OUT",
    actual_time: "07:00 PM",
    reason: "Badge scanner error",
    status: "PENDING",
  });
  if (rInsErr) console.log("Regularization insert error:", rInsErr.message);
  const { data: regData } = await s.from("regularization_requests").select("*").eq("id", regId).maybeSingle();
  console.log("Regularization Insert:", regData?.id === regId ? "PASSED" : "FAILED");
  await s.from("regularization_requests").delete().eq("id", regId);
  const { data: regDel } = await s.from("regularization_requests").select("*").eq("id", regId).maybeSingle();
  console.log("Regularization Delete:", regDel === null ? "PASSED" : "FAILED");

  console.log("=== All Tests Complete ===");
}

testAllTables().then(() => process.exit(0)).catch((e) => {
  console.error(e);
  process.exit(1);
});
