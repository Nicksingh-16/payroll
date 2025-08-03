import { config } from 'dotenv';
import pg from 'pg';
import { randomUUID } from 'crypto';

const { Pool } = pg;

// Load environment variables
config();

console.log("Testing direct database insertion...");
console.log("DATABASE_URL is", process.env.DATABASE_URL ? "set" : "not set");

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Render PostgreSQL
  }
});

async function testInsert() {
  try {
    // Test connection
    const connTest = await pool.query('SELECT current_database() as db_name');
    console.log('Connected to database:', connTest.rows[0].db_name);
    
    // Check if employees table exists
    const tableCheck = await pool.query("SELECT to_regclass('public.employees') as table_exists");
    if (!tableCheck.rows[0].table_exists) {
      console.error("Employees table does not exist!");
      return;
    }
    
    // Insert test employee
    const id = randomUUID();
    const testEmployee = {
      name: "Test Employee",
      position: "Tester",
      basic: 20000,
      hra: 4000,
      allowance: 1500,
      esi_rate: 1750,
      pf_rate: 1200,
      other_deduction: 0,
      attendance: Array(31).fill("NONE")
    };
    
    await pool.query(
      `INSERT INTO employees (id,name,position,basic,hra,allowance,esi_rate,pf_rate,other_deduction,attendance)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        id,
        testEmployee.name,
        testEmployee.position,
        testEmployee.basic,
        testEmployee.hra,
        testEmployee.allowance,
        testEmployee.esi_rate,
        testEmployee.pf_rate,
        testEmployee.other_deduction,
        testEmployee.attendance,
      ]
    );
    
    console.log("Test employee inserted with ID:", id);
    
    // Verify the employee was inserted
    const { rows } = await pool.query("SELECT * FROM employees WHERE id = $1", [id]);
    if (rows.length > 0) {
      console.log("Successfully retrieved inserted employee:", rows[0].name);
    } else {
      console.error("Failed to retrieve inserted employee!");
    }
    
    // Count all employees
    const countResult = await pool.query("SELECT COUNT(*) as count FROM employees");
    console.log("Total employees in database:", countResult.rows[0].count);
    
  } catch (error) {
    console.error("Error during test:", error);
  } finally {
    await pool.end();
  }
}

testInsert();