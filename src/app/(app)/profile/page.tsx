"use client";

import React, { useState } from "react";
import { useCurrentUser } from "@/components/layout/UserContext";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Briefcase,
  Clock,
  Globe,
  ShieldCheck,
  Edit3,
  CheckCircle2,
  Lock,
  HeartHandshake,
  Users,
} from "lucide-react";

export default function ProfilePage() {
  const user = useCurrentUser();

  const [isEditing, setIsEditing] = useState(false);
  const [preferredName, setPreferredName] = useState(user.userName || "Sarah Dev");
  const [phoneNumber, setPhoneNumber] = useState("+91 98450 12345");
  const [emergencyPhone, setEmergencyPhone] = useState("+91 98450 99999");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleSave = () => {
    setIsEditing(false);
    setToastMsg("Profile information updated successfully!");
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-5xl mx-auto">
        {toastMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="font-bold">{toastMsg}</span>
          </div>
        )}

        {/* Master Profile Header Card */}
        <Interactive3DCard className="p-6 md:p-8 border border-cyan-500/30 bg-gradient-to-r from-card/90 via-card/70 to-cyan-500/10 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-2xl bg-gradient-to-tr from-cyan-500 to-purple-600 border-2 border-cyan-400/50 flex items-center justify-center text-white text-2xl font-black shadow-xl">
                {user.userName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-foreground">{user.userName}</h2>
                  <Badge variant="brand" className="bg-cyan-500/15 border-cyan-500/30 text-cyan-300 text-[10px] font-bold uppercase">
                    {user.primaryRole}
                  </Badge>
                  <Badge variant="outline" className="text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                    ACTIVE
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground flex items-center gap-2 font-mono">
                  <span>EMP Code: <strong>EMP-0012</strong></span>
                  <span>·</span>
                  <span>Biometric: <strong>BIO-101</strong></span>
                </p>
                <p className="text-xs text-cyan-300 font-semibold">{user.designation} · {user.department}</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="text-xs h-9 px-4 border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 gap-1.5 shrink-0"
            >
              {isEditing ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Edit3 className="h-3.5 w-3.5" />}
              <span>{isEditing ? "Save Changes" : "Edit Profile"}</span>
            </Button>
          </div>
        </Interactive3DCard>

        {/* Profile Field Sections (Section 2.1 Specification) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 1. Official Employment & Organizational Details */}
          <Interactive3DCard className="p-6 border border-border/80 space-y-4 bg-card/60">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-cyan-400" />
              Organizational Hierarchy & Role
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/60">
                <span className="text-muted-foreground">Department</span>
                <strong className="text-foreground">{user.department}</strong>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/60">
                <span className="text-muted-foreground">Designation</span>
                <strong className="text-foreground">{user.designation}</strong>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/60">
                <span className="text-muted-foreground">Team / Pod</span>
                <strong className="text-cyan-300">{user.team}</strong>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/60">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3 text-purple-400" />
                  Primary Reporting Manager
                </span>
                <strong className="text-foreground">Alex Lead (Engineering Manager)</strong>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/60">
                <span className="text-muted-foreground">Employment Type</span>
                <Badge variant="outline" className="text-[10px] text-foreground">FULL_TIME (Permanent)</Badge>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/60">
                <span className="text-muted-foreground">Date of Joining</span>
                <span className="font-mono text-foreground">August 01, 2025</span>
              </div>
            </div>
          </Interactive3DCard>

          {/* 2. Contact & Personal Profile */}
          <Interactive3DCard className="p-6 border border-border/80 space-y-4 bg-card/60">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Mail className="h-4 w-4 text-emerald-400" />
              Contact Details & Shift Preferences
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1 p-2.5 rounded-xl bg-card border border-border/60">
                <span className="text-muted-foreground text-[11px]">Official Email</span>
                <div className="font-mono font-bold text-foreground">{user.userEmail}</div>
              </div>

              <div className="space-y-1 p-2.5 rounded-xl bg-card border border-border/60">
                <span className="text-muted-foreground text-[11px]">Preferred Name</span>
                {isEditing ? (
                  <Input
                    value={preferredName}
                    onChange={(e) => setPreferredName(e.target.value)}
                    className="h-7 text-xs mt-1"
                  />
                ) : (
                  <div className="font-semibold text-foreground">{preferredName}</div>
                )}
              </div>

              <div className="space-y-1 p-2.5 rounded-xl bg-card border border-border/60">
                <span className="text-muted-foreground text-[11px]">Contact Number</span>
                {isEditing ? (
                  <Input
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="h-7 text-xs mt-1"
                  />
                ) : (
                  <div className="font-mono text-foreground">{phoneNumber}</div>
                )}
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/60">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3 text-sky-400" />
                  Default Shift Window
                </span>
                <span className="font-mono text-cyan-300 font-bold">10:00 AM – 07:00 PM</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-card border border-border/60">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Globe className="h-3 w-3 text-amber-400" />
                  Timezone
                </span>
                <span className="font-mono text-foreground">Asia/Kolkata (UTC+05:30)</span>
              </div>
            </div>
          </Interactive3DCard>
        </div>

        {/* 3. Sensitive & Compliance Data (DPDP & Emergency Contact - Restricted) */}
        <Interactive3DCard className="p-6 border border-rose-500/30 bg-card/60 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <HeartHandshake className="h-4 w-4 text-rose-400" />
              Emergency Contact & Confidential Fields (Restricted to HR / Admin)
            </h3>
            <Badge variant="outline" className="text-[10px] text-rose-300 border-rose-500/30 flex items-center gap-1">
              <Lock className="h-2.5 w-2.5" />
              <span>RBAC Scoped</span>
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1">
              <span className="text-muted-foreground text-[11px]">Contact Person</span>
              <div className="font-bold text-foreground">Anita Dev (Spouse)</div>
            </div>

            <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1">
              <span className="text-muted-foreground text-[11px]">Emergency Phone</span>
              {isEditing ? (
                <Input
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="h-7 text-xs"
                />
              ) : (
                <div className="font-mono text-foreground">{emergencyPhone}</div>
              )}
            </div>

            <div className="p-3 rounded-xl bg-card border border-border/60 space-y-1">
              <span className="text-muted-foreground text-[11px]">Privacy Protection</span>
              <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> DPDP Act 2023 Compliant
              </div>
            </div>
          </div>
        </Interactive3DCard>
      </div>
    </PageTransition>
  );
}
