"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import {
  Building2,
  Laptop,
} from "lucide-react";

interface DeptDistribution {
  name: string;
  count: number;
  pct: number;
  color: string;
  leadName: string;
}

const DEPARTMENTS: DeptDistribution[] = [
  { name: "Development", count: 18, pct: 37.5, color: "bg-cyan-400", leadName: "Alex Lead" },
  { name: "Devops", count: 8, pct: 16.7, color: "bg-emerald-400", leadName: "Marcus Vance" },
  { name: "Data processing", count: 7, pct: 14.6, color: "bg-purple-400", leadName: "Vikram Rao" },
  { name: "R & D", count: 6, pct: 12.5, color: "bg-pink-400", leadName: "Dr. Maya Chen" },
  { name: "Service Providers (ConfigTap)", count: 5, pct: 10.4, color: "bg-amber-400", leadName: "Suresh Menon" },
  { name: "SAP Services", count: 4, pct: 8.3, color: "bg-blue-400", leadName: "Rajeshwar Rao" },
];

export function WorkforceHeadcountAnalytics() {
  return (
    <div className="space-y-6">
      {/* Overview Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Department Headcount Bar Distribution */}
        <Interactive3DCard className="p-6 md:col-span-2 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                <Building2 className="h-4 w-4 text-cyan-400" />
                Department Headcount Distribution
              </h4>
              <p className="text-xs text-muted-foreground">48 total employees across 6 Xorstack practices</p>
            </div>
            <Badge variant="outline" className="text-xs font-mono font-bold text-cyan-400 border-cyan-500/30">
              48 Total
            </Badge>
          </div>

          {/* Stacked Multi-Color Progress Bar */}
          <div className="space-y-2">
            <div className="h-3 w-full rounded-full bg-muted overflow-hidden flex shadow-inner">
              {DEPARTMENTS.map((dept) => (
                <div
                  key={dept.name}
                  style={{ width: `${dept.pct}%` }}
                  className={`${dept.color} transition-all duration-500 hover:opacity-80`}
                  title={`${dept.name}: ${dept.count} (${dept.pct}%)`}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs">
              {DEPARTMENTS.map((dept) => (
                <div key={dept.name} className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${dept.color}`} />
                  <span className="text-muted-foreground">{dept.name}:</span>
                  <strong className="text-foreground">{dept.count} ({dept.pct}%)</strong>
                </div>
              ))}
            </div>
          </div>

          {/* Department Cards List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {DEPARTMENTS.map((dept) => (
              <div
                key={dept.name}
                className="p-3.5 rounded-xl bg-card/60 border border-border/70 flex items-center justify-between hover:border-border transition-colors text-xs"
              >
                <div>
                  <span className="font-bold text-foreground block">{dept.name}</span>
                  <span className="text-[11px] text-muted-foreground">Lead: {dept.leadName}</span>
                </div>
                <div className="text-right font-mono">
                  <strong className="text-sm font-extrabold text-foreground">{dept.count}</strong>
                  <span className="text-[10px] text-muted-foreground block">{dept.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </Interactive3DCard>

        {/* Workforce Presence Mode & Retention Card */}
        <Interactive3DCard className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-bold text-foreground flex items-center gap-2">
              <Laptop className="h-4 w-4 text-purple-400" />
              Workforce Presence
            </h4>
            <Badge variant="brand" className="text-[10px] bg-purple-500/15 text-purple-300 border-purple-500/30 uppercase font-bold">
              Hybrid Mode
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-card/70 border border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-cyan-400" />
                <span className="text-muted-foreground">Office (HQ Floor 3)</span>
              </div>
              <strong className="text-sm font-bold text-cyan-400">36 Employees (75%)</strong>
            </div>

            <div className="p-3.5 rounded-xl bg-card/70 border border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-purple-400" />
                <span className="text-muted-foreground">Approved Hybrid / WFH</span>
              </div>
              <strong className="text-sm font-bold text-purple-400">10 Employees (21%)</strong>
            </div>

            <div className="p-3.5 rounded-xl bg-card/70 border border-border/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="text-muted-foreground">Approved On-Leave</span>
              </div>
              <strong className="text-sm font-bold text-emerald-400">2 Employees (4%)</strong>
            </div>
          </div>

          <div className="pt-3 border-t border-border/60 space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Annual Retention Rate:</span>
              <strong className="text-emerald-400 font-bold">97.8%</strong>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Avg Tenure:</span>
              <strong className="text-foreground font-bold">2.4 Years</strong>
            </div>
          </div>
        </Interactive3DCard>
      </div>
    </div>
  );
}
