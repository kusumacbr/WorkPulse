import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET as getWorkdays, POST as postWorkdays } from "@/app/api/v1/workdays/route";
import { POST as postSod } from "@/app/api/v1/workdays/sod/route";
import { POST as postEod } from "@/app/api/v1/workdays/eod/route";
import { PATCH as patchTask } from "@/app/api/v1/workdays/tasks/route";
import { GET as getLeave, POST as postLeave } from "@/app/api/v1/leave/route";
import { POST as approveLeave } from "@/app/api/v1/leave/[id]/approve/route";
import { POST as rejectLeave } from "@/app/api/v1/leave/[id]/reject/route";
import { GET as getWfh, POST as postWfh } from "@/app/api/v1/leave/wfh/route";
import { GET as getAttendance } from "@/app/api/v1/attendance/route";
import { POST as postPunch } from "@/app/api/v1/attendance/punch/route";
import { GET as getGoals, POST as postGoals } from "@/app/api/v1/goals/route";
import { PATCH as patchGoal } from "@/app/api/v1/goals/[id]/route";
import { GET as getReviews } from "@/app/api/v1/reviews/route";
import { POST as postLeadFeedback } from "@/app/api/v1/reviews/feedback/route";
import { GET as getHrEmployees, POST as postHrEmployee } from "@/app/api/v1/hr/employees/route";
import { GET as getHrEmployeeById, PUT as putHrEmployee, DELETE as deleteHrEmployee } from "@/app/api/v1/hr/employees/[id]/route";
import { GET as getProbation, POST as postProbation } from "@/app/api/v1/hr/probation/route";
import { GET as getCelebrations } from "@/app/api/v1/hr/celebrations/route";
import { GET as getAnnouncements, POST as postAnnouncement } from "@/app/api/v1/announcements/route";
import { POST as acknowledgeAnnouncement } from "@/app/api/v1/announcements/[id]/acknowledge/route";
import { GET as getAudit } from "@/app/api/v1/audit/route";

describe("Backend API Route Handlers Integration Suite", () => {
  function createJsonRequest(url: string, method = "GET", body?: any, email = "employee.test@xorstack.com") {
    const headers = new Headers({
      "Content-Type": "application/json",
      "x-user-email": email,
    });
    return new NextRequest(new URL(url, "http://localhost:3000"), {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  // 1. Workdays Module
  describe("Workday & SOD/EOD API", () => {
    let createdWorkdayId = "";
    let createdTaskId = "";

    it("GET /api/v1/workdays returns active workday", async () => {
      const req = createJsonRequest("/api/v1/workdays");
      const res = await getWorkdays(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });

    it("POST /api/v1/workdays initializes new workday", async () => {
      const req = createJsonRequest("/api/v1/workdays", "POST", {
        workDate: "2026-08-22",
        workMode: "OFFICE",
        plannedHours: 8,
      });
      const res = await postWorkdays(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
    });

    it("POST /api/v1/workdays/sod submits morning plan with deliverables", async () => {
      const req = createJsonRequest("/api/v1/workdays/sod", "POST", {
        workMode: "OFFICE",
        shift: "10:00 AM - 07:00 PM",
        plannedHours: 8,
        tasks: [
          {
            title: "Build backend REST route handlers",
            project: "Core API",
            priority: "HIGH",
            estimatedMinutes: 120,
            expectedOutput: "Route handlers pass all tests",
          },
        ],
      });
      const res = await postSod(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      createdWorkdayId = json.data.workday.id;
      createdTaskId = json.data.workday.dailyTasks[0].id;
      expect(createdWorkdayId).toBeDefined();
    });

    it("POST /api/v1/workdays/eod submits daily summary", async () => {
      const req = createJsonRequest("/api/v1/workdays/eod", "POST", {
        workdayId: createdWorkdayId,
        taskUpdates: [
          {
            id: createdTaskId,
            title: "Build backend REST route handlers",
            status: "COMPLETED",
            completionPercentage: 100,
            actualMinutes: 120,
          },
        ],
        achievements: "All API routes completed and tested",
        nextDayFocus: "Frontend integration",
      });
      const res = await postEod(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });

    it("PATCH /api/v1/workdays/tasks updates task progress", async () => {
      const req = createJsonRequest("/api/v1/workdays/tasks", "PATCH", {
        taskId: createdTaskId || "task-101",
        completionPercentage: 100,
        status: "COMPLETED",
      });
      const res = await patchTask(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.task.status).toBe("COMPLETED");
    });
  });

  // 2. Leave & WFH Module
  describe("Leave & WFH Authorization API", () => {
    let createdLeaveId = "";

    it("GET /api/v1/leave lists leave requests and balances", async () => {
      const req = createJsonRequest("/api/v1/leave");
      const res = await getLeave(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data.requests)).toBe(true);
    });

    it("POST /api/v1/leave submits leave application", async () => {
      const req = createJsonRequest("/api/v1/leave", "POST", {
        leaveType: "CASUAL",
        startDate: "2026-09-10",
        endDate: "2026-09-11",
        daysCount: 2,
        reason: "Family event",
      });
      const res = await postLeave(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      createdLeaveId = json.data.request.id;
      expect(createdLeaveId).toBeDefined();
    });

    it("POST /api/v1/leave/[id]/approve and reject execute properly", async () => {
      const approveReq = createJsonRequest(`/api/v1/leave/${createdLeaveId}/approve`, "POST", {
        comment: "Lead approval granted",
      }, "lead.test@xorstack.com");
      const approveRes = await approveLeave(approveReq, { params: Promise.resolve({ id: createdLeaveId }) });
      expect(approveRes.status).toBe(200);

      const rejectReq = createJsonRequest(`/api/v1/leave/${createdLeaveId}/reject`, "POST", {
        reason: "Sprint delivery crunch",
      }, "hr.test@xorstack.com");
      const rejectRes = await rejectLeave(rejectReq, { params: Promise.resolve({ id: createdLeaveId }) });
      expect(rejectRes.status).toBe(200);
    });

    it("GET & POST /api/v1/leave/wfh applies and lists remote days", async () => {
      const applyReq = createJsonRequest("/api/v1/leave/wfh", "POST", {
        startDate: "2026-09-15",
        endDate: "2026-09-15",
        reason: "Home maintenance",
        deliverables: "Focus on API architecture documentation",
      });
      const applyRes = await postWfh(applyReq);
      expect(applyRes.status).toBe(201);
      const applyJson = await applyRes.json();
      expect(applyJson.success).toBe(true);

      const listReq = createJsonRequest("/api/v1/leave/wfh");
      const listRes = await getWfh(listReq);
      expect(listRes.status).toBe(200);
    });
  });

  // 3. Attendance & Biometric Module
  describe("Attendance & Biometrics API", () => {
    it("GET /api/v1/attendance returns muster roll and shift adherence", async () => {
      const req = createJsonRequest("/api/v1/attendance");
      const res = await getAttendance(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.shiftAdherence).toBeDefined();
    });

    it("POST /api/v1/attendance/punch records punch event", async () => {
      const req = createJsonRequest("/api/v1/attendance/punch", "POST", {
        punchType: "IN",
        terminalId: "dev-hq-floor3",
        employeeCode: "BIO-101",
      });
      const res = await postPunch(req);
      expect(res.status).toBe(201);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.punch.totalIngested).toBe(1);
    });
  });

  // 4. Goals & Weekly Sprint OKRs Module
  describe("Goals & OKRs API", () => {
    it("GET, POST & PATCH /api/v1/goals creates, lists, and updates goals", async () => {
      const createReq = createJsonRequest("/api/v1/goals", "POST", {
        title: "Achieve 100% backend API coverage",
        period: "SPRINT",
        weightage: 40,
        priority: "HIGH",
      });
      const createRes = await postGoals(createReq);
      expect(createRes.status).toBe(201);
      const createJson = await createRes.json();
      const goalId = createJson.data.goal.id;
      expect(goalId).toBeDefined();

      const listReq = createJsonRequest("/api/v1/goals");
      const listRes = await getGoals(listReq);
      expect(listRes.status).toBe(200);

      const patchReq = createJsonRequest(`/api/v1/goals/${goalId}`, "PATCH", {
        progressPercentage: 100,
        currentValue: 100,
        status: "COMPLETED",
      });
      const patchRes = await patchGoal(patchReq, { params: Promise.resolve({ id: goalId }) });
      expect(patchRes.status).toBe(200);
    });
  });

  // 5. Performance Reviews & Feedback Module
  describe("Reviews & Feedback API", () => {
    it("GET /api/v1/reviews returns review cycles", async () => {
      const req = createJsonRequest("/api/v1/reviews");
      const res = await getReviews(req);
      expect(res.status).toBe(200);
    });

    it("POST /api/v1/reviews/feedback logs Lead daily EOD feedback", async () => {
      const req = createJsonRequest(
        "/api/v1/reviews/feedback",
        "POST",
        {
          employeeId: "emp-sarah",
          employeeName: "Sarah Dev",
          note: "Outstanding API architecture design.",
          rating: 5,
          actionItem: "Finalize integration tests",
        },
        "lead.test@xorstack.com"
      );
      const res = await postLeadFeedback(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
    });
  });

  // 6. HR & People Operations (Employee CRUD & Celebrations) Module
  describe("HR & People Operations API", () => {
    it("GET, POST, PUT, DELETE /api/v1/hr/employees manages employee roster", async () => {
      const createReq = createJsonRequest(
        "/api/v1/hr/employees",
        "POST",
        {
          name: "Vikramaditya Rao",
          email: "vikramaditya.rao@xorstack.com",
          designation: "Principal Architect",
          departmentId: "dept-dev",
          workMode: "HYBRID",
          remainingLeaveBalance: 14.0,
        },
        "hr.test@xorstack.com"
      );
      const createRes = await postHrEmployee(createReq);
      expect(createRes.status).toBe(201);
      const createJson = await createRes.json();
      const empId = createJson.data.employee.id;
      expect(empId).toBeDefined();

      const getReq = createJsonRequest(`/api/v1/hr/employees/${empId}`, "GET", undefined, "hr.test@xorstack.com");
      const getRes = await getHrEmployeeById(getReq, { params: Promise.resolve({ id: empId }) });
      expect(getRes.status).toBe(200);

      const putReq = createJsonRequest(`/api/v1/hr/employees/${empId}`, "PUT", {
        designation: "Chief Software Architect",
      }, "hr.test@xorstack.com");
      const putRes = await putHrEmployee(putReq, { params: Promise.resolve({ id: empId }) });
      expect(putRes.status).toBe(200);

      const listReq = createJsonRequest("/api/v1/hr/employees", "GET", undefined, "hr.test@xorstack.com");
      const listRes = await getHrEmployees(listReq);
      expect(listRes.status).toBe(200);

      const deleteReq = createJsonRequest(`/api/v1/hr/employees/${empId}`, "DELETE", undefined, "hr.test@xorstack.com");
      const deleteRes = await deleteHrEmployee(deleteReq, { params: Promise.resolve({ id: empId }) });
      expect(deleteRes.status).toBe(200);
    });

    it("GET & POST /api/v1/hr/probation handles probation checkpoints", async () => {
      const getReq = createJsonRequest("/api/v1/hr/probation", "GET", undefined, "hr.test@xorstack.com");
      const getRes = await getProbation(getReq);
      expect(getRes.status).toBe(200);

      const postReq = createJsonRequest("/api/v1/hr/probation", "POST", {
        id: "pr-1",
        decision: "CONFIRM",
      }, "hr.test@xorstack.com");
      const postRes = await postProbation(postReq);
      expect(postRes.status).toBe(200);
    });

    it("GET /api/v1/hr/celebrations returns birthdays and festivals", async () => {
      const req = createJsonRequest("/api/v1/hr/celebrations", "GET", undefined, "hr.test@xorstack.com");
      const res = await getCelebrations(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.data.celebrations.todayBirthdays).toBeDefined();
      expect(json.data.celebrations.upcomingFestivals).toBeDefined();
    });
  });

  // 7. Announcements & Global Broadcasts Module
  describe("Announcements & Global Broadcasts API", () => {
    it("GET, POST & Acknowledge /api/v1/announcements publishes and acknowledges broadcasts", async () => {
      const postReq = createJsonRequest(
        "/api/v1/announcements",
        "POST",
        {
          title: "Q3 2026 Engineering All-Hands Gala",
          body: "All teams gather for architecture showcases and celebration!",
          priority: "STANDARD",
          audience: "ALL",
        },
        "hr.test@xorstack.com"
      );
      const postRes = await postAnnouncement(postReq);
      expect(postRes.status).toBe(201);
      const postJson = await postRes.json();
      const ancId = postJson.data.announcement.id;
      expect(ancId).toBeDefined();

      const getReq = createJsonRequest("/api/v1/announcements");
      const getRes = await getAnnouncements(getReq);
      expect(getRes.status).toBe(200);

      const ackReq = createJsonRequest(`/api/v1/announcements/${ancId}/acknowledge`, "POST");
      const ackRes = await acknowledgeAnnouncement(ackReq, { params: Promise.resolve({ id: ancId }) });
      expect(ackRes.status).toBe(200);
    });
  });

  // 8. Audit Vault Module
  describe("Audit Vault API", () => {
    it("GET /api/v1/audit returns HMAC-verified audit logs for Admin", async () => {
      const req = createJsonRequest("/api/v1/audit", "GET", undefined, "admin.test@xorstack.com");
      const res = await getAudit(req);
      expect(res.status).toBe(200);
      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.encryptionAlgorithm).toBe("HMAC-SHA256");
      expect(json.data.isVaultTamperFree).toBe(true);
    });
  });
});
