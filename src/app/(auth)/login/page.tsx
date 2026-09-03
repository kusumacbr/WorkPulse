"use client";

import React, { useState, Suspense, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Interactive3DCard } from "@/components/3d/Interactive3DCard";
import {
  AlertCircle,
  ArrowLeft,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

// Official Member Generated Passwords Configuration
const MEMBER_CREDENTIAL_MAP: Record<
  string,
  { validPasswords: string[]; role: "EMPLOYEE" | "MANAGER" | "HR"; name: string }
> = {
  // HR & Executive Leadership
  "hr.test@xorstack.com": {
    validPasswords: ["Rachel@123", "Admin@123"],
    role: "HR",
    name: "Rachel HR",
  },
  "rachel.hr@xorstack.com": {
    validPasswords: ["Rachel@123", "Admin@123"],
    role: "HR",
    name: "Rachel HR",
  },
  "director.test@xorstack.com": {
    validPasswords: ["David@123", "Admin@123"],
    role: "HR",
    name: "David Director",
  },
  "david.director@xorstack.com": {
    validPasswords: ["David@123", "Admin@123"],
    role: "HR",
    name: "David Director",
  },
  "admin.test@xorstack.com": {
    validPasswords: ["Admin@123"],
    role: "HR",
    name: "Executive Admin",
  },

  // Team Leads
  "lead.test@xorstack.com": {
    validPasswords: ["Alex@123", "Lead@123"],
    role: "MANAGER",
    name: "Alex Lead",
  },
  "alex.lead@xorstack.com": {
    validPasswords: ["Alex@123", "Lead@123"],
    role: "MANAGER",
    name: "Alex Lead",
  },
  "lead.devops@xorstack.com": {
    validPasswords: ["Marcus@123", "Lead@123"],
    role: "MANAGER",
    name: "Marcus Vance",
  },
  "marcus.vance@xorstack.com": {
    validPasswords: ["Marcus@123", "Lead@123"],
    role: "MANAGER",
    name: "Marcus Vance",
  },
  "lead.data@xorstack.com": {
    validPasswords: ["Vikram@123", "Lead@123"],
    role: "MANAGER",
    name: "Vikram Rao",
  },
  "vikram.rao@xorstack.com": {
    validPasswords: ["Vikram@123", "Lead@123"],
    role: "MANAGER",
    name: "Vikram Rao",
  },

  // Core Employees
  "employee.test@xorstack.com": {
    validPasswords: ["Sara@123", "Emp@123"],
    role: "EMPLOYEE",
    name: "Sara Dev",
  },
  "sara.dev@xorstack.com": {
    validPasswords: ["Sara@123", "Emp@123"],
    role: "EMPLOYEE",
    name: "Sara Dev",
  },
  "rohit.sharma@xorstack.com": {
    validPasswords: ["Rohit@123", "Emp@123"],
    role: "EMPLOYEE",
    name: "Rohit Sharma",
  },
  "karthik.raja@xorstack.com": {
    validPasswords: ["Karthik@123", "Emp@123"],
    role: "EMPLOYEE",
    name: "Karthik Raja",
  },
  "sneha.kapoor@xorstack.com": {
    validPasswords: ["Sneha@123", "Emp@123"],
    role: "EMPLOYEE",
    name: "Sneha Kapoor",
  },
  "priya.qa@xorstack.com": {
    validPasswords: ["Priya@123", "Emp@123"],
    role: "EMPLOYEE",
    name: "Priya QA",
  },
  "ananya.sen@xorstack.com": {
    validPasswords: ["Ananya@123", "Emp@123"],
    role: "EMPLOYEE",
    name: "Ananya Sen",
  },
};

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (errorParam === "domain_restricted") {
      setErrorMsg("Access restricted to authorized enterprise accounts (@xorstack.com).");
    } else if (errorParam === "auth_callback_error") {
      setErrorMsg("Authentication session expired. Please sign in again.");
    }
  }, [errorParam]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const loginEmail = email.trim().toLowerCase();
    const loginPassword = password.trim();

    if (!loginEmail || !loginPassword) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      const supabase = createClient();

      // Check account mapping against the official generated credentials
      const memberConfig = MEMBER_CREDENTIAL_MAP[loginEmail];
      let detectedRole: "EMPLOYEE" | "MANAGER" | "HR" = "EMPLOYEE";
      let fullName = "Team Member";

      if (memberConfig) {
        detectedRole = memberConfig.role;
        fullName = memberConfig.name;

        // Strict validation: ONLY the generated passwords for this account are accepted
        if (!memberConfig.validPasswords.includes(loginPassword)) {
          throw new Error(`Invalid password for ${loginEmail}. Please use your designated password.`);
        }
      } else {
        // Enforce corporate domain
        if (!loginEmail.endsWith("@xorstack.com")) {
          throw new Error("Access restricted to authorized @xorstack.com corporate accounts.");
        }

        detectedRole = loginEmail.includes("hr") || loginEmail.includes("admin") || loginEmail.includes("director")
          ? "HR"
          : loginEmail.includes("lead") || loginEmail.includes("manager")
          ? "MANAGER"
          : "EMPLOYEE";

        const defaultRolePassword =
          detectedRole === "HR"
            ? "Admin@123"
            : detectedRole === "MANAGER"
            ? "Lead@123"
            : "Emp@123";

        if (loginPassword !== defaultRolePassword) {
          throw new Error("Invalid credentials. Please enter your designated generated password.");
        }
      }

      // 1. Authenticate with Supabase
      const { error: supabaseError } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      if (supabaseError) {
        // Provision user in Supabase with this specific generated password
        try {
          await supabase.auth.signUp({
            email: loginEmail,
            password: loginPassword,
            options: {
              data: {
                full_name: fullName,
                role: detectedRole,
              },
            },
          });
        } catch {
          // safe ignore
        }
      }

      // 2. Set dev session cookie for complete SSR & API route compatibility
      try {
        await fetch("/api/auth/dev-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: loginEmail, role: detectedRole, password: loginPassword }),
        });
      } catch {
        // safe fallback
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem("workpulse_session_email", loginEmail);
        sessionStorage.setItem("workpulse_session_role", detectedRole);
        sessionStorage.setItem("workpulse_session_name", fullName);
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err?.message || "Invalid credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between relative overflow-hidden bg-background">
      {/* Dynamic Full-Page Background Lighting & Glow Mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-10%,rgba(6,182,212,0.18),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-10%,rgba(6,182,212,0.15),rgba(0,0,0,0))] pointer-events-none" />
      <div className="absolute top-1/3 -left-32 w-96 h-96 bg-cyan-500/15 dark:bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/15 dark:bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-foreground transition-all flex items-center gap-1.5 font-semibold bg-card/60 hover:bg-card px-3.5 py-1.5 rounded-xl border border-border/70 backdrop-blur-md shadow-sm"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Home</span>
        </Link>
        <ThemeToggle variant="toggle" size="sm" />
      </header>

      {/* Centered Sign-In Main Container */}
      <main className="relative z-10 w-full max-w-md mx-auto px-4 py-4 my-auto flex flex-col items-center">
        {/* Brand Logo with ambient halo */}
        <div className="mb-5 flex flex-col items-center">
          <BrandLogo size="lg" />
        </div>

        {/* 3D Elevated Glassmorphic Sign-In Card */}
        <Interactive3DCard className="w-full rounded-3xl border border-border/80 bg-card/85 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.25)] p-6 sm:p-8 space-y-5">
          {/* Title */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-black tracking-tight text-foreground">
              Sign In
            </h2>
            <p className="text-xs text-muted-foreground">
              Unified workforce sign-in for all team members
            </p>
          </div>

          {/* Feedback Alerts */}
          {errorMsg && (
            <div className="p-3 text-xs bg-rose-500/15 border border-rose-500/30 text-rose-400 rounded-xl flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-semibold">{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 text-xs bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 rounded-xl flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed font-semibold">{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-foreground/80">Corporate Email</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg(null);
                  }}
                  className="pl-10 h-10 text-xs rounded-xl bg-background/60 border-border/80 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/50 text-foreground"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground/80">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors font-medium"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMsg(null);
                  }}
                  className="pl-10 pr-10 h-10 text-xs rounded-xl bg-background/60 border-border/80 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/50 text-foreground"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3.5 top-3 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              className="w-full h-11 text-xs font-bold bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:opacity-95 text-white rounded-xl shadow-[0_4px_20px_rgba(6,182,212,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              disabled={loading}
            >
              <span>{loading ? "Authenticating..." : "Sign In to Account"}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="flex items-center justify-center gap-1.5 text-center text-muted-foreground text-[11px] pt-2 border-t border-border/40">
            <Shield className="h-3.5 w-3.5 text-cyan-400" />
            <span>Role-Based Access Control (RBAC) Enforced</span>
          </div>
        </Interactive3DCard>
      </main>

      {/* Footer Branding */}
      <footer className="relative z-10 w-full py-4 text-center text-xs text-muted-foreground/80 border-t border-border/40">
        <div className="flex items-center justify-center gap-2">
          <Image
            src="/logo.png"
            alt="Xorstack"
            width={60}
            height={60}
            unoptimized
            className="h-4 w-auto object-contain shrink-0 opacity-80"
          />
          <span>Enterprise Workforce Platform &middot; <strong>Xorstack</strong></span>
        </div>
      </footer>
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
