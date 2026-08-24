"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HolidayRecord } from "@/server/services/holiday-service";
import {
  Calendar,
  Flag,
  Sparkles,
  Building,
  Upload,
  X,
} from "lucide-react";

interface HolidayCalendarGridProps {
  initialHolidays?: HolidayRecord[];
  isHrOrAdmin?: boolean;
}

export function HolidayCalendarGrid({
  initialHolidays,
  isHrOrAdmin = true,
}: HolidayCalendarGridProps) {
  const [holidays, setHolidays] = useState<HolidayRecord[]>(
    initialHolidays || [
      { id: "h-1", name: "Republic Day", date: "2026-01-26", holidayType: "NATIONAL", description: "National holiday celebrating the Constitution of India", year: 2026, createdAt: new Date().toISOString() },
      { id: "h-2", name: "Maha Shivratri", date: "2026-02-15", holidayType: "FESTIVAL", description: "Festival celebrating Lord Shiva", year: 2026, createdAt: new Date().toISOString() },
      { id: "h-3", name: "Holi", date: "2026-03-04", holidayType: "FESTIVAL", description: "Festival of colors", year: 2026, createdAt: new Date().toISOString() },
      { id: "h-4", name: "Eid-ul-Fitr", date: "2026-03-21", holidayType: "FESTIVAL", description: "Islamic festival marking the end of Ramadan", year: 2026, createdAt: new Date().toISOString() },
      { id: "h-5", name: "Independence Day", date: "2026-08-15", holidayType: "NATIONAL", description: "National Independence Day of India", year: 2026, createdAt: new Date().toISOString() },
      { id: "h-6", name: "Gandhi Jayanti", date: "2026-10-02", holidayType: "NATIONAL", description: "Birth anniversary of Mahatma Gandhi", year: 2026, createdAt: new Date().toISOString() },
      { id: "h-7", name: "Dussehra", date: "2026-10-20", holidayType: "FESTIVAL", description: "Victory of Good over Evil", year: 2026, createdAt: new Date().toISOString() },
      { id: "h-8", name: "Diwali", date: "2026-11-08", holidayType: "FESTIVAL", description: "Festival of Lights", year: 2026, createdAt: new Date().toISOString() },
      { id: "h-9", name: "Christmas", date: "2026-12-25", holidayType: "FESTIVAL", description: "Christmas celebration", year: 2026, createdAt: new Date().toISOString() },
    ]
  );

  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkInput, setBulkInput] = useState("");

  // Compute next upcoming holiday
  const today = "2026-08-20";
  const upcomingHolidays = holidays.filter((h) => h.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const nextHoliday = upcomingHolidays[0] || null;

  let daysToNext = 0;
  if (nextHoliday) {
    const ref = new Date(today);
    const target = new Date(nextHoliday.date);
    daysToNext = Math.ceil((target.getTime() - ref.getTime()) / (1000 * 60 * 60 * 24));
  }

  const handleBulkImport = () => {
    try {
      const lines = bulkInput.trim().split("\n");
      const newItems: HolidayRecord[] = [];

      lines.forEach((line, idx) => {
        const parts = line.split(",").map((p) => p.trim());
        if (parts.length >= 2) {
          const date = parts[0]!;
          const name = parts[1]!;
          const type = (parts[2]?.toUpperCase() as any) || "NATIONAL";
          newItems.push({
            id: `h-bulk-${Date.now()}-${idx}`,
            name,
            date,
            holidayType: type === "FESTIVAL" || type === "COMPANY_OPTIONAL" ? type : "NATIONAL",
            year: Number(date.split("-")[0]) || 2026,
            createdAt: new Date().toISOString(),
          });
        }
      });

      if (newItems.length > 0) {
        setHolidays((prev) => [...prev, ...newItems]);
        setShowBulkModal(false);
        setBulkInput("");
      }
    } catch {
      // Ignore
    }
  };

  const getHolidayIcon = (type: string) => {
    switch (type) {
      case "NATIONAL":
        return <Flag className="h-4 w-4 text-emerald-500" />;
      case "FESTIVAL":
        return <Sparkles className="h-4 w-4 text-[var(--brand-primary)]" />;
      default:
        return <Building className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Next Holiday Countdown Hero */}
      {nextHoliday && (
        <Card className="border-[var(--brand-primary)]/40 bg-gradient-to-r from-card via-card to-[var(--brand-primary)]/15 shadow-sm">
          <CardContent className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-2xl bg-[var(--brand-primary)]/20 border border-[var(--brand-primary)]/40 flex items-center justify-center text-[var(--brand-primary)] shrink-0">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <span className="text-xs font-semibold text-[var(--brand-primary)] block">
                  Next Upcoming Company Holiday
                </span>
                <h3 className="text-lg font-bold text-foreground">
                  {nextHoliday.name} — {new Date(nextHoliday.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </h3>
                {nextHoliday.description && (
                  <p className="text-xs text-muted-foreground mt-0.5">{nextHoliday.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="px-4 py-2 rounded-xl bg-background/80 border border-border text-center">
                <span className="text-2xl font-bold text-foreground block">{daysToNext}</span>
                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Days to go</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Holiday Calendar Grid */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[var(--brand-primary)]" />
                2026 Company Holiday Calendar
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Official holiday schedule recognized by Xorstack.
              </CardDescription>
            </div>

            {isHrOrAdmin && (
              <div className="flex items-center gap-2">
                <Button
                  variant="brand"
                  size="sm"
                  className="text-xs gap-1.5 h-8 font-semibold"
                  onClick={() => setShowBulkModal(true)}
                >
                  <Upload className="h-3.5 w-3.5" />
                  Bulk Import Holidays
                </Button>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {holidays.map((h) => {
              const hDate = new Date(h.date);
              const isPast = h.date < today;

              return (
                <div
                  key={h.id}
                  className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-3 ${
                    isPast
                      ? "border-border/60 bg-muted/20 opacity-70"
                      : "border-border bg-card/60 hover:border-[var(--brand-primary)]/40 hover:bg-card/90"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-muted border border-border flex flex-col items-center justify-center text-center shrink-0">
                      <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none">
                        {hDate.toLocaleDateString("en-US", { month: "short" })}
                      </span>
                      <span className="text-sm font-bold text-foreground leading-none mt-0.5">
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

                  <Badge variant="secondary" className="text-[9px] uppercase shrink-0">
                    {h.holidayType.replace("_", " ")}
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* HR Bulk Import Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg border-border shadow-2xl bg-card">
            <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-border">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Upload className="h-4 w-4 text-[var(--brand-primary)]" />
                Bulk Import Holidays (HR)
              </CardTitle>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShowBulkModal(false)}>
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs">
              <p className="text-muted-foreground">
                Paste a comma-separated list of holidays (one per line): <br />
                <code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">
                  YYYY-MM-DD, Holiday Name, NATIONAL | FESTIVAL
                </code>
              </p>

              <textarea
                rows={6}
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                placeholder="2026-05-01, May Day, NATIONAL&#10;2026-08-28, Onam, FESTIVAL"
                className="w-full p-2.5 rounded-md border border-input bg-background font-mono text-xs"
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <Button variant="ghost" size="sm" onClick={() => setShowBulkModal(false)}>
                  Cancel
                </Button>
                <Button variant="brand" size="sm" onClick={handleBulkImport}>
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
