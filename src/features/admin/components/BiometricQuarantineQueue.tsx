"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BiometricPunchTransactionRecord } from "@/server/services/biometric-service";
import {
  AlertOctagon,
  UserCheck,
  CheckCircle2,
  X,
} from "lucide-react";

interface BiometricQuarantineQueueProps {
  initialQuarantine?: BiometricPunchTransactionRecord[];
}

export function BiometricQuarantineQueue({ initialQuarantine }: BiometricQuarantineQueueProps) {
  const [quarantineList, setQuarantineList] = useState<BiometricPunchTransactionRecord[]>(
    initialQuarantine || [
      {
        id: "tx-q1",
        organizationId: "org-xorstack",
        deviceId: "dev-hq-floor3",
        provider: "GENERIC_WEBHOOK",
        deviceEmployeeCode: "BIO-999",
        occurredAt: "2026-08-20T09:14:22Z",
        originalTimezone: "Asia/Kolkata",
        direction: "IN",
        verificationMethod: "FINGERPRINT",
        ingestionStatus: "QUARANTINED",
        duplicateKey: "hash:tx-q1",
        quarantineReason: "Unmapped device employee code: 'BIO-999'. Placed in quarantine for HR/Admin resolution.",
        createdAt: "2026-08-20T09:14:25Z",
      },
    ]
  );

  const [resolvingTx, setResolvingTx] = useState<BiometricPunchTransactionRecord | null>(null);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("emp-priya");
  const [savePermanentMapping, setSavePermanentMapping] = useState(true);

  const handleResolve = () => {
    if (!resolvingTx) return;

    setQuarantineList((prev) => prev.filter((t) => t.id !== resolvingTx.id));
    setResolvingTx(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <AlertOctagon className="h-4 w-4 text-amber-500" />
            Biometric Quarantine Queue ({quarantineList.length})
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Punches with unknown or expired employee codes are held here — never silently auto-assigned or dropped.
          </p>
        </div>
      </div>

      {quarantineList.length === 0 ? (
        <Card className="border-border p-6 text-center text-xs text-muted-foreground">
          <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
          Quarantine queue is clear! All incoming biometric punches are actively mapped.
        </Card>
      ) : (
        <Card className="border-border">
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {quarantineList.map((tx) => (
                <div key={tx.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/20">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="destructive" className="text-[10px]">
                        Unmapped: {tx.deviceEmployeeCode}
                      </Badge>
                      <span className="text-xs font-bold text-foreground">
                        Terminal: {tx.deviceId}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        ({tx.provider})
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Occurred at: <span className="font-semibold text-foreground">{new Date(tx.occurredAt).toLocaleString()}</span> · Direction: <span className="font-semibold text-foreground">{tx.direction}</span> · Method: <span className="font-semibold text-foreground">{tx.verificationMethod}</span>
                    </p>

                    <p className="text-[11px] text-amber-600 dark:text-amber-400">
                      {tx.quarantineReason}
                    </p>
                  </div>

                  <div className="shrink-0">
                    <Button
                      variant="brand"
                      size="sm"
                      className="text-xs gap-1.5"
                      onClick={() => setResolvingTx(tx)}
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      Resolve Mapping
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resolution Modal */}
      {resolvingTx && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-border shadow-2xl bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-[var(--brand-primary)]" />
                Resolve Quarantined Punch
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setResolvingTx(null)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-6 space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Device Employee Code:</span>
                  <span className="font-bold text-foreground font-mono">{resolvingTx.deviceEmployeeCode}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Occurred At:</span>
                  <span className="font-semibold text-foreground">{new Date(resolvingTx.occurredAt).toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1">Select Employee to Map Punch</label>
                <select
                  value={selectedEmployeeId}
                  onChange={(e) => setSelectedEmployeeId(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-md border border-input bg-background text-xs font-medium"
                >
                  <option value="emp-priya">Priya QA (QA Lead - emp-priya)</option>
                  <option value="emp-david">David DevOps (DevOps - emp-david)</option>
                  <option value="emp-sarah">Sarah Dev (Senior Backend - emp-sarah)</option>
                  <option value="emp-john">John UI (Frontend - emp-john)</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 cursor-pointer text-foreground select-none font-medium">
                  <input
                    type="checkbox"
                    checked={savePermanentMapping}
                    onChange={(e) => setSavePermanentMapping(e.target.checked)}
                    className="rounded border-input text-[var(--brand-primary)]"
                  />
                  <span>Create permanent date-effective employee mapping</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => setResolvingTx(null)}>
                  Cancel
                </Button>
                <Button variant="brand" size="sm" onClick={handleResolve}>
                  Confirm & Recalculate Attendance
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
