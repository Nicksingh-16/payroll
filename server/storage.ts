import { type Employee, type InsertEmployee, type SalarySheet, type InsertSalarySheet } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Employee management
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: string): Promise<boolean>;
  
  // Salary sheet management
  getSalarySheets(): Promise<SalarySheet[]>;
  getSalarySheet(id: string): Promise<SalarySheet | undefined>;
  createSalarySheet(salarySheet: InsertSalarySheet): Promise<SalarySheet>;
  updateSalarySheet(id: string, salarySheet: Partial<InsertSalarySheet>): Promise<SalarySheet | undefined>;
}

export class MemStorage implements IStorage {
  private employees: Map<string, Employee>;
  private salarySheets: Map<string, SalarySheet>;

  constructor() {
    this.employees = new Map();
    this.salarySheets = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const sampleEmployees: InsertEmployee[] = [
      {
        name: 'राम कुमार',
        position: 'Manager',
        basic: 25000,
        hra: 5000,
        allowance: 2000,
        attendance: Array(31).fill('P')
      },
      {
        name: 'सीता देवी',
        position: 'Assistant',
        basic: 18000,
        hra: 3600,
        allowance: 1500,
        attendance: Array(31).fill('P')
      },
      {
        name: 'मोहन लाल',
        position: 'Worker',
        basic: 15000,
        hra: 3000,
        allowance: 1000,
        attendance: Array(31).fill('P')
      }
    ];

    sampleEmployees.forEach(emp => {
      const id = randomUUID();
      const employee: Employee = { ...emp, id };
      this.employees.set(id, employee);
    });
  }

  async getEmployees(): Promise<Employee[]> {
    return Array.from(this.employees.values());
  }

  async getEmployee(id: string): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async createEmployee(insertEmployee: InsertEmployee): Promise<Employee> {
    const id = randomUUID();
    const employee: Employee = { ...insertEmployee, id };
    this.employees.set(id, employee);
    return employee;
  }

  async updateEmployee(id: string, updateData: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const employee = this.employees.get(id);
    if (!employee) return undefined;
    
    const updatedEmployee: Employee = { ...employee, ...updateData };
    this.employees.set(id, updatedEmployee);
    return updatedEmployee;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    return this.employees.delete(id);
  }

  async getSalarySheets(): Promise<SalarySheet[]> {
    return Array.from(this.salarySheets.values());
  }

  async getSalarySheet(id: string): Promise<SalarySheet | undefined> {
    return this.salarySheets.get(id);
  }

  async createSalarySheet(insertSalarySheet: InsertSalarySheet): Promise<SalarySheet> {
    const id = randomUUID();
    const salarySheet: SalarySheet = { ...insertSalarySheet, id };
    this.salarySheets.set(id, salarySheet);
    return salarySheet;
  }

  async updateSalarySheet(id: string, updateData: Partial<InsertSalarySheet>): Promise<SalarySheet | undefined> {
    const salarySheet = this.salarySheets.get(id);
    if (!salarySheet) return undefined;
    
    const updatedSalarySheet: SalarySheet = { ...salarySheet, ...updateData };
    this.salarySheets.set(id, updatedSalarySheet);
    return updatedSalarySheet;
  }
}

export const storage = new MemStorage();
