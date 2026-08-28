// ==========================================
// 1. OFFICIAL XORSTACK DEPARTMENT & ORG ROSTER
// ==========================================

import { realtimeEventBus } from "@/server/realtime/event-bus";

export interface OrgEmployee {
  id: string;
  name: string;
  email: string;
  designation: string;
  departmentId: string;
  departmentName: string;
  teamLeadId: string;
  teamLeadName: string;
  avatar: string;
  workMode: "OFFICE" | "WFH" | "HYBRID";
  status?: "Full-Time" | "Probation" | "Notice Period" | "ACTIVE" | "PROBATION" | "RESIGNED" | "ARCHIVED" | string;
  employmentType?: "Full-Time" | "Probation" | "Contract" | "Intern" | string;
  joiningDate?: string;
  hireDate?: string;
  phoneNumber?: string;
  workLocation?: string;
  location?: string;
  sodStatus: "SUBMITTED" | "PENDING";
  sodTime?: string;
  eodStatus: "SUBMITTED" | "IN_PROGRESS" | "PENDING";
  eodTime?: string;
  overallProgress: number;
  remainingLeaveBalance: number;
  plannedTasks: {
    id: string;
    title: string;
    project: string;
    priority: "HIGH" | "MEDIUM" | "LOW";
    estimatedMinutes: number;
    completionPercentage: number;
    status: "COMPLETED" | "IN_PROGRESS" | "NOT_STARTED" | "BLOCKED";
    expectedOutput: string;
  }[];
  eodAchievements?: string;
  eodBlockers?: string;
  eodTomorrowFocus?: string;
}

export interface OrgDepartment {
  id: string;
  name: string;
  shortName: string;
  iconType: "dev" | "devops" | "data" | "rd" | "configtap" | "sap";
  description: string;
  badgeColor: string;
  accentColor: string;
  teamLead: {
    id: string;
    name: string;
    email: string;
    designation: string;
    avatar: string;
  };
  employees: OrgEmployee[];
}

export const XORSTACK_DEPARTMENTS: OrgDepartment[] = [
  // 1. Development
  {
    id: "dept-development",
    name: "Development",
    shortName: "Dev",
    iconType: "dev",
    description:
      "Software development is the creative process of designing, coding, and testing applications to meet specific user needs. Through iterative cycles and user feedback, developers craft solutions that enhance functionality and user experience.",
    badgeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
    accentColor: "text-cyan-400",
    teamLead: {
      id: "lead-alex",
      name: "Alex Lead",
      email: "lead.test@xorstack.com",
      designation: "Engineering Lead · Development",
      avatar: "AL",
    },
    employees: [
      {
        id: "emp-sarah",
        name: "Sarah Dev",
        email: "employee.test@xorstack.com",
        designation: "Senior Backend Engineer",
        departmentId: "dept-development",
        departmentName: "Development",
        teamLeadId: "lead-alex",
        teamLeadName: "Alex Lead",
        avatar: "SD",
        workMode: "OFFICE",
        sodStatus: "SUBMITTED",
        sodTime: "10:15 AM",
        eodStatus: "IN_PROGRESS",
        overallProgress: 80,
        remainingLeaveBalance: 11.0,
        plannedTasks: [
          {
            id: "st-1",
            title: "Implement dedicated SOD Carryover section with rolled-over task pile-up",
            project: "Frontend & UI",
            priority: "HIGH",
            estimatedMinutes: 180,
            completionPercentage: 80,
            status: "IN_PROGRESS",
            expectedOutput: "Complete SOD section with carryover deck and morning lock action",
          },
          {
            id: "st-2",
            title: "Conduct technical code review on Stage-2 Leave & HR approval PRs",
            project: "Core Platform",
            priority: "MEDIUM",
            estimatedMinutes: 90,
            completionPercentage: 100,
            status: "COMPLETED",
            expectedOutput: "Provide sign-off and merge authorization layer changes",
          },
        ],
        eodAchievements: "Merged authorization enhancements and reviewed 3 critical PRs.",
        eodBlockers: "None",
        eodTomorrowFocus: "Finalize EOD wrap-up testing suite.",
      },
      {
        id: "emp-rohit",
        name: "Rohit Sharma",
        email: "rohit.sharma@xorstack.com",
        designation: "Frontend Engineer (UI/UX)",
        departmentId: "dept-development",
        departmentName: "Development",
        teamLeadId: "lead-alex",
        teamLeadName: "Alex Lead",
        avatar: "RS",
        workMode: "OFFICE",
        sodStatus: "SUBMITTED",
        sodTime: "10:20 AM",
        eodStatus: "IN_PROGRESS",
        overallProgress: 65,
        remainingLeaveBalance: 10.0,
        plannedTasks: [
          {
            id: "rt-1",
            title: "Design 3D interactive glassmorphism cards and smooth Framer Motion transitions",
            project: "Frontend & UI",
            priority: "HIGH",
            estimatedMinutes: 240,
            completionPercentage: 70,
            status: "IN_PROGRESS",
            expectedOutput: "Smooth page transition component across all views",
          },
          {
            id: "rt-2",
            title: "Fix dark mode contrast tokens for secondary badges",
            project: "Design System",
            priority: "LOW",
            estimatedMinutes: 60,
            completionPercentage: 60,
            status: "IN_PROGRESS",
            expectedOutput: "WCAG AAA accessible contrast",
          },
        ],
        eodAchievements: "Shipped PageTransition & AnimatedTabContent components.",
        eodBlockers: "None",
        eodTomorrowFocus: "Optimize mobile viewport responsiveness.",
      },
    ],
  },

  // 2. DevOps
  {
    id: "dept-devops",
    name: "Devops",
    shortName: "DevOps",
    iconType: "devops",
    description:
      "Bridging the gap between development and operations, DevOps fosters a culture of collaboration and automation, accelerating software delivery and ensuring reliability.",
    badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    accentColor: "text-emerald-400",
    teamLead: {
      id: "lead-marcus",
      name: "Marcus Vance",
      email: "lead.devops@xorstack.com",
      designation: "DevOps & SRE Practice Lead",
      avatar: "MV",
    },
    employees: [
      {
        id: "emp-karthik",
        name: "Karthik Raja",
        email: "karthik.raja@xorstack.com",
        designation: "DevOps & Cloud Engineer",
        departmentId: "dept-devops",
        departmentName: "Devops",
        teamLeadId: "lead-marcus",
        teamLeadName: "Marcus Vance",
        avatar: "KR",
        workMode: "OFFICE",
        sodStatus: "SUBMITTED",
        sodTime: "10:10 AM",
        eodStatus: "IN_PROGRESS",
        overallProgress: 85,
        remainingLeaveBalance: 11.5,
        plannedTasks: [
          {
            id: "kt-1",
            title: "Configure GitHub Actions CI/CD caching for Turborepo and Next.js artifacts",
            project: "Infrastructure",
            priority: "HIGH",
            estimatedMinutes: 200,
            completionPercentage: 85,
            status: "IN_PROGRESS",
            expectedOutput: "CI build times reduced by 40%",
          },
        ],
        eodAchievements: "Implemented npm cache layer in GitHub Actions workflow.",
        eodBlockers: "None",
        eodTomorrowFocus: "Production cluster failover testing.",
      },
    ],
  },

  // 3. Data Processing
  {
    id: "dept-data-processing",
    name: "Data processing",
    shortName: "Data",
    iconType: "data",
    description:
      "Data processing transforms raw data into meaningful insights, leveraging algorithms and computational tools.",
    badgeColor: "bg-purple-500/15 text-purple-300 border-purple-500/30",
    accentColor: "text-purple-400",
    teamLead: {
      id: "lead-vikram",
      name: "Vikram Rao",
      email: "lead.data@xorstack.com",
      designation: "Data Architecture & Analytics Lead",
      avatar: "VR",
    },
    employees: [
      {
        id: "emp-sneha",
        name: "Sneha Kapoor",
        email: "sneha.kapoor@xorstack.com",
        designation: "Data Analytics Engineer",
        departmentId: "dept-data-processing",
        departmentName: "Data processing",
        teamLeadId: "lead-vikram",
        teamLeadName: "Vikram Rao",
        avatar: "SK",
        workMode: "OFFICE",
        sodStatus: "SUBMITTED",
        sodTime: "10:08 AM",
        eodStatus: "IN_PROGRESS",
        overallProgress: 75,
        remainingLeaveBalance: 9.0,
        plannedTasks: [
          {
            id: "sk-1",
            title: "Build automated telemetry ingestion pipelines for biometric attendance logs",
            project: "Data Lake",
            priority: "HIGH",
            estimatedMinutes: 240,
            completionPercentage: 75,
            status: "IN_PROGRESS",
            expectedOutput: "Sub-second analytical queries on 1M+ attendance events",
          },
        ],
        eodAchievements: "Ingestion pipeline latency reduced to 120ms.",
        eodBlockers: "None",
      },
    ],
  },

  // 4. R & D
  {
    id: "dept-rd",
    name: "R & D",
    shortName: "R&D",
    iconType: "rd",
    description:
      "R&D drives innovation by exploring novel ideas and technologies, ensuring that products and services remain cutting-edge and relevant.",
    badgeColor: "bg-pink-500/15 text-pink-300 border-pink-500/30",
    accentColor: "text-pink-400",
    teamLead: {
      id: "admin-david",
      name: "David Director",
      email: "director.test@xorstack.com",
      designation: "VP of Engineering & SuperAdmin",
      avatar: "DD",
    },
    employees: [
      {
        id: "emp-priya",
        name: "Priya QA",
        email: "priya.qa@xorstack.com",
        designation: "QA & Test Automation Lead Engineer",
        departmentId: "dept-rd",
        departmentName: "R & D",
        teamLeadId: "admin-david",
        teamLeadName: "David Director",
        avatar: "PQ",
        workMode: "WFH",
        sodStatus: "SUBMITTED",
        sodTime: "10:05 AM",
        eodStatus: "SUBMITTED",
        eodTime: "06:55 PM",
        overallProgress: 100,
        remainingLeaveBalance: 9.0,
        plannedTasks: [
          {
            id: "pt-1",
            title: "Automate Playwright end-to-end regression test suite for biometric sync",
            project: "Quality Assurance",
            priority: "HIGH",
            estimatedMinutes: 180,
            completionPercentage: 100,
            status: "COMPLETED",
            expectedOutput: "17 test suites passing in CI/CD pipeline",
          },
          {
            id: "pt-2",
            title: "Verify RBAC permission boundary tests for HR Stage-2 leave approvals",
            project: "Security & Auth",
            priority: "HIGH",
            estimatedMinutes: 120,
            completionPercentage: 100,
            status: "COMPLETED",
            expectedOutput: "Zero regression leaks on permission elevation",
          },
        ],
        eodAchievements: "85/85 unit tests and Playwright regressions green across all suites.",
        eodBlockers: "None",
        eodTomorrowFocus: "Prepare automated performance benchmarks.",
      },
    ],
  },

  // 5. Service Providers (ConfigTap)
  {
    id: "dept-configtap",
    name: "Service Providers (ConfigTap)",
    shortName: "ConfigTap",
    iconType: "configtap",
    description: "ConfigTap Innovations incubated for Autosar, 3DExperience & automotive engineering systems.",
    badgeColor: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    accentColor: "text-amber-400",
    teamLead: {
      id: "lead-alex",
      name: "Alex Lead",
      email: "lead.test@xorstack.com",
      designation: "Engineering Lead · Development",
      avatar: "AL",
    },
    employees: [
      {
        id: "emp-ananya",
        name: "Ananya Sen",
        email: "ananya.sen@xorstack.com",
        designation: "Automation & Embedded QA Engineer",
        departmentId: "dept-configtap",
        departmentName: "Service Providers (ConfigTap)",
        teamLeadId: "lead-alex",
        teamLeadName: "Alex Lead",
        avatar: "AS",
        workMode: "OFFICE",
        sodStatus: "SUBMITTED",
        sodTime: "10:12 AM",
        eodStatus: "IN_PROGRESS",
        overallProgress: 85,
        remainingLeaveBalance: 10.0,
        plannedTasks: [
          {
            id: "at-1",
            title: "Validate Autosar Classic platform ECU communications protocol stack",
            project: "ConfigTap Core",
            priority: "HIGH",
            estimatedMinutes: 180,
            completionPercentage: 85,
            status: "IN_PROGRESS",
            expectedOutput: "Pass all CAN/LIN diagnostic conformity test vectors",
          },
        ],
        eodAchievements: "Diagnostic conformity verified for ECU build v4.2.",
      },
    ],
  },

  // 6. Human Resources
  {
    id: "dept-hr",
    name: "Human Resources",
    shortName: "HR",
    iconType: "dev",
    description: "Human Resources and People Operations driving culture, recruitment, benefits, and employee growth.",
    badgeColor: "bg-pink-500/15 text-pink-300 border-pink-500/30",
    accentColor: "text-pink-400",
    teamLead: {
      id: "hr-rachel",
      name: "Rachel HR",
      email: "hr.test@xorstack.com",
      designation: "Head of People Operations",
      avatar: "RH",
    },
    employees: [
      {
        id: "hr-rachel",
        name: "Rachel HR",
        email: "hr.test@xorstack.com",
        designation: "Head of People Operations",
        departmentId: "dept-hr",
        departmentName: "Human Resources",
        teamLeadId: "admin-david",
        teamLeadName: "David Director",
        avatar: "RH",
        workMode: "OFFICE",
        sodStatus: "SUBMITTED",
        sodTime: "09:50 AM",
        eodStatus: "IN_PROGRESS",
        overallProgress: 90,
        remainingLeaveBalance: 15.0,
        plannedTasks: [
          {
            id: "hr-1",
            title: "Execute Stage-2 Leave authorizations & Attendance audit muster",
            project: "People Operations",
            priority: "HIGH",
            estimatedMinutes: 180,
            completionPercentage: 90,
            status: "IN_PROGRESS",
            expectedOutput: "All pending Stage-2 leaves authorized with balance deduction",
          },
        ],
        eodAchievements: "Processed sprint leave queues and published company announcements.",
      },
    ],
  },
];

// Flattened list of all employees across all 6 departments
export const ALL_XORSTACK_EMPLOYEES: OrgEmployee[] = XORSTACK_DEPARTMENTS.flatMap(
  (dept) => dept.employees
);

// ==========================================
// 2. SOD & EOD EVALUATION & FEEDBACK STORE
// ==========================================

export interface SharedEODFeedback {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentName?: string;
  date: string;
  dayName: string;
  employeeEodSummary: string;
  tasksCompleted: string;
  hoursLogged: number;
  leadFeedbackTime: string;
  leadFeedbackNote: string;
  leadRating: number;
  leadSentiment: "EXCELLENT" | "GREAT" | "ON_TRACK";
  leadActionItem?: string;
  isToday?: boolean;
}

const DEFAULT_FEEDBACKS: SharedEODFeedback[] = [
  {
    id: "df-today",
    employeeId: "emp-sarah",
    employeeName: "Sarah Dev",
    departmentName: "Development",
    date: "Today (Aug 20, 2026)",
    dayName: "Thursday",
    employeeEodSummary: "Implemented dedicated SOD Carryover section with rollover deck, updated role dashboards, and conducted code review on Stage-2 Leave PRs.",
    tasksCompleted: "2 of 2 Planned Deliverables (100%)",
    hoursLogged: 8.5,
    leadFeedbackTime: "05:45 PM",
    leadFeedbackNote: "Outstanding work on the SOD state machine and role streamlining today, Sara. Code review comments on PR #42 were addressed cleanly and test coverage remained 100%. Great pace heading into tomorrow's sprint review.",
    leadRating: 5,
    leadSentiment: "EXCELLENT",
    leadActionItem: "Prepare demo recording of the SOD rollover flow for tomorrow's pod sync.",
    isToday: true,
  },
  {
    id: "df-priya",
    employeeId: "emp-priya",
    employeeName: "Priya QA",
    departmentName: "R & D",
    date: "Today (Aug 20, 2026)",
    dayName: "Thursday",
    employeeEodSummary: "Automated Playwright end-to-end regression test suite for biometric sync with 100% assertions green.",
    tasksCompleted: "2 of 2 Planned Deliverables (100%)",
    hoursLogged: 8.0,
    leadFeedbackTime: "05:30 PM",
    leadFeedbackNote: "Flawless regression suite setup across all 17 test suites. Great initiative on the permission boundary assertions.",
    leadRating: 5,
    leadSentiment: "EXCELLENT",
    leadActionItem: "Present testing coverage metrics in upcoming tech talk.",
    isToday: true,
  },
  {
    id: "df-yesterday",
    employeeId: "emp-sarah",
    employeeName: "Sarah Dev",
    departmentName: "Development",
    date: "Yesterday (Aug 19, 2026)",
    dayName: "Wednesday",
    employeeEodSummary: "Configured brand color tokens across UI layout, built Week/Month switcher layout, and fixed authorization scope isolation.",
    tasksCompleted: "3 of 3 Planned Tasks (100%)",
    hoursLogged: 8.2,
    leadFeedbackTime: "06:10 PM",
    leadFeedbackNote: "The brand extraction and dark mode contrast tokens look super polished. Really appreciate you picking up the authorization test assertions proactively.",
    leadRating: 5,
    leadSentiment: "EXCELLENT",
    leadActionItem: "Align with Rohit on mobile responsive drawer components.",
  },
  {
    id: "df-tue",
    employeeId: "emp-sarah",
    employeeName: "Sarah Dev",
    departmentName: "Development",
    date: "Aug 18, 2026",
    dayName: "Tuesday",
    employeeEodSummary: "Refactored Prisma migrations and role policies, fixed typecheck strict boundaries.",
    tasksCompleted: "4 of 4 Planned Tasks (100%)",
    hoursLogged: 8.0,
    leadFeedbackTime: "06:30 PM",
    leadFeedbackNote: "Thorough database schema updates and clean documentation.",
    leadRating: 5,
    leadSentiment: "EXCELLENT",
    leadActionItem: "Monitor CI/CD staging deploy logs.",
  },
];

// ==========================================
// 3. 2-STAGE LEAVE & WFH REQUEST STORE
// ==========================================

export type RequestStageStatus =
  | "PENDING_TL_STAGE_1"
  | "FORWARDED_TO_HR"
  | "APPROVED"
  | "REJECTED";

export interface SharedLeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentId: string;
  departmentName: string;
  designation: string;
  leaveType: "CASUAL" | "SICK" | "PRIVILEGE" | "UNPAID";
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  handoverNotes: string;
  backupPersonName: string;
  remainingBalance: number;
  // Stage 1: TL Approval
  tlApproverName?: string;
  tlApprovedAt?: string;
  tlComment?: string;
  // Stage 2: HR Approval
  hrApproverName?: string;
  hrApprovedAt?: string;
  hrComment?: string;
  status: RequestStageStatus;
  rejectionReason?: string;
  createdAt: string;
}

export interface SharedWfhRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  departmentId: string;
  departmentName: string;
  designation: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  availabilityHours: string;
  contactMethod: string;
  plannedDeliverables: string;
  // Stage 1: TL Approval
  tlApproverName?: string;
  tlApprovedAt?: string;
  tlComment?: string;
  // Stage 2: HR Approval
  hrApproverName?: string;
  hrApprovedAt?: string;
  hrComment?: string;
  status: RequestStageStatus;
  rejectionReason?: string;
  createdAt: string;
}

const DEFAULT_LEAVE_REQUESTS: SharedLeaveRequest[] = [
  {
    id: "leave-req-101",
    employeeId: "emp-sarah",
    employeeName: "Sarah Dev",
    departmentId: "dept-development",
    departmentName: "Development",
    designation: "Senior Backend Engineer",
    leaveType: "CASUAL",
    startDate: "2026-08-28",
    endDate: "2026-08-28",
    daysCount: 1.0,
    reason: "Family festival celebration and personal commitments",
    handoverNotes: "Sprint deliverables completed. Alex Lead briefed on PR reviews.",
    backupPersonName: "Rohit Sharma (Frontend)",
    remainingBalance: 11.0,
    tlApproverName: "Alex Lead (Engineering Lead · Development)",
    tlApprovedAt: "Today at 10:15 AM",
    tlComment: "Approved by Development Lead. All sprint deliverables are green. Forwarded to HR.",
    status: "FORWARDED_TO_HR",
    createdAt: "2026-08-20T09:00:00Z",
  },
  {
    id: "leave-req-102",
    employeeId: "emp-priya",
    employeeName: "Priya QA",
    departmentId: "dept-rd",
    departmentName: "R & D",
    designation: "QA & Automation Lead",
    leaveType: "CASUAL",
    startDate: "2026-09-02",
    endDate: "2026-09-04",
    daysCount: 3.0,
    reason: "Out-of-town travel for family wedding",
    handoverNotes: "Automated regression suite scheduled to run in CI/CD pipeline.",
    backupPersonName: "Ananya Sen (ConfigTap)",
    remainingBalance: 9.0,
    tlApproverName: "David Director (VP of Eng & SuperAdmin)",
    tlApprovedAt: "Yesterday at 04:30 PM",
    tlComment: "Approved by Executive Lead David Director. Regression test coverage is verified. Forwarded to HR.",
    status: "FORWARDED_TO_HR",
    createdAt: "2026-08-19T14:00:00Z",
  },
  {
    id: "leave-req-103",
    employeeId: "emp-rohit",
    employeeName: "Rohit Sharma",
    departmentId: "dept-development",
    departmentName: "Development",
    designation: "Frontend Engineer (UI/UX)",
    leaveType: "SICK",
    startDate: "2026-08-25",
    endDate: "2026-08-25",
    daysCount: 1.0,
    reason: "Routine medical consultation and health checkup",
    handoverNotes: "UI styling tokens merged to main branch.",
    backupPersonName: "Sarah Dev (Backend)",
    remainingBalance: 10.0,
    status: "PENDING_TL_STAGE_1",
    createdAt: "2026-08-20T10:30:00Z",
  },
  {
    id: "leave-req-104",
    employeeId: "emp-karthik",
    employeeName: "Karthik Raja",
    departmentId: "dept-devops",
    departmentName: "Devops",
    designation: "DevOps & Cloud Engineer",
    leaveType: "CASUAL",
    startDate: "2026-08-29",
    endDate: "2026-08-29",
    daysCount: 1.0,
    reason: "Personal family commitment",
    handoverNotes: "Marcus Vance briefed on deployment on-call rotation.",
    backupPersonName: "Marcus Vance (DevOps)",
    remainingBalance: 11.5,
    tlApproverName: "Marcus Vance (DevOps Lead)",
    tlApprovedAt: "Today at 10:00 AM",
    tlComment: "Approved by DevOps Lead. On-call coverage secured. Forwarded to HR.",
    status: "FORWARDED_TO_HR",
    createdAt: "2026-08-20T08:30:00Z",
  },
  {
    id: "leave-req-105",
    employeeId: "emp-ananya",
    employeeName: "Ananya Sen",
    departmentId: "dept-configtap",
    departmentName: "Service Providers (ConfigTap)",
    designation: "Automation & Embedded QA Engineer",
    leaveType: "CASUAL",
    startDate: "2026-09-01",
    endDate: "2026-09-01",
    daysCount: 1.0,
    reason: "Embedded ECU certification exam",
    handoverNotes: "Autosar CAN conformity test suite completed.",
    backupPersonName: "Priya QA (QA Lead)",
    remainingBalance: 10.0,
    status: "PENDING_TL_STAGE_1",
    createdAt: "2026-08-20T11:30:00Z",
  },
];

const DEFAULT_WFH_REQUESTS: SharedWfhRequest[] = [
  {
    id: "wfh-req-201",
    employeeId: "emp-sarah",
    employeeName: "Sarah Dev",
    departmentId: "dept-development",
    departmentName: "Development",
    designation: "Senior Backend Engineer",
    startDate: "2026-08-26",
    endDate: "2026-08-26",
    daysCount: 1.0,
    reason: "Focus day for deep performance indexing and complex database migrations",
    availabilityHours: "10:00 AM – 07:00 PM",
    contactMethod: "Slack #dev-pod & Google Meet",
    plannedDeliverables: "Complete index optimization on attendance audit logs and verify latency benchmark.",
    tlApproverName: "Alex Lead (Engineering Lead · Development)",
    tlApprovedAt: "Today at 10:20 AM",
    tlComment: "Approved by Development Lead. High-priority focus day for indexing. Forwarded to HR.",
    status: "FORWARDED_TO_HR",
    createdAt: "2026-08-20T09:30:00Z",
  },
  {
    id: "wfh-req-202",
    employeeId: "emp-rohit",
    employeeName: "Rohit Sharma",
    departmentId: "dept-development",
    departmentName: "Development",
    designation: "Frontend Engineer (UI/UX)",
    startDate: "2026-08-27",
    endDate: "2026-08-27",
    daysCount: 1.0,
    reason: "Quiet focus environment for mobile responsive drawer animations",
    availabilityHours: "10:00 AM – 07:00 PM",
    contactMethod: "Slack @rohit & Zoom",
    plannedDeliverables: "Implement CSS transition optimizations across mobile viewports.",
    status: "PENDING_TL_STAGE_1",
    createdAt: "2026-08-20T11:00:00Z",
  },
  {
    id: "wfh-req-203",
    employeeId: "emp-sneha",
    employeeName: "Sneha Kapoor",
    departmentId: "dept-data-processing",
    departmentName: "Data processing",
    designation: "Data Analytics Engineer",
    startDate: "2026-08-28",
    endDate: "2026-08-28",
    daysCount: 1.0,
    reason: "High-compute query optimization on large batch telemetry dataset",
    availabilityHours: "10:00 AM – 07:00 PM",
    contactMethod: "Slack #data-pod & Meet",
    plannedDeliverables: "Optimize Spark telemetry job memory allocations.",
    tlApproverName: "Vikram Rao (Data Processing Lead)",
    tlApprovedAt: "Today at 10:45 AM",
    tlComment: "Approved by Data Lead. Forwarded to HR.",
    status: "FORWARDED_TO_HR",
    createdAt: "2026-08-20T10:00:00Z",
  },
];

// Storage keys for browser persistence across page reloads & refreshes
const STORAGE_KEYS = {
  DEPARTMENTS: "workpulse_departments_v5_supabase",
  FEEDBACKS: "workpulse_feedbacks_v5_supabase",
  LEAVE: "workpulse_leave_v5_supabase",
  WFH: "workpulse_wfh_v5_supabase",
};

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined" || !window.localStorage) return fallback;
  try {
    const saved = window.localStorage.getItem(key);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn(`[WorkpulseStore] Error loading ${key} from localStorage:`, e);
  }
  return fallback;
}

function saveToStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined" || !window.localStorage) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[WorkpulseStore] Error saving ${key} to localStorage:`, e);
  }
}

// Global in-memory shared state (defaults on initial SSR and initial client mount)
let globalDepartments: OrgDepartment[] = JSON.parse(JSON.stringify(XORSTACK_DEPARTMENTS));
let globalFeedbacks: SharedEODFeedback[] = [...DEFAULT_FEEDBACKS];
let globalLeaveRequests: SharedLeaveRequest[] = [...DEFAULT_LEAVE_REQUESTS];
let globalWfhRequests: SharedWfhRequest[] = [...DEFAULT_WFH_REQUESTS];

type Listener = () => void;
const listeners = new Set<Listener>();

export function subscribeToSharedStore(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify() {
  saveToStorage(STORAGE_KEYS.DEPARTMENTS, globalDepartments);
  saveToStorage(STORAGE_KEYS.FEEDBACKS, globalFeedbacks);
  saveToStorage(STORAGE_KEYS.LEAVE, globalLeaveRequests);
  saveToStorage(STORAGE_KEYS.WFH, globalWfhRequests);
  listeners.forEach((l) => l());
}

async function syncEmployeeToSupabase(emp: OrgEmployee) {
  if (typeof window === "undefined") return;
  try {
    // 1. Direct client upsert
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.from("employees").upsert({
      id: emp.id,
      name: emp.name,
      email: emp.email,
      role_title: emp.designation,
      department: emp.departmentName,
      department_id: emp.departmentId,
      work_mode: emp.workMode,
      status: emp.status || "ACTIVE",
      employment_type: emp.employmentType || "Full-Time",
      manager_id: emp.teamLeadId,
      manager_name: emp.teamLeadName,
      phone_number: emp.phoneNumber,
      location: emp.workLocation || emp.location || "Bangalore HQ",
      leave_balance: emp.remainingLeaveBalance,
    });

    // 2. Server API fallback for service_role admin execution
    await fetch(`/api/v1/employees/${emp.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: emp.name,
        email: emp.email,
        designation: emp.designation,
        departmentId: emp.departmentId,
        departmentName: emp.departmentName,
        workMode: emp.workMode,
        status: emp.status,
        employmentType: emp.employmentType,
        phoneNumber: emp.phoneNumber,
        workLocation: emp.workLocation || emp.location,
        remainingLeaveBalance: emp.remainingLeaveBalance,
      }),
    }).catch(() => {});
  } catch {
    // Graceful offline fallback
  }
}

async function deleteEmployeeFromSupabase(id: string) {
  if (typeof window === "undefined") return;
  try {
    // 1. Trigger server-side Admin endpoint with service_role privileges
    await fetch(`/api/v1/employees/${id}`, {
      method: "DELETE",
    });

    // 2. Direct client fallback
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.from("employees").delete().eq("id", id);
  } catch {
    // Graceful offline fallback
  }
}

async function syncLeaveRequestToSupabase(req: SharedLeaveRequest) {
  if (typeof window === "undefined") return;
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.from("leave_requests").upsert({
      id: req.id,
      employee_id: req.employeeId,
      employee_name: req.employeeName,
      department_name: req.departmentName,
      department_id: req.departmentId,
      designation: req.designation,
      leave_type: req.leaveType,
      start_date: req.startDate,
      end_date: req.endDate,
      days_count: req.daysCount,
      reason: req.reason,
      handover_notes: req.handoverNotes,
      backup_person_name: req.backupPersonName,
      remaining_balance: req.remainingBalance,
      status: req.status,
      tl_approver_name: req.tlApproverName,
      tl_approved_at: req.tlApprovedAt ? new Date().toISOString() : null,
      tl_comment: req.tlComment,
      hr_approver_name: req.hrApproverName,
      hr_approved_at: req.hrApprovedAt ? new Date().toISOString() : null,
      hr_comment: req.hrComment,
      rejection_reason: req.rejectionReason,
    });
  } catch {
    // Graceful offline fallback
  }
}

async function syncWfhRequestToSupabase(req: SharedWfhRequest) {
  if (typeof window === "undefined") return;
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.from("wfh_requests").upsert({
      id: req.id,
      employee_id: req.employeeId,
      employee_name: req.employeeName,
      department_name: req.departmentName,
      department_id: req.departmentId,
      designation: req.designation,
      start_date: req.startDate,
      end_date: req.endDate,
      days_count: req.daysCount,
      reason: req.reason,
      availability_hours: req.availabilityHours,
      contact_method: req.contactMethod,
      planned_deliverables: req.plannedDeliverables,
      status: req.status,
      tl_approver_name: req.tlApproverName,
      tl_approved_at: req.tlApprovedAt ? new Date().toISOString() : null,
      tl_comment: req.tlComment,
      hr_approver_name: req.hrApproverName,
      hr_approved_at: req.hrApprovedAt ? new Date().toISOString() : null,
      hr_comment: req.hrComment,
      rejection_reason: req.rejectionReason,
    });
  } catch {
    // Graceful offline fallback
  }
}

async function syncBiometricPunchToSupabase(punch: {
  employeeId: string;
  employeeName?: string;
  punchType: "IN" | "OUT";
  terminalId?: string;
  location?: string;
  method?: string;
}) {
  if (typeof window === "undefined") return;
  try {
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.from("biometric_punches").insert({
      employee_id: punch.employeeId,
      employee_name: punch.employeeName || "Employee",
      punch_type: punch.punchType,
      terminal_id: punch.terminalId || "HQ-GATE-01",
      location: punch.location || "Bangalore HQ",
      method: punch.method || "BIOMETRIC",
      status: "VERIFIED",
    });
  } catch {
    // Graceful offline fallback
  }
}

export const WorkpulseSharedStore = {
  // Virtual Biometric Punch Action
  virtualPunch: (employeeId: string, punchType: "IN" | "OUT") => {
    syncBiometricPunchToSupabase({
      employeeId: employeeId || "emp-sarah",
      employeeName: employeeId === "emp-rohit" ? "Rohit Sharma" : "Sarah Dev",
      punchType,
      location: "Bangalore HQ (Floor 4, Pod B)",
      method: "VIRTUAL_SIMULATOR",
    });
    notify();
  },

  // Hydration & Storage Management
  hydrateFromStorage: () => {
    if (typeof window !== "undefined" && window.localStorage) {
      // Clear legacy storage keys with outdated mock data
      [
        "workpulse_departments",
        "workpulse_departments_v1",
        "workpulse_departments_v2",
        "workpulse_departments_v3",
        "workpulse_departments_v4",
      ].forEach((k) => window.localStorage.removeItem(k));
    }
    globalDepartments = loadFromStorage(STORAGE_KEYS.DEPARTMENTS, globalDepartments);
    globalFeedbacks = loadFromStorage(STORAGE_KEYS.FEEDBACKS, globalFeedbacks);
    globalLeaveRequests = loadFromStorage(STORAGE_KEYS.LEAVE, globalLeaveRequests);
    globalWfhRequests = loadFromStorage(STORAGE_KEYS.WFH, globalWfhRequests);
    listeners.forEach((l) => l());
  },

  syncWithSupabase: async () => {
    if (typeof window === "undefined") return;
    try {
      // 1. Sync Employees
      const res = await fetch("/api/v1/employees");
      if (res.ok) {
        const json = await res.json();
        const employees = json.data?.employees || json.employees;
        if (Array.isArray(employees) && employees.length > 0) {
          WorkpulseSharedStore.setEmployeesFromSupabase(employees);
        }
      }

      // 2. Sync Leave & WFH Requests & Feedbacks directly from Supabase
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      const [lrRes, wfhRes, fbRes] = await Promise.all([
        supabase.from("leave_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("wfh_requests").select("*").order("created_at", { ascending: false }),
        supabase.from("feedbacks").select("*").order("created_at", { ascending: false }),
      ]);

      if (lrRes.data && lrRes.data.length > 0) {
        const mappedLeaves: SharedLeaveRequest[] = lrRes.data.map((r) => ({
          id: r.id,
          employeeId: r.employee_id,
          employeeName: r.employee_name,
          departmentId: r.department_id || "dept-development",
          departmentName: r.department_name || "Development",
          designation: r.designation || "Engineer",
          leaveType: r.leave_type || "CASUAL",
          startDate: r.start_date,
          endDate: r.end_date,
          daysCount: Number(r.days_count) || 1,
          reason: r.reason,
          handoverNotes: r.handover_notes,
          backupPersonName: r.backup_person_name,
          remainingBalance: Number(r.remaining_balance) || 11.0,
          status: r.status,
          tlApproverName: r.tl_approver_name,
          tlApprovedAt: r.tl_approved_at,
          tlComment: r.tl_comment,
          hrApproverName: r.hr_approver_name,
          hrApprovedAt: r.hr_approved_at,
          hrComment: r.hr_comment,
          rejectionReason: r.rejection_reason,
          createdAt: r.created_at,
        }));
        globalLeaveRequests = mappedLeaves;
      }

      if (wfhRes.data && wfhRes.data.length > 0) {
        const mappedWfh: SharedWfhRequest[] = wfhRes.data.map((r) => ({
          id: r.id,
          employeeId: r.employee_id,
          employeeName: r.employee_name,
          departmentId: r.department_id || "dept-development",
          departmentName: r.department_name || "Development",
          designation: r.designation || "Engineer",
          startDate: r.start_date,
          endDate: r.end_date,
          daysCount: Number(r.days_count) || 1,
          reason: r.reason,
          availabilityHours: r.availability_hours || "10:00 AM – 07:00 PM",
          contactMethod: r.contact_method || "Slack & Zoom",
          plannedDeliverables: r.planned_deliverables,
          status: r.status,
          tlApproverName: r.tl_approver_name,
          tlApprovedAt: r.tl_approved_at,
          tlComment: r.tl_comment,
          hrApproverName: r.hr_approver_name,
          hrApprovedAt: r.hr_approved_at,
          hrComment: r.hr_comment,
          rejectionReason: r.rejection_reason,
          createdAt: r.created_at,
        }));
        globalWfhRequests = mappedWfh;
      }

      if (fbRes.data && fbRes.data.length > 0) {
        const mappedFb: SharedEODFeedback[] = fbRes.data.map((f) => ({
          id: f.id,
          employeeId: f.employee_id,
          employeeName: f.employee_name,
          departmentName: "Development",
          date: f.date || "Today",
          dayName: "Today",
          employeeEodSummary: f.notes || "Completed assigned sprint deliverables.",
          tasksCompleted: "Planned deliverables completed",
          hoursLogged: 8.0,
          leadFeedbackTime: f.created_at ? new Date(f.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "Today",
          leadFeedbackNote: f.notes,
          leadRating: Number(f.rating) || 5.0,
          leadSentiment: f.sentiment || "EXCELLENT",
          leadActionItem: f.action_item,
          isToday: true,
        }));
        globalFeedbacks = mappedFb;
      }

      notify();
    } catch {
      // Graceful offline fallback
    }
  },

  setEmployeesFromSupabase: (supaEmployees: any[]) => {
    if (!Array.isArray(supaEmployees) || supaEmployees.length === 0) return;

    const allMapped: OrgEmployee[] = supaEmployees.map((se) => {
      const name = se.name || "Employee";
      const avatar = name
        .split(" ")
        .map((w: string) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      const deptName = se.departmentName || se.department || "Development";
      const deptId =
        se.departmentId ||
        se.department_id ||
        (deptName.toLowerCase().includes("devops")
          ? "dept-devops"
          : deptName.toLowerCase().includes("data")
          ? "dept-data-processing"
          : deptName.toLowerCase().includes("r & d") || deptName.toLowerCase().includes("rd")
          ? "dept-rd"
          : deptName.toLowerCase().includes("configtap") || deptName.toLowerCase().includes("service")
          ? "dept-configtap"
          : deptName.toLowerCase().includes("hr") || deptName.toLowerCase().includes("human")
          ? "dept-hr"
          : "dept-development");

      const teamLeadId =
        se.teamLeadId ||
        se.manager_id ||
        (deptId === "dept-devops"
          ? "lead-marcus"
          : deptId === "dept-data-processing"
          ? "lead-vikram"
          : deptId === "dept-rd"
          ? "admin-david"
          : deptId === "dept-configtap"
          ? "lead-alex"
          : deptId === "dept-hr"
          ? "admin-david"
          : "lead-alex");

      const teamLeadName =
        se.teamLeadName ||
        se.manager_name ||
        (teamLeadId === "lead-marcus"
          ? "Marcus Vance"
          : teamLeadId === "lead-vikram"
          ? "Vikram Rao"
          : teamLeadId === "admin-david"
          ? "David Director"
          : "Alex Lead");

      return {
        id: se.id,
        name,
        email: se.email,
        designation: se.designation || se.role_title || "Engineer",
        departmentId: deptId,
        departmentName: deptName,
        teamLeadId,
        teamLeadName,
        avatar,
        workMode: se.workMode || se.work_mode || "OFFICE",
        status: se.status || "ACTIVE",
        employmentType: se.employmentType || se.employment_type || "Full-Time",
        sodStatus: se.sodStatus || "SUBMITTED",
        sodTime: se.sodTime || "10:15 AM",
        eodStatus: se.eodStatus || "IN_PROGRESS",
        overallProgress: se.overallProgress || 80,
        remainingLeaveBalance: Number(se.remainingLeaveBalance ?? se.leave_balance) || 12.0,
        phoneNumber: se.phoneNumber || se.phone_number || "+91 98450 11223",
        location: se.location || se.workLocation || "Bangalore HQ",
        workLocation: se.workLocation || se.location || "Bangalore HQ",
        joiningDate: se.joiningDate || se.joining_date || "2025-06-01",
        plannedTasks: se.plannedTasks || [],
      };
    });

    // Populate each department cleanly with its direct members
    globalDepartments = XORSTACK_DEPARTMENTS.map((baseDept) => {
      const deptEmployees = allMapped.filter(
        (emp) =>
          emp.departmentId === baseDept.id ||
          emp.departmentName.toLowerCase() === baseDept.name.toLowerCase()
      );
      return {
        ...baseDept,
        employees: deptEmployees,
      };
    });

    notify();
  },

  addOrUpdateEmployeeFromSupabase: (emp: any) => {
    const empId = emp.id;
    const empName = emp.name;
    const empEmail = emp.email;
    const empDesignation = emp.designation || emp.role_title || "Engineer";
    const empDeptName = emp.departmentName || emp.department || "Development";
    const empWorkMode = emp.workMode || emp.work_mode || "OFFICE";
    const empStatus = emp.status || "ACTIVE";
    const empLeaveBalance = emp.remainingLeaveBalance ?? emp.leave_balance ?? 12.0;

    let found = false;
    globalDepartments = globalDepartments.map((dept) => {
      if (dept.name.toLowerCase() === empDeptName.toLowerCase() || dept.id === emp.departmentId || dept.id === emp.department_id) {
        const existingEmp = dept.employees.find((e) => e.id === empId || e.email.toLowerCase() === empEmail.toLowerCase());
        if (existingEmp) {
          found = true;
          return {
            ...dept,
            employees: dept.employees.map((e) =>
              e.id === existingEmp.id
                ? {
                    ...e,
                    name: empName,
                    email: empEmail,
                    designation: empDesignation,
                    workMode: empWorkMode,
                    status: empStatus,
                    remainingLeaveBalance: empLeaveBalance,
                  }
                : e
            ),
          };
        } else if (!dept.employees.some((e) => e.id === empId)) {
          found = true;
          return {
            ...dept,
            employees: [
              {
                id: empId,
                name: empName,
                email: empEmail,
                designation: empDesignation,
                departmentId: dept.id,
                departmentName: dept.name,
                teamLeadId: dept.teamLead.id,
                teamLeadName: dept.teamLead.name,
                avatar: empName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
                workMode: empWorkMode,
                status: empStatus,
                sodStatus: "SUBMITTED",
                eodStatus: "IN_PROGRESS",
                overallProgress: 80,
                remainingLeaveBalance: empLeaveBalance,
                plannedTasks: [],
              },
              ...dept.employees,
            ],
          };
        }
      }
      return dept;
    });

    if (!found && globalDepartments.length > 0) {
      const targetDept = globalDepartments[0]!;
      if (!targetDept.employees.some((e) => e.id === empId)) {
        targetDept.employees.unshift({
          id: empId,
          name: empName,
          email: empEmail,
          designation: empDesignation,
          departmentId: targetDept.id,
          departmentName: targetDept.name,
          teamLeadId: targetDept.teamLead.id,
          teamLeadName: targetDept.teamLead.name,
          avatar: empName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
          workMode: empWorkMode,
          status: empStatus,
          sodStatus: "SUBMITTED",
          eodStatus: "IN_PROGRESS",
          overallProgress: 80,
          remainingLeaveBalance: empLeaveBalance,
          plannedTasks: [],
        });
      }
    }
  },
  resetToDefaults: () => {
    globalDepartments = JSON.parse(JSON.stringify(XORSTACK_DEPARTMENTS));
    globalFeedbacks = [...DEFAULT_FEEDBACKS];
    globalLeaveRequests = [...DEFAULT_LEAVE_REQUESTS];
    globalWfhRequests = [...DEFAULT_WFH_REQUESTS];
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(STORAGE_KEYS.DEPARTMENTS);
      window.localStorage.removeItem(STORAGE_KEYS.FEEDBACKS);
      window.localStorage.removeItem(STORAGE_KEYS.LEAVE);
      window.localStorage.removeItem(STORAGE_KEYS.WFH);
    }
    notify();
  },

  // Departments & Org CRUD
  getDepartments: () => globalDepartments,
  getAllEmployees: () => {
    const seen = new Set<string>();
    const list: OrgEmployee[] = [];
    for (const dept of globalDepartments) {
      for (const emp of dept.employees) {
        if (!seen.has(emp.id)) {
          seen.add(emp.id);
          list.push(emp);
        }
      }
    }
    return list;
  },
  getDepartmentById: (id: string) => globalDepartments.find((d) => d.id === id),
  getEmployeeById: (id: string): OrgEmployee | undefined => {
    for (const dept of globalDepartments) {
      const emp = dept.employees.find((e) => e.id === id);
      if (emp) return emp;
      if (dept.teamLead.id === id) {
        return {
          id: dept.teamLead.id,
          name: dept.teamLead.name,
          email: dept.teamLead.email,
          designation: dept.teamLead.designation,
          departmentId: dept.id,
          departmentName: dept.name,
          teamLeadId: "exec-root",
          teamLeadName: "Executive Leadership",
          avatar: dept.teamLead.avatar,
          workMode: "OFFICE",
          status: "Full-Time",
          sodStatus: "SUBMITTED",
          eodStatus: "SUBMITTED",
          overallProgress: 100,
          remainingLeaveBalance: 14.5,
          plannedTasks: [],
        };
      }
    }
    return undefined;
  },

  addEmployee: (employee: {
    id?: string;
    name: string;
    email: string;
    designation: string;
    departmentId?: string;
    departmentName?: string;
    workMode?: "OFFICE" | "WFH" | "HYBRID";
    remainingLeaveBalance?: number;
    employmentType?: "Full-Time" | "Probation" | "Contract" | "Intern" | string;
    status?: "Full-Time" | "Probation" | "Notice Period" | "ACTIVE" | "PROBATION" | string;
    joiningDate?: string;
    phoneNumber?: string;
    location?: string;
    workLocation?: string;
  }) => {
    const targetDeptId = employee.departmentId || globalDepartments[0]?.id;
    const dept =
      globalDepartments.find(
        (d) =>
          d.id === targetDeptId ||
          d.name.toLowerCase() === employee.departmentName?.toLowerCase()
      ) || globalDepartments[0];
    if (!dept) return;

    const newEmp: OrgEmployee = {
      id: employee.id || `emp-${Date.now()}`,
      name: employee.name,
      email: employee.email,
      designation: employee.designation,
      departmentId: dept.id,
      departmentName: dept.name,
      teamLeadId: dept.teamLead.id,
      teamLeadName: dept.teamLead.name,
      avatar:
        employee.name
          .split(" ")
          .map((w) => w[0])
          .join("")
          .slice(0, 2)
          .toUpperCase() || "EP",
      workMode: employee.workMode || "OFFICE",
      status:
        employee.status ||
        (employee.employmentType === "Probation" ? "Probation" : "Full-Time"),
      employmentType: employee.employmentType || "Full-Time",
      joiningDate: employee.joiningDate || new Date().toISOString().split("T")[0],
      phoneNumber: employee.phoneNumber || "+91 98450 11223",
      workLocation:
        employee.workLocation ||
        employee.location ||
        (employee.workMode === "WFH" ? "Remote (India)" : "Bangalore HQ (Floor 0)"),
      sodStatus: "PENDING",
      sodTime: "--",
      eodStatus: "PENDING",
      overallProgress: 0,
      remainingLeaveBalance: employee.remainingLeaveBalance ?? 12.0,
      plannedTasks: [],
    };

    // Immutably clone globalDepartments so all consumers & useMemo hooks detect reference change
    globalDepartments = globalDepartments.map((d) =>
      d.id === dept.id
        ? { ...d, employees: [newEmp, ...d.employees] }
        : { ...d, employees: [...d.employees] }
    );

    notify();
    try {
      syncEmployeeToSupabase(newEmp);
      realtimeEventBus.emit("employee:created", newEmp);
    } catch {
      // safe fallback
    }
    return newEmp;
  },

  updateEmployee: (
    id: string,
    updates: Partial<OrgEmployee>
  ): OrgEmployee | undefined => {
    let updatedEmployee: OrgEmployee | undefined = undefined;
    const currentDept = globalDepartments.find((d) =>
      d.employees.some((e) => e.id === id)
    );
    if (!currentDept) return undefined;

    const existing = currentDept.employees.find((e) => e.id === id);
    if (!existing) return undefined;

    const targetDeptId = updates.departmentId || currentDept.id;
    const targetDept =
      globalDepartments.find((d) => d.id === targetDeptId) || currentDept;

    const updated: OrgEmployee = {
      ...existing,
      ...updates,
      name: updates.name ?? existing.name,
      email: updates.email ?? existing.email,
      designation: updates.designation ?? existing.designation,
      workMode: updates.workMode ?? existing.workMode,
      status: updates.status ?? existing.status ?? "Full-Time",
      employmentType: updates.employmentType ?? existing.employmentType,
      remainingLeaveBalance:
        updates.remainingLeaveBalance !== undefined
          ? Number(updates.remainingLeaveBalance)
          : existing.remainingLeaveBalance,
      phoneNumber: updates.phoneNumber ?? existing.phoneNumber,
      workLocation:
        updates.workLocation ?? updates.location ?? existing.workLocation,
      joiningDate: updates.joiningDate ?? existing.joiningDate,
      departmentId: targetDept.id,
      departmentName: targetDept.name,
      teamLeadId: targetDept.teamLead.id,
      teamLeadName: targetDept.teamLead.name,
    };

    updatedEmployee = updated;

    if (targetDeptId !== currentDept.id) {
      // Department transfer: remove from old department and prepend to new department
      globalDepartments = globalDepartments.map((d) => {
        if (d.id === currentDept.id) {
          return {
            ...d,
            employees: d.employees.filter((e) => e.id !== id),
          };
        }
        if (d.id === targetDept.id) {
          return {
            ...d,
            employees: [updated, ...d.employees],
          };
        }
        return d;
      });
    } else {
      // In-place department update
      globalDepartments = globalDepartments.map((d) => {
        if (d.id === currentDept.id) {
          return {
            ...d,
            employees: d.employees.map((e) => (e.id === id ? updated : e)),
          };
        }
        return d;
      });
    }

    // Cascade update to department Team Leads if applicable
    globalDepartments = globalDepartments.map((d) => {
      if (d.teamLead.id === id) {
        return {
          ...d,
          teamLead: {
            ...d.teamLead,
            name: updated.name,
            designation: updated.designation,
            email: updated.email,
          },
        };
      }
      return d;
    });

    // Cascade update to global feedbacks
    globalFeedbacks = globalFeedbacks.map((f) => {
      if (f.employeeId === id) {
        return {
          ...f,
          employeeName: updated.name,
          departmentName: updated.departmentName,
        };
      }
      return f;
    });

    // Cascade update to global leave requests
    globalLeaveRequests = globalLeaveRequests.map((r) => {
      if (r.employeeId === id) {
        return {
          ...r,
          employeeName: updated.name,
          departmentName: updated.departmentName,
          designation: updated.designation,
          remainingBalance: updated.remainingLeaveBalance,
        };
      }
      return r;
    });

    // Cascade update to global WFH requests
    globalWfhRequests = globalWfhRequests.map((r) => {
      if (r.employeeId === id) {
        return {
          ...r,
          employeeName: updated.name,
          departmentName: updated.departmentName,
          designation: updated.designation,
        };
      }
      return r;
    });

    notify();
    try {
      syncEmployeeToSupabase(updated);
      realtimeEventBus.emit("employee:updated", updatedEmployee);
    } catch {
      // safe fallback
    }
    return updatedEmployee;
  },

  deleteEmployee: (id: string): OrgEmployee | undefined => {
    let removedEmployee: OrgEmployee | undefined = undefined;
    for (const dept of globalDepartments) {
      const emp = dept.employees.find((e) => e.id === id);
      if (emp) {
        removedEmployee = emp;
        break;
      }
    }

    if (removedEmployee) {
      globalDepartments = globalDepartments.map((d) => ({
        ...d,
        employees: d.employees.filter((e) => e.id !== id),
      }));

      // Cascade remove from feedbacks, leave, and wfh requests
      globalFeedbacks = globalFeedbacks.filter((f) => f.employeeId !== id);
      globalLeaveRequests = globalLeaveRequests.filter((r) => r.employeeId !== id);
      globalWfhRequests = globalWfhRequests.filter((r) => r.employeeId !== id);

      notify();
      try {
        deleteEmployeeFromSupabase(id);
        realtimeEventBus.emit("employee:deleted", removedEmployee);
      } catch {
        // safe fallback
      }
    }
    return removedEmployee;
  },

  // Feedbacks
  getFeedbacks: () => globalFeedbacks,
  updateLeadFeedback: (feedback: {
    employeeId: string;
    employeeName: string;
    note: string;
    rating: number;
    actionItem?: string;
  }) => {
    const existingIndex = globalFeedbacks.findIndex(
      (f) => f.employeeId === feedback.employeeId && f.isToday
    );

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    if (existingIndex >= 0) {
      globalFeedbacks = globalFeedbacks.map((f, i) =>
        i === existingIndex
          ? {
              ...f,
              leadFeedbackNote: feedback.note,
              leadRating: feedback.rating,
              leadFeedbackTime: timeString,
              leadActionItem: feedback.actionItem || f.leadActionItem,
              leadSentiment: feedback.rating >= 5 ? "EXCELLENT" : feedback.rating >= 4 ? "GREAT" : "ON_TRACK",
            }
          : f
      );
    } else {
      const emp = ALL_XORSTACK_EMPLOYEES.find((e) => e.id === feedback.employeeId);
      const newFeedback: SharedEODFeedback = {
        id: `df-${Date.now()}`,
        employeeId: feedback.employeeId,
        employeeName: feedback.employeeName,
        departmentName: emp?.departmentName || "Development",
        date: "Today (Aug 20, 2026)",
        dayName: "Thursday",
        employeeEodSummary: "Completed assigned deliverables and logged daily workday execution.",
        tasksCompleted: "Planned deliverables completed",
        hoursLogged: 8.5,
        leadFeedbackTime: timeString,
        leadFeedbackNote: feedback.note,
        leadRating: feedback.rating,
        leadSentiment: feedback.rating >= 5 ? "EXCELLENT" : feedback.rating >= 4 ? "GREAT" : "ON_TRACK",
        leadActionItem: feedback.actionItem,
        isToday: true,
      };
      globalFeedbacks = [newFeedback, ...globalFeedbacks];
    }
    notify();
    try {
      realtimeEventBus.emit("review:feedback_submitted", feedback);
    } catch {
      // safe fallback
    }
  },

  // Leave Requests
  getLeaveRequests: () => globalLeaveRequests,
  tlApproveLeave: (requestId: string, comment?: string, leadName?: string) => {
    let updatedReq: SharedLeaveRequest | undefined;
    globalLeaveRequests = globalLeaveRequests.map((req) => {
      if (req.id === requestId) {
        updatedReq = {
          ...req,
          status: "FORWARDED_TO_HR",
          tlApproverName: leadName || "Alex Lead (Team Lead)",
          tlApprovedAt: `Today at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
          tlComment: comment || "Approved by Team Lead. Forwarded to HR for final sign-off.",
        };
        return updatedReq;
      }
      return req;
    });
    notify();
    if (updatedReq) syncLeaveRequestToSupabase(updatedReq);
    try {
      realtimeEventBus.emit("leave:approved", { id: requestId, stage: "STAGE_1", comment });
    } catch {
      // safe fallback
    }
  },
  tlRejectLeave: (requestId: string, reason: string) => {
    let updatedReq: SharedLeaveRequest | undefined;
    globalLeaveRequests = globalLeaveRequests.map((req) => {
      if (req.id === requestId) {
        updatedReq = {
          ...req,
          status: "REJECTED",
          rejectionReason: reason || "Rejected by Team Lead",
        };
        return updatedReq;
      }
      return req;
    });
    notify();
    if (updatedReq) syncLeaveRequestToSupabase(updatedReq);
    try {
      realtimeEventBus.emit("leave:rejected", { id: requestId, stage: "STAGE_1", reason });
    } catch {
      // safe fallback
    }
  },
  hrApproveLeave: (requestId: string, comment?: string) => {
    let affectedEmployeeId: string | undefined;
    let daysDeducted = 1.0;
    let updatedReq: SharedLeaveRequest | undefined;

    globalLeaveRequests = globalLeaveRequests.map((req) => {
      if (req.id === requestId) {
        affectedEmployeeId = req.employeeId;
        daysDeducted = req.daysCount || 1.0;
        const newBalance = Math.max(0, req.remainingBalance - daysDeducted);
        updatedReq = {
          ...req,
          status: "APPROVED",
          hrApproverName: "Rachel HR (People Ops Lead)",
          hrApprovedAt: `Today at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
          hrComment: comment || "Final HR Approval granted.",
          remainingBalance: newBalance,
        };
        return updatedReq;
      }
      return req;
    });

    if (affectedEmployeeId) {
      // 1. Update in-memory employee leave balance
      globalDepartments = globalDepartments.map((dept) => ({
        ...dept,
        employees: dept.employees.map((emp) =>
          emp.id === affectedEmployeeId
            ? {
                ...emp,
                remainingLeaveBalance: Math.max(0, emp.remainingLeaveBalance - daysDeducted),
              }
            : emp
        ),
      }));

      // 2. Persist updated leave balance to Supabase
      if (typeof window !== "undefined") {
        const emp = WorkpulseSharedStore.getEmployeeById(affectedEmployeeId);
        if (emp) {
          fetch(`/api/v1/employees/${emp.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ remainingLeaveBalance: emp.remainingLeaveBalance }),
          }).catch((err) => console.warn("Supabase leave balance sync error:", err));
        }
      }
    }

    notify();
    if (updatedReq) syncLeaveRequestToSupabase(updatedReq);
    try {
      realtimeEventBus.emit("leave:approved", { id: requestId, stage: "STAGE_2", comment });
    } catch {
      // safe fallback
    }
  },
  hrRejectLeave: (requestId: string, reason: string) => {
    let updatedReq: SharedLeaveRequest | undefined;
    globalLeaveRequests = globalLeaveRequests.map((req) => {
      if (req.id === requestId) {
        updatedReq = {
          ...req,
          status: "REJECTED",
          rejectionReason: reason || "Rejected by HR",
        };
        return updatedReq;
      }
      return req;
    });
    notify();
    if (updatedReq) syncLeaveRequestToSupabase(updatedReq);
  },

  addLeaveRequest: (req: {
    employeeId?: string;
    employeeName?: string;
    departmentId?: string;
    departmentName?: string;
    designation?: string;
    leaveType: "CASUAL" | "SICK" | "PRIVILEGE" | "UNPAID";
    startDate: string;
    endDate: string;
    daysCount?: number;
    reason: string;
    handoverNotes?: string;
    backupPersonName?: string;
  }) => {
    const daysCount = req.daysCount ?? 1.0;
    const newReq: SharedLeaveRequest = {
      id: `leave-req-v2-${Date.now()}`,
      employeeId: req.employeeId || "emp-sarah",
      employeeName: req.employeeName || "Sarah Dev",
      departmentId: req.departmentId || "dept-development",
      departmentName: req.departmentName || "Development",
      designation: req.designation || "Senior Backend Engineer",
      leaveType: req.leaveType,
      startDate: req.startDate,
      endDate: req.endDate,
      daysCount,
      reason: req.reason,
      handoverNotes: req.handoverNotes || "Tasks reassigned to backup engineer.",
      backupPersonName: req.backupPersonName || "Rohit Sharma (Frontend)",
      remainingBalance: 11.0,
      status: "PENDING_TL_STAGE_1",
      createdAt: new Date().toISOString(),
    };
    globalLeaveRequests = [newReq, ...globalLeaveRequests];
    notify();
    syncLeaveRequestToSupabase(newReq);
    return newReq;
  },

  addWfhRequest: (req: {
    employeeId?: string;
    employeeName?: string;
    departmentId?: string;
    departmentName?: string;
    designation?: string;
    startDate: string;
    endDate: string;
    daysCount?: number;
    reason: string;
    availabilityHours?: string;
    contactMethod?: string;
    plannedDeliverables?: string;
  }) => {
    const newReq: SharedWfhRequest = {
      id: `wfh-req-v2-${Date.now()}`,
      employeeId: req.employeeId || "emp-sarah",
      employeeName: req.employeeName || "Sarah Dev",
      departmentId: req.departmentId || "dept-development",
      departmentName: req.departmentName || "Development",
      designation: req.designation || "Senior Backend Engineer",
      startDate: req.startDate,
      endDate: req.endDate,
      daysCount: req.daysCount ?? 1.0,
      reason: req.reason,
      availabilityHours: req.availabilityHours || "10:00 AM – 07:00 PM",
      contactMethod: req.contactMethod || "Slack & Zoom",
      plannedDeliverables: req.plannedDeliverables || "Complete assigned sprint tasks",
      status: "PENDING_TL_STAGE_1",
      createdAt: new Date().toISOString(),
    };
    globalWfhRequests = [newReq, ...globalWfhRequests];
    notify();
    syncWfhRequestToSupabase(newReq);
    return newReq;
  },

  // WFH Requests
  getWfhRequests: () => globalWfhRequests,
  tlApproveWfh: (requestId: string, comment?: string, leadName?: string) => {
    let updatedReq: SharedWfhRequest | undefined;
    globalWfhRequests = globalWfhRequests.map((req) => {
      if (req.id === requestId) {
        updatedReq = {
          ...req,
          status: "FORWARDED_TO_HR",
          tlApproverName: leadName || "Alex Lead (Team Lead)",
          tlApprovedAt: `Today at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
          tlComment: comment || "Approved by Team Lead. Forwarded to HR for final sign-off.",
        };
        return updatedReq;
      }
      return req;
    });
    notify();
    if (updatedReq) syncWfhRequestToSupabase(updatedReq);
    try {
      realtimeEventBus.emit("wfh:approved", { id: requestId, stage: "STAGE_1", comment });
    } catch {
      // safe fallback
    }
  },
  tlRejectWfh: (requestId: string, reason: string) => {
    let updatedReq: SharedWfhRequest | undefined;
    globalWfhRequests = globalWfhRequests.map((req) => {
      if (req.id === requestId) {
        updatedReq = {
          ...req,
          status: "REJECTED",
          rejectionReason: reason || "Rejected by Team Lead",
        };
        return updatedReq;
      }
      return req;
    });
    notify();
    if (updatedReq) syncWfhRequestToSupabase(updatedReq);
    try {
      realtimeEventBus.emit("wfh:rejected", { id: requestId, stage: "STAGE_1", reason });
    } catch {
      // safe fallback
    }
  },
  hrApproveWfh: (requestId: string, comment?: string) => {
    let updatedReq: SharedWfhRequest | undefined;
    globalWfhRequests = globalWfhRequests.map((req) => {
      if (req.id === requestId) {
        updatedReq = {
          ...req,
          status: "APPROVED",
          hrApproverName: "Rachel HR (People Ops Lead)",
          hrApprovedAt: `Today at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
          hrComment: comment || "Final HR Approval granted for remote workday.",
        };
        return updatedReq;
      }
      return req;
    });
    notify();
    if (updatedReq) syncWfhRequestToSupabase(updatedReq);
    try {
      realtimeEventBus.emit("wfh:approved", { id: requestId, stage: "STAGE_2", comment });
    } catch {
      // safe fallback
    }
  },
  hrRejectWfh: (requestId: string, reason: string) => {
    let updatedReq: SharedWfhRequest | undefined;
    globalWfhRequests = globalWfhRequests.map((req) => {
      if (req.id === requestId) {
        updatedReq = {
          ...req,
          status: "REJECTED",
          rejectionReason: reason || "Rejected by HR",
        };
        return updatedReq;
      }
      return req;
    });
    notify();
    if (updatedReq) syncWfhRequestToSupabase(updatedReq);
    try {
      realtimeEventBus.emit("wfh:rejected", { id: requestId, stage: "STAGE_2", reason });
    } catch {
      // safe fallback
    }
  },
};

// React hook for consuming shared state
export { useWorkpulseSharedStore } from "./use-workpulse-store";

const globalWeeklyGoals: any[] = [
  {
    id: "goal-1",
    title: "Ship 99.9% Reliable Biometric Pipeline",
    category: "ENGINEERING",
    measurableOutcome: "Zero data loss during offline network outages",
    weightage: 50,
    priority: "HIGH",
    status: "IN_PROGRESS",
    progressPercentage: 80,
    currentValue: 80,
    targetValue: 100,
    evidenceRequired: true,
  },
  {
    id: "goal-2",
    title: "100% Automated Acceptance Test Suite",
    category: "QUALITY",
    measurableOutcome: "All 91 specification criteria automated with Vitest",
    weightage: 50,
    priority: "HIGH",
    status: "IN_PROGRESS",
    progressPercentage: 75,
    currentValue: 75,
    targetValue: 100,
    evidenceRequired: false,
  },
];

const globalWeeklyReviews: any[] = [
  {
    id: "rev-sprint34",
    employeeId: "emp-sarah",
    employeeName: "Sarah Dev",
    period: "Sprint 34 (Aug 18 - Aug 22, 2026)",
    status: "APPROVED",
    selfSummary: "Completed REST route handlers and enhanced biometric edge connectors.",
    managerFeedback: "Exceptional architecture work and timely delivery.",
    leadRating: 5,
    calculatedScore: 94.5,
    approvedAt: "2026-08-22T11:00:00Z",
  },
];

const globalMyPunches: any[] = [
  {
    id: "punch-1",
    employeeId: "emp-sarah",
    time: "10:08 AM",
    direction: "IN",
    method: "BIOMETRIC",
    location: "Bangalore HQ - Main Entrance",
    status: "VERIFIED",
  },
];

const globalLeaveBalances: any[] = [
  { leaveType: "CASUAL", total: 12.0, used: 1.0, remaining: 11.0 },
  { leaveType: "SICK", total: 10.0, used: 0.0, remaining: 10.0 },
  { leaveType: "PRIVILEGE", total: 15.0, used: 0.0, remaining: 15.0 },
];

export const workpulseSharedStore = {
  getState: () => ({
    departments: WorkpulseSharedStore.getDepartments(),
    allEmployees: WorkpulseSharedStore.getAllEmployees(),
    getEmployeeById: WorkpulseSharedStore.getEmployeeById,
    addEmployee: WorkpulseSharedStore.addEmployee,
    updateEmployee: WorkpulseSharedStore.updateEmployee,
    deleteEmployee: WorkpulseSharedStore.deleteEmployee,
    leaveRequests: WorkpulseSharedStore.getLeaveRequests(),
    wfhRequests: WorkpulseSharedStore.getWfhRequests(),
    weeklyGoals: globalWeeklyGoals,
    weeklyReviews: globalWeeklyReviews,
    myPunches: globalMyPunches,
    leaveBalances: globalLeaveBalances,
    tlApproveLeave: WorkpulseSharedStore.tlApproveLeave,
    tlRejectLeave: WorkpulseSharedStore.tlRejectLeave,
    leadApproveLeave: WorkpulseSharedStore.tlApproveLeave,
    hrApproveLeave: WorkpulseSharedStore.hrApproveLeave,
    hrRejectLeave: WorkpulseSharedStore.hrRejectLeave,
    tlApproveWfh: WorkpulseSharedStore.tlApproveWfh,
    tlRejectWfh: WorkpulseSharedStore.tlRejectWfh,
    hrApproveWfh: WorkpulseSharedStore.hrApproveWfh,
    hrRejectWfh: WorkpulseSharedStore.hrRejectWfh,
    virtualPunch: () => {
      globalMyPunches.unshift({
        id: `punch-${Date.now()}`,
        employeeId: "emp-sarah",
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        direction: "OUT",
        method: "VIRTUAL_SIMULATOR",
        location: "HQ Office Floor 0",
        status: "VERIFIED",
      });
      syncBiometricPunchToSupabase({
        employeeId: "emp-sarah",
        employeeName: "Sarah Dev",
        punchType: "OUT",
        location: "HQ Office Floor 0",
        method: "VIRTUAL_SIMULATOR",
      });
    },
  }),
};

