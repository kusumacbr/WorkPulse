import React, { useState, useMemo, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import {
  Cake,
  Sparkles,
  UserPlus,
  CheckCircle2,
  Gift,
} from "lucide-react";

interface MilestoneItem {
  id: string;
  name: string;
  role: string;
  department: string;
  type: "BIRTHDAY" | "ANNIVERSARY" | "NEW_JOINER";
  eventDate: string;
  highlightText: string;
  celebrated: boolean;
}

const INITIAL_MILESTONES: MilestoneItem[] = [
  {
    id: "ms-1",
    name: "Alex Lead",
    role: "Engineering Manager",
    department: "Engineering",
    type: "BIRTHDAY",
    eventDate: "Today (Aug 20)",
    highlightText: "Happy Birthday Alex! 🎂",
    celebrated: false,
  },
  {
    id: "ms-2",
    name: "Sara Dev",
    role: "Senior Backend Engineer",
    department: "Engineering",
    type: "ANNIVERSARY",
    eventDate: "In 5 Days (Aug 25)",
    highlightText: "2-Year Work Anniversary with Xorstack! 🚀",
    celebrated: false,
  },
  {
    id: "ms-3",
    name: "Rohit Sharma",
    role: "Frontend Engineer (UI/UX)",
    department: "Engineering",
    type: "NEW_JOINER",
    eventDate: "Joined Aug 01",
    highlightText: "Completed 30-day technical onboarding checklist",
    celebrated: true,
  },
  {
    id: "ms-4",
    name: "Ananya Sen",
    role: "QA Automation Lead",
    department: "Quality Assurance",
    type: "ANNIVERSARY",
    eventDate: "In 12 Days (Sep 01)",
    highlightText: "1-Year Work Anniversary with Xorstack! 🌟",
    celebrated: false,
  },
];

export function PeopleMilestonesDeck() {
  const { allEmployees } = useWorkpulseSharedStore();
  const [celebratedIds, setCelebratedIds] = useState<Record<string, boolean>>({ "ms-3": true });
  const [sentToast, setSentToast] = useState<string | null>(null);

  useEffect(() => {
    try {
      const s = localStorage.getItem("workpulse_milestones_celebrated");
      if (s) setCelebratedIds(JSON.parse(s));
    } catch {
      // safe fallback
    }
  }, []);

  const dynamicMilestones: MilestoneItem[] = useMemo(() => {
    const list: MilestoneItem[] = INITIAL_MILESTONES.map((m) => {
      const matchedEmp = allEmployees.find(
        (e) =>
          (m.id === "ms-1" && (e.id === "lead-alex" || e.name.toLowerCase() === "alex lead")) ||
          (m.id === "ms-2" && (e.id === "emp-sarah" || e.name.toLowerCase() === "sarah dev" || e.name.toLowerCase() === "sara dev")) ||
          (m.id === "ms-3" && (e.id === "emp-rohit" || e.name.toLowerCase() === "rohit sharma")) ||
          (m.id === "ms-4" && (e.id === "emp-ananya" || e.name.toLowerCase() === "ananya sen")) ||
          e.name.toLowerCase() === m.name.toLowerCase()
      );

      if (matchedEmp) {
        return {
          ...m,
          name: matchedEmp.name,
          role: matchedEmp.designation,
          department: matchedEmp.departmentName,
          highlightText: m.type === "ANNIVERSARY"
            ? `Work Anniversary celebration with Xorstack! 🚀`
            : m.type === "BIRTHDAY"
            ? `Happy Birthday ${matchedEmp.name}! 🎂`
            : m.highlightText,
        };
      }
      return m;
    });

    // Include newly onboarded employees from allEmployees
    allEmployees.forEach((emp) => {
      if (!list.some((m) => m.name.toLowerCase() === emp.name.toLowerCase())) {
        list.push({
          id: `joiner-${emp.id}`,
          name: emp.name,
          role: emp.designation,
          department: emp.departmentName || "Engineering",
          type: "NEW_JOINER",
          eventDate: `Joined ${emp.joiningDate || "Recently"}`,
          highlightText: "Welcome to Xorstack! Technical onboarding in progress",
          celebrated: !!celebratedIds[`joiner-${emp.id}`],
        });
      }
    });

    return list.map((m) => ({
      ...m,
      celebrated: celebratedIds[m.id] !== undefined ? celebratedIds[m.id]! : m.celebrated,
    }));
  }, [allEmployees, celebratedIds]);

  const handleSendCelebration = (item: MilestoneItem) => {
    const updated = { ...celebratedIds, [item.id]: true };
    setCelebratedIds(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("workpulse_milestones_celebrated", JSON.stringify(updated));
    }
    setSentToast(`Celebration broadcast sent for ${item.name}! 🎉`);
    setTimeout(() => setSentToast(null), 3500);
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {sentToast && (
        <div className="p-3.5 rounded-xl bg-pink-500/15 border border-pink-500/30 text-xs text-pink-300 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <Sparkles className="h-4 w-4 text-pink-400 shrink-0" />
          <span className="font-bold">{sentToast}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Birthdays & Anniversaries Column */}
        <Interactive3DCard className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400">
                <Cake className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground">Birthdays & Anniversaries</h4>
                <p className="text-xs text-muted-foreground">Recognize and celebrate team milestones</p>
              </div>
            </div>
            <Badge variant="brand" className="text-[10px] bg-pink-500/15 text-pink-300 border-pink-500/30 uppercase font-bold">
              Culture Hub
            </Badge>
          </div>

          <div className="space-y-3">
            {dynamicMilestones.filter(m => m.type === "BIRTHDAY" || m.type === "ANNIVERSARY").map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl bg-card/60 border border-border/70 hover:border-pink-500/40 space-y-3 transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-pink-500 to-amber-400 p-[1px] shrink-0">
                      <div className="h-full w-full rounded-xl bg-[#0b0f19] flex items-center justify-center text-pink-300 font-bold text-xs">
                        {item.name.slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-foreground">{item.name}</span>
                        <Badge
                          variant="outline"
                          className={`text-[9px] uppercase font-bold ${
                            item.type === "BIRTHDAY"
                              ? "border-pink-500/40 text-pink-300 bg-pink-500/10"
                              : "border-amber-500/40 text-amber-300 bg-amber-500/10"
                          }`}
                        >
                          {item.type}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-muted-foreground block">
                        {item.role} · {item.department}
                      </span>
                    </div>
                  </div>

                  <span className="text-[11px] font-mono font-semibold text-cyan-400 shrink-0 bg-muted/40 px-2 py-0.5 rounded-lg border border-border/60">
                    {item.eventDate}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-foreground/90 font-medium">{item.highlightText}</span>

                  <Button
                    variant={item.celebrated ? "outline" : "brand"}
                    size="sm"
                    disabled={item.celebrated}
                    onClick={() => handleSendCelebration(item)}
                    className={`text-xs font-semibold gap-1.5 h-8 ${
                      item.celebrated
                        ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                        : "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                    }`}
                  >
                    {item.celebrated ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Shout-out Sent</span>
                      </>
                    ) : (
                      <>
                        <Gift className="h-3 w-3" />
                        <span>Send Shout-out</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Interactive3DCard>

        {/* Onboarding & New Joiners Pipeline */}
        <Interactive3DCard className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <UserPlus className="h-4 w-4" />
              </div>
              <div>
                <h4 className="text-base font-bold text-foreground">New Joiners & Onboarding</h4>
                <p className="text-xs text-muted-foreground">30-day assimilation and checklist tracking</p>
              </div>
            </div>
            <Badge variant="outline" className="text-[10px] text-emerald-400 border-emerald-500/30 uppercase font-bold">
              Active Teams
            </Badge>
          </div>

          <div className="space-y-3 text-xs">
            {dynamicMilestones.filter(m => m.type === "NEW_JOINER").map((item) => (
              <div key={item.id} className="p-4 rounded-xl bg-card/60 border border-border/70 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="text-foreground block text-xs">{item.name} ({item.role})</strong>
                    <span className="text-[11px] text-muted-foreground">{item.eventDate} · {item.department}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono text-emerald-400 border-emerald-500/30">
                    Day 20 / 30
                  </Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{item.highlightText}</span>
                    <strong className="text-foreground">85% Complete</strong>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 w-[85%]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Interactive3DCard>
      </div>
    </div>
  );
}
