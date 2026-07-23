import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  // Get all employees
  const { data: employees, error: empError } = await supabaseAdmin
    .from('employees')
    .select('id, first_name, last_name, email');

  if (empError) {
    console.error('Error fetching employees:', empError);
    return;
  }

  console.log(`Found ${employees?.length} employees.`);

  if (!employees) return;

  for (const emp of employees) {
    // If it's Ali, give super_admin, otherwise employee
    const role = (emp.first_name.toLowerCase() === 'ali' || emp.email.includes('ali')) ? 'super_admin' : 'employee';

    // Before inserting, delete old roles for this employee just in case
    await supabaseAdmin.from('user_roles').delete().eq('employee_id', emp.id);

    // Insert new role
    const { error: roleError } = await supabaseAdmin
      .from('user_roles')
      .insert({ 
        employee_id: emp.id, 
        role: role 
      });
      
    if (roleError) {
      console.error(`Error inserting role for ${emp.first_name}:`, roleError);
    } else {
      console.log(`Successfully assigned ${role} role to ${emp.first_name} ${emp.last_name}`);
    }
  }
}

main();
