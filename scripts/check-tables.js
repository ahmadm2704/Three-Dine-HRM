// Quick script to check which tables exist in the Supabase database
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://hjyuuvdjrhaugdamtiah.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqeXV1dmRqcmhhdWdkYW10aWFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDM5MDc1MCwiZXhwIjoyMDk5OTY2NzUwfQ.icaqIfN0V39lkFdC37831ACw8yyoA6obnfOS-0blvZE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkTables() {
  const tables = ['companies', 'departments', 'employees', 'user_roles', 'leave_policies', 'leave_balances', 'leave_requests', 'documents', 'audit_log', 'notifications', 'onboarding_templates', 'onboarding_tasks', 'employee_onboarding_tasks'];
  
  for (const table of tables) {
    const { data, error } = await supabase.from(table).select('*').limit(1);
    if (error) {
      console.log(`❌ ${table}: ${error.message}`);
    } else {
      console.log(`✅ ${table}: exists (${data.length} rows shown)`);
    }
  }

  // Also check the columns of the employees table
  console.log('\n--- Employees table columns ---');
  const { data: emp, error: empErr } = await supabase.from('employees').select('*').limit(1);
  if (emp && emp.length > 0) {
    console.log('Columns:', Object.keys(emp[0]));
  } else {
    console.log('No employee rows to inspect columns from, or error:', empErr?.message);
  }
}

checkTables();
