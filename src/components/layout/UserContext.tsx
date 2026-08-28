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

  const dynamicUser: UserContextValue = useMemo(() => {
    const emailLower = (user.userEmail || "").toLowerCase();
    const nameLower = (user.userName || "").toLowerCase();

    // 1. Direct email or ID match
    let matched = allEmployees.find(
      (e) =>
        e.email.toLowerCase() === emailLower ||
        e.id === user.userEmail ||
        (emailLower === "employee.test@xorstack.com" && e.id === "emp-sarah")
    );

    // 2. Name match if still not found
    if (!matched) {
      matched = allEmployees.find(
        (e) => e.name.toLowerCase() === nameLower
      );
    }

    const isLead =
      emailLower === "lead.test@xorstack.com" ||
      emailLower.includes("alex.lead") ||
      nameLower.includes("alex lead") ||
      user.roles.includes("MANAGER") ||
      departments.some(
        (d) =>
          d.teamLead.email.toLowerCase() === emailLower ||
          (emailLower === "lead.test@xorstack.com" && d.teamLead.id === "lead-alex") ||
          d.teamLead.name.toLowerCase() === nameLower
      );

    const isHR =
      emailLower === "hr.test@xorstack.com" ||
      emailLower === "director.test@xorstack.com" ||
      emailLower.includes("admin") ||
      emailLower.includes("hr.rachel") ||
      nameLower.includes("rachel") ||
      user.roles.includes("HR");

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
        userName: matched.name,
        roles: effectiveRoles,
        primaryRole: effectivePrimaryRole,
        designation: matched.designation,
        department: matched.departmentName,
        team: `${matched.departmentName} Pod`,
      };
    }

    const matchedLead = departments.find(
      (d) =>
        d.teamLead.email.toLowerCase() === emailLower ||
        d.teamLead.id === user.userEmail ||
        (emailLower === "lead.test@xorstack.com" && d.teamLead.id === "lead-alex") ||
        d.teamLead.name.toLowerCase() === nameLower
    );
    if (matchedLead) {
      return {
        ...user,
        userName: matchedLead.teamLead.name,
        roles: effectiveRoles,
        primaryRole: effectivePrimaryRole,
        designation: matchedLead.teamLead.designation,
        department: matchedLead.name,
        team: `${matchedLead.name} Pod`,
      };
    }

    return {
      ...user,
      roles: effectiveRoles,
      primaryRole: effectivePrimaryRole,
    };
  }, [user, allEmployees, departments]);

  return <UserContext.Provider value={dynamicUser}>{children}</UserContext.Provider>;
}

export function useCurrentUser() {
  return useContext(UserContext);
}
