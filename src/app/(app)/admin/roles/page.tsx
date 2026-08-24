"use client";

import React from "react";
import { AdminSecurityAuditVaultDeck } from "@/features/admin/components/AdminSecurityAuditVaultDeck";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminRolesPage() {
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
              <ShieldCheck className="h-3 w-3 mr-1 text-red-400" />
              Role-Based Access Control (RBAC)
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">Zero-Trust Policies</span>
          </div>
          <h2 className="text-2xl font-black text-foreground">Role Hierarchy & Granular Permissions</h2>
          <p className="text-xs text-muted-foreground">
            Configure permission matrices for EMPLOYEE, MANAGER, HR, and ADMIN roles with sensitive DPDP data masking.
          </p>
        </Interactive3DCard>

        <AdminSecurityAuditVaultDeck />
      </div>
    </PageTransition>
  );
}
