import { createClient } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { RoleType } from "../authorization/types";
import { WorkpulseSharedStore } from "../stores/workpulse-shared-store";

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  roles: RoleType[];
  primaryRole: RoleType;
  designation: string;
  department: string;
  team: string;
  avatarUrl?: string;
}

/**
 * Get the currently authenticated user from Supabase session.
 * Falls back to store-based resolution for employee details.
 */
export async function getCurrentUser(): Promise<CurrentUser> {
  const supabase = await createClient();
  const cookieStore = await cookies();
  const devEmail = cookieStore.get("workpulse_dev_email")?.value;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && !devEmail) {
    // No authenticated user — return a minimal fallback
    // (middleware should redirect to /login before this is reached)
    return {
      id: "anonymous",
      email: "",
      name: "Guest",
      roles: ["EMPLOYEE"],
      primaryRole: "EMPLOYEE",
      designation: "",
      department: "",
      team: "",
    };
  }

  // Try to look up profile for role information
  let role: RoleType = "EMPLOYEE";
  let profileName = user?.user_metadata?.full_name || user?.user_metadata?.name || "";
  let avatarUrl = user?.user_metadata?.avatar_url || "";

  if (user) {
    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, full_name, avatar_url, department, designation")
        .eq("id", user.id)
        .single();

      if (profile) {
        role = (profile.role as RoleType) || "EMPLOYEE";
        profileName = profile.full_name || profileName;
        avatarUrl = profile.avatar_url || avatarUrl;
      }
    } catch {
      // Profile table may not exist yet or query may fail — use defaults
      console.warn("[Auth] Could not load profile for user:", user.id);
    }
  }

  // Resolve employee details from shared store
  const allEmployees = WorkpulseSharedStore.getAllEmployees();
  const departments = WorkpulseSharedStore.getDepartments();

  const userEmailLower = (user?.email || devEmail || "").toLowerCase();

  // Determine role based on known personas or lead status
  const isLead =
    userEmailLower === "lead.test@xorstack.com" ||
    userEmailLower.includes("alex.lead") ||
    departments.some(
      (d) =>
        d.teamLead.email.toLowerCase() === userEmailLower ||
        (user && d.teamLead.id === user.id) ||
        (userEmailLower === "lead.test@xorstack.com" && d.teamLead.id === "lead-alex")
    );

  const isHR =
    userEmailLower === "hr.test@xorstack.com" ||
    userEmailLower === "director.test@xorstack.com" ||
    userEmailLower === "admin@xorstack.com" ||
    userEmailLower.includes("hr.rachel") ||
    role === "HR";

  const effectivePrimaryRole: RoleType = isHR
    ? "HR"
    : isLead || role === "MANAGER"
    ? "MANAGER"
    : "EMPLOYEE";

  const effectiveRoles: RoleType[] =
    effectivePrimaryRole === "HR"
      ? ["HR", "EMPLOYEE"]
      : effectivePrimaryRole === "MANAGER"
      ? ["MANAGER", "EMPLOYEE"]
      : ["EMPLOYEE"];

  const matchedEmployee = allEmployees.find(
    (e) => e.email.toLowerCase() === userEmailLower || (e.id === "lead-alex" && isLead)
  );

  if (matchedEmployee) {
    return {
      id: matchedEmployee.id,
      email: user?.email || matchedEmployee.email,
      name: matchedEmployee.name,
      roles: effectiveRoles,
      primaryRole: effectivePrimaryRole,
      designation: matchedEmployee.designation,
      department: matchedEmployee.departmentName,
      team: `${matchedEmployee.departmentName} Pod`,
      avatarUrl,
    };
  }

  // Check if user is a team lead
  const matchedLead = departments.find(
    (d) =>
      d.teamLead.email.toLowerCase() === userEmailLower ||
      (userEmailLower === "lead.test@xorstack.com" && d.teamLead.id === "lead-alex")
  );

  if (matchedLead) {
    return {
      id: matchedLead.teamLead.id,
      email: user?.email || matchedLead.teamLead.email,
      name: matchedLead.teamLead.name,
      roles: effectiveRoles,
      primaryRole: effectivePrimaryRole,
      designation: matchedLead.teamLead.designation,
      department: matchedLead.name,
      team: `${matchedLead.name} Pod`,
      avatarUrl,
    };
  }

  // Fallback: use Supabase user metadata
  return {
    id: user?.id || `dev-${userEmailLower.replace(/[^a-zA-Z0-9]/g, "-")}`,
    email: user?.email || userEmailLower || "",
    name: profileName || userEmailLower?.split("@")[0] || "User",
    roles: effectiveRoles,
    primaryRole: effectivePrimaryRole,
    designation: effectivePrimaryRole === "MANAGER" ? "Engineering Lead" : "",
    department: effectivePrimaryRole === "MANAGER" ? "Development" : "",
    team: effectivePrimaryRole === "MANAGER" ? "Platform Pod" : "",
    avatarUrl,
  };
}
