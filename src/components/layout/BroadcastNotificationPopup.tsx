"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useBroadcastPopup } from "@/lib/stores/broadcast-popup-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { fireSuccessBurst } from "@/lib/ui/confetti";
import {
  Sparkles,
  X,
  ExternalLink,
  Users,
} from "lucide-react";

interface FlyingParticle {
  id: number;
  emoji: string;
  x: number;
  y: number;
  rotate: number;
  scale: number;
}

interface FestivalThemeConfig {
  name: string;
  badgeText: string;
  ambientIcons: string[];
  borderStyle: string;
  glowShadow: string;
  orb1Gradient: string;
  orb2Gradient: string;
  badgeClasses: string;
  headingGradient: string;
  heroIcon: string;
  heroSubIconLeft?: string;
  heroSubIconRight?: string;
  reactionEmojis: string[];
  ctaButtonGradient: string;
  ctaText: string;
  centerpieceRing: string;
  centerpieceAnimationType: "birthday" | "diwali" | "christmas" | "holi" | "eid" | "independence" | "general";
}

export function BroadcastNotificationPopup() {
  const { activeBroadcast, isOpen, closeBroadcast, reactToBroadcast } = useBroadcastPopup();
  const [hasReacted, setHasReacted] = useState<string | null>(null);
  const [flyingParticles, setFlyingParticles] = useState<FlyingParticle[]>([]);

  // Keyboard handler when modal opens
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

  // Compute festival-specific customized theme
  const getThemeConfig = (): FestivalThemeConfig => {
    const titleLower = activeBroadcast.title.toLowerCase();
    const festKey = activeBroadcast.festivalKey;

    if (activeBroadcast.type === "BIRTHDAY") {
      return {
        name: "Birthday",
        badgeText: "Birthday Celebration",
        ambientIcons: ["🎈", "✨", "🎂", "🎉", "🌟", "🎁", "💖", "🥳"],
        borderStyle: "border-pink-500/60",
        glowShadow: "shadow-[0_0_60px_rgba(244,63,94,0.5)]",
        orb1Gradient: "bg-gradient-to-r from-pink-500 to-rose-500",
        orb2Gradient: "bg-gradient-to-r from-purple-600 to-pink-500",
        badgeClasses: "bg-pink-500/20 text-pink-300 border-pink-500/40 shadow-[0_0_10px_rgba(244,63,94,0.3)]",
        headingGradient: "bg-gradient-to-r from-pink-400 via-rose-300 to-amber-300",
        heroIcon: activeBroadcast.celebrantAvatar || "🎂",
        heroSubIconLeft: "✨",
        heroSubIconRight: "🎉",
        reactionEmojis: ["🎉", "🎂", "🎈", "🎁", "🚀", "❤️", "👏"],
        ctaButtonGradient: "bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white shadow-[0_0_20px_rgba(244,63,94,0.35)]",
        ctaText: "Join Celebration 🎂",
        centerpieceRing: "from-pink-500 via-amber-400 to-purple-500 shadow-[0_0_35px_rgba(244,63,94,0.6)]",
        centerpieceAnimationType: "birthday",
      };
    }

    if (festKey === "diwali" || titleLower.includes("diwali") || titleLower.includes("deepavali") || titleLower.includes("lights")) {
      return {
        name: "Diwali",
        badgeText: "Diwali Festival of Lights",
        ambientIcons: ["🪔", "✨", "🎆", "🎇", "🪔", "🌟", "🪔", "💫"],
        borderStyle: "border-amber-500/60",
        glowShadow: "shadow-[0_0_60px_rgba(245,158,11,0.55)]",
        orb1Gradient: "bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400",
        orb2Gradient: "bg-gradient-to-r from-orange-600 via-amber-500 to-rose-500",
        badgeClasses: "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_12px_rgba(245,158,11,0.4)]",
        headingGradient: "bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400",
        heroIcon: "🪔",
        heroSubIconLeft: "✨",
        heroSubIconRight: "🎆",
        reactionEmojis: ["🪔", "✨", "🎆", "🎇", "❤️", "🙏", "👏"],
        ctaButtonGradient: "bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-black font-bold shadow-[0_0_20px_rgba(245,158,11,0.45)]",
        ctaText: "Celebrate Diwali ✨",
        centerpieceRing: "from-amber-400 via-orange-500 to-yellow-400 shadow-[0_0_40px_rgba(245,158,11,0.75)]",
        centerpieceAnimationType: "diwali",
      };
    }

    if (festKey === "christmas" || titleLower.includes("christmas") || titleLower.includes("xmas") || titleLower.includes("year-end")) {
      return {
        name: "Christmas",
        badgeText: "Christmas & Holiday Gala",
        ambientIcons: ["❄️", "🎄", "🎁", "⭐", "⛄", "🔔", "🎅", "❄️"],
        borderStyle: "border-emerald-500/60",
        glowShadow: "shadow-[0_0_60px_rgba(16,185,129,0.5)]",
        orb1Gradient: "bg-gradient-to-r from-emerald-500 to-teal-500",
        orb2Gradient: "bg-gradient-to-r from-red-600 to-rose-500",
        badgeClasses: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-[0_0_12px_rgba(16,185,129,0.35)]",
        headingGradient: "bg-gradient-to-r from-emerald-300 via-red-400 to-amber-200",
        heroIcon: "🎄",
        heroSubIconLeft: "❄️",
        heroSubIconRight: "🎁",
        reactionEmojis: ["🎄", "❄️", "🎁", "⭐", "🔔", "⛄", "❤️"],
        ctaButtonGradient: "bg-gradient-to-r from-emerald-600 via-teal-600 to-red-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)]",
        ctaText: "Holiday Cheer 🎄",
        centerpieceRing: "from-emerald-400 via-red-500 to-amber-400 shadow-[0_0_40px_rgba(16,185,129,0.7)]",
        centerpieceAnimationType: "christmas",
      };
    }

    if (festKey === "holi" || titleLower.includes("holi") || titleLower.includes("color")) {
      return {
        name: "Holi",
        badgeText: "Holi Colors Festival",
        ambientIcons: ["🎨", "🌸", "🌈", "💧", "💜", "🌺", "💛", "🎊"],
        borderStyle: "border-pink-500/60",
        glowShadow: "shadow-[0_0_60px_rgba(236,72,153,0.55)]",
        orb1Gradient: "bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-400",
        orb2Gradient: "bg-gradient-to-r from-cyan-500 via-pink-500 to-purple-600",
        badgeClasses: "bg-pink-500/20 text-pink-300 border-pink-500/40 shadow-[0_0_12px_rgba(236,72,153,0.4)]",
        headingGradient: "bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400",
        heroIcon: "🎨",
        heroSubIconLeft: "🌸",
        heroSubIconRight: "🌈",
        reactionEmojis: ["🎨", "🌈", "🌸", "💧", "💜", "🎉", "👏"],
        ctaButtonGradient: "bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 text-white shadow-[0_0_20px_rgba(236,72,153,0.45)]",
        ctaText: "Join Holi Colors 🎨",
        centerpieceRing: "from-pink-500 via-yellow-400 to-cyan-400 shadow-[0_0_40px_rgba(236,72,153,0.75)]",
        centerpieceAnimationType: "holi",
      };
    }

    if (festKey === "eid" || titleLower.includes("eid") || titleLower.includes("ramadan")) {
      return {
        name: "Eid",
        badgeText: "Eid-ul-Fitr Celebration",
        ambientIcons: ["🌙", "✨", "🕌", "⭐", "🏮", "💫", "🤲", "🌙"],
        borderStyle: "border-teal-500/60",
        glowShadow: "shadow-[0_0_60px_rgba(20,184,166,0.55)]",
        orb1Gradient: "bg-gradient-to-r from-teal-500 via-emerald-600 to-cyan-500",
        orb2Gradient: "bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-500",
        badgeClasses: "bg-teal-500/20 text-teal-300 border-teal-500/40 shadow-[0_0_12px_rgba(20,184,166,0.4)]",
        headingGradient: "bg-gradient-to-r from-teal-300 via-emerald-300 to-amber-200",
        heroIcon: "🌙",
        heroSubIconLeft: "✨",
        heroSubIconRight: "⭐",
        reactionEmojis: ["🌙", "✨", "🕌", "🤲", "⭐", "❤️", "👏"],
        ctaButtonGradient: "bg-gradient-to-r from-teal-500 via-emerald-600 to-cyan-600 text-white shadow-[0_0_20px_rgba(20,184,166,0.45)]",
        ctaText: "Eid Mubarak 🌙",
        centerpieceRing: "from-teal-400 via-emerald-500 to-amber-300 shadow-[0_0_40px_rgba(20,184,166,0.75)]",
        centerpieceAnimationType: "eid",
      };
    }

    if (festKey === "independence" || titleLower.includes("independence") || titleLower.includes("national") || titleLower.includes("republic")) {
      return {
        name: "Independence",
        badgeText: "Independence Day Broadcast",
        ambientIcons: ["🇮🇳", "🕊️", "⭐", "🌟", "🇮🇳", "🎖️", "💫", "🌾"],
        borderStyle: "border-orange-500/60",
        glowShadow: "shadow-[0_0_60px_rgba(249,115,22,0.5)]",
        orb1Gradient: "bg-gradient-to-r from-orange-500 via-sky-500 to-emerald-600",
        orb2Gradient: "bg-gradient-to-r from-emerald-600 via-sky-600 to-orange-500",
        badgeClasses: "bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-[0_0_12px_rgba(249,115,22,0.35)]",
        headingGradient: "bg-gradient-to-r from-orange-400 via-sky-300 to-emerald-400",
        heroIcon: "🇮🇳",
        heroSubIconLeft: "🕊️",
        heroSubIconRight: "⭐",
        reactionEmojis: ["🇮🇳", "🕊️", "🌟", "🎖️", "👏", "❤️", "🎉"],
        ctaButtonGradient: "bg-gradient-to-r from-orange-500 via-sky-500 to-emerald-600 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)]",
        ctaText: "Celebrate 🇮🇳",
        centerpieceRing: "from-orange-500 via-sky-400 to-emerald-500 shadow-[0_0_40px_rgba(249,115,22,0.7)]",
        centerpieceAnimationType: "independence",
      };
    }

    // Default General Broadcast
    return {
      name: "General",
      badgeText: "Company Broadcast",
      ambientIcons: ["📢", "⚡", "✨", "📌", "💡", "🎯"],
      borderStyle: "border-cyan-500/60",
      glowShadow: "shadow-[0_0_60px_rgba(6,182,212,0.35)]",
      orb1Gradient: "bg-cyan-500",
      orb2Gradient: "bg-blue-600",
      badgeClasses: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
      headingGradient: "text-foreground",
      heroIcon: "📢",
      reactionEmojis: ["👍", "🚀", "💡", "❤️", "👏", "🎉"],
      ctaButtonGradient: "bg-gradient-to-r from-cyan-500 to-blue-600 text-white",
      ctaText: "View Notice",
      centerpieceRing: "from-cyan-400 to-blue-600 shadow-[0_0_30px_rgba(6,182,212,0.5)]",
      centerpieceAnimationType: "general",
    };
  };

  const theme = getThemeConfig();

  const handleEmojiReact = (emoji: string, e: React.MouseEvent<HTMLButtonElement>) => {
    reactToBroadcast(emoji);
    setHasReacted(emoji);
    fireSuccessBurst({ x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight });

    // Spawn 6 floating flying emoji particles
    const rect = e.currentTarget.getBoundingClientRect();
    const newParticles: FlyingParticle[] = Array.from({ length: 6 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      emoji,
      x: rect.left + rect.width / 2 + (Math.random() - 0.5) * 60,
      y: rect.top - 10,
      rotate: (Math.random() - 0.5) * 60,
      scale: 0.8 + Math.random() * 0.6,
    }));

    setFlyingParticles((prev) => [...prev, ...newParticles]);

    setTimeout(() => {
      setFlyingParticles((prev) => prev.filter((p) => !newParticles.some((np) => np.id === p.id)));
    }, 1500);

    setTimeout(() => setHasReacted(null), 1200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-hidden">
          {/* Backdrop Blur with smooth fade */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeBroadcast}
            className="fixed inset-0 bg-black/80 backdrop-blur-lg z-0"
          />



          {/* Flying Interactive Reaction Particles on Click */}
          <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
            {flyingParticles.map((particle) => (
              <motion.div
                key={particle.id}
                initial={{
                  x: particle.x,
                  y: particle.y,
                  opacity: 1,
                  scale: 0.5,
                  rotate: 0,
                }}
                animate={{
                  y: particle.y - 180 - Math.random() * 80,
                  x: particle.x + (Math.random() - 0.5) * 120,
                  opacity: [1, 1, 0],
                  scale: [0.5, particle.scale * 1.5, particle.scale * 0.8],
                  rotate: particle.rotate,
                }}
                transition={{ duration: 1.4, ease: "easeOut" }}
                className="fixed text-2xl select-none drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]"
              >
                {particle.emoji}
              </motion.div>
            ))}
          </div>

          {/* Modal Content Card with Animated Spring Scale & Glow */}
          <motion.div
            initial={{ opacity: 0, scale: 0.75, y: 40, rotateX: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 25 }}
            transition={{ type: "spring", damping: 22, stiffness: 280 }}
            className={`relative z-20 w-full max-w-lg rounded-3xl border shadow-2xl overflow-hidden glass-panel ${theme.borderStyle} ${theme.glowShadow} bg-gradient-to-b from-slate-950/95 via-card/95 to-slate-950/95`}
          >
            {/* Animated Rotating Gradient Mesh Orbs behind modal */}
            <motion.div
              animate={{
                scale: [1, 1.25, 1],
                rotate: [0, 180, 360],
              }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className={`absolute -top-20 -right-20 w-52 h-52 rounded-full blur-3xl pointer-events-none opacity-50 ${theme.orb1Gradient}`}
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [360, 180, 0],
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className={`absolute -bottom-20 -left-20 w-52 h-52 rounded-full blur-3xl pointer-events-none opacity-50 ${theme.orb2Gradient}`}
            />

            {/* Top Bar Header */}
            <div className="relative z-10 px-6 py-4 border-b border-border/80 flex items-center justify-between backdrop-blur-md bg-card/40">
              <div className="flex items-center gap-2">
                <Badge
                  variant="brand"
                  className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 flex items-center gap-1 ${theme.badgeClasses}`}
                >
                  <Sparkles className="h-3.5 w-3.5 animate-spin" />
                  <span>{activeBroadcast.badge || theme.badgeText}</span>
                </Badge>

                <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                  <Users className="h-3 w-3" />
                  {activeBroadcast.targetAudience || "All Staff (19)"}
                </span>
              </div>

              <Button
                variant="ghost"
                size="icon"
                onClick={closeBroadcast}
                className="h-7 w-7 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Main Modal Body */}
            <div className="relative z-10 p-6 space-y-6 text-center">
              {/* Creative 3D Centerpiece with Radiating Pulse Rings */}
              <div className="relative flex items-center justify-center my-1">
                {/* Radiating Expanding Pulse Wave */}
                <motion.div
                  animate={{
                    scale: [1, 1.8, 2.2],
                    opacity: [0.8, 0.3, 0],
                  }}
                  transition={{
                    duration: 2.2,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                  className={`absolute h-20 w-20 rounded-full border-2 pointer-events-none ${theme.borderStyle}`}
                />
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1.9],
                    opacity: [0.6, 0.2, 0],
                  }}
                  transition={{
                    duration: 2.2,
                    delay: 0.6,
                    repeat: Infinity,
                    ease: "easeOut",
                  }}
                  className={`absolute h-20 w-20 rounded-full border pointer-events-none ${theme.borderStyle}`}
                />

                {/* Festival-Specific Animated Hero Centerpiece */}
                <motion.div
                  animate={
                    theme.centerpieceAnimationType === "diwali"
                      ? { y: [0, -6, 0], rotate: [-2, 2, -2] }
                      : theme.centerpieceAnimationType === "christmas"
                      ? { y: [0, -7, 0], rotate: [0, 4, -4, 0] }
                      : theme.centerpieceAnimationType === "holi"
                      ? { y: [0, -8, 0], scale: [1, 1.1, 1], rotate: [0, 10, -10, 0] }
                      : theme.centerpieceAnimationType === "eid"
                      ? { y: [0, -6, 0], scale: [1, 1.06, 1] }
                      : theme.centerpieceAnimationType === "independence"
                      ? { y: [0, -6, 0], rotate: [0, 3, -3, 0] }
                      : { y: [0, -8, 0], rotate: [0, -3, 3, 0] }
                  }
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative z-10"
                >
                  <div className={`h-20 w-20 rounded-3xl p-[3px] bg-gradient-to-tr ${theme.centerpieceRing} flex items-center justify-center`}>
                    <div className="h-full w-full rounded-[21px] bg-[#0b0f19] flex items-center justify-center text-3xl shadow-inner relative overflow-hidden">
                      <span className="relative z-10">{theme.heroIcon}</span>
                      {/* Shimmer light pass */}
                      <motion.div
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                      />
                    </div>
                  </div>

                  {/* Festival-Specific Sub-Floating Badges */}
                  {theme.heroSubIconRight && (
                    <motion.span
                      animate={{ scale: [1, 1.3, 1], rotate: [0, 15, -15, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute -bottom-2 -right-2 text-2xl filter drop-shadow-md"
                    >
                      {theme.heroSubIconRight}
                    </motion.span>
                  )}
                  {theme.heroSubIconLeft && (
                    <motion.span
                      animate={{ scale: [1, 1.3, 1], rotate: [0, -20, 20, 0] }}
                      transition={{ duration: 2.4, repeat: Infinity, delay: 0.5 }}
                      className="absolute -top-2 -left-2 text-xl filter drop-shadow-md"
                    >
                      {theme.heroSubIconLeft}
                    </motion.span>
                  )}
                </motion.div>
              </div>

              {/* Title with Gradient Text Shimmer */}
              <div className="space-y-1.5">
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`text-xl sm:text-2xl font-black tracking-tight leading-tight bg-clip-text text-transparent ${theme.headingGradient}`}
                >
                  {activeBroadcast.title}
                </motion.h3>
                {activeBroadcast.author && (
                  <span className="text-xs text-muted-foreground block font-mono">
                    Published by {activeBroadcast.author} &middot; Just Now
                  </span>
                )}
              </div>

              {/* Message Box with subtle glass border */}
              <div className="p-4 rounded-2xl bg-card/70 border border-border/70 text-xs text-foreground/90 leading-relaxed text-center shadow-inner backdrop-blur-md">
                <p className="font-medium">{activeBroadcast.message}</p>
              </div>

              {/* Interactive Reaction Cannon with Festival-Specific Emojis */}
              <div className="space-y-2.5 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground font-bold px-1">
                  <span className="uppercase tracking-wider">Tap to cheer &amp; celebrate:</span>
                  <span className="text-amber-400 font-mono text-[10px] flex items-center gap-1">
                    <Sparkles className="h-3 w-3" /> Live Festive Cheers
                  </span>
                </div>

                <div className="flex items-center justify-center gap-2 flex-wrap">
                  {theme.reactionEmojis.map((emoji) => {
                    const count = activeBroadcast.reactions?.[emoji] || (emoji === "🪔" || emoji === "🎄" || emoji === "🎉" ? 18 : 12);
                    const isSelected = hasReacted === emoji;

                    return (
                      <motion.button
                        key={emoji}
                        type="button"
                        whileHover={{ scale: 1.15, y: -2 }}
                        whileTap={{ scale: 0.85 }}
                        onClick={(e) => handleEmojiReact(emoji, e)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer shadow-sm ${
                          isSelected
                            ? "bg-amber-500 text-black border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.5)] font-black"
                            : "bg-card/80 hover:bg-card border-border text-foreground hover:border-amber-500/40"
                        }`}
                      >
                        <span className="text-base">{emoji}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">
                          {count + (isSelected ? 1 : 0)}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between gap-3 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={closeBroadcast}
                  className="flex-1 text-xs font-semibold h-9 rounded-xl border-border/80 hover:bg-muted/50"
                >
                  Dismiss
                </Button>

                <Link
                  href={activeBroadcast.linkUrl || "/announcements"}
                  onClick={closeBroadcast}
                  className="flex-1"
                >
                  <Button
                    variant="brand"
                    size="sm"
                    className={`w-full text-xs font-bold h-9 rounded-xl gap-1.5 shadow-lg transition-all ${theme.ctaButtonGradient}`}
                  >
                    <span>{theme.ctaText}</span>
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
