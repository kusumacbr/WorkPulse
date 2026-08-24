export const SEEDED_TEST_ACCOUNTS = [
  {
    email: "employee.test@xorstack.com",
    name: "Test Employee",
    role: "EMPLOYEE",
    title: "Full-Stack Software Engineer",
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  },
  {
    email: "lead.test@xorstack.com",
    name: "Test Team Lead",
    role: "MANAGER",
    title: "Engineering Team Lead (Manages employee.test)",
    badgeColor: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  },
  {
    email: "hr.test@xorstack.com",
    name: "Test HR Specialist",
    role: "HR",
    title: "Senior People Operations Partner",
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  },
  {
    email: "admin.test@xorstack.com",
    name: "Test Admin",
    role: "ADMIN",
    title: "System Security Administrator",
    badgeColor: "bg-red-500/10 text-red-600 border-red-500/30",
  },
] as const;
