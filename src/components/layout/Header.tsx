"use client";

import React, { useState } from "react";
import { RoleType } from "@/lib/authorization/types";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { NotificationDropdown } from "./NotificationDropdown";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  LogOut,
  ChevronDown,
  User,
  ShieldCheck,
  Menu,
  X,
  Settings,
  Video,
  Megaphone,
  CheckSquare,
  LayoutDashboard,
  Building2,
  Users as UsersIcon,
  Calendar,
  Clock,
  Target,
  GraduationCap,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "./UserContext";
import { SupabaseLiveStatusPill } from "./SupabaseLiveStatusPill";

interface HeaderProps {
  userName: string;
  userEmail: string;
  userRoles: RoleType[];
}

const ROLE_BADGE_STYLES: Record<RoleType, { bg: string; border: string; text: string }> = {
  ADMIN: {
    bg: "bg-red-500/15",
    border: "border-red-500/35",
    text: "text-red-400",
  },
  HR: {
    bg: "bg-pink-500/15",
    border: "border-pink-500/35",
    text: "text-pink-400",
  },
  MANAGER: {
    bg: "bg-purple-500/15",
    border: "border-purple-500/35",
    text: "text-purple-400",
  },
  EMPLOYEE: {
    bg: "bg-cyan-500/15",
    border: "border-cyan-500/35",
    text: "text-cyan-400",
  },
};

export function Header({ userName: initialUserName, userEmail: initialUserEmail, userRoles }: HeaderProps) {
  const currentUser = useCurrentUser();
  const userName = currentUser?.userName || initialUserName;
  const userEmail = currentUser?.userEmail || initialUserEmail;

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {
      // safe fallback
    }
    window.location.href = "/login";
  };

  const activeRole: RoleType =
    currentUser?.primaryRole ||
    (userRoles.includes("ADMIN")
      ? "ADMIN"
      : userRoles.includes("HR")
      ? "HR"
      : userRoles.includes("MANAGER")
      ? "MANAGER"
      : "EMPLOYEE");

  const handleSwitchRole = async (targetRole: RoleType) => {
    if (activeRole === targetRole || isSwitching) return;
    setIsSwitching(true);

    const roleEmails: Record<RoleType, string> = {
      EMPLOYEE: "employee.test@xorstack.com",
      MANAGER: "lead.test@xorstack.com",
      HR: "hr.test@xorstack.com",
      ADMIN: "director.test@xorstack.com",
    };

    const email = roleEmails[targetRole];
    if (!email) {
      setIsSwitching(false);
      return;
    }

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: "WorkPulse2025!Demo",
      });

      if (!error) {
        window.location.href = "/dashboard";
      } else {
        console.warn("Supabase auth switch error, trying dev endpoint:", error);
        window.location.href = "/dashboard";
      }
    } catch (err) {
      console.error("Role switch error:", err);
      window.location.href = "/dashboard";
    } finally {
      setIsSwitching(false);
    }
  };

  const allRoles: RoleType[] = ["EMPLOYEE", "MANAGER", "HR", "ADMIN"];

  return (
    <header className="h-16 border-b border-border/60 bg-background/50 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Drawer Toggle Button */}
        <button
          type="button"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          className="md:hidden p-2 rounded-xl bg-card border border-border/80 text-foreground hover:bg-muted transition-colors"
          title="Toggle Navigation Menu"
        >
          {showMobileMenu ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>

        <BrandLogo size="md" showCompany={false} withPulseAnimation={true} />

        {/* Interactive Role Switcher Pills */}
        <div className="hidden sm:flex items-center p-1 rounded-xl bg-card/60 border border-border/80 gap-1 shadow-inner ml-2">
          {allRoles.map((role) => {
            const isActive = activeRole === role;
            const badgeStyle = ROLE_BADGE_STYLES[role];
            return (
              <button
                key={role}
                type="button"
                onClick={() => handleSwitchRole(role)}
                disabled={isSwitching}
                title={isActive ? `Current active persona: ${role}` : `Switch view to ${role} persona`}
                className={`text-[10px] tracking-wider uppercase font-extrabold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? `${badgeStyle.bg} ${badgeStyle.border} ${badgeStyle.text} border shadow-sm ring-1 ring-white/10 scale-105`
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/40 opacity-70 hover:opacity-100"
                }`}
              >
                {role}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Supabase PostgreSQL Live Connection Status */}
        <SupabaseLiveStatusPill />

        {/* Real-time Live Status Pulse Badge */}
        <div
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-extrabold text-emerald-400 select-none shadow-[0_0_12px_rgba(16,185,129,0.15)]"
          title="WorkPulse Real-Time Event Stream Active (SSE & Multi-Tab Sync)"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="tracking-wider uppercase">Live Realtime</span>
        </div>

        {/* In-App Notification Center */}
        <NotificationDropdown />

        {/* Theme Switcher Toggle */}
        <ThemeToggle variant="toggle" size="sm" />

        {/* User Profile Dropdown Pill */}
        <div className="relative pl-1 sm:pl-2 border-l border-border/60">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2.5 hover:opacity-85 transition-opacity p-1 rounded-xl group"
          >
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[var(--brand-primary)] to-cyan-400 p-[1px] shadow-[0_0_14px_rgba(6,182,212,0.25)]">
              <div className="h-full w-full rounded-full bg-card dark:bg-[#0b0f19] flex items-center justify-center text-cyan-600 dark:text-cyan-300 font-extrabold text-xs">
                {userName.slice(0, 2).toUpperCase()}
              </div>
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-foreground leading-none group-hover:text-cyan-500 dark:group-hover:text-cyan-300 transition-colors">
                {userName}
              </span>
              <span className="text-[10px] text-muted-foreground leading-none mt-1 font-mono">
                {userEmail}
              </span>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
          </button>

          {/* User Profile Popup Summary */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl glass-panel border border-border shadow-2xl p-3.5 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-3">
              <div className="flex items-center gap-2 pb-2.5 border-b border-border/60">
                <User className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                <span className="text-xs font-bold text-foreground">User Profile & Navigation</span>
              </div>

              <div>
                <span className="text-xs font-bold text-foreground block">{userName}</span>
                <span className="text-[11px] text-muted-foreground font-mono block truncate">{userEmail}</span>
              </div>

              {/* Quick Action Navigation Links */}
              <div className="space-y-1 pt-2 border-t border-border/60 text-xs">
                <Link
                  href="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-foreground hover:bg-muted/50 transition-colors font-medium"
                >
                  <User className="h-3.5 w-3.5 text-cyan-400" />
                  <span>My Profile & Hierarchy</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-foreground hover:bg-muted/50 transition-colors font-medium"
                >
                  <Settings className="h-3.5 w-3.5 text-purple-400" />
                  <span>Preferences & Settings</span>
                </Link>

                <Link
                  href="/meetings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-foreground hover:bg-muted/50 transition-colors font-medium"
                >
                  <Video className="h-3.5 w-3.5 text-emerald-400" />
                  <span>1-on-1s & Standups</span>
                </Link>

                <Link
                  href="/announcements"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-foreground hover:bg-muted/50 transition-colors font-medium"
                >
                  <Megaphone className="h-3.5 w-3.5 text-pink-400" />
                  <span>Company Announcements</span>
                </Link>
              </div>

              <div className="pt-2 border-t border-border/60 space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Theme Mode</span>
                <ThemeToggle variant="segmented" className="w-full justify-between" />
              </div>

              <div className="pt-1 flex items-center gap-1.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Active & Authenticated</span>
              </div>
            </div>
          )}
        </div>

        {/* SINGLE VISIBLE PROMINENT SIGN OUT BUTTON */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="h-8 px-2.5 sm:px-3 text-xs font-bold border-red-500/40 bg-red-500/10 text-red-500 dark:text-red-400 hover:bg-red-500/20 hover:border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.15)] flex items-center gap-1.5 transition-all shrink-0"
          title="Sign out of current account and switch role"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>

      {/* Mobile Navigation Drawer Modal */}
      {showMobileMenu && (
        <div className="fixed inset-0 top-16 bg-background/95 backdrop-blur-2xl z-50 p-6 md:hidden overflow-y-auto space-y-6 animate-in slide-in-from-top-4 duration-200">
          <div className="space-y-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              WorkPulse Navigation
            </span>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs">
              <Link
                href="/dashboard"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border/80 font-bold"
              >
                <LayoutDashboard className="h-4 w-4 text-amber-400" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/my-work"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border/80 font-bold"
              >
                <CheckSquare className="h-4 w-4 text-cyan-400" />
                <span>My Work</span>
              </Link>
              <Link
                href="/attendance"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border/80 font-bold"
              >
                <Clock className="h-4 w-4 text-sky-400" />
                <span>Attendance</span>
              </Link>
              <Link
                href="/leave"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border/80 font-bold"
              >
                <Calendar className="h-4 w-4 text-teal-400" />
                <span>Leave & WFH</span>
              </Link>
              <Link
                href="/goals"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border/80 font-bold"
              >
                <Target className="h-4 w-4 text-emerald-400" />
                <span>Goals & OKRs</span>
              </Link>
              <Link
                href="/development"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border/80 font-bold"
              >
                <GraduationCap className="h-4 w-4 text-rose-400" />
                <span>Coaching</span>
              </Link>
              {userRoles.includes("MANAGER") && (
                <Link
                  href="/team"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border/80 font-bold"
                >
                  <UsersIcon className="h-4 w-4 text-purple-400" />
                  <span>Team Hub</span>
                </Link>
              )}
              {userRoles.includes("HR") && (
                <Link
                  href="/hr"
                  onClick={() => setShowMobileMenu(false)}
                  className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border/80 font-bold"
                >
                  <Building2 className="h-4 w-4 text-pink-400" />
                  <span>HR Hub</span>
                </Link>
              )}
              <Link
                href="/meetings"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border/80 font-bold"
              >
                <Video className="h-4 w-4 text-purple-400" />
                <span>1-on-1s</span>
              </Link>
              <Link
                href="/settings"
                onClick={() => setShowMobileMenu(false)}
                className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border/80 font-bold"
              >
                <Settings className="h-4 w-4 text-slate-400" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
