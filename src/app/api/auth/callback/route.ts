import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Verify domain restriction after successful OAuth
      const { data: { user } } = await supabase.auth.getUser();

      if (user?.email && !user.email.endsWith("@xorstack.com")) {
        // Unauthorized domain — sign out and redirect with error
        await supabase.auth.signOut();
        const loginUrl = new URL("/login", origin);
        loginUrl.searchParams.set("error", "domain_restricted");
        return NextResponse.redirect(loginUrl.toString());
      }

      const forwardedHost = request.headers.get("x-forwarded-host");
      const isLocalEnv = process.env.NODE_ENV === "development";

      if (isLocalEnv) {
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // OAuth error — redirect to login with error message
  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("error", "auth_callback_error");
  return NextResponse.redirect(loginUrl.toString());
}
