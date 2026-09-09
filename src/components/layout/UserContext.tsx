"use client";

import React, { createContext, useContext, useMemo } from "react";
import { RoleType } from "@/lib/authorization/types";
import { useWorkpulseSharedStore } from "@/lib/stores/workpulse-shared-store";

export interface UserContextValue {
  userName: string;
  userEmail: string;
  roles: RoleType[];
  primaryRole: RoleType;
  designation: string;
  department: string;
  team: string;
}

const UserContext = createContext<UserContextValue>({
  userName: "Sara Dev",
  userEmail: "employee.test@xorstack.com",
  roles: ["EMPLOYEE"],
  primaryRole: "EMPLOYEE",
  designation: "Senior Backend Engineer",
  department: "Engineering",
  team: "Platform Core",
});

export function UserProvider({
  user,
  children,
}: {
  user: UserContextValue;
  children: React.ReactNode;
}) {
  const { allEmployees, departments } = useWorkpulseSharedStore();
  const [tabEmail, setTabEmail] = React.useState<string>(user.userEmail || "");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("workpulse_session_email");
      if (!stored && user.userEmail) {
        sessionStorage.setItem("workpulse_session_email", user.userEmail);
      } else if (stored && stored !== tabEmail) {
        setTabEmail(stored);
      }
    }
  }, [user.userEmail, tabEmail]);

  // Sync dev session when tab gets focus so API requests from this tab match its persona
  React.useEffect(() => {
    const handleFocus = () => {
      if (typeof window !== "undefined") {
        const stored = sessionStorage.getItem("workpulse_session_email");
        if (stored && stored !== tabEmail) {
          setTabEmail(stored);
        }
      }
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [tabEmail]);

  const dynamicUser: UserContextValue = useMemo(() => {
    const activeEmail = (tabEmail || user.userEmail || "").toLowerCase();
    const activeName = (user.userName || "").toLowerCase();

    // 1. Direct email or ID match
    let matched = allEmployees.find(
      (e) =>
        e.email.toLowerCase() === activeEmail ||
        e.id === activeEmail ||
        (activeEmail === "employee.test@xorstack.com" && e.id === "emp-sarah") ||
        (activeEmail === "lead.test@xorstack.com" && e.id === "lead-alex")
    );

    // 2. Name match if still not found
    if (!matched) {
      matched = allEmployees.find(
        (e) => e.name.toLowerCase() === activeName
      );
    }

    // Strict role detection based on authenticated email and credentials mapping
    const isHR =
      activeEmail === "hr.test@xorstack.com" ||
      activeEmail === "rachel.hr@xorstack.com" ||
      activeEmail === "director.test@xorstack.com" ||
      activeEmail === "david.director@xorstack.com" ||
      activeEmail === "admin.test@xorstack.com" ||
      (user.primaryRole === "HR" && !activeEmail.includes("employee") && !activeEmail.includes("lead") && !activeEmail.includes("rohit") && !activeEmail.includes("sara"));

    const isLead =
      !isHR &&
      (activeEmail === "lead.test@xorstack.com" ||
        activeEmail === "alex.lead@xorstack.com" ||
        activeEmail === "lead.devops@xorstack.com" ||
        activeEmail === "marcus.vance@xorstack.com" ||
        activeEmail === "lead.data@xorstack.com" ||
        activeEmail === "vikram.rao@xorstack.com" ||
        (user.primaryRole === "MANAGER" && !activeEmail.includes("employee") && !activeEmail.includes("rohit") && !activeEmail.includes("sara")));

    const effectivePrimaryRole: RoleType = isHR
      ? "HR"
      : isLead
      ? "MANAGER"
      : "EMPLOYEE";

    const effectiveRoles: RoleType[] =
      effectivePrimaryRole === "HR"
        ? ["HR", "EMPLOYEE"]
        : effectivePrimaryRole === "MANAGER"
        ? ["MANAGER", "EMPLOYEE"]
        : ["EMPLOYEE"];

    if (matched) {
      return {
        ...user,
        userEmail: matched.email || activeEmail,
        userName: matched.name,
        roles: effectiveRoles,
        primaryRole: effectivePrimaryRole,
        designation: matched.designation,
        department: matched.departmentName,
        team: `${matched.departmentName} Team`,
      };
    }

    const matchedLead = departments.find(
      (d) =>
        d.teamLead.email.toLowerCase() === activeEmail ||
        d.teamLead.id === activeEmail ||
        (activeEmail === "lead.test@xorstack.com" && d.teamLead.id === "lead-alex")
    );
    if (matchedLead && isLead) {
      return {
        ...user,
        userEmail: matchedLead.teamLead.email || activeEmail,
        userName: matchedLead.teamLead.name,
        roles: effectiveRoles,
        primaryRole: effectivePrimaryRole,
        designation: matchedLead.teamLead.designation,
        department: matchedLead.name,
        team: `${matchedLead.name} Team`,
      };
    }

    return {
      ...user,
      userEmail: activeEmail || user.userEmail,
      roles: effectiveRoles,
      primaryRole: effectivePrimaryRole,
    };
  }, [tabEmail, user, allEmployees, departments]);

  return <UserContext.Provider value={dynamicUser}>{children}</UserContext.Provider>;
}

export function useCurrentUser() {
  return useContext(UserContext);
}
