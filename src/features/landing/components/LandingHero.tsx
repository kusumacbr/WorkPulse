"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, Variants } from "framer-motion";
import {
  CheckCircle2,
  Clock,
  Target,
  Sparkles,
  Shield,
  ArrowRight,
  LogIn,
} from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { FeatureCard } from "./FeatureCard";

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
            className="text-xs font-bold bg-primary text-primary-foreground hover:opacity-90 transition-all flex items-center gap-1.5 px-4 py-2 rounded-xl shadow-sm"
          >
            <LogIn className="h-3.5 w-3.5" />
            <span>Sign In</span>
          </Link>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-6 py-8 md:py-12 flex-1 flex flex-col justify-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-10 text-center max-w-5xl mx-auto w-full"
        >
          {/* Hero Header Section */}
          <motion.div variants={itemVariants} className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-[var(--brand-primary)]/10 to-purple-500/10 text-cyan-300 text-xs font-bold shadow-[0_0_20px_rgba(6,182,212,0.15)]">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Unified Work &amp; Performance Engine</span>
            </div>

            <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.1]">
              One place to plan, track, and grow your work at{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#d0ac64] via-[#eed79b] via-[#38bdf8] to-[#c084fc] drop-shadow-[0_0_25px_rgba(208,172,100,0.3)]">
                Xorstack
              </span>
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              WorkPulse synchronizes daily task execution, biometric shift attendance, two-stage leave approvals, sprint deliverables, and team alignment for our high-performing organization.
            </p>

            {/* Prominent Primary Sign In Button */}
            <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/login"
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-cyan-400 to-teal-400 text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-[0_4px_25px_rgba(6,182,212,0.3)] hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <span>Sign In to WorkPulse</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </motion.div>

          {/* Core Feature Information Cards (In Place of Role Login Tiles) */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left pt-2 max-w-5xl mx-auto w-full"
          >
            <FeatureCard
              title="Daily Tasks & Execution"
              badge="Workflows"
              badgeVariant="brand"
              icon={CheckCircle2}
              accentColor="#06b6d4"
              description="Plan morning priorities with Start-of-Day (SOD) templates, track real-time progress, roll over pending items, and log End-of-Day (EOD) achievements."
              highlights={[
                "Morning SOD prioritization",
                "1-Click task carryover & rollover",
                "Real-time task timers & blocker flags",
                "Daily EOD achievement logging",
              ]}
            />

            <FeatureCard
              title="Biometric Attendance & Shifts"
              badge="Presence"
              badgeVariant="secondary"
              icon={Clock}
              accentColor="#38bdf8"
              description="Log shift punches instantly via biometric terminals, manage 10:00 AM – 07:00 PM shifts with 10:15 AM grace window compliance, and check live team presence."
              highlights={[
                "1-Tap biometric punch in/out",
                "10:15 AM grace window adherence",
                "Live 'Who's Where' presence radar",
                "Official festival & holiday calendar",
              ]}
            />

            <FeatureCard
              title="Leave Approvals & Goals"
              badge="Governance"
              badgeVariant="outline"
              icon={Target}
              accentColor="#10b981"
              description="Manage casual, sick, and earned leave quotas with two-tier approvals (Team Lead review & HR sign-off), alongside quarterly OKRs and performance milestones."
              highlights={[
                "Real-time leave balance quotas",
                "Stage-1 Lead → Stage-2 HR pipeline",
                "Handover notes & backup coverage",
                "Quarterly OKRs & key result metrics",
              ]}
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
          <span>&copy; 2026 Xorstack Inc. · All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
