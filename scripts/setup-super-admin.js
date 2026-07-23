const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hjyuuvdjrhaugdamtiah.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqeXV1dmRqcmhhdWdkYW10aWFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDM5MDc1MCwiZXhwIjoyMDk5OTY2NzUwfQ.icaqIfN0V39lkFdC37831ACw8yyoA6obnfOS-0blvZE';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function setupSuperAdmin() {
  const email = 'admin@threedinecorporation.com';
  const password = 'Admin3Dine2026!';

  console.log("Setting up Super Admin Account:", email);

  // 1. Check if user already exists in auth
  const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
  const existingUser = usersData?.users?.find(u => u.email === email);

  if (existingUser) {
    console.log("User found in Auth. Updating password and role...");
    await supabaseAdmin.auth.admin.updateUserById(existingUser.id, {
      password,
      email_confirm: true,
      user_metadata: { first_name: 'Ali', last_name: 'Danish' },
      app_metadata: { role: 'super_admin' }
    });
  } else {
    console.log("Creating new Auth user...");
    await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: 'Ali', last_name: 'Danish' },
      app_metadata: { role: 'super_admin' }
    });
  }

  // 2. Ensure department 'Leadership' exists
  let departmentId = null;
  const { data: deptData } = await supabaseAdmin
    .from('departments')
    .select('id')
    .eq('name', 'Leadership')
    .single();

  if (deptData) {
    departmentId = deptData.id;
  } else {
    const { data: newDept } = await supabaseAdmin
      .from('departments')
      .insert({ name: 'Leadership' })
      .select('id')
      .single();
    if (newDept) departmentId = newDept.id;
  }

  // 3. Upsert into employees table
  const { data: empCheck } = await supabaseAdmin
    .from('employees')
    .select('id')
    .eq('email', email)
    .single();

  const empPayload = {
    first_name: 'Ali',
    last_name: 'Danish',
    email,
    job_title: 'Chief Executive Officer',
    department_id: departmentId,
    employment_status: 'active'
  };

  if (empCheck) {
    console.log("Employee row found in DB. Updating...");
    await supabaseAdmin.from('employees').update(empPayload).eq('id', empCheck.id);
  } else {
    console.log("Inserting new Super Admin employee into DB...");
    const { error: insertErr } = await supabaseAdmin.from('employees').insert(empPayload);
    if (insertErr) console.error("Insert error:", insertErr);
    else console.log("SUCCESS! Employee row inserted into DB!");
  }

  console.log("\n==============================================");
  console.log("SUPER ADMIN ACCOUNT SETUP COMPLETE!");
  console.log("EMAIL:", email);
  console.log("PASSWORD:", password);
  console.log("ROLE: super_admin (SUPER POWERFUL ADMIN)");
  console.log("==============================================\n");
}

setupSuperAdmin();
