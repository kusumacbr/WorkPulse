"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Download,
  CheckCircle2,
  Clock,
  X,
} from "lucide-react";

interface ExportReportModalProps {
  onClose: () => void;
}

export function ExportReportModal({ onClose }: ExportReportModalProps) {
  const [reportType, setReportType] = useState("ATTENDANCE_LEAVE");
  const [format, setFormat] = useState<"CSV" | "XLSX" | "PDF">("CSV");
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedJob, setCompletedJob] = useState<{
    id: string;
    downloadToken: string;
    totalRows: number;
    fileSizeBytes: number;
  } | null>(null);

  const handleStartExport = () => {
    setIsProcessing(true);
    setCompletedJob(null);

    // Simulate async job completion
    setTimeout(() => {
      setIsProcessing(false);
      setCompletedJob({
        id: `exp-${Date.now()}`,
        downloadToken: `tok_${Math.random().toString(36).substring(2, 12)}`,
        totalRows: 48,
        fileSizeBytes: 14200,
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border shadow-2xl bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Download className="h-4 w-4 text-[var(--brand-primary)]" />
            Asynchronous Data Export Engine
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-6 space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-muted/40 border border-border text-muted-foreground text-[11px] space-y-1">
            <span className="font-semibold text-foreground block">Row-Level RBAC Enforcement:</span>
            <span>Reports automatically filter strictly to the records permitted under your system role. Large jobs execute asynchronously in the background.</span>
          </div>

          <div>
            <label className="font-semibold block mb-1">Select Report Type *</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full h-8 px-2.5 rounded-md border border-input bg-background text-xs font-medium"
            >
              <option value="ATTENDANCE_LEAVE">Attendance, Biometric Punches & Leave</option>
              <option value="DAILY_WORK">Daily SOD & EOD Work Reports</option>
              <option value="PERFORMANCE">Performance Review Cycles & Scoring</option>
              <option value="BLOCKERS">Blockers & SLA Escalations</option>
              <option value="BADGES">Appreciation Badges & Recognition</option>
            </select>
          </div>

          <div>
            <label className="font-semibold block mb-1">Export Format *</label>
            <div className="grid grid-cols-3 gap-2">
              {(["CSV", "XLSX", "PDF"] as const).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setFormat(fmt)}
                  className={`py-1.5 rounded-lg border text-xs font-bold transition-all ${
                    format === fmt
                      ? "bg-[var(--brand-primary)] text-white border-[var(--brand-primary)] shadow-sm"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Job Processing State */}
          {isProcessing && (
            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30 text-center space-y-2">
              <Clock className="h-5 w-5 text-blue-500 mx-auto animate-spin" />
              <span className="font-bold text-foreground block text-xs">Generating Scoped Report...</span>
              <span className="text-[11px] text-muted-foreground">Applying row-level permission filters and streaming dataset.</span>
            </div>
          )}

          {/* Job Completed State */}
          {completedJob && (
            <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                <CheckCircle2 className="h-4 w-4" />
                <span>Export Job Completed! ({completedJob.totalRows} rows · {(completedJob.fileSizeBytes / 1024).toFixed(1)} KB)</span>
              </div>

              <span className="text-[11px] text-muted-foreground block">
                Download token generated. Link is valid for 15 minutes and verified at download time.
              </span>

              <div className="pt-2">
                <Button variant="brand" size="sm" className="w-full text-xs gap-1.5 h-8">
                  <Download className="h-3.5 w-3.5" />
                  Download {format} Report
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            {!completedJob && (
              <Button variant="brand" size="sm" onClick={handleStartExport} disabled={isProcessing}>
                Generate Async Export
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
