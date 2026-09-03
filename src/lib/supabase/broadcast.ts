import { createAdminClient } from "./admin";

/**
 * Server-side broadcast helper for Supabase Realtime.
 * Uses HTTP REST delivery (httpSend) to reliably broadcast events
 * to all connected browser WebSocket clients without deprecation warnings.
 */
export async function broadcastServerEvent(event: string, payload: any): Promise<void> {
  try {
    const supabaseAdmin = createAdminClient();
    if (!supabaseAdmin) return;

    const channel = supabaseAdmin.channel("workpulse-supabase-live-channel");
    if (typeof (channel as any).httpSend === "function") {
      await (channel as any).httpSend(event, payload || {});
    } else {
      await channel.send({
        type: "broadcast",
        event,
        payload: payload || {},
      });
    }
  } catch (err: any) {
    console.warn(`[Supabase Broadcast] Failed to broadcast event "${event}":`, err?.message || err);
  }
}
