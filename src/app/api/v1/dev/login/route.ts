import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { AuditService } from "@/lib/audit/audit-service";
import { SEEDED_TEST_ACCOUNTS } from "@/lib/auth/dev-personas";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  // STRICT PRODUCTION ISOLATION: Must return 404 in production unless explicitly enabled
  const isDev = process.env.NODE_ENV === "development" || process.env.DEV_TOOLS_ENABLED === "true";
  if (!isDev) {
    return new NextResponse("Not Found", { status: 404 });
  }

  try {
    const { email } = await req.json();
    const allowed = SEEDED_TEST_ACCOUNTS.find((a) => a.email === email);

    if (!allowed) {
      return NextResponse.json(
        { error: "Invalid dev test persona email. Must be one of the 4 seeded test accounts." },
        { status: 400 }
      );
    }

    const token = `dev_sess_${crypto.randomBytes(24).toString("hex")}`;
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { email },
        include: {
          userRoles: {
            include: { role: true },
          },
          employee: true,
        },
      });

      if (user) {
        await prisma.session.create({
          data: {
            userId: user.id,
            token,
            expiresAt,
          },
        });
      }
    } catch (dbErr) {
      console.warn("[Dev Auth] Database lookup skipped/offline in dev mode:", dbErr);
    }

    const response = NextResponse.json({
      success: true,
      message: `Signed in as ${allowed.name} (${allowed.role})`,
      user: {
        email: allowed.email,
        name: allowed.name,
        role: allowed.role,
      },
      redirectUrl: "/dashboard",
    });

    // Set standard session cookie
    response.cookies.set({
      name: "better-auth.session_token",
      value: token,
      expires: expiresAt,
      path: "/",
      httpOnly: true,
      sameSite: "lax",
    });

    response.cookies.set({
      name: "workpulse_dev_persona",
      value: email,
      expires: expiresAt,
      path: "/",
      sameSite: "lax",
    });

    try {
      await AuditService.record({
        actorId: user?.id || "dev-session-user",
        action: "dev_persona_switched",
        entity: "Session",
        entityId: token,
        reason: `Dev persona switched to ${allowed.email} (${allowed.role})`,
      });
    } catch {
      // Graceful offline dev handling
    }

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Dev login error" }, { status: 500 });
  }
}

export async function GET() {
  const isDev = process.env.NODE_ENV === "development" || process.env.DEV_TOOLS_ENABLED === "true";
  if (!isDev) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return NextResponse.json({
    enabled: true,
    personas: SEEDED_TEST_ACCOUNTS,
  });
}
