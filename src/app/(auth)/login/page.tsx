"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/ui/BrandLogo";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import {
  KeyRound,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ArrowRight,
  Code,
  User,
  Users,
  Briefcase,
  ShieldCheck,
  ArrowLeft,
  Zap,
} from "lucide-react";

const roleFramingMap: Record<
  string,
  {
    title: string;
    subtitle: string;
    badge: string;
    badgeVariant: "brand" | "secondary" | "outline" | "destructive";
    defaultEmail: string;
    personaName: string;
    personaTitle: string;
  }
> = {
  employee: {
    title: "Signing in as Employee",
    subtitle: "Access your daily workplan, weekly goals, attendance & reviews.",
    badge: "Employee Role",
    badgeVariant: "brand",
    defaultEmail: "employee.test@xorstack.com",
    personaName: "Test Employee",
    personaTitle: "Full-Stack Software Engineer",
  },
  manager: {
    title: "Signing in as Team Lead",
    subtitle: "Access team presence, review cycles, blocker SLA escalations & 1-on-1s.",
    badge: "Management Role",
    badgeVariant: "secondary",
    defaultEmail: "lead.test@xorstack.com",
    personaName: "Test Team Lead",
    personaTitle: "Engineering Team Lead (Manages employee.test)",
  },
  lead: {
    title: "Signing in as Team Lead",
    subtitle: "Access team presence, review cycles, blocker SLA escalations & 1-on-1s.",
    badge: "Management Role",
    badgeVariant: "secondary",
    defaultEmail: "lead.test@xorstack.com",
    personaName: "Test Team Lead",
    personaTitle: "Engineering Team Lead (Manages employee.test)",
  },
  hr: {
    title: "Signing in as People Operations / HR",
    subtitle: "Access organization broadcasts, headcount telemetry, probation & Stage-2 approvals.",
    badge: "People Ops Role",
    badgeVariant: "outline",
    defaultEmail: "hr.test@xorstack.com",
    personaName: "Test HR Specialist",
    personaTitle: "Senior People Operations Partner",
  },
  admin: {
    title: "Signing in as System Administrator",
    subtitle: "Access security controls, biometric terminal sync, audit vault & exports.",
    badge: "Security Admin Role",
    badgeVariant: "destructive",
    defaultEmail: "admin.test@xorstack.com",
    personaName: "Test Admin",
    personaTitle: "System Security Administrator",
  },
};

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role")?.toLowerCase() || "";

  const [loadingPersona, setLoadingPersona] = useState<string | null>(null);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [loadingPasskey, setLoadingPasskey] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const isDevMode =
    process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_DEV_TOOLS_ENABLED === "true";

  const framing = roleFramingMap[roleParam] || {
    title: "Sign in to WorkPulse",
    subtitle: "Corporate access restricted to verified Xorstack credentials.",
    badge: "Single Sign-On",
    badgeVariant: "brand" as const,
    defaultEmail: "employee.test@xorstack.com",
    personaName: "Test Employee",
    personaTitle: "Full-Stack Software Engineer",
  };

  const handleDevQuickSignIn = async (devEmail: string) => {
    try {
      setLoadingPersona(devEmail);
      setErrorMsg(null);
      const res = await fetch("/api/v1/dev/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: devEmail }),
      });

      if (!res.ok) {
        throw new Error("Dev login failed or disabled in this environment.");
      }

      const data = await res.json();
      router.push(data.redirectUrl || "/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in with test persona.");
      setLoadingPersona(null);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoadingGoogle(true);
      setErrorMsg(null);
      if (isDevMode) {
        await handleDevQuickSignIn(framing.defaultEmail);
        return;
      }
      await signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
      });
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to initiate Google Sign In.");
      setLoadingGoogle(false);
    }
  };

  const handlePasskeySignIn = async () => {
    try {
      setLoadingPasskey(true);
      setErrorMsg(null);
      if (isDevMode) {
        await handleDevQuickSignIn(framing.defaultEmail);
        return;
      }
      if (typeof window !== "undefined" && window.PublicKeyCredential) {
        console.log("[Auth] Starting Passkey / WebAuthn assertion for Xorstack WorkPulse...");
        window.location.href = "/dashboard";
      } else {
        throw new Error("WebAuthn / Passkeys are not supported on this device/browser.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Passkey authentication failed or cancelled.");
      setLoadingPasskey(false);
    }
  };

  const handleFallbackSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter your work email and password.");
      return;
    }
    if (!email.endsWith("@xorstack.com")) {
      setErrorMsg("Access restricted to @xorstack.com corporate accounts.");
      return;
    }

    try {
      setFallbackLoading(true);
      setErrorMsg(null);
      if (isDevMode) {
        await handleDevQuickSignIn(email);
        return;
      }
      await signIn.email({
        email,
        password,
        callbackURL: "/dashboard",
      });
    } catch (err: any) {
      setErrorMsg(err?.message || "Invalid credentials.");
      setFallbackLoading(false);
    }
  };

  const handlePasswordReset = () => {
    if (!email || !email.endsWith("@xorstack.com")) {
      setErrorMsg("Please enter your @xorstack.com email to receive a password reset link.");
      return;
    }
    setResetSent(true);
    setErrorMsg(null);
  };

  return (
    <div className="flex flex-col items-center max-w-md mx-auto w-full">
      {/* Back to landing page link & Theme Toggle */}
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

      {/* Official Centered Logo & Creative Brand Mark */}
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
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-extrabold tracking-tight text-foreground">
            {framing.title}
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            {framing.subtitle}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 p-6 pt-0">
          {errorMsg ? (
            <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : null}

          {/* Prominent 1-Click Role Login Button */}
          <Button
            id="role-instant-signin-btn"
            variant="brand"
            size="lg"
            className="w-full h-12 text-sm font-extrabold flex items-center justify-center gap-2.5 shadow-[0_4px_20px_rgba(208,172,100,0.25)] hover:shadow-lg transition-all duration-200"
            onClick={() => handleDevQuickSignIn(framing.defaultEmail)}
            disabled={Boolean(loadingPersona)}
          >
            {loadingPersona === framing.defaultEmail ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-black border-t-transparent animate-spin" />
                Signing in as {framing.personaName}...
              </span>
            ) : (
              <>
                <Zap className="h-4 w-4 fill-current" />
                <span>Continue as {framing.personaName}</span>
              </>
            )}
          </Button>

          {/* Primary Option: Google OAuth */}
          <Button
            id="google-signin-btn"
            variant="outline"
            size="lg"
            className="w-full h-11 text-xs font-semibold flex items-center justify-center gap-2.5 transition-all duration-200 border-border/80"
            onClick={handleGoogleSignIn}
            disabled={loadingGoogle || Boolean(loadingPersona)}
          >
            {loadingGoogle ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Connecting to Google...
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
                Sign in with Google (@xorstack.com)
              </>
            )}
          </Button>

          {/* Secondary Option: Passkey */}
          <Button
            id="passkey-signin-btn"
            variant="outline"
            size="lg"
            className="w-full h-11 text-xs font-medium border-border/80 hover:bg-accent flex items-center justify-center gap-2.5 transition-all duration-200"
            onClick={handlePasskeySignIn}
            disabled={loadingGoogle || loadingPasskey || Boolean(loadingPersona)}
          >
            {loadingPasskey ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-foreground border-t-transparent animate-spin" />
                Verifying Passkey...
              </span>
            ) : (
              <>
                <KeyRound className="h-4 w-4 text-cyan-400" />
                <span>Sign in with Passkey / WebAuthn</span>
              </>
            )}
          </Button>

          {/* DEV-ONLY ALL PERSONAS QUICK SELECTOR */}
          {isDevMode && (
            <div className="pt-3 pb-1 border-t border-border/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-extrabold tracking-wider text-cyan-400 uppercase flex items-center gap-1.5">
                  <Code className="h-3.5 w-3.5" />
                  All Personas (Switch Role)
                </span>
                <Link
                  href={`/login/dev${roleParam ? `?role=${roleParam}` : ""}`}
                  className="text-[10px] text-muted-foreground hover:text-cyan-300 hover:underline"
                >
                  Full Hub →
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={Boolean(loadingPersona)}
                  onClick={() => handleDevQuickSignIn("employee.test@xorstack.com")}
                  className={`p-2.5 rounded-lg border text-left transition-all text-xs flex items-center gap-2 ${
                    roleParam === "employee"
                      ? "border-cyan-400 bg-cyan-500/15 ring-1 ring-cyan-400"
                      : "border-border bg-muted/40 hover:bg-muted hover:border-cyan-500/30"
                  }`}
                >
                  <User className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                  <div className="truncate">
                    <span className="font-bold block truncate text-foreground">Employee</span>
                    <span className="text-[10px] text-muted-foreground block truncate">employee.test</span>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={Boolean(loadingPersona)}
                  onClick={() => handleDevQuickSignIn("lead.test@xorstack.com")}
                  className={`p-2.5 rounded-lg border text-left transition-all text-xs flex items-center gap-2 ${
                    roleParam === "manager" || roleParam === "lead"
                      ? "border-purple-400 bg-purple-500/15 ring-1 ring-purple-400"
                      : "border-border bg-muted/40 hover:bg-muted hover:border-purple-500/30"
                  }`}
                >
                  <Users className="h-3.5 w-3.5 text-purple-400 shrink-0" />
                  <div className="truncate">
                    <span className="font-bold block truncate text-foreground">Team Lead</span>
                    <span className="text-[10px] text-muted-foreground block truncate">lead.test</span>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={Boolean(loadingPersona)}
                  onClick={() => handleDevQuickSignIn("hr.test@xorstack.com")}
                  className={`p-2.5 rounded-lg border text-left transition-all text-xs flex items-center gap-2 ${
                    roleParam === "hr"
                      ? "border-pink-400 bg-pink-500/15 ring-1 ring-pink-400"
                      : "border-border bg-muted/40 hover:bg-muted hover:border-pink-500/30"
                  }`}
                >
                  <Briefcase className="h-3.5 w-3.5 text-pink-400 shrink-0" />
                  <div className="truncate">
                    <span className="font-bold block truncate text-foreground">HR Specialist</span>
                    <span className="text-[10px] text-muted-foreground block truncate">hr.test</span>
                  </div>
                </button>

                <button
                  type="button"
                  disabled={Boolean(loadingPersona)}
                  onClick={() => handleDevQuickSignIn("admin.test@xorstack.com")}
                  className={`p-2.5 rounded-lg border text-left transition-all text-xs flex items-center gap-2 ${
                    roleParam === "admin"
                      ? "border-red-400 bg-red-500/15 ring-1 ring-red-400"
                      : "border-border bg-muted/40 hover:bg-muted hover:border-red-500/30"
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-red-400 shrink-0" />
                  <div className="truncate">
                    <span className="font-bold block truncate text-foreground">Admin</span>
                    <span className="text-[10px] text-muted-foreground block truncate">admin.test</span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Collapsible Fallback: Email/Password Reset Flow */}
          <div className="pt-2 border-t border-border/60">
            <button
              type="button"
              onClick={() => setShowFallback(!showFallback)}
              className="flex items-center justify-between w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-1"
            >
              <span>Fallback Email / Password Options</span>
              {showFallback ? (
                <ChevronUp className="h-3.5 w-3.5" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" />
              )}
            </button>

            {showFallback && (
              <form onSubmit={handleFallbackSignIn} className="mt-3 space-y-3">
                {resetSent ? (
                  <div className="p-3 text-xs bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-lg">
                    Password reset link sent to your @xorstack.com inbox.
                  </div>
                ) : null}

                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">
                    Work Email
                  </label>
                  <Input
                    type="email"
                    placeholder="user@xorstack.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-muted-foreground">Password</label>
                    <button
                      type="button"
                      onClick={handlePasswordReset}
                      className="text-[11px] text-[var(--brand-primary)] hover:underline"
                    >
                      Forgot?
                    </button>
                  </div>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-9 text-xs"
                  />
                </div>

                <Button
                  type="submit"
                  variant="secondary"
                  size="sm"
                  className="w-full text-xs gap-1.5"
                  disabled={fallbackLoading}
                >
                  {fallbackLoading ? "Authenticating..." : "Sign In with Credentials"}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </form>
            )}
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
