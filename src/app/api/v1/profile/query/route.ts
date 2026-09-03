import { NextRequest } from "next/server";
import { apiSuccess, apiError, getSessionActor } from "@/server/api-helpers";
import { WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user, actor } = await getSessionActor(req);
    const userEmail = (user.email || "").toLowerCase();
    const userId = user.id;
    const isHR = actor.roles.includes("HR") || user.primaryRole === "HR" || userEmail.includes("hr") || userEmail.includes("admin") || userEmail.includes("director");

    let queries: any[] = [];

    // Query Supabase feedbacks table for PROFILE_QUERY
    try {
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        const { data: supaFeedbacks, error } = await supabaseAdmin
          .from("feedbacks")
          .select("*")
          .order("created_at", { ascending: false });

        if (!error && supaFeedbacks && supaFeedbacks.length > 0) {
          const profileFeedbacks = supaFeedbacks.filter(
            (f) =>
              f.author_name?.includes("HR-REQ-") ||
              f.lead_note?.includes("PROFILE_QUERY") ||
              (f.sod_note && f.sod_note.includes("Category:"))
          );

          queries = profileFeedbacks.map((f) => {
            let parsedNotes: any = {};
            try {
              parsedNotes = typeof f.lead_note === "string" && f.lead_note.startsWith("{") ? JSON.parse(f.lead_note) : {};
            } catch {}

            return {
              id: f.id,
              ticketNumber: parsedNotes.ticketNumber || f.author_name || `HR-REQ-${f.id.slice(0, 4)}`,
              employeeId: f.employee_id,
              employeeName: f.employee_name || "Employee",
              employeeEmail: userEmail,
              departmentName: user.department || "Development",
              category: parsedNotes.category || (f.sod_note?.replace("Category: ", "")) || "Personal Contact Details",
              requestedChange: parsedNotes.requestedChange || f.eod_comment || "Update profile records",
              reason: parsedNotes.reason || "Profile update request",
              status: f.eod_reviewed ? "APPROVED" : parsedNotes.status === "REJECTED" ? "REJECTED" : "PENDING_HR_REVIEW",
              submittedAt: new Date(f.created_at || Date.now()).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }),
            };
          });
        }
      }
    } catch (e) {
      console.warn("Supabase query fetch error:", e);
    }

    if (queries.length === 0) {
      const allQueries = WorkpulseSharedStore.getProfileQueries();
      queries = isHR
        ? allQueries
        : allQueries.filter(
            (q) =>
              q.employeeEmail.toLowerCase() === userEmail ||
              q.employeeId === userId ||
              q.employeeName.toLowerCase() === user.name.toLowerCase()
          );
    } else if (!isHR) {
      queries = queries.filter(
        (q) =>
          q.employeeEmail.toLowerCase() === userEmail ||
          q.employeeId === userId ||
          q.employeeName.toLowerCase() === user.name.toLowerCase()
      );
    }

    return apiSuccess({ queries });
  } catch (err: any) {
    return apiError(err.message || "Failed to fetch profile queries", 500);
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

    const category = body.category || "Personal Contact Details";
    const requestedChange = body.requestedChange?.trim();
    const reason = body.reason?.trim() || "Profile information update request.";

    if (!requestedChange) {
      return apiError("Please specify the requested change details", 422, "VALIDATION_FAILED");
    }

    // Submit to WorkpulseSharedStore
    const created = WorkpulseSharedStore.submitProfileQuery({
      employeeId: user.id,
      employeeName: user.name,
      employeeEmail: user.email,
      departmentName: user.department,
      category,
      requestedChange,
      reason,
    });

    // Persist to Supabase public.feedbacks table
    try {
      const supabaseAdmin = createAdminClient();
      if (supabaseAdmin) {
        await supabaseAdmin.from("feedbacks").insert({
          employee_id: user.id,
          employee_name: user.name,
          author_id: user.id,
          author_name: created.ticketNumber,
          sod_acknowledged: false,
          sod_note: `Category: ${category}`,
          eod_reviewed: false,
          eod_comment: requestedChange,
          lead_note: JSON.stringify({
            type: "PROFILE_QUERY",
            category,
            requestedChange,
            reason,
            ticketNumber: created.ticketNumber,
          }),
          rating: 5,
        });
      }
    } catch (err: any) {
      console.warn("Supabase profile query insert warning:", err.message);
    }

    return apiSuccess(
      {
        query: created,
        message: `Profile change query #${created.ticketNumber} submitted successfully to HR People Operations.`,
      },
      201
    );
  } catch (err: any) {
    return apiError(err.message || "Failed to submit profile query", 500);
  }
}
