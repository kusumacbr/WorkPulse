"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import { KeyRound, ArrowLeft, Mail, CheckCircle2, ShieldCheck } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="w-full max-w-md space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <BrandLogo size="lg" showCompany={true} withPulseAnimation={true} />
          </div>
          <p className="text-xs text-muted-foreground">Account Security & Access Recovery</p>
        </div>

        <Interactive3DCard className="p-8 border border-border/80 bg-card/70 backdrop-blur-xl shadow-2xl space-y-6">
          <div className="space-y-2">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-black text-foreground">Reset your password</h2>
            <p className="text-xs text-muted-foreground">
              Enter your official enterprise email address and we will dispatch secure credentials recovery instructions.
            </p>
          </div>

          {submitted ? (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-400 font-bold">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>Recovery Link Dispatched</span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                If an account exists for <strong className="text-foreground">{email}</strong>, you will receive a secure tokenized password reset link valid for 15 minutes.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSubmitted(false)}
                className="w-full text-xs h-8"
              >
                Send to different email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Official Email</label>
                <div className="relative">
                  <Mail className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="employee@xorstack.com"
                    className="pl-9 h-10 text-xs"
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="brand"
                className="w-full h-10 text-xs font-bold bg-gradient-to-r from-cyan-500 to-teal-600 text-white shadow-lg"
              >
                Dispatch Password Reset Link
              </Button>
            </form>
          )}

          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
            <Link
              href="/login"
              className="text-muted-foreground hover:text-foreground flex items-center gap-1 font-medium transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Login</span>
            </Link>
            <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-mono">
              <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" /> TLS 1.3
            </span>
          </div>
        </Interactive3DCard>
      </div>
    </div>
  );
}
