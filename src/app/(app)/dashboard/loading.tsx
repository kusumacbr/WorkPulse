"use client";

import React from "react";

export default function DashboardLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-32 rounded-3xl bg-card/40 border border-border/40" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="h-28 rounded-2xl bg-card/40 border border-border/40" />
        <div className="h-28 rounded-2xl bg-card/40 border border-border/40" />
        <div className="h-28 rounded-2xl bg-card/40 border border-border/40" />
        <div className="h-28 rounded-2xl bg-card/40 border border-border/40" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 rounded-3xl bg-card/40 border border-border/40" />
        <div className="h-80 rounded-3xl bg-card/40 border border-border/40" />
      </div>
    </div>
  );
}
