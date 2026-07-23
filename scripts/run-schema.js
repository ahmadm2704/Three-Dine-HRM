// Connect directly to Supabase PostgreSQL and run schema
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runSchema() {
  const sql = fs.readFileSync(path.join(__dirname, '..', 'supabase', 'schema.sql'), 'utf8');
  
  // Supabase direct PostgreSQL connection
  // Format: postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres
  const PROJECT_REF = 'hjyuuvdjrhaugdamtiah';
  
  // Use the pooler connection (transaction mode)
  const connectionString = `postgresql://postgres.${PROJECT_REF}:${process.env.SUPABASE_DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

  console.log('Connecting to Supabase PostgreSQL...');
  
  const client = new Client({ connectionString });
  
  try {
    await client.connect();
    console.log('✅ Connected to database!');
    console.log('Executing schema...');
    
    await client.query(sql);
    
    console.log('✅ Schema created and seed data inserted successfully!');
    
    // Verify
    const res = await client.query('SELECT count(*) FROM employees');
    console.log(`✅ Employees in database: ${res.rows[0].count}`);
    
    const deptRes = await client.query('SELECT count(*) FROM departments');
    console.log(`✅ Departments in database: ${deptRes.rows[0].count}`);
    
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.message.includes('password authentication failed') || err.message.includes('SUPABASE_DB_PASSWORD')) {
      console.log('');
      console.log('You need to set the SUPABASE_DB_PASSWORD environment variable.');
      console.log('Find it in: Supabase Dashboard > Project Settings > Database > Connection string');
      console.log('');
      console.log('Or alternatively, run the SQL manually:');
      console.log(`  1. Go to https://supabase.com/dashboard/project/${PROJECT_REF}/sql`);
      console.log('  2. Paste the contents of supabase/schema.sql');
      console.log('  3. Click "Run"');
    }
  } finally {
    await client.end();
  }
}

runSchema().catch(console.error);
