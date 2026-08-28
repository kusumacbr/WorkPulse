"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { motion, AnimatePresence } from "framer-motion";
import { triggerBroadcastPopup } from "@/lib/stores/broadcast-popup-store";
import { fireCelebrationConfetti, fireSuccessBurst, fireFireworksConfetti } from "@/lib/ui/confetti";
import {
  Cake,
  Sparkles,
  Megaphone,
  Send,
  Heart,
  PartyPopper,
  Calendar,
  CheckCircle2,
  Smile,
  Flame,
  Wand2,
  X,
  MessageSquare,
  FlameKindling,
} from "lucide-react";

// ==========================================
// 1. DATA MODELS & TYPES
// ==========================================

export interface BirthdayCelebrant {
  id: string;
  name: string;
  role: string;
  department: string;
  departmentId: string;
  avatar: string;
  location: string;
  birthDate: string; // e.g. "Aug 21"
  daysAway: number; // 0 = today
  funFact: string;
  isCelebrated: boolean;
  isBroadcasted: boolean;
  wishesCount: number;
  reactions: { [key: string]: number };
  peerWishes: { id: string; author: string; role: string; text: string; time: string }[];
}

export interface CulturalFestival {
  id: string;
  title: string;
  date: string;
  daysAway: number;
  category: "FESTIVAL" | "NATIONAL" | "COMPANY_GALA";
  bannerColor: string;
  accentEmoji: string;
  significance: string;
  traditionalGreetings: string;
  holidayStatus: "Full Day Holiday" | "Optional Holiday" | "Cultural Celebration";
  isBroadcasted: boolean;
  wishesCount: number;
  reactions: { [key: string]: number };
  peerWishes: { id: string; author: string; role: string; text: string; time: string }[];
}

// Initial Birthday Roster (Synchronized with 19 Employees across 6 Depts)
const INITIAL_BIRTHDAYS: BirthdayCelebrant[] = [
  {
    id: "emp-sarah",
    name: "Sara Dev",
    role: "Senior Backend Engineer",
    department: "Development",
    departmentId: "dept-development",
    avatar: "SD",
    location: "Bangalore HQ",
    birthDate: "Aug 21",
    daysAway: 0,
    funFact: "Specialty espresso enthusiast & distributed systems wizard ☕",
    isCelebrated: false,
    isBroadcasted: false,
    wishesCount: 14,
    reactions: { "🎉": 18, "🎂": 22, "🚀": 11, "❤️": 16, "👏": 9, "🥂": 14 },
    peerWishes: [
      { id: "pw-1", author: "Alex Lead", role: "Engineering Lead", text: "Happy Birthday Sara! Fantastic job on the sprint deliverables today. Have a blast! 🚀", time: "10 mins ago" },
      { id: "pw-2", author: "Priya QA", role: "QA Lead", text: "Wishing you zero bugs and infinite joy this year Sara! 🎂🎉", time: "25 mins ago" },
    ],
  },
  {
    id: "emp-alex",
    name: "Alex Lead",
    role: "Engineering Manager · Dev",
    department: "Development",
    departmentId: "dept-development",
    avatar: "AL",
    location: "Bangalore HQ",
    birthDate: "Aug 24",
    daysAway: 3,
    funFact: "Guitarist and mechanical keyboard collector 🎸",
    isCelebrated: false,
    isBroadcasted: false,
    wishesCount: 8,
    reactions: { "🎉": 12, "🎂": 15, "🚀": 8, "❤️": 9, "👏": 6, "🥂": 10 },
    peerWishes: [],
  },
  {
    id: "emp-sneha",
    name: "Sneha Kapoor",
    role: "Data Analytics Engineer",
    department: "Data Processing",
    departmentId: "dept-data-processing",
    avatar: "SK",
    location: "Bangalore HQ",
    birthDate: "Aug 29",
    daysAway: 8,
    funFact: "Marathon runner & generative AI data science explorer 🏃‍♀️",
    isCelebrated: false,
    isBroadcasted: false,
    wishesCount: 5,
    reactions: { "🎉": 8, "🎂": 7, "🚀": 5, "❤️": 6, "👏": 4, "🥂": 5 },
    peerWishes: [],
  },
  {
    id: "emp-karthik",
    name: "Karthik Raja",
    role: "DevOps & Cloud Engineer",
    department: "DevOps",
    departmentId: "dept-devops",
    avatar: "KR",
    location: "Bangalore HQ",
    birthDate: "Sep 05",
    daysAway: 15,
    funFact: "Kubernetes enthusiast and astronomy photographer 🌌",
    isCelebrated: false,
    isBroadcasted: false,
    wishesCount: 2,
    reactions: { "🎉": 4, "🎂": 3, "🚀": 6, "❤️": 2, "👏": 1, "🥂": 2 },
    peerWishes: [],
  },
  {
    id: "emp-ananya",
    name: "Ananya Sen",
    role: "Automation & Embedded QA",
    department: "ConfigTap Enterprise",
    departmentId: "dept-configtap",
    avatar: "AS",
    location: "Bangalore HQ",
    birthDate: "Sep 18",
    daysAway: 28,
    funFact: "Autosar protocol specialist & classical pianist 🎹",
    isCelebrated: false,
    isBroadcasted: false,
    wishesCount: 3,
    reactions: { "🎉": 5, "🎂": 4, "🚀": 3, "❤️": 4, "👏": 2, "🥂": 3 },
    peerWishes: [],
  },
  {
    id: "hr-rachel",
    name: "Rachel HR",
    role: "Head of People Operations",
    department: "Human Resources",
    departmentId: "dept-hr",
    avatar: "RH",
    location: "Bangalore HQ",
    birthDate: "Oct 04",
    daysAway: 44,
    funFact: "People ops advocate & marathon runner 🏃‍♀️",
    isCelebrated: false,
    isBroadcasted: false,
    wishesCount: 1,
    reactions: { "🎉": 3, "🎂": 2, "🚀": 1, "❤️": 2, "👏": 1, "🥂": 2 },
    peerWishes: [],
  },
];

// Initial Cultural Festivals & Holidays 2026
const INITIAL_FESTIVALS: CulturalFestival[] = [
  {
    id: "fest-1",
    title: "Diwali (Festival of Lights) & Annual Gala",
    date: "Nov 08, 2026",
    daysAway: 79,
    category: "FESTIVAL",
    bannerColor: "from-amber-500/20 via-orange-500/15 to-rose-500/20",
    accentEmoji: "🪔",
    significance: "Celebration of light, knowledge, prosperity, and the triumph of good over evil.",
    traditionalGreetings: "Wishing our entire Xorstack family a joyous, luminous, and prosperous Diwali!",
    holidayStatus: "Full Day Holiday",
    isBroadcasted: false,
    wishesCount: 38,
    reactions: { "🪔": 45, "✨": 38, "🎉": 29, "❤️": 31, "👏": 19, "🥂": 22 },
    peerWishes: [
      { id: "fw-1", author: "Rachel HR", role: "People Ops Lead", text: "Diwali sweet hampers and team celebration schedule have been dispatched to all pods! ✨🪔", time: "1 hour ago" },
    ],
  },
  {
    id: "fest-2",
    title: "Eid-ul-Fitr Celebration",
    date: "Mar 21, 2026",
    daysAway: 212,
    category: "FESTIVAL",
    bannerColor: "from-emerald-500/20 via-teal-500/15 to-cyan-500/20",
    accentEmoji: "🌙",
    significance: "Marks the blessed conclusion of Ramadan, embracing charity, joy, and togetherness.",
    traditionalGreetings: "Eid Mubarak to you and your families! May this festive season bring peace and blessings.",
    holidayStatus: "Full Day Holiday",
    isBroadcasted: false,
    wishesCount: 22,
    reactions: { "🌙": 32, "✨": 26, "🎉": 21, "❤️": 25, "👏": 14, "🥂": 16 },
    peerWishes: [],
  },
  {
    id: "fest-3",
    title: "Christmas Gala & Year-End Winter Social",
    date: "Dec 25, 2026",
    daysAway: 126,
    category: "COMPANY_GALA",
    bannerColor: "from-rose-500/20 via-emerald-500/15 to-amber-500/20",
    accentEmoji: "🎄",
    significance: "Annual celebration of gratitude, cheer, year-end reflections, and holiday togetherness.",
    traditionalGreetings: "Merry Christmas and Warm Season's Greetings to the entire team!",
    holidayStatus: "Full Day Holiday",
    isBroadcasted: false,
    wishesCount: 42,
    reactions: { "🎄": 48, "✨": 39, "🎉": 35, "❤️": 30, "👏": 21, "🥂": 34 },
    peerWishes: [],
  },
  {
    id: "fest-4",
    title: "Holi (Festival of Colors) & Spring Mela",
    date: "Mar 04, 2026",
    daysAway: 195,
    category: "FESTIVAL",
    bannerColor: "from-pink-500/20 via-purple-500/15 to-cyan-500/20",
    accentEmoji: "🎨",
    significance: "Welcoming spring, vibrant energy, unity, and joyful shared colors across teams.",
    traditionalGreetings: "Wishing everyone a vibrant, joyful, and safe Holi full of laughter and color!",
    holidayStatus: "Full Day Holiday",
    isBroadcasted: false,
    wishesCount: 19,
    reactions: { "🎨": 28, "✨": 22, "🎉": 25, "❤️": 18, "👏": 12, "🥂": 15 },
    peerWishes: [],
  },
  {
    id: "fest-5",
    title: "Independence Day & Innovation Honors",
    date: "Aug 15, 2026",
    daysAway: 359,
    category: "NATIONAL",
    bannerColor: "from-orange-500/20 via-white/10 to-emerald-500/20",
    accentEmoji: "🇮🇳",
    significance: "Honoring national progress, democratic heritage, and engineering innovation excellence.",
    traditionalGreetings: "Happy Independence Day! Celebrating our collective dedication and nation-building spirit.",
    holidayStatus: "Full Day Holiday",
    isBroadcasted: true,
    wishesCount: 52,
    reactions: { "🇮🇳": 64, "✨": 41, "🎉": 38, "❤️": 33, "👏": 29, "🥂": 24 },
    peerWishes: [],
  },
];

// AI Greeting Presets for Birthdays
const BIRTHDAY_AI_PRESETS = [
  {
    id: "tech",
    label: "🚀 Tech & Geeky Lore",
    wish: "May your new year of life be 100% bug-free, your pipelines finish in record time, and your sprint coffee cup never run empty! Happy Birthday from all of us at Xorstack! ⚡🎂",
  },
  {
    id: "hype",
    label: "🔥 High-Energy Hype",
    wish: "Huge shout-out to our legendary teammate! Thank you for bringing immense energy, unstoppable passion, and brilliant ideas every single day. Let's celebrate BIG today! 🎉🥳",
  },
  {
    id: "exec",
    label: "🌟 Leadership & Craft",
    wish: "Wishing you a very Happy Birthday! Your dedication to craftsmanship, proactive leadership, and positive impact continue to inspire our entire team. May this year bring tremendous growth! 🌟✨",
  },
  {
    id: "warm",
    label: "💖 Warm & Wholesome",
    wish: "Happy Birthday! Wishing you abundant joy, good health, unforgettable memories with loved ones, and plenty of cake on your special day. Enjoy every moment! 🍰🎁",
  },
];

// Digital Perks for Birthdays & Celebrations
const DIGITAL_PERKS = [
  { id: "perk-1", title: "Amazon $50 Celebration Voucher", icon: "🎁", description: "Direct e-gift card to their email" },
  { id: "perk-2", title: "Half-Day Birthday PTO Pass", icon: "🏖️", description: "Pre-approved flexible rest hours" },
  { id: "perk-3", title: "Executive Team Swag Pack", icon: "🎒", description: "Xorstack premium hoodie & tumblers" },
  { id: "perk-4", title: "Gourmet Artisanal Coffee Pass", icon: "☕", description: "Barista specialty roast bundle" },
];

export function EmployeeCelebrationBroadcastDeck() {
  const [activeCultureTab, setActiveCultureTab] = useState<"birthdays" | "festivals">("birthdays");
  const [birthdays, setBirthdays] = useState<BirthdayCelebrant[]>(INITIAL_BIRTHDAYS);
  const [festivals, setFestivals] = useState<CulturalFestival[]>(INITIAL_FESTIVALS);
  const [birthdayFilter, setBirthdayFilter] = useState<"all" | "today" | "upcoming">("all");

  // Studio Modal States
  const [selectedCelebrant, setSelectedCelebrant] = useState<BirthdayCelebrant | null>(null);
  const [selectedFestival, setSelectedFestival] = useState<CulturalFestival | null>(null);
  const [cardTheme, setCardTheme] = useState<"cyber" | "gold" | "confetti" | "pastel">("gold");
  const [customWish, setCustomWish] = useState("");
  const [selectedPerk, setSelectedPerk] = useState<string>("perk-1");
  const [candlesBlown, setCandlesBlown] = useState(false);
  const [diyaLit, setDiyaLit] = useState(false);
  const [floatingReactions, setFloatingReactions] = useState<{ id: number; emoji: string; left: number }[]>([]);
  const [giftUnboxed, setGiftUnboxed] = useState(false);

  // Live Toast State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Peer Wish Input State for Live Feed
  const [newPeerWishText, setNewPeerWishText] = useState<{ [key: string]: string }>({});

  const showCelebrationToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const spawnReaction = (emoji: string) => {
    const newReaction = {
      id: Date.now() + Math.random(),
      emoji,
      left: 10 + Math.floor(Math.random() * 80),
    };
    setFloatingReactions((prev) => [...prev.slice(-20), newReaction]);
    fireSuccessBurst({ x: newReaction.left / 100, y: 0.65 });
    showCelebrationToast(`${emoji} Celebration reaction popped!`);
  };

  const handleBlowCandles = () => {
    setCandlesBlown(true);
    fireFireworksConfetti();
    showCelebrationToast("🎉 WISH MADE! Digital candles blown out with celebratory fireworks! 🎂");
    ["🎂", "✨", "🎉", "🥳", "💖"].forEach((emoji, idx) => {
      setTimeout(() => {
        setFloatingReactions((prev) => [
          ...prev.slice(-20),
          { id: Date.now() + Math.random(), emoji, left: 15 + idx * 18 },
        ]);
      }, idx * 120);
    });
  };

  // Open Studio for Birthday
  const handleOpenBirthdayStudio = (celebrant: BirthdayCelebrant) => {
    setSelectedCelebrant(celebrant);
    setSelectedFestival(null);
    setCustomWish(BIRTHDAY_AI_PRESETS[0]?.wish || "");
    setCandlesBlown(false);
    setGiftUnboxed(false);
  };

  // Open Studio for Festival
  const handleOpenFestivalStudio = (festival: CulturalFestival) => {
    setSelectedFestival(festival);
    setSelectedCelebrant(null);
    setCustomWish(festival.traditionalGreetings);
    setDiyaLit(false);
    setGiftUnboxed(false);
  };

  // 1. Notify Celebrant Creatively (1-to-1 VIP Greeting)
  const handleNotifyCelebrantDirectly = () => {
    if (!selectedCelebrant) return;
    setBirthdays((prev) =>
      prev.map((b) =>
        b.id === selectedCelebrant.id
          ? {
              ...b,
              isCelebrated: true,
              wishesCount: b.wishesCount + 1,
              peerWishes: [
                {
                  id: `pw-${Date.now()}`,
                  author: "HR & People Ops",
                  role: "People Operations Team",
                  text: customWish,
                  time: "Just now",
                },
                ...b.peerWishes,
              ],
            }
          : b
      )
    );

    // Trigger Popup
    triggerBroadcastPopup({
      id: `pop-bday-${selectedCelebrant.id}`,
      type: "BIRTHDAY",
      title: `🎂 Happy Birthday, ${selectedCelebrant.name}!`,
      message: customWish || `Wishing you a very Happy Birthday from all of us at Xorstack! May your year ahead be full of achievements, joy, and breakthroughs!`,
      author: "HR & People Operations",
      targetAudience: `VIP Direct to ${selectedCelebrant.name}`,
      badge: "VIP Birthday Greeting",
      celebrantAvatar: selectedCelebrant.avatar,
      accentEmoji: "🎂",
      linkUrl: "/hr",
      reactions: { "🎉": 18, "🎂": 24, "🚀": 14, "❤️": 19, "👏": 12 },
    });

    showCelebrationToast(`💌 VIP Creative Celebration Greeting sent to ${selectedCelebrant.name} via In-App & Slack! 🎂✨`);
    setSelectedCelebrant(null);
  };

  // 2. Broadcast Birthday to ALL 19 Employees
  const handleBroadcastBirthdayToAll = (celebrant: BirthdayCelebrant) => {
    setBirthdays((prev) =>
      prev.map((b) =>
        b.id === celebrant.id
          ? {
              ...b,
              isBroadcasted: true,
              wishesCount: b.wishesCount + 1,
            }
          : b
      )
    );

    // Trigger Global Popup for all employees
    triggerBroadcastPopup({
      id: `pop-broadcast-bday-${celebrant.id}`,
      type: "BIRTHDAY",
      title: `🎂 Org Birthday Broadcast: Celebrate ${celebrant.name}!`,
      message: `Today we celebrate ${celebrant.name} (${celebrant.role} · ${celebrant.department})! Join the company celebration board, send your warm wishes, and grab some digital cake! 🎉🥳`,
      author: "People Operations & Culture Hub",
      targetAudience: "All Organization (19 Staff)",
      badge: "Company-Wide Celebration",
      celebrantAvatar: celebrant.avatar,
      accentEmoji: "🎉",
      linkUrl: "/hr",
      reactions: { "🎉": 22, "🎂": 28, "🚀": 16, "❤️": 21, "👏": 15 },
    });

    showCelebrationToast(`📢 Company-Wide Birthday Broadcast for ${celebrant.name} published to ALL 19 Staff! 🎉🚀`);
    if (selectedCelebrant) setSelectedCelebrant(null);
  };

  // 3. Broadcast Cultural Festival to ALL Employees
  const handleBroadcastFestivalToAll = (festival: CulturalFestival) => {
    setFestivals((prev) =>
      prev.map((f) =>
        f.id === festival.id
          ? {
              ...f,
              isBroadcasted: true,
              wishesCount: f.wishesCount + 1,
            }
          : f
      )
    );

    // Trigger Global Popup for all employees
    triggerBroadcastPopup({
      id: `pop-fest-${festival.id}`,
      type: "FESTIVAL",
      title: `✨ Cultural Broadcast: ${festival.title}!`,
      message: `${festival.traditionalGreetings} ${festival.significance} Check out the special holiday schedule and celebration events in the Culture Hub!`,
      author: "Diversity & Culture Inclusivity Council",
      targetAudience: "All Organization (19 Staff)",
      badge: "Cultural Festival Gala",
      accentEmoji: festival.accentEmoji,
      linkUrl: "/hr",
      reactions: { [festival.accentEmoji]: 35, "✨": 30, "🎉": 26, "❤️": 28, "👏": 18 },
    });

    showCelebrationToast(`📢 Cultural Festival Announcement "${festival.title}" broadcasted to all 19 Staff! ✨🪔`);
    if (selectedFestival) setSelectedFestival(null);
  };

  // Reaction Click
  const handleReactionClick = (itemId: string, emoji: string, type: "bday" | "fest") => {
    if (type === "bday") {
      setBirthdays((prev) =>
        prev.map((b) =>
          b.id === itemId
            ? {
                ...b,
                reactions: {
                  ...b.reactions,
                  [emoji]: (b.reactions[emoji] || 0) + 1,
                },
              }
            : b
        )
      );
    } else {
      setFestivals((prev) =>
        prev.map((f) =>
          f.id === itemId
            ? {
                ...f,
                reactions: {
                  ...f.reactions,
                  [emoji]: (f.reactions[emoji] || 0) + 1,
                },
              }
            : f
        )
      );
    }
  };

  // Post Peer Wish
  const handlePostPeerWish = (itemId: string, type: "bday" | "fest") => {
    const text = (newPeerWishText[itemId] || "").trim();
    if (!text) return;

    if (type === "bday") {
      setBirthdays((prev) =>
        prev.map((b) =>
          b.id === itemId
            ? {
                ...b,
                wishesCount: b.wishesCount + 1,
                peerWishes: [
                  {
                    id: `pw-${Date.now()}`,
                    author: "Current User (Sara Dev)",
                    role: "Engineering Pod",
                    text,
                    time: "Just now",
                  },
                  ...b.peerWishes,
                ],
              }
            : b
        )
      );
    } else {
      setFestivals((prev) =>
        prev.map((f) =>
          f.id === itemId
            ? {
                ...f,
                wishesCount: f.wishesCount + 1,
                peerWishes: [
                  {
                    id: `fw-${Date.now()}`,
                    author: "Current User (Sara Dev)",
                    role: "Engineering Pod",
                    text,
                    time: "Just now",
                  },
                  ...f.peerWishes,
                ],
              }
            : f
        )
      );
    }

    setNewPeerWishText({ ...newPeerWishText, [itemId]: "" });
    showCelebrationToast("✨ Your warm wish has been posted to the celebration board!");
  };

  // Filtering Birthdays
  const filteredBirthdays = birthdays.filter((b) => {
    if (birthdayFilter === "today") return b.daysAway === 0;
    if (birthdayFilter === "upcoming") return b.daysAway > 0 && b.daysAway <= 14;
    return true;
  });

  const todayCelebrantsCount = birthdays.filter((b) => b.daysAway === 0).length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="p-4 rounded-2xl bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-amber-500/20 border border-pink-500/40 text-xs text-foreground shadow-2xl flex items-center justify-between gap-3 backdrop-blur-xl"
          >
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-300 shrink-0">
                <PartyPopper className="h-4 w-4 animate-bounce" />
              </div>
              <span className="font-bold text-sm">{toastMessage}</span>
            </div>
            <Badge variant="brand" className="bg-pink-500/20 text-pink-300 border-pink-500/30 font-mono text-[10px]">
              Delivered Live
            </Badge>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* 1. CULTURE & CELEBRATIONS TOP BAR & TAB SWITCHER              */}
      {/* ============================================================== */}
      <Interactive3DCard className="p-6 border border-pink-500/30 bg-gradient-to-r from-card/90 via-card/70 to-pink-500/10 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-300">
                <Sparkles className="h-4 w-4 text-pink-400" />
              </div>
              <h3 className="text-base font-bold text-foreground">
                Employee Celebrations & Cultural Broadcast Center
              </h3>
              {todayCelebrantsCount > 0 && (
                <Badge variant="brand" className="text-[10px] bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold animate-pulse">
                  🎂 {todayCelebrantsCount} Birthday Today!
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Creatively celebrate employee birthdays and cultural festivals with personalized 3D cards, digital candle/diya blowout, perk gifts, and company-wide broadcasts.
            </p>
          </div>

          {/* Major Mode Switcher: Birthdays vs Cultural Festivals */}
          <div className="flex items-center gap-2 bg-background/60 p-1.5 rounded-xl border border-border/80 shrink-0">
            <button
              type="button"
              onClick={() => setActiveCultureTab("birthdays")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeCultureTab === "birthdays"
                  ? "bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-[0_0_12px_rgba(244,63,94,0.35)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Cake className="h-3.5 w-3.5" />
              <span>Employee Birthdays</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
                {birthdays.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveCultureTab("festivals")}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                activeCultureTab === "festivals"
                  ? "bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-[0_0_12px_rgba(245,158,11,0.35)]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Cultural Festivals & Holidays</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">
                {festivals.length}
              </span>
            </button>
          </div>
        </div>

        {/* Quick Highlights Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1">
          <div className="p-3 rounded-xl bg-card/60 border border-border/60 space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold">Today's Celebrants</span>
            <div className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Cake className="h-3.5 w-3.5 text-pink-400" />
              <span>{todayCelebrantsCount} Staff</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card/60 border border-border/60 space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold">Upcoming in 14 Days</span>
            <div className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-cyan-400" />
              <span>{birthdays.filter((b) => b.daysAway > 0 && b.daysAway <= 14).length} Birthdays</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card/60 border border-border/60 space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold">Next Cultural Holiday</span>
            <div className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              <span>Diwali (Nov 08)</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-card/60 border border-border/60 space-y-1">
            <span className="text-[10px] text-muted-foreground uppercase font-bold">Total Org Wishes</span>
            <div className="text-sm font-bold text-foreground flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-rose-400" />
              <span>180+ Peer Cheers</span>
            </div>
          </div>
        </div>
      </Interactive3DCard>

      {/* ============================================================== */}
      {/* 2. MODE A: EMPLOYEE BIRTHDAYS DIRECTORY & RADAR                */}
      {/* ============================================================== */}
      {activeCultureTab === "birthdays" && (
        <div className="space-y-6">
          {/* Sub-Filters */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setBirthdayFilter("all")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  birthdayFilter === "all"
                    ? "bg-pink-500 text-white"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                All 6 Departments ({birthdays.length})
              </button>
              <button
                type="button"
                onClick={() => setBirthdayFilter("today")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  birthdayFilter === "today"
                    ? "bg-pink-500 text-white"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                🎂 Today's Celebrants ({todayCelebrantsCount})
              </button>
              <button
                type="button"
                onClick={() => setBirthdayFilter("upcoming")}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  birthdayFilter === "upcoming"
                    ? "bg-pink-500 text-white"
                    : "bg-card border border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                📅 Upcoming 14 Days ({birthdays.filter((b) => b.daysAway > 0 && b.daysAway <= 14).length})
              </button>
            </div>

            <span className="text-[11px] text-muted-foreground hidden sm:inline-block">
              19 Staff Members Telemetry Active
            </span>
          </div>

          {/* Birthday Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredBirthdays.map((celebrant) => {
              const isToday = celebrant.daysAway === 0;

              return (
                <Interactive3DCard
                  key={celebrant.id}
                  className={`p-5 space-y-4 border transition-all ${
                    isToday
                      ? "border-pink-500/60 bg-gradient-to-b from-pink-500/10 via-card/80 to-card/60 shadow-[0_0_25px_rgba(244,63,94,0.18)]"
                      : "border-border/80 hover:border-pink-500/40 bg-card/60"
                  }`}
                >
                  {/* Top Avatar & Date Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      {/* Avatar with Celebratory Glow */}
                      <div
                        className={`h-11 w-11 rounded-2xl p-[2px] shrink-0 ${
                          isToday
                            ? "bg-gradient-to-tr from-pink-500 via-amber-400 to-purple-500 shadow-[0_0_15px_rgba(244,63,94,0.4)] animate-pulse"
                            : "bg-gradient-to-tr from-pink-500/40 to-cyan-500/40"
                        }`}
                      >
                        <div className="h-full w-full rounded-2xl bg-[#0b0f19] flex items-center justify-center text-pink-300 font-bold text-xs">
                          {celebrant.avatar}
                        </div>
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-foreground">{celebrant.name}</span>
                          {isToday && (
                            <Badge variant="brand" className="text-[9px] bg-pink-500/20 text-pink-300 border-pink-500/40 font-bold px-1.5 py-0">
                              TODAY 🎂
                            </Badge>
                          )}
                        </div>
                        <span className="text-[11px] text-muted-foreground block">{celebrant.role}</span>
                        <Badge variant="outline" className="text-[9px] font-semibold border-border/80 text-muted-foreground">
                          {celebrant.department} · {celebrant.location}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-right shrink-0 space-y-0.5">
                      <span className="text-xs font-mono font-bold text-pink-400 bg-pink-500/10 px-2 py-0.5 rounded-lg border border-pink-500/20 block">
                        {celebrant.birthDate}
                      </span>
                      <span className="text-[10px] text-muted-foreground block">
                        {isToday ? "Special Day!" : `In ${celebrant.daysAway} days`}
                      </span>
                    </div>
                  </div>

                  {/* Fun Fact snippet */}
                  <div className="p-2.5 rounded-xl bg-card/80 border border-border/60 text-[11px] text-muted-foreground flex items-center gap-2">
                    <Smile className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                    <span className="truncate">{celebrant.funFact}</span>
                  </div>

                  {/* Status & Reactions Summary */}
                  <div className="space-y-2 pt-1 border-t border-border/60">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <Heart className="h-3 w-3 text-rose-400" />
                        <strong>{celebrant.wishesCount}</strong> wishes received
                      </span>

                      {celebrant.isBroadcasted ? (
                        <Badge variant="brand" className="text-[9px] bg-emerald-500/15 text-emerald-300 border-emerald-500/30">
                          <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                          Org Broadcast Active
                        </Badge>
                      ) : celebrant.isCelebrated ? (
                        <Badge variant="brand" className="text-[9px] bg-cyan-500/15 text-cyan-300 border-cyan-500/30">
                          <Send className="h-2.5 w-2.5 mr-1" />
                          VIP Greeting Sent
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[9px] text-muted-foreground">
                          Ready to Celebrate
                        </Badge>
                      )}
                    </div>

                    {/* Interactive Emoji Reaction Bar */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {["🎉", "🎂", "🚀", "❤️", "👏", "🥂"].map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => handleReactionClick(celebrant.id, emoji, "bday")}
                          className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-card/90 hover:bg-pink-500/20 border border-border/80 hover:border-pink-500/40 text-[11px] transition-all transform active:scale-90"
                        >
                          <span>{emoji}</span>
                          <span className="font-mono text-[10px] text-muted-foreground font-bold">
                            {celebrant.reactions[emoji] || 0}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons: 1. Creative Studio, 2. Broadcast to Org */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <Button
                      variant="brand"
                      size="sm"
                      onClick={() => handleOpenBirthdayStudio(celebrant)}
                      className="text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white h-8 px-2.5 gap-1 shadow-[0_0_10px_rgba(244,63,94,0.3)]"
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                      <span>Creative Studio</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBroadcastBirthdayToAll(celebrant)}
                      className="text-xs font-bold border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/15 h-8 px-2.5 gap-1"
                    >
                      <Megaphone className="h-3.5 w-3.5 text-cyan-400" />
                      <span>Broadcast All</span>
                    </Button>
                  </div>
                </Interactive3DCard>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MODE B: CULTURAL FESTIVALS & HOLIDAYS DIRECTORY             */}
      {/* ============================================================== */}
      {activeCultureTab === "festivals" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-foreground">
              Official Cultural Festivals & Company Observances 2026
            </span>
            <Badge variant="brand" className="text-xs bg-amber-500/15 text-amber-300 border-amber-500/30">
              Diversity & Cultural Inclusivity Hub
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {festivals.map((festival) => (
              <Interactive3DCard
                key={festival.id}
                className={`p-6 border border-border/80 hover:border-amber-500/40 space-y-4 bg-gradient-to-br ${festival.bannerColor}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-2xl shrink-0 shadow-lg">
                      {festival.accentEmoji}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-foreground">{festival.title}</h4>
                      <span className="text-xs text-amber-300/90 font-mono font-semibold">{festival.date}</span>
                      <div className="flex items-center gap-2 pt-1">
                        <Badge variant="outline" className="text-[10px] border-amber-500/30 text-amber-300">
                          {festival.holidayStatus}
                        </Badge>
                        <Badge variant="brand" className="text-[10px] bg-white/10 text-foreground font-mono">
                          In {festival.daysAway} Days
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {festival.isBroadcasted && (
                    <Badge variant="brand" className="text-[9px] bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shrink-0">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Broadcast Sent
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {festival.significance}
                </p>

                {/* Cultural Greetings Box */}
                <div className="p-3 rounded-xl bg-card/80 border border-border/70 text-xs text-foreground space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">
                    Official Organization Greeting
                  </span>
                  <p className="italic text-foreground/90">"{festival.traditionalGreetings}"</p>
                </div>

                {/* Emoji Reactions & Actions */}
                <div className="space-y-3 pt-1 border-t border-border/60">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {Object.keys(festival.reactions).map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleReactionClick(festival.id, emoji, "fest")}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card/90 hover:bg-amber-500/20 border border-border/80 hover:border-amber-500/40 text-xs transition-all active:scale-95"
                      >
                        <span>{emoji}</span>
                        <span className="font-mono text-[10px] text-muted-foreground font-bold">
                          {festival.reactions[emoji]}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="brand"
                      size="sm"
                      onClick={() => handleOpenFestivalStudio(festival)}
                      className="text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white h-8 px-3 gap-1.5"
                    >
                      <Wand2 className="h-3.5 w-3.5" />
                      <span>Customize Greeting</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleBroadcastFestivalToAll(festival)}
                      className="text-xs font-bold border-amber-500/40 text-amber-300 hover:bg-amber-500/15 h-8 px-3 gap-1.5"
                    >
                      <Megaphone className="h-3.5 w-3.5 text-amber-400" />
                      <span>Broadcast to Org</span>
                    </Button>
                  </div>
                </div>
              </Interactive3DCard>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. CREATIVE CELEBRATION STUDIO MODAL (3D TILT & CANDLE/DIYA)   */}
      {/* ============================================================== */}
      <AnimatePresence>
        {(selectedCelebrant || selectedFestival) && (
          <div className="fixed inset-0 bg-background/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="w-full max-w-2xl bg-card border border-pink-500/40 rounded-3xl shadow-2xl overflow-hidden my-8"
            >
              {/* Header */}
              <div className="p-5 border-b border-border/80 flex items-center justify-between bg-gradient-to-r from-card via-card/90 to-pink-500/10">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-300">
                    <Sparkles className="h-4 w-4 text-pink-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-foreground">
                      {selectedCelebrant ? `Creative Birthday Greeting Studio` : `Cultural Celebration Studio`}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {selectedCelebrant
                        ? `Personalize celebration card for ${selectedCelebrant.name} (${selectedCelebrant.role})`
                        : `Customize cultural festival broadcast for ${selectedFestival?.title}`}
                    </p>
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-xl"
                  onClick={() => {
                    setSelectedCelebrant(null);
                    setSelectedFestival(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
                {/* 3D Interactive Card Preview */}
                <div className="space-y-2">
                  <label className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider block">
                    Interactive 3D Celebration Card Preview (Tilt with Cursor)
                  </label>

                  <Interactive3DCard
                    tiltStrength={12}
                    className={`p-6 border rounded-2xl relative overflow-hidden transition-all duration-300 ${
                      cardTheme === "cyber"
                        ? "border-cyan-500/60 bg-gradient-to-br from-slate-950 via-indigo-950 to-cyan-950 shadow-[0_0_30px_rgba(6,182,212,0.25)]"
                        : cardTheme === "gold"
                        ? "border-amber-500/60 bg-gradient-to-br from-slate-950 via-neutral-900 to-amber-950/60 shadow-[0_0_30px_rgba(245,158,11,0.25)]"
                        : cardTheme === "confetti"
                        ? "border-pink-500/60 bg-gradient-to-br from-slate-950 via-purple-950 to-rose-950/70 shadow-[0_0_30px_rgba(244,63,94,0.25)]"
                        : "border-emerald-500/60 bg-gradient-to-br from-slate-950 via-teal-950 to-emerald-950/60 shadow-[0_0_30px_rgba(16,185,129,0.25)]"
                    }`}
                  >
                    {/* Floating Animated Balloons in Background */}
                    <span className="absolute top-3 left-4 text-2xl animate-balloon select-none pointer-events-none opacity-80">🎈</span>
                    <span className="absolute top-4 right-4 text-2xl animate-balloon select-none pointer-events-none opacity-80" style={{ animationDelay: "1.5s" }}>🎈</span>

                    {/* Floating Reactions Layer */}
                    {floatingReactions.map((r) => (
                      <div
                        key={r.id}
                        style={{ left: `${r.left}%` }}
                        className="absolute bottom-6 text-2xl pointer-events-none animate-float-emoji z-40 select-none"
                      >
                        {r.emoji}
                      </div>
                    ))}

                    {/* Decorative Ambient Background Glows */}
                    <div className="absolute top-0 right-0 w-36 h-36 bg-pink-500/15 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-36 h-36 bg-cyan-500/15 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10 space-y-4">
                      <div className="flex items-center justify-between">
                        <Badge variant="brand" className="text-[10px] uppercase font-bold tracking-wider bg-white/15 text-white border-white/20">
                          {selectedCelebrant ? "🎂 Official Xorstack Birthday Card" : "✨ Cultural Holiday Broadcast"}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => fireCelebrationConfetti()}
                            className="p-1 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 border border-pink-500/40 text-pink-300 text-xs transition-all cursor-pointer"
                            title="Pop Confetti Blast"
                          >
                            🎉 Pop
                          </button>
                          <span className="text-xl animate-pulse">
                            {selectedCelebrant ? "🎂" : selectedFestival?.accentEmoji}
                          </span>
                        </div>
                      </div>

                      {/* Celebrant Main Focus */}
                      <div className="text-center py-1 space-y-1">
                        <h2 className="text-2xl font-extrabold shimmer-gold-text">
                          {selectedCelebrant ? `Happy Birthday, ${selectedCelebrant.name}!` : selectedFestival?.title}
                        </h2>
                        <p className="text-xs text-muted-foreground">
                          {selectedCelebrant
                            ? `${selectedCelebrant.role} · ${selectedCelebrant.department} Pod`
                            : selectedFestival?.significance}
                        </p>
                      </div>

                      {/* Interactive 3D Cake / Diya Action */}
                      <div className="p-4 rounded-2xl bg-black/50 border border-white/10 text-center space-y-3 relative overflow-hidden backdrop-blur-md">
                        {selectedCelebrant ? (
                          <div className="space-y-3">
                            {/* Layered Animated Cake Graphic */}
                            <div className="flex flex-col items-center justify-center">
                              {/* 3 Flickering Candles */}
                              <div className="flex items-end justify-center gap-5 pb-0.5">
                                {[1, 2, 3].map((candleIdx) => (
                                  <div key={candleIdx} className="flex flex-col items-center">
                                    {!candlesBlown ? (
                                      <div className="h-5 w-3.5 bg-gradient-to-t from-amber-500 via-yellow-300 to-white rounded-full animate-flame shadow-[0_0_14px_rgba(245,158,11,1)]" />
                                    ) : (
                                      <span className="text-xs text-muted-foreground animate-pulse">💨</span>
                                    )}
                                    <div className="h-1.5 w-0.5 bg-neutral-400" />
                                    <div
                                      className={`w-2.5 rounded-t-sm shadow-sm ${
                                        candleIdx === 2
                                          ? "bg-pink-400 h-8"
                                          : candleIdx === 1
                                          ? "bg-cyan-400 h-6"
                                          : "bg-purple-400 h-6"
                                      }`}
                                    />
                                  </div>
                                ))}
                              </div>

                              {/* Cake Top Tier */}
                              <div className="w-32 h-5 rounded-t-lg bg-gradient-to-r from-pink-300 via-rose-200 to-pink-300 border-t border-x border-pink-400/40 flex items-center justify-center text-[9px] font-bold text-pink-900 shadow-sm">
                                🍓 Cream Frosting 🍓
                              </div>
                              {/* Cake Bottom Tier */}
                              <div className="w-48 h-6 rounded-b-xl bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 border border-amber-600/30 flex items-center justify-center text-[9px] font-bold text-amber-200 shadow-inner">
                                🍫 Chocolate Sponge Layer 🍫
                              </div>
                            </div>

                            {/* Blow Out Action Button */}
                            <div className="flex items-center justify-center gap-2">
                              {!candlesBlown ? (
                                <button
                                  type="button"
                                  onClick={handleBlowCandles}
                                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white font-black text-xs transition-all shadow-[0_0_15px_rgba(244,63,94,0.4)] active:scale-95 flex items-center gap-2 cursor-pointer"
                                >
                                  <Flame className="h-4 w-4 text-amber-300 animate-flame" />
                                  <span>Click to Blow Out Birthday Candles!</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCandlesBlown(false);
                                    showCelebrationToast("🔥 Candles relit for celebration!");
                                  }}
                                  className="px-4 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs transition-all flex items-center gap-2 cursor-pointer"
                                >
                                  <Flame className="h-3.5 w-3.5 text-amber-400" />
                                  <span>✨ Wish Granted! (Click to Relight Candles)</span>
                                </button>
                              )}
                            </div>

                            {/* Live Reaction Cannon Bar */}
                            <div className="pt-1 border-t border-white/10 flex items-center justify-center gap-1.5 flex-wrap">
                              <span className="text-[10px] text-muted-foreground mr-1">Reaction Blast:</span>
                              {["🥳", "🎂", "🎉", "💖", "🚀", "👑"].map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => spawnReaction(emoji)}
                                  className="h-7 w-7 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 hover:border-pink-500/40 text-sm flex items-center justify-center transition-all hover:scale-125 active:scale-95 cursor-pointer"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3 py-2">
                            <div className="flex items-center justify-center gap-3">
                              <span className={`text-3xl ${diyaLit ? "animate-flame drop-shadow-[0_0_15px_rgba(245,158,11,0.9)]" : "opacity-60"}`}>
                                🪔
                              </span>
                              <span className="text-2xl animate-pulse">✨</span>
                              <span className={`text-3xl ${diyaLit ? "animate-flame drop-shadow-[0_0_15px_rgba(245,158,11,0.9)]" : "opacity-60"}`}>
                                🪔
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setDiyaLit(!diyaLit);
                                if (!diyaLit) {
                                  fireFireworksConfetti();
                                  showCelebrationToast("🪔 Ceremonial flame & festival lanterns illuminated! ✨");
                                }
                              }}
                              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold transition-all active:scale-95 flex items-center gap-2 mx-auto cursor-pointer"
                            >
                              <FlameKindling className={`h-4 w-4 ${diyaLit ? "text-amber-300 animate-pulse" : "text-amber-400"}`} />
                              <span>{diyaLit ? "🪔 Ceremonial Light Glowing Luminous!" : "🪔 Click to Light Festive Diya & Lanterns"}</span>
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Custom AI Wish Content Preview */}
                      <p className="text-xs text-foreground/90 italic leading-relaxed text-center px-4">
                        "{customWish}"
                      </p>

                      {/* Interactive Unboxable Perk Preview */}
                      <div
                        onClick={() => {
                          setGiftUnboxed(!giftUnboxed);
                          if (!giftUnboxed) {
                            fireCelebrationConfetti();
                            showCelebrationToast("🎁 Perk Unboxed with Celebratory Confetti!");
                          }
                        }}
                        className="p-3 rounded-2xl bg-gradient-to-r from-amber-500/15 via-pink-500/10 to-amber-500/15 border border-amber-500/30 hover:border-amber-500/60 transition-all cursor-pointer group flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className={`text-2xl transition-transform duration-300 ${giftUnboxed ? "scale-125 rotate-12" : "group-hover:scale-110"}`}>
                            {giftUnboxed ? "🎉" : "🎁"}
                          </span>
                          <div className="text-left">
                            <span className="text-[10px] text-amber-400/80 font-bold uppercase tracking-wider block">
                              {giftUnboxed ? "Unlocked Celebrant Perk" : "Attached Digital Perk (Click to Unbox)"}
                            </span>
                            <span className="text-xs font-bold text-amber-200">
                              {DIGITAL_PERKS.find((p) => p.id === selectedPerk)?.title}
                            </span>
                          </div>
                        </div>

                        <Badge variant="outline" className="text-[9px] border-amber-500/40 text-amber-300 bg-amber-500/10">
                          {giftUnboxed ? "Unboxed ✓" : "Click to Open"}
                        </Badge>
                      </div>
                    </div>
                  </Interactive3DCard>
                </div>

                {/* Theme Selector */}
                <div className="space-y-2">
                  <label className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider block">
                    Card Visual Theme
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "gold", label: "👑 Royal Gold", color: "border-amber-500" },
                      { id: "cyber", label: "🌌 Cyber Neon", color: "border-cyan-500" },
                      { id: "confetti", label: "🎨 Confetti Party", color: "border-pink-500" },
                      { id: "pastel", label: "🌸 Pastel Spring", color: "border-emerald-500" },
                    ].map((theme) => (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => setCardTheme(theme.id as any)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          cardTheme === theme.id
                            ? `${theme.color} bg-white/10 font-bold text-foreground shadow-md`
                            : "border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {theme.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI Wish Generator Presets */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider flex items-center gap-1.5">
                      <Wand2 className="h-3.5 w-3.5 text-pink-400" />
                      AI Celebratory Wish Generator
                    </label>
                    <span className="text-[10px] text-muted-foreground">Select tone to re-generate</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {BIRTHDAY_AI_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setCustomWish(preset.wish)}
                        className="p-2 rounded-xl bg-card border border-border hover:border-pink-500/40 text-left transition-all group"
                      >
                        <span className="font-bold text-[11px] text-foreground group-hover:text-pink-300 block">
                          {preset.label}
                        </span>
                      </button>
                    ))}
                  </div>

                  <textarea
                    value={customWish}
                    onChange={(e) => setCustomWish(e.target.value)}
                    rows={3}
                    className="w-full p-3 rounded-xl border border-input bg-card text-xs text-foreground focus:outline-none resize-none"
                    placeholder="Custom greeting message..."
                  />
                </div>

                {/* Digital Perk Attachment */}
                <div className="space-y-2">
                  <label className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider block">
                    Select Digital Perk / Celebration Voucher
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {DIGITAL_PERKS.map((perk) => (
                      <button
                        key={perk.id}
                        type="button"
                        onClick={() => setSelectedPerk(perk.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex items-center gap-3 ${
                          selectedPerk === perk.id
                            ? "border-amber-500/60 bg-amber-500/10 text-foreground"
                            : "border-border bg-card/60 text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        <span className="text-xl shrink-0">{perk.icon}</span>
                        <div>
                          <span className="font-bold text-xs text-foreground block">{perk.title}</span>
                          <span className="text-[10px] text-muted-foreground">{perk.description}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/80">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedCelebrant(null);
                      setSelectedFestival(null);
                    }}
                    className="w-full sm:w-auto"
                  >
                    Cancel
                  </Button>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {selectedCelebrant && (
                      <Button
                        variant="brand"
                        size="sm"
                        onClick={handleNotifyCelebrantDirectly}
                        className="text-xs font-bold bg-gradient-to-r from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 text-white h-9 px-4 gap-1.5 flex-1 sm:flex-initial shadow-md"
                      >
                        <Send className="h-3.5 w-3.5" />
                        <span>Notify Celebrant Creatively</span>
                      </Button>
                    )}

                    <Button
                      variant="brand"
                      size="sm"
                      onClick={() => {
                        if (selectedCelebrant) handleBroadcastBirthdayToAll(selectedCelebrant);
                        if (selectedFestival) handleBroadcastFestivalToAll(selectedFestival);
                      }}
                      className="text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-black h-9 px-4 gap-1.5 flex-1 sm:flex-initial shadow-md"
                    >
                      <Megaphone className="h-3.5 w-3.5" />
                      <span>Broadcast to All 19 Staff</span>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* 5. LIVE PEER WISH WALL & COLLABORATION STREAM                  */}
      {/* ============================================================== */}
      <Interactive3DCard className="p-6 border border-border/80 space-y-4 bg-card/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-cyan-400" />
            <h4 className="text-sm font-bold text-foreground">
              Live Organization Peer Wish Wall & Shout-Outs
            </h4>
          </div>
          <span className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            Real-Time Sync Active
          </span>
        </div>

        {/* Display wishes from Today's celebrants or upcoming festivals */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {birthdays
            .filter((b) => b.peerWishes.length > 0)
            .map((b) => (
              <div key={b.id} className="p-4 rounded-xl bg-card/90 border border-border/80 space-y-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-7 w-7 rounded-lg bg-pink-500/20 text-pink-300 flex items-center justify-center text-xs font-bold">
                      {b.avatar}
                    </div>
                    <span className="font-bold text-xs text-foreground">
                      Wishes for {b.name} (Birthday)
                    </span>
                  </div>
                  <Badge variant="brand" className="text-[9px] bg-pink-500/15 text-pink-300 border-pink-500/30">
                    {b.peerWishes.length} Messages
                  </Badge>
                </div>

                <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                  {b.peerWishes.map((w) => (
                    <div key={w.id} className="p-2.5 rounded-lg bg-background/50 border border-border/60 text-xs space-y-0.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <strong className="text-foreground">{w.author} ({w.role})</strong>
                        <span className="text-muted-foreground">{w.time}</span>
                      </div>
                      <p className="text-muted-foreground italic text-[11px]">"{w.text}"</p>
                    </div>
                  ))}
                </div>

                {/* Quick Add Wish Form */}
                <div className="flex items-center gap-2 pt-1">
                  <Input
                    placeholder={`Write a warm wish for ${b.name}...`}
                    value={newPeerWishText[b.id] || ""}
                    onChange={(e) => setNewPeerWishText({ ...newPeerWishText, [b.id]: e.target.value })}
                    className="h-8 text-xs bg-background/60"
                  />
                  <Button
                    size="sm"
                    variant="brand"
                    onClick={() => handlePostPeerWish(b.id, "bday")}
                    className="h-8 px-3 text-xs bg-pink-500 hover:bg-pink-600 text-white font-bold"
                  >
                    Wish 🎉
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </Interactive3DCard>
    </div>
  );
}
