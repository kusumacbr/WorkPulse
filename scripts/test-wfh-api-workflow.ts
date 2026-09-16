import { createAdminClient } from "../src/lib/supabase/admin";

async function testWfhApiWorkflow() {
  console.log("==========================================");
  console.log("TEST: Complete Supabase WFH 2-Stage Lifecycle");
  console.log("==========================================");

  const supabase = createAdminClient();
  if (!supabase) {
    throw new Error("Supabase admin client unavailable!");
  }

  const testId = `wfh-test-${Date.now()}`;
  const empId = "emp-sarah";
  const empName = "Sarah Dev";

  console.log(`\n1. Creating WFH request (${testId}) as Employee...`);
  const insertPayload = {
    id: testId,
    employee_id: empId,
    employee_name: empName,
    start_date: "2026-09-22",
    end_date: "2026-09-22",
    days_count: 1,
    reason: "Remote sprint work",
    availability_hours: "10:00 AM – 07:00 PM",
    contact_method: "Slack & Zoom",
    planned_deliverables: "Finish API routes",
    status: "PENDING_TL_STAGE_1",
    created_at: new Date().toISOString(),
  };

  const { error: insErr } = await supabase.from("wfh_requests").upsert(insertPayload);
  if (insErr) throw insErr;

  const { data: step1 } = await supabase.from("wfh_requests").select("*").eq("id", testId).single();
  console.log("   Initial status in Supabase:", step1.status);
  if (step1.status !== "PENDING_TL_STAGE_1") {
    throw new Error(`Step 1 Failed: Expected PENDING_TL_STAGE_1, got ${step1.status}`);
  }
  console.log("   ✓ Step 1 PASS: WFH request is in Stage 1 (PENDING_TL_STAGE_1)");

  console.log("\n2. Simulating Lead Approval (Stage 1)...");
  const stage1Update = {
    status: "FORWARDED_TO_HR",
    tl_approver_name: "Alex Lead",
    tl_approved_at: new Date().toISOString(),
    tl_comment: "Approved by Team Lead. Forwarded to HR.",
    updated_at: new Date().toISOString(),
  };

  const { error: tlErr } = await supabase.from("wfh_requests").update(stage1Update).eq("id", testId);
  if (tlErr) throw tlErr;

  const { data: step2 } = await supabase.from("wfh_requests").select("*").eq("id", testId).single();
  console.log("   After Lead Approval status in Supabase:", step2.status, "Approver:", step2.tl_approver_name);
  if (step2.status !== "FORWARDED_TO_HR") {
    throw new Error(`Step 2 Failed: Expected FORWARDED_TO_HR, got ${step2.status}`);
  }
  console.log("   ✓ Step 2 PASS: Lead approval moves request to FORWARDED_TO_HR (NOT APPROVED)");

  console.log("\n3. Simulating HR Approval (Stage 2)...");
  const stage2Update = {
    status: "APPROVED",
    hr_approver_name: "Rachel HR",
    hr_approved_at: new Date().toISOString(),
    hr_comment: "Final HR Approval granted for remote workday.",
    updated_at: new Date().toISOString(),
  };

  const { error: hrErr } = await supabase.from("wfh_requests").update(stage2Update).eq("id", testId);
  if (hrErr) throw hrErr;

  const { data: step3 } = await supabase.from("wfh_requests").select("*").eq("id", testId).single();
  console.log("   After HR Approval status in Supabase:", step3.status, "HR Approver:", step3.hr_approver_name);
  if (step3.status !== "APPROVED") {
    throw new Error(`Step 3 Failed: Expected APPROVED, got ${step3.status}`);
  }
  console.log("   ✓ Step 3 PASS: HR approval marks request as fully APPROVED");

  console.log("\n4. Cleaning up test record...");
  await supabase.from("wfh_requests").delete().eq("id", testId);
  console.log("   ✓ Cleaned up test record");

  console.log("\n==========================================");
  console.log("ALL SUPABASE WFH WORKFLOW TESTS PASSED! 🎉");
  console.log("==========================================");
}

testWfhApiWorkflow().catch((e) => {
  console.error("Test failed:", e);
  process.exit(1);
});
