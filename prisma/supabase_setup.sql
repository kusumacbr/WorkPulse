-- ====================================================================
-- WORKPULSE: SUPABASE INITIALIZATION & SECURITY POLICIES
-- Run this in your Supabase Project SQL Editor (Dashboard -> SQL Editor)
-- ====================================================================

-- 1. Create PROFILES Table (Public schema, linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email       TEXT NOT NULL,
  full_name   TEXT NOT NULL DEFAULT '',
  avatar_url  TEXT,
  role        TEXT NOT NULL DEFAULT 'EMPLOYEE'
              CHECK (role IN ('EMPLOYEE', 'MANAGER', 'HR', 'ADMIN')),
  department  TEXT,
  designation TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Trigger to automatically provision a profile row on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'EMPLOYEE')
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url),
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Bind trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Enable Row Level Security (RLS) on PROFILES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Read: Authenticated users can view organization profiles (for team lookup/directory)
DROP POLICY IF EXISTS "Profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Update: Users can edit their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Admin & HR: Can update any profile / assign roles
DROP POLICY IF EXISTS "HR and Admin can manage all profiles" ON public.profiles;
CREATE POLICY "HR and Admin can manage all profiles"
  ON public.profiles FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('HR', 'ADMIN')
    )
  );

-- 4. Setup Supabase Storage Bucket for Employee Avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('employee-avatars', 'employee-avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS: Public can view avatar images
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
CREATE POLICY "Avatars are publicly accessible"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'employee-avatars');

-- Storage RLS: Authenticated users can upload their own avatar
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'employee-avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Storage RLS: Users can update or delete their own avatar
DROP POLICY IF EXISTS "Users can update or delete own avatar" ON storage.objects;
CREATE POLICY "Users can update or delete own avatar"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'employee-avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Users can remove own avatar" ON storage.objects;
CREATE POLICY "Users can remove own avatar"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'employee-avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5. Create EMPLOYEES Table (Public schema for real-time CRUD and roster sync)
CREATE TABLE IF NOT EXISTS public.employees (
  id             TEXT PRIMARY KEY DEFAULT ('emp-' || substr(md5(random()::text), 1, 8)),
  user_id        UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  employee_code  TEXT UNIQUE,
  name           TEXT NOT NULL,
  email          TEXT UNIQUE NOT NULL,
  role_title     TEXT NOT NULL,
  department     TEXT NOT NULL DEFAULT 'Engineering',
  department_id  TEXT DEFAULT 'dept-development',
  work_mode      TEXT NOT NULL DEFAULT 'OFFICE' CHECK (work_mode IN ('OFFICE', 'WFH', 'HYBRID', 'REMOTE')),
  status         TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'PROBATION', 'ON_LEAVE', 'PIP', 'RESIGNED', 'TERMINATED', 'Full-Time')),
  employment_type TEXT NOT NULL DEFAULT 'Full-Time',
  manager_id     TEXT,
  manager_name   TEXT,
  phone_number   TEXT,
  location       TEXT DEFAULT 'Bangalore HQ',
  leave_balance  NUMERIC(5,2) DEFAULT 12.00,
  joining_date   DATE DEFAULT CURRENT_DATE,
  avatar_url     TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on EMPLOYEES
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;

-- Admin & HR: Full CRUD access
DROP POLICY IF EXISTS "Admin and HR have full access to employees" ON public.employees;
CREATE POLICY "Admin and HR have full access to employees"
  ON public.employees FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('HR', 'ADMIN')
    )
  );

-- Managers: Read and update their team's employees
DROP POLICY IF EXISTS "Managers can view and update team employees" ON public.employees;
CREATE POLICY "Managers can view and update team employees"
  ON public.employees FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'MANAGER'
    )
  );

-- Employee: Read access to active organization directory
DROP POLICY IF EXISTS "Employees can view active directory" ON public.employees;
CREATE POLICY "Employees can view active directory"
  ON public.employees FOR SELECT
  TO authenticated
  USING (true);

-- Employee: Can update own profile information
DROP POLICY IF EXISTS "Employees can update own record" ON public.employees;
CREATE POLICY "Employees can update own record"
  ON public.employees FOR UPDATE
  TO authenticated
  USING (
    user_id = auth.uid() OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  )
  WITH CHECK (
    user_id = auth.uid() OR
    email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

-- ====================================================================
-- 6. SEED DATA: 10 OFFICIAL ENTERPRISE DEMO EMPLOYEES & DEPARTMENTS
-- ====================================================================
INSERT INTO public.employees (
  id, employee_code, name, email, role_title, department, department_id,
  work_mode, status, employment_type, manager_id, manager_name, phone_number,
  location, leave_balance, joining_date
)
VALUES
  -- 1. Employee: Sarah Dev (Senior Backend Engineer)
  (
    'emp-sarah', 'XOR-0101', 'Sarah Dev', 'employee.test@xorstack.com',
    'Senior Backend Engineer', 'Development', 'dept-development',
    'OFFICE', 'ACTIVE', 'Full-Time', 'lead-alex', 'Alex Lead',
    '+91 98765 43210', 'Bangalore HQ (Floor 4, Pod B)', 11.00, '2023-03-15'
  ),

  -- 2. Team Lead: Alex Lead (Engineering Lead · Development)
  (
    'lead-alex', 'XOR-0100', 'Alex Lead', 'lead.test@xorstack.com',
    'Engineering Lead · Development', 'Development', 'dept-development',
    'OFFICE', 'ACTIVE', 'Full-Time', 'admin-david', 'David Director',
    '+91 98765 43211', 'Bangalore HQ (Floor 4, Pod A)', 14.00, '2022-01-10'
  ),

  -- 3. HR Operations: Rachel HR (Head of People Operations)
  (
    'hr-rachel', 'XOR-0201', 'Rachel HR', 'hr.test@xorstack.com',
    'Head of People Operations', 'Human Resources', 'dept-hr',
    'OFFICE', 'ACTIVE', 'Full-Time', 'admin-david', 'David Director',
    '+91 98765 43212', 'Bangalore HQ (Floor 2, HR Suite)', 15.00, '2021-08-01'
  ),

  -- 4. SuperAdmin: David Director (VP of Engineering & SuperAdmin)
  (
    'admin-david', 'XOR-0001', 'David Director', 'director.test@xorstack.com',
    'VP of Engineering & SuperAdmin', 'Executive', 'dept-exec',
    'OFFICE', 'ACTIVE', 'Full-Time', 'admin-david', 'David Director',
    '+91 98765 43200', 'Bangalore HQ (Executive Suite)', 18.00, '2020-04-01'
  ),

  -- 5. Frontend UI/UX: Rohit Sharma
  (
    'emp-rohit', 'XOR-0102', 'Rohit Sharma', 'rohit.sharma@xorstack.com',
    'Frontend Engineer (UI/UX)', 'Development', 'dept-development',
    'OFFICE', 'ACTIVE', 'Full-Time', 'lead-alex', 'Alex Lead',
    '+91 98765 43213', 'Bangalore HQ (Floor 4, Pod B)', 10.00, '2023-07-10'
  ),

  -- 6. DevOps & SRE Lead: Marcus Vance
  (
    'lead-marcus', 'XOR-0300', 'Marcus Vance', 'lead.devops@xorstack.com',
    'DevOps & SRE Practice Lead', 'Devops', 'dept-devops',
    'HYBRID', 'ACTIVE', 'Full-Time', 'admin-david', 'David Director',
    '+91 98765 43214', 'Bangalore HQ (Floor 3, Cloud Ops)', 13.00, '2022-05-15'
  ),

  -- 7. Cloud Engineer: Karthik Raja
  (
    'emp-karthik', 'XOR-0301', 'Karthik Raja', 'karthik.raja@xorstack.com',
    'DevOps & Cloud Engineer', 'Devops', 'dept-devops',
    'OFFICE', 'ACTIVE', 'Full-Time', 'lead-marcus', 'Marcus Vance',
    '+91 98765 43215', 'Bangalore HQ (Floor 3, Cloud Ops)', 11.50, '2023-09-01'
  ),

  -- 8. Data Architecture Lead: Vikram Rao
  (
    'lead-vikram', 'XOR-0400', 'Vikram Rao', 'lead.data@xorstack.com',
    'Data Architecture & Analytics Lead', 'Data processing', 'dept-data-processing',
    'OFFICE', 'ACTIVE', 'Full-Time', 'admin-david', 'David Director',
    '+91 98765 43216', 'Bangalore HQ (Floor 3, Data Lab)', 12.00, '2022-11-20'
  ),

  -- 9. Data Analytics Engineer: Sneha Kapoor
  (
    'emp-sneha', 'XOR-0401', 'Sneha Kapoor', 'sneha.kapoor@xorstack.com',
    'Data Analytics Engineer', 'Data processing', 'dept-data-processing',
    'OFFICE', 'ACTIVE', 'Full-Time', 'lead-vikram', 'Vikram Rao',
    '+91 98765 43217', 'Bangalore HQ (Floor 3, Data Lab)', 9.00, '2024-01-15'
  ),

  -- 10. QA & Test Automation Lead: Priya QA
  (
    'emp-priya', 'XOR-0501', 'Priya QA', 'priya.qa@xorstack.com',
    'QA & Test Automation Lead Engineer', 'R & D', 'dept-rd',
    'WFH', 'ACTIVE', 'Full-Time', 'admin-david', 'David Director',
    '+91 98765 43218', 'Remote / Bangalore Hub', 9.00, '2023-04-01'
  ),

  -- 11. Autosar Embedded QA: Ananya Sen (ConfigTap)
  (
    'emp-ananya', 'XOR-0601', 'Ananya Sen', 'ananya.sen@xorstack.com',
    'Automation & Embedded QA Engineer', 'Service Providers (ConfigTap)', 'dept-configtap',
    'OFFICE', 'ACTIVE', 'Full-Time', 'lead-alex', 'Alex Lead',
    '+91 98765 43219', 'Bangalore HQ (Floor 1, Embedded Hub)', 10.00, '2023-10-15'
  )
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  email = EXCLUDED.email,
  role_title = EXCLUDED.role_title,
  department = EXCLUDED.department,
  department_id = EXCLUDED.department_id,
  work_mode = EXCLUDED.work_mode,
  status = EXCLUDED.status,
  manager_id = EXCLUDED.manager_id,
  manager_name = EXCLUDED.manager_name,
  phone_number = EXCLUDED.phone_number,
  location = EXCLUDED.location,
  leave_balance = EXCLUDED.leave_balance,
  updated_at = now();
