"use client";

import React from "react";
import { BiometricDeviceManager } from "@/features/admin/components/BiometricDeviceManager";
import { BiometricQuarantineQueue } from "@/features/admin/components/BiometricQuarantineQueue";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Cpu, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminBiometricDevicesPage() {
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
              <Cpu className="h-3 w-3 mr-1 text-red-400" />
              Biometric Hardware Grid (Section 9 Specification)
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">Zero Raw Template Storage</span>
          </div>
          <h2 className="text-2xl font-black text-foreground">Hardware Devices & Quarantine Queue</h2>
          <p className="text-xs text-muted-foreground">
            Manage eSlate, Matrix COSEC, and ZKTeco edge devices. Monitor heartbeats, manage employee hardware code mappings, and resolve quarantined punches.
          </p>
        </Interactive3DCard>

        <BiometricDeviceManager />
        <BiometricQuarantineQueue />
      </div>
    </PageTransition>
  );
}
