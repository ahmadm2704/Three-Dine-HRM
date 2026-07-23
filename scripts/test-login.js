// Quick script to check if signInWithPassword works with service role key
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://hjyuuvdjrhaugdamtiah.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqeXV1dmRqcmhhdWdkYW10aWFoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDM5MDc1MCwiZXhwIjoyMDk5OTY2NzUwfQ.icaqIfN0V39lkFdC37831ACw8yyoA6obnfOS-0blvZE';
// And standard anon key
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhqeXV1dmRqcmhhdWdkYW10aWFoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzOTA3NTAsImV4cCI6MjA5OTk2Njc1MH0.i0kZED55zWj1B3kGz8q535g4yF0X-Xq2Y8Q77HhQyMw';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

async function testLogin() {
  console.log("Testing auth login with Admin Client...");
  const email = 'ahmad@threedinecorporation.com';
  const password = 'TD-tk09q8!'; // Password from earlier script
  
  const { data: adminData, error: adminError } = await supabaseAdmin.auth.signInWithPassword({
    email,
    password,
  });
  console.log("Admin Client Result:");
  if (adminError) console.error(adminError);
  else console.log("Success:", adminData.user?.id);

  console.log("\nTesting auth login with Anon Client...");
  const { data: anonData, error: anonError } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });
  console.log("Anon Client Result:");
  if (anonError) console.error(anonError);
  else console.log("Success:", anonData.user?.id);
}

testLogin();
