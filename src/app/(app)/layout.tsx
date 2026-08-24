import React from "react";
import { AppShell } from "@/components/layout/AppShell";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  return (
    <AppShell
      user={{
        userName: user.name,
        userEmail: user.email,
        roles: user.roles,
        primaryRole: user.primaryRole,
        designation: user.designation,
        department: user.department,
        team: user.team,
      }}
    >
      {children}
    </AppShell>
  );
}
