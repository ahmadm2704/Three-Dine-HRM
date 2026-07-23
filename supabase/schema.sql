-- Three Dine Corporation HRIS Database Schema
-- Run this in Supabase SQL Editor

-- 1. Departments Table
CREATE TABLE IF NOT EXISTS departments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  parent_department_id UUID REFERENCES departments(id),
  head_name TEXT,
  head_title TEXT,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  job_title TEXT,
  department_id UUID REFERENCES departments(id),
  manager_id UUID REFERENCES employees(id),
  employment_status TEXT DEFAULT 'active' CHECK (employment_status IN ('active', 'inactive', 'on_leave', 'terminated')),
  hire_date DATE DEFAULT CURRENT_DATE,
  salary NUMERIC(12,2),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Time Off Requests
CREATE TABLE IF NOT EXISTS time_off_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('pto', 'sick', 'personal', 'bereavement', 'maternity', 'paternity')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count INTEGER NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied', 'cancelled')),
  reason TEXT,
  approved_by UUID REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Performance Goals
CREATE TABLE IF NOT EXISTS performance_goals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status TEXT DEFAULT 'in_progress' CHECK (status IN ('not_started', 'in_progress', 'completed', 'cancelled')),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Performance Reviews
CREATE TABLE IF NOT EXISTS performance_reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES employees(id),
  review_period TEXT NOT NULL,
  score NUMERIC(3,1) CHECK (score >= 0 AND score <= 5),
  summary TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Documents
CREATE TABLE IF NOT EXISTS documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  file_url TEXT,
  category TEXT DEFAULT 'general' CHECK (category IN ('general', 'contract', 'tax', 'id', 'certificate', 'offer_letter')),
  uploaded_by UUID REFERENCES employees(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Audit Log
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT NOT NULL,
  action TEXT NOT NULL,
  details TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Org Chart Positions (for visual org chart)
CREATE TABLE IF NOT EXISTS org_positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  department_id UUID REFERENCES departments(id),
  parent_position_id UUID REFERENCES org_positions(id),
  level INTEGER DEFAULT 0,
  color TEXT DEFAULT '#8b5cf6',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ==========================================
-- SEED DATA
-- ==========================================

-- Clear old data to prevent duplicate legacy records
TRUNCATE TABLE employees, departments CASCADE;

-- Departments
INSERT INTO departments (name, head_name, head_title, color) VALUES
  ('Leadership', 'Ali Danish', 'CEO', '#3b82f6'),
  ('Top Management', 'Muaraf Ali', 'Chief Technology Officer', '#1e293b'),
  ('IT Team', 'Sibte Hassan', 'Managing Director', '#8b5cf6'),
  ('Support', 'Anum Ghani', 'Support Team', '#14b8a6')
ON CONFLICT (name) DO NOTHING;

-- Employees
INSERT INTO employees (first_name, last_name, email, job_title, department_id, employment_status) VALUES
  ('Ali', 'Danish', 'ali.danish@threedine.com', 'CEO', (SELECT id FROM departments WHERE name = 'Leadership'), 'active'),
  ('Muaraf', 'Ali', 'muaraf.ali@threedine.com', 'Chief Technology Officer', (SELECT id FROM departments WHERE name = 'Top Management'), 'active'),
  ('Izan', 'Ali', 'izan.ali@threedine.com', 'Chief Financial Officer', (SELECT id FROM departments WHERE name = 'Top Management'), 'active'),
  ('Ahmad', 'Masood', 'ahmad.masood@threedine.com', 'Chief Marketing Officer', (SELECT id FROM departments WHERE name = 'Top Management'), 'active'),
  ('Sibte', 'Hassan', 'sibte.hassan@threedine.com', 'Managing Director', (SELECT id FROM departments WHERE name = 'IT Team'), 'active'),
  ('Amer', 'Shaazad', 'amer.shaazad@threedine.com', 'Senior AI Specialist', (SELECT id FROM departments WHERE name = 'IT Team'), 'active'),
  ('Faraz', 'Sarwar', 'faraz.sarwar@threedine.com', 'AI Specialist', (SELECT id FROM departments WHERE name = 'IT Team'), 'active'),
  ('Asad', 'Munir', 'asad.munir@threedine.com', 'Senior Backend Developer', (SELECT id FROM departments WHERE name = 'IT Team'), 'active'),
  ('Ali', 'Frontend', 'ali@threedine.com', 'Senior Frontend Developer', (SELECT id FROM departments WHERE name = 'IT Team'), 'active'),
  ('Anum', 'Ghani', 'anum.ghani@threedine.com', 'Support Team', (SELECT id FROM departments WHERE name = 'Support'), 'active'),
  ('Dua', 'Tahir', 'dua.tahir@threedine.com', 'Support Team', (SELECT id FROM departments WHERE name = 'Support'), 'active'),
  ('Usama', 'Sheikh', 'usama.sheikh@threedine.com', 'Support Team', (SELECT id FROM departments WHERE name = 'Support'), 'active'),
  ('Shaneer', 'Qurashi', 'shaneer.qurashi@threedine.com', 'Data and Research Consultant', (SELECT id FROM departments WHERE name = 'Support'), 'active'),
  ('Ahmad', 'Ali', 'ahmad.ali2@threedine.com', 'Research and Technology Associate', (SELECT id FROM departments WHERE name = 'Support'), 'active')
ON CONFLICT (email) DO NOTHING;

-- Set manager relationships
UPDATE employees SET manager_id = (SELECT id FROM employees WHERE email = 'ali.danish@threedine.com') 
WHERE email IN ('muaraf.ali@threedine.com', 'izan.ali@threedine.com', 'ahmad.masood@threedine.com');

UPDATE employees SET manager_id = (SELECT id FROM employees WHERE email = 'muaraf.ali@threedine.com')
WHERE email IN ('sibte.hassan@threedine.com', 'amer.shaazad@threedine.com', 'faraz.sarwar@threedine.com');

UPDATE employees SET manager_id = (SELECT id FROM employees WHERE email = 'sibte.hassan@threedine.com')
WHERE email IN ('asad.munir@threedine.com', 'ali@threedine.com');

UPDATE employees SET manager_id = (SELECT id FROM employees WHERE email = 'izan.ali@threedine.com')
WHERE email IN ('anum.ghani@threedine.com', 'dua.tahir@threedine.com', 'usama.sheikh@threedine.com');

UPDATE employees SET manager_id = (SELECT id FROM employees WHERE email = 'ahmad.masood@threedine.com')
WHERE email IN ('shaneer.qurashi@threedine.com', 'ahmad.ali2@threedine.com');

-- ==========================================
-- ROW LEVEL SECURITY (Open for dev, restrict later)
-- ==========================================
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_off_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE org_positions ENABLE ROW LEVEL SECURITY;

-- Allow anon read for dev
-- Allow anon read for dev
DROP POLICY IF EXISTS "Allow anon read departments" ON departments;
CREATE POLICY "Allow anon read departments" ON departments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon read employees" ON employees;
CREATE POLICY "Allow anon read employees" ON employees FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon insert employees" ON employees;
CREATE POLICY "Allow anon insert employees" ON employees FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update employees" ON employees;
CREATE POLICY "Allow anon update employees" ON employees FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anon read time_off" ON time_off_requests;
CREATE POLICY "Allow anon read time_off" ON time_off_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon insert time_off" ON time_off_requests;
CREATE POLICY "Allow anon insert time_off" ON time_off_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update time_off" ON time_off_requests;
CREATE POLICY "Allow anon update time_off" ON time_off_requests FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anon delete time_off" ON time_off_requests;
CREATE POLICY "Allow anon delete time_off" ON time_off_requests FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow anon read goals" ON performance_goals;
CREATE POLICY "Allow anon read goals" ON performance_goals FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon update goals" ON performance_goals;
CREATE POLICY "Allow anon update goals" ON performance_goals FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anon read reviews" ON performance_reviews;
CREATE POLICY "Allow anon read reviews" ON performance_reviews FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon update reviews" ON performance_reviews;
CREATE POLICY "Allow anon update reviews" ON performance_reviews FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow anon read docs" ON documents;
CREATE POLICY "Allow anon read docs" ON documents FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon read audit" ON audit_log;
CREATE POLICY "Allow anon read audit" ON audit_log FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow anon insert audit" ON audit_log;
CREATE POLICY "Allow anon insert audit" ON audit_log FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon read org_positions" ON org_positions;
CREATE POLICY "Allow anon read org_positions" ON org_positions FOR SELECT USING (true);
