import React, { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { Users } from "lucide-react";

interface TeamMemberHeatmap {
  employeeId: string;
  employeeName: string;
  jobTitle: string;
  days: { date: string; dayName: string; status: string; taskCount: number }[];
}

interface TeamHeatmapGridProps {
  teamName?: string;
  sprintRange?: string;
}

export function TeamHeatmapGrid({
  teamName = "Core Platform Engineering",
  sprintRange = "Aug 17 – Aug 23, 2026",
}: TeamHeatmapGridProps) {
  const { allEmployees } = useWorkpulseSharedStore();

  const teamMembersData: TeamMemberHeatmap[] = useMemo(() => {
    if (allEmployees && allEmployees.length > 0) {
      return allEmployees.map((emp, idx) => ({
        employeeId: emp.id,
        employeeName: emp.name,
        jobTitle: emp.designation,
        days: [
          { date: "2026-08-17", dayName: "Mon", status: "LOCKED", taskCount: 3 + (idx % 3) },
          { date: "2026-08-18", dayName: "Tue", status: "LOCKED", taskCount: 2 + (idx % 4) },
          { date: "2026-08-19", dayName: "Wed", status: "LOCKED", taskCount: 3 + (idx % 2) },
          {
            date: "2026-08-20",
            dayName: "Thu",
            status:
              emp.eodStatus === "SUBMITTED"
                ? "EOD_SUBMITTED"
                : emp.sodStatus === "SUBMITTED"
                ? "SOD_SUBMITTED"
                : "OPEN",
            taskCount: emp.plannedTasks ? emp.plannedTasks.length : 2,
          },
          { date: "2026-08-21", dayName: "Fri", status: "NO_DATA", taskCount: 0 },
          { date: "2026-08-22", dayName: "Sat", status: "WEEKLY_OFF", taskCount: 0 },
          { date: "2026-08-23", dayName: "Sun", status: "WEEKLY_OFF", taskCount: 0 },
        ],
      }));
    }
    return [];
  }, [allEmployees]);

  const getCellColor = (status: string) => {
    switch (status) {
      case "LOCKED":
      case "EOD_SUBMITTED":
        return "bg-emerald-500 border-emerald-600 text-emerald-950 font-bold";
      case "SOD_SUBMITTED":
        return "bg-[var(--brand-primary)] border-[var(--brand-primary)] text-foreground font-bold";
      case "NO_UPDATE":
        return "bg-amber-500/30 border-amber-500/50 text-amber-700 dark:text-amber-300 font-semibold";
      case "FULL_DAY_LEAVE":
      case "COMPANY_HOLIDAY":
        return "bg-blue-500/50 border-blue-600 text-blue-900 dark:text-blue-200";
      case "WEEKLY_OFF":
        return "bg-muted/40 border-border text-muted-foreground";
      default:
        return "bg-card/60 border-border text-muted-foreground";
    }
  };

  return (
    <Card className="border-border bg-card/60 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Users className="h-4 w-4 text-[var(--brand-primary)]" />
              Team Submission Heatmap Grid — {teamName}
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Period: {sprintRange} · Real-time attendance & submission status across all team members.
            </CardDescription>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-emerald-500 inline-block" />
              <span className="text-[11px]">Completed</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-[var(--brand-primary)] inline-block" />
              <span className="text-[11px]">SOD Active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-amber-500/30 inline-block" />
              <span className="text-[11px]">Gap / Missing</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-sm bg-blue-500/50 inline-block" />
              <span className="text-[11px]">Leave</span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="overflow-x-auto pt-2 pb-6">
        <div className="min-w-[650px] space-y-2">
          {/* Header Row: Days of Sprint */}
          <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-muted-foreground pb-1 border-b border-border">
            <div className="col-span-4">Team Member</div>
            <div className="col-span-1 text-center">Mon 17</div>
            <div className="col-span-1 text-center">Tue 18</div>
            <div className="col-span-1 text-center">Wed 19</div>
            <div className="col-span-1 text-center">Thu 20</div>
            <div className="col-span-1 text-center">Fri 21</div>
            <div className="col-span-1 text-center">Sat 22</div>
            <div className="col-span-1 text-center">Sun 23</div>
            <div className="col-span-1 text-center">Score</div>
          </div>

          {/* Member Rows */}
          {teamMembersData.map((member) => {
            const completedCount = member.days.filter((d) => d.status === "LOCKED" || d.status === "EOD_SUBMITTED").length;
            const healthScore = Math.round((completedCount / 4) * 100);

            return (
              <div
                key={member.employeeId}
                className="grid grid-cols-12 gap-2 items-center p-2 rounded-xl bg-card/60 border border-border hover:border-border/80 transition-colors"
              >
                {/* Member Info */}
                <div className="col-span-4 flex items-center gap-2.5">
                  <div className="h-7 w-7 rounded-full bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/30 flex items-center justify-center text-[var(--brand-primary)] font-bold text-xs shrink-0">
                    {member.employeeName.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="overflow-hidden">
                    <span className="text-xs font-bold text-foreground block truncate">
                      {member.employeeName}
                    </span>
                    <span className="text-[11px] text-muted-foreground block truncate">
                      {member.jobTitle}
                    </span>
                  </div>
                </div>

                {/* 7 Day Status Cells */}
                {member.days.map((day) => (
                  <div
                    key={day.date}
                    title={`${member.employeeName} — ${day.dayName} (${day.date}): ${day.status}`}
                    className={`col-span-1 h-9 rounded-lg border flex flex-col items-center justify-center text-[10px] cursor-pointer transition-all hover:scale-105 ${getCellColor(
                      day.status
                    )}`}
                  >
                    {day.taskCount > 0 ? `${day.taskCount}t` : ""}
                  </div>
                ))}

                {/* Health / Adherence Indicator */}
                <div className="col-span-1 text-center">
                  <Badge
                    variant={healthScore >= 75 ? "brand" : healthScore >= 50 ? "secondary" : "destructive"}
                    className="text-[10px] font-bold px-1.5 py-0.5"
                  >
                    {healthScore}%
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
