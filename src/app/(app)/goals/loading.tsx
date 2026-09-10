"use client";

import React from "react";

export default function GoalsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-28 rounded-3xl bg-card/40 border border-border/40" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-40 rounded-2xl bg-card/40 border border-border/40" />
        <div className="h-40 rounded-2xl bg-card/40 border border-border/40" />
        <div className="h-40 rounded-2xl bg-card/40 border border-border/40" />
        <div className="h-40 rounded-2xl bg-card/40 border border-border/40" />
      </div>
    </div>
  );
}
