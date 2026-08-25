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
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const DEMO_EMPLOYEES = [
  {
    id: "emp-sarah",
    employee_code: "XOR-0101",
    name: "Sarah Dev",
    email: "employee.test@xorstack.com",
    role_title: "Senior Backend Engineer",
    department: "Development",
    department_id: "dept-development",
    work_mode: "OFFICE",
    status: "ACTIVE",
    employment_type: "Full-Time",
    manager_id: "lead-alex",
    manager_name: "Alex Lead",
    phone_number: "+91 98765 43210",
    location: "Bangalore HQ (Floor 4, Pod B)",
    leave_balance: 11.0,
    joining_date: "2023-03-15",
  },
  {
    id: "lead-alex",
    employee_code: "XOR-0100",
    name: "Alex Lead",
    email: "lead.test@xorstack.com",
    role_title: "Engineering Lead · Development",
    department: "Development",
    department_id: "dept-development",
    work_mode: "OFFICE",
    status: "ACTIVE",
    employment_type: "Full-Time",
    manager_id: "admin-david",
    manager_name: "David Director",
    phone_number: "+91 98765 43211",
    location: "Bangalore HQ (Floor 4, Pod A)",
    leave_balance: 14.0,
    joining_date: "2022-01-10",
  },
  {
    id: "hr-rachel",
    employee_code: "XOR-0201",
    name: "Rachel HR",
    email: "hr.test@xorstack.com",
    role_title: "Head of People Operations",
    department: "Human Resources",
    department_id: "dept-hr",
    work_mode: "OFFICE",
    status: "ACTIVE",
    employment_type: "Full-Time",
    manager_id: "admin-david",
    manager_name: "David Director",
    phone_number: "+91 98765 43212",
    location: "Bangalore HQ (Floor 2, HR Suite)",
    leave_balance: 15.0,
    joining_date: "2021-08-01",
  },
  {
    id: "admin-david",
    employee_code: "XOR-0001",
    name: "David Director",
    email: "director.test@xorstack.com",
    role_title: "VP of Engineering & SuperAdmin",
    department: "Executive",
    department_id: "dept-exec",
    work_mode: "OFFICE",
    status: "ACTIVE",
    employment_type: "Full-Time",
    manager_id: "admin-david",
    manager_name: "David Director",
    phone_number: "+91 98765 43200",
    location: "Bangalore HQ (Executive Suite)",
    leave_balance: 18.0,
    joining_date: "2020-04-01",
  },
  {
    id: "emp-rohit",
    employee_code: "XOR-0102",
    name: "Rohit Sharma",
    email: "rohit.sharma@xorstack.com",
    role_title: "Frontend Engineer (UI/UX)",
    department: "Development",
    department_id: "dept-development",
    work_mode: "OFFICE",
    status: "ACTIVE",
    employment_type: "Full-Time",
    manager_id: "lead-alex",
    manager_name: "Alex Lead",
    phone_number: "+91 98765 43213",
    location: "Bangalore HQ (Floor 4, Pod B)",
    leave_balance: 10.0,
    joining_date: "2023-07-10",
  },
  {
    id: "lead-marcus",
    employee_code: "XOR-0300",
    name: "Marcus Vance",
    email: "lead.devops@xorstack.com",
    role_title: "DevOps & SRE Practice Lead",
    department: "Devops",
    department_id: "dept-devops",
    work_mode: "HYBRID",
    status: "ACTIVE",
    employment_type: "Full-Time",
    manager_id: "admin-david",
    manager_name: "David Director",
    phone_number: "+91 98765 43214",
    location: "Bangalore HQ (Floor 3, Cloud Ops)",
    leave_balance: 13.0,
    joining_date: "2022-05-15",
  },
  {
    id: "emp-karthik",
    employee_code: "XOR-0301",
    name: "Karthik Raja",
    email: "karthik.raja@xorstack.com",
    role_title: "DevOps & Cloud Engineer",
    department: "Devops",
    department_id: "dept-devops",
    work_mode: "OFFICE",
    status: "ACTIVE",
    employment_type: "Full-Time",
    manager_id: "lead-marcus",
    manager_name: "Marcus Vance",
    phone_number: "+91 98765 43215",
    location: "Bangalore HQ (Floor 3, Cloud Ops)",
    leave_balance: 11.5,
    joining_date: "2023-09-01",
  },
  {
    id: "lead-vikram",
    employee_code: "XOR-0400",
    name: "Vikram Rao",
    email: "lead.data@xorstack.com",
    role_title: "Data Architecture & Analytics Lead",
    department: "Data processing",
    department_id: "dept-data-processing",
    work_mode: "OFFICE",
    status: "ACTIVE",
    employment_type: "Full-Time",
    manager_id: "admin-david",
    manager_name: "David Director",
    phone_number: "+91 98765 43216",
    location: "Bangalore HQ (Floor 3, Data Lab)",
    leave_balance: 12.0,
    joining_date: "2022-11-20",
  },
  {
    id: "emp-sneha",
    employee_code: "XOR-0401",
    name: "Sneha Kapoor",
    email: "sneha.kapoor@xorstack.com",
    role_title: "Data Analytics Engineer",
    department: "Data processing",
    department_id: "dept-data-processing",
    work_mode: "OFFICE",
    status: "ACTIVE",
    employment_type: "Full-Time",
    manager_id: "lead-vikram",
    manager_name: "Vikram Rao",
    phone_number: "+91 98765 43217",
    location: "Bangalore HQ (Floor 3, Data Lab)",
    leave_balance: 9.0,
    joining_date: "2024-01-15",
  },
  {
    id: "emp-priya",
    employee_code: "XOR-0501",
    name: "Priya QA",
    email: "priya.qa@xorstack.com",
    role_title: "QA & Test Automation Lead Engineer",
    department: "R & D",
    department_id: "dept-rd",
    work_mode: "WFH",
    status: "ACTIVE",
    employment_type: "Full-Time",
    manager_id: "admin-david",
    manager_name: "David Director",
    phone_number: "+91 98765 43218",
    location: "Remote / Bangalore Hub",
    leave_balance: 9.0,
    joining_date: "2023-04-01",
  },
  {
    id: "emp-ananya",
    employee_code: "XOR-0601",
    name: "Ananya Sen",
    email: "ananya.sen@xorstack.com",
    role_title: "Automation & Embedded QA Engineer",
    department: "Service Providers (ConfigTap)",
    department_id: "dept-configtap",
    work_mode: "OFFICE",
    status: "ACTIVE",
    employment_type: "Full-Time",
    manager_id: "lead-alex",
    manager_name: "Alex Lead",
    phone_number: "+91 98765 43219",
    location: "Bangalore HQ (Floor 1, Embedded Hub)",
    leave_balance: 10.0,
    joining_date: "2023-10-15",
  },
];

async function seed() {
  console.log("Seeding employees and profiles to Supabase:", supabaseUrl);

  // 1. Seed public.employees
  const { data: empData, error: empError } = await supabase
    .from("employees")
    .upsert(DEMO_EMPLOYEES, { onConflict: "id" })
    .select();

  if (empError) {
    console.error("Error inserting employees:", empError);
  } else {
    console.log(`Successfully seeded ${empData?.length || DEMO_EMPLOYEES.length} demo employees into public.employees!`);
  }

  // 2. Fetch existing auth users to avoid duplicates
  const { data: userListData } = await supabase.auth.admin.listUsers();
  const existingUsers = userListData?.users || [];

  const defaultPassword = "WorkPulse2025!Demo";

  for (const emp of DEMO_EMPLOYEES) {
    let authUser = existingUsers.find((u) => u.email?.toLowerCase() === emp.email.toLowerCase());

    const userRole =
      emp.email === "director.test@xorstack.com"
        ? "ADMIN"
        : emp.email === "hr.test@xorstack.com"
        ? "HR"
        : emp.id.startsWith("lead-") || emp.role_title.includes("Lead")
        ? "MANAGER"
        : "EMPLOYEE";

    if (!authUser) {
      const { data: createData, error: createError } = await supabase.auth.admin.createUser({
        email: emp.email,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: {
          full_name: emp.name,
          name: emp.name,
          role: userRole,
          department: emp.department,
          designation: emp.role_title,
        },
      });

      if (createError) {
        console.warn(`Could not create auth user for ${emp.email}:`, createError.message);
      } else if (createData.user) {
        authUser = createData.user;
        console.log(`Created auth user: ${emp.email} (${userRole})`);
      }
    } else {
      console.log(`Auth user already exists: ${emp.email}`);
    }

    if (authUser) {
      // Upsert into public.profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .upsert(
          {
            id: authUser.id,
            email: emp.email,
            full_name: emp.name,
            role: userRole,
            department: emp.department,
            designation: emp.role_title,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" }
        );

      if (profileError) {
        console.warn(`Profile upsert warning for ${emp.email}:`, profileError.message);
      }

      // Link user_id in employees
      await supabase
        .from("employees")
        .update({ user_id: authUser.id })
        .eq("id", emp.id);
    }
  }

  console.log("Successfully seeded public.profiles and linked all auth users!");
}

seed();


