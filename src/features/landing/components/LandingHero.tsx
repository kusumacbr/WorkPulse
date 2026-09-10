"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Sparkles, ShieldCheck } from "lucide-react";
import { BrandLogo } from "@/components/ui/BrandLogo";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export function LandingHero() {
  return (
    <div className="relative h-screen max-h-screen w-full bg-[hsl(201,100%,13%)] text-white flex flex-col justify-between overflow-hidden select-none selection:bg-cyan-400 selection:text-black">
      {/* Fullscreen Clear Looping Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none"
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4"
      />

      {/* Light Cinematic Vignette (Preserves maximum video clarity & vibrance) */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/45 z-[1] pointer-events-none" />

      {/* Top Center Brand Header (Clean, Large, Unboxed) */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 pt-5 sm:pt-7 pb-2 flex items-center justify-center shrink-0"
      >
        <BrandLogo size="xl" lightText />
      </motion.header>

      {/* Hero Section (No Scroll, perfectly balanced) */}
      <main className="relative z-10 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-2 max-w-5xl mx-auto w-full my-auto flex-1">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full flex flex-col items-center space-y-4 sm:space-y-5"
        >
          {/* WorkPulse Micro Pill Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/45 border border-white/20 backdrop-blur-md text-[11px] sm:text-xs text-white shadow-lg"
          >
            <Sparkles className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-cyan-300" />
            <span className="font-semibold text-white tracking-wide">
              Enterprise Workforce &amp; Execution Operating System
            </span>
          </motion.div>

          {/* Slogan H1 */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-[4.5rem] leading-[1.04] tracking-[-1.5px] max-w-4xl font-normal text-white drop-shadow-[0_3px_20px_rgba(0,0,0,0.85)]"
            style={{ fontFamily: "'Instrument Serif', serif" }}
          >
            Where{" "}
            <span className="text-cyan-300 font-medium">
              daily execution
            </span>{" "}
            meets{" "}
            <span className="text-amber-200 font-medium">
              operational velocity.
            </span>
          </motion.h1>

          {/* High-Contrast Subtext */}
          <motion.p
            variants={itemVariants}
            className="text-slate-100 text-xs sm:text-sm md:text-base max-w-xl leading-relaxed font-normal drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
          >
            The unified workspace for Start-of-Day planning, biometric shift attendance, two-tier leave governance, and quarterly OKR milestones.
          </motion.p>

          {/* Primary Sign In Action Button */}
          <motion.div variants={itemVariants} className="pt-10 sm:pt-14 md:pt-16">
            <Link
              href="/login"
              className="liquid-glass bg-white/[0.14] hover:bg-white/[0.25] border border-white/40 text-white font-bold rounded-full px-8 py-3.5 sm:px-12 sm:py-4 text-sm sm:text-base hover:scale-[1.03] cursor-pointer inline-flex items-center justify-center gap-2.5 transition-all shadow-[0_10px_35px_rgba(0,0,0,0.55)] active:scale-98"
            >
              <span>Sign In to WorkPulse</span>
              <ArrowRight className="h-4 w-4 text-cyan-300" />
            </Link>
          </motion.div>

          {/* Core Enterprise Module Status Pills */}
          <motion.div
            variants={itemVariants}
            className="pt-2 sm:pt-3 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3 text-xs sm:text-sm text-white"
          >
            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-white/25 backdrop-blur-md shadow-lg">
              <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />
              <span className="font-normal text-white">SOD Task Carryover</span>
            </div>

            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-white/25 backdrop-blur-md shadow-lg">
              <span className="h-2 w-2 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
              <span className="font-normal text-white">10:00 AM – 07:00 PM Shifts</span>
            </div>

            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-white/25 backdrop-blur-md shadow-lg">
              <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24]" />
              <span className="font-normal text-white">Lead → HR Approvals</span>
            </div>

            <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-white/25 backdrop-blur-md shadow-lg">
              <span className="h-2 w-2 rounded-full bg-purple-400 shadow-[0_0_10px_#c084fc]" />
              <span className="font-normal text-white">Weekly Goals &amp; OKRs</span>
            </div>
          </motion.div>
        </motion.div>
      </main>

      {/* Enterprise Security Footer (Clean, Regular Weight, Clearly Visible) */}
      <motion.footer
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="relative z-10 max-w-7xl mx-auto w-full px-6 sm:px-10 py-4 sm:py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-slate-100 shrink-0 font-normal"
      >
        <div className="flex items-center gap-3">
          <Image
            src="/logo.png"
            alt="Xorstack Logo"
            width={24}
            height={24}
            unoptimized
            className="h-6 w-auto object-contain drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]"
          />
          <div className="text-left flex items-center gap-2.5">
            <span className="font-normal text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              Xorstack Inc.
            </span>
            <span className="text-slate-400 hidden sm:inline">&middot;</span>
            <span className="text-slate-200 font-normal hidden sm:inline drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
              WorkPulse Platform
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3.5 text-slate-100 font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
          <span className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-cyan-300 shrink-0" />
            <span className="text-white font-normal">Encrypted Session</span>
          </span>
          <span className="text-slate-400">&middot;</span>
          <span className="text-slate-200 font-normal">Zero Raw Biometric Storage</span>
        </div>
      </motion.footer>
    </div>
  );
}
