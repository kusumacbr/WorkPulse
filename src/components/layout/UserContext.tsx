"use client";

import React, { createContext, useContext } from "react";
import { RoleType } from "@/lib/authorization/types";

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
  userName: "Sarah Dev",
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
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useCurrentUser() {
  return useContext(UserContext);
}
