"use client";

import React, { useState, Suspense, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Mail,
  Lock,
  Shield,
  Sparkles,
} from "lucide-react";

// Standard demo credentials for fast evaluation (Employee, Team Lead, HR)
const QUICK_DEMO_ACCOUNTS = [
  {
    label: "Employee (Sara Dev)",
    email: "employee.test@xorstack.com",
    role: "Employee",
  },
  {
    label: "Team Lead (Alex Lead)",
    email: "lead.test@xorstack.com",
    role: "Team Lead",
  },
  {
    label: "HR & People (Rachel HR)",
    email: "hr.test@xorstack.com",
    role: "HR",
  },
];

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (errorParam === "domain_restricted") {
      setErrorMsg("Access restricted to authorized enterprise accounts.");
    } else if (errorParam === "auth_callback_error") {
      setErrorMsg("Authentication session expired. Please sign in again.");
    }
  }, [errorParam]);

  const handleSignIn = async (e?: React.FormEvent, overrideEmail?: string) => {
    if (e) e.preventDefault();
    const loginEmail = (overrideEmail || email).trim();
    const loginPassword = overrideEmail ? "WorkPulse2025!Demo" : password;

    if (!loginEmail || !loginPassword) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      const supabase = createClient();

      // 1. Authenticate with Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (error) {
        // If demo user is not yet provisioned in Supabase, provision seamlessly
        if (loginEmail.endsWith("@xorstack.com")) {
          const role = loginEmail.includes("hr") || loginEmail.includes("director") || loginEmail.includes("admin")
            ? "HR"
            : loginEmail.includes("lead")
            ? "MANAGER"
            : "EMPLOYEE";

          const fullName = loginEmail.includes("director")
            ? "David Director"
            : loginEmail.includes("hr")
            ? "Rachel HR"
            : loginEmail.includes("lead")
            ? "Alex Lead"
            : "Sarah Dev";

          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email: loginEmail,
            password: loginPassword,
            options: {
              data: {
                full_name: fullName,
                role: role,
              },
            },
          });
          if (signUpError && !signUpData?.session) {
            throw error;
          }
        } else {
          throw error;
        }
      }

      // 2. Set dev session cookie for complete SSR & API route compatibility
      const detectedRole = loginEmail.includes("hr") || loginEmail.includes("director") || loginEmail.includes("admin")
        ? "HR"
        : loginEmail.includes("lead")
        ? "MANAGER"
        : "EMPLOYEE";

      try {
        await fetch("/api/auth/dev-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: loginEmail, role: detectedRole }),
        });
      } catch {
        // safe fallback
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err?.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoSelect = (demo: typeof QUICK_DEMO_ACCOUNTS[0]) => {
    setEmail(demo.email);
    setPassword("WorkPulse2025!Demo");
    handleSignIn(undefined, demo.email);
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setErrorMsg(err?.message || "Google Workspace authentication not configured. Use email login.");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-md mx-auto w-full px-4 py-12">
      {/* Top Header Navigation */}
      <div className="w-full flex items-center justify-between mb-6">
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Home</span>
        </Link>
        <ThemeToggle variant="toggle" size="sm" />
      </div>

      {/* Brand Logo */}
      <div className="mb-6 flex flex-col items-center">
        <BrandLogo size="lg" className="mb-1" />
      </div>

      {/* Unified Login Card */}
      <Card className="w-full border border-border/80 bg-card/70 backdrop-blur-xl shadow-xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            Sign In
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Unified sign-in for all team members
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 p-6 pt-0">
          {errorMsg && (
            <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-start gap-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg flex items-start gap-2">
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{successMsg}</span>
            </div>
          )}

          {/* Unified Email & Password Form */}
          <form onSubmit={handleSignIn} className="space-y-3.5">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Corporate Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9 h-10 text-xs bg-background/50"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-muted-foreground">Password</Label>
                <Link href="/forgot-password" className="text-[10px] text-primary hover:underline">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 h-10 text-xs bg-background/50"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-10 text-xs font-bold shadow-md hover:shadow-lg transition-all"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Quick Demo Fill Options */}
          <div className="pt-3 border-t border-border/50 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-amber-400" />
                <span>Quick Demo Accounts:</span>
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_DEMO_ACCOUNTS.map((demo) => (
                <button
                  key={demo.email}
                  type="button"
                  onClick={() => handleQuickDemoSelect(demo)}
                  disabled={loading}
                  className="p-2 rounded-lg border border-border/70 bg-card/40 hover:bg-accent hover:border-primary/50 text-left transition-all text-[11px]"
                >
                  <span className="font-semibold text-foreground block truncate">{demo.role}</span>
                  <span className="text-[10px] text-muted-foreground block truncate">{demo.label.split(" ")[0]}</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-center text-muted-foreground pt-1">
              Typing password: <code className="font-mono font-bold text-foreground bg-muted px-1.5 py-0.5 rounded border border-border/70">WorkPulse2025!Demo</code>
            </p>
          </div>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or single sign-on</span>
            </div>
          </div>

          {/* Single Sign On */}
          <Button
            variant="outline"
            size="sm"
            className="w-full h-9 text-xs font-medium border-border/80 hover:bg-accent"
            onClick={handleGoogleSignIn}
            disabled={loading}
          >
            Google Workspace SSO
          </Button>
        </CardContent>
      </Card>

      {/* Security Note & Official Company Identity */}
      <div className="mt-4 flex flex-col items-center gap-2 text-center text-muted-foreground select-none">
        <div className="flex items-center gap-1.5 text-[11px]">
          <Shield className="h-3.5 w-3.5 text-cyan-400" />
          <span>Role privileges are resolved automatically upon sign-in</span>
        </div>

        <div className="flex items-center gap-2 text-xs pt-1 border-t border-border/40 text-muted-foreground/80">
          <Image
            src="/logo.png"
            alt="Xorstack"
            width={60}
            height={60}
            unoptimized
            className="h-4 w-auto object-contain shrink-0"
          />
          <span>Enterprise Portal · <strong>Xorstack</strong></span>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-xs text-muted-foreground">Loading portal...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
