"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/components/layout/UserContext";
import { useWorkpulseSharedStore, sanitizePodToTeam } from "@/lib/stores/workpulse-shared-store";
import { PageTransition } from "@/components/animations/PageTransition";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Mail,
  Clock,
  CheckCircle2,
  Users,
  Phone,
  MessageSquarePlus,
  Send,
  X,
  Building,
  ArrowLeft,
  Briefcase,
  MapPin,
} from "lucide-react";

export default function ProfilePage() {
  const user = useCurrentUser();
  const router = useRouter();
  const { allEmployees, profileQueries, submitProfileQuery } = useWorkpulseSharedStore();

  const [previousRoute, setPreviousRoute] = useState<string | null>(null);
  const [showQueryModal, setShowQueryModal] = useState(false);
  const [queryCategory, setQueryCategory] = useState("Personal Contact Details (Phone, Mobile)");
  const [requestedChange, setRequestedChange] = useState("");
  const [queryReason, setQueryReason] = useState("");
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const fromParam = new URLSearchParams(window.location.search).get("from");
      const stored = sessionStorage.getItem("workpulse_last_active_route");
      const target = (fromParam && fromParam !== "/profile" && fromParam !== "/settings")
        ? fromParam
        : (stored && stored !== "/profile" && stored !== "/settings")
        ? stored
        : "/dashboard";
      setPreviousRoute(target);
    }
  }, []);

  const handleGoBack = () => {
    if (previousRoute) {
      router.push(previousRoute);
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      router.back();
    } else {
      router.push("/dashboard");
    }
  };

  const isHR =
    user.roles.includes("HR") ||
    user.primaryRole === "HR" ||
    user.userEmail.toLowerCase().includes("hr") ||
    user.userEmail.toLowerCase().includes("admin") ||
    user.userEmail.toLowerCase().includes("director");

  const isLead =
    user.roles.includes("MANAGER") ||
    user.primaryRole === "MANAGER" ||
    user.userEmail.toLowerCase().includes("lead");

  const matchedEmp = allEmployees.find(
    (e) =>
      e.email.toLowerCase() === user.userEmail.toLowerCase() ||
      e.name.toLowerCase() === user.userName.toLowerCase() ||
      (user.userEmail === "employee.test@xorstack.com" && e.id === "emp-sarah")
  );

  const myQueries = profileQueries.filter(
    (q) =>
      q.employeeEmail.toLowerCase() === user.userEmail.toLowerCase() ||
      q.employeeId === (matchedEmp?.id || "emp-sarah") ||
      q.employeeName.toLowerCase() === user.userName.toLowerCase()
  );

  const handleSubmitQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestedChange.trim()) return;

    const created = submitProfileQuery({
      employeeId: matchedEmp?.id || "emp-sarah",
      employeeName: user.userName || matchedEmp?.name || "Sarah Dev",
      employeeEmail: user.userEmail,
      departmentName: user.department || matchedEmp?.departmentName || "Development",
      category: queryCategory,
      requestedChange: requestedChange.trim(),
      reason: queryReason.trim() || "Profile update request.",
    });

    setShowQueryModal(false);
    setRequestedChange("");
    setQueryReason("");
    setToastMsg(`✓ Request #${created.ticketNumber} submitted to HR`);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const displayName = matchedEmp?.name || user.userName || (isHR ? "Rachel HR" : isLead ? "Alex Lead" : "Sarah Dev");
  const displayPhone = matchedEmp?.phoneNumber || "+91 98450 12345";
  const displayDept = matchedEmp?.departmentName || user.department || (isHR ? "HR & Operations" : isLead ? "Development" : "Development");
  const displayDesignation = matchedEmp?.designation || user.designation || (isHR ? "Head of HR" : isLead ? "Engineering Lead" : "Senior Backend Engineer");
  const displayLead = isHR
    ? "Leadership Team"
    : isLead
    ? "David Director (VP)"
    : matchedEmp?.teamLeadName || "Alex Lead (Manager)";
  const rawLocation = matchedEmp?.workLocation || matchedEmp?.location || (matchedEmp?.workMode === "WFH" ? "Remote (WFH)" : "Bangalore HQ (Floor 4, Team Bay B)");
  const displayLocation = sanitizePodToTeam(rawLocation);

  return (
    <PageTransition>
      <div className="space-y-5 max-w-3xl mx-auto">
        {/* Top Header: My Profile on Left, Back button on Right */}
        <div className="flex items-center justify-between gap-3 pt-1">
          <h1 className="text-xl font-bold text-foreground">My Profile</h1>

          <button
            type="button"
            onClick={handleGoBack}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-card border border-border/80 text-xs font-bold text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all shadow-sm group cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-1" />
            <span>Back</span>
          </button>
        </div>

        {/* Toast Notification */}
        {toastMsg && (
          <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in shadow-sm">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
            <span className="font-semibold">{toastMsg}</span>
          </div>
        )}

        {/* Main Profile Header Card */}
        <div className="p-4 sm:p-6 rounded-2xl border border-border/80 bg-card/70 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 sm:gap-4">
            <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white text-base sm:text-lg font-black shadow-md shrink-0">
              {displayName.slice(0, 2).toUpperCase()}
            </div>
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-lg sm:text-xl font-bold text-foreground truncate">{displayName}</h2>
                <Badge variant={isHR ? "purple" : isLead ? "cyan" : "brand"} className="text-[10px] font-bold">
                  {isHR ? "HR Operations" : isLead ? "Team Lead" : "Core Member"}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {displayDesignation} · {displayDept}
              </p>
            </div>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowQueryModal(true)}
            className="text-xs font-bold h-8.5 px-3.5 gap-1.5 rounded-xl border-primary/30 hover:bg-primary/10 text-primary cursor-pointer shrink-0 self-stretch sm:self-center justify-center"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            <span>Request Change</span>
          </Button>
        </div>

        {/* Simplified Info Grid */}
        <div className="p-4 sm:p-6 rounded-2xl border border-border/80 bg-card/50 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5 text-primary" />
            <span>Employment &amp; Contact Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                <Mail className="h-3 w-3 text-cyan-400" />
                Work Email
              </span>
              <p className="font-mono font-semibold text-foreground break-all">{user.userEmail}</p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                <Phone className="h-3 w-3 text-emerald-400" />
                Phone Number
              </span>
              <p className="font-mono font-semibold text-foreground">{displayPhone}</p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                <Building className="h-3 w-3 text-purple-400" />
                Department
              </span>
              <p className="font-semibold text-foreground">{displayDept}</p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                <Users className="h-3 w-3 text-indigo-400" />
                Reporting Lead
              </span>
              <p className="font-semibold text-foreground">{displayLead}</p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                <MapPin className="h-3 w-3 text-rose-400" />
                Work Location
              </span>
              <p className="font-semibold text-foreground">{displayLocation}</p>
            </div>

            <div className="space-y-1">
              <span className="text-muted-foreground text-[11px] flex items-center gap-1">
                <Clock className="h-3 w-3 text-amber-400" />
                Shift Hours
              </span>
              <p className="font-mono font-semibold text-foreground">10:00 AM – 07:00 PM (IST)</p>
            </div>
          </div>
        </div>

        {/* Change Requests Section (Compact) */}
        {myQueries.length > 0 && (
          <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-card/40 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                <span>Recent Change Requests ({myQueries.length})</span>
              </h3>
            </div>

            <div className="space-y-2">
              {myQueries.map((qry) => (
                <div
                  key={qry.id}
                  className="p-3 rounded-xl bg-card border border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono font-bold text-primary">{qry.ticketNumber}</span>
                      <span className="text-muted-foreground truncate">· {qry.category}</span>
                    </div>
                    <p className="text-foreground truncate font-medium">{qry.requestedChange}</p>
                  </div>

                  <Badge
                    variant={qry.status === "APPROVED" ? "success" : qry.status === "REJECTED" ? "destructive" : "cyan"}
                    className="text-[10px] font-bold shrink-0 self-start sm:self-center"
                  >
                    {qry.status === "APPROVED" ? "✓ Approved" : qry.status === "REJECTED" ? "Declined" : "Under Review"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal: Request Change */}
        {showQueryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-150">
            <div className="w-full max-w-md rounded-2xl bg-card border border-border/80 shadow-2xl p-4 sm:p-5 space-y-4 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-border/60">
                <h3 className="text-sm font-bold text-foreground">Request Profile Update</h3>
                <button
                  type="button"
                  onClick={() => setShowQueryModal(false)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitQuery} className="space-y-3 text-xs">
                <div>
                  <label className="text-foreground font-semibold block mb-1">Category</label>
                  <select
                    value={queryCategory}
                    onChange={(e) => setQueryCategory(e.target.value)}
                    className="w-full h-9 sm:h-8.5 px-2.5 rounded-xl border border-border bg-background text-foreground text-xs font-medium focus:outline-none focus:border-primary"
                  >
                    <option value="Personal Contact Details (Phone, Mobile)">Phone / Contact Details</option>
                    <option value="Emergency Contact Information">Emergency Contact</option>
                    <option value="Department / Designation Correction">Designation / Role</option>
                    <option value="Shift Timing / Work Location Query">Location / Shift</option>
                    <option value="Other HR Profile Query">Other</option>
                  </select>
                </div>

                <div>
                  <label className="text-foreground font-semibold block mb-1">
                    Requested Details <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={requestedChange}
                    onChange={(e) => setRequestedChange(e.target.value)}
                    placeholder="e.g. Update phone to +91 98450 12345"
                    className="h-9 sm:h-8.5 text-xs"
                    required
                  />
                </div>

                <div>
                  <label className="text-foreground font-semibold block mb-1">Reason (Optional)</label>
                  <Input
                    value={queryReason}
                    onChange={(e) => setQueryReason(e.target.value)}
                    placeholder="Brief reason for update"
                    className="h-9 sm:h-8.5 text-xs"
                  />
                </div>

                <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowQueryModal(false)}
                    className="text-xs h-9 sm:h-8 px-3"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="brand"
                    size="sm"
                    className="text-xs h-9 sm:h-8 px-3.5 font-bold gap-1 rounded-xl"
                  >
                    <Send className="h-3 w-3" />
                    <span>Submit</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
