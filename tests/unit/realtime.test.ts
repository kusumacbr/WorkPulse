import { describe, it, expect, vi } from "vitest";
import { realtimeEventBus } from "@/server/realtime/event-bus";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { GET as getRealtimeStream } from "@/app/api/v1/realtime/stream/route";
import { NextRequest } from "next/server";

describe("WorkPulse Real-Time Event Bus & SSE Stream", () => {
  it("should subscribe to and receive live backend events", () => {
    const listener = vi.fn();
    const unsubscribe = realtimeEventBus.subscribe(listener);

    const event = realtimeEventBus.emit("employee:created", {
      id: "emp-test-realtime",
      name: "Realtime Tester",
    });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "employee:created",
        payload: { id: "emp-test-realtime", name: "Realtime Tester" },
      })
    );
    expect(event.id).toBeDefined();
    expect(event.timestamp).toBeDefined();

    unsubscribe();

    realtimeEventBus.emit("employee:deleted", { id: "emp-test-realtime" });
    expect(listener).toHaveBeenCalledTimes(1); // Not called after unsubscribe
  });

  it("should emit realtime events when WorkpulseSharedStore performs CRUD operations", () => {
    const listener = vi.fn();
    const unsubscribe = realtimeEventBus.subscribe(listener);

    const newEmp = WorkpulseSharedStore.addEmployee({
      name: "Live Sync User",
      email: "live.sync@xorstack.com",
      designation: "Realtime Systems Engineer",
      departmentId: "dept-engineering",
    });

    expect(newEmp).toBeDefined();
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "employee:created",
        payload: expect.objectContaining({ name: "Live Sync User" }),
      })
    );

    if (newEmp) {
      WorkpulseSharedStore.updateEmployee(newEmp.id, { designation: "Staff Realtime Engineer" });
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "employee:updated",
          payload: expect.objectContaining({ designation: "Staff Realtime Engineer" }),
        })
      );

      WorkpulseSharedStore.deleteEmployee(newEmp.id);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "employee:deleted",
          payload: expect.objectContaining({ id: newEmp.id }),
        })
      );
    }

    unsubscribe();
  });

  it("should emit realtime events for Leave & WFH two-stage approvals", () => {
    const listener = vi.fn();
    const unsubscribe = realtimeEventBus.subscribe(listener);

    WorkpulseSharedStore.tlApproveLeave("req-leave-001", "Approved for Sprint 34");
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "leave:approved",
        payload: expect.objectContaining({ id: "req-leave-001", stage: "STAGE_1" }),
      })
    );

    WorkpulseSharedStore.hrApproveLeave("req-leave-001", "Final HR clearance");
    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "leave:approved",
        payload: expect.objectContaining({ id: "req-leave-001", stage: "STAGE_2" }),
      })
    );

    unsubscribe();
  });

  it("should establish SSE response with text/event-stream headers", async () => {
    const req = new NextRequest("http://localhost:3000/api/v1/realtime/stream");
    const response = await getRealtimeStream(req);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("text/event-stream");
    expect(response.headers.get("Cache-Control")).toBe("no-cache, no-transform");
    expect(response.headers.get("Connection")).toBe("keep-alive");
  });
});
