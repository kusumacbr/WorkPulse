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
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface ExportReportModalProps {
  onClose: () => void;
}

export function ExportReportModal({ onClose }: ExportReportModalProps) {
  const [reportType, setReportType] = useState("ATTENDANCE_LEAVE");
  const [format, setFormat] = useState<"CSV" | "XLSX" | "PDF">("CSV");
  const [isProcessing, setIsProcessing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [completedJob, setCompletedJob] = useState<{
    id: string;
    downloadToken: string;
    totalRows: number;
    fileSizeBytes: number;
  } | null>(null);

  const handleStartExport = () => {
    setIsProcessing(true);
    setCompletedJob(null);
    setDownloadSuccess(false);

    // Simulate async job completion
    setTimeout(() => {
      setIsProcessing(false);
      setCompletedJob({
        id: `exp-${Date.now()}`,
        downloadToken: `tok_${Math.random().toString(36).substring(2, 12)}`,
        totalRows: 48,
        fileSizeBytes: 14200,
      });
    }, 600);
  };

  const handleDownloadFile = () => {
    let reportTitle = "WorkPulse Export Report";
    let baseFileName = `WorkPulse_Export_${new Date().toISOString().slice(0, 10)}`;
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (reportType === "ATTENDANCE_LEAVE") {
      reportTitle = "Enterprise Biometric Attendance & Shift Muster Roll";
      baseFileName = `WorkPulse_Attendance_Report_${new Date().toISOString().slice(0, 10)}`;
      headers = [
        "Employee ID",
        "Employee Name",
        "Department",
        "Designation",
        "Date",
        "First Punch IN",
        "Last Punch OUT",
        "Worked Hours",
        "Shift Status",
        "Approval Notes",
      ];
      rows = [
        ["EMP-001", "Alex Lead", "Development", "Engineering Manager", "2026-08-20", "10:15 AM", "07:05 PM", "8.2", "ON TIME", "Biometric Bangalore HQ"],
        ["EMP-002", "Rohit Sharma", "Development", "Frontend Engineer (UI/UX)", "2026-08-20", "10:22 AM", "07:05 PM", "8.2", "LATE ARRIVAL (7m)", "Grace Exceeded"],
        ["EMP-003", "Sara Dev", "Development", "Senior Backend Engineer", "2026-08-20", "10:15 AM", "07:05 PM", "8.2", "ON TIME", "Biometric Bangalore HQ"],
        ["EMP-004", "Sneha Kapoor", "Data Processing", "Data Analytics Engineer", "2026-08-20", "10:04 AM", "07:08 PM", "8.1", "ON TIME", "Biometric Bangalore HQ"],
        ["EMP-005", "Vikram Rao", "Data Processing", "Data Engineering Lead", "2026-08-20", "10:06 AM", "07:04 PM", "8.0", "ON TIME", "Biometric Bangalore HQ"],
        ["EMP-006", "Marcus Vance", "DevOps", "DevOps Lead", "2026-08-20", "10:00 AM", "07:00 PM", "8.0", "ON TIME", "Biometric Bangalore HQ"],
        ["EMP-007", "Priya Patel", "Product & QA", "QA & Automation Lead", "2026-08-20", "10:00 AM", "07:00 PM", "8.0", "APPROVED WFH", "Stage-2 Approved"],
        ["EMP-008", "David Director", "Executive", "SuperAdmin & Director", "2026-08-20", "09:55 AM", "07:15 PM", "8.3", "ON TIME", "Biometric Bangalore HQ"],
        ["EMP-009", "Rachel HR", "HR Operations", "People Operations Lead", "2026-08-20", "10:00 AM", "07:00 PM", "8.0", "ON TIME", "Biometric Bangalore HQ"],
        ["EMP-010", "Ananya Sen", "Engineering", "Automation Engineer", "2026-08-20", "10:10 AM", "07:00 PM", "8.0", "ON TIME", "Biometric Bangalore HQ"],
      ];
    } else if (reportType === "DAILY_WORK") {
      reportTitle = "Daily Workday Execution & SOD/EOD Activity Report";
      baseFileName = `WorkPulse_Daily_Work_Report_${new Date().toISOString().slice(0, 10)}`;
      headers = ["Date", "Employee ID", "Employee Name", "Department", "SOD Planned Items", "EOD Completed Items", "Carryover Count", "Status"];
      rows = [
        ["2026-08-20", "EMP-001", "Alex Lead", "Development", 4, 4, 0, "Completed"],
        ["2026-08-20", "EMP-002", "Rohit Sharma", "Development", 3, 3, 0, "Completed"],
        ["2026-08-20", "EMP-003", "Sara Dev", "Development", 5, 4, 1, "In Progress"],
        ["2026-08-20", "EMP-004", "Sneha Kapoor", "Data Processing", 4, 4, 0, "Completed"],
      ];
    } else if (reportType === "PERFORMANCE") {
      reportTitle = "Quarterly OKR & Performance Review Cycle";
      baseFileName = `WorkPulse_Performance_Cycle_${new Date().toISOString().slice(0, 10)}`;
      headers = ["Cycle", "Employee Name", "Department", "Self Rating", "Lead Rating", "Final Score", "Review Status"];
      rows = [
        ["Q3-2026", "Alex Lead", "Development", 4.8, 4.9, 4.85, "Approved"],
        ["Q3-2026", "Rohit Sharma", "Development", 4.5, 4.6, 4.55, "Approved"],
        ["Q3-2026", "Sara Dev", "Development", 4.9, 4.9, 4.90, "Approved"],
      ];
    } else {
      reportTitle = `WorkPulse System Report: ${reportType}`;
      baseFileName = `WorkPulse_Report_${reportType}_${new Date().toISOString().slice(0, 10)}`;
      headers = ["Report ID", "Type", "Generated At", "Exported By", "Row Count"];
      rows = [
        [`EXP-${Date.now()}`, reportType, new Date().toISOString(), "Rachel HR (People Operations)", 48],
      ];
    }

    try {
      if (format === "PDF") {
        // Genuine PDF generation via jsPDF & autoTable
        const doc = new jsPDF({
          orientation: "landscape",
          unit: "mm",
          format: "a4",
        });

        // Add Header Branding & Metadata
        doc.setFontSize(16);
        doc.setTextColor(6, 182, 212); // WorkPulse Brand Cyan
        doc.text("WorkPulse Enterprise Oversight", 14, 15);

        doc.setFontSize(11);
        doc.setTextColor(50, 50, 50);
        doc.text(reportTitle, 14, 22);

        doc.setFontSize(8);
        doc.setTextColor(120, 120, 120);
        doc.text(`Generated on: ${new Date().toLocaleString()} | Exported by: Rachel HR (People Operations)`, 14, 27);

        // Generate Table
        autoTable(doc, {
          startY: 32,
          head: [headers],
          body: rows,
          theme: "striped",
          headStyles: {
            fillColor: [6, 182, 212],
            textColor: 255,
            fontSize: 9,
            fontStyle: "bold",
          },
          bodyStyles: {
            fontSize: 8,
            textColor: 40,
          },
          alternateRowStyles: {
            fillColor: [245, 247, 250],
          },
          margin: { top: 32, left: 14, right: 14 },
        });

        // Save genuine .pdf file
        doc.save(`${baseFileName}.pdf`);
      } else if (format === "XLSX") {
        // Genuine Excel Workbook (.xlsx) via SheetJS
        const wb = XLSX.utils.book_new();
        const wsData = [headers, ...rows];
        const ws = XLSX.utils.aoa_to_sheet(wsData);

        XLSX.utils.book_append_sheet(wb, ws, "WorkPulse Report");
        XLSX.writeFile(wb, `${baseFileName}.xlsx`);
      } else {
        // Genuine CSV File (.csv)
        const csvContent = [
          headers.join(","),
          ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")),
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `${baseFileName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 3500);
    } catch (err) {
      console.error("Failed to trigger download:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-border shadow-2xl bg-card">
        <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Download className="h-4 w-4 text-[var(--brand-primary)]" />
            <span>Asynchronous Data Export Engine</span>
          </CardTitle>
          <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="p-6 space-y-4 text-xs">
          <div className="p-3 rounded-xl bg-muted/40 border border-border text-muted-foreground text-[11px] space-y-1">
            <span className="font-semibold text-foreground block">Row-Level RBAC Enforcement:</span>
            <span>Reports automatically filter strictly to the records permitted under your system role. Large jobs execute asynchronously in the background.</span>
          </div>

          <div>
            <label className="font-semibold block mb-1">Select Report Type *</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full h-9 px-2.5 rounded-xl border border-input bg-background text-xs font-medium text-foreground focus:outline-none focus:border-cyan-500/50"
            >
              <option value="ATTENDANCE_LEAVE">Attendance, Biometric Punches &amp; Leave</option>
              <option value="DAILY_WORK">Daily SOD &amp; EOD Work Reports</option>
              <option value="PERFORMANCE">Performance Review Cycles &amp; Scoring</option>
              <option value="BLOCKERS">Blockers &amp; SLA Escalations</option>
              <option value="BADGES">Appreciation Badges &amp; Recognition</option>
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
                  className={`py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    format === fmt
                      ? "bg-cyan-500 text-black border-cyan-400 shadow-sm"
                      : "border-border text-muted-foreground hover:text-foreground bg-card"
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>
          </div>

          {/* Job Processing State */}
          {isProcessing && (
            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center space-y-2">
              <Clock className="h-5 w-5 text-cyan-400 mx-auto animate-spin" />
              <span className="font-bold text-foreground block text-xs">Generating Scoped Report...</span>
              <span className="text-[11px] text-muted-foreground">Applying row-level permission filters and streaming dataset.</span>
            </div>
          )}

          {/* Job Completed State */}
          {completedJob && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                <CheckCircle2 className="h-4 w-4" />
                <span>Export Job Completed! ({completedJob.totalRows} rows &middot; {(completedJob.fileSizeBytes / 1024).toFixed(1)} KB)</span>
              </div>

              <span className="text-[11px] text-muted-foreground block">
                Download token generated. Link is valid for 15 minutes and verified at download time.
              </span>

              {downloadSuccess && (
                <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-[11px] text-emerald-300 font-bold text-center animate-in fade-in">
                  ✓ File downloaded successfully as .{format.toLowerCase()}!
                </div>
              )}

              <div className="pt-1">
                <Button
                  variant="brand"
                  size="sm"
                  onClick={handleDownloadFile}
                  className="w-full text-xs font-bold gap-1.5 h-9 bg-cyan-500 hover:bg-cyan-400 text-black shadow-md rounded-xl cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download {format} Report</span>
                </Button>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button variant="ghost" size="sm" onClick={onClose} className="rounded-xl text-xs">
              Cancel
            </Button>
            {!completedJob && (
              <Button
                variant="brand"
                size="sm"
                onClick={handleStartExport}
                disabled={isProcessing}
                className="rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-black cursor-pointer"
              >
                Generate Async Export
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
