import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { triggerBroadcastPopup } from "@/lib/stores/broadcast-popup-store";

export async function GET(req: NextRequest) {
  try {
    await getSessionActor(req);

    const celebrations = {
      todayBirthdays: [
        {
          id: "emp-sarah",
          name: "Sara Dev",
          role: "Sr. Backend Engineer",
          department: "Development",
          birthDate: "August 21",
          avatar: "SD",
          isToday: true,
        },
      ],
      upcomingFestivals: [
        {
          id: "fest-diwali",
          title: "Diwali (Festival of Lights)",
          date: "November 08, 2026",
          accentEmoji: "🪔",
          isHoliday: true,
        },
        {
          id: "fest-xmas",
          title: "Christmas Gala & Winter Social",
          date: "December 25, 2026",
          accentEmoji: "🎄",
          isHoliday: true,
        },
      ],
    };

    return apiSuccess({ celebrations });
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch celebrations", 400);
  }
}

export async function POST(req: NextRequest) {
  try {
    await getSessionActor(req);
    const body = await req.json().catch(() => ({}));

    if (!body.title || !body.message) {
      return apiError("title and message are required", 400);
    }

    triggerBroadcastPopup({
      id: `pop-${Date.now()}`,
      type: body.type || "BIRTHDAY",
      title: body.title,
      message: body.message,
      author: body.author || "People Operations",
      targetAudience: body.targetAudience || "All Staff (19)",
      badge: body.badge || "Company Broadcast",
      accentEmoji: body.accentEmoji || "🎉",
      linkUrl: "/hr",
    });

    return apiSuccess({ message: "Celebration broadcast dispatched successfully" }, 201);
  } catch (err: any) {
    return apiError(err.message || "Failed to broadcast celebration", 400);
  }
}
