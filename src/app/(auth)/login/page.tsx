"use client";

import React, { useState, Suspense, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  KeyRound,
  AlertCircle,
  ArrowLeft,
  ShieldCheck,
  Mail,
  Lock,
  User,
  UserCheck,
  Sparkles,
  ArrowRight,
  Info,
} from "lucide-react";

const DEMO_PERSONAS = [
  // --- 1. EMPLOYEE PERSONAS ---
  {
    id: "emp-sarah",
    name: "Sarah Dev",
    email: "employee.test@xorstack.com",
    role: "EMPLOYEE" as const,
    title: "Senior Backend Engineer",
    department: "Development",
    badgeVariant: "brand" as const,
    description: "Daily SOD/EOD, deliverables, leaves & reviews",
  },
  {
    id: "emp-rohit",
    name: "Rohit Sharma",
    email: "rohit.sharma@xorstack.com",
    role: "EMPLOYEE" as const,
    title: "Frontend Engineer (UI/UX)",
    department: "Development",
    badgeVariant: "brand" as const,
    description: "UI Components, animations, leave requests & daily tasks",
  },
  {
    id: "emp-karthik",
    name: "Karthik Raja",
    email: "karthik.raja@xorstack.com",
    role: "EMPLOYEE" as const,
    title: "DevOps & Cloud Engineer",
    department: "Devops",
    badgeVariant: "brand" as const,
    description: "Cloud infrastructure, CI/CD telemetry & daily work",
  },
  {
    id: "emp-sneha",
    name: "Sneha Kapoor",
    email: "sneha.kapoor@xorstack.com",
    role: "EMPLOYEE" as const,
    title: "Data Analytics Engineer",
    department: "Data processing",
    badgeVariant: "brand" as const,
    description: "Data pipelines, telemetry aggregation & work execution",
  },
  {
    id: "emp-priya",
    name: "Priya QA",
    email: "priya.qa@xorstack.com",
    role: "EMPLOYEE" as const,
    title: "QA & Test Automation Lead Engineer",
    department: "R & D",
    badgeVariant: "brand" as const,
    description: "Test suites, Playwright regression & remote workdays",
  },
  {
    id: "emp-ananya",
    name: "Ananya Sen",
    email: "ananya.sen@xorstack.com",
    role: "EMPLOYEE" as const,
    title: "Automation & Embedded QA Engineer",
    department: "Service Providers (ConfigTap)",
    badgeVariant: "brand" as const,
    description: "Embedded QA, Matrix firmware & remote testing",
  },

  // --- 2. TEAM LEAD / MANAGER PERSONAS ---
  {
    id: "lead-alex",
    name: "Alex Lead",
    email: "lead.test@xorstack.com",
    role: "MANAGER" as const,
    title: "Engineering Lead · Development",
    department: "Development",
    badgeVariant: "secondary" as const,
    description: "Team presence, Stage-1 approvals & 1-5★ coaching",
  },
  {
    id: "lead-marcus",
    name: "Marcus Vance",
    email: "lead.devops@xorstack.com",
    role: "MANAGER" as const,
    title: "DevOps & SRE Practice Lead",
    department: "Devops",
    badgeVariant: "secondary" as const,
    description: "SRE practice oversight, on-call rotations & Stage-1 reviews",
  },
  {
    id: "lead-vikram",
    name: "Vikram Rao",
    email: "lead.data@xorstack.com",
    role: "MANAGER" as const,
    title: "Data Architecture & Analytics Lead",
    department: "Data processing",
    badgeVariant: "secondary" as const,
    description: "Data architecture, pipeline governance & Stage-1 sign-offs",
  },

  // --- 3. HR / PEOPLE OPS PERSONAS ---
  {
    id: "hr-rachel",
    name: "Rachel HR",
    email: "hr.test@xorstack.com",
    role: "HR" as const,
    title: "Head of People Operations",
    department: "Human Resources",
    badgeVariant: "outline" as const,
    description: "Headcount analytics, 12-employee roster, Stage-2 approvals & celebrations",
  },

  // --- 4. SUPERADMIN PERSONAS ---
  {
    id: "admin-david",
    name: "David Director",
    email: "director.test@xorstack.com",
    role: "ADMIN" as const,
    title: "VP of Engineering & SuperAdmin",
    department: "Executive",
    badgeVariant: "destructive" as const,
    description: "Root security control, biometric terminal sync, audit vault & system governance",
  },
];

const roleFramingMap: Record<
  string,
  {
    title: string;
    subtitle: string;
    badge: string;
    badgeVariant: "brand" | "secondary" | "outline" | "destructive";
  }
> = {
  employee: {
    title: "Signing in as Employee",
    subtitle: "Access your daily workplan, weekly goals, attendance & reviews.",
    badge: "Employee Role",
    badgeVariant: "brand",
  },
  manager: {
    title: "Signing in as Team Lead",
    subtitle: "Access team presence, review cycles, blocker SLA escalations & 1-on-1s.",
    badge: "Management Role",
    badgeVariant: "secondary",
  },
  lead: {
    title: "Signing in as Team Lead",
    subtitle: "Access team presence, review cycles, blocker SLA escalations & 1-on-1s.",
    badge: "Management Role",
    badgeVariant: "secondary",
  },
  hr: {
    title: "Signing in as People Operations / HR",
    subtitle: "Access organization broadcasts, headcount telemetry, probation & Stage-2 approvals.",
    badge: "People Ops Role",
    badgeVariant: "outline",
  },
  admin: {
    title: "Signing in as System Administrator",
    subtitle: "Access security controls, biometric terminal sync, audit vault & exports.",
    badge: "Security Admin Role",
    badgeVariant: "destructive",
  },
};

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role")?.toLowerCase() || "";
  const errorParam = searchParams.get("error");

  const [authMode, setAuthMode] = useState<"demo" | "password" | "signup">("demo");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [selectedRole, setSelectedRole] = useState("EMPLOYEE");

  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingPasskey, setLoadingPasskey] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (errorParam === "domain_restricted") {
      setErrorMsg("Access restricted: Only verified @xorstack.com accounts are permitted to sign in.");
    } else if (errorParam === "auth_callback_error") {
      setErrorMsg("Authentication session could not be established. Please try signing in again.");
    }
  }, [errorParam]);

  const framing = roleFramingMap[roleParam] || {
    title: "Sign in to WorkPulse",
    subtitle: "Corporate access portal for Xorstack Enterprise teams.",
    badge: "Enterprise SSO",
    badgeVariant: "brand" as const,
  };

  const handleDemoLogin = async (persona: typeof DEMO_PERSONAS[0]) => {
    try {
      setLoadingSubmit(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      const supabase = createClient();

      const defaultPassword = "WorkPulse2025!Demo";

      // Try signing in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: persona.email,
        password: defaultPassword,
      });

      if (signInError) {
        // If user doesn't exist yet, auto-provision the demo user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: persona.email,
          password: defaultPassword,
          options: {
            data: {
              full_name: persona.name,
              role: persona.role,
              department: persona.department,
              designation: persona.title,
            },
          },
        });

        if (signUpError) {
          throw new Error(signUpError.message);
        }

        if (signUpData.session) {
          router.push("/dashboard");
          router.refresh();
          return;
        } else {
          // If email confirmation is enabled in Supabase, sign in directly
          setSuccessMsg(`Account created for ${persona.name}. Logging in...`);
          router.push("/dashboard");
          router.refresh();
          return;
        }
      }

      const targetRoute =
        persona.role === "MANAGER"
          ? "/team"
          : persona.role === "HR" || persona.role === "ADMIN"
          ? "/hr"
          : "/dashboard";

      // Also set dev session cookie for complete SSR & API route compatibility
      try {
        await fetch("/api/auth/dev-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: persona.email, role: persona.role }),
        });
      } catch {
        // safe fallback
      }

      if (signInData?.session || true) {
        router.push(targetRoute);
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to sign in with demo persona.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handlePasswordSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }

    try {
      setLoadingSubmit(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      const supabase = createClient();

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) throw error;

      if (data.session) {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Invalid email or password.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !fullName) {
      setErrorMsg("Please complete all required fields.");
      return;
    }

    if (!email.endsWith("@xorstack.com")) {
      setErrorMsg("Please use your official @xorstack.com enterprise email.");
      return;
    }

    try {
      setLoadingSubmit(true);
      setErrorMsg(null);
      setSuccessMsg(null);
      const supabase = createClient();

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            role: selectedRole,
          },
        },
      });

      if (error) throw error;

      if (data.session) {
        setSuccessMsg("Account created successfully! Redirecting...");
        setTimeout(() => {
          router.push("/dashboard");
          router.refresh();
        }, 1000);
      } else {
        setSuccessMsg("Account registered! If confirmation is required, check your email, or sign in now.");
        setAuthMode("password");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create employee account.");
    } finally {
      setLoadingSubmit(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoadingGoogle(true);
      setErrorMsg(null);
      const supabase = createClient();

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/api/auth/callback`,
          queryParams: {
            hd: "xorstack.com",
            prompt: "select_account",
          },
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes("not enabled") || error.message.toLowerCase().includes("unsupported")) {
          throw new Error(
            "Google OAuth provider is not yet enabled in your Supabase Dashboard. You can log in instantly below using the Demo Personas or Email/Password tabs!"
          );
        }
        throw error;
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to initiate Google Workspace authentication.");
      setLoadingGoogle(false);
    }
  };

  const handlePasskeySignIn = async () => {
    try {
      setLoadingPasskey(true);
      setErrorMsg(null);
      const supabase = createClient();

      if (typeof window === "undefined" || !window.PublicKeyCredential) {
        throw new Error("WebAuthn / Passkeys are not supported on this browser or device.");
      }

      if ("signInWithPasskey" in supabase.auth && typeof (supabase.auth as any).signInWithPasskey === "function") {
        const { error } = await (supabase.auth as any).signInWithPasskey();
        if (error) throw error;
        router.push("/dashboard");
        router.refresh();
      } else {
        throw new Error("No hardware passkey registered yet for this device. Use Demo Persona or Password login to enroll your passkey in Settings.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Passkey verification failed or was cancelled.");
      setLoadingPasskey(false);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto w-full px-4 py-8">
      {/* Top Header Navigation */}
      <div className="w-full flex items-center justify-between mb-4">
        <Link
          href="/"
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Landing</span>
        </Link>
        <div className="flex items-center gap-2">
          {roleParam && (
            <Badge variant={framing.badgeVariant} className="text-[10px] uppercase font-bold tracking-wider">
              {framing.badge}
            </Badge>
          )}
          <ThemeToggle variant="toggle" size="sm" />
        </div>
      </div>

      {/* Official Centered Brand Mark */}
      <div className="mb-5 flex flex-col items-center">
        <BrandLogo size="lg" showCompany={true} withPulseAnimation={true} className="mb-1.5" />
        <div className="flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-[11px] font-bold tracking-wider text-cyan-300 uppercase">
            Internal Operations Portal
          </span>
        </div>
      </div>

      <Card className="w-full border border-border/80 bg-card/60 backdrop-blur-xl shadow-2xl">
        <CardHeader className="text-center pb-3">
          <CardTitle className="text-xl font-extrabold tracking-tight text-foreground">
            {framing.title}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {framing.subtitle}
          </CardDescription>

          {/* Navigation Tabs */}
          <div className="flex items-center justify-center gap-1 mt-3 p-1 bg-muted/50 rounded-lg border border-border/60">
            <button
              type="button"
              onClick={() => { setAuthMode("demo"); setErrorMsg(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                authMode === "demo"
                  ? "bg-brand-500 text-black shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Instant Personas</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode("password"); setErrorMsg(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                authMode === "password"
                  ? "bg-brand-500 text-black shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Lock className="h-3.5 w-3.5" />
              <span>Email Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode("signup"); setErrorMsg(null); }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                authMode === "signup"
                  ? "bg-brand-500 text-black shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <UserCheck className="h-3.5 w-3.5" />
              <span>Register</span>
            </button>
          </div>
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

          {/* TAB 1: INSTANT DEMO PERSONAS */}
          {authMode === "demo" && (() => {
            const visiblePersonas = DEMO_PERSONAS.filter((p) => {
              if (!roleParam) return true;
              if (roleParam === "employee") return p.role === "EMPLOYEE";
              if (roleParam === "manager" || roleParam === "lead") return p.role === "MANAGER";
              if (roleParam === "hr") return p.role === "HR";
              if (roleParam === "admin") return p.role === "ADMIN";
              return true;
            });

            return (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground px-0.5">
                  <span>
                    {roleParam
                      ? `Select a seeded ${roleParam === "manager" || roleParam === "lead" ? "Team Lead" : roleParam.toUpperCase()} profile:`
                      : "Select a seeded persona for 1-click login:"}
                  </span>
                  <span className="text-brand-400 font-medium">
                    {visiblePersonas.length} Available Profile{visiblePersonas.length > 1 ? "s" : ""}
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2.5 max-h-[380px] overflow-y-auto pr-1">
                  {visiblePersonas.map((p) => {
                    return (
                      <button
                        key={p.id}
                        type="button"
                        disabled={loadingSubmit}
                        onClick={() => handleDemoLogin(p)}
                        className="w-full p-3 rounded-xl border text-left transition-all duration-200 flex items-center justify-between group hover:border-brand-500/60 hover:bg-brand-500/5 border-border/70 bg-card/40"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-lg bg-secondary/80 flex items-center justify-center font-bold text-xs text-foreground group-hover:bg-brand-500 group-hover:text-black transition-colors">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-foreground group-hover:text-brand-300">
                                {p.name}
                              </span>
                              <Badge variant={p.badgeVariant} className="text-[9px] px-1.5 py-0">
                                {p.role}
                              </Badge>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              {p.title} · <span className="text-foreground/70">{p.email}</span>
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-brand-400 group-hover:translate-x-1 transition-all" />
                      </button>
                    );
                  })}
                </div>

                {/* Optional role-filter pills if user wants to switch role directly here */}
                {roleParam && (
                  <div className="pt-2 border-t border-border/50 flex items-center justify-between text-[11px]">
                    <span className="text-muted-foreground">Looking for another role?</span>
                    <div className="flex items-center gap-1.5">
                      <Link href="/login?role=employee" className={`px-2 py-0.5 rounded text-[10px] font-bold ${roleParam === "employee" ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30" : "text-muted-foreground hover:text-foreground"}`}>Employee</Link>
                      <Link href="/login?role=manager" className={`px-2 py-0.5 rounded text-[10px] font-bold ${roleParam === "manager" || roleParam === "lead" ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "text-muted-foreground hover:text-foreground"}`}>Team Lead</Link>
                      <Link href="/login?role=hr" className={`px-2 py-0.5 rounded text-[10px] font-bold ${roleParam === "hr" ? "bg-pink-500/20 text-pink-300 border border-pink-500/30" : "text-muted-foreground hover:text-foreground"}`}>HR</Link>
                      <Link href="/login?role=admin" className={`px-2 py-0.5 rounded text-[10px] font-bold ${roleParam === "admin" ? "bg-red-500/20 text-red-300 border border-red-500/30" : "text-muted-foreground hover:text-foreground"}`}>Admin</Link>
                    </div>
                  </div>
                )}

                <div className="p-2.5 rounded-lg bg-secondary/30 border border-border/40 text-[11px] text-muted-foreground flex items-center gap-2">
                  <Info className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <span>One-click login seamlessly creates session & profile directly in Supabase.</span>
                </div>
              </div>
            );
          })()}

          {/* TAB 2: EMAIL & PASSWORD SIGN IN */}
          {authMode === "password" && (
            <form onSubmit={handlePasswordSignIn} className="space-y-3.5">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">Corporate Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="sarah.dev@xorstack.com"
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
                  <Link href="/forgot-password" className="text-[10px] text-brand-400 hover:underline">
                    Forgot password?
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
                variant="brand"
                size="lg"
                className="w-full h-11 text-xs font-bold shadow-md hover:shadow-lg transition-all"
                disabled={loadingSubmit}
              >
                {loadingSubmit ? "Signing in..." : "Sign In with Email"}
              </Button>
            </form>
          )}

          {/* TAB 3: REGISTER NEW EMPLOYEE ACCOUNT */}
          {authMode === "signup" && (
            <form onSubmit={handleSignUp} className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Jane Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-9 h-9 text-xs bg-background/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Official Email (@xorstack.com)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="jane.doe@xorstack.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-9 text-xs bg-background/50"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Role Selection</Label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background/50 px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-brand-500"
                >
                  <option value="EMPLOYEE">Employee (Daily Tasks, Leaves, SOD/EOD)</option>
                  <option value="MANAGER">Team Lead / Manager (Team Reviews & Approvals)</option>
                  <option value="HR">People Ops / HR (Employee CRUD & Onboarding)</option>
                  <option value="ADMIN">System Administrator (Vault, Telemetry & Terminals)</option>
                </select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 h-9 text-xs bg-background/50"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="brand"
                size="lg"
                className="w-full h-11 text-xs font-bold shadow-md hover:shadow-lg transition-all mt-1"
                disabled={loadingSubmit}
              >
                {loadingSubmit ? "Creating Account..." : "Create Employee Account"}
              </Button>
            </form>
          )}

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/60" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or enterprise single sign-on</span>
            </div>
          </div>

          {/* Google Workspace SSO */}
          <Button
            id="google-signin-btn"
            variant="outline"
            size="lg"
            className="w-full h-11 text-xs font-bold flex items-center justify-center gap-2.5 border-border/80 hover:bg-accent transition-all duration-200"
            onClick={handleGoogleSignIn}
            disabled={loadingGoogle || loadingPasskey || loadingSubmit}
          >
            {loadingGoogle ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
                <span>Redirecting to Google...</span>
              </span>
            ) : (
              <>
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google (@xorstack.com)</span>
              </>
            )}
          </Button>

          {/* Passkey / WebAuthn */}
          <Button
            id="passkey-signin-btn"
            variant="ghost"
            size="sm"
            className="w-full text-[11px] text-muted-foreground hover:text-foreground flex items-center justify-center gap-2"
            onClick={handlePasskeySignIn}
            disabled={loadingGoogle || loadingPasskey || loadingSubmit}
          >
            <KeyRound className="h-3.5 w-3.5 text-cyan-400" />
            <span>Sign in with Hardware Passkey / WebAuthn</span>
          </Button>

          {/* Security & Organization Compliance Badge */}
          <div className="pt-3 border-t border-border/60 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span>Protected by Xorstack Security & Supabase Auth</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-xs text-muted-foreground text-center">Loading login portal...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}

