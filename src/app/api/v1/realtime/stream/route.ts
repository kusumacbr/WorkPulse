import { NextRequest } from "next/server";
import { realtimeEventBus, RealtimeEvent } from "@/server/realtime/event-bus";

export const dynamic = "force-dynamic";
export const maxDuration = 60;


export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let isClosed = false;

      const safeEnqueue = (data: string) => {
        if (isClosed) return;
        try {
          controller.enqueue(encoder.encode(data));
        } catch {
          isClosed = true;
        }
      };

      // 1. Send initial connected event
      const initialPayload = JSON.stringify({
        type: "connected",
        message: "WorkPulse Real-Time Event Stream Established",
        timestamp: new Date().toISOString(),
      });
      safeEnqueue(`data: ${initialPayload}\n\n`);

      // 2. Subscribe to server RealtimeEventBus
      const unsubscribe = realtimeEventBus.subscribe((event: RealtimeEvent) => {
        if (isClosed) return;
        try {
          const chunk = `data: ${JSON.stringify(event)}\n\n`;
          safeEnqueue(chunk);
        } catch {
          isClosed = true;
        }
      });

      // 3. Heartbeat ping every 15 seconds to prevent client timeout
      const heartbeatInterval = setInterval(() => {
        if (isClosed) {
          clearInterval(heartbeatInterval);
          return;
        }
        safeEnqueue(`: heartbeat\n\n`);
      }, 15000);

      // 4. Handle client disconnect / cancellation
      req.signal.addEventListener("abort", () => {
        isClosed = true;
        clearInterval(heartbeatInterval);
        unsubscribe();
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
