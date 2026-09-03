import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";

export async function POST(_req: NextRequest) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {}

  const cookieStore = await cookies();
  cookieStore.delete("workpulse_dev_email");
  cookieStore.delete("workpulse_dev_role");

  return NextResponse.json({ success: true, message: "Logged out successfully" });
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch {}

  const cookieStore = await cookies();
  cookieStore.delete("workpulse_dev_email");
  cookieStore.delete("workpulse_dev_role");

  const url = new URL("/login", req.url);
  return NextResponse.redirect(url, { status: 303 });
}
