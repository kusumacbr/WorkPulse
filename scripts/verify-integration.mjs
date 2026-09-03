// Comprehensive End-to-End Integration Verification Script
import http from "http";

const BASE_URL = "http://localhost:3000";

function fetchApi(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const req = http.request(
      url,
      {
        method: options.method || "GET",
        headers: {
          "Content-Type": "application/json",
          "x-user-email": options.email || "lead.test@xorstack.com",
          ...(options.headers || {}),
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );
    req.on("error", reject);
    if (options.body) {
      req.write(typeof options.body === "string" ? options.body : JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runLiveTests() {
  console.log("==================================================");
  console.log("WORKPULSE FULL BACKEND & SUPABASE INTEGRATION TEST");
  console.log("==================================================\n");

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✓ PASS: ${name}`);
      passed++;
    } catch (e) {
      console.error(`✗ FAIL: ${name}`, e.message);
      failed++;
    }
  }

  // 1. Dashboard Live API
  await test("1. GET /api/v1/me/dashboard (HR Role)", async () => {
    const res = await fetchApi("/api/v1/me/dashboard", { email: "hr.test@xorstack.com" });
    if (res.status !== 200 || !res.body.data?.hrMetrics) throw new Error(`Expected 200 with hrMetrics, got ${res.status}`);
  });

  await test("2. GET /api/v1/me/dashboard (Lead Role)", async () => {
    const res = await fetchApi("/api/v1/me/dashboard", { email: "lead.test@xorstack.com" });
    if (res.status !== 200 || !res.body.data?.leadMetrics) throw new Error(`Expected 200 with leadMetrics, got ${res.status}`);
  });

  // 2. SOD & EOD Workdays
  let createdWorkdayId = null;
  await test("3. POST /api/v1/workdays/sod (Submit SOD with Tasks)", async () => {
    const res = await fetchApi("/api/v1/workdays/sod", {
      method: "POST",
      email: "employee.test@xorstack.com",
      body: {
        workDate: new Date().toISOString().split("T")[0],
        workMode: "OFFICE",
        tasks: [
          { title: "Implement Supabase Data Sync", project: "Platform Core", priority: "HIGH", estimatedMinutes: 120 },
          { title: "Verify TL->HR 2-Stage Approvals", project: "Platform Core", priority: "HIGH", estimatedMinutes: 60 },
        ],
      },
    });
    if (res.status !== 200 || !res.body.data?.workday) throw new Error(`Expected 200, got ${res.status}`);
    createdWorkdayId = res.body.data.workday.id;
  });

  await test("4. POST /api/v1/workdays/eod (Submit EOD Results)", async () => {
    const res = await fetchApi("/api/v1/workdays/eod", {
      method: "POST",
      email: "employee.test@xorstack.com",
      body: {
        workdayId: createdWorkdayId,
        achievements: "All tasks completed and verified with Vitest.",
        tasks: [
          { title: "Implement Supabase Data Sync", status: "COMPLETED", completionPercentage: 100 },
          { title: "Verify TL->HR 2-Stage Approvals", status: "COMPLETED", completionPercentage: 100 },
        ],
      },
    });
    if (res.status !== 200 || !res.body.data?.workday) throw new Error(`Expected 200, got ${res.status}`);
  });

  // 3. Leave 2-Stage Approvals (Employee -> TL -> HR)
  let leaveId = null;
  await test("5. POST /api/v1/leave (Submit Leave by Employee)", async () => {
    const res = await fetchApi("/api/v1/leave", {
      method: "POST",
      email: "employee.test@xorstack.com",
      body: {
        leaveType: "CASUAL",
        startDate: "2026-09-10",
        endDate: "2026-09-11",
        reason: "Family travel and vacation",
        handoverNotes: "Tasks handed over to Rohit",
      },
    });
    if (res.status !== 201 || !res.body.data?.request?.id) throw new Error(`Expected 201, got ${res.status}`);
    leaveId = res.body.data.request.id;
  });

  await test("6. POST /api/v1/leave/[id]/approve (TL Stage 1 Approval)", async () => {
    const res = await fetchApi(`/api/v1/leave/${leaveId}/approve`, {
      method: "POST",
      email: "lead.test@xorstack.com",
      body: { comment: "Sprint deliverables covered. Approved by Lead." },
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test("7. POST /api/v1/leave/[id]/approve (HR Stage 2 Final Approval & Balance Deduction)", async () => {
    const res = await fetchApi(`/api/v1/leave/${leaveId}/approve`, {
      method: "POST",
      email: "hr.test@xorstack.com",
      body: { comment: "Final HR authorization granted." },
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // 4. TL's Own Leave Auto-Forwarding to HR
  let tlLeaveId = null;
  await test("8. POST /api/v1/leave (TL's Own Leave skips TL stage -> FORWARDED_TO_HR)", async () => {
    const res = await fetchApi("/api/v1/leave", {
      method: "POST",
      email: "lead.test@xorstack.com",
      body: {
        leaveType: "CASUAL",
        startDate: "2026-09-15",
        endDate: "2026-09-15",
        reason: "Personal errand",
      },
    });
    if (res.status !== 201 || res.body.data?.request?.status !== "FORWARDED_TO_HR") {
      throw new Error(`Expected status FORWARDED_TO_HR for TL leave, got ${res.body.data?.request?.status}`);
    }
    tlLeaveId = res.body.data.request.id;
  });

  await test("9. POST /api/v1/leave/[id]/approve (HR Approves TL Leave)", async () => {
    const res = await fetchApi(`/api/v1/leave/${tlLeaveId}/approve`, {
      method: "POST",
      email: "hr.test@xorstack.com",
      body: { comment: "Approved TL leave request." },
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // 5. WFH 2-Stage Approvals (Employee -> TL -> HR)
  let wfhId = null;
  await test("10. POST /api/v1/leave/wfh (Submit WFH by Employee)", async () => {
    const res = await fetchApi("/api/v1/leave/wfh", {
      method: "POST",
      email: "employee.test@xorstack.com",
      body: {
        startDate: "2026-09-05",
        endDate: "2026-09-05",
        reason: "Deep focus remote workday",
        deliverables: "Complete integration verification",
      },
    });
    if (res.status !== 201 || !res.body.data?.request?.id) throw new Error(`Expected 201, got ${res.status}`);
    wfhId = res.body.data.request.id;
  });

  await test("11. POST /api/v1/leave/wfh/[id]/approve (TL Stage 1 WFH Approval)", async () => {
    const res = await fetchApi(`/api/v1/leave/wfh/${wfhId}/approve`, {
      method: "POST",
      email: "lead.test@xorstack.com",
      body: { comment: "Approved WFH by Lead." },
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  await test("12. POST /api/v1/leave/wfh/[id]/approve (HR Stage 2 WFH Approval)", async () => {
    const res = await fetchApi(`/api/v1/leave/wfh/${wfhId}/approve`, {
      method: "POST",
      email: "hr.test@xorstack.com",
      body: { comment: "Authorized remote workday by HR." },
    });
    if (res.status !== 200) throw new Error(`Expected 200, got ${res.status}`);
  });

  // 6. Biometric Punches & Web Check-in
  await test("13. POST /api/v1/attendance/web-check-in (Record Punch IN)", async () => {
    const res = await fetchApi("/api/v1/attendance/web-check-in", {
      method: "POST",
      email: "employee.test@xorstack.com",
    });
    if (res.status !== 201 || res.body.data?.punch?.direction !== "IN") throw new Error(`Expected 201 punch IN, got ${res.status}`);
  });

  await test("14. POST /api/v1/attendance/web-check-out (Record Punch OUT)", async () => {
    const res = await fetchApi("/api/v1/attendance/web-check-out", {
      method: "POST",
      email: "employee.test@xorstack.com",
    });
    if (res.status !== 201 || res.body.data?.punch?.direction !== "OUT") throw new Error(`Expected 201 punch OUT, got ${res.status}`);
  });

  await test("15. GET /api/v1/attendance/punches (Fetch Punches List)", async () => {
    const res = await fetchApi("/api/v1/attendance/punches", { email: "employee.test@xorstack.com" });
    if (res.status !== 200 || !Array.isArray(res.body.data?.punches)) throw new Error(`Expected 200 with punches array, got ${res.status}`);
  });

  // 7. Employee CRUD Operations
  let newEmpId = null;
  await test("16. POST /api/v1/employees (Onboard Employee as HR)", async () => {
    const res = await fetchApi("/api/v1/employees", {
      method: "POST",
      email: "hr.test@xorstack.com",
      body: {
        name: "Test Engineer User",
        email: "test.engineer@xorstack.com",
        designation: "Software Engineer II",
        departmentId: "dept-development",
        departmentName: "Development",
        workMode: "OFFICE",
        remainingLeaveBalance: 12.0,
      },
    });
    if (res.status !== 201 || !res.body.data?.employee?.id) throw new Error(`Expected 201, got ${res.status}`);
    newEmpId = res.body.data.employee.id;
  });

  await test("17. PATCH /api/v1/employees/[id] (Update Employee Record)", async () => {
    const res = await fetchApi(`/api/v1/employees/${newEmpId}`, {
      method: "PATCH",
      email: "hr.test@xorstack.com",
      body: {
        designation: "Senior Software Engineer",
        workMode: "HYBRID",
      },
    });
    if (res.status !== 200 || res.body.data?.employee?.designation !== "Senior Software Engineer") {
      throw new Error(`Expected updated designation, got ${res.status}`);
    }
  });

  await test("18. DELETE /api/v1/employees/[id] (Offboard Employee as HR)", async () => {
    const res = await fetchApi(`/api/v1/employees/${newEmpId}`, {
      method: "DELETE",
      email: "hr.test@xorstack.com",
    });
    if (res.status !== 200) throw new Error(`Expected 200 on delete, got ${res.status}`);
  });

  // 8. Profile Change Queries & Settings Preferences
  let createdQueryTicket = null;
  await test("19. POST /api/v1/profile/query (Submit Profile Change Request to HR)", async () => {
    const res = await fetchApi("/api/v1/profile/query", {
      method: "POST",
      email: "employee.test@xorstack.com",
      body: {
        category: "Personal Contact Details",
        requestedChange: "Update contact phone to +91 98450 99887",
        reason: "Updated personal phone number",
      },
    });
    if (res.status !== 201 || !res.body.data?.query?.ticketNumber) {
      throw new Error(`Expected 201 with ticketNumber, got ${res.status}`);
    }
    createdQueryTicket = res.body.data.query.ticketNumber;
  });

  await test("20. GET /api/v1/profile/query (Fetch Profile Change Queries)", async () => {
    const res = await fetchApi("/api/v1/profile/query", { email: "employee.test@xorstack.com" });
    if (res.status !== 200 || !Array.isArray(res.body.data?.queries)) {
      throw new Error(`Expected 200 with queries array, got ${res.status}`);
    }
  });

  await test("21. POST /api/v1/me/preferences (Save User Settings Preferences)", async () => {
    const res = await fetchApi("/api/v1/me/preferences", {
      method: "POST",
      email: "employee.test@xorstack.com",
      body: {
        sodReminder: true,
        leaveAlerts: true,
        announcements: false,
      },
    });
    if (res.status !== 200 || res.body.data?.preferences?.announcements !== false) {
      throw new Error(`Expected 200 with updated preferences, got ${res.status}`);
    }
  });

  await test("22. GET /api/v1/me/preferences (Fetch User Settings Preferences)", async () => {
    const res = await fetchApi("/api/v1/me/preferences", { email: "employee.test@xorstack.com" });
    if (res.status !== 200 || !res.body.data?.preferences) {
      throw new Error(`Expected 200 with preferences, got ${res.status}`);
    }
  });

  await test("23. POST /api/v1/profile/query/[id]/approve (HR Approves Profile Change Query)", async () => {
    const res = await fetchApi(`/api/v1/profile/query/${createdQueryTicket}/approve`, {
      method: "POST",
      email: "hr.test@xorstack.com",
      body: { remarks: "Phone number verified and updated by HR." },
    });
    if (res.status !== 200) {
      throw new Error(`Expected 200 on HR approval, got ${res.status}`);
    }
  });

  // 9. Real-Time Notifications & HR Broadcasts
  let createdNotifId = null;
  await test("24. POST /api/v1/notifications (HR Broadcasts Notice to All Members)", async () => {
    const res = await fetchApi("/api/v1/notifications", {
      method: "POST",
      email: "hr.test@xorstack.com",
      body: {
        title: "Q3 Town Hall & Roadmap Broadcast",
        message: "Join us today at 4:00 PM for the quarterly all-hands broadcast presentation.",
        type: "ANNOUNCEMENT",
        audience: "ALL",
      },
    });
    if (res.status !== 201 || !res.body.data?.notification?.id) {
      throw new Error(`Expected 201 with notification id, got ${res.status}`);
    }
    createdNotifId = res.body.data.notification.id;
  });

  await test("25. GET /api/v1/notifications (Employee Receives Inbound Broadcast)", async () => {
    const res = await fetchApi("/api/v1/notifications", { email: "employee.test@xorstack.com" });
    if (res.status !== 200 || !Array.isArray(res.body.data?.notifications)) {
      throw new Error(`Expected 200 with notifications array, got ${res.status}`);
    }
    const hasBroadcast = res.body.data.notifications.some((n) => n.title.includes("Q3 Town Hall"));
    if (!hasBroadcast) {
      throw new Error("Expected employee to receive HR broadcast notification");
    }
  });

  await test("26. POST /api/v1/notifications/read-all (Mark All Notifications Read)", async () => {
    const res = await fetchApi("/api/v1/notifications/read-all", {
      method: "POST",
      email: "employee.test@xorstack.com",
    });
    if (res.status !== 200) {
      throw new Error(`Expected 200 on mark all read, got ${res.status}`);
    }
  });

  console.log(`\n==================================================`);
  console.log(`RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log(`==================================================\n`);

  if (failed > 0) process.exit(1);
}

runLiveTests().catch((err) => {
  console.error("Live test runner error:", err);
  process.exit(1);
});
