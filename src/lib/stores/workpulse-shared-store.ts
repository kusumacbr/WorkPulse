"use client";

import { useState, useEffect } from "react";

// ==========================================
// 1. OFFICIAL XORSTACK DEPARTMENT & ORG ROSTER
// ==========================================

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
      email: "lead.dev@xorstack.com",
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
            expectedOutput: "Smooth page transition component across all 10 views",
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
      {
        id: "emp-john",
        name: "John UI",
        email: "john.ui@xorstack.com",
        designation: "Frontend Engineer",
        departmentId: "dept-development",
        departmentName: "Development",
        teamLeadId: "lead-alex",
        teamLeadName: "Alex Lead",
        avatar: "JU",
        workMode: "HYBRID",
        sodStatus: "PENDING",
        sodTime: "--",
        eodStatus: "PENDING",
        overallProgress: 30,
        remainingLeaveBalance: 12.0,
        plannedTasks: [
          {
            id: "jt-1",
            title: "Update color palette contrast in Sidebar navigation items",
            project: "Frontend & UI",
            priority: "LOW",
            estimatedMinutes: 90,
            completionPercentage: 30,
            status: "IN_PROGRESS",
            expectedOutput: "WCAG AAA pass on dark mode items",
          },
        ],
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
      "Bridging the gap between development and operations, DevOps fosters a culture of collaboration and automation, accelerating software delivery and ensuring reliability. It emphasizes continuous integration and deployment, ensuring seamless transitions from development to production.",
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
      {
        id: "emp-elena",
        name: "Elena Rostova",
        email: "elena.rostova@xorstack.com",
        designation: "Infrastructure Security Architect",
        departmentId: "dept-devops",
        departmentName: "Devops",
        teamLeadId: "lead-marcus",
        teamLeadName: "Marcus Vance",
        avatar: "ER",
        workMode: "OFFICE",
        sodStatus: "SUBMITTED",
        sodTime: "10:04 AM",
        eodStatus: "SUBMITTED",
        overallProgress: 100,
        remainingLeaveBalance: 12.0,
        plannedTasks: [
          {
            id: "er-1",
            title: "Audit Kubernetes ingress TLS cert rotation policies",
            project: "Infrastructure",
            priority: "HIGH",
            estimatedMinutes: 180,
            completionPercentage: 100,
            status: "COMPLETED",
            expectedOutput: "Automated Let's Encrypt renewal with zero downtime",
          },
        ],
        eodAchievements: "TLS rotation verified on all staging pods.",
        eodBlockers: "None",
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
      "Data processing transforms raw data into meaningful insights, leveraging algorithms and computational tools. It encompasses the collection, cleaning, and analysis of data, enabling businesses to derive actionable intelligence and make informed decisions.",
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
      {
        id: "emp-arjun",
        name: "Arjun Nair",
        email: "arjun.nair@xorstack.com",
        designation: "ETL Pipeline Engineer",
        departmentId: "dept-data-processing",
        departmentName: "Data processing",
        teamLeadId: "lead-vikram",
        teamLeadName: "Vikram Rao",
        avatar: "AN",
        workMode: "WFH",
        sodStatus: "SUBMITTED",
        sodTime: "10:00 AM",
        eodStatus: "SUBMITTED",
        overallProgress: 100,
        remainingLeaveBalance: 11.0,
        plannedTasks: [
          {
            id: "an-1",
            title: "Execute daily Apache Spark data aggregation batch",
            project: "Analytics",
            priority: "MEDIUM",
            estimatedMinutes: 120,
            completionPercentage: 100,
            status: "COMPLETED",
            expectedOutput: "EOD summaries computed for executive dashboard",
          },
        ],
        eodAchievements: "All ETL batches completed without schema errors.",
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
      "R&D drives innovation by exploring novel ideas and technologies. It's the heart of breakthroughs, where experimentation meets application, ensuring that products and services remain cutting-edge and relevant.",
    badgeColor: "bg-pink-500/15 text-pink-300 border-pink-500/30",
    accentColor: "text-pink-400",
    teamLead: {
      id: "lead-maya",
      name: "Dr. Maya Chen",
      email: "lead.rd@xorstack.com",
      designation: "Principal Scientist & R&D Lead",
      avatar: "MC",
    },
    employees: [
      {
        id: "emp-priya",
        name: "Priya QA",
        email: "priya.qa@xorstack.com",
        designation: "QA & Test Automation Lead Engineer",
        departmentId: "dept-rd",
        departmentName: "R & D",
        teamLeadId: "lead-maya",
        teamLeadName: "Dr. Maya Chen",
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
      {
        id: "emp-farhan",
        name: "Farhan Ali",
        email: "farhan.ali@xorstack.com",
        designation: "Applied AI Research Engineer",
        departmentId: "dept-rd",
        departmentName: "R & D",
        teamLeadId: "lead-maya",
        teamLeadName: "Dr. Maya Chen",
        avatar: "FA",
        workMode: "OFFICE",
        sodStatus: "SUBMITTED",
        sodTime: "10:14 AM",
        eodStatus: "IN_PROGRESS",
        overallProgress: 80,
        remainingLeaveBalance: 12.0,
        plannedTasks: [
          {
            id: "fa-1",
            title: "Train lightweight transformer model for automated SOD goal suggestions",
            project: "AI Lab",
            priority: "HIGH",
            estimatedMinutes: 240,
            completionPercentage: 80,
            status: "IN_PROGRESS",
            expectedOutput: "Model weights quantized to ONNX runtime under 50MB",
          },
        ],
        eodAchievements: "Quantized weights achieved 94.2% semantic accuracy.",
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
      id: "lead-suresh",
      name: "Suresh Menon",
      email: "lead.configtap@xorstack.com",
      designation: "ConfigTap & Autosar Solutions Lead",
      avatar: "SM",
    },
    employees: [
      {
        id: "emp-ananya",
        name: "Ananya Sen",
        email: "ananya.sen@xorstack.com",
        designation: "Automation & Embedded QA Engineer",
        departmentId: "dept-configtap",
        departmentName: "Service Providers (ConfigTap)",
        teamLeadId: "lead-suresh",
        teamLeadName: "Suresh Menon",
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
      {
        id: "emp-nikhil",
        name: "Nikhil Verma",
        email: "nikhil.verma@xorstack.com",
        designation: "3DExperience CAD/PLM Engineer",
        departmentId: "dept-configtap",
        departmentName: "Service Providers (ConfigTap)",
        teamLeadId: "lead-suresh",
        teamLeadName: "Suresh Menon",
        avatar: "NV",
        workMode: "OFFICE",
        sodStatus: "SUBMITTED",
        sodTime: "10:07 AM",
        eodStatus: "SUBMITTED",
        overallProgress: 100,
        remainingLeaveBalance: 11.0,
        plannedTasks: [
          {
            id: "nv-1",
            title: "Configure Dassault 3DExperience server data migration scripts",
            project: "Enterprise PLM",
            priority: "MEDIUM",
            estimatedMinutes: 150,
            completionPercentage: 100,
            status: "COMPLETED",
            expectedOutput: "Zero data corruption across 50,000 CAD assemblies",
          },
        ],
        eodAchievements: "50,000 assemblies imported successfully.",
      },
    ],
  },

  // 6. SAP Services
  {
    id: "dept-sap",
    name: "SAP Services",
    shortName: "SAP",
    iconType: "sap",
    description:
      "Strategic partner for end-to-end SAP implementation, custom solutions, and digital enterprise transformation.",
    badgeColor: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    accentColor: "text-blue-400",
    teamLead: {
      id: "lead-rajeshwar",
      name: "Rajeshwar Rao",
      email: "lead.sap@xorstack.com",
      designation: "SAP Enterprise Practice Lead",
      avatar: "RR",
    },
    employees: [
      {
        id: "emp-meera",
        name: "Meera Iyer",
        email: "meera.iyer@xorstack.com",
        designation: "SAP S/4HANA Cloud Consultant",
        departmentId: "dept-sap",
        departmentName: "SAP Services",
        teamLeadId: "lead-rajeshwar",
        teamLeadName: "Rajeshwar Rao",
        avatar: "MI",
        workMode: "OFFICE",
        sodStatus: "SUBMITTED",
        sodTime: "10:02 AM",
        eodStatus: "IN_PROGRESS",
        overallProgress: 90,
        remainingLeaveBalance: 12.0,
        plannedTasks: [
          {
            id: "mi-1",
            title: "Implement SAP S/4HANA custom BAPI integration for financial audit journal",
            project: "Enterprise ERP",
            priority: "HIGH",
            estimatedMinutes: 200,
            completionPercentage: 90,
            status: "IN_PROGRESS",
            expectedOutput: "Automated general ledger reconciliation workflow",
          },
        ],
        eodAchievements: "Reconciliation workflow passing integration tests in sandbox.",
      },
      {
        id: "emp-deepak",
        name: "Deepak Joshi",
        email: "deepak.joshi@xorstack.com",
        designation: "SAP ABAP & Fiori Specialist",
        departmentId: "dept-sap",
        departmentName: "SAP Services",
        teamLeadId: "lead-rajeshwar",
        teamLeadName: "Rajeshwar Rao",
        avatar: "DJ",
        workMode: "OFFICE",
        sodStatus: "SUBMITTED",
        sodTime: "10:11 AM",
        eodStatus: "SUBMITTED",
        overallProgress: 100,
        remainingLeaveBalance: 11.0,
        plannedTasks: [
          {
            id: "dj-1",
            title: "Develop SAP Fiori responsive launchpad app for inventory tracking",
            project: "Supply Chain",
            priority: "MEDIUM",
            estimatedMinutes: 160,
            completionPercentage: 100,
            status: "COMPLETED",
            expectedOutput: "OData service connected with sub-second response times",
          },
        ],
        eodAchievements: "Fiori UI components deployed to SAP BTP Cloud Foundry.",
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
    leadFeedbackNote: "Outstanding work on the SOD state machine and role streamlining today, Sarah. Code review comments on PR #42 were addressed cleanly and test coverage remained 100%. Great pace heading into tomorrow's sprint review.",
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
    backupPersonName: "John UI (Frontend)",
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
    backupPersonName: "Farhan Ali (Applied AI)",
    remainingBalance: 9.0,
    tlApproverName: "Dr. Maya Chen (R&D Lead)",
    tlApprovedAt: "Yesterday at 04:30 PM",
    tlComment: "Approved by R&D Lead. Regression test coverage is verified. Forwarded to HR.",
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
    backupPersonName: "Elena Rostova (DevOps)",
    remainingBalance: 11.5,
    tlApproverName: "Marcus Vance (DevOps Lead)",
    tlApprovedAt: "Today at 10:00 AM",
    tlComment: "Approved by DevOps Lead. On-call coverage secured. Forwarded to HR.",
    status: "FORWARDED_TO_HR",
    createdAt: "2026-08-20T08:30:00Z",
  },
  {
    id: "leave-req-105",
    employeeId: "emp-meera",
    employeeName: "Meera Iyer",
    departmentId: "dept-sap",
    departmentName: "SAP Services",
    designation: "SAP S/4HANA Cloud Consultant",
    leaveType: "CASUAL",
    startDate: "2026-09-01",
    endDate: "2026-09-01",
    daysCount: 1.0,
    reason: "Academic certification examination",
    handoverNotes: "SAP sandbox BAPI tests completed.",
    backupPersonName: "Deepak Joshi (SAP)",
    remainingBalance: 12.0,
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

// Global in-memory shared state
const globalDepartments: OrgDepartment[] = JSON.parse(JSON.stringify(XORSTACK_DEPARTMENTS));
let globalFeedbacks: SharedEODFeedback[] = [...DEFAULT_FEEDBACKS];
let globalLeaveRequests: SharedLeaveRequest[] = [...DEFAULT_LEAVE_REQUESTS];
let globalWfhRequests: SharedWfhRequest[] = [...DEFAULT_WFH_REQUESTS];

type Listener = () => void;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((l) => l());
}

export const WorkpulseSharedStore = {
  // Departments & Org CRUD
  getDepartments: () => globalDepartments,
  getAllEmployees: () => globalDepartments.flatMap((d) => d.employees),
  getDepartmentById: (id: string) => globalDepartments.find((d) => d.id === id),

  addEmployee: (employee: {
    name: string;
    email: string;
    designation: string;
    departmentId: string;
    workMode?: "OFFICE" | "WFH" | "HYBRID";
    remainingLeaveBalance?: number;
    employmentType?: "Full-Time" | "Probation" | "Contract" | "Intern";
    joiningDate?: string;
    phoneNumber?: string;
    location?: string;
  }) => {
    const dept = globalDepartments.find((d) => d.id === employee.departmentId) || globalDepartments[0];
    if (!dept) return;

    const newEmp: OrgEmployee = {
      id: `emp-${Date.now()}`,
      name: employee.name,
      email: employee.email,
      designation: employee.designation,
      departmentId: dept.id,
      departmentName: dept.name,
      teamLeadId: dept.teamLead.id,
      teamLeadName: dept.teamLead.name,
      avatar: employee.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "EP",
      workMode: employee.workMode || "OFFICE",
      sodStatus: "PENDING",
      sodTime: "--",
      eodStatus: "PENDING",
      overallProgress: 0,
      remainingLeaveBalance: employee.remainingLeaveBalance ?? 12.0,
      plannedTasks: [],
    };

    dept.employees.unshift(newEmp);
    notify();
    return newEmp;
  },

  updateEmployee: (
    id: string,
    updates: {
      name?: string;
      email?: string;
      designation?: string;
      departmentId?: string;
      workMode?: "OFFICE" | "WFH" | "HYBRID";
      remainingLeaveBalance?: number;
    }
  ): OrgEmployee | undefined => {
    for (const dept of globalDepartments) {
      const idx = dept.employees.findIndex((e) => e.id === id);
      if (idx >= 0 && dept.employees[idx]) {
        const existing = dept.employees[idx]!;
        if (updates.departmentId && updates.departmentId !== dept.id) {
          const targetDept = globalDepartments.find((d) => d.id === updates.departmentId);
          if (targetDept) {
            const removed = dept.employees.splice(idx, 1)[0];
            if (removed) {
              const updatedEmp: OrgEmployee = {
                ...removed,
                name: updates.name ?? removed.name,
                email: updates.email ?? removed.email,
                designation: updates.designation ?? removed.designation,
                workMode: updates.workMode ?? removed.workMode,
                remainingLeaveBalance: updates.remainingLeaveBalance ?? removed.remainingLeaveBalance,
                departmentId: targetDept.id,
                departmentName: targetDept.name,
                teamLeadId: targetDept.teamLead.id,
                teamLeadName: targetDept.teamLead.name,
              };
              targetDept.employees.unshift(updatedEmp);
              notify();
              return updatedEmp;
            }
          }
        } else {
          const updatedEmp: OrgEmployee = {
            ...existing,
            name: updates.name ?? existing.name,
            email: updates.email ?? existing.email,
            designation: updates.designation ?? existing.designation,
            workMode: updates.workMode ?? existing.workMode,
            remainingLeaveBalance: updates.remainingLeaveBalance ?? existing.remainingLeaveBalance,
          };
          dept.employees[idx] = updatedEmp;
          notify();
          return updatedEmp;
        }
      }
    }
    return undefined;
  },

  deleteEmployee: (id: string): OrgEmployee | undefined => {
    for (const dept of globalDepartments) {
      const idx = dept.employees.findIndex((e) => e.id === id);
      if (idx >= 0) {
        const removed = dept.employees.splice(idx, 1)[0];
        if (removed) {
          notify();
          return removed;
        }
      }
    }
    return undefined;
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
  },

  // Leave Requests
  getLeaveRequests: () => globalLeaveRequests,
  tlApproveLeave: (requestId: string, comment?: string, leadName?: string) => {
    globalLeaveRequests = globalLeaveRequests.map((req) =>
      req.id === requestId
        ? {
            ...req,
            status: "FORWARDED_TO_HR",
            tlApproverName: leadName || "Alex Lead (Team Lead)",
            tlApprovedAt: `Today at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
            tlComment: comment || "Approved by Team Lead. Forwarded to HR for final sign-off.",
          }
        : req
    );
    notify();
  },
  tlRejectLeave: (requestId: string, reason: string) => {
    globalLeaveRequests = globalLeaveRequests.map((req) =>
      req.id === requestId
        ? {
            ...req,
            status: "REJECTED",
            rejectionReason: reason || "Rejected by Team Lead",
          }
        : req
    );
    notify();
  },
  hrApproveLeave: (requestId: string, comment?: string) => {
    globalLeaveRequests = globalLeaveRequests.map((req) =>
      req.id === requestId
        ? {
            ...req,
            status: "APPROVED",
            hrApproverName: "Rachel HR (People Ops Lead)",
            hrApprovedAt: `Today at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
            hrComment: comment || "Final HR Approval granted.",
            remainingBalance: Math.max(0, req.remainingBalance - req.daysCount),
          }
        : req
    );
    notify();
  },
  hrRejectLeave: (requestId: string, reason: string) => {
    globalLeaveRequests = globalLeaveRequests.map((req) =>
      req.id === requestId
        ? {
            ...req,
            status: "REJECTED",
            rejectionReason: reason || "Rejected by HR",
          }
        : req
    );
    notify();
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
      id: `leave-req-${Date.now()}`,
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
      backupPersonName: req.backupPersonName || "John UI (Frontend)",
      remainingBalance: 11.0,
      status: "PENDING_TL_STAGE_1",
      createdAt: new Date().toISOString(),
    };
    globalLeaveRequests = [newReq, ...globalLeaveRequests];
    notify();
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
    const daysCount = req.daysCount ?? 1.0;
    const newReq: SharedWfhRequest = {
      id: `wfh-req-${Date.now()}`,
      employeeId: req.employeeId || "emp-sarah",
      employeeName: req.employeeName || "Sarah Dev",
      departmentId: req.departmentId || "dept-development",
      departmentName: req.departmentName || "Development",
      designation: req.designation || "Senior Backend Engineer",
      startDate: req.startDate,
      endDate: req.endDate,
      daysCount,
      reason: req.reason,
      availabilityHours: req.availabilityHours || "10:00 AM – 07:00 PM",
      contactMethod: req.contactMethod || "Slack #dev-pod & Google Meet",
      plannedDeliverables: req.plannedDeliverables || "Deliver assigned sprint deliverables remotely.",
      status: "PENDING_TL_STAGE_1",
      createdAt: new Date().toISOString(),
    };
    globalWfhRequests = [newReq, ...globalWfhRequests];
    notify();
    return newReq;
  },

  // WFH Requests
  getWfhRequests: () => globalWfhRequests,
  tlApproveWfh: (requestId: string, comment?: string, leadName?: string) => {
    globalWfhRequests = globalWfhRequests.map((req) =>
      req.id === requestId
        ? {
            ...req,
            status: "FORWARDED_TO_HR",
            tlApproverName: leadName || "Alex Lead (Team Lead)",
            tlApprovedAt: `Today at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
            tlComment: comment || "Approved by Team Lead. Forwarded to HR for final sign-off.",
          }
        : req
    );
    notify();
  },
  tlRejectWfh: (requestId: string, reason: string) => {
    globalWfhRequests = globalWfhRequests.map((req) =>
      req.id === requestId
        ? {
            ...req,
            status: "REJECTED",
            rejectionReason: reason || "Rejected by Team Lead",
          }
        : req
    );
    notify();
  },
  hrApproveWfh: (requestId: string, comment?: string) => {
    globalWfhRequests = globalWfhRequests.map((req) =>
      req.id === requestId
        ? {
            ...req,
            status: "APPROVED",
            hrApproverName: "Rachel HR (People Ops Lead)",
            hrApprovedAt: `Today at ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`,
            hrComment: comment || "Final HR Approval granted for remote workday.",
          }
        : req
    );
    notify();
  },
  hrRejectWfh: (requestId: string, reason: string) => {
    globalWfhRequests = globalWfhRequests.map((req) =>
      req.id === requestId
        ? {
            ...req,
            status: "REJECTED",
            rejectionReason: reason || "Rejected by HR",
          }
        : req
    );
    notify();
  },
};

// React hook for consuming shared state
export function useWorkpulseSharedStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    departments: WorkpulseSharedStore.getDepartments(),
    allEmployees: WorkpulseSharedStore.getAllEmployees(),
    getDepartmentById: WorkpulseSharedStore.getDepartmentById,
    feedbacks: WorkpulseSharedStore.getFeedbacks(),
    updateLeadFeedback: WorkpulseSharedStore.updateLeadFeedback,
    leaveRequests: WorkpulseSharedStore.getLeaveRequests(),
    addLeaveRequest: WorkpulseSharedStore.addLeaveRequest,
    tlApproveLeave: WorkpulseSharedStore.tlApproveLeave,
    tlRejectLeave: WorkpulseSharedStore.tlRejectLeave,
    hrApproveLeave: WorkpulseSharedStore.hrApproveLeave,
    hrRejectLeave: WorkpulseSharedStore.hrRejectLeave,
    wfhRequests: WorkpulseSharedStore.getWfhRequests(),
    addWfhRequest: WorkpulseSharedStore.addWfhRequest,
    tlApproveWfh: WorkpulseSharedStore.tlApproveWfh,
    tlRejectWfh: WorkpulseSharedStore.tlRejectWfh,
    hrApproveWfh: WorkpulseSharedStore.hrApproveWfh,
    hrRejectWfh: WorkpulseSharedStore.hrRejectWfh,
    addEmployee: WorkpulseSharedStore.addEmployee,
    updateEmployee: WorkpulseSharedStore.updateEmployee,
    deleteEmployee: WorkpulseSharedStore.deleteEmployee,
  };
}

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
    leaveRequests: WorkpulseSharedStore.getLeaveRequests(),
    wfhRequests: WorkpulseSharedStore.getWfhRequests(),
    weeklyGoals: globalWeeklyGoals,
    weeklyReviews: globalWeeklyReviews,
    myPunches: globalMyPunches,
    leaveBalances: globalLeaveBalances,
    leadApproveLeave: WorkpulseSharedStore.tlApproveLeave,
    hrApproveLeave: WorkpulseSharedStore.hrApproveLeave,
    hrRejectLeave: WorkpulseSharedStore.hrRejectLeave,
    hrApproveWfh: WorkpulseSharedStore.hrApproveWfh,
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
    },
  }),
};

