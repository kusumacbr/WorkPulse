"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RoleType } from "@/lib/authorization/types";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { useCurrentUser } from "@/components/layout/UserContext";
import {
  LayoutDashboard,
  CheckSquare,
  Target,
  CalendarDays,
  Clock,
  Megaphone,
  LucideIcon,
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
  // Standard Member Navigation
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    colorClass: "text-amber-400",
    activeBgClass: "bg-amber-500/15 border-amber-500/30 text-amber-300",
  },
  {
    label: "My Tasks",
    href: "/my-work",
    icon: CheckSquare,
    colorClass: "text-cyan-400",
    activeBgClass: "bg-cyan-500/15 border-cyan-500/30 text-cyan-300",
  },
  {
    label: "Goals & OKRs",
    href: "/goals",
    icon: Target,
    colorClass: "text-emerald-400",
    activeBgClass: "bg-emerald-500/15 border-emerald-500/30 text-emerald-300",
  },
  {
    label: "Attendance",
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
    label: "Broadcasts & Culture",
    href: "/announcements",
    icon: Megaphone,
    colorClass: "text-pink-400",
    activeBgClass: "bg-pink-500/15 border-pink-500/30 text-pink-300",
    requiredRoles: ["HR"],
  },
];

interface SidebarProps {
  userRoles: RoleType[];
}

export function Sidebar({ userRoles: propUserRoles }: SidebarProps) {
  const pathname = usePathname();
  const currentUser = useCurrentUser();
  const userRoles = currentUser?.roles?.length ? currentUser.roles : propUserRoles;
  const userEmail = currentUser?.userEmail?.toLowerCase() || "";

  const isHR =
    userRoles.includes("HR") ||
    currentUser?.primaryRole === "HR" ||
    userEmail.includes("hr");

  const visibleItems = NAV_ITEMS.filter((item) => {
    // Broadcasts & Culture is exclusively available for HR; hidden for Employee and Team Lead
    if (item.href === "/announcements" && !isHR) return false;
    if (!item.requiredRoles) return true;
    return item.requiredRoles.some((role) => userRoles.includes(role)) || (item.requiredRoles.includes("HR") && isHR);
  });

  return (
    <aside className="w-60 border-r border-border/60 bg-card/40 backdrop-blur-xl flex flex-col justify-between hidden md:flex shrink-0 z-20">
      {/* Brand Header */}
      <div>
        <div className="h-16 border-b border-border/60 px-4 flex items-center justify-between">
          <BrandLogo size="md" />
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
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 group relative border ${
                  isActive
                    ? `${item.activeBgClass} shadow-[0_0_15px_rgba(0,0,0,0.2)]`
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/40 hover:border-border/60"
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 transition-transform group-hover:scale-105 ${
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

      {/* Sidebar Footer: Official Company Identity Badge */}
      <div className="p-3 border-t border-border/60 space-y-2">
        <div className="p-2.5 rounded-xl bg-card/60 border border-border/70 flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <Image
              src="/logo.png"
              alt="Xorstack Logo"
              width={80}
              height={80}
              unoptimized
              className="h-6 w-auto object-contain shrink-0 drop-shadow-sm"
            />
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-foreground block truncate leading-tight">
                Xorstack
              </span>
              <span className="text-[9px] text-muted-foreground block truncate leading-tight">
                Enterprise Workspace
              </span>
            </div>
          </div>

          <ThemeToggle variant="toggle" size="sm" />
        </div>
      </div>
    </aside>
  );
}
