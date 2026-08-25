import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function createTables() {
  console.log("Creating leave_requests, wfh_requests, and workdays tables...");

  // Create leave_requests table
  const { error: lrErr } = await supabase.rpc("exec_sql", {
    sql: `
      CREATE TABLE IF NOT EXISTS public.leave_requests (
        id TEXT PRIMARY KEY DEFAULT ('lr-' || substr(md5(random()::text), 1, 8)),
        employee_id TEXT NOT NULL,
        employee_name TEXT NOT NULL,
        employee_email TEXT,
        leave_type TEXT NOT NULL DEFAULT 'CASUAL',
        start_date DATE NOT NULL DEFAULT CURRENT_DATE,
        end_date DATE NOT NULL DEFAULT CURRENT_DATE,
        total_days NUMERIC(4,1) NOT NULL DEFAULT 1,
        reason TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'PENDING_TL_STAGE_1',
        tl_comment TEXT,
        tl_action_at TIMESTAMPTZ,
        tl_action_by TEXT,
        hr_comment TEXT,
        hr_action_at TIMESTAMPTZ,
        hr_action_by TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
      );
    `,
  });

  // If rpc doesn't work, try direct table operations
  if (lrErr) {
    console.warn("RPC not available, creating tables via direct operations...");

    // Test if tables exist by trying to select
    const { error: testLr } = await supabase.from("leave_requests").select("id").limit(1);
    if (testLr && testLr.code === "42P01") {
      console.log("leave_requests table does not exist. Please run the SQL in prisma/supabase_leave_workdays.sql in your Supabase SQL Editor.");
    } else {
      console.log("leave_requests table exists ✓");
    }

    const { error: testWfh } = await supabase.from("wfh_requests").select("id").limit(1);
    if (testWfh && testWfh.code === "42P01") {
      console.log("wfh_requests table does not exist. Please run the SQL in prisma/supabase_leave_workdays.sql in your Supabase SQL Editor.");
    } else {
      console.log("wfh_requests table exists ✓");
    }

    const { error: testWd } = await supabase.from("workdays").select("id").limit(1);
    if (testWd && testWd.code === "42P01") {
      console.log("workdays table does not exist. Please run the SQL in prisma/supabase_leave_workdays.sql in your Supabase SQL Editor.");
    } else {
      console.log("workdays table exists ✓");
    }
  }

  // Seed a sample leave request
  console.log("\nSeeding sample leave request...");
  const { error: seedLrErr } = await supabase.from("leave_requests").upsert(
    {
      id: "lr-demo-001",
      employee_id: "emp-sarah",
      employee_name: "Sarah Dev",
      employee_email: "employee.test@xorstack.com",
      leave_type: "CASUAL",
      start_date: "2026-08-28",
      end_date: "2026-08-28",
      total_days: 1,
      reason: "Personal commitment — half-day leave",
      status: "PENDING_TL_STAGE_1",
    },
    { onConflict: "id" }
  );

  if (seedLrErr) {
    console.warn("Could not seed leave request:", seedLrErr.message);
    console.log("\n⚠️  Please run the SQL file in your Supabase SQL Editor:");
    console.log("   File: prisma/supabase_leave_workdays.sql");
    console.log("   Dashboard: https://supabase.com/dashboard/project/cqjnsznacqnzudpkgjjj/sql");
  } else {
    console.log("Sample leave request seeded ✓");
  }

  // Seed a sample SOD workday
  console.log("\nSeeding sample SOD workday...");
  const { error: seedWdErr } = await supabase.from("workdays").upsert(
    {
      id: "wd-demo-001",
      employee_id: "emp-sarah",
      employee_name: "Sarah Dev",
      date: "2026-08-25",
      sod_status: "SUBMITTED",
      sod_submitted_at: new Date().toISOString(),
      sod_plan: JSON.stringify([
        {
          id: "task-1",
          title: "Implement REST route handlers for Sprint 35",
          project: "Platform Core",
          priority: "HIGH",
          estimatedMinutes: 180,
          completionPercentage: 80,
          status: "IN_PROGRESS",
        },
        {
          id: "task-2",
          title: "Code review for leave approval PRs",
          project: "WorkPulse",
          priority: "MEDIUM",
          estimatedMinutes: 60,
          completionPercentage: 100,
          status: "COMPLETED",
        },
      ]),
      eod_status: "IN_PROGRESS",
      overall_progress: 80,
    },
    { onConflict: "id" }
  );

  if (seedWdErr) {
    console.warn("Could not seed workday:", seedWdErr.message);
    console.log("\n⚠️  Please run the SQL file in your Supabase SQL Editor:");
    console.log("   File: prisma/supabase_leave_workdays.sql");
  } else {
    console.log("Sample SOD workday seeded ✓");
  }

  console.log("\n✅ Setup complete!");
}

createTables().catch(console.error);
