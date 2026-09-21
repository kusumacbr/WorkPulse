"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
    colorClass: "text-amber-500 dark:text-amber-400",
    activeBgClass: "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-300 shadow-[0_4px_20px_rgba(245,158,11,0.15)]",
  },
  {
    label: "My Tasks",
    href: "/my-work",
    icon: CheckSquare,
    colorClass: "text-cyan-500 dark:text-cyan-400",
    activeBgClass: "bg-cyan-500/15 border-cyan-500/30 text-cyan-600 dark:text-cyan-300 shadow-[0_4px_20px_rgba(6,182,212,0.15)]",
  },
  {
    label: "Goals & OKRs",
    href: "/goals",
    icon: Target,
    colorClass: "text-emerald-500 dark:text-emerald-400",
    activeBgClass: "bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-300 shadow-[0_4px_20px_rgba(16,185,129,0.15)]",
  },
  {
    label: "Attendance Monitor",
    href: "/attendance",
    icon: Clock,
    colorClass: "text-sky-500 dark:text-sky-400",
    activeBgClass: "bg-sky-500/15 border-sky-500/30 text-sky-600 dark:text-sky-300 shadow-[0_4px_20px_rgba(14,165,233,0.15)]",
  },
  {
    label: "Leave & WFH",
    href: "/leave",
    icon: CalendarDays,
    colorClass: "text-teal-500 dark:text-teal-400",
    activeBgClass: "bg-teal-500/15 border-teal-500/30 text-teal-600 dark:text-teal-300 shadow-[0_4px_20px_rgba(20,184,166,0.15)]",
  },
  {
    label: "Broadcasts & Culture",
    href: "/announcements",
    icon: Megaphone,
    colorClass: "text-pink-500 dark:text-pink-400",
    activeBgClass: "bg-pink-500/15 border-pink-500/30 text-pink-600 dark:text-pink-300 shadow-[0_4px_20px_rgba(236,72,153,0.15)]",
    requiredRoles: ["HR"],
  },
];

interface SidebarProps {
  userRoles: RoleType[];
}

export function Sidebar({ userRoles: propUserRoles }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const currentUser = useCurrentUser();
  const userRoles = currentUser?.roles?.length ? currentUser.roles : propUserRoles;
  const userEmail = currentUser?.userEmail?.toLowerCase() || "";

  const isHR =
    userRoles.includes("HR") ||
    currentUser?.primaryRole === "HR" ||
    userEmail.includes("hr");

  const visibleItems = NAV_ITEMS.filter((item) => {
    if (item.href === "/announcements" && !isHR) return false;
    if (!item.requiredRoles) return true;
    return item.requiredRoles.some((role) => userRoles.includes(role)) || (item.requiredRoles.includes("HR") && isHR);
  });

  // Eagerly prefetch all section routes on mount for instant switching
  React.useEffect(() => {
    visibleItems.forEach((item) => {
      try {
        router.prefetch(item.href);
      } catch {}
    });
  }, [router, visibleItems]);

  return (
    <aside className="w-64 border-r border-sidebar-border bg-sidebar text-sidebar-foreground flex flex-col justify-between hidden md:flex shrink-0 z-20 transition-all duration-300 shadow-[4px_0_24px_rgba(0,0,0,0.15)] dark:shadow-[4px_0_35px_rgba(0,0,0,0.6)]">
      {/* Brand Header */}
      <div>
        <div className="h-16 border-b border-sidebar-border px-5 flex items-center justify-between">
          <BrandLogo size="md" lightText={true} />
        </div>

        {/* Navigation Items */}
        <div className="p-3.5 space-y-1.5">
          <nav className="space-y-1.5">
            {visibleItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                pathname === item.href ||
                (item.href !== "/dashboard" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={(e) => {
                    if (isActive) e.preventDefault();
                  }}
                  onMouseEnter={() => {
                    try {
                      router.prefetch(item.href);
                    } catch {}
                  }}
                  onFocus={() => {
                    try {
                      router.prefetch(item.href);
                    } catch {}
                  }}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 group relative border ${
                    isActive
                      ? `${item.activeBgClass}`
                      : "border-transparent text-sidebar-muted hover:text-sidebar-foreground hover:bg-white/5 hover:border-sidebar-border/60"
                  }`}
                >
                  <div
                    className={`h-7 w-7 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${
                      isActive
                        ? "bg-white/10 shadow-sm"
                        : "bg-white/5 group-hover:bg-white/10"
                    }`}
                  >
                    <Icon
                      className={`h-4 w-4 transition-colors ${
                        isActive ? item.colorClass : "text-sidebar-muted group-hover:text-sidebar-foreground"
                      }`}
                    />
                  </div>
                  <span className="truncate flex-1">{item.label}</span>
                  {isActive && (
                    <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee] animate-pulse" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Sidebar Footer: Official Company Identity Badge */}
      <div className="p-3.5 border-t border-sidebar-border space-y-2">
        <div className="p-3 rounded-2xl bg-white/5 border border-sidebar-border flex items-center justify-between gap-2 shadow-sm">
          <div className="flex items-center gap-2.5 min-w-0">
            <Image
              src="/logo.png"
              alt="Xorstack Logo"
              width={80}
              height={80}
              unoptimized
              className="h-7 w-auto object-contain shrink-0 drop-shadow-sm"
            />
            <div className="min-w-0">
              <span className="text-xs font-black text-sidebar-foreground block truncate leading-tight">
                Xorstack
              </span>
              <span className="text-[10px] text-sidebar-muted block truncate leading-tight font-medium">
                Enterprise Core
              </span>
            </div>
          </div>

          <ThemeToggle variant="toggle" size="sm" />
        </div>
      </div>
    </aside>
  );
}

