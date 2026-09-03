import React, { useState } from "react";
import { HRPeopleOperationsDeck } from "@/features/hr/components/HRPeopleOperationsDeck";
import { Users, UserCheck } from "lucide-react";

export type HRSimpleTaskTab = "directory" | "probation";

export function HRTaskManager() {
  const [activeTab, setActiveTab] = useState<HRSimpleTaskTab>("directory");

  return (
    <div className="space-y-5">
      {/* Simplified, Clean & Intuitive Navigation Tabs */}
      <div className="flex items-center p-1.5 rounded-2xl bg-card/70 border border-border/80 backdrop-blur-md overflow-x-auto gap-2 shadow-sm">
        {/* TAB 1: STAFF DIRECTORY & TEAMS */}
        <button
          type="button"
          onClick={() => setActiveTab("directory")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "directory"
              ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Staff Directory &amp; Teams</span>
        </button>

        {/* TAB 2: PROBATION & NEW JOINERS */}
        <button
          type="button"
          onClick={() => setActiveTab("probation")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
            activeTab === "probation"
              ? "bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
          }`}
        >
          <UserCheck className="h-4 w-4" />
          <span>New Joiners &amp; Probation</span>
        </button>
      </div>

      {/* Tab Contents: Simplified & Non-technical */}
      {activeTab === "directory" && (
        <HRPeopleOperationsDeck defaultSubTab="directory" hideSubTabBar />
      )}

      {activeTab === "probation" && (
        <HRPeopleOperationsDeck defaultSubTab="joiners_probation" hideSubTabBar />
      )}
    </div>
  );
}
