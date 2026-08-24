"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme, Theme } from "./ThemeProvider";
import { Sun, Moon, Laptop, Check, Sparkles } from "lucide-react";

interface ThemeToggleProps {
  variant?: "toggle" | "dropdown" | "segmented";
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({
  variant = "toggle",
  size = "md",
  className = "",
  showLabel = false,
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [dropdownOpen]);

  const sizeClasses = {
    sm: "h-8 px-2.5 text-xs",
    md: "h-9 px-3 text-xs",
    lg: "h-10 px-4 text-sm",
  };

  const iconSizes = {
    sm: "h-3.5 w-3.5",
    md: "h-4 w-4",
    lg: "h-4.5 w-4.5",
  };

  // 1. Direct 1-Click Animated Toggle (Sun <-> Moon)
  if (variant === "toggle") {
    const isDark = resolvedTheme === "dark";
    return (
      <button
        type="button"
        id="theme-toggle-btn"
        onClick={toggleTheme}
        aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
        title={`Current: ${isDark ? "Dark" : "Light"} mode. Click to switch.`}
        className={`relative inline-flex items-center justify-center rounded-xl border border-border/80 bg-card/60 hover:bg-muted/80 backdrop-blur-md transition-all duration-300 group cursor-pointer shadow-sm hover:border-[var(--brand-primary)]/40 hover:shadow-[0_0_15px_rgba(208,172,100,0.2)] active:scale-95 ${sizeClasses[size]} ${className}`}
      >
        <div className="relative flex items-center justify-center">
          {/* Animated Sun Icon */}
          <Sun
            className={`${iconSizes[size]} text-amber-500 transition-all duration-300 transform ${
              isDark
                ? "rotate-90 scale-0 opacity-0 absolute"
                : "rotate-0 scale-100 opacity-100"
            }`}
          />
          {/* Animated Moon Icon */}
          <Moon
            className={`${iconSizes[size]} text-cyan-400 transition-all duration-300 transform ${
              isDark
                ? "rotate-0 scale-100 opacity-100"
                : "-rotate-90 scale-0 opacity-0 absolute"
            }`}
          />
        </div>
        {showLabel && (
          <span className="ml-2 font-semibold capitalize text-foreground">
            {isDark ? "Dark" : "Light"}
          </span>
        )}
      </button>
    );
  }

  // 2. 3-State Segmented Pill Control (Light | Dark | System)
  if (variant === "segmented") {
    const options: { id: Theme; label: string; icon: typeof Sun }[] = [
      { id: "light", label: "Light", icon: Sun },
      { id: "dark", label: "Dark", icon: Moon },
      { id: "system", label: "System", icon: Laptop },
    ];

    return (
      <div
        className={`inline-flex items-center p-1 rounded-xl bg-muted/40 border border-border/80 gap-0.5 shadow-inner ${className}`}
      >
        {options.map((opt) => {
          const Icon = opt.icon;
          const isActive = theme === opt.id;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setTheme(opt.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? "bg-card text-foreground shadow-sm border border-border/80 font-bold scale-[1.02]"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60 opacity-80 hover:opacity-100"
              }`}
              title={`Switch to ${opt.label} theme`}
            >
              <Icon
                className={`h-3.5 w-3.5 ${
                  opt.id === "light" && isActive
                    ? "text-amber-500"
                    : opt.id === "dark" && isActive
                    ? "text-cyan-400"
                    : opt.id === "system" && isActive
                    ? "text-purple-400"
                    : "text-muted-foreground"
                }`}
              />
              {showLabel && <span>{opt.label}</span>}
            </button>
          );
        })}
      </div>
    );
  }

  // 3. Dropdown Menu Mode (Toggle button that expands into Light, Dark, System choices)
  const currentIcon =
    theme === "light" ? (
      <Sun className={`${iconSizes[size]} text-amber-500`} />
    ) : theme === "dark" ? (
      <Moon className={`${iconSizes[size]} text-cyan-400`} />
    ) : (
      <Laptop className={`${iconSizes[size]} text-purple-400`} />
    );

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        id="theme-dropdown-btn"
        onClick={() => setDropdownOpen(!dropdownOpen)}
        aria-label="Theme settings"
        className={`relative inline-flex items-center justify-center rounded-xl border border-border/80 bg-card/60 hover:bg-muted/80 backdrop-blur-md transition-all duration-200 group cursor-pointer shadow-sm hover:border-[var(--brand-primary)]/40 hover:shadow-[0_0_15px_rgba(208,172,100,0.2)] ${sizeClasses[size]} ${className}`}
      >
        {currentIcon}
        {showLabel && (
          <span className="ml-2 font-semibold capitalize text-foreground">
            {theme}
          </span>
        )}
      </button>

      {dropdownOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-xl glass-panel border border-border shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 space-y-0.5">
          <div className="px-2 py-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-amber-400" />
            <span>Theme Preference</span>
          </div>

          <button
            type="button"
            onClick={() => {
              setTheme("light");
              setDropdownOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              theme === "light"
                ? "bg-amber-500/15 text-amber-500 font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-amber-500" />
              <span>Light Mode</span>
            </div>
            {theme === "light" && <Check className="h-3.5 w-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme("dark");
              setDropdownOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              theme === "dark"
                ? "bg-cyan-500/15 text-cyan-400 font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-cyan-400" />
              <span>Dark Mode</span>
            </div>
            {theme === "dark" && <Check className="h-3.5 w-3.5" />}
          </button>

          <button
            type="button"
            onClick={() => {
              setTheme("system");
              setDropdownOpen(false);
            }}
            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
              theme === "system"
                ? "bg-purple-500/15 text-purple-400 font-bold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Laptop className="h-4 w-4 text-purple-400" />
              <span>System Default</span>
            </div>
            {theme === "system" && <Check className="h-3.5 w-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
}
