import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { WhosWhereEmployee } from "@/server/services/attendance-service";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import {
  Building2,
  Search,
} from "lucide-react";

interface WhosWhereTodayBoardProps {
  initialEmployees?: WhosWhereEmployee[];
}

export function WhosWhereTodayBoard({ initialEmployees }: WhosWhereTodayBoardProps) {
  const { departments, allEmployees } = useWorkpulseSharedStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<string>("ALL");

  const defaultEmployees: WhosWhereEmployee[] = useMemo(() => {
    if (initialEmployees && initialEmployees.length > 0) return initialEmployees;

    const map = new Map<string, WhosWhereEmployee>();

    const sourceList = allEmployees.length > 0 ? allEmployees : departments.flatMap((d) => d.employees);

    sourceList.forEach((emp) => {
      if (!map.has(emp.id)) {
        map.set(emp.id, {
          employeeId: emp.id,
          employeeName: emp.name,
          department: emp.departmentName || "Development",
          jobTitle: emp.designation,
          workMode: emp.workMode || "OFFICE",
          locationBadge:
            emp.workLocation ||
            emp.location ||
            (emp.workMode === "WFH" ? "Remote (India)" : "HQ - Floor 0"),
          firstCheckIn:
            emp.sodStatus === "SUBMITTED" || emp.sodStatus === "VERIFIED"
              ? emp.sodTime || "10:05 AM"
              : emp.id.startsWith("lead-") || emp.id.startsWith("admin-")
              ? "09:55 AM"
              : null,
        });
      }
    });

    return Array.from(map.values());
  }, [initialEmployees, departments, allEmployees]);

  const inOfficeCount = defaultEmployees.filter((e) => e.workMode === "OFFICE").length;
  const wfhCount = defaultEmployees.filter((e) => e.workMode === "WFH" || e.workMode === "HYBRID").length;
  const onLeaveCount = defaultEmployees.filter((e) => e.workMode === "FULL_DAY_LEAVE" || e.workMode === "HALF_DAY_LEAVE").length;

  const filteredEmployees = defaultEmployees.filter((emp) => {
    const matchesSearch =
      emp.employeeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
      emp.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterMode === "ALL") return true;
    if (filterMode === "OFFICE") return emp.workMode === "OFFICE";
    if (filterMode === "WFH") return emp.workMode === "WFH" || emp.workMode === "HYBRID";
    if (filterMode === "LEAVE") return emp.workMode === "FULL_DAY_LEAVE" || emp.workMode === "HALF_DAY_LEAVE";
    return true;
  });

  const getWorkModeBadge = (mode: string) => {
    switch (mode) {
      case "OFFICE":
        return <Badge variant="brand" className="text-[10px]">In Office</Badge>;
      case "WFH":
        return <Badge variant="secondary" className="text-[10px] bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30">WFH</Badge>;
      case "HYBRID":
        return <Badge variant="secondary" className="text-[10px] bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30">HYBRID</Badge>;
      case "FULL_DAY_LEAVE":
      case "HALF_DAY_LEAVE":
        return <Badge variant="destructive" className="text-[10px]">On Leave</Badge>;
      case "BUSINESS_TRAVEL":
      case "CLIENT_LOCATION":
        return <Badge variant="secondary" className="text-[10px] bg-amber-500/15 text-amber-600 border-amber-500/30">Travel / Client</Badge>;
      default:
        return <Badge variant="secondary" className="text-[10px]">{mode}</Badge>;
    }
  };

  return (
    <Card className="border-border bg-card/60 backdrop-blur-sm shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[var(--brand-primary)]" />
              Who's Where Today
            </CardTitle>
            <CardDescription className="text-xs mt-0.5">
              Company-wide presence board derived from real-time workdays & approved requests.
            </CardDescription>
          </div>

          {/* Quick Summary Pill Counters */}
          <div className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-xs">
            <button
              type="button"
              onClick={() => setFilterMode("OFFICE")}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                filterMode === "OFFICE"
                  ? "bg-[var(--brand-primary)] text-foreground border-[var(--brand-primary)]"
                  : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              🏢 {inOfficeCount} In Office
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("WFH")}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                filterMode === "WFH"
                  ? "bg-[var(--brand-primary)] text-foreground border-[var(--brand-primary)]"
                  : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              🏠 {wfhCount} WFH
            </button>
            <button
              type="button"
              onClick={() => setFilterMode("LEAVE")}
              className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all ${
                filterMode === "LEAVE"
                  ? "bg-[var(--brand-primary)] text-foreground border-[var(--brand-primary)]"
                  : "bg-muted/40 border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              🌴 {onLeaveCount} On Leave
            </button>
            {filterMode !== "ALL" && (
              <button
                type="button"
                onClick={() => setFilterMode("ALL")}
                className="text-[11px] text-muted-foreground hover:underline ml-1"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search by name, department, or job title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs"
          />
        </div>

        {/* Directory Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredEmployees.map((emp, idx) => (
            <div
              key={`${emp.employeeId}-${idx}`}
              className="p-3.5 rounded-xl border border-border bg-card/70 flex items-center justify-between gap-3 hover:border-border/80 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/30 flex items-center justify-center text-[var(--brand-primary)] font-bold text-xs shrink-0">
                  {emp.employeeName.slice(0, 2).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <span className="text-xs font-bold text-foreground block truncate">
                    {emp.employeeName}
                  </span>
                  <span className="text-[11px] text-muted-foreground block truncate">
                    {emp.jobTitle} · {emp.department}
                  </span>
                  <span className="text-[10px] text-muted-foreground block">
                    {emp.locationBadge} {emp.firstCheckIn && `· In: ${emp.firstCheckIn}`}
                  </span>
                </div>
              </div>

              <div>{getWorkModeBadge(emp.workMode)}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
