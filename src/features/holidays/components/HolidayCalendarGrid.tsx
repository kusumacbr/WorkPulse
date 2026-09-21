"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HolidayRecord } from "@/server/services/holiday-service";
import { fireCelebrationConfetti } from "@/lib/ui/confetti";
import { useCurrentUser } from "@/components/layout/UserContext";
import {
  Calendar,
  Flag,
  Sparkles,
  Building,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  FileCode,
} from "lucide-react";

interface HolidayCalendarGridProps {
  initialHolidays?: HolidayRecord[];
  isHrOrAdmin?: boolean;
}

const DEFAULT_HOLIDAYS: HolidayRecord[] = [
  { id: "h-1", name: "Republic Day", date: "2026-01-26", holidayType: "NATIONAL", description: "National holiday celebrating the Constitution of India", year: 2026, createdAt: new Date().toISOString() },
  { id: "h-2", name: "Maha Shivratri", date: "2026-02-15", holidayType: "FESTIVAL", description: "Festival celebrating Lord Shiva", year: 2026, createdAt: new Date().toISOString() },
  { id: "h-3", name: "Holi", date: "2026-03-04", holidayType: "FESTIVAL", description: "Festival of colors", year: 2026, createdAt: new Date().toISOString() },
  { id: "h-4", name: "Eid-ul-Fitr", date: "2026-03-21", holidayType: "FESTIVAL", description: "Islamic festival marking the end of Ramadan", year: 2026, createdAt: new Date().toISOString() },
  { id: "h-5", name: "Independence Day", date: "2026-08-15", holidayType: "NATIONAL", description: "National Independence Day of India", year: 2026, createdAt: new Date().toISOString() },
  { id: "h-6", name: "Gandhi Jayanti", date: "2026-10-02", holidayType: "NATIONAL", description: "Birth anniversary of Mahatma Gandhi", year: 2026, createdAt: new Date().toISOString() },
  { id: "h-7", name: "Dussehra", date: "2026-10-20", holidayType: "FESTIVAL", description: "Victory of Good over Evil", year: 2026, createdAt: new Date().toISOString() },
  { id: "h-8", name: "Diwali", date: "2026-11-08", holidayType: "FESTIVAL", description: "Festival of Lights", year: 2026, createdAt: new Date().toISOString() },
  { id: "h-9", name: "Christmas", date: "2026-12-25", holidayType: "FESTIVAL", description: "Christmas celebration", year: 2026, createdAt: new Date().toISOString() },
];

export function HolidayCalendarGrid({
  initialHolidays,
  isHrOrAdmin,
}: HolidayCalendarGridProps) {
  const user = useCurrentUser();
  const isHrUser =
    user.roles.includes("HR") ||
    user.primaryRole === "HR" ||
    user.userEmail.toLowerCase().includes("hr") ||
    user.userEmail.toLowerCase().includes("admin");

  const canBulkImport = isHrOrAdmin !== undefined ? (isHrOrAdmin && isHrUser) : isHrUser;

  const [holidays, setHolidays] = useState<HolidayRecord[]>(initialHolidays || DEFAULT_HOLIDAYS);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkInput, setBulkInput] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Compute next upcoming holiday based on reference date
  const today = "2026-08-20";
  const sortedHolidays = [...holidays].sort((a, b) => a.date.localeCompare(b.date));
  const upcomingHolidays = sortedHolidays.filter((h) => h.date >= today);
  const nextHoliday = upcomingHolidays[0] || null;

  let daysToNext = 0;
  if (nextHoliday) {
    const ref = new Date(today);
    const target = new Date(nextHoliday.date);
    daysToNext = Math.max(0, Math.ceil((target.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24)));
  }

  const handleBulkImport = () => {
    setImportError(null);
    const raw = bulkInput.trim();

    if (!raw) {
      setImportError("Please enter holiday data to import.");
      return;
    }

    try {
      const newItems: HolidayRecord[] = [];

      // Split chunks by date pattern if single line or newlines (detects YYYY-MM-DD or YYYY/MM/DD)
      const chunks = raw.split(/(?=\d{4}[-/]\d{2}[-/]\d{2})/g).map((c) => c.trim()).filter(Boolean);

      for (const chunk of chunks) {
        // Clean separators
        const lines = chunk.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        for (const line of lines) {
          const parts = line.split(/[,;\t|]+/).map((p) => p.trim()).filter(Boolean);
          if (parts.length >= 2 && parts[0] && parts[1]) {
            const dateStr = parts[0].replace(/\//g, "-");
            const nameStr = parts[1];
            const typeRaw = (parts[2] || "").toUpperCase();
            const holidayType =
              typeRaw.includes("FEST") || typeRaw.includes("CULTUR")
                ? "FESTIVAL"
                : typeRaw.includes("OPT") || typeRaw.includes("RESTRICT")
                ? "COMPANY_OPTIONAL"
                : "NATIONAL";

            if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
              newItems.push({
                id: `h-bulk-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
                name: nameStr,
                date: dateStr,
                holidayType,
                year: Number(dateStr.split("-")[0]) || 2026,
                description: `Official ${holidayType.replace("_", " ")} holiday on ${dateStr}`,
                createdAt: new Date().toISOString(),
              });
            }
          }
        }
      }

      if (newItems.length === 0) {
        setImportError(
          "Could not parse any valid holidays. Expected format: YYYY-MM-DD, Holiday Name, NATIONAL | FESTIVAL"
        );
        return;
      }

      // Merge and deduplicate by date + name
      setHolidays((prev) => {
        const existingKeys = new Set(prev.map((h) => `${h.date}_${h.name.toLowerCase()}`));
        const filteredNew = newItems.filter((h) => !existingKeys.has(`${h.date}_${h.name.toLowerCase()}`));
        return [...prev, ...filteredNew];
      });

      fireCelebrationConfetti();
      showToast(`✓ Successfully imported ${newItems.length} holiday${newItems.length > 1 ? "s" : ""} to the calendar!`);
      setShowBulkModal(false);
      setBulkInput("");
    } catch (err: any) {
      setImportError(err.message || "Failed to process import data.");
    }
  };

  const handleLoadSample = () => {
    setBulkInput(
      `2026-05-01, May Day, NATIONAL\n2026-08-28, Onam Festival, FESTIVAL\n2026-09-05, Janmashtami, FESTIVAL\n2026-11-24, Guru Nanak Jayanti, NATIONAL`
    );
    setImportError(null);
  };

  const getHolidayIcon = (type: string) => {
    switch (type) {
      case "NATIONAL":
        return <Flag className="h-4 w-4 text-emerald-400" />;
      case "FESTIVAL":
        return <Sparkles className="h-4 w-4 text-pink-400" />;
      default:
        return <Building className="h-4 w-4 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Toast Feedback */}
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Next Holiday Countdown Hero */}
      {nextHoliday && (
        <Card className="border-pink-500/30 bg-gradient-to-r from-card/90 via-card/70 to-pink-500/10 shadow-sm">
          <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0 shadow-sm">
                <Sparkles className="h-6 w-6 animate-pulse" />
              </div>
              <div className="space-y-0.5">
                <span className="text-[11px] font-bold text-pink-400 uppercase tracking-wide block">
                  Next Upcoming Company Holiday
                </span>
                <h3 className="text-lg font-bold text-foreground">
                  {nextHoliday.name} &mdash;{" "}
                  {new Date(nextHoliday.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </h3>
                {nextHoliday.description && (
                  <p className="text-xs text-muted-foreground">{nextHoliday.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="px-4 py-2 rounded-xl bg-background/80 border border-border text-center">
                <span className="text-2xl font-black text-foreground block">{daysToNext}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Days to go</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Holiday Calendar Grid */}
      <Card className="border-border/80 bg-card/60">
        <CardHeader className="p-5 pb-3 border-b border-border/60">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-cyan-400" />
                2026 Company Holiday Calendar ({sortedHolidays.length})
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Official holiday schedule recognized by the organization.
              </CardDescription>
            </div>

            {canBulkImport && (
              <div className="flex items-center gap-2">
                <Button
                  variant="brand"
                  size="sm"
                  className="text-xs gap-1.5 h-8 font-bold bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl shadow-sm"
                  onClick={() => {
                    setShowBulkModal(true);
                    setImportError(null);
                  }}
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>Bulk Import Holidays</span>
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {sortedHolidays.map((h) => {
              const hDate = new Date(h.date);
              const isPast = h.date < today;

              return (
                <div
                  key={h.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                    isPast
                      ? "border-border/60 bg-muted/15 opacity-60"
                      : "border-border/80 bg-card/70 hover:border-border hover:bg-card/90"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-11 w-11 rounded-xl bg-card border border-border flex flex-col items-center justify-center text-center shrink-0 shadow-sm">
                      <span className="text-[9px] uppercase font-bold text-muted-foreground leading-none">
                        {hDate.toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-sm font-black text-foreground leading-none mt-1">
                        {hDate.getDate()}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        {getHolidayIcon(h.holidayType)}
                        <h4 className="text-xs font-bold text-foreground">{h.name}</h4>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">
                        {h.description || `${h.holidayType.replace("_", " ")} Holiday`}
                      </p>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className={`text-[9px] uppercase shrink-0 font-bold ${
                      h.holidayType === "NATIONAL"
                        ? "border-emerald-500/40 text-emerald-400 bg-emerald-500/10"
                        : "border-pink-500/40 text-pink-400 bg-pink-500/10"
                    }`}
                  >
                    {h.holidayType.replace("_", " ")}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* HR Bulk Import Modal */}
      {canBulkImport && showBulkModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <Card className="w-full max-w-lg max-h-[92vh] overflow-y-auto border-border shadow-2xl bg-card rounded-2xl animate-in fade-in zoom-in-95 custom-scrollbar">
            <CardHeader className="flex flex-row items-center justify-between p-5 pb-3 border-b border-border">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Upload className="h-4 w-4 text-pink-400" />
                Bulk Import Holidays (HR)
              </CardTitle>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-lg"
                onClick={() => setShowBulkModal(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>

            <CardContent className="p-4 sm:p-5 space-y-4 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <p className="text-muted-foreground text-[11px]">
                  Paste a comma-separated list of holidays (one per line): <br />
                  <code className="bg-muted px-1.5 py-0.5 rounded text-[10px] text-foreground font-mono inline-block mt-1">
                    YYYY-MM-DD, Holiday Name, NATIONAL | FESTIVAL
                  </code>
                </p>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleLoadSample}
                  className="text-[10px] h-7 px-2 gap-1 rounded-lg border-dashed self-start sm:self-auto shrink-0"
                >
                  <FileCode className="h-3 w-3" />
                  <span>Load Sample</span>
                </Button>
              </div>

              {importError && (
                <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{importError}</span>
                </div>
              )}

              <textarea
                rows={6}
                value={bulkInput}
                onChange={(e) => {
                  setBulkInput(e.target.value);
                  setImportError(null);
                }}
                placeholder="2026-05-01, May Day, NATIONAL&#10;2026-08-28, Onam, FESTIVAL"
                className="w-full p-3 rounded-xl border border-input bg-background font-mono text-xs text-foreground focus:outline-none focus:border-pink-500/50 resize-none"
              />

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2 border-t border-border">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowBulkModal(false)}
                  className="text-xs h-8 rounded-xl w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  variant="brand"
                  size="sm"
                  onClick={handleBulkImport}
                  className="text-xs font-bold h-8 bg-gradient-to-r from-pink-500 to-rose-600 hover:opacity-95 text-white rounded-xl shadow-sm w-full sm:w-auto"
                >
                  Import Holidays
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
