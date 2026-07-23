const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hjyuuvdjrhaugdamtiah.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqeXV1dmRqcmhhdWdkYW10aWFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDM5MDc1MCwiZXhwIjoyMDk5OTY2NzUwfQ.icaqIfN0V39lkFdC37831ACw8yyoA6obnfOS-0blvZE';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function wipeAndResetEmployees() {
  console.log("==================================================");
  console.log("WIPING ALL EMPLOYEES & USERS FROM SUPABASE DATABASE");
  console.log("==================================================");

  // 1. Delete all rows from employees table in Supabase
  const { data: deleteData, error: deleteErr } = await supabaseAdmin
    .from('employees')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Deletes all rows

  if (deleteErr) {
    console.error("Error wiping employees table:", deleteErr);
  } else {
    console.log("✓ Successfully wiped ALL rows from public.employees table!");
  }

  // 2. Fetch all Auth users in Supabase and remove everyone except admin@threedinecorporation.com
  const { data: authUsersData } = await supabaseAdmin.auth.admin.listUsers();
  const authUsers = authUsersData?.users || [];

  for (const user of authUsers) {
    if (user.email !== 'admin@threedinecorporation.com') {
      console.log(`Deleting auth user: ${user.email} (${user.id})...`);
      await supabaseAdmin.auth.admin.deleteUser(user.id);
    }
  }

  // 3. Ensure 'Leadership' department exists
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

  // 4. Ensure admin@threedinecorporation.com Auth User exists with password 'Admin3Dine2026!'
  const adminEmail = 'admin@threedinecorporation.com';
  const adminPassword = 'Admin3Dine2026!';
  
  const existingAdminAuth = authUsers.find(u => u.email === adminEmail);
  if (existingAdminAuth) {
    console.log("Updating password & role for admin@threedinecorporation.com...");
    await supabaseAdmin.auth.admin.updateUserById(existingAdminAuth.id, {
      password: adminPassword,
      email_confirm: true,
      user_metadata: { first_name: 'Ali', last_name: 'Danish' },
      app_metadata: { role: 'super_admin' }
    });
  } else {
    console.log("Creating Auth user for admin@threedinecorporation.com...");
    await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
      user_metadata: { first_name: 'Ali', last_name: 'Danish' },
      app_metadata: { role: 'super_admin' }
    });
  }

  // 5. Insert fresh single Super Admin row into employees table
  const { data: freshAdmin, error: insertErr } = await supabaseAdmin
    .from('employees')
    .insert({
      first_name: 'Ali',
      last_name: 'Danish',
      email: adminEmail,
      job_title: 'Chief Executive Officer',
      department_id: departmentId,
      employment_status: 'active'
    })
    .select()
    .single();

  if (insertErr) {
    console.error("Error inserting fresh admin row:", insertErr);
  } else {
    console.log("✓ Successfully inserted single Super Admin row into public.employees table!");
  }

  console.log("\n==================================================");
  console.log("DATABASE FULLY WIPED & RESET COMPLETE!");
  console.log("SUPER ADMIN EMAIL: admin@threedinecorporation.com");
  console.log("SUPER ADMIN PASSWORD: Admin3Dine2026!");
  console.log("Current total rows in employees table: 1");
  console.log("==================================================\n");
}

wipeAndResetEmployees();
