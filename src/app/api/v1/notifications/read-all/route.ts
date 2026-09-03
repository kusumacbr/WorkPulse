import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { NotificationService } from "@/server/services/notification-service";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { user } = await getSessionActor(req);
    await NotificationService.markAllAsRead(user.id);
    return apiSuccess({ message: "All notifications marked as read." });
  } catch (err: any) {
    return apiError(err.message || "Failed to mark all notifications as read", 500);
  }
}
