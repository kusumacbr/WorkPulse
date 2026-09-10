"use client";

import React from "react";

export default function AnnouncementsLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-28 rounded-3xl bg-card/40 border border-border/40" />
      <div className="h-64 rounded-3xl bg-card/40 border border-border/40" />
    </div>
  );
}
