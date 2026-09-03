"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { LucideIcon, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RoleCard3DProps {
  roleSlug: "employee" | "manager" | "hr" | "admin";
  roleName: string;
  roleBadge: string;
  badgeVariant?: "brand" | "secondary" | "outline" | "destructive";
  icon: LucideIcon;
  description: string;
  highlights: string[];
}

export function RoleCard3D({
  roleSlug,
  roleName,
  roleBadge,
  badgeVariant = "brand",
  icon: Icon,
  description,
  highlights,
}: RoleCard3DProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => {
      router.push(`/login?role=${roleSlug}`);
    }, 180);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      className={`relative rounded-2xl p-6 text-left cursor-pointer transition-all duration-200 border flex flex-col justify-between h-full group select-none ${
        isHovered
          ? "border-primary shadow-md bg-card"
          : "border-border/80 bg-card/90 shadow-sm"
      } ${isClicked ? "ring-2 ring-primary scale-95" : ""}`}
    >
      <div className="space-y-4 relative z-10">
        {/* Header Icon + Role Badge */}
        <div className="flex items-center justify-between">
          <div className="h-12 w-12 rounded-xl bg-[var(--brand-primary)]/15 border border-[var(--brand-primary)]/30 flex items-center justify-center text-[var(--brand-primary)] shadow-inner transition-transform group-hover:scale-110">
            <Icon className="h-6 w-6" />
          </div>

          <Badge variant={badgeVariant} className="text-[10px] uppercase font-bold tracking-wider">
            {roleBadge}
          </Badge>
        </div>

        {/* Role Title & Description */}
        <div>
          <h3 className="text-base font-bold text-foreground group-hover:text-[var(--brand-primary)] transition-colors">
            {roleName}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Feature Highlights */}
        <div className="space-y-1.5 pt-2 border-t border-border/60">
          {highlights.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="h-1 w-1 rounded-full bg-[var(--brand-primary)] shrink-0" />
              <span className="truncate">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Button */}
      <div className="pt-5 mt-4 border-t border-border/50 flex items-center justify-between text-xs font-bold text-[var(--brand-primary)] relative z-10">
        <span>Continue as {roleName}</span>
        <div className="h-7 w-7 rounded-full bg-[var(--brand-primary)]/10 flex items-center justify-center group-hover:bg-[var(--brand-primary)] group-hover:text-black transition-all">
          <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
        </div>
      </div>
    </div>
  );
}
