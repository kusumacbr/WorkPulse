import React from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { LandingHero } from "@/features/landing/components/LandingHero";

export default async function HomePage() {
  // Check if active session cookie exists
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get("better-auth.session_token")?.value;

  if (sessionToken) {
    // Authenticated user: skip landing page and redirect straight to dashboard
    redirect("/dashboard");
  }

  // Unauthenticated user: render animated 3D landing / welcome page
  return <LandingHero />;
}
