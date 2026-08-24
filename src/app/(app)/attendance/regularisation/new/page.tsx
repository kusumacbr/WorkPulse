"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Clock, CheckCircle2 } from "lucide-react";

export default function AttendanceRegularisationNewPage() {
  const [workDate, setWorkDate] = useState("2026-08-21");
  const [checkIn, setCheckIn] = useState("10:00");
  const [checkOut, setCheckOut] = useState("19:00");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reason.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <PageTransition>
      <div className="space-y-6 max-w-2xl mx-auto">
        <Link
          href="/attendance"
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Attendance Muster</span>
        </Link>

        <Interactive3DCard className="p-8 border border-sky-500/30 bg-card/70 backdrop-blur-xl space-y-6">
          <div className="space-y-2">
            <Badge variant="brand" className="bg-sky-500/15 border-sky-500/30 text-sky-300 text-[10px] font-bold uppercase">
              <Clock className="h-3 w-3 mr-1" />
              Attendance Regularisation (Section 6.3 Specification)
            </Badge>
            <h2 className="text-xl font-black text-foreground">Request Attendance Correction</h2>
            <p className="text-xs text-muted-foreground">
              Original hardware biometric punches remain completely immutable. A regularisation record is created with proposed times and reason for Lead/HR authorization.
            </p>
          </div>

          {submitted ? (
            <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3 text-xs">
              <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
              <strong className="text-foreground text-sm block">Correction Application Submitted</strong>
              <p className="text-muted-foreground">
                Your regularisation request for <strong>{workDate}</strong> has been forwarded to your Team Lead for Stage-1 approval.
              </p>
              <Link href="/attendance" className="block pt-2">
                <Button variant="brand" size="sm" className="text-xs h-8 px-4 bg-emerald-500 hover:bg-emerald-600 text-white">
                  Return to Attendance Logs
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Work Date</label>
                <Input
                  type="date"
                  value={workDate}
                  onChange={(e) => setWorkDate(e.target.value)}
                  className="h-9 text-xs"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Proposed Check-In</label>
                  <Input
                    type="time"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-muted-foreground">Proposed Check-Out</label>
                  <Input
                    type="time"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="h-9 text-xs"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold text-muted-foreground">Reason for Regularisation</label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. Device failure at entrance terminal / External client meeting at tech park"
                  className="w-full h-24 p-3 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-sky-500"
                  required
                />
              </div>

              <Button
                type="submit"
                variant="brand"
                className="w-full h-10 text-xs font-bold bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg"
              >
                Submit Regularisation for Review
              </Button>
            </form>
          )}
        </Interactive3DCard>
      </div>
    </PageTransition>
  );
}
