const { Client } = require('pg');
require('dotenv').config({ path: '.env.local' });

// We need the postgres connection string, but the project uses Next.js with Supabase
// Do we have a database URL?
const dbUrl = process.env.DATABASE_URL || 'postgres://postgres.hjyuuvdjrhaugdamtiah:Admin3Dine2026!@aws-0-us-east-1.pooler.supabase.com:6543/postgres';

async function alterTable() {
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL database!");

    // Alter employees table to add missing columns
    const query = `
      ALTER TABLE employees
      ADD COLUMN IF NOT EXISTS photo_url TEXT,
      ADD COLUMN IF NOT EXISTS start_date DATE,
      ADD COLUMN IF NOT EXISTS custom_fields JSONB,
      ADD COLUMN IF NOT EXISTS address JSONB,
      ADD COLUMN IF NOT EXISTS emergency_contact JSONB,
      ADD COLUMN IF NOT EXISTS employment_type TEXT;
    `;

    console.log("Executing query:\n", query);
    await client.query(query);
    console.log("✓ SUCCESS: Database schema updated successfully!");

  } catch (err) {
    console.error("❌ Database Error:", err);
  } finally {
    await client.end();
  }
}

alterTable();
