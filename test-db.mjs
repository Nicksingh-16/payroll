// Test database connection using ES modules
import { config } from 'dotenv';
import pg from 'pg';
const { Pool } = pg;

// Load environment variables
config();

console.log("Testing database connection...");
console.log("DATABASE_URL is", process.env.DATABASE_URL ? "set" : "not set");

if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set. Please create a .env file with DATABASE_URL.");
  process.exit(1);
}

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Render PostgreSQL
  }
});
// Test the connection
try {
  const res = await pool.query('SELECT current_database() as db_name, current_user as user_name');
  console.log('✅ Successfully connected to database!');
  console.log(`Database: ${res.rows[0].db_name}`);
  console.log(`User: ${res.rows[0].user_name}`);
  
  // Check if tables exist
  const tablesResult = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
  
  if (tablesResult.rows.length === 0) {
    console.log("No tables found in database.");
    
    // Create tables
    console.log("Creating tables...");
    const createTablesQuery = `
      CREATE TABLE IF NOT EXISTS employees (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        position TEXT NOT NULL,
        basic NUMERIC NOT NULL,
        hra NUMERIC NOT NULL,
        allowance NUMERIC NOT NULL,
        esi_rate NUMERIC NOT NULL,
        pf_rate NUMERIC NOT NULL,
        other_deduction NUMERIC NOT NULL,
        attendance TEXT[]
      );
      
      CREATE TABLE IF NOT EXISTS designations (
        id UUID PRIMARY KEY,
        name TEXT NOT NULL,
        is_active INT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS salary_sheets (
        id UUID PRIMARY KEY,
        month TEXT NOT NULL,
        year INTEGER NOT NULL,
        total_days INTEGER NOT NULL,
        employee_data JSONB NOT NULL
      );
    `;
    
    await pool.query(createTablesQuery);
    console.log("✅ Tables created successfully!");
  } else {
    console.log("Existing tables:", tablesResult.rows.map(row => row.table_name).join(', '));
  }
  
  console.log("Database setup complete!");
} catch (err) {
  console.error('❌ Database error:', err.message);
  console.error('Please check your DATABASE_URL and make sure PostgreSQL is running.');
} finally {
  // Close the pool
  await pool.end();
}