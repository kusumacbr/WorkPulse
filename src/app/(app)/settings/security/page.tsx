"use client";

import React, { useState } from "react";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Fingerprint,
  Smartphone,
  LogOut,
  CheckCircle2,
  Lock,
  History,
} from "lucide-react";

export default function SecuritySettingsPage() {
  const [sessions, setSessions] = useState([
    {
      id: "sess-current",
      device: "MacBook Pro · Chrome 128 (Bangalore, India)",
      ipAddress: "115.240.18.24",
      lastActive: "Active Now",
      isCurrent: true,
    },
    {
      id: "sess-mobile",
      device: "iPhone 15 Pro · Mobile Safari (Bangalore, India)",
      ipAddress: "115.240.18.24",
      lastActive: "3 hours ago",
      isCurrent: false,
    },
  ]);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const handleRevokeSession = (id: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    setToastMsg("Session revoked successfully.");
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        {toastMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="font-bold">{toastMsg}</span>
          </div>
        )}

        <Interactive3DCard className="p-6 md:p-8 border border-red-500/30 bg-gradient-to-r from-card/90 via-card/70 to-red-500/10 space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="destructive" className="bg-red-500/15 border-red-500/30 text-red-300 text-[10px] font-bold uppercase">
                <Lock className="h-3 w-3 mr-1 text-red-400" />
                Account Security & Authentication
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">Zero-Trust IAM</span>
            </div>
            <h2 className="text-2xl font-black text-foreground">Security Settings & Credentials</h2>
            <p className="text-xs text-muted-foreground">
              Manage cryptographic passkeys, WebAuthn MFA, active login sessions, and DPDP personal data protection settings.
            </p>
          </div>
        </Interactive3DCard>

        {/* Passkeys & WebAuthn */}
        <Interactive3DCard className="p-6 border border-border/80 bg-card/60 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                <Fingerprint className="h-4 w-4 text-cyan-400" />
                Passkeys & Biometric WebAuthn Login
              </h3>
              <p className="text-xs text-muted-foreground">
                Authenticate seamlessly with Touch ID, Windows Hello, or hardware security keys without storing raw biometrics on server.
              </p>
            </div>
            <Button size="sm" variant="brand" className="text-xs h-8 px-3 bg-cyan-500 hover:bg-cyan-600 text-white shrink-0">
              Register New Passkey
            </Button>
          </div>

          <div className="p-3.5 rounded-xl bg-card border border-border/60 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <Smartphone className="h-4 w-4 text-emerald-400" />
              <div>
                <strong className="text-foreground">Touch ID / Platform Authenticator</strong>
                <span className="text-[11px] text-muted-foreground block font-mono">Added: Aug 01, 2026</span>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30">Active</Badge>
          </div>
        </Interactive3DCard>

        {/* Active Sessions */}
        <Interactive3DCard className="p-6 border border-border/80 bg-card/60 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
              <History className="h-4 w-4 text-purple-400" />
              Active Login Sessions ({sessions.length})
            </h3>
            <span className="text-xs text-muted-foreground font-mono">IP Tracked & Scoped</span>
          </div>

          <div className="space-y-2.5">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="p-3.5 rounded-xl bg-card border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <strong className="text-foreground">{sess.device}</strong>
                    {sess.isCurrent && (
                      <Badge variant="brand" className="text-[9px] bg-emerald-500/15 text-emerald-400 border-emerald-500/30">
                        Current Session
                      </Badge>
                    )}
                  </div>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    IP: {sess.ipAddress} · {sess.lastActive}
                  </span>
                </div>

                {!sess.isCurrent && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRevokeSession(sess.id)}
                    className="text-xs h-7 px-3 border-rose-500/40 text-rose-400 hover:bg-rose-500/10 gap-1 shrink-0"
                  >
                    <LogOut className="h-3 w-3" />
                    <span>Revoke</span>
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Interactive3DCard>
      </div>
    </PageTransition>
  );
}
