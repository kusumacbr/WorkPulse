"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, Variants } from "framer-motion";
import { User, Users, Briefcase, ShieldCheck, Sparkles, Shield, ArrowUpRight } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { RoleCard3D } from "./RoleCard3D";

// Code-split / lazy-load Three.js 3D canvas so it doesn't affect main app bundles
const Hero3DCanvas = dynamic(
  () => import("./Hero3DCanvas").then((mod) => mod.Hero3DCanvas),
  { ssr: false }
);

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export function LandingHero() {
  return (
    <div className="relative min-h-screen bg-background text-foreground flex flex-col justify-between overflow-x-hidden selection:bg-[var(--brand-primary)] selection:text-black transition-colors duration-200">
      {/* 3D Ambient Canvas Background (Lazy Loaded) */}
      <Suspense fallback={null}>
        <Hero3DCanvas />
      </Suspense>

      {/* Top Navigation Bar */}
      <header className="relative z-20 max-w-7xl mx-auto w-full px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BrandLogo size="md" showCompany={true} withPulseAnimation={true} />
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/10 via-cyan-500/10 to-purple-500/10 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[11px] font-bold text-cyan-600 dark:text-cyan-300 tracking-wide">
              Xorstack Operational Core
            </span>
          </div>
          <ThemeToggle variant="toggle" size="sm" />
          <Link
            href="/login"
            className="text-xs font-bold text-foreground hover:text-[var(--brand-primary)] transition-colors flex items-center gap-1 bg-card/60 px-3 py-1.5 rounded-lg border border-border/80"
          >
            Direct Login <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-6 py-8 md:py-12 flex-1 flex flex-col justify-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-12 text-center max-w-4xl mx-auto w-full"
        >
          {/* Hero Header Section */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-[var(--brand-primary)]/10 to-purple-500/10 text-cyan-300 text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Unified Work & Performance Engine</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
              One place to plan, track, and grow your work at{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d0ac64] via-[#eed79b] via-[#38bdf8] to-[#c084fc] drop-shadow-[0_0_25px_rgba(208,172,100,0.3)]">
                Xorstack
              </span>
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              WorkPulse synchronizes daily execution, reviews, biometric attendance, blockers, and professional coaching for our high-performing team.
            </p>
          </motion.div>

          {/* 4 Role Selection Tiles */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 text-left pt-2"
          >
            <RoleCard3D
              roleSlug="employee"
              roleName="Employee"
              roleBadge="Core Pod"
              badgeVariant="brand"
              icon={User}
              description="Plan your day, submit SOD/EOD updates, budget weekly goals, and track your attendance."
              highlights={["Daily SOD/EOD workflow", "100% Goal Budgeting", "Two-Stage Leave Requests"]}
            />

            <RoleCard3D
              roleSlug="manager"
              roleName="Team Lead"
              roleBadge="Management"
              badgeVariant="secondary"
              icon={Users}
              description="Lead your team, unblock critical issues, conduct 1-on-1s, and approve performance cycles."
              highlights={["Team Presence Heatmap", "SLA Escalation Board", "Weekly Review Cycles"]}
            />

            <RoleCard3D
              roleSlug="hr"
              roleName="People Ops / HR"
              roleBadge="Operations"
              badgeVariant="outline"
              icon={Briefcase}
              description="Oversee headcount, publish organization broadcasts, evaluate probation, and audit leaves."
              highlights={["Company Announcements", "Stage-2 Leave Sign-off", "Probation & PIP Pipeline"]}
            />

            <RoleCard3D
              roleSlug="admin"
              roleName="System Admin"
              roleBadge="Security"
              badgeVariant="destructive"
              icon={ShieldCheck}
              description="Root security control, biometric hardware integration, immutable audit logs, and system config."
              highlights={["Biometric Terminal Sync", "Immutable Audit Vault", "Scoped Data Exports"]}
            />
          </motion.div>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 py-6 border-t border-border/40 text-center text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Shield className="h-3.5 w-3.5 text-cyan-400" />
          <span>Restricted to authorized Xorstack team members. Zero raw biometric retention.</span>
        </div>
        <div>
          <span>© 2026 Xorstack Inc. · All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
