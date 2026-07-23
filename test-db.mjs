import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  const { data, error } = await supabase.from('employees').select('id').limit(1);
  if (error) {
    console.log('Error accessing employees table:', error.message);
  } else {
    console.log('Employees table exists!', data);
  }
}

testConnection();
