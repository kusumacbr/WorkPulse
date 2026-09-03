"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FeatureCardProps {
  title: string;
  badge: string;
  badgeVariant?: "brand" | "secondary" | "outline" | "destructive" | "cyan" | "emerald" | "amber" | "purple";
  icon: LucideIcon;
  description: string;
  highlights?: string[];
  accentColor?: string;
}

export function FeatureCard({
  title,
  badge,
  badgeVariant = "brand",
  icon: Icon,
  description,
  highlights,
  accentColor = "var(--brand-primary)",
}: FeatureCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setReducedMotion(mediaQuery.matches);
    }
  }, []);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-6, 6]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (reducedMotion || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const xPct = (e.clientX - rect.left) / width - 0.5;
    const yPct = (e.clientY - rect.top) / height - 0.5;
    mouseX.set(xPct);
    mouseY.set(yPct);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX: reducedMotion ? 0 : rotateX,
        rotateY: reducedMotion ? 0 : rotateY,
        transformStyle: "preserve-3d",
      }}
      whileHover={reducedMotion ? {} : { scale: 1.02 }}
      className={`relative rounded-3xl p-6 sm:p-7 text-left transition-all duration-200 border flex flex-col justify-between h-full select-none ${
        isHovered
          ? "border-cyan-500/50 shadow-lg bg-card/90"
          : "border-border/80 bg-card/65 shadow-md"
      }`}
    >
      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <div
            className="h-12 w-12 rounded-2xl flex items-center justify-center border shadow-sm transition-transform group-hover:scale-110"
            style={{
              backgroundColor: `${accentColor}18`,
              borderColor: `${accentColor}40`,
              color: accentColor,
            }}
          >
            <Icon className="h-6 w-6" />
          </div>

          <Badge variant={badgeVariant} className="text-[10px] font-bold px-3 py-1 rounded-full">
            {badge}
          </Badge>
        </div>

        <div>
          <h3 className="text-base sm:text-lg font-black text-foreground tracking-tight">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1.5 leading-relaxed">
            {description}
          </p>
        </div>

        {highlights && highlights.length > 0 && (
          <div className="space-y-2 pt-3.5 border-t border-border/60">
            {highlights.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs text-muted-foreground font-medium">
                <span
                  className="h-2 w-2 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: accentColor }}
                />
                <span className="truncate">{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

