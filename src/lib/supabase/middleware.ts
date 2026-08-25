import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const FALLBACK_SUPABASE_URL = "https://cqjnsznacqnzudpkgjjj.supabase.co";
const FALLBACK_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxam5zem5hY3FuenVkcGtnampqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1NzMxNDgsImV4cCI6MjEwMzE0OTE0OH0.I2utLcT7d-2gRL1v6xk4ON3MsyG83jRey14BG-5m-FE";

export async function updateSession(request: NextRequest) {
  try {
    let supabaseResponse = NextResponse.next({
      request,
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || FALLBACK_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || FALLBACK_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return supabaseResponse;
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    });

    // Check dev cookie first (1-click login & demo personas)
    const devEmail = request.cookies.get("workpulse_dev_email")?.value;

    let user: any = null;
    try {
      const { data } = await supabase.auth.getUser();
      user = data?.user;
    } catch {
      // safe fallback
    }

    const isAuthenticated = !!user || !!devEmail;

    // Protected routes — redirect to login if not authenticated
    const pathname = request.nextUrl.pathname;
    const isProtectedRoute =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/my-work") ||
      pathname.startsWith("/team") ||
      pathname.startsWith("/hr") ||
      pathname.startsWith("/admin") ||
      pathname.startsWith("/reviews") ||
      pathname.startsWith("/leave") ||
      pathname.startsWith("/attendance") ||
      pathname.startsWith("/meetings") ||
      pathname.startsWith("/goals") ||
      pathname.startsWith("/development") ||
      pathname.startsWith("/announcements") ||
      pathname.startsWith("/settings") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/probation") ||
      pathname.startsWith("/pip") ||
      pathname.startsWith("/work-mode") ||
      pathname.startsWith("/notifications");

    if (!isAuthenticated && isProtectedRoute) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    // Post-auth domain check: reject non-@xorstack.com emails if logged in via OAuth
    if (user?.email && !user.email.endsWith("@xorstack.com")) {
      try {
        await supabase.auth.signOut();
      } catch {}
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("error", "domain_restricted");
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  } catch (err) {
    console.error("[Middleware] Uncaught error in updateSession:", err);
    return NextResponse.next();
  }
}
