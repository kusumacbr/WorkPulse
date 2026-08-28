"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FeatureCardProps {
  title: string;
  badge: string;
  badgeVariant?: "brand" | "secondary" | "outline" | "destructive";
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
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-7, 7]), springConfig);

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
      className={`relative rounded-2xl p-6 text-left transition-all duration-300 backdrop-blur-xl border flex flex-col justify-between h-full select-none ${
        isHovered
          ? "border-cyan-500/50 shadow-[0_12px_40px_rgba(6,182,212,0.15)] bg-card/85"
          : "border-border/80 bg-card/60 shadow-md"
      }`}
    >
      {isHovered && !reducedMotion && (
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.12),transparent_70%)] pointer-events-none" />
      )}

      <div className="space-y-4 relative z-10">
        <div className="flex items-center justify-between">
          <div
            className="h-11 w-11 rounded-xl flex items-center justify-center border shadow-inner transition-transform group-hover:scale-105"
            style={{
              backgroundColor: `${accentColor}18`,
              borderColor: `${accentColor}40`,
              color: accentColor,
            }}
          >
            <Icon className="h-5 w-5" />
          </div>

          <Badge variant={badgeVariant} className="text-[10px] uppercase font-bold tracking-wider">
            {badge}
          </Badge>
        </div>

        <div>
          <h3 className="text-base font-bold text-foreground">
            {title}
          </h3>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            {description}
          </p>
        </div>

        {highlights && highlights.length > 0 && (
          <div className="space-y-1.5 pt-3 border-t border-border/60">
            {highlights.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-[11px] text-muted-foreground">
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
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
