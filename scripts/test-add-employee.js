const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hjyuuvdjrhaugdamtiah.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqeXV1dmRqcmhhdWdkYW10aWFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDM5MDc1MCwiZXhwIjoyMDk5OTY2NzUwfQ.icaqIfN0V39lkFdC37831ACw8yyoA6obnfOS-0blvZE';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testAddEmployee() {
  console.log("Testing direct Supabase insert with clean schema columns...");

  const testPayload = {
    first_name: "Ahmad",
    last_name: "Masood",
    email: "ahmad@threedinecorporation.com",
    job_title: "Chief Marketing Officer",
    employment_status: "active"
  };

  const { data: existing } = await supabaseAdmin
    .from('employees')
    .select('id')
    .eq('email', testPayload.email)
    .single();

  let resData, resErr;
  if (existing) {
    console.log("Existing row found. Testing update...");
    const { data, error } = await supabaseAdmin
      .from('employees')
      .update(testPayload)
      .eq('id', existing.id)
      .select('id, first_name, last_name, email, phone, job_title, employment_status, manager_id, department_id, departments ( name )')
      .single();
    resData = data;
    resErr = error;
  } else {
    console.log("No existing row. Testing insert...");
    const { data, error } = await supabaseAdmin
      .from('employees')
      .insert(testPayload)
      .select('id, first_name, last_name, email, phone, job_title, employment_status, manager_id, department_id, departments ( name )')
      .single();
    resData = data;
    resErr = error;
  }

  if (resErr) {
    console.error("❌ Test Failed:", resErr);
  } else {
    console.log("✓ SUCCESS! Database record upserted successfully:", resData);
  }
}

testAddEmployee();
