"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/button";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { MailCheck, ArrowRight, ShieldCheck } from "lucide-react";

export default function VerifyEmailPage() {
  const [verified, setVerified] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <BrandLogo size="lg" />
          </div>
          <p className="text-xs text-muted-foreground">Corporate Identity & Verification</p>
        </div>

        <Interactive3DCard className="p-8 border border-border/80 bg-card/70 backdrop-blur-xl shadow-2xl space-y-6 text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <MailCheck className="h-6 w-6" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-foreground">
              {verified ? "Email Verified Successfully!" : "Verify your official email"}
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {verified
                ? "Your corporate credentials and enterprise access keys have been authenticated."
                : "We have dispatched a secure cryptographic confirmation token to your registered email."}
            </p>
          </div>

          {verified ? (
            <Link href="/dashboard" className="block pt-2">
              <Button
                variant="brand"
                className="w-full h-10 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg gap-2"
              >
                <span>Continue to WorkPulse Dashboard</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <div className="space-y-3 pt-2">
              <Button
                onClick={() => setVerified(true)}
                variant="brand"
                className="w-full h-10 text-xs font-bold bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-lg"
              >
                Confirm Verification Token
              </Button>
              <Link href="/login" className="block">
                <Button variant="outline" className="w-full text-xs h-9">
                  Back to Sign In
                </Button>
              </Link>
            </div>
          )}

          <div className="pt-3 border-t border-border/60 flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground font-mono">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Zero-Trust Enterprise IAM</span>
          </div>
        </Interactive3DCard>
      </div>
    </div>
  );
}
