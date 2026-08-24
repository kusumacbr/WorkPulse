import { cookies } from "next/headers";
import { RoleType } from "../authorization/types";
import { SEEDED_TEST_ACCOUNTS } from "./dev-personas";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  roles: RoleType[];
  primaryRole: RoleType;
  designation: string;
  department: string;
  team: string;
}

export async function getCurrentUser(): Promise<CurrentUser> {
  const cookieStore = await cookies();
  const devPersonaEmail = cookieStore.get("workpulse_dev_persona")?.value;

  if (devPersonaEmail) {
    const persona = SEEDED_TEST_ACCOUNTS.find((p) => p.email === devPersonaEmail);
    if (persona) {
      if (persona.role === "EMPLOYEE") {
        return {
          id: "emp-sarah",
          email: persona.email,
          name: persona.name,
          roles: ["EMPLOYEE"],
          primaryRole: "EMPLOYEE",
          designation: persona.title,
          department: "Engineering",
          team: "Platform Core",
        };
      } else if (persona.role === "MANAGER") {
        return {
          id: "emp-alex",
          email: persona.email,
          name: persona.name,
          roles: ["MANAGER", "EMPLOYEE"],
          primaryRole: "MANAGER",
          designation: persona.title,
          department: "Engineering",
          team: "Platform Management",
        };
      } else if (persona.role === "HR") {
        return {
          id: "emp-rachel",
          email: persona.email,
          name: persona.name,
          roles: ["HR"],
          primaryRole: "HR",
          designation: persona.title,
          department: "Human Resources",
          team: "People Operations",
        };
      } else if (persona.role === "ADMIN") {
        return {
          id: "emp-david",
          email: persona.email,
          name: persona.name,
          roles: ["ADMIN"],
          primaryRole: "ADMIN",
          designation: persona.title,
          department: "Security & Operations",
          team: "Core Infrastructure",
        };
      }
    }
  }

  // Default fallback
  return {
    id: "emp-sarah",
    email: "employee.test@xorstack.com",
    name: "Sarah Dev",
    roles: ["EMPLOYEE"],
    primaryRole: "EMPLOYEE",
    designation: "Senior Backend Engineer",
    department: "Engineering",
    team: "Platform Core",
  };
}
