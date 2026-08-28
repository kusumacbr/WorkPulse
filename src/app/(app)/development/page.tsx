"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { AnimatedTabContent } from "@/components/animations/AnimatedTabContent";
import { BlockerEscalationBoard } from "@/features/development/components/BlockerEscalationBoard";
import { OneToOneMeetingCard } from "@/features/development/components/OneToOneMeetingCard";
import { AppreciationBadgeWall } from "@/features/development/components/AppreciationBadgeWall";
import { PipManagementModal } from "@/features/development/components/PipManagementModal";
import { HRTalentDevelopmentDesk } from "@/features/development/components/HRTalentDevelopmentDesk";
import { useCurrentUser } from "@/components/layout/UserContext";
import {
  Sparkles,
  AlertTriangle,
  MessageSquare,
  Award,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";

export default function DevelopmentPage() {
  const user = useCurrentUser();
  const isHR = user.roles.includes("HR") || user.primaryRole === "HR";

  const [activeTab, setActiveTab] = useState<"hr_talent" | "blockers" | "1on1" | "badges" | "pip">(
    isHR ? "hr_talent" : "blockers"
  );

  return (
    <PageTransition>
      {/* 3D Hero Header */}
      <Interactive3DCard className="p-6 md:p-8 border border-rose-500/30 bg-gradient-to-r from-card/80 via-card/60 to-rose-500/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="brand" className="font-bold text-[10px] uppercase bg-rose-500/15 border-rose-500/30 text-rose-300">
                <Sparkles className="h-3 w-3 mr-1 text-rose-400" />
                {isHR ? "Talent Development, L&D & Employee Relations" : "Coaching & Career Growth"}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                {isHR ? "PIP Governance · POSH Compliance · Grievances" : "1-on-1s · Badges · Blockers · Enablement"}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              {isHR ? "People Enablement, PIP Governance & L&D Matrix" : "Coaching, 1-on-1s & Growth Hub"}
            </h2>

            <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
              {isHR
                ? "Administer formal Performance Improvement Plans (PIP), track enterprise mandatory L&D & POSH compliance, resolve confidential employee grievances, and foster company-wide values."
                : "Conduct private 1-on-1 coaching syncs with your manager (Alex Lead), resolve blockers with SLA escalation, celebrate peers with appreciation kudos, and manage growth plans."}
            </p>
          </div>

          {/* Glass Tab Switcher */}
          <div className="flex items-center p-1 rounded-xl bg-background/50 border border-rose-500/30 backdrop-blur-md overflow-x-auto shrink-0 shadow-sm gap-1">
            {isHR && (
              <button
                type="button"
                onClick={() => setActiveTab("hr_talent")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === "hr_talent"
                    ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>HR Talent Desk</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setActiveTab("blockers")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "blockers"
                  ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>Blockers</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("1on1")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "1on1"
                  ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare className="h-3.5 w-3.5" />
              <span>1-on-1 Syncs</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("badges")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "badges"
                  ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Award className="h-3.5 w-3.5" />
              <span>Badges</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("pip")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === "pip"
                  ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              <span>PIP Plans</span>
            </button>
          </div>
        </div>
      </Interactive3DCard>

      {/* Animated Tab Content */}
      <AnimatedTabContent tabKey={activeTab}>
        {/* TAB 0: HR TALENT DESK */}
        {activeTab === "hr_talent" && isHR && <HRTalentDevelopmentDesk />}

        {/* TAB 1: BLOCKERS & ESCALATION RADAR */}
        {activeTab === "blockers" && <BlockerEscalationBoard />}

        {/* TAB 2: ONE-TO-ONE MEETINGS */}
        {activeTab === "1on1" && <OneToOneMeetingCard />}

        {/* TAB 3: APPRECIATION BADGE WALL */}
        {activeTab === "badges" && <AppreciationBadgeWall />}

        {/* TAB 4: CONFIDENTIAL PIP WORKSPACE */}
        {activeTab === "pip" && <PipManagementModal />}
      </AnimatedTabContent>
    </PageTransition>
  );
}
