"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { AmbientBackdrop } from "../3d/AmbientBackdrop";
import { UserProvider, UserContextValue, useCurrentUser } from "./UserContext";
import { useRealtimeSync } from "@/lib/realtime/use-realtime-sync";

// Lazy-load heavy global widgets — they're modals/overlays not needed for initial render
const BroadcastNotificationPopup = dynamic(
  () => import("./BroadcastNotificationPopup").then((m) => ({ default: m.BroadcastNotificationPopup })),
  { ssr: false }
);
const PulseAgentWidget = dynamic(
  () => import("../agent/PulseAgentWidget").then((m) => ({ default: m.PulseAgentWidget })),
  { ssr: false }
);
const MorningPlanLoginModal = dynamic(
  () => import("@/features/workdays/components/MorningPlanLoginModal").then((m) => ({ default: m.MorningPlanLoginModal })),
  { ssr: false }
);

interface AppShellProps {
  children: React.ReactNode;
  user: UserContextValue;
}

function InnerAppShell({ children, fallbackUser }: { children: React.ReactNode; fallbackUser: UserContextValue }) {
  const currentUser = useCurrentUser();
  const effectiveRoles = currentUser?.roles && currentUser.roles.length > 0 ? currentUser.roles : fallbackUser.roles;

  return (
    <div className="relative flex min-h-screen bg-background text-foreground transition-colors duration-200">
      {/* 3D Ambient Atmospheric Backdrop */}
      <AmbientBackdrop />

      {/* Global Broadcast Notification Popup Modal */}
      <BroadcastNotificationPopup />

      {/* Morning Plan Login Prompt Modal for Core Employees */}
      <MorningPlanLoginModal />

      {/* Google ADK Pulse Agent Floating Widget */}
      <PulseAgentWidget />

      {/* Glassmorphic Sidebar navigation */}
      <Sidebar userRoles={effectiveRoles} />

      {/* Main content container */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          userName={currentUser?.userName || fallbackUser.userName}
          userEmail={currentUser?.userEmail || fallbackUser.userEmail}
          userRoles={effectiveRoles}
        />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-w-7xl w-full mx-auto space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AppShell({ children, user }: AppShellProps) {
  useRealtimeSync();

  return (
    <UserProvider user={user}>
      <InnerAppShell fallbackUser={user}>{children}</InnerAppShell>
    </UserProvider>
  );
}

