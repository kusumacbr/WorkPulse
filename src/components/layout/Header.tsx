"use client";

import React, { useState } from "react";
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
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { useCurrentUser } from "./UserContext";

interface HeaderProps {
  userName: string;
  userEmail: string;
  userRoles: RoleType[];
}

const ROLE_BADGE_STYLES: Record<RoleType, { label: string; variant: "brand" | "secondary" | "outline" | "destructive" }> = {
  HR: { label: "HR", variant: "outline" },
  MANAGER: { label: "Team Lead", variant: "secondary" },
  EMPLOYEE: { label: "Employee", variant: "brand" },
};

export function Header({ userName: initialUserName, userEmail: initialUserEmail, userRoles }: HeaderProps) {
  const currentUser = useCurrentUser();
  const userName = currentUser?.userName || initialUserName;
  const userEmail = currentUser?.userEmail || initialUserEmail;

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

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
    (userRoles.includes("HR")
      ? "HR"
      : userRoles.includes("MANAGER")
      ? "MANAGER"
      : "EMPLOYEE");

  const roleInfo = ROLE_BADGE_STYLES[activeRole] || { label: "Employee", variant: "brand" };

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

        {/* Mobile Brand Logo (On desktop, logo is in the sidebar) */}
        <div className="md:hidden">
          <BrandLogo size="sm" />
        </div>

        {/* Clean Authenticated Role Badge */}
        <Badge
          variant={roleInfo.variant}
          className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5"
        >
          {roleInfo.label}
        </Badge>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Center */}
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
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[var(--brand-primary)] to-cyan-400 p-[1px] shadow-[0_0_12px_rgba(6,182,212,0.2)]">
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
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                  <span className="text-xs font-bold text-foreground">User Account</span>
                </div>
                <Badge variant={roleInfo.variant} className="text-[9px] uppercase font-bold">
                  {roleInfo.label}
                </Badge>
              </div>

              <div>
                <span className="text-xs font-bold text-foreground block">{userName}</span>
                <span className="text-[11px] text-muted-foreground font-mono block truncate">{userEmail}</span>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1 pt-2 border-t border-border/60 text-xs">
                <Link
                  href="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-foreground hover:bg-muted/50 transition-colors font-medium"
                >
                  <User className="h-3.5 w-3.5 text-cyan-400" />
                  <span>My Profile</span>
                </Link>

                <Link
                  href="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-foreground hover:bg-muted/50 transition-colors font-medium"
                >
                  <Settings className="h-3.5 w-3.5 text-purple-400" />
                  <span>Settings</span>
                </Link>
              </div>

              <div className="pt-2 border-t border-border/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full text-xs font-bold text-destructive hover:bg-destructive/10 border-destructive/30 h-8 gap-1.5"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Quick Sign Out Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="h-8 px-2.5 sm:px-3 text-xs font-bold border-red-500/30 text-red-500 dark:text-red-400 hover:bg-red-500/10 flex items-center gap-1.5 transition-all shrink-0"
          title="Sign out of current account"
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
                <span>My Tasks</span>
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
                <span>Goals &amp; OKRs</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
