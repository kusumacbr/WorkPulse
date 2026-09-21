"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Upload, FileSpreadsheet, Check, AlertCircle, Sparkles, RefreshCw, Layers, X } from "lucide-react";

export interface BiometricPunchRecord {
  id?: string;
  employeeId: string;
  employeeName: string;
  departmentName?: string;
  date: string;
  firstIn: string;
  lastOut: string;
  punchType: "IN" | "OUT" | "MISSED";
  workMode: "OFFICE" | "WFH" | "HYBRID";
  terminalId: string;
  location: string;
  status: "ON_TIME" | "LATE_ARRIVAL" | "APPROVED_WFH" | "MISSED_PUNCH";
}

export const SAMPLE_BIOMETRIC_PUNCHES: BiometricPunchRecord[] = [
  {
    id: "biom-sample-1",
    employeeId: "emp-rohit",
    employeeName: "Rohit Sharma",
    departmentName: "Development",
    date: new Date().toISOString().split("T")[0] || "2026-09-09",
    firstIn: "09:48 AM",
    lastOut: "06:55 PM",
    punchType: "IN",
    workMode: "OFFICE",
    terminalId: "TERM-BLR-GATE1",
    location: "Bangalore HQ - Main Entry",
    status: "ON_TIME",
  },
  {
    id: "biom-sample-2",
    employeeId: "emp-sarah",
    employeeName: "Sara Devi",
    departmentName: "Development",
    date: new Date().toISOString().split("T")[0] || "2026-09-09",
    firstIn: "09:58 AM",
    lastOut: "07:12 PM",
    punchType: "IN",
    workMode: "OFFICE",
    terminalId: "TERM-BLR-GATE2",
    location: "Bangalore HQ - East Turnstile",
    status: "ON_TIME",
  },
  {
    id: "biom-sample-3",
    employeeId: "lead-alex",
    employeeName: "Alex Lead",
    departmentName: "Development",
    date: new Date().toISOString().split("T")[0] || "2026-09-09",
    firstIn: "10:18 AM",
    lastOut: "07:05 PM",
    punchType: "IN",
    workMode: "OFFICE",
    terminalId: "TERM-BLR-FLR2",
    location: "Bangalore HQ - Floor 2",
    status: "LATE_ARRIVAL",
  },
  {
    id: "biom-sample-4",
    employeeId: "emp-ananya",
    employeeName: "Ananya Sen",
    departmentName: "Service Providers (ConfigTap)",
    date: new Date().toISOString().split("T")[0] || "2026-09-09",
    firstIn: "09:52 AM",
    lastOut: "06:40 PM",
    punchType: "IN",
    workMode: "OFFICE",
    terminalId: "TERM-BLR-GATE1",
    location: "Bangalore HQ - Main Entry",
    status: "ON_TIME",
  },
  {
    id: "biom-sample-5",
    employeeId: "emp-marcus",
    employeeName: "Marcus Vance",
    departmentName: "Devops",
    date: new Date().toISOString().split("T")[0] || "2026-09-09",
    firstIn: "10:05 AM",
    lastOut: "07:15 PM",
    punchType: "IN",
    workMode: "OFFICE",
    terminalId: "TERM-BLR-FLR3",
    location: "Bangalore HQ - Server Room",
    status: "ON_TIME",
  },
  {
    id: "biom-sample-6",
    employeeId: "emp-sneha",
    employeeName: "Sneha Kapoor",
    departmentName: "Data processing",
    date: new Date().toISOString().split("T")[0] || "2026-09-09",
    firstIn: "09:35 AM",
    lastOut: "06:45 PM",
    punchType: "IN",
    workMode: "OFFICE",
    terminalId: "TERM-BLR-GATE1",
    location: "Bangalore HQ - Main Entry",
    status: "ON_TIME",
  },
  {
    id: "biom-sample-7",
    employeeId: "emp-priya",
    employeeName: "Priya QA",
    departmentName: "R & D",
    date: new Date().toISOString().split("T")[0] || "2026-09-09",
    firstIn: "10:00 AM",
    lastOut: "06:30 PM",
    punchType: "IN",
    workMode: "WFH",
    terminalId: "REMOTE-VPN",
    location: "Approved WFH Sync",
    status: "APPROVED_WFH",
  },
  {
    id: "biom-sample-8",
    employeeId: "emp-rachel",
    employeeName: "Rachel HR",
    departmentName: "Human Resources",
    date: new Date().toISOString().split("T")[0] || "2026-09-09",
    firstIn: "09:30 AM",
    lastOut: "06:30 PM",
    punchType: "IN",
    workMode: "OFFICE",
    terminalId: "TERM-BLR-HR",
    location: "Bangalore HQ - HR Desk",
    status: "ON_TIME",
  },
];

interface UploadBiometricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess: (punches: BiometricPunchRecord[]) => void;
}

export function UploadBiometricModal({ isOpen, onClose, onUploadSuccess }: UploadBiometricModalProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [parsedRecords, setParsedRecords] = useState<BiometricPunchRecord[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleCloseModal = React.useCallback(() => {
    setParsedRecords([]);
    setFileName(null);
    setErrorMsg(null);
    setIsUploading(false);
    onClose();
  }, [onClose]);

  React.useEffect(() => {
    if (!isOpen) {
      setParsedRecords([]);
      setFileName(null);
      setErrorMsg(null);
      setIsUploading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Parse custom uploaded file (CSV or JSON)
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    parseUploadedFile(file);
  };

  const parseUploadedFile = (file: File) => {
    setFileName(file.name);
    setErrorMsg(null);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) return;

        if (file.name.endsWith(".json")) {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            const formatted: BiometricPunchRecord[] = parsed.map((item: any, idx: number) => {
              const firstInStr = item.firstIn || item.time_in || "10:00 AM";
              const isLate = firstInStr.includes("10:") && Number(firstInStr.split(":")[1]?.slice(0, 2) || 0) > 15;
              const calcStatus: "ON_TIME" | "LATE_ARRIVAL" | "APPROVED_WFH" | "MISSED_PUNCH" = item.status
                ? item.status
                : isLate
                ? "LATE_ARRIVAL"
                : "ON_TIME";

              return {
                id: item.id || `uploaded-${Date.now()}-${idx}`,
                employeeId: item.employeeId || item.emp_id || `emp-${idx}`,
                employeeName: item.employeeName || item.name || "Staff Member",
                departmentName: item.departmentName || item.department || "General",
                date: item.date || new Date().toISOString().split("T")[0] || "2026-09-09",
                firstIn: firstInStr,
                lastOut: item.lastOut || item.time_out || "07:00 PM",
                punchType: item.punchType || "IN",
                workMode: item.workMode || "OFFICE",
                terminalId: item.terminalId || "TERM-BLR-01",
                location: item.location || "HQ Entry",
                status: calcStatus,
              };
            });
            setParsedRecords(formatted);
          }
        } else {
          // Parse CSV text format
          const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
          const records: BiometricPunchRecord[] = [];

          const firstLine = lines[0] || "";
          const startIndex = firstLine.toLowerCase().includes("employee") ? 1 : 0;
          for (let i = startIndex; i < lines.length; i++) {
            const currentLine = lines[i];
            if (!currentLine) continue;
            const cols = currentLine.split(",").map((c) => c.replace(/"/g, "").trim());
            if (cols.length >= 2) {
              const empId = cols[0] || `emp-${i}`;
              const empName = cols[1] || "Staff Member";
              const firstIn = cols[2] || "10:00 AM";
              const lastOut = cols[3] || "07:00 PM";
              const dateStr = cols[4] || new Date().toISOString().split("T")[0] || "2026-09-09";

              records.push({
                id: `csv-${Date.now()}-${i}`,
                employeeId: empId,
                employeeName: empName,
                date: dateStr,
                firstIn,
                lastOut,
                punchType: "IN",
                workMode: "OFFICE",
                terminalId: "TERM-BLR-CSV",
                location: "Biometric CSV Upload",
                status: "ON_TIME",
              });
            }
          }

          if (records.length > 0) {
            setParsedRecords(records);
          } else {
            setErrorMsg("No valid records found in the uploaded file. Please select a valid biometric CSV or JSON file.");
            setParsedRecords([]);
          }
        }
      } catch (err: any) {
        setErrorMsg("Could not parse file structure. Please ensure it is a valid CSV or JSON file.");
        setParsedRecords([]);
      }
    };

    reader.readAsText(file);
  };

  const handleSaveAndSync = async () => {
    if (parsedRecords.length === 0) return;
    setIsUploading(true);

    try {
      // 1. Post to API backend to upsert in Supabase permanently
      await fetch("/api/v1/attendance/punches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ punches: parsedRecords }),
      }).catch((e) => console.warn("Supabase biometric API sync notice:", e));

      // 2. Dispatch global events for real-time update
      if (typeof window !== "undefined") {
        try {
          window.dispatchEvent(new CustomEvent("workpulse_sync"));
          window.dispatchEvent(new CustomEvent("workday:biometric_uploaded", { detail: { punches: parsedRecords } }));

          if ("BroadcastChannel" in window) {
            const bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
            bc.postMessage({ type: "attendance:biometric_uploaded", count: parsedRecords.length, timestamp: Date.now() });
            bc.close();
          }
        } catch {}
      }

      onUploadSuccess(parsedRecords);
      setIsUploading(false);
      handleCloseModal();
    } catch (err: any) {
      console.error("Error saving biometric records:", err);
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-card border border-border shadow-2xl p-4 sm:p-6 rounded-2xl sm:rounded-3xl space-y-4 animate-in zoom-in-95 custom-scrollbar">
        <div className="flex items-center justify-between pb-3 border-b border-border/60">
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-cyan-400" />
              <span>Upload Biometric Attendance File</span>
              <Badge variant="outline" className="text-[10px] font-bold text-emerald-400 border-emerald-500/30 bg-emerald-500/10">
                <Sparkles className="h-3 w-3 mr-1" />
                Project-wide Sync
              </Badge>
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              Import biometric punch logs (.csv, .json). Uploaded attendance data will update all dashboards, muster rolls, and attendance monitors across Supabase and local storage.
            </p>
          </div>
          <button
            type="button"
            onClick={handleCloseModal}
            className="p-1.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Device File Upload Zone */}
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,.json,.txt"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              const file = e.dataTransfer.files?.[0];
              if (file) parseUploadedFile(file);
            }}
            className={`p-5 sm:p-8 rounded-2xl border-2 border-dashed text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-3 ${
              dragActive
                ? "border-cyan-400 bg-cyan-500/10"
                : "border-border/80 bg-muted/30 hover:border-cyan-500/50 hover:bg-muted/50"
            }`}
          >
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shadow-sm">
              <Upload className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <p className="text-xs font-bold text-foreground">
                {fileName ? `Loaded: ${fileName}` : "Click to select or drag & drop biometric CSV file from your device"}
              </p>
              <p className="text-[11px] text-muted-foreground">
                Supports standard biometric terminal log formats (.csv, .json, .txt)
              </p>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs cursor-pointer shadow-md transition-all hover:scale-[1.02]"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>Choose File from Disk</span>
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Preview Table of Parsed Records */}
        {parsedRecords.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <Layers className="h-4 w-4 text-cyan-400" />
                <span>Parsed Biometric Logs Preview ({parsedRecords.length} Records)</span>
              </span>
              <Badge variant="outline" className="text-[9px] font-bold text-cyan-300 border-cyan-500/30">
                Ready to Sync
              </Badge>
            </div>

            <div className="border border-border/60 rounded-2xl overflow-hidden max-h-48 overflow-y-auto overflow-x-auto text-xs">
              <table className="w-full min-w-[500px] text-left border-collapse text-[11px]">
                <thead className="bg-muted/70 text-muted-foreground font-semibold sticky top-0 border-b border-border/60">
                  <tr>
                    <th className="p-2 pl-3">Employee</th>
                    <th className="p-2">Date</th>
                    <th className="p-2">First In</th>
                    <th className="p-2">Last Out</th>
                    <th className="p-2">Mode</th>
                    <th className="p-2 pr-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-mono">
                  {parsedRecords.map((r, i) => (
                    <tr key={r.id || i} className="hover:bg-muted/30">
                      <td className="p-2 pl-3 font-sans font-bold text-foreground">{r.employeeName}</td>
                      <td className="p-2 text-muted-foreground">{r.date}</td>
                      <td className="p-2 text-emerald-400">{r.firstIn}</td>
                      <td className="p-2 text-cyan-400">{r.lastOut}</td>
                      <td className="p-2 font-sans">
                        <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                          {r.workMode}
                        </Badge>
                      </td>
                      <td className="p-2 pr-3 text-right font-sans">
                        <span className={`text-[10px] font-bold ${r.status === "LATE_ARRIVAL" ? "text-amber-400" : "text-emerald-400"}`}>
                          {r.status === "LATE_ARRIVAL" ? "Late" : "On-Time"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2 border-t border-border/60">
          <Button variant="outline" size="sm" onClick={handleCloseModal} className="h-9 text-xs rounded-xl w-full sm:w-auto">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSaveAndSync}
            disabled={parsedRecords.length === 0 || isUploading}
            className="h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 rounded-xl shadow-md cursor-pointer w-full sm:w-auto"
          >
            {isUploading ? (
              <>
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                <span>Saving to Supabase &amp; Project...</span>
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                <span>Save &amp; Update Entire Project ({parsedRecords.length})</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
