ALTER TABLE public.employees
ADD COLUMN IF NOT EXISTS employee_number TEXT,
ADD COLUMN IF NOT EXISTS personal_email TEXT;
