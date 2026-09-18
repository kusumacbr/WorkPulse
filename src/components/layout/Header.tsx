"use client";

import React, { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import { RoleType } from "@/lib/authorization/types";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { NotificationDropdown } from "./NotificationDropdown";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import {
  LogOut,
  ChevronDown,
  User,
  Menu,
  X,
  Settings,
  CheckSquare,
  LayoutDashboard,
  Calendar,
  Clock,
  Target,
  Shield,
  Fingerprint,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "./UserContext";

interface HeaderProps {
  userName: string;
  userEmail: string;
  userRoles: RoleType[];
}

const ROLE_BADGE_STYLES: Record<RoleType, { label: string; variant: "brand" | "secondary" | "outline" | "destructive" | "purple" | "indigo" | "cyan" }> = {
  HR: { label: "HR Operations", variant: "purple" },
  MANAGER: { label: "Team Lead", variant: "cyan" },
  EMPLOYEE: { label: "Core Member", variant: "brand" },
};

export function Header({ userName: initialUserName, userEmail: initialUserEmail, userRoles }: HeaderProps) {
  const currentUser = useCurrentUser();
  const pathname = usePathname();
  const userName = currentUser?.userName || initialUserName;
  const userEmail = currentUser?.userEmail || initialUserEmail;

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Automatically close all menus whenever route changes and record last active non-modal route
  useEffect(() => {
    setShowUserMenu(false);
    setShowMobileMenu(false);
    if (pathname && pathname !== "/profile" && pathname !== "/settings" && typeof window !== "undefined") {
      sessionStorage.setItem("workpulse_last_active_route", pathname);
    }
  }, [pathname]);

  // Close dropdown on click outside or escape key (capturing phase)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent | PointerEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowUserMenu(false);
        setShowMobileMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("pointerdown", handleClickOutside, true);
      document.addEventListener("click", handleClickOutside, true);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("pointerdown", handleClickOutside, true);
      document.removeEventListener("click", handleClickOutside, true);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [showUserMenu]);

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("workpulse_session_email");
      sessionStorage.removeItem("workpulse_session_role");
      sessionStorage.removeItem("workpulse_session_name");
    }
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // safe fallback
    }
    window.location.href = "/login";
  };

  const activeRole: RoleType =
    currentUser?.primaryRole ||
    (userRoles.includes("HR")
      ? "HR"
      : userRoles.includes("MANAGER")
      ? "MANAGER"
      : "EMPLOYEE");

  const roleInfo = ROLE_BADGE_STYLES[activeRole] || { label: "Core Member", variant: "brand" };

  // Format seconds into HH:MM:SS format starting from 00:00:00
  const formatRunningTimer = (totalSeconds: number): string => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
  };

  // Header Biometric Punch & Live Login Timer State
  const [punchStatus, setPunchStatus] = useState<"IN" | "OUT">("OUT");
  const [punchStartTimeMs, setPunchStartTimeMs] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [isPunching, setIsPunching] = useState<boolean>(false);

  // Initial read & restore stored punch state from Supabase for this specific role/email
  useEffect(() => {
    let isCancelled = false;
    const fetchLatestPunch = async () => {
      try {
        const emp = userEmail || "emp-sarah";
        const res = await fetch(`/api/v1/attendance/punches?employeeId=${encodeURIComponent(emp)}&limit=1`);
        if (res.ok) {
          const data = await res.json();
          if (!isCancelled && data.data?.punches && data.data.punches.length > 0) {
            const latest = data.data.punches[0];
            const isLatestIn = latest.direction === "IN" || latest.punch_type === "IN";
            if (isLatestIn) {
              setPunchStatus("IN");
              const startTime = new Date(latest.punch_time || latest.time).getTime();
              if (!isNaN(startTime)) {
                setPunchStartTimeMs(startTime);
                const diffSecs = Math.floor((Date.now() - startTime) / 1000);
                setElapsedSeconds(Math.max(0, diffSecs));
              }
            } else {
              setPunchStatus("OUT");
              setPunchStartTimeMs(null);
              setElapsedSeconds(0);
            }
          }
        }
      } catch {}
    };

    fetchLatestPunch();

    return () => {
      isCancelled = true;
    };
  }, [userEmail]);

  // Ticking live timer every second when Punched IN
  useEffect(() => {
    if (punchStatus !== "IN" || !punchStartTimeMs) return;

    const updateTimer = () => {
      const diffSecs = Math.floor((Date.now() - punchStartTimeMs) / 1000);
      setElapsedSeconds(Math.max(0, diffSecs));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [punchStatus, punchStartTimeMs]);

  // Sync punch status with global events
  useEffect(() => {
    let debounceTimer: NodeJS.Timeout | null = null;
    const syncPunchState = () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(async () => {
        try {
          const emp = userEmail || "emp-sarah";
          const res = await fetch(`/api/v1/attendance/punches?employeeId=${encodeURIComponent(emp)}&limit=1`);
          if (res.ok) {
            const data = await res.json();
            if (data.data?.punches && data.data.punches.length > 0) {
              const latest = data.data.punches[0];
              const isLatestIn = latest.direction === "IN" || latest.punch_type === "IN";
              if (isLatestIn) {
                setPunchStatus("IN");
                const startTime = new Date(latest.punch_time || latest.time).getTime();
                if (!isNaN(startTime)) {
                  setPunchStartTimeMs(startTime);
                  const diffSecs = Math.floor((Date.now() - startTime) / 1000);
                  setElapsedSeconds(Math.max(0, diffSecs));
                }
              } else {
                setPunchStatus("OUT");
                setPunchStartTimeMs(null);
                setElapsedSeconds(0);
              }
            }
          }
        } catch {}
      }, 500);
    };

    window.addEventListener("attendance:punched", syncPunchState);
    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      window.removeEventListener("attendance:punched", syncPunchState);
    };
  }, [userEmail]);

  const handleHeaderPunch = async () => {
    setIsPunching(true);
    const nextStatus = punchStatus === "IN" ? "OUT" : "IN";
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const startTime = now.getTime();

    try {
      await fetch("/api/v1/attendance/punch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: userEmail || "emp-sarah",
          type: nextStatus,
          terminalId: `VIRTUAL-HEADER-${roleInfo.label.replace(/\s+/g, "-")}`,
          timestamp: now.toISOString(),
        }),
      });
    } catch (e) {
      console.warn("Punch recorded:", e);
    }

    if (nextStatus === "IN") {
      setPunchStatus("IN");
      setPunchStartTimeMs(startTime);
      setElapsedSeconds(0);
    } else {
      setPunchStatus("OUT");
      setPunchStartTimeMs(null);
      setElapsedSeconds(0);
    }

    setIsPunching(false);

    // Notify all components across windows/tabs
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("attendance:punched", { detail: { type: nextStatus, time: timeStr, email: userEmail } }));
      window.dispatchEvent(new CustomEvent("workpulse_sync"));
      if ("BroadcastChannel" in window) {
        try {
          const bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
          bc.postMessage({ type: "attendance:punched", status: nextStatus, timestamp: Date.now() });
          bc.close();
        } catch {}
      }
    }
  };

  return (
    <header className="h-16 border-b border-border/80 bg-card/85 dark:bg-card/60 backdrop-blur-2xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-[0_2px_15px_rgba(0,0,0,0.02)] dark:shadow-[0_4px_25px_rgba(0,0,0,0.3)] transition-all duration-300">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Drawer Toggle Button */}
        <button
          type="button"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="md:hidden p-2 rounded-2xl bg-card border border-border/80 text-foreground hover:bg-muted transition-colors"
          title="Toggle Navigation Menu"
        >
          {showMobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        {/* Mobile Brand Logo */}
        <div className="md:hidden">
          <BrandLogo size="sm" />
        </div>

        {/* Clean Authenticated Role Badge & Role Header Login/Logout Timer Button */}
        <div className="hidden sm:flex items-center gap-2.5">
          <Badge
            variant={roleInfo.variant}
            className="text-[11px] font-bold tracking-wide px-3 py-1 rounded-full shadow-sm shrink-0"
          >
            <Shield className="h-3 w-3 mr-1 opacity-80" />
            {roleInfo.label}
          </Badge>

          {/* Role Header Punch & Live Duration Button */}
          {punchStatus === "OUT" ? (
            <Button
              type="button"
              onClick={handleHeaderPunch}
              disabled={isPunching}
              size="sm"
              className="h-7 px-3 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white rounded-full shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
              title="Click to register Login Time"
            >
              <Fingerprint className="h-3.5 w-3.5" />
              <span>Login Time</span>
            </Button>
          ) : (
            <div className="flex items-center gap-2 bg-emerald-500/15 dark:bg-emerald-500/10 border border-emerald-500/30 px-3 py-0.5 rounded-full text-xs font-mono">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                <span>In: {formatRunningTimer(elapsedSeconds)}</span>
              </div>
              <Button
                type="button"
                onClick={handleHeaderPunch}
                disabled={isPunching}
                size="sm"
                className="h-6 px-2.5 text-[11px] font-bold bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-white rounded-full shadow-xs transition-all flex items-center gap-1 cursor-pointer shrink-0 ml-1"
                title="Click to stop time and register Logout Time"
              >
                <LogOut className="h-3 w-3" />
                <span>Logout Time</span>
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">

        {/* Notification Center */}
        <NotificationDropdown />

        {/* Theme Switcher Toggle */}
        <ThemeToggle variant="toggle" size="sm" />

        {/* User Profile Dropdown Pill */}
        <div className="relative pl-1 sm:pl-2 border-l border-border/60" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 hover:bg-muted/40 transition-colors p-1.5 rounded-2xl border border-transparent hover:border-border/60 group cursor-pointer"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-cyan-400 via-sky-300 to-amber-400 p-[1.5px] shadow-[0_0_12px_rgba(56,189,248,0.3)]">
              <div className="h-full w-full rounded-full bg-card dark:bg-[#071322] flex items-center justify-center text-cyan-600 dark:text-cyan-300 font-extrabold text-xs">
                {userName.slice(0, 2).toUpperCase()}
              </div>
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                {userName}
              </span>
              <span className="text-[10px] text-muted-foreground leading-tight font-mono">
                {userEmail}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block transition-transform group-hover:translate-y-0.5" />
          </button>

          {/* User Profile Popup Summary */}
          {showUserMenu && (
            <>
              {/* Invisible Fullscreen Backdrop for 100% reliable outside clicks */}
              <div
                className="fixed inset-0 z-40 bg-transparent cursor-default"
                onClick={() => setShowUserMenu(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-card border border-border/80 shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-2.5">
                <div className="px-2 py-1.5 space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-foreground block truncate">{userName}</span>
                    <Badge variant={roleInfo.variant} className="text-[9px] px-1.5 py-0 font-bold shrink-0">
                      {roleInfo.label}
                    </Badge>
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono block truncate">{userEmail}</span>
                </div>

                {/* Navigation Links */}
                <div className="space-y-0.5 pt-1.5 border-t border-border/60 text-xs">
                  <Link
                    href={pathname && pathname !== "/profile" && pathname !== "/settings" ? `/profile?from=${encodeURIComponent(pathname)}` : "/profile"}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-foreground hover:bg-muted/60 transition-colors font-medium"
                  >
                    <User className="h-4 w-4 text-cyan-500" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    href={pathname && pathname !== "/profile" && pathname !== "/settings" ? `/settings?from=${encodeURIComponent(pathname)}` : "/settings"}
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-2.5 py-2 rounded-xl text-foreground hover:bg-muted/60 transition-colors font-medium"
                  >
                    <Settings className="h-4 w-4 text-purple-500" />
                    <span>Settings</span>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Quick Sign Out Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="h-8 px-2.5 sm:px-3 text-xs font-bold border-red-500/30 text-red-500 dark:text-red-400 hover:bg-red-500/10 flex items-center gap-1.5 transition-all shrink-0 rounded-xl"
          title="Sign out of current account"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>

      {/* Mobile Navigation Drawer Modal */}
      {showMobileMenu && (
        <div className="fixed inset-0 top-16 bg-sidebar/95 text-sidebar-foreground backdrop-blur-2xl z-50 p-6 md:hidden overflow-y-auto space-y-6 animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            <span className="text-xs font-bold text-sidebar-muted uppercase tracking-wider block">
              WorkPulse Navigation
            </span>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <Link
                href="/dashboard"
                prefetch={true}
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-2 p-3.5 rounded-2xl bg-white/5 border border-sidebar-border font-bold shadow-sm hover:bg-white/10 transition-colors text-sidebar-foreground"
              >
                <LayoutDashboard className="h-4 w-4 text-amber-400" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/my-work"
                prefetch={true}
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-2 p-3.5 rounded-2xl bg-white/5 border border-sidebar-border font-bold shadow-sm hover:bg-white/10 transition-colors text-sidebar-foreground"
              >
                <CheckSquare className="h-4 w-4 text-cyan-400" />
                <span>My Tasks</span>
              </Link>
              <Link
                href="/attendance"
                prefetch={true}
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-2 p-3.5 rounded-2xl bg-white/5 border border-sidebar-border font-bold shadow-sm hover:bg-white/10 transition-colors text-sidebar-foreground"
              >
                <Clock className="h-4 w-4 text-sky-400" />
                <span>Attendance</span>
              </Link>
              <Link
                href="/leave"
                prefetch={true}
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-2 p-3.5 rounded-2xl bg-white/5 border border-sidebar-border font-bold shadow-sm hover:bg-white/10 transition-colors text-sidebar-foreground"
              >
                <Calendar className="h-4 w-4 text-teal-400" />
                <span>Leave & WFH</span>
              </Link>
              <Link
                href="/goals"
                prefetch={true}
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-2 p-3.5 rounded-2xl bg-white/5 border border-sidebar-border font-bold shadow-sm hover:bg-white/10 transition-colors text-sidebar-foreground"
              >
                <Target className="h-4 w-4 text-emerald-400" />
                <span>Goals &amp; OKRs</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

