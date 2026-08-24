"use client";

import React, { useState, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Code,
  User,
  ShieldCheck,
  Briefcase,
  Users,
  ArrowRight,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";

const testPersonas = [
  {
    roleSlug: "employee",
    email: "employee.test@xorstack.com",
    name: "Test Employee",
    role: "EMPLOYEE",
    title: "Full-Stack Software Engineer",
    badgeColor: "brand",
    icon: User,
    description: "Has 2 days of workday/task history, an active weekly goal, and 1 pending leave request.",
  },
  {
    roleSlug: "manager",
    email: "lead.test@xorstack.com",
    name: "Test Team Lead",
    role: "MANAGER",
    title: "Engineering Team Lead (Manages employee.test)",
    badgeColor: "secondary",
    icon: Users,
    description: "Has direct report assignment for employee.test to approve leave and conduct reviews.",
  },
  {
    roleSlug: "hr",
    email: "hr.test@xorstack.com",
    name: "Test HR Specialist",
    role: "HR",
    title: "Senior People Operations Partner",
    badgeColor: "outline",
    icon: Briefcase,
    description: "Full HR command scope: Stage-2 leave sign-offs, announcements, probation & PIP pipeline.",
  },
  {
    roleSlug: "admin",
    email: "admin.test@xorstack.com",
    name: "Test Admin",
    role: "ADMIN",
    title: "System Security Administrator",
    badgeColor: "destructive",
    icon: ShieldCheck,
    description: "Full system administration: Biometric device provisioning, quarantine resolution & audit logs.",
  },
];

function DevLoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role")?.toLowerCase() || "";

  const [loadingEmail, setLoadingEmail] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const isDevMode =
    process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_DEV_TOOLS_ENABLED === "true";

  if (!isDevMode) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full text-center p-6 border-destructive/30">
          <CardHeader>
            <AlertTriangle className="h-8 w-8 text-destructive mx-auto mb-2" />
            <CardTitle>Development Tools Disabled</CardTitle>
            <CardDescription>
              Dev personas and instant test sign-in are strictly disabled in production builds.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/login">
              <Button variant="default" size="sm" className="w-full">
                Go to Standard Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleDevLogin = async (email: string) => {
    try {
      setLoadingEmail(email);
      setErrorMsg(null);

      const res = await fetch("/api/v1/dev/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error("Failed to switch dev persona or dev tools disabled in this environment.");
      }

      const data = await res.json();
      router.push(data.redirectUrl || "/dashboard");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to sign in with dev test account.");
      setLoadingEmail(null);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto w-full">
      <div className="w-full flex items-center justify-between mb-4">
        <Link
          href={roleParam ? `/login?role=${roleParam}` : "/login"}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 font-medium"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Standard Login</span>
        </Link>
      </div>

      {/* Official Centered Logo (Optimized Proportion) */}
      <div className="mb-5 flex flex-col items-center">
        <div className="relative h-8 w-28 mb-1.5 flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Xorstack Logo"
            width={112}
            height={32}
            priority
            className="object-contain"
          />
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="brand" className="text-[10px] font-mono uppercase">
            <Code className="h-3 w-3 mr-1" />
            Dev-Only Persona Switcher
          </Badge>
        </div>
      </div>

      <Card className="w-full border-border bg-card/60 backdrop-blur-md shadow-xl">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-xl font-bold tracking-tight text-foreground">
            WorkPulse Test Personas
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground max-w-lg mx-auto">
            1-Click instant sign in as any of the 4 seeded test accounts to test approval hierarchies, reviews, heatmaps, and admin controls.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 p-6 pt-0">
          {errorMsg ? (
            <div className="p-3 text-xs bg-destructive/10 border border-destructive/20 text-destructive rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testPersonas.map((persona) => {
              const Icon = persona.icon;
              const isHighlighted = roleParam && persona.roleSlug === roleParam;

              return (
                <Card
                  key={persona.email}
                  className={`border transition-all duration-200 ${
                    isHighlighted
                      ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/10 ring-2 ring-[var(--brand-primary)] shadow-md"
                      : "border-border/70 hover:border-border hover:bg-muted/40"
                  }`}
                >
                  <CardHeader className="p-4 pb-2 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-foreground shrink-0 border border-border/80">
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <CardTitle className="text-sm font-bold text-foreground leading-tight">
                            {persona.name}
                          </CardTitle>
                          <span className="text-[11px] font-mono text-muted-foreground block">
                            {persona.email}
                          </span>
                        </div>
                      </div>
                      <Badge variant={persona.badgeColor as any} className="text-[9px] uppercase font-bold">
                        {persona.role}
                      </Badge>
                    </div>

                    <p className="text-[11px] font-medium text-foreground/80">
                      {persona.title}
                    </p>
                  </CardHeader>

                  <CardContent className="p-4 pt-0 space-y-3">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {persona.description}
                    </p>

                    <Button
                      variant={isHighlighted ? "brand" : "default"}
                      size="sm"
                      className="w-full text-xs font-semibold gap-1.5 h-8"
                      disabled={Boolean(loadingEmail)}
                      onClick={() => handleDevLogin(persona.email)}
                    >
                      {loadingEmail === persona.email ? (
                        <span className="flex items-center gap-2">
                          <span className="h-3.5 w-3.5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                          Signing In...
                        </span>
                      ) : (
                        <>
                          <span>Sign In as {persona.name.split(" ")[1]}</span>
                          <ArrowRight className="h-3 w-3" />
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function DevLoginPage() {
  return (
    <Suspense fallback={<div className="text-xs text-muted-foreground text-center">Loading dev test accounts...</div>}>
      <DevLoginPageContent />
    </Suspense>
  );
}
