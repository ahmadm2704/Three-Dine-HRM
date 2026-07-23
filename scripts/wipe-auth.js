const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hjyuuvdjrhaugdamtiah.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqeXV1dmRqcmhhdWdkYW10aWFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDM5MDc1MCwiZXhwIjoyMDk5OTY2NzUwfQ.icaqIfN0V39lkFdC37831ACw8yyoA6obnfOS-0blvZE';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function wipeStrayAuth() {
  const emailToWipe = 'ahmad@threedinecorporation.com';
  
  // Check if they exist in DB
  const { data: dbUser } = await supabaseAdmin.from('employees').select('id').eq('email', emailToWipe).single();
  
  if (!dbUser) {
    // Not in DB! Let's wipe from Auth
    const { data: authUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userToWipe = authUsers.users.find(u => u.email === emailToWipe);
    
    if (userToWipe) {
      console.log(`Found stray auth user for ${emailToWipe}. Deleting...`);
      await supabaseAdmin.auth.admin.deleteUser(userToWipe.id);
      console.log("Deleted.");
    } else {
      console.log("No stray auth user found.");
    }
  } else {
    console.log("User still exists in DB, not wiping.");
  }
}

wipeStrayAuth();
