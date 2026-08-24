"use client";

import React, { useState } from "react";
import { Bell, Check, ExternalLink, Cake, Sparkles, PartyPopper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  linkUrl?: string | null;
  read: boolean;
  createdAt: string;
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "n-bday-1",
      type: "BIRTHDAY_BROADCAST",
      title: "🎂 Birthday Celebration: Sarah Dev!",
      message: "Today is Sarah Dev's Birthday! Join the org celebration and send your warm wishes on the celebration board.",
      linkUrl: "/hr",
      read: false,
      createdAt: "Just now",
    },
    {
      id: "n-1",
      type: "SOD_REMINDER",
      title: "Start-of-Day Plan Active",
      message: "Your SOD plan for today has been logged. Remember to wrap up before shift ends.",
      linkUrl: "/my-work",
      read: false,
      createdAt: "10 mins ago",
    },
    {
      id: "n-2",
      type: "GOAL_APPROVED",
      title: "Weekly Goal Approved",
      message: "Your manager Alex approved 'Deliver Core Employee Workflow (Phase 1)'.",
      linkUrl: "/goals",
      read: false,
      createdAt: "1 hour ago",
    },
    {
      id: "n-fest-1",
      type: "FESTIVAL_BROADCAST",
      title: "✨ Upcoming Festival: Diwali Festival of Lights",
      message: "Cultural celebrations scheduled for Nov 8th. Check out the special holiday schedule and festive perks.",
      linkUrl: "/hr",
      read: true,
      createdAt: "Yesterday",
    },
  ]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[var(--brand-primary)]" />
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-border bg-card shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-3.5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-foreground">Notifications</span>
                {unreadCount > 0 && (
                  <Badge variant="brand" className="text-[10px] px-1.5 py-0">
                    {unreadCount} new
                  </Badge>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[11px] text-[var(--brand-primary)] hover:underline font-medium flex items-center gap-1"
                >
                  <Check className="h-3 w-3" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
              {notifications.length === 0 ? (
                <div className="p-6 text-center text-xs text-muted-foreground">
                  No notifications yet.
                </div>
              ) : (
                notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 hover:bg-muted/40 transition-colors text-xs space-y-1 ${
                      !notif.read ? "bg-[var(--brand-primary)]/5" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5 font-semibold text-foreground">
                        {notif.type === "BIRTHDAY_BROADCAST" && <Cake className="h-3.5 w-3.5 text-pink-400 shrink-0" />}
                        {notif.type === "FESTIVAL_BROADCAST" && <Sparkles className="h-3.5 w-3.5 text-amber-400 shrink-0" />}
                        {notif.type === "GOAL_APPROVED" && <PartyPopper className="h-3.5 w-3.5 text-emerald-400 shrink-0" />}
                        <span>{notif.title}</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {notif.createdAt}
                      </span>
                    </div>
                    <p className="text-muted-foreground leading-relaxed">{notif.message}</p>
                    <div className="flex items-center justify-between pt-1">
                      {notif.linkUrl ? (
                        <Link
                          href={notif.linkUrl}
                          onClick={() => {
                            markAsRead(notif.id);
                            setIsOpen(false);
                          }}
                          className="text-[11px] font-semibold text-[var(--brand-primary)] hover:underline flex items-center gap-1"
                        >
                          <span>View Details</span>
                          <ExternalLink className="h-3 w-3" />
                        </Link>
                      ) : (
                        <span />
                      )}
                      {!notif.read && (
                        <button
                          type="button"
                          onClick={() => markAsRead(notif.id)}
                          className="text-[10px] text-muted-foreground hover:text-foreground"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
