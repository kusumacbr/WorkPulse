"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { BlockerRecord } from "@/server/services/coaching-service";
import {
  AlertTriangle,
  Plus,
  Clock,
  CheckCircle2,
  ShieldAlert,
  X,
} from "lucide-react";

interface BlockerEscalationBoardProps {
  initialBlockers?: BlockerRecord[];
}

export function BlockerEscalationBoard({ initialBlockers }: BlockerEscalationBoardProps) {
  const [blockers, setBlockers] = useState<BlockerRecord[]>(
    initialBlockers || [
      {
        id: "blk-1",
        taskId: "task-101",
        employeeId: "emp-sarah",
        description: "Staging database migration failed due to foreign key deadlock on production replica",
        category: "INFRASTRUCTURE",
        severity: "CRITICAL",
        responsibleTeam: "DevOps & Core Infra",
        supportRequired: "Admin needs to kill hung process and run schema reset script",
        reportedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
        status: "OPEN",
        resolutionSummary: null,
        isConfidential: false,
        resolvedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        escalations: [
          {
            id: "esc-1",
            blockerId: "blk-1",
            escalatedToRole: "ADMIN",
            escalatedAt: new Date(Date.now() - 3600000).toISOString(),
            reason: "Critical blocker SLA breached (3.0h >= 2h threshold). Escalated to Admin.",
          },
        ],
      },
      {
        id: "blk-2",
        taskId: "task-102",
        employeeId: "emp-john",
        description: "Awaiting Figma asset export approval from Brand design team for Auth screens",
        category: "DESIGN_DEPENDENCY",
        severity: "MEDIUM",
        responsibleTeam: "Design & UX",
        supportRequired: "Brand designer to review asset exports",
        reportedAt: new Date(Date.now() - 4 * 3600000).toISOString(),
        status: "IN_PROGRESS",
        resolutionSummary: null,
        isConfidential: false,
        resolvedAt: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        escalations: [],
      },
    ]
  );

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newDescription, setNewDescription] = useState("");
  const [newSeverity, setNewSeverity] = useState<"CRITICAL" | "HIGH" | "MEDIUM" | "LOW">("HIGH");
  const [newTeam, setNewTeam] = useState("Engineering Core");
  const [newSupport, setNewSupport] = useState("");

  const handleCreateBlocker = () => {
    if (!newDescription || !newSupport) return;

    const newBlk: BlockerRecord = {
      id: `blk-${Date.now()}`,
      employeeId: "emp-sarah",
      description: newDescription,
      category: "TECHNICAL",
      severity: newSeverity,
      responsibleTeam: newTeam,
      supportRequired: newSupport,
      reportedAt: new Date().toISOString(),
      status: "OPEN",
      resolutionSummary: null,
      isConfidential: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      escalations: [],
    };

    setBlockers((prev) => [newBlk, ...prev]);
    setShowCreateModal(false);
    setNewDescription("");
    setNewSupport("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-amber-500" />
            Active Blockers & Escalation SLA Tracking
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Report impediments, track resolution SLAs (Critical 2h, High 8h, Medium 16h), and view immutable escalation history.
          </p>
        </div>

        <Button
          variant="brand"
          size="sm"
          className="text-xs font-semibold gap-1.5 h-8"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Report New Blocker
        </Button>
      </div>

      {/* Blockers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {blockers.map((blk) => (
          <Card key={blk.id} className="border-border hover:border-border/80 transition-colors">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        blk.severity === "CRITICAL"
                          ? "destructive"
                          : blk.severity === "HIGH"
                          ? "brand"
                          : "secondary"
                      }
                      className="text-[10px] uppercase font-bold"
                    >
                      {blk.severity}
                    </Badge>
                    <span className="text-xs font-bold text-foreground">
                      {blk.responsibleTeam}
                    </span>
                  </div>
                  <CardTitle className="text-xs font-semibold text-foreground line-clamp-2">
                    {blk.description}
                  </CardTitle>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-3 text-xs">
              <div className="p-2.5 rounded-lg bg-muted/40 border border-border text-[11px] space-y-1">
                <span className="text-muted-foreground block font-medium">Support Needed:</span>
                <span className="text-foreground">{blk.supportRequired}</span>
              </div>

              {/* Escalations timeline */}
              {blk.escalations.length > 0 && (
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-[11px] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400">
                    <ShieldAlert className="h-3.5 w-3.5" />
                    <span>Auto-Escalated to {blk.escalations[0]?.escalatedToRole}</span>
                  </div>
                  <p className="text-muted-foreground">{blk.escalations[0]?.reason}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-1 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Reported: {new Date(blk.reportedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>

                <Button variant="outline" size="sm" className="h-7 text-xs gap-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  Resolve
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Blocker Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-border shadow-2xl bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Report Delivery Blocker
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowCreateModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Severity *</label>
                <div className="grid grid-cols-4 gap-2">
                  {(["CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map((sev) => (
                    <button
                      key={sev}
                      type="button"
                      onClick={() => setNewSeverity(sev)}
                      className={`py-1.5 rounded-lg border text-[11px] font-bold transition-all ${
                        newSeverity === sev
                          ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-sm"
                          : "border-border text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {sev}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Impediment Description *</label>
                <Textarea
                  placeholder="Describe what is blocking work progress..."
                  value={newDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewDescription(e.target.value)}
                  className="text-xs resize-none h-20"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Responsible Team / Dependency</label>
                <Input
                  value={newTeam}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewTeam(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div>
                <label className="font-semibold block mb-1">Support Required to Unblock *</label>
                <Input
                  placeholder="e.g. Need DB admin credentials, API endpoint review..."
                  value={newSupport}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewSupport(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button variant="brand" size="sm" onClick={handleCreateBlocker}>
                  Submit Blocker
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
