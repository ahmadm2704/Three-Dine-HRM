const { Client } = require('pg');

const dbUrl = 'postgresql://postgres:Admin3Dine2026!@db.hjyuuvdjrhaugdamtiah.supabase.co:5432/postgres';

async function alterTable() {
  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to PostgreSQL database directly!");

    const query = `
      ALTER TABLE employees
      ADD COLUMN IF NOT EXISTS photo_url TEXT,
      ADD COLUMN IF NOT EXISTS start_date DATE,
      ADD COLUMN IF NOT EXISTS employee_number TEXT,
      ADD COLUMN IF NOT EXISTS personal_email TEXT,
      ADD COLUMN IF NOT EXISTS custom_fields JSONB,
      ADD COLUMN IF NOT EXISTS address JSONB,
      ADD COLUMN IF NOT EXISTS emergency_contact JSONB,
      ADD COLUMN IF NOT EXISTS employment_type TEXT;
    `;

    console.log("Executing query:\n", query);
    await client.query(query);
    console.log("✓ SUCCESS: Database schema updated successfully!");

  } catch (err) {
    console.error("❌ Database Error:", err.message);
  } finally {
    await client.end();
  }
}

alterTable();
