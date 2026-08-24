import { PrismaClient, RoleType, EmployeeStatus, WorkLocation, AssignmentStatus, WorkMode, WorkdayStatus, TaskPriority, TaskType, TaskStatus, GoalPriority, GoalStatus, LeaveType, LeaveStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("[Seed] Starting database seeding for WorkPulse (Xorstack)...");

  // 1. Seed Roles
  console.log("[Seed] Seeding RBAC roles...");
  const roles: { name: RoleType; description: string }[] = [
    {
      name: "EMPLOYEE",
      description: "Employee role: personal profile, daily plan, tasks, goals, leave, reviews",
    },
    {
      name: "MANAGER",
      description: "Team Lead / Manager role: team oversight, blocker resolution, reviews, direct reports",
    },
    {
      name: "HR",
      description: "People Operations / HR role: company-wide oversight, probation, PIP, attendance, announcements",
    },
    {
      name: "ADMIN",
      description: "System Administrator: full organization configuration, roles, teams, audit logs, emergency overrides",
    },
  ];

  const roleMap = new Map<RoleType, string>();
  for (const r of roles) {
    const role = await prisma.role.upsert({
      where: { name: r.name },
      update: { description: r.description },
      create: { name: r.name, description: r.description },
    });
    roleMap.set(r.name, role.id);
  }

  // 2. Seed Organization
  console.log("[Seed] Seeding Organization...");
  const organization = await prisma.organization.upsert({
    where: { slug: "xorstack" },
    update: { name: "Xorstack", domain: "xorstack.com", logoUrl: "/logo.png" },
    create: {
      name: "Xorstack",
      slug: "xorstack",
      domain: "xorstack.com",
      logoUrl: "/logo.png",
    },
  });

  // 3. Seed Departments
  console.log("[Seed] Seeding Departments...");
  const departmentsData = [
    { name: "Engineering", code: "ENG" },
    { name: "Product & Design", code: "PROD" },
    { name: "People Operations", code: "HR" },
    { name: "Operations & Support", code: "OPS" },
  ];

  const departmentMap = new Map<string, string>();
  for (const dept of departmentsData) {
    const d = await prisma.department.upsert({
      where: { code: dept.code },
      update: { name: dept.name, organizationId: organization.id },
      create: { name: dept.name, code: dept.code, organizationId: organization.id },
    });
    departmentMap.set(dept.code, d.id);
  }

  // 4. Seed Teams
  console.log("[Seed] Seeding Teams...");
  const teamsData = [
    { name: "Core Platform", code: "ENG-PLATFORM", deptCode: "ENG" },
    { name: "Frontend & UI", code: "ENG-UI", deptCode: "ENG" },
    { name: "People Experience", code: "HR-EXP", deptCode: "HR" },
    { name: "Business Ops", code: "OPS-BIZ", deptCode: "OPS" },
  ];

  const teamMap = new Map<string, string>();
  for (const t of teamsData) {
    const deptId = departmentMap.get(t.deptCode)!;
    const team = await prisma.team.upsert({
      where: { code: t.code },
      update: { name: t.name, departmentId: deptId },
      create: { name: t.name, code: t.code, departmentId: deptId },
    });
    teamMap.set(t.code, team.id);
  }

  // 5. Seed Users & Employees (Including 4 dedicated test accounts)
  console.log("[Seed] Seeding Users and Employee profiles...");

  const usersData = [
    // 4 Official Test Accounts
    {
      name: "Test Employee",
      email: "employee.test@xorstack.com",
      roles: ["EMPLOYEE"] as RoleType[],
      employeeCode: "EMP-TEST",
      jobTitle: "Full-Stack Software Engineer",
      deptCode: "ENG",
      teamCode: "ENG-PLATFORM",
      emergencyContactName: "Jane Test",
      emergencyContactPhone: "+1-555-0901",
      emergencyContactRelation: "Spouse",
    },
    {
      name: "Test Team Lead",
      email: "lead.test@xorstack.com",
      roles: ["MANAGER", "EMPLOYEE"] as RoleType[],
      employeeCode: "LEAD-TEST",
      jobTitle: "Engineering Team Lead",
      deptCode: "ENG",
      teamCode: "ENG-PLATFORM",
      emergencyContactName: "Robert Test",
      emergencyContactPhone: "+1-555-0902",
      emergencyContactRelation: "Brother",
    },
    {
      name: "Test HR Specialist",
      email: "hr.test@xorstack.com",
      roles: ["HR", "EMPLOYEE"] as RoleType[],
      employeeCode: "HR-TEST",
      jobTitle: "Senior People Operations Partner",
      deptCode: "HR",
      teamCode: "HR-EXP",
      emergencyContactName: "Claire Test",
      emergencyContactPhone: "+1-555-0903",
      emergencyContactRelation: "Mother",
    },
    {
      name: "Test Admin",
      email: "admin.test@xorstack.com",
      roles: ["ADMIN", "EMPLOYEE"] as RoleType[],
      employeeCode: "ADMIN-TEST",
      jobTitle: "System Security Administrator",
      deptCode: "ENG",
      teamCode: "ENG-PLATFORM",
      emergencyContactName: "David Test",
      emergencyContactPhone: "+1-555-0904",
      emergencyContactRelation: "Spouse",
    },

    // Legacy standard personas
    {
      name: "David Admin",
      email: "admin@xorstack.com",
      roles: ["ADMIN", "EMPLOYEE"] as RoleType[],
      employeeCode: "XOR-001",
      jobTitle: "VP of Engineering & Security Admin",
      deptCode: "ENG",
      teamCode: "ENG-PLATFORM",
      emergencyContactName: "Elena Admin",
      emergencyContactPhone: "+1-555-0100",
      emergencyContactRelation: "Spouse",
    },
    {
      name: "Rachel HR",
      email: "hr@xorstack.com",
      roles: ["HR", "EMPLOYEE"] as RoleType[],
      employeeCode: "XOR-002",
      jobTitle: "Head of People Operations",
      deptCode: "HR",
      teamCode: "HR-EXP",
      emergencyContactName: "Mark HR",
      emergencyContactPhone: "+1-555-0101",
      emergencyContactRelation: "Partner",
    },
    {
      name: "Alex Lead",
      email: "lead.alex@xorstack.com",
      roles: ["MANAGER", "EMPLOYEE"] as RoleType[],
      employeeCode: "XOR-003",
      jobTitle: "Engineering Team Lead (Platform)",
      deptCode: "ENG",
      teamCode: "ENG-PLATFORM",
      emergencyContactName: "Chloe Lead",
      emergencyContactPhone: "+1-555-0102",
      emergencyContactRelation: "Sister",
    },
    {
      name: "Sarah Dev",
      email: "dev.sarah@xorstack.com",
      roles: ["EMPLOYEE"] as RoleType[],
      employeeCode: "XOR-004",
      jobTitle: "Senior Backend Engineer",
      deptCode: "ENG",
      teamCode: "ENG-PLATFORM",
      emergencyContactName: "John Dev",
      emergencyContactPhone: "+1-555-0103",
      emergencyContactRelation: "Parent",
    },
  ];

  const employeeMap = new Map<string, string>();

  for (const u of usersData) {
    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, emailVerified: true },
      create: {
        name: u.name,
        email: u.email,
        emailVerified: true,
      },
    });

    // Assign Roles
    for (const rType of u.roles) {
      const roleId = roleMap.get(rType)!;
      await prisma.userRole.upsert({
        where: {
          userId_roleId: {
            userId: user.id,
            roleId,
          },
        },
        update: {},
        create: {
          userId: user.id,
          roleId,
          assignedBy: "system-seed",
        },
      });
    }

    // Upsert Employee Profile
    const deptId = departmentMap.get(u.deptCode)!;
    const teamId = u.teamCode ? teamMap.get(u.teamCode) : undefined;

    const employee = await prisma.employee.upsert({
      where: { userId: user.id },
      update: {
        jobTitle: u.jobTitle,
        employeeCode: u.employeeCode,
        workEmail: u.email,
        emergencyContactName: u.emergencyContactName,
        emergencyContactPhone: u.emergencyContactPhone,
        emergencyContactRelation: u.emergencyContactRelation,
      },
      create: {
        userId: user.id,
        employeeCode: u.employeeCode,
        organizationId: organization.id,
        departmentId: deptId,
        teamId,
        jobTitle: u.jobTitle,
        workEmail: u.email,
        emergencyContactName: u.emergencyContactName,
        emergencyContactPhone: u.emergencyContactPhone,
        emergencyContactRelation: u.emergencyContactRelation,
        hireDate: new Date("2024-01-15"),
        status: EmployeeStatus.ACTIVE,
        workLocation: WorkLocation.HYBRID,
        timezone: "Asia/Kolkata",
      },
    });

    employeeMap.set(u.email, employee.id);
  }

  // 6. Seed Real ManagerAssignment: lead.test manages employee.test
  console.log("[Seed] Seeding ManagerAssignments for test users...");
  const leadTestEmpId = employeeMap.get("lead.test@xorstack.com")!;
  const employeeTestEmpId = employeeMap.get("employee.test@xorstack.com")!;

  const startDate = new Date("2026-01-01");

  await prisma.managerAssignment.upsert({
    where: {
      managerId_reportId_startDate: {
        managerId: leadTestEmpId,
        reportId: employeeTestEmpId,
        startDate,
      },
    },
    update: { status: AssignmentStatus.ACTIVE, isDirect: true, isPrimary: true },
    create: {
      managerId: leadTestEmpId,
      reportId: employeeTestEmpId,
      isDirect: true,
      isPrimary: true,
      startDate,
      status: AssignmentStatus.ACTIVE,
    },
  });

  // Also maintain Alex managing Sarah
  const alexEmpId = employeeMap.get("lead.alex@xorstack.com")!;
  const sarahEmpId = employeeMap.get("dev.sarah@xorstack.com")!;
  await prisma.managerAssignment.upsert({
    where: {
      managerId_reportId_startDate: {
        managerId: alexEmpId,
        reportId: sarahEmpId,
        startDate,
      },
    },
    update: { status: AssignmentStatus.ACTIVE },
    create: {
      managerId: alexEmpId,
      reportId: sarahEmpId,
      isDirect: true,
      startDate,
      status: AssignmentStatus.ACTIVE,
    },
  });

  // 7. Seed Sample Workdays, Tasks, Goals, and Leave for employee.test
  console.log("[Seed] Seeding workdays and tasks for employee.test@xorstack.com...");
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Workday 1: Yesterday (Locked)
  const workdayYesterday = await prisma.workday.upsert({
    where: {
      employeeId_workDate: {
        employeeId: employeeTestEmpId,
        workDate: yesterday,
      },
    },
    update: {},
    create: {
      employeeId: employeeTestEmpId,
      workDate: yesterday,
      workMode: WorkMode.OFFICE,
      plannedHours: 8.0,
      calculatedWorkedHours: 8.5,
      status: WorkdayStatus.LOCKED,
      achievements: "Completed OAuth and Better Auth test integration suites with 100% code coverage.",
      issues: "None encountered.",
      supportNeeded: "Design review on mobile responsive views.",
      nextDayFocus: "Build dev-only test infrastructure and role switcher.",
    },
  });

  // Task on Workday 1
  await prisma.dailyTask.create({
    data: {
      workdayId: workdayYesterday.id,
      employeeId: employeeTestEmpId,
      title: "Write comprehensive unit test fixtures for Phase 5",
      project: "WorkPulse Core",
      priority: TaskPriority.HIGH,
      taskType: TaskType.PLANNED,
      expectedOutput: "Passing test suite in vitest",
      status: TaskStatus.COMPLETED,
      completionPercentage: 100,
      workCompleted: "Implemented 15 unit tests across blockers, 1-on-1s, and badges.",
      estimatedMinutes: 180,
      actualMinutes: 160,
    },
  });

  // Workday 2: Today (SOD Submitted)
  const workdayToday = await prisma.workday.upsert({
    where: {
      employeeId_workDate: {
        employeeId: employeeTestEmpId,
        workDate: today,
      },
    },
    update: {},
    create: {
      employeeId: employeeTestEmpId,
      workDate: today,
      workMode: WorkMode.OFFICE,
      plannedHours: 8.0,
      status: WorkdayStatus.SOD_SUBMITTED,
      sodSubmittedAt: new Date(),
    },
  });

  // Tasks on Workday 2
  await prisma.dailyTask.create({
    data: {
      workdayId: workdayToday.id,
      employeeId: employeeTestEmpId,
      title: "Implement Dev Role Switcher & Dev Login",
      project: "WorkPulse Dev Tools",
      priority: TaskPriority.CRITICAL,
      taskType: TaskType.PLANNED,
      expectedOutput: "Seamless local persona testing without manual re-auth",
      status: TaskStatus.IN_PROGRESS,
      completionPercentage: 70,
      estimatedMinutes: 120,
    },
  });

  // Seed Active Weekly Goal
  console.log("[Seed] Seeding WeeklyGoal for employee.test@xorstack.com...");
  await prisma.weeklyGoal.create({
    data: {
      employeeId: employeeTestEmpId,
      title: "Deliver Dev-Only Test Infrastructure & Hardening",
      description: "Extend Prisma seeds with 4 personas, add instant dev login, and navbar role switcher.",
      category: "ENGINEERING",
      measurableOutcome: "All 4 test personas functional locally with production 404 isolation",
      weight: 50,
      priority: GoalPriority.HIGH,
      startDate: new Date("2026-08-17"),
      endDate: new Date("2026-08-23"),
      status: GoalStatus.IN_PROGRESS,
      progressPercentage: 65,
    },
  });

  // Seed Leave Balance & Pending Leave Request
  console.log("[Seed] Seeding LeaveBalance & Pending LeaveRequest for employee.test@xorstack.com...");
  await prisma.leaveBalance.upsert({
    where: {
      employeeId_year_leaveType: {
        employeeId: employeeTestEmpId,
        year: 2026,
        leaveType: LeaveType.CASUAL,
      },
    },
    update: {},
    create: {
      employeeId: employeeTestEmpId,
      year: 2026,
      leaveType: LeaveType.CASUAL,
      annualAllotment: 12.0,
      usedDays: 1.0,
      pendingDays: 1.0,
      remainingDays: 10.0,
    },
  });

  const leaveStartDate = new Date(today);
  leaveStartDate.setDate(leaveStartDate.getDate() + 4);
  const leaveEndDate = new Date(leaveStartDate);

  await prisma.leaveRequest.create({
    data: {
      employeeId: employeeTestEmpId,
      leaveType: LeaveType.CASUAL,
      startDate: leaveStartDate,
      endDate: leaveEndDate,
      daysCount: 1.0,
      reason: "Family gathering and personal travel.",
      status: LeaveStatus.PENDING_MANAGER,
    },
  });

  console.log("[Seed] Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("[Seed Error]", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
