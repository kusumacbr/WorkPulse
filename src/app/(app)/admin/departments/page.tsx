"use client";

import React from "react";
import { AdminOrgSettingsDeck } from "@/features/admin/components/AdminOrgSettingsDeck";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Building2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminDepartmentsPage() {
  return (
    <PageTransition>
      <div className="space-y-6 max-w-6xl mx-auto">
        <Link href="/admin" className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Root Admin Console</span>
        </Link>

        <Interactive3DCard className="p-6 md:p-8 border border-red-500/30 bg-gradient-to-r from-card/90 via-card/70 to-red-500/10 space-y-2">
          <div className="flex items-center gap-2">
            <Badge variant="destructive" className="bg-red-500/15 border-red-500/30 text-red-300 text-[10px] font-bold uppercase">
              <Building2 className="h-3 w-3 mr-1 text-red-400" />
              Organizational Roster
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">6 Core Departments</span>
          </div>
          <h2 className="text-2xl font-black text-foreground">Department & Team Structure Management</h2>
          <p className="text-xs text-muted-foreground">
            Configure department structures, designate department heads, and allocate operational project quotas.
          </p>
        </Interactive3DCard>

        <AdminOrgSettingsDeck />
      </div>
    </PageTransition>
  );
}
