import { LeaveService } from "../src/server/services/leave-service";
import { WorkpulseSharedStore } from "../src/lib/stores/workpulse-shared-store";

async function runTest() {
  console.log("==========================================");
  console.log("TEST: Two-Stage Leave & WFH Approval Workflow");
  console.log("==========================================");

  // 1. Test Store Leave Workflow
  console.log("\n1. Testing In-Memory Store Leave Workflow...");
  const leaveReq = WorkpulseSharedStore.addLeaveRequest({
    employeeId: "emp-sarah",
    employeeName: "Sarah Dev",
    leaveType: "CASUAL",
    startDate: "2026-09-20",
    endDate: "2026-09-21",
    daysCount: 2,
    reason: "Family event",
  });

  console.log("   Initial status:", leaveReq.status);
  if (leaveReq.status !== "PENDING_TL_STAGE_1") {
    throw new Error(`Expected PENDING_TL_STAGE_1, got ${leaveReq.status}`);
  }

  // TL Approves
  WorkpulseSharedStore.tlApproveLeave(leaveReq.id, "Lead approved", "Alex Lead");
  const stage1Req = WorkpulseSharedStore.getLeaveRequests().find((r) => r.id === leaveReq.id);
  console.log("   After TL Approval status:", stage1Req?.status, "Approver:", stage1Req?.tlApproverName);
  if (stage1Req?.status !== "FORWARDED_TO_HR") {
    throw new Error(`Expected FORWARDED_TO_HR after TL approve, got ${stage1Req?.status}`);
  }

  // HR Approves
  WorkpulseSharedStore.hrApproveLeave(leaveReq.id, "HR authorized");
  const stage2Req = WorkpulseSharedStore.getLeaveRequests().find((r) => r.id === leaveReq.id);
  console.log("   After HR Approval status:", stage2Req?.status, "Approver:", stage2Req?.hrApproverName);
  if (stage2Req?.status !== "APPROVED") {
    throw new Error(`Expected APPROVED after HR approve, got ${stage2Req?.status}`);
  }
  console.log("   ✓ Store Leave 2-Stage workflow PASS");

  // 2. Test Store WFH Workflow
  console.log("\n2. Testing In-Memory Store WFH Workflow...");
  const wfhReq = WorkpulseSharedStore.addWfhRequest({
    employeeId: "emp-sarah",
    employeeName: "Sarah Dev",
    startDate: "2026-09-22",
    reason: "Remote sprint focus",
  });

  console.log("   Initial status:", wfhReq.status);
  if (wfhReq.status !== "PENDING_TL_STAGE_1") {
    throw new Error(`Expected PENDING_TL_STAGE_1, got ${wfhReq.status}`);
  }

  // TL Approves
  WorkpulseSharedStore.tlApproveWfh(wfhReq.id, "Lead approved WFH", "Alex Lead");
  const stage1Wfh = WorkpulseSharedStore.getWfhRequests().find((r) => r.id === wfhReq.id);
  console.log("   After TL Approval status:", stage1Wfh?.status, "Approver:", stage1Wfh?.tlApproverName);
  if (stage1Wfh?.status !== "FORWARDED_TO_HR") {
    throw new Error(`Expected FORWARDED_TO_HR after TL approve, got ${stage1Wfh?.status}`);
  }

  // HR Approves
  WorkpulseSharedStore.hrApproveWfh(wfhReq.id, "HR authorized WFH");
  const stage2Wfh = WorkpulseSharedStore.getWfhRequests().find((r) => r.id === wfhReq.id);
  console.log("   After HR Approval status:", stage2Wfh?.status, "Approver:", stage2Wfh?.hrApproverName);
  if (stage2Wfh?.status !== "APPROVED") {
    throw new Error(`Expected APPROVED after HR approve, got ${stage2Wfh?.status}`);
  }
  console.log("   ✓ Store WFH 2-Stage workflow PASS");

  // 3. Test Backend LeaveService
  console.log("\n3. Testing Backend LeaveService Workflow...");
  const employeeActor = { userId: "user-sarah", employeeId: "emp-sarah", email: "sarah@xorstack.com", roles: ["EMPLOYEE"] as any };
  const leadActor = { userId: "user-alex", employeeId: "lead-alex", email: "alex@xorstack.com", roles: ["MANAGER"] as any, directReportIds: ["emp-sarah"] };
  const hrActor = { userId: "user-rachel", employeeId: "hr-rachel", email: "rachel@xorstack.com", roles: ["HR"] as any };

  const srvLeave = await LeaveService.submitLeaveRequest({
    actor: employeeActor,
    input: {
      leaveType: "CASUAL",
      startDate: "2026-09-25",
      endDate: "2026-09-26",
      isHalfDay: false,
      reason: "Vacation",
    },
  });
  console.log("   Initial srv leave status:", srvLeave.status);

  const reviewedLeave = await LeaveService.managerReviewLeave({
    actor: leadActor,
    input: { requestId: srvLeave.id, action: "APPROVE", comment: "Manager approved" },
  });
  console.log("   After manager review status:", reviewedLeave.status);
  if (reviewedLeave.status !== "PENDING_HR") {
    throw new Error(`Expected PENDING_HR, got ${reviewedLeave.status}`);
  }

  const finalLeave = await LeaveService.hrReviewLeave({
    actor: hrActor,
    input: { requestId: srvLeave.id, action: "APPROVE", comment: "HR approved" },
  });
  console.log("   After HR review status:", finalLeave.status);
  if (finalLeave.status !== "APPROVED") {
    throw new Error(`Expected APPROVED, got ${finalLeave.status}`);
  }
  console.log("   ✓ Backend LeaveService 2-Stage workflow PASS");

  // 4. Test Backend LeaveService WFH
  console.log("\n4. Testing Backend LeaveService WFH Workflow...");
  const srvWfh = await LeaveService.submitWfhRequest({
    actor: employeeActor,
    input: {
      startDate: "2026-09-28",
      endDate: "2026-09-28",
      plannedDeliverables: "Sprint tasks",
      reason: "Focus day",
    },
  });
  console.log("   Initial srv WFH status:", srvWfh.status);

  const reviewedWfh = await LeaveService.managerReviewWfh({
    actor: leadActor,
    input: { requestId: srvWfh.id, action: "APPROVE" },
  });
  console.log("   After manager review status:", reviewedWfh.status);
  if (reviewedWfh.status !== "PENDING_HR") {
    throw new Error(`Expected PENDING_HR, got ${reviewedWfh.status}`);
  }

  const finalWfh = await LeaveService.hrReviewWfh({
    actor: hrActor,
    input: { requestId: srvWfh.id, action: "APPROVE", comment: "HR approved WFH" },
  });
  console.log("   After HR review status:", finalWfh.status);
  if (finalWfh.status !== "APPROVED") {
    throw new Error(`Expected APPROVED, got ${finalWfh.status}`);
  }
  console.log("   ✓ Backend LeaveService WFH 2-Stage workflow PASS");

  console.log("\n==========================================");
  console.log("ALL TWO-STAGE APPROVAL TESTS PASSED! 🎉");
  console.log("==========================================");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
