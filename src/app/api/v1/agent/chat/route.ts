import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export const dynamic = "force-dynamic";

interface AdkEventPart {
  text?: string;
}

interface AdkEvent {
  author?: string;
  modelVersion?: string;
  content?: {
    parts?: AdkEventPart[];
    role?: string;
  };
}

const WORKPULSE_SYSTEM_KNOWLEDGE = `You are root_agent, the intelligent organizational AI assistant integrated directly into WorkPulse (the internal workspace & performance execution platform for Xorstack Inc.).

CORE WORKPULSE APPLICATION KNOWLEDGE BASE:

1. AUTHENTICATED PERSONAS & ROLES:
   - EMPLOYEE (e.g., Sarah Dev - employee.test@xorstack.com):
     * Daily SOD/EOD routines with 1-click task carryover & rollover.
     * Biometric shift punches at Bangalore HQ Terminal #1.
     * Leave balance quotas & 2-stage leave application.
     * Quarterly skill goals and OKRs.
   - TEAM LEAD (e.g., Alex Lead - lead.test@xorstack.com):
     * Pod sprint deliverables and daily task oversight.
     * Daily task review, blocker unblocking, and evening feedback.
     * Attendance page: "Who's Present Today" tab is 1st, "My Punches" is 2nd, "Holiday Calendar" is 3rd.
     * Stage-1 Leave & WFH review and recommendation.
     * Probation ratings and Lead recommendations.
   - PEOPLE OPS / HR (e.g., Rachel HR - hr.test@xorstack.com):
     * Stage-2 final compliance sign-off for leaves and WFH.
     * Organization-wide staff directory, headcount, and departments.
     * 30/60/90-day probation confirmations ("Confirm Employment" or "Extend 30d").
     * Broadcasts & Culture is exclusively managed by HR.
   - (Note: No "Admin" role is exposed on the landing page or standard navigation).

2. ATTENDANCE & BIOMETRIC POLICY:
   - Standard Shift Timing: 10:00 AM to 07:00 PM (Monday – Friday, 9 hours gross).
   - Grace Window: Clocking in at or before 10:15 AM is marked ON TIME. Punches after 10:15 AM are flagged as LATE ARRIVAL.
   - Biometric Punches: 1-tap virtual punch connected to Bangalore HQ Terminal #1.
   - Tab Ordering on Attendance Page:
     * Employee view: "My Punches" (1st), "Who's Where" (2nd), "Holiday Calendar" (3rd).
     * Team Lead view: "Who's Present Today" (1st), "My Punches" (2nd), "Holiday Calendar" (3rd).
     * HR view: "Enterprise Oversight" (1st), "Who's Where" (2nd), "Holiday Calendar" (3rd).

3. DAILY WORKDAYS (SOD & EOD):
   - Start-of-Day (SOD): Plan morning priorities using sprint templates (Frontend Feature Dev, Bug Fixing & QA, API Integration, Architecture Review) or custom tasks with estimated hours and priorities.
   - Task Carryover / Rollover: 1-click carryover for pending items from the previous workday.
   - Timers & Blocker Flags: Real-time task timer tracking and blocker escalation to Team Lead.
   - End-of-Day (EOD): Summary of completed work, unfinished tasks, and reflection notes submitted for Team Lead review.

4. LEAVE & WFH GOVERNANCE:
   - Leave types: Casual Leave (CL), Sick Leave (SL), Earned Leave (EL), Work from Home (WFH).
   - Live quota deduction from annual allotment.
   - 2-Stage Approval Pipeline:
     * Stage 1: Team Lead review & recommendation.
     * Stage 2: People Ops / HR final compliance authorization.
   - Handover notes & backup coverage employee are mandatory for leave requests.

5. NEW JOINERS & PROBATION:
   - 30-Day Checklist: Technical onboarding, IT provisioning, and initial mentor sync.
   - 60-Day & 90-Day Milestones: Evaluated on Sprint OKRs (target >90%), Shift punctuality (>95%), and Lead review.
   - HR Action: 1-click "Confirm Employment" or "Extend 30d".

6. BROADCASTS & CULTURE:
   - Exclusively managed by HR (Rachel HR).
   - Company-wide announcements, policy releases, celebrations, and town hall notices.

ASSISTANT INSTRUCTIONS:
- Always answer user questions accurately, concisely, and empathetically using the facts above.
- Address the user with context of their role and department.
- When asked about WorkPulse policies, features, shift times, leave pipeline, or attendance tabs, provide the exact facts above.`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const message = body.message?.trim();
    const incomingSessionId = body.sessionId?.trim();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const user = await getCurrentUser();
    const userId = user.id ? `user_${user.id.replace(/[^a-zA-Z0-9_-]/g, "_")}` : "user_guest";
    const sessionId = incomingSessionId || `session_${userId}_${Date.now()}`;

    const adkUrl = process.env.ADK_AGENT_URL || "http://127.0.0.1:8000";
    const appName = process.env.ADK_APP_NAME || "sample_agent";
    const apiKey = process.env.GOOGLE_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-3.6-flash";

    // 1. Try communicating with the local ADK Agent Server first
    try {
      const adkRunUrl = `${adkUrl}/run`;
      
      // Ensure session exists if needed
      try {
        await fetch(`${adkUrl}/apps/${appName}/users/${userId}/sessions/${sessionId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
        });
      } catch {
        // Continue if session already exists or server handles auto-creation
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const adkResponse = await fetch(adkRunUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app_name: appName,
          user_id: userId,
          session_id: sessionId,
          content: {
            parts: [
              {
                text: `[SYSTEM CONTEXT & KNOWLEDGE]\n${WORKPULSE_SYSTEM_KNOWLEDGE}\n\n[USER CONTEXT]\nUser: ${user.name || "Employee"} | Email: ${user.email} | Role: ${user.primaryRole} | Dept: ${user.department || "General"} | Designation: ${user.designation || "Staff"}\n\n[USER MESSAGE]\n${message}`,
              },
            ],
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (adkResponse.ok) {
        const events: AdkEvent[] = await adkResponse.json();
        const textResponses: string[] = [];

        for (const event of events) {
          if (event.content?.parts) {
            for (const part of event.content.parts) {
              if (part.text) {
                textResponses.push(part.text);
              }
            }
          }
        }

        const reply = textResponses.join("\n").trim();
        if (reply) {
          return NextResponse.json({
            reply,
            sessionId,
            author: "root_agent",
            model: events[0]?.modelVersion || "sample_agent",
            source: "adk_server",
          });
        }
      }
    } catch {
      // ADK Server unreachable or timed out; proceed to fallback
    }

    // 2. Resilient Direct Gemini Bridge Fallback
    if (!apiKey) {
      return NextResponse.json(
        {
          error: "ADK Server is not reachable and GOOGLE_API_KEY is not configured.",
          reply: "The agent server is currently offline. Please run 'npm run agent:serve' to start the local ADK agent.",
          source: "offline_notice",
        },
        { status: 503 }
      );
    }

    const fallbackUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const directResponse = await fetch(fallbackUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: {
          parts: [
            {
              text: `${WORKPULSE_SYSTEM_KNOWLEDGE}\n\nACTIVE EMPLOYEE CONTEXT:\n- Full Name: ${user.name}\n- Email: ${user.email}\n- Primary Role: ${user.primaryRole}\n- Job Title / Designation: ${user.designation || "Staff Member"}\n- Department: ${user.department || "Operations"}\n- Team: ${user.team || "WorkPulse Team"}`,
            },
          ],
        },
        contents: [
          {
            parts: [{ text: message }],
          },
        ],
      }),
    });

    if (!directResponse.ok) {
      const errorText = await directResponse.text();
      return NextResponse.json(
        {
          error: `Gemini API returned ${directResponse.status}`,
          details: errorText,
          reply: "I am experiencing temporary latency reaching the agent model. Please try asking again in a moment.",
          source: "fallback_error",
        },
        { status: 502 }
      );
    }

    const data = await directResponse.json();
    const candidate = data.candidates?.[0];
    const replyText =
      candidate?.content?.parts?.[0]?.text ||
      "I received your request but have no content to display.";

    return NextResponse.json({
      reply: replyText,
      sessionId,
      author: "root_agent",
      model,
      source: "direct_gemini_bridge",
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { error: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}
