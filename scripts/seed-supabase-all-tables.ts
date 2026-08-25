import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function seedAllTables() {
  console.log("Seeding initial records across Supabase tables using exact employee identities from supabase_setup.sql...");

  const today = new Date().toISOString().split("T")[0];

  // 1. Leave Requests
  const leaveRows = [
    {
      id: "leave-req-101",
      employee_id: "emp-sarah",
      employee_name: "Sarah Dev",
      employee_email: "employee.test@xorstack.com",
      department_name: "Development",
      department_id: "dept-development",
      designation: "Senior Backend Engineer",
      leave_type: "CASUAL",
      start_date: today,
      end_date: today,
      days_count: 2.0,
      reason: "Attending Distributed Systems Summit in Hyderabad",
      handover_notes: "Handed over PostgreSQL migration PRs to Rohit Sharma",
      backup_person_name: "Rohit Sharma (Frontend)",
      remaining_balance: 11.00,
      status: "FORWARDED_TO_HR",
      tl_approver_name: "Alex Lead",
      tl_comment: "Sprint 34 deliverables on track. Recommended for Stage-2 HR approval.",
    },
    {
      id: "leave-req-102",
      employee_id: "emp-rohit",
      employee_name: "Rohit Sharma",
      employee_email: "rohit.sharma@xorstack.com",
      department_name: "Development",
      department_id: "dept-development",
      designation: "Frontend Engineer (UI/UX)",
      leave_type: "CASUAL",
      start_date: today,
      end_date: today,
      days_count: 1.0,
      reason: "Personal errand and family commitment",
      handover_notes: "All sprint UI components committed to main branch",
      backup_person_name: "Sarah Dev (Senior Backend)",
      remaining_balance: 10.00,
      status: "PENDING_TL_STAGE_1",
    },
    {
      id: "leave-req-103",
      employee_id: "emp-karthik",
      employee_name: "Karthik Raja",
      employee_email: "karthik.raja@xorstack.com",
      department_name: "Devops",
      department_id: "dept-devops",
      designation: "DevOps & Cloud Engineer",
      leave_type: "PRIVILEGE",
      start_date: today,
      end_date: today,
      days_count: 3.0,
      reason: "Annual privilege leave for family vacation",
      handover_notes: "All cloud monitoring alerts routed to Marcus Vance",
      backup_person_name: "Marcus Vance (DevOps Lead)",
      remaining_balance: 11.50,
      status: "APPROVED",
      tl_approver_name: "Marcus Vance",
      tl_comment: "Approved by Team Lead",
      hr_approver_name: "Rachel HR",
      hr_comment: "Final HR sign-off granted.",
    },
    {
      id: "leave-req-104",
      employee_id: "emp-sneha",
      employee_name: "Sneha Kapoor",
      employee_email: "sneha.kapoor@xorstack.com",
      department_name: "Data processing",
      department_id: "dept-data-processing",
      designation: "Data Analytics Engineer",
      leave_type: "CASUAL",
      start_date: today,
      end_date: today,
      days_count: 1.0,
      reason: "Medical health checkup appointment",
      handover_notes: "Handed over pipeline monitoring scripts to Vikram Rao",
      backup_person_name: "Vikram Rao (Data Lead)",
      remaining_balance: 9.00,
      status: "FORWARDED_TO_HR",
      tl_approver_name: "Vikram Rao",
      tl_comment: "Recommended for Stage-2 HR sign-off.",
    },
  ];

  const { error: e1 } = await supabase.from("leave_requests").upsert(leaveRows);
  console.log("leave_requests seeded:", e1 ? e1.message : "✓ Success");

  // 2. WFH Requests
  const wfhRows = [
    {
      id: "wfh-req-201",
      employee_id: "emp-sarah",
      employee_name: "Sarah Dev",
      employee_email: "employee.test@xorstack.com",
      department_name: "Development",
      department_id: "dept-development",
      designation: "Senior Backend Engineer",
      start_date: today,
      end_date: today,
      days_count: 1.0,
      reason: "High-focus deep work for offline biometric cache tests",
      availability_hours: "10:00 AM – 07:00 PM",
      contact_method: "Slack @sarah & Zoom",
      planned_deliverables: "Complete vitest test coverage assertions on biometric offline queue",
      status: "FORWARDED_TO_HR",
      tl_approver_name: "Alex Lead",
      tl_comment: "Approved for Stage-2 HR review.",
    },
    {
      id: "wfh-req-202",
      employee_id: "emp-rohit",
      employee_name: "Rohit Sharma",
      employee_email: "rohit.sharma@xorstack.com",
      department_name: "Development",
      department_id: "dept-development",
      designation: "Frontend Engineer (UI/UX)",
      start_date: today,
      end_date: today,
      days_count: 1.0,
      reason: "Quiet focus environment for mobile responsive drawer animations",
      availability_hours: "10:00 AM – 07:00 PM",
      contact_method: "Slack @rohit & Zoom",
      planned_deliverables: "Implement CSS transition optimizations across mobile viewports.",
      status: "PENDING_TL_STAGE_1",
    },
    {
      id: "wfh-req-203",
      employee_id: "emp-ananya",
      employee_name: "Ananya Sen",
      employee_email: "ananya.sen@xorstack.com",
      department_name: "Service Providers (ConfigTap)",
      department_id: "dept-configtap",
      designation: "Automation & Embedded QA Engineer",
      start_date: today,
      end_date: today,
      days_count: 2.0,
      reason: "Embedded device firmware bench testing in home lab",
      availability_hours: "10:00 AM – 07:00 PM",
      contact_method: "Slack @ananya & Meet",
      planned_deliverables: "Automated regression test suite runs on Matrix biometric hardware.",
      status: "APPROVED",
      tl_approver_name: "Alex Lead",
      tl_comment: "Approved for remote bench testing.",
      hr_approver_name: "Rachel HR",
      hr_comment: "Stage-2 HR sign-off granted.",
    },
  ];

  const { error: e2 } = await supabase.from("wfh_requests").upsert(wfhRows);
  console.log("wfh_requests seeded:", e2 ? e2.message : "✓ Success");

  // 3. Workdays
  const workdayRows = [
    {
      id: "wd-sarah-today",
      employee_id: "emp-sarah",
      employee_name: "Sarah Dev",
      department_name: "Development",
      date: today,
      work_mode: "OFFICE",
      sod_status: "SUBMITTED",
      sod_time: "10:15 AM",
      eod_status: "IN_PROGRESS",
      overall_progress: 80,
      actual_hours: 8.2,
      achievements: "Merged authorization enhancements and reviewed 3 critical PRs.",
      blockers: "None",
      tomorrow_focus: "Finalize EOD wrap-up testing suite.",
    },
    {
      id: "wd-rohit-today",
      employee_id: "emp-rohit",
      employee_name: "Rohit Sharma",
      department_name: "Development",
      date: today,
      work_mode: "OFFICE",
      sod_status: "SUBMITTED",
      sod_time: "10:20 AM",
      eod_status: "IN_PROGRESS",
      overall_progress: 65,
      actual_hours: 8.0,
      achievements: "Shipped PageTransition & AnimatedTabContent components.",
      blockers: "None",
      tomorrow_focus: "Optimize mobile viewport responsiveness.",
    },
    {
      id: "wd-priya-today",
      employee_id: "emp-priya",
      employee_name: "Priya QA",
      department_name: "R & D",
      date: today,
      work_mode: "WFH",
      sod_status: "SUBMITTED",
      sod_time: "10:05 AM",
      eod_status: "SUBMITTED",
      eod_time: "06:55 PM",
      overall_progress: 100,
      actual_hours: 8.5,
      achievements: "85/85 unit tests and Playwright regressions green across all suites.",
      blockers: "None",
      tomorrow_focus: "Prepare automated performance benchmarks.",
    },
    {
      id: "wd-karthik-today",
      employee_id: "emp-karthik",
      employee_name: "Karthik Raja",
      department_name: "Devops",
      date: today,
      work_mode: "OFFICE",
      sod_status: "SUBMITTED",
      sod_time: "10:10 AM",
      eod_status: "IN_PROGRESS",
      overall_progress: 90,
      actual_hours: 8.1,
      achievements: "Automated CI/CD build cache pruning and verified Kubernetes health.",
      blockers: "None",
      tomorrow_focus: "Execute quarterly disaster recovery drill.",
    },
  ];

  const { error: e3 } = await supabase.from("workdays").upsert(workdayRows);
  console.log("workdays seeded:", e3 ? e3.message : "✓ Success");

  // 4. Biometric Punches
  const punchRows = [
    {
      id: "punch-101",
      employee_id: "emp-sarah",
      employee_name: "Sarah Dev",
      punch_type: "IN",
      terminal_id: "HQ-TERMINAL-01",
      location: "Bangalore HQ (Floor 4, Pod B)",
      method: "BIOMETRIC",
      status: "VERIFIED",
    },
    {
      id: "punch-102",
      employee_id: "emp-rohit",
      employee_name: "Rohit Sharma",
      punch_type: "IN",
      terminal_id: "HQ-TERMINAL-01",
      location: "Bangalore HQ (Floor 4, Pod B)",
      method: "BIOMETRIC",
      status: "VERIFIED",
    },
    {
      id: "punch-103",
      employee_id: "emp-karthik",
      employee_name: "Karthik Raja",
      punch_type: "IN",
      terminal_id: "HQ-TERMINAL-02",
      location: "Bangalore HQ (Floor 3, Cloud Ops)",
      method: "BIOMETRIC",
      status: "VERIFIED",
    },
    {
      id: "punch-104",
      employee_id: "emp-sneha",
      employee_name: "Sneha Kapoor",
      punch_type: "IN",
      terminal_id: "HQ-TERMINAL-02",
      location: "Bangalore HQ (Floor 3, Data Lab)",
      method: "BIOMETRIC",
      status: "VERIFIED",
    },
    {
      id: "punch-105",
      employee_id: "emp-ananya",
      employee_name: "Ananya Sen",
      punch_type: "IN",
      terminal_id: "HQ-TERMINAL-01",
      location: "Bangalore HQ (Floor 1, Embedded Hub)",
      method: "BIOMETRIC",
      status: "VERIFIED",
    },
  ];

  const { error: e4 } = await supabase.from("biometric_punches").upsert(punchRows);
  console.log("biometric_punches seeded:", e4 ? e4.message : "✓ Success");

  // 5. Regularization Requests
  const regRows = [
    {
      id: "reg-301",
      employee_id: "emp-rohit",
      employee_name: "Rohit Sharma",
      department_name: "Development",
      designation: "Frontend Engineer (UI/UX)",
      date: today,
      punch_type: "MISSED_OUT",
      actual_time: "07:15 PM",
      reason: "Biometric terminal gate 1 was offline during evening exit",
      lead_recommendation: "Verified working at desk until 07:20 PM",
      status: "PENDING",
    },
    {
      id: "reg-302",
      employee_id: "emp-karthik",
      employee_name: "Karthik Raja",
      department_name: "Devops",
      designation: "DevOps & Cloud Engineer",
      date: today,
      punch_type: "MISSED_IN",
      actual_time: "10:05 AM",
      reason: "Smart card re-issue in progress at security reception desk",
      lead_recommendation: "Verified morning attendance on Slack",
      status: "APPROVED",
      action_by: "Marcus Vance",
    },
    {
      id: "reg-303",
      employee_id: "emp-sneha",
      employee_name: "Sneha Kapoor",
      department_name: "Data processing",
      designation: "Data Analytics Engineer",
      date: today,
      punch_type: "MISSED_IN",
      actual_time: "09:55 AM",
      reason: "Client stakeholder sync meeting before checking into HQ floor",
      lead_recommendation: "Client meeting pre-scheduled and approved",
      status: "APPROVED",
      action_by: "Vikram Rao",
    },
  ];

  const { error: e5 } = await supabase.from("regularization_requests").upsert(regRows);
  console.log("regularization_requests seeded:", e5 ? e5.message : "✓ Success");

  // 6. Lead Feedbacks
  const feedbackRows = [
    {
      id: "fb-401",
      employee_id: "emp-sarah",
      employee_name: "Sarah Dev",
      lead_id: "lead-alex",
      lead_name: "Alex Lead",
      date: today,
      rating: 5.0,
      sentiment: "EXCELLENT",
      notes: "Exceptional architecture design on PostgreSQL connection pooling and 2-stage leave workflow.",
      action_item: "Coordinate PR review with frontend team on Stage-2 sign-off",
    },
    {
      id: "fb-402",
      employee_id: "emp-rohit",
      employee_name: "Rohit Sharma",
      lead_id: "lead-alex",
      lead_name: "Alex Lead",
      date: today,
      rating: 4.8,
      sentiment: "GREAT",
      notes: "Great progress on 3D interactive dashboard decks and WCAG AAA contrast tokens.",
      action_item: "Finalize mobile responsive drawer component optimization",
    },
    {
      id: "fb-403",
      employee_id: "emp-karthik",
      employee_name: "Karthik Raja",
      lead_id: "lead-marcus",
      lead_name: "Marcus Vance",
      date: today,
      rating: 5.0,
      sentiment: "EXCELLENT",
      notes: "Zero downtime deployment pipeline executed smoothly and automated cache cleanups verified.",
      action_item: "Document SRE runbook updates for on-call engineers",
    },
    {
      id: "fb-404",
      employee_id: "emp-sneha",
      employee_name: "Sneha Kapoor",
      lead_id: "lead-vikram",
      lead_name: "Vikram Rao",
      date: today,
      rating: 4.9,
      sentiment: "EXCELLENT",
      notes: "Data telemetry aggregation queries running efficiently with under 100ms response time.",
      action_item: "Prepare executive headcount analytics export for Rachel HR",
    },
  ];

  const { error: e6 } = await supabase.from("feedbacks").upsert(feedbackRows);
  console.log("feedbacks seeded:", e6 ? e6.message : "✓ Success");
}

seedAllTables();
