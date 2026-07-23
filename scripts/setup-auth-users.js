// Script to create Supabase Auth users for existing employees
// Run this once: node scripts/setup-auth-users.js

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hjyuuvdjrhaugdamtiah.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqeXV1dmRqcmhhdWdkYW10aWFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDM5MDc1MCwiZXhwIjoyMDk5OTY2NzUwfQ.icaqIfN0V39lkFdC37831ACw8yyoA6obnfOS-0blvZE';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAuthUsers() {
  // Create auth user for the CEO (admin backdoor)
  const defaultUsers = [
    { email: 'ali.danish@threedine.com', password: 'admin123', name: 'Ali Danish' },
  ];

  for (const user of defaultUsers) {
    console.log(`Creating auth user for ${user.email}...`);
    const { data, error } = await supabase.auth.admin.createUser({
      email: user.email,
      password: user.password,
      email_confirm: true,
      user_metadata: { full_name: user.name },
    });

    if (error) {
      if (error.message?.includes('already been registered')) {
        console.log(`  ✅ ${user.email} already exists in Auth.`);
      } else {
        console.log(`  ❌ Error: ${error.message}`);
      }
    } else {
      console.log(`  ✅ Created auth user: ${data.user?.id}`);
    }
  }

  // Also create auth users for any employees already in the DB that don't have auth accounts
  const { data: employees } = await supabase.from('employees').select('email, first_name, last_name');
  if (employees && employees.length > 0) {
    console.log(`\nFound ${employees.length} employees in DB. Creating auth accounts...`);
    for (const emp of employees) {
      const tempPassword = `TD-${Math.random().toString(36).slice(-6)}!`;
      const { error } = await supabase.auth.admin.createUser({
        email: emp.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: { first_name: emp.first_name, last_name: emp.last_name },
      });
      if (error) {
        if (error.message?.includes('already been registered')) {
          console.log(`  ✅ ${emp.email} already has auth account.`);
        } else {
          console.log(`  ❌ ${emp.email}: ${error.message}`);
        }
      } else {
        console.log(`  ✅ ${emp.email} → password: ${tempPassword}`);
      }
    }
  }

  console.log('\nDone!');
}

setupAuthUsers();
