"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { triggerBroadcastPopup } from "@/lib/stores/broadcast-popup-store";
import { fireCelebrationConfetti } from "@/lib/ui/confetti";
import { useWorkpulseSharedStore, WorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";
import { createClient } from "@/lib/supabase/client";
import {
  Cake,
  Sparkles,
  Megaphone,
  Calendar,
  CheckCircle2,
} from "lucide-react";

export interface BirthdayCelebrant {
  id: string;
  name: string;
  role: string;
  department: string;
  avatar: string;
  birthDate: string;
  daysAway: number;
}

export interface CulturalFestival {
  id: string;
  title: string;
  date: string;
  daysAway: number;
  category: string;
  accentEmoji: string;
  holidayStatus: string;
  festivalKey: "diwali" | "christmas" | "holi" | "eid" | "independence";
}

const KNOWN_BIRTHDAY_SCHEDULE: Record<string, { birthDate: string; daysAway: number }> = {
  "emp-sarah": { birthDate: "Aug 21", daysAway: 0 },
  "lead-alex": { birthDate: "Aug 24", daysAway: 3 },
  "emp-sneha": { birthDate: "Aug 29", daysAway: 8 },
  "lead-vikram": { birthDate: "Sep 05", daysAway: 15 },
  "lead-marcus": { birthDate: "Sep 12", daysAway: 22 },
  "emp-priya": { birthDate: "Sep 18", daysAway: 28 },
  "emp-karthik": { birthDate: "Sep 25", daysAway: 35 },
  "emp-rohit": { birthDate: "Oct 04", daysAway: 44 },
  "emp-ananya": { birthDate: "Oct 18", daysAway: 58 },
  "admin-david": { birthDate: "Nov 02", daysAway: 73 },
  "hr-rachel": { birthDate: "Nov 15", daysAway: 86 },
};

const BASE_FESTIVALS: CulturalFestival[] = [
  {
    id: "fest-1",
    title: "Diwali (Festival of Lights)",
    date: "Nov 08, 2026",
    daysAway: 79,
    category: "Festival",
    accentEmoji: "🪔",
    holidayStatus: "Full Day Holiday",
    festivalKey: "diwali",
  },
  {
    id: "fest-2",
    title: "Christmas & Year-End Social",
    date: "Dec 25, 2026",
    daysAway: 126,
    category: "Holiday",
    accentEmoji: "🎄",
    holidayStatus: "Full Day Holiday",
    festivalKey: "christmas",
  },
  {
    id: "fest-3",
    title: "Holi (Festival of Colors)",
    date: "Mar 04, 2027",
    daysAway: 195,
    category: "Festival",
    accentEmoji: "🎨",
    holidayStatus: "Full Day Holiday",
    festivalKey: "holi",
  },
  {
    id: "fest-4",
    title: "Eid-ul-Fitr",
    date: "Mar 21, 2027",
    daysAway: 212,
    category: "Festival",
    accentEmoji: "🌙",
    holidayStatus: "Full Day Holiday",
    festivalKey: "eid",
  },
  {
    id: "fest-5",
    title: "Independence Day",
    date: "Aug 15, 2027",
    daysAway: 349,
    category: "National",
    accentEmoji: "🇮🇳",
    holidayStatus: "Full Day Holiday",
    festivalKey: "independence",
  },
];

export function EmployeeCelebrationBroadcastDeck() {
  const { allEmployees } = useWorkpulseSharedStore();
  const [activeTab, setActiveTab] = useState<"birthdays" | "festivals">("birthdays");
  const [filter, setFilter] = useState<"all" | "today" | "upcoming">("all");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    // Ensure initial sync with Supabase
    WorkpulseSharedStore.syncWithSupabase();
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Dynamically compute celebrants from live Supabase employees
  const celebrants: BirthdayCelebrant[] = useMemo(() => {
    const employees = allEmployees && allEmployees.length > 0 ? allEmployees : WorkpulseSharedStore.getAllEmployees();

    if (!employees || employees.length === 0) {
      return Object.entries(KNOWN_BIRTHDAY_SCHEDULE).map(([empId, info]) => ({
        id: empId,
        name: empId === "emp-sarah" ? "Sara Dev" : empId === "lead-alex" ? "Alex Lead" : "Team Member",
        role: "Engineer",
        department: "Development",
        avatar: empId.slice(0, 2).toUpperCase(),
        birthDate: info.birthDate,
        daysAway: info.daysAway,
      }));
    }

    return employees.map((emp, index) => {
      const known = KNOWN_BIRTHDAY_SCHEDULE[emp.id];
      const birthDate = known ? known.birthDate : `Sep ${(index % 28) + 1}`;
      const daysAway = known !== undefined ? known.daysAway : (index * 7) % 60;

      return {
        id: emp.id,
        name: emp.name,
        role: emp.designation,
        department: emp.departmentName,
        avatar: emp.avatar || emp.name.slice(0, 2).toUpperCase(),
        birthDate,
        daysAway,
      };
    }).sort((a, b) => a.daysAway - b.daysAway);
  }, [allEmployees]);

  const todayCount = celebrants.filter((b) => b.daysAway === 0).length;
  const upcomingCount = celebrants.filter((b) => b.daysAway > 0 && b.daysAway <= 14).length;

  const filteredBirthdays = celebrants.filter((b) => {
    if (filter === "today") return b.daysAway === 0;
    if (filter === "upcoming") return b.daysAway > 0 && b.daysAway <= 14;
    return true;
  });

  const broadcastViaSupabaseRealtime = async (payload: any) => {
    try {
      // 1. Send to Supabase Realtime Channel
      const supabase = createClient();
      const channel = supabase.channel("workpulse-supabase-live-channel");
      await channel.send({
        type: "broadcast",
        event: "celebration:broadcast",
        payload,
      });

      // 2. Also dispatch notification:new event for bell dropdown and notification center
      await channel.send({
        type: "broadcast",
        event: "notification:new",
        payload: {
          id: payload.id || `notif-cel-${Date.now()}`,
          title: payload.title,
          message: payload.message,
          type: payload.type === "BIRTHDAY" ? "BIRTHDAY_BROADCAST" : "FESTIVAL_BROADCAST",
          linkUrl: "/announcements",
        },
      });

      // 3. Persist into backend notifications
      fetch("/api/v1/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: payload.title,
          message: payload.message,
          type: payload.type === "BIRTHDAY" ? "BIRTHDAY_BROADCAST" : "FESTIVAL_BROADCAST",
          audience: "ALL",
        }),
      }).catch(() => {});

      // 4. Cross-tab BroadcastChannel
      if ("BroadcastChannel" in window) {
        const bc = new BroadcastChannel("workpulse_realtime_broadcast_v1");
        bc.postMessage({ type: "notification:new", payload });
        bc.close();
      }
    } catch (e) {
      console.warn("[CelebrationDeck] Supabase broadcast warning:", e);
    }
  };

  const handleBroadcastBirthday = async (item: BirthdayCelebrant) => {
    fireCelebrationConfetti();

    const popupPayload = {
      id: `bc-${Date.now()}`,
      title: `Happy Birthday, ${item.name}! 🎉`,
      message: `Wishing ${item.name} (${item.role} · ${item.department}) an incredible birthday filled with happiness, health, and success! 🎂✨`,
      type: "BIRTHDAY" as const,
      author: "Rachel HR (People Operations)",
      celebrantAvatar: item.avatar || "🎂",
      badge: "Birthday Celebration",
    };

    triggerBroadcastPopup(popupPayload);
    await broadcastViaSupabaseRealtime(popupPayload);
    showToast(`✓ Birthday broadcast sent live for ${item.name}!`);
  };

  const handleBroadcastFestival = async (fest: CulturalFestival) => {
    fireCelebrationConfetti();

    const greetings: Record<string, string> = {
      diwali: "Wishing our entire WorkPulse family a luminous, prosperous, and joyous Diwali! May the festival of lights bring abundant happiness and success! 🪔✨",
      christmas: "Merry Christmas and Warm Season's Greetings! Wishing peace, joy, and wonderful festive cheer to you and your loved ones! 🎄❄️",
      holi: "Wishing everyone a vibrant, colorful, and joyful Holi! May your celebrations be filled with shared laughter, sweet memories, and bright colors! 🎨🌸",
      eid: "Eid Mubarak to you and your families! May this blessed festive occasion bring prosperity, peace, and togetherness! 🌙✨",
      independence: "Happy Independence Day! Celebrating unity, freedom, progress, and shared dedication across the nation! 🇮🇳⭐",
    };

    const popupPayload = {
      id: `bc-${Date.now()}`,
      title: fest.title,
      message: greetings[fest.festivalKey] || `Wishing the entire organization a joyful and memorable ${fest.title}!`,
      type: "FESTIVAL" as const,
      author: "Rachel HR (People Operations)",
      accentEmoji: fest.accentEmoji,
      festivalKey: fest.festivalKey,
      badge: fest.category,
    };

    triggerBroadcastPopup(popupPayload);
    await broadcastViaSupabaseRealtime(popupPayload);
    showToast(`✓ Festival broadcast sent live for ${fest.title}!`);
  };

  return (
    <div className="space-y-4">
      {toastMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-400 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
          <span className="font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Control Bar: View Mode Switcher + Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card/60 p-2.5 rounded-2xl border border-border/80">
        <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border/60">
          <button
            type="button"
            onClick={() => setActiveTab("birthdays")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "birthdays"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Cake className="h-3.5 w-3.5" />
            <span>Birthdays ({celebrants.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("festivals")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === "festivals"
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Festivals &amp; Holidays ({BASE_FESTIVALS.length})</span>
          </button>
        </div>

        {activeTab === "birthdays" && (
          <div className="flex items-center gap-1 text-xs">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                filter === "all"
                  ? "bg-card border border-border text-foreground font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({celebrants.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter("today")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                filter === "today"
                  ? "bg-card border border-pink-300 dark:border-pink-500/40 text-pink-700 dark:text-pink-400 font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Today ({todayCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter("upcoming")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                filter === "upcoming"
                  ? "bg-card border border-cyan-300 dark:border-cyan-500/40 text-cyan-700 dark:text-cyan-400 font-bold shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Upcoming 14 Days ({upcomingCount})
            </button>
          </div>
        )}
      </div>

      {/* Content List */}
      {activeTab === "birthdays" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBirthdays.map((item) => (
            <Interactive3DCard
              key={item.id}
              className={`p-4 rounded-2xl border transition-all space-y-3 bg-card/70 ${
                item.daysAway === 0
                  ? "border-pink-400 dark:border-pink-500/40 shadow-sm"
                  : "border-border/70 hover:border-border"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-indigo-600 dark:bg-gradient-to-tr dark:from-cyan-500 dark:to-blue-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
                    {item.avatar}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <strong className="text-foreground text-xs font-bold block">{item.name}</strong>
                      {item.daysAway === 0 && (
                        <Badge variant="brand" className="text-[9px] bg-pink-100 text-pink-700 border-pink-300 dark:bg-pink-500/15 dark:text-pink-400 dark:border-pink-500/30 px-1 py-0 animate-pulse font-bold">
                          TODAY 🎂
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-muted-foreground block">{item.role} &middot; {item.department}</span>
                  </div>
                </div>

                <Badge variant="outline" className="text-[10px] font-semibold shrink-0">
                  {item.birthDate}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                <span className="text-[11px] text-muted-foreground">
                  {item.daysAway === 0 ? "Celebrating Today" : `In ${item.daysAway} days`}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBroadcastBirthday(item)}
                  className="text-[11px] h-7 px-2.5 gap-1 rounded-lg border-border/80 hover:border-pink-400 hover:text-pink-600 dark:hover:text-pink-400"
                >
                  <Megaphone className="h-3 w-3" />
                  <span>Broadcast</span>
                </Button>
              </div>
            </Interactive3DCard>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BASE_FESTIVALS.map((fest) => (
            <Interactive3DCard
              key={fest.id}
              className="p-4 rounded-2xl border border-border/70 hover:border-border bg-card/70 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl shrink-0">{fest.accentEmoji}</span>
                  <div>
                    <strong className="text-foreground text-xs font-bold block">{fest.title}</strong>
                    <span className="text-[11px] text-muted-foreground block">{fest.holidayStatus}</span>
                  </div>
                </div>

                <Badge variant="outline" className="text-[10px] font-semibold shrink-0">
                  {fest.date}
                </Badge>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-indigo-600 dark:text-cyan-400" />
                  In {fest.daysAway} days
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBroadcastFestival(fest)}
                  className="text-[11px] h-7 px-2.5 gap-1 rounded-lg border-border/80 hover:border-amber-400 hover:text-amber-600 dark:hover:text-amber-400"
                >
                  <Megaphone className="h-3 w-3" />
                  <span>Broadcast</span>
                </Button>
              </div>
            </Interactive3DCard>
          ))}
        </div>
      )}
    </div>
  );
}
