"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBroadcastPopup } from "@/lib/stores/broadcast-popup-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Megaphone,
  Cake,
  Sparkles,
  X,
  ExternalLink,
  Users,
} from "lucide-react";

export function BroadcastNotificationPopup() {
  const { activeBroadcast, isOpen, closeBroadcast, reactToBroadcast } = useBroadcastPopup();
  const [hasReacted, setHasReacted] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeBroadcast();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeBroadcast]);

  if (!activeBroadcast) return null;

  const isBirthday = activeBroadcast.type === "BIRTHDAY";
  const isFestival = activeBroadcast.type === "FESTIVAL";
  const isUrgent = activeBroadcast.type === "URGENT_POLICY";

  const handleEmojiReact = (emoji: string) => {
    reactToBroadcast(emoji);
    setHasReacted(emoji);
    setTimeout(() => setHasReacted(null), 1500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeBroadcast}
            className="fixed inset-0 bg-black/75 backdrop-blur-md z-0"
          />

          {/* Modal Content Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`relative z-10 w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden glass-panel ${
              isBirthday
                ? "border-pink-500/60 shadow-[0_0_50px_rgba(244,63,94,0.35)] bg-gradient-to-b from-slate-950 via-card to-card"
                : isFestival
                ? "border-amber-500/60 shadow-[0_0_50px_rgba(245,158,11,0.35)] bg-gradient-to-b from-slate-950 via-card to-card"
                : isUrgent
                ? "border-rose-500/60 shadow-[0_0_50px_rgba(244,63,94,0.3)] bg-gradient-to-b from-slate-950 via-card to-card"
                : "border-cyan-500/60 shadow-[0_0_50px_rgba(6,182,212,0.3)] bg-gradient-to-b from-slate-950 via-card to-card"
            }`}
          >
            {/* Ambient Background Lights */}
            <div
              className={`absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-40 ${
                isBirthday ? "bg-pink-500" : isFestival ? "bg-amber-500" : "bg-cyan-500"
              }`}
            />
            <div
              className={`absolute -bottom-16 -left-16 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-40 ${
                isBirthday ? "bg-purple-500" : isFestival ? "bg-orange-500" : "bg-blue-500"
              }`}
            />

            {/* Top Bar Header */}
            <div className="relative z-10 p-5 pb-3 border-b border-border/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge
                  variant="brand"
                  className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 ${
                    isBirthday
                      ? "bg-pink-500/20 text-pink-300 border-pink-500/40"
                      : isFestival
                      ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                      : isUrgent
                      ? "bg-rose-500/20 text-rose-300 border-rose-500/40"
                      : "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
                  }`}
                >
                  {isBirthday && <Cake className="h-3 w-3 mr-1 inline text-pink-400" />}
                  {isFestival && <Sparkles className="h-3 w-3 mr-1 inline text-amber-400" />}
                  {!isBirthday && !isFestival && <Megaphone className="h-3 w-3 mr-1 inline text-cyan-400" />}
                  {activeBroadcast.badge || (isBirthday ? "Live Birthday Broadcast" : isFestival ? "Cultural Festival Broadcast" : "Company Broadcast")}
                </Badge>

                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {activeBroadcast.targetAudience || "All Staff (19)"}
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={closeBroadcast}
                className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Main Modal Body */}
            <div className="relative z-10 p-6 space-y-5 text-center">
              {/* Animated Floating Icon / Celebrant Avatar */}
              <div className="mx-auto">
                {isBirthday ? (
                  <div className="relative inline-block">
                    <div className="h-16 w-16 rounded-3xl p-[2px] bg-gradient-to-tr from-pink-500 via-amber-400 to-purple-500 shadow-[0_0_25px_rgba(244,63,94,0.5)] animate-bounce mx-auto">
                      <div className="h-full w-full rounded-3xl bg-[#0b0f19] flex items-center justify-center text-pink-300 font-black text-lg">
                        {activeBroadcast.celebrantAvatar || "🎂"}
                      </div>
                    </div>
                    <span className="absolute -bottom-1 -right-1 text-xl animate-pulse">🎉</span>
                  </div>
                ) : isFestival ? (
                  <div className="h-16 w-16 rounded-3xl bg-gradient-to-tr from-amber-500 to-orange-500 p-[2px] shadow-[0_0_25px_rgba(245,158,11,0.5)] mx-auto flex items-center justify-center">
                    <div className="h-full w-full rounded-3xl bg-[#0b0f19] flex items-center justify-center text-3xl">
                      {activeBroadcast.accentEmoji || "🪔"}
                    </div>
                  </div>
                ) : (
                  <div className="h-14 w-14 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center text-2xl mx-auto">
                    <Megaphone className="h-7 w-7 text-cyan-400" />
                  </div>
                )}
              </div>

              {/* Title & Headline */}
              <div className="space-y-1">
                <h3 className="text-lg sm:text-xl font-extrabold text-foreground tracking-tight leading-snug">
                  {activeBroadcast.title}
                </h3>
                {activeBroadcast.author && (
                  <span className="text-xs text-muted-foreground block font-mono">
                    Published by {activeBroadcast.author} · Just Now
                  </span>
                )}
              </div>

              {/* Message Box */}
              <div className="p-4 rounded-2xl bg-card/80 border border-border/80 text-xs text-foreground/90 leading-relaxed text-left max-h-48 overflow-y-auto">
                <p>{activeBroadcast.message}</p>
              </div>

              {/* Interactive Emoji Reactions Bar inside the Popup */}
              <div className="space-y-2 pt-1 border-t border-border/60">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                  Quick React to Broadcast:
                </span>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {["🎉", "🎂", "🪔", "✨", "🚀", "❤️", "👏"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => handleEmojiReact(emoji)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all transform active:scale-90 ${
                        hasReacted === emoji
                          ? "bg-pink-500 text-white border-pink-400 scale-110 shadow-lg"
                          : "bg-card/80 hover:bg-white/10 border-border text-foreground hover:border-pink-500/40"
                      }`}
                    >
                      <span className="text-sm">{emoji}</span>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        {activeBroadcast.reactions?.[emoji] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Footer CTA Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={closeBroadcast}
                  className="flex-1 text-xs font-semibold h-9 rounded-xl border-border"
                >
                  Dismiss
                </Button>

                <Link
                  href={activeBroadcast.linkUrl || "/hr"}
                  onClick={closeBroadcast}
                  className="flex-1"
                >
                  <Button
                    variant="brand"
                    size="sm"
                    className={`w-full text-xs font-bold h-9 rounded-xl gap-1.5 shadow-lg ${
                      isBirthday
                        ? "bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white"
                        : isFestival
                        ? "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white"
                        : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-black"
                    }`}
                  >
                    <span>{isBirthday ? "Join Celebration & Wish 🎉" : isFestival ? "View Festival Hub ✨" : "View Announcement"}</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
