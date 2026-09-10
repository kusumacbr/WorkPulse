"use client";

import React from "react";

export default function AttendanceLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-28 rounded-3xl bg-card/40 border border-border/40" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="h-36 rounded-2xl bg-card/40 border border-border/40" />
        <div className="h-36 rounded-2xl bg-card/40 border border-border/40" />
        <div className="h-36 rounded-2xl bg-card/40 border border-border/40" />
      </div>
      <div className="h-64 rounded-3xl bg-card/40 border border-border/40" />
    </div>
  );
}
