"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleType } from "@/lib/authorization/types";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  FileCheck,
  CalendarDays,
  Clock,
  Users,
  Building2,
  Settings,
  ShieldCheck,
  GraduationCap,
  LucideIcon,
  Sparkles,
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  colorClass: string;
  activeBgClass: string;
  requiredRoles?: RoleType[];
}

const NAV_ITEMS: NavItem[] = [
  // Employee Core
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    colorClass: "text-amber-400",
    activeBgClass: "bg-amber-500/15 border-amber-500/30 text-amber-300",
  },
  {
    label: "My Work & Tasks",
    href: "/my-work",
    icon: CheckSquare,
    colorClass: "text-cyan-400",
    activeBgClass: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300",
    requiredRoles: ["EMPLOYEE", "MANAGER"],
  },
  {
    label: "Goals & OKRs",
    href: "/goals",
    icon: Target,
    colorClass: "text-emerald-400",
    activeBgClass: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
  },
  {
    label: "Performance Reviews",
    href: "/reviews",
    icon: FileCheck,
    colorClass: "text-purple-400",
    activeBgClass: "bg-purple-500/15 border-purple-500/30 text-purple-300",
  },
  {
    label: "Attendance & Logs",
    href: "/attendance",
    icon: Clock,
    colorClass: "text-sky-400",
    activeBgClass: "bg-sky-500/15 border-sky-500/30 text-sky-300",
  },
  {
    label: "Leave & WFH",
    href: "/leave",
    icon: CalendarDays,
    colorClass: "text-teal-400",
    activeBgClass: "bg-teal-500/15 border-teal-500/30 text-teal-300",
  },
  {
    label: "Coaching & Growth",
    href: "/development",
    icon: GraduationCap,
    colorClass: "text-rose-400",
    activeBgClass: "bg-rose-500/15 border-rose-500/30 text-rose-300",
  },

  // Manager Modules
  {
    label: "Team Management",
    href: "/team",
    icon: Users,
    colorClass: "text-indigo-400",
    activeBgClass: "bg-indigo-500/15 border-indigo-500/30 text-indigo-300",
    requiredRoles: ["MANAGER", "ADMIN"],
  },

  // HR Modules
  {
    label: "HR & People Ops",
    href: "/hr",
    icon: Building2,
    colorClass: "text-pink-400",
    activeBgClass: "bg-pink-500/15 border-pink-500/30 text-pink-300",
    requiredRoles: ["HR", "ADMIN"],
  },

  // Admin Modules
  {
    label: "System & Compliance",
    href: "/admin",
    icon: Settings,
    colorClass: "text-slate-300",
    activeBgClass: "bg-slate-500/20 border-slate-500/40 text-slate-200",
    requiredRoles: ["ADMIN"],
  },
];

interface SidebarProps {
  userRoles: RoleType[];
}

export function Sidebar({ userRoles }: SidebarProps) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (!item.requiredRoles) return true;
    return item.requiredRoles.some((role) => userRoles.includes(role));
  });

  return (
    <aside className="w-64 border-r border-border/60 bg-card/40 backdrop-blur-xl flex flex-col justify-between hidden md:flex shrink-0 z-20">
      {/* Brand Header */}
      <div>
        <div className="h-16 border-b border-border/60 px-4 flex items-center justify-between">
          <BrandLogo size="sm" showCompany={true} withPulseAnimation={true} />
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group relative border ${
                  isActive
                    ? `${item.activeBgClass} shadow-[0_0_20px_rgba(0,0,0,0.3)]`
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:border-border/60"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-110 ${
                    isActive ? item.colorClass : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <span className="absolute right-2.5 h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer System Status & Theme Switcher */}
      <div className="p-3 border-t border-border/60 space-y-2">
        <div className="flex items-center justify-between gap-1">
          <div className="flex-1 p-2 rounded-xl bg-muted/30 border border-border/50 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-[10px] font-medium font-mono">WorkPulse v0.1</span>
            </div>
            <Sparkles className="h-3 w-3 text-amber-400 animate-pulse" />
          </div>
          <ThemeToggle variant="toggle" size="sm" />
        </div>
      </div>
    </aside>
  );
}
