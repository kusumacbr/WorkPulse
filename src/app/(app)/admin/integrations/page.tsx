"use client";

import React from "react";
import { AdminIntegrationsDeck } from "@/features/admin/components/AdminIntegrationsDeck";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Share2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AdminIntegrationsPage() {
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
              <Share2 className="h-3 w-3 mr-1 text-red-400" />
              Integrations Hub (Section 15 & 16 Specification)
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">Webhooks & Connectors</span>
          </div>
          <h2 className="text-2xl font-black text-foreground">External Connectors & Webhooks</h2>
          <p className="text-xs text-muted-foreground">
            Configure system-wide calendar synchronizers, Slack alerts, Microsoft Teams webhooks, and secure API keys.
          </p>
        </Interactive3DCard>

        <AdminIntegrationsDeck />
      </div>
    </PageTransition>
  );
}
