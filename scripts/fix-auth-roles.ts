import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const { data: usersData, error } = await supabaseAdmin.auth.admin.listUsers();
  
  if (error) {
    console.error('Error fetching auth users:', error);
    return;
  }
  
  console.log(`Found ${usersData.users.length} auth users.`);

  for (const user of usersData.users) {
    const isAli = user.email === 'admin@threedinecorporation.com';
    const role = isAli ? 'super_admin' : 'employee';
    
    // Update app_metadata
    const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { app_metadata: { role } }
    );
    
    if (updateError) {
      console.error(`Error updating role for ${user.email}:`, updateError);
    } else {
      console.log(`Successfully assigned ${role} role to ${user.email} in auth.users app_metadata`);
    }
  }
}

main();
