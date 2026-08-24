import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const url = new URL("/", req.url);
  const response = NextResponse.redirect(url, { status: 303 });

  response.cookies.delete("better-auth.session_token");
  response.cookies.delete("workpulse_dev_persona");

  return response;
}

export async function GET(req: NextRequest) {
  const url = new URL("/", req.url);
  const response = NextResponse.redirect(url, { status: 303 });

  response.cookies.delete("better-auth.session_token");
  response.cookies.delete("workpulse_dev_persona");

  return response;
}
