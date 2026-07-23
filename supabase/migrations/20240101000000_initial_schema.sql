-- Initial HRIS Schema for Three Dine Corporation

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Core Structure (Companies & Departments)
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  logo_url TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE departments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  parent_department_id UUID REFERENCES departments(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Employee Directory
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID UNIQUE, -- References auth.users in Supabase
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  photo_url TEXT,
  job_title TEXT,
  department_id UUID REFERENCES departments(id),
  manager_id UUID REFERENCES employees(id),
  start_date DATE,
  termination_date DATE,
  employment_status TEXT DEFAULT 'active' CHECK (employment_status IN ('active', 'terminated', 'on_leave')),
  employment_type TEXT DEFAULT 'full-time' CHECK (employment_type IN ('full-time', 'part-time', 'contractor')),
  compensation JSONB DEFAULT '{}'::jsonb,
  address JSONB DEFAULT '{}'::jsonb,
  emergency_contact JSONB DEFAULT '{}'::jsonb,
  custom_fields JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Roles and Permissions (Super Admin, HR Admin, Manager, Employee)
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'hr_admin', 'manager', 'employee')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(employee_id, role)
);

-- 4. Time-Off & Leave Management
CREATE TABLE leave_policies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  accrual_type TEXT NOT NULL, -- e.g., 'annual', 'per_pay_period'
  accrual_rate NUMERIC(5,2),
  max_balance NUMERIC(5,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE leave_balances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_policy_id UUID NOT NULL REFERENCES leave_policies(id),
  balance NUMERIC(5,2) DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(employee_id, leave_policy_id)
);

CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_policy_id UUID NOT NULL REFERENCES leave_policies(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'cancelled')),
  approved_by UUID REFERENCES employees(id),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  notes TEXT
);

-- 5. Onboarding
CREATE TABLE onboarding_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  template_id UUID NOT NULL REFERENCES onboarding_templates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  assignee_role TEXT, -- e.g., 'manager', 'hr', 'it', 'new_hire'
  due_days_offset INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE employee_onboarding_tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES onboarding_tasks(id),
  assigned_to UUID REFERENCES employees(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Documents
CREATE TABLE documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE, -- Nullable for company-wide documents
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  category TEXT NOT NULL,
  uploaded_by UUID REFERENCES employees(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Audit Log
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id),
  actor_id UUID REFERENCES employees(id),
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  diff JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Row Level Security (RLS) Policies
-- Note: Requires `auth.uid()` to match `employees.auth_user_id`

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_policies ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_onboarding_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Basic Policies (To be expanded)
-- Companies: Users can read their own company
CREATE POLICY "Users can view their own company"
ON companies FOR SELECT
USING (id IN (SELECT company_id FROM employees WHERE auth_user_id = auth.uid()));

-- Employees: Employees can view other employees in the same company
CREATE POLICY "Users can view co-workers"
ON employees FOR SELECT
USING (company_id IN (SELECT company_id FROM employees WHERE auth_user_id = auth.uid()));

-- Employees: Users can update their own non-sensitive profile info
CREATE POLICY "Users can update their own profile"
ON employees FOR UPDATE
USING (auth_user_id = auth.uid());

-- RLS specifically for the compensation field should be handled at the API/query level in Supabase (e.g., using views or explicit column selection restrictions) since Postgres RLS applies to rows, not columns directly. A better approach for column-level security is a separate `employee_compensation` table, but we will leave it as JSONB for now and ensure APIs only expose it to HR/Admins.
