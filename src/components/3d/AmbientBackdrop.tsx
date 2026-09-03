"use client";

import React from "react";

export function AmbientBackdrop() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden transition-opacity duration-500">
      {/* 1. Electric Landing Cyan Glow Orb (Top Right) */}
      <div className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(2,132,199,0.08)_0%,rgba(0,0,0,0)_70%)] dark:bg-[radial-gradient(circle,rgba(56,189,248,0.12)_0%,rgba(0,0,0,0)_70%)] blur-3xl opacity-80 dark:opacity-90 pointer-events-none" />

      {/* 2. Deep Sky / Oceanic Glow Orb (Top Left) */}
      <div className="absolute top-20 -left-40 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(14,165,233,0.06)_0%,rgba(0,0,0,0)_70%)] dark:bg-[radial-gradient(circle,rgba(6,182,212,0.12)_0%,rgba(0,0,0,0)_70%)] blur-3xl opacity-75 dark:opacity-100" />

      {/* 3. Warm Amber / Sunbeam Glow Orb (Bottom Left) */}
      <div className="absolute -bottom-40 left-1/4 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(245,158,11,0.05)_0%,rgba(0,0,0,0)_70%)] dark:bg-[radial-gradient(circle,rgba(251,191,36,0.08)_0%,rgba(0,0,0,0)_70%)] blur-3xl opacity-70 dark:opacity-100" />

      {/* 4. Royal Indigo / Violet Glow Orb (Bottom Right) */}
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(99,102,241,0.05)_0%,rgba(0,0,0,0)_70%)] dark:bg-[radial-gradient(circle,rgba(139,92,246,0.08)_0%,rgba(0,0,0,0)_70%)] blur-3xl opacity-70 dark:opacity-100" />

      {/* Subtle Multi-Color Micro-Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(56,189,248,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(56,189,248,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
    </div>
  );
}
