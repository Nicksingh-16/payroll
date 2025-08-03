// storage.ts - ES Module version
import { Pool } from "pg";
import { randomUUID } from "crypto";
import {
  type Employee,
  type InsertEmployee,
  type SalarySheet,
  type InsertSalarySheet,
  type Designation,
  type InsertDesignation
} from "@shared/schema";

// Create a connection pool to your PostgreSQL database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // Required for Render PostgreSQL
  }
});

// Initialize the database - this should only create tables if they don't exist
// but NOT reset data on every restart
async function initDB() {
  // Create tables if they don't exist
  await pool.query(`
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
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS designations (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      is_active INT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS salary_sheets (
      id UUID PRIMARY KEY,
      month TEXT NOT NULL,
      year INTEGER NOT NULL,
      total_days INTEGER NOT NULL,
      employee_data JSONB NOT NULL
    );
  `);

  // Only insert sample data if the employees table is completely empty
  // This prevents resetting to dummy data on every restart
  const { rows } = await pool.query("SELECT COUNT(*) AS count FROM employees");
  if (parseInt(rows[0].count) === 0) {
    console.log("Database is empty, inserting sample data");
    const sampleEmployees: InsertEmployee[] = [
      {
        name: "राम कुमार",
        position: "Manager",
        basic: 25000,
        hra: 5000,
        allowance: 2000,
        esi_rate: 1750,
        pf_rate: 1200,
        other_deduction: 0,
        attendance: Array(31).fill("NONE"),
      },
      {
        name: "सीता देवी",
        position: "Assistant",
        basic: 18000,
        hra: 3600,
        allowance: 1500,
        esi_rate: 1750,
        pf_rate: 1200,
        other_deduction: 0,
        attendance: Array(31).fill("NONE"),
      },
      {
        name: "मोहन लाल",
        position: "Worker",
        basic: 15000,
        hra: 3000,
        allowance: 1000,
        esi_rate: 0,
        pf_rate: 1200,
        other_deduction: 0,
        attendance: Array(31).fill("NONE"),
      },
    ];
    
    for (const emp of sampleEmployees) {
      await pool.query(
        `INSERT INTO employees (id,name,position,basic,hra,allowance,esi_rate,pf_rate,other_deduction,attendance)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          randomUUID(),
          emp.name,
          emp.position,
          emp.basic,
          emp.hra,
          emp.allowance,
          emp.esi_rate,
          emp.pf_rate,
          emp.other_deduction,
          emp.attendance,
        ]
      );
    }
  }
}

// Initialize the database when the module is loaded
initDB().catch(err => {
  console.error("Database initialization failed:", err);
});

export const storage = {
  // Expose pool for direct queries in routes
  pool,
  
  async getEmployees(): Promise<Employee[]> {
    const { rows } = await pool.query("SELECT * FROM employees");
    return rows as Employee[];
  },

  async getEmployee(id: string): Promise<Employee | undefined> {
    const { rows } = await pool.query("SELECT * FROM employees WHERE id=$1", [id]);
    return rows[0] as Employee | undefined;
  },

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const id = randomUUID();
    await pool.query(
      `INSERT INTO employees (id,name,position,basic,hra,allowance,esi_rate,pf_rate,other_deduction,attendance)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        id,
        employee.name,
        employee.position,
        employee.basic,
        employee.hra,
        employee.allowance,
        employee.esi_rate,
        employee.pf_rate,
        employee.other_deduction,
        employee.attendance,
      ]
    );
    return { id, ...employee } as Employee;
  },

  async updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const existing = await this.getEmployee(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...employee };
    
    await pool.query(
      `UPDATE employees SET name=$1, position=$2, basic=$3, hra=$4, allowance=$5,
       esi_rate=$6, pf_rate=$7, other_deduction=$8, attendance=$9 WHERE id=$10`,
      [
        updated.name,
        updated.position,
        updated.basic,
        updated.hra,
        updated.allowance,
        updated.esi_rate,
        updated.pf_rate,
        updated.other_deduction,
        updated.attendance,
        id,
      ]
    );
    
    return updated as Employee;
  },

  async deleteEmployee(id: string): Promise<boolean> {
    const res = await pool.query("DELETE FROM employees WHERE id=$1", [id]);
    return (res.rowCount ?? 0) > 0;
  },

  async getDesignations(): Promise<Designation[]> {
    const { rows } = await pool.query("SELECT * FROM designations WHERE is_active=1");
    return rows as Designation[];
  },

  async getDesignation(id: string): Promise<Designation | undefined> {
    const { rows } = await pool.query("SELECT * FROM designations WHERE id=$1", [id]);
    return rows[0] as Designation | undefined;
  },

  async createDesignation(designation: InsertDesignation): Promise<Designation> {
    const id = randomUUID();
    await pool.query(
      "INSERT INTO designations (id,name,is_active) VALUES ($1,$2,$3)",
      [id, designation.name, designation.isActive]
    );
        return { id, ...designation } as Designation;
  },

  async updateDesignation(id: string, designation: Partial<InsertDesignation>): Promise<Designation | undefined> {
    const existing = await this.getDesignation(id);
    if (!existing) return undefined;
    const updated = { ...existing, ...designation };
    await pool.query("UPDATE designations SET name=$1, is_active=$2 WHERE id=$3", [
      updated.name,
      updated.isActive,
      id,
    ]);
    return updated as Designation;
  },

  async deleteDesignation(id: string): Promise<boolean> {
    const res = await pool.query("DELETE FROM designations WHERE id=$1", [id]);
    return (res.rowCount ?? 0) > 0;
  },

  async getSalarySheets(): Promise<SalarySheet[]> {
    const { rows } = await pool.query("SELECT * FROM salary_sheets");
    return rows as SalarySheet[];
  },

  async getSalarySheet(id: string): Promise<SalarySheet | undefined> {
    const { rows } = await pool.query("SELECT * FROM salary_sheets WHERE id=$1", [id]);
    return rows[0] as SalarySheet | undefined;
  },

  async createSalarySheet(sheet: InsertSalarySheet): Promise<SalarySheet> {
    const id = randomUUID();
    await pool.query(
      "INSERT INTO salary_sheets (id, month, year, total_days, employee_data) VALUES ($1, $2, $3, $4, $5)",
      [
        id,
        sheet.month,
        sheet.year,
        sheet.totalDays,
        JSON.stringify(sheet.employeeData),
      ]
    );
    return { id, ...sheet } as SalarySheet;
  },

  async updateSalarySheet(id: string, sheet: Partial<InsertSalarySheet>): Promise<SalarySheet | undefined> {
    const existing = await this.getSalarySheet(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...sheet };
    
    await pool.query(
      "UPDATE salary_sheets SET month=$1, year=$2, total_days=$3, employee_data=$4 WHERE id=$5",
      [
        updated.month,
        updated.year,
        updated.totalDays,
        JSON.stringify(updated.employeeData),
        id,
      ]
    );
    
    return updated as SalarySheet;
  },

  async deleteSalarySheet(id: string): Promise<boolean> {
    const res = await pool.query("DELETE FROM salary_sheets WHERE id=$1", [id]);
    return (res.rowCount ?? 0) > 0;
  }
};