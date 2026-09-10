"use client";

import React from "react";

export default function MyWorkLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-28 rounded-3xl bg-card/40 border border-border/40" />
      <div className="space-y-3">
        <div className="h-14 rounded-2xl bg-card/40 border border-border/40" />
        <div className="h-14 rounded-2xl bg-card/40 border border-border/40" />
        <div className="h-14 rounded-2xl bg-card/40 border border-border/40" />
        <div className="h-14 rounded-2xl bg-card/40 border border-border/40" />
        <div className="h-14 rounded-2xl bg-card/40 border border-border/40" />
      </div>
    </div>
  );
}
