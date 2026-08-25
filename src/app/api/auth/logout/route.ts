import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const url = new URL("/", req.url);
  return NextResponse.redirect(url, { status: 303 });
}

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  await supabase.auth.signOut();

  const url = new URL("/", req.url);
  return NextResponse.redirect(url, { status: 303 });
}
