"use client";

import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { RoleType } from "@/lib/authorization/types";
import { AmbientBackdrop } from "../3d/AmbientBackdrop";
import { UserProvider, UserContextValue } from "./UserContext";
import { BroadcastNotificationPopup } from "./BroadcastNotificationPopup";

interface AppShellProps {
  children: React.ReactNode;
  user: UserContextValue;
}

export function AppShell({ children, user }: AppShellProps) {
  const [activeRoles] = useState<RoleType[]>(user.roles);

  return (
    <UserProvider user={user}>
      <div className="relative flex min-h-screen bg-background text-foreground transition-colors duration-200">
        {/* 3D Ambient Atmospheric Backdrop */}
        <AmbientBackdrop />

        {/* Global Broadcast Notification Popup Modal */}
        <BroadcastNotificationPopup />

        {/* Glassmorphic Sidebar navigation */}
        <Sidebar userRoles={activeRoles} />

        {/* Main content container */}
        <div className="flex-1 flex flex-col min-w-0">
          <Header
            userName={user.userName}
            userEmail={user.userEmail}
            userRoles={activeRoles}
          />
          <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
            {children}
          </main>
        </div>
      </div>
    </UserProvider>
  );
}
