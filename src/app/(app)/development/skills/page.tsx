"use client";

import React, { useState } from "react";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  GraduationCap,
  Plus,
} from "lucide-react";

export default function SkillsDevelopmentPage() {
  const [skills, setSkills] = useState([
    {
      id: "skg-1",
      skillName: "Distributed Systems & Zero-Loss Ingest Pipeline",
      category: "BACKEND_ENGINEERING",
      currentLevel: "ADVANCED",
      targetLevel: "EXPERT",
      learningActivity: "Architected sha256 deduplication and edge heartbeat buffers for biometric hardware",
      certificationName: "AWS Certified Solutions Architect",
      targetDate: "October 31, 2026",
      status: "VERIFIED",
      verifiedBy: "Alex Lead",
    },
    {
      id: "skg-2",
      skillName: "Next.js App Router 15 Server Actions & Streaming",
      category: "FRONTEND_ENGINEERING",
      currentLevel: "INTERMEDIATE",
      targetLevel: "ADVANCED",
      learningActivity: "Building 3D interactive glassmorphic UI components with full responsive layouts",
      certificationName: "Meta Frontend Professional",
      targetDate: "September 30, 2026",
      status: "IN_PROGRESS",
      verifiedBy: "Pending",
    },
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const [newActivity, setNewActivity] = useState("");

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSkillName.trim()) {
      const newGoal = {
        id: `skg-${Date.now()}`,
        skillName: newSkillName,
        category: "ENGINEERING",
        currentLevel: "BEGINNER",
        targetLevel: "INTERMEDIATE",
        learningActivity: newActivity || "Self-paced sprint research and implementation",
        certificationName: "In-house Mastery",
        targetDate: "November 30, 2026",
        status: "IN_PROGRESS",
        verifiedBy: "Pending",
      };
      setSkills([newGoal, ...skills]);
      setShowAddModal(false);
      setNewSkillName("");
      setNewActivity("");
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        <Interactive3DCard className="p-6 md:p-8 border border-indigo-500/30 bg-gradient-to-r from-card/90 via-card/70 to-indigo-500/10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant="brand" className="bg-indigo-500/15 border-indigo-500/30 text-indigo-300 text-[10px] font-bold uppercase">
                  <GraduationCap className="h-3 w-3 mr-1 text-indigo-400" />
                  Engineering Competency & Career Growth
                </Badge>
                <span className="text-xs text-muted-foreground font-mono">Manager Verified</span>
              </div>
              <h2 className="text-2xl font-black text-foreground">Skill Development & Certifications</h2>
              <p className="text-xs text-muted-foreground">
                Set quarter skill growth goals, log evidence, and receive formal manager endorsement on technical proficiencies.
              </p>
            </div>

            <Button
              size="sm"
              variant="brand"
              onClick={() => setShowAddModal(true)}
              className="text-xs h-9 px-4 bg-indigo-500 hover:bg-indigo-600 text-white gap-1.5 shrink-0 shadow-lg"
            >
              <Plus className="h-4 w-4" />
              <span>Add Skill Goal</span>
            </Button>
          </div>
        </Interactive3DCard>

        {showAddModal && (
          <Interactive3DCard className="p-6 border border-indigo-500/40 bg-card/90 space-y-4 animate-in fade-in">
            <h3 className="text-sm font-bold text-foreground">Add New Skill Competency Goal</h3>
            <form onSubmit={handleAddSkill} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Skill Name</label>
                <Input
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="e.g. GraphQL Federation & Caching Architectures"
                  className="h-8 text-xs"
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-muted-foreground">Learning Activity / Deliverable Evidence</label>
                <Input
                  value={newActivity}
                  onChange={(e) => setNewActivity(e.target.value)}
                  placeholder="e.g. Completed module architecture design and team knowledge-sharing session"
                  className="h-8 text-xs"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setShowAddModal(false)} className="h-8 text-xs">
                  Cancel
                </Button>
                <Button type="submit" variant="brand" size="sm" className="h-8 text-xs bg-indigo-500 text-white">
                  Save Goal
                </Button>
              </div>
            </form>
          </Interactive3DCard>
        )}

        {/* Skills Cards Grid */}
        <div className="space-y-3">
          {skills.map((s) => (
            <Interactive3DCard key={s.id} className="p-5 border border-border/80 bg-card/60 space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-sm font-bold text-foreground">{s.skillName}</strong>
                    <Badge variant="outline" className="text-[9px] font-mono text-indigo-300 border-indigo-500/30">
                      {s.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.learningActivity}</p>
                </div>

                <Badge
                  variant={s.status === "VERIFIED" ? "brand" : "outline"}
                  className={`text-[10px] shrink-0 font-bold ${
                    s.status === "VERIFIED"
                      ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                      : "text-amber-300 border-amber-500/30"
                  }`}
                >
                  {s.status === "VERIFIED" ? "Verified by Manager" : "In Progress"}
                </Badge>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/40 text-[11px] font-mono text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span>Level: <strong className="text-foreground">{s.currentLevel}</strong> → <strong className="text-cyan-300">{s.targetLevel}</strong></span>
                </div>
                <span>Target: {s.targetDate}</span>
              </div>
            </Interactive3DCard>
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
