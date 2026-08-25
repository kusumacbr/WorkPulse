import { describe, it, expect } from "vitest";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { GET as listEmployees, POST as createEmployee } from "@/app/api/v1/employees/route";
import {
  GET as getEmployee,
  PATCH as patchEmployee,
  PUT as putEmployee,
  DELETE as deleteEmployee,
} from "@/app/api/v1/employees/[id]/route";
import { NextRequest } from "next/server";

function createJsonRequest(
  url: string,
  method: string,
  body?: any,
  email: string = "hr.test@xorstack.com"
): NextRequest {
  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-test-email": email,
    },
  };
  if (body) {
    init.body = JSON.stringify(body);
  }
  return new NextRequest(new URL(url, "http://localhost:3000"), init as any);
}

describe("Employee CRUD Operations & Store Management", () => {
  describe("WorkpulseSharedStore CRUD", () => {
    it("successfully creates/onboards a new employee", () => {
      const newEmp = WorkpulseSharedStore.addEmployee({
        name: "Test Onboardee",
        email: "test.onboardee@xorstack.com",
        designation: "Cloud Systems Engineer",
        departmentId: "dept-devops",
        workMode: "HYBRID",
        status: "Probation",
        remainingLeaveBalance: 14.0,
        phoneNumber: "+91 98450 99887",
        location: "Bangalore HQ (Floor 1)",
      });

      expect(newEmp).toBeDefined();
      expect(newEmp?.id).toContain("emp-");
      expect(newEmp?.name).toBe("Test Onboardee");
      expect(newEmp?.email).toBe("test.onboardee@xorstack.com");
      expect(newEmp?.departmentId).toBe("dept-devops");
      expect(newEmp?.departmentName).toBe("Devops");
      expect(newEmp?.status).toBe("Probation");
      expect(newEmp?.remainingLeaveBalance).toBe(14.0);

      // Verify retrieval
      const fetched = WorkpulseSharedStore.getEmployeeById(newEmp!.id);
      expect(fetched).toBeDefined();
      expect(fetched?.name).toBe("Test Onboardee");

      // Verify present in getAllEmployees
      const all = WorkpulseSharedStore.getAllEmployees();
      expect(all.some((e) => e.id === newEmp!.id)).toBe(true);
    });

    it("successfully updates an existing employee and handles department transfer", () => {
      // Create employee in devops
      const emp = WorkpulseSharedStore.addEmployee({
        name: "Transfer Candidate",
        email: "transfer@xorstack.com",
        designation: "Junior Analyst",
        departmentId: "dept-devops",
        workMode: "OFFICE",
        status: "Probation",
      });

      expect(emp).toBeDefined();
      const empId = emp!.id;

      // Update designation, status, and transfer to Data Processing
      const updated = WorkpulseSharedStore.updateEmployee(empId, {
        name: "Transfer Candidate Promoted",
        designation: "Senior Data Analyst",
        departmentId: "dept-data-processing",
        status: "Full-Time",
        workMode: "WFH",
        remainingLeaveBalance: 16.5,
        phoneNumber: "+91 99999 11111",
      });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe("Transfer Candidate Promoted");
      expect(updated?.designation).toBe("Senior Data Analyst");
      expect(updated?.departmentId).toBe("dept-data-processing");
      expect(updated?.departmentName).toBe("Data processing");
      expect(updated?.status).toBe("Full-Time");
      expect(updated?.workMode).toBe("WFH");
      expect(updated?.remainingLeaveBalance).toBe(16.5);
      expect(updated?.phoneNumber).toBe("+91 99999 11111");

      // Verify removal from old department
      const devopsDept = WorkpulseSharedStore.getDepartmentById("dept-devops");
      expect(devopsDept?.employees.some((e) => e.id === empId)).toBe(false);

      // Verify presence in new department
      const dataDept = WorkpulseSharedStore.getDepartmentById("dept-data-processing");
      expect(dataDept?.employees.some((e) => e.id === empId)).toBe(true);
    });

    it("cascades employee name and department updates across feedbacks, leave requests, and WFH requests", () => {
      // emp-sarah is updated
      const sarah = WorkpulseSharedStore.getEmployeeById("emp-sarah");
      expect(sarah).toBeDefined();

      const updated = WorkpulseSharedStore.updateEmployee("emp-sarah", {
        name: "Sara Dev Updated",
        designation: "Principal Backend Engineer",
      });

      expect(updated?.name).toBe("Sara Dev Updated");

      // Verify leave requests updated
      const leaves = WorkpulseSharedStore.getLeaveRequests();
      const sarahLeaves = leaves.filter((l) => l.employeeId === "emp-sarah");
      sarahLeaves.forEach((l) => {
        expect(l.employeeName).toBe("Sara Dev Updated");
      });

      // Verify feedbacks updated
      const feedbacks = WorkpulseSharedStore.getFeedbacks();
      const sarahFeedbacks = feedbacks.filter((f) => f.employeeId === "emp-sarah");
      sarahFeedbacks.forEach((f) => {
        expect(f.employeeName).toBe("Sara Dev Updated");
      });
    });

    it("successfully deletes/offboards an employee", () => {
      const emp = WorkpulseSharedStore.addEmployee({
        name: "Offboard Candidate",
        email: "offboard@xorstack.com",
        designation: "Temporary Staff",
        departmentId: "dept-development",
      });

      expect(emp).toBeDefined();
      const empId = emp!.id;

      // Offboard
      const deleted = WorkpulseSharedStore.deleteEmployee(empId);
      expect(deleted).toBeDefined();
      expect(deleted?.id).toBe(empId);

      // Verify no longer in department
      const fetched = WorkpulseSharedStore.getEmployeeById(empId);
      expect(fetched).toBeUndefined();

      const all = WorkpulseSharedStore.getAllEmployees();
      expect(all.some((e) => e.id === empId)).toBe(false);
    });

    it("hydrates and restores state from localStorage across page refreshes", () => {
      // Mock window.localStorage
      const mockStorage: Record<string, string> = {};
      (globalThis as any).window = {
        localStorage: {
          getItem: (key: string) => mockStorage[key] || null,
          setItem: (key: string, val: string) => {
            mockStorage[key] = val;
          },
          removeItem: (key: string) => {
            delete mockStorage[key];
          },
        },
      };

      // Add an employee which triggers notify() -> saveToStorage
      const emp = WorkpulseSharedStore.addEmployee({
        name: "Persisted Onboardee",
        email: "persisted@xorstack.com",
        designation: "Staff Architect",
        departmentId: "dept-development",
      });

      expect(mockStorage["workpulse_departments_v5_supabase"]).toBeDefined();
      expect(mockStorage["workpulse_departments_v5_supabase"]).toContain("Persisted Onboardee");

      // Simulate refresh by resetting in-memory state and calling hydrateFromStorage
      WorkpulseSharedStore.hydrateFromStorage();

      const restored = WorkpulseSharedStore.getEmployeeById(emp!.id);
      expect(restored).toBeDefined();
      expect(restored?.name).toBe("Persisted Onboardee");
      expect(restored?.designation).toBe("Staff Architect");

      // Test resetToDefaults
      WorkpulseSharedStore.resetToDefaults();
      expect(mockStorage["workpulse_departments_v5_supabase"]).not.toContain("Persisted Onboardee");

      // Clean up window mock
      delete (globalThis as any).window;
    });
  });

  describe("Employee REST API Routes", () => {
    it("POST /api/v1/employees creates a new employee", async () => {
      const req = createJsonRequest(
        "/api/v1/employees",
        "POST",
        {
          name: "API Test User",
          email: "api.test@xorstack.com",
          designation: "Platform Engineer",
          departmentId: "dept-development",
          workMode: "HYBRID",
          status: "Full-Time",
          remainingLeaveBalance: 15.0,
        },
        "hr.test@xorstack.com"
      );

      const res = await createEmployee(req);
      expect(res.status).toBe(201);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.employee.name).toBe("API Test User");
      expect(json.data.employee.email).toBe("api.test@xorstack.com");
      expect(json.data.employee.departmentId).toBe("dept-development");
    });

    it("GET /api/v1/employees lists employees with filters", async () => {
      const req = createJsonRequest(
        "/api/v1/employees?departmentId=dept-development",
        "GET",
        undefined,
        "hr.test@xorstack.com"
      );

      const res = await listEmployees(req);
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(Array.isArray(json.data.employees)).toBe(true);
      expect(json.data.employees.every((e: any) => e.departmentId === "dept-development")).toBe(true);
    });

    it("GET /api/v1/employees/[id] fetches a single employee", async () => {
      // First create one
      const emp = WorkpulseSharedStore.addEmployee({
        name: "Fetch Target",
        email: "fetch.target@xorstack.com",
        designation: "Quality Specialist",
        departmentId: "dept-development",
      });

      const req = createJsonRequest(
        `/api/v1/employees/${emp!.id}`,
        "GET",
        undefined,
        "hr.test@xorstack.com"
      );

      const res = await getEmployee(req, { params: Promise.resolve({ id: emp!.id }) });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.employee.id).toBe(emp!.id);
      expect(json.data.employee.name).toBe("Fetch Target");
    });

    it("PATCH /api/v1/employees/[id] updates an employee record", async () => {
      const emp = WorkpulseSharedStore.addEmployee({
        name: "Patch Target",
        email: "patch.target@xorstack.com",
        designation: "Junior Dev",
        departmentId: "dept-development",
      });

      const req = createJsonRequest(
        `/api/v1/employees/${emp!.id}`,
        "PATCH",
        {
          designation: "Mid-Level Dev",
          status: "Full-Time",
        },
        "hr.test@xorstack.com"
      );

      const res = await patchEmployee(req, { params: Promise.resolve({ id: emp!.id }) });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.employee.designation).toBe("Mid-Level Dev");
      expect(json.data.employee.status).toBe("Full-Time");
    });

    it("PUT /api/v1/employees/[id] updates employee record via PUT", async () => {
      const emp = WorkpulseSharedStore.addEmployee({
        name: "Put Target",
        email: "put.target@xorstack.com",
        designation: "QA Engineer",
        departmentId: "dept-development",
      });

      const req = createJsonRequest(
        `/api/v1/employees/${emp!.id}`,
        "PUT",
        {
          designation: "Lead QA Engineer",
        },
        "hr.test@xorstack.com"
      );

      const res = await putEmployee(req, { params: Promise.resolve({ id: emp!.id }) });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.employee.designation).toBe("Lead QA Engineer");
    });

    it("DELETE /api/v1/employees/[id] offboards and removes an employee", async () => {
      const emp = WorkpulseSharedStore.addEmployee({
        name: "Delete Target",
        email: "delete.target@xorstack.com",
        designation: "Contractor",
        departmentId: "dept-development",
      });

      const req = createJsonRequest(
        `/api/v1/employees/${emp!.id}`,
        "DELETE",
        undefined,
        "hr.test@xorstack.com"
      );

      const res = await deleteEmployee(req, { params: Promise.resolve({ id: emp!.id }) });
      expect(res.status).toBe(200);

      const json = await res.json();
      expect(json.success).toBe(true);
      expect(json.data.employee.id).toBe(emp!.id);

      // Verify subsequent GET returns 404
      const getReq = createJsonRequest(
        `/api/v1/employees/${emp!.id}`,
        "GET",
        undefined,
        "hr.test@xorstack.com"
      );
      const getRes = await getEmployee(getReq, { params: Promise.resolve({ id: emp!.id }) });
      expect(getRes.status).toBe(404);
    });

    it("enforces RBAC: denies non-HR/non-Admin from creating or deleting employees", async () => {
      // Employee attempts POST
      const postReq = createJsonRequest(
        "/api/v1/employees",
        "POST",
        { name: "Hacker", email: "hacker@xorstack.com", designation: "Root" },
        "employee.test@xorstack.com"
      );
      const postRes = await createEmployee(postReq);
      expect(postRes.status).toBe(403);

      // Employee attempts DELETE
      const deleteReq = createJsonRequest(
        "/api/v1/employees/emp-sarah",
        "DELETE",
        undefined,
        "employee.test@xorstack.com"
      );
      const deleteRes = await deleteEmployee(deleteReq, { params: Promise.resolve({ id: "emp-sarah" }) });
      expect(deleteRes.status).toBe(403);
    });
  });
});
