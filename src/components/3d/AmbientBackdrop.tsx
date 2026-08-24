"use client";

import React from "react";

export function AmbientBackdrop() {
  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden transition-opacity duration-500">
      {/* 1. Primary Gold Ambient Glow Orb (Top Right) */}
      <div className="absolute -top-40 -right-40 w-[650px] h-[650px] rounded-full bg-[radial-gradient(circle,rgba(208,172,100,0.12)_0%,rgba(0,0,0,0)_70%)] dark:bg-[radial-gradient(circle,rgba(208,172,100,0.12)_0%,rgba(0,0,0,0)_70%)] blur-3xl animate-pulse opacity-70 dark:opacity-100" />

      {/* 2. Electric Cyan / Neon Teal Ambient Glow Orb (Top Left) */}
      <div className="absolute top-20 -left-40 w-[550px] h-[550px] rounded-full bg-[radial-gradient(circle,rgba(6,182,212,0.08)_0%,rgba(0,0,0,0)_70%)] dark:bg-[radial-gradient(circle,rgba(6,182,212,0.10)_0%,rgba(0,0,0,0)_70%)] blur-3xl opacity-70 dark:opacity-100" />

      {/* 3. Royal Violet / Indigo Ambient Glow Orb (Bottom Center) */}
      <div className="absolute -bottom-40 left-1/3 w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(139,92,246,0.07)_0%,rgba(0,0,0,0)_70%)] dark:bg-[radial-gradient(circle,rgba(139,92,246,0.09)_0%,rgba(0,0,0,0)_70%)] blur-3xl opacity-70 dark:opacity-100" />

      {/* 4. Rose / Magenta Ambient Glow Orb (Bottom Right) */}
      <div className="absolute -bottom-32 -right-32 w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(244,63,94,0.05)_0%,rgba(0,0,0,0)_70%)] dark:bg-[radial-gradient(circle,rgba(244,63,94,0.06)_0%,rgba(0,0,0,0)_70%)] blur-3xl opacity-70 dark:opacity-100" />

      {/* Subtle Multi-Color Micro-Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.03)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
    </div>
  );
}
