const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hjyuuvdjrhaugdamtiah.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqeXV1dmRqcmhhdWdkYW10aWFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDM5MDc1MCwiZXhwIjoyMDk5OTY2NzUwfQ.icaqIfN0V39lkFdC37831ACw8yyoA6obnfOS-0blvZE';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function setRoles() {
  const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) return console.error(listError);
  
  for (const user of usersData.users) {
    let role = 'employee';
    if (user.email === 'ali.danish@threedine.com') {
      role = 'super_admin';
    }
    
    // Update the app_metadata for the user
    const newAppMetadata = { ...user.app_metadata, role };
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      app_metadata: newAppMetadata
    });
    
    if (updateError) {
      console.error(`Failed to update ${user.email}:`, updateError);
    } else {
      console.log(`Set role '${role}' for ${user.email}`);
    }
  }
}

setRoles();
