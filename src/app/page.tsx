import React from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LandingHero } from "@/features/landing/components/LandingHero";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    // Authenticated user: skip landing page and redirect straight to dashboard
    redirect("/dashboard");
  }

  // Unauthenticated user: render animated 3D landing / welcome page
  return <LandingHero />;
}
