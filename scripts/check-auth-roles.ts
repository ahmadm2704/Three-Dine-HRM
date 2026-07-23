import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const { data: employees, error: empError } = await supabaseAdmin
    .from('employees')
    .select('id, first_name, auth_user_id');

  if (empError) {
    console.error('Error fetching employees:', empError);
    return;
  }

  for (const emp of employees) {
    if (!emp.auth_user_id) continue;
    
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.getUserById(emp.auth_user_id);
    if (authError) {
      console.error(`Error fetching auth for ${emp.first_name}:`, authError);
    } else {
      console.log(`${emp.first_name}'s role in app_metadata is:`, authData.user.app_metadata?.role);
    }
  }
}

main();
