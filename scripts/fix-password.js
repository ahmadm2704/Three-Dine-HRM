const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hjyuuvdjrhaugdamtiah.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqeXV1dmRqcmhhdWdkYW10aWFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDM5MDc1MCwiZXhwIjoyMDk5OTY2NzUwfQ.icaqIfN0V39lkFdC37831ACw8yyoA6obnfOS-0blvZE';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function updatePassword() {
  const email = 'ahmad@threedinecorporation.com';
  const { data: users } = await supabaseAdmin.auth.admin.listUsers();
  const user = users.users.find(u => u.email === email);
  
  if (user) {
    await supabaseAdmin.auth.admin.updateUserById(user.id, { password: 'password123' }); // I will set it to password123 as a default
    console.log(`Updated password for ${email} to 'password123'`);
  }
}

updatePassword();
