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
    .select('id, first_name, last_name, email');

  if (empError) {
    console.error('Error fetching employees:', empError);
    return;
  }
  
  console.log(employees);
}

main();
