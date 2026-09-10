"use client";

import React from "react";

export default function LeaveLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-28 rounded-3xl bg-card/40 border border-border/40" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="h-32 rounded-2xl bg-card/40 border border-border/40" />
        <div className="h-32 rounded-2xl bg-card/40 border border-border/40" />
        <div className="h-32 rounded-2xl bg-card/40 border border-border/40" />
      </div>
      <div className="h-72 rounded-3xl bg-card/40 border border-border/40" />
    </div>
  );
}
