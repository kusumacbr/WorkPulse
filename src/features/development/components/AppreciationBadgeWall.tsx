"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BadgeAwardRecord } from "@/server/services/coaching-service";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import {
  Award,
  Clock,
  Users,
  Zap,
  Sparkles,
  Heart,
  ShieldCheck,
  BookOpen,
  Crown,
  Plus,
  X,
} from "lucide-react";

const starterBadgesList = [
  { id: "badge-1", name: "Outstanding Performer", description: "Consistently exceeds delivery expectations", icon: Award, points: 25 },
  { id: "badge-2", name: "On-Time Delivery", description: "Flawless track record of meeting sprint commitments", icon: Clock, points: 15 },
  { id: "badge-3", name: "Team Player", description: "Provides exceptional cross-team collaboration", icon: Users, points: 20 },
  { id: "badge-4", name: "Problem Solver", description: "Resolves critical production incidents", icon: Zap, points: 20 },
  { id: "badge-5", name: "Innovation Champion", description: "Introduces impactful technical improvements", icon: Sparkles, points: 25 },
  { id: "badge-6", name: "Customer Champion", description: "Demonstrates exceptional customer empathy", icon: Heart, points: 20 },
  { id: "badge-7", name: "Consistent Performer", description: "Delivers steady, reliable engineering output", icon: ShieldCheck, points: 15 },
  { id: "badge-8", name: "Learning Champion", description: "Pursues continuous skill development", icon: BookOpen, points: 15 },
  { id: "badge-9", name: "Leadership Award", description: "Demonstrates inspiring mentorship", icon: Crown, points: 30 },
];

export function AppreciationBadgeWall() {
  const { allEmployees } = useWorkpulseSharedStore();
  const [awards, setAwards] = useState<BadgeAwardRecord[]>([
    {
      id: "award-1",
      badgeDefinitionId: "badge-4",
      badgeName: "Problem Solver",
      recipientEmployeeId: "emp-sarah",
      issuerEmployeeId: "emp-alex",
      reason: "Resolved critical biometric sync deduplication deadlock under 30 minutes!",
      points: 20,
      visibility: "PUBLIC",
      awardedAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      id: "award-2",
      badgeDefinitionId: "badge-3",
      badgeName: "Team Player",
      recipientEmployeeId: "emp-john",
      issuerEmployeeId: "emp-priya",
      reason: "Helped QA team build automated UI test fixtures for review workflows.",
      points: 20,
      visibility: "PUBLIC",
      awardedAt: new Date(Date.now() - 86400000).toISOString(),
    },
  ]);

  const [showAwardModal, setShowAwardModal] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState("badge-1");
  const [recipient, setRecipient] = useState(allEmployees[0]?.id || "emp-sarah");
  const [reason, setReason] = useState("");

  const handleIssueAward = () => {
    if (!reason) return;

    const bDef = starterBadgesList.find((b) => b.id === selectedBadge)!;
    const newAward: BadgeAwardRecord = {
      id: `award-${Date.now()}`,
      badgeDefinitionId: bDef.id,
      badgeName: bDef.name,
      recipientEmployeeId: recipient,
      issuerEmployeeId: "emp-alex",
      reason,
      points: bDef.points,
      visibility: "PUBLIC",
      awardedAt: new Date().toISOString(),
    };

    setAwards((prev) => [newAward, ...prev]);
    setShowAwardModal(false);
    setReason("");
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Award className="h-4 w-4 text-[var(--brand-primary)]" />
            Company Appreciation Badges & Peer Recognition
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Recognize teammates for exemplary achievements, cross-team unblocking, and leadership excellence.
          </p>
        </div>

        <Button
          variant="brand"
          size="sm"
          className="text-xs font-semibold gap-1.5 h-8.5 self-start sm:self-auto"
          onClick={() => setShowAwardModal(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          Award a Badge
        </Button>
      </div>

      {/* Starter Badges Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {starterBadgesList.map((badge) => {
          const IconComponent = badge.icon;
          return (
            <Card key={badge.id} className="border-border text-center p-3 hover:border-[var(--brand-primary)]/50 transition-all">
              <div className="h-10 w-10 mx-auto rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center mb-2">
                <IconComponent className="h-5 w-5" />
              </div>
              <span className="font-bold text-xs text-foreground block">{badge.name}</span>
              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{badge.description}</p>
              <Badge variant="secondary" className="mt-2 text-[10px]">
                +{badge.points} pts
              </Badge>
            </Card>
          );
        })}
      </div>

      {/* Recent Awards Feed */}
      <Card className="border-border">
        <CardHeader className="pb-3 border-b border-border">
          <CardTitle className="text-sm font-bold flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[var(--brand-primary)]" />
            Recent Recognition Feed
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-3 text-xs">
          {awards.map((award: any) => {
            const badgeMeta = starterBadgesList.find((b) => b.id === (award.badgeDefinitionId || award.badgeId));
            const recipientEmp = allEmployees.find((e) => e.id === (award.recipientEmployeeId || award.recipientId));
            const issuerEmp = allEmployees.find((e) => e.id === award.issuerEmployeeId);
            const issuerName = award.awardedByName || (issuerEmp ? issuerEmp.name : award.issuerEmployeeId);
            const IconComponent = badgeMeta?.icon || Award;

            return (
              <div
                key={award.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl bg-card border border-border/60 hover:border-border transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] flex items-center justify-center shrink-0">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-bold text-foreground">{recipientEmp?.name || award.recipientId || award.recipientEmployeeId}</span>
                      <span className="text-muted-foreground">was awarded</span>
                      <strong className="text-[var(--brand-primary)]">{award.badgeName}</strong>
                    </div>
                    <p className="text-muted-foreground text-[11px] leading-relaxed italic">
                      &quot;{award.reason}&quot;
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right shrink-0">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    By {issuerName}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground block">
                    {new Date(award.awardedAt).toLocaleDateString()} · +{award.points} Points
                  </span>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Award Badge Modal */}
      {showAwardModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4">
          <Card className="w-full max-w-md border-border shadow-2xl bg-card max-h-[92vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Award className="h-4 w-4 text-[var(--brand-primary)]" />
                Award Appreciation Badge
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowAwardModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold block mb-1">Select Badge *</label>
                <select
                  value={selectedBadge}
                  onChange={(e) => setSelectedBadge(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-md border border-input bg-background text-xs font-medium"
                >
                  {starterBadgesList.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} (+{b.points} pts)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Recipient *</label>
                <select
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-md border border-input bg-background text-xs font-medium"
                >
                  {allEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.designation} - {emp.id})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold block mb-1">Recognition Reason *</label>
                <Input
                  placeholder="e.g. Led the microservice refactoring under tight deadline..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => setShowAwardModal(false)} className="h-8.5 text-xs">
                  Cancel
                </Button>
                <Button variant="brand" size="sm" onClick={handleIssueAward} className="h-8.5 text-xs">
                  Issue Award
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
