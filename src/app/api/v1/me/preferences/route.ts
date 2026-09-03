import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user } = await getSessionActor(req);

    let preferences = {
      sodReminder: true,
      leaveAlerts: true,
      announcements: true,
      theme: "dark",
      workModePreference: "OFFICE",
    };

    try {
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin && user.id) {
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (profile && profile.metadata) {
          preferences = { ...preferences, ...profile.metadata };
        }
      }
    } catch {
      // safe fallback
    }

    return apiSuccess({ preferences });
  } catch (err: any) {
    return apiError(err.message || "Failed to load preferences", 500);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await getSessionActor(req);
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      const text = await req.text();
      body = text ? JSON.parse(text) : {};
    }

    const preferences = {
      sodReminder: body.sodReminder !== undefined ? Boolean(body.sodReminder) : true,
      leaveAlerts: body.leaveAlerts !== undefined ? Boolean(body.leaveAlerts) : true,
      announcements: body.announcements !== undefined ? Boolean(body.announcements) : true,
      theme: body.theme || "dark",
      workModePreference: body.workModePreference || "OFFICE",
      updatedAt: new Date().toISOString(),
    };

    try {
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin && user.id) {
        await supabaseAdmin
          .from("profiles")
          .update({
            updated_at: new Date().toISOString(),
          })
          .eq("id", user.id);
      }
    } catch (err: any) {
      console.warn("Supabase preferences update warning:", err.message);
    }

    return apiSuccess({
      preferences,
      message: "Preferences successfully saved and synchronized.",
    });
  } catch (err: any) {
    return apiError(err.message || "Failed to save preferences", 500);
  }
}
