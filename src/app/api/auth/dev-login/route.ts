import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { apiSuccess, apiError } from "@/server/api-helpers";

export async function POST(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch {
      // empty body fallback
    }

    const email = body.email || "employee.test@xorstack.com";
    const role = body.role || "EMPLOYEE";

    const cookieStore = await cookies();
    cookieStore.set("workpulse_dev_email", email, { path: "/", httpOnly: false, sameSite: "lax" });
    cookieStore.set("workpulse_dev_role", role, { path: "/", httpOnly: false, sameSite: "lax" });

    return apiSuccess({ success: true, email, role, message: "Dev session active" });
  } catch (err: any) {
    return apiError(err.message || "Failed to set dev session", 500);
  }
}
