import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const email = 'admin@threedinecorporation.com';

  let { data: employee, error: empError } = await supabaseAdmin
    .from('employees')
    .select('id, first_name, last_name, email')
    .eq('email', email)
    .single();

  console.log('Employee fetched:', employee);

  let role = 'employee';
  const { data: usersData, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
  
  if (!usersError && usersData?.users) {
    const authUser = usersData.users.find(u => u.email === employee?.email);
    console.log('Auth user matched:', authUser?.email, 'Role:', authUser?.app_metadata?.role);
    if (authUser?.app_metadata?.role) {
      role = authUser.app_metadata.role;
    }
  }

  console.log('Final role assigned to response:', role);
}

main();
