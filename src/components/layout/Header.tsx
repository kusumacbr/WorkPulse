"use client";

import React, { useState } from "react";
import { RoleType } from "@/lib/authorization/types";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { NotificationDropdown } from "./NotificationDropdown";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Button } from "@/components/ui/button";
import { LogOut, ChevronDown, User, ShieldCheck } from "lucide-react";

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

export function Header({ userName, userEmail, userRoles }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  const [isSwitching, setIsSwitching] = useState(false);

  const handleLogout = () => {
    window.location.href = "/api/auth/logout";
  };

  const handleSwitchRole = async (targetRole: RoleType) => {
    if (userRoles.includes(targetRole) || isSwitching) return;
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
      const res = await fetch("/api/v1/dev/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        window.location.reload();
      }
    } catch (err) {
      console.error("Role switch error:", err);
      setIsSwitching(false);
    }
  };

  const allRoles: RoleType[] = ["EMPLOYEE", "MANAGER", "HR", "ADMIN"];

  return (
    <header className="h-16 border-b border-border/60 bg-background/50 backdrop-blur-xl px-6 flex items-center justify-between sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-3">
        <BrandLogo size="md" showCompany={false} withPulseAnimation={true} />

        {/* Interactive Role Switcher Pills */}
        <div className="hidden sm:flex items-center p-1 rounded-xl bg-card/60 border border-border/80 gap-1 shadow-inner ml-2">
          {allRoles.map((role) => {
            const isActive = userRoles.includes(role);
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

      <div className="flex items-center gap-3">
        {/* In-App Notification Center */}
        <NotificationDropdown />

        {/* Theme Switcher Toggle */}
        <ThemeToggle variant="toggle" size="sm" />

        {/* User Profile Dropdown Pill */}
        <div className="relative pl-2 border-l border-border/60">
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
            <div className="absolute right-0 mt-2 w-56 rounded-xl glass-panel border border-border shadow-xl p-3 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-2.5">
              <div className="flex items-center gap-2 pb-2 border-b border-border/60">
                <User className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
                <span className="text-xs font-bold text-foreground">User Profile</span>
              </div>
              <div>
                <span className="text-xs font-bold text-foreground block">{userName}</span>
                <span className="text-[11px] text-muted-foreground font-mono block truncate">{userEmail}</span>
              </div>
              <div className="pt-1 border-t border-border/60 space-y-1.5">
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
          className="h-8 px-3 text-xs font-bold border-red-500/40 bg-red-500/10 text-red-500 dark:text-red-400 hover:bg-red-500/20 hover:border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.15)] flex items-center gap-1.5 transition-all"
          title="Sign out of current account and switch role"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </Button>
      </div>
    </header>
  );
}
