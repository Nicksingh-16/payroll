import { type Employee, type InsertEmployee, type SalarySheet, type InsertSalarySheet, type Designation, type InsertDesignation } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Employee management
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: string): Promise<boolean>;
  
  // Designation management
  getDesignations(): Promise<Designation[]>;
  getDesignation(id: string): Promise<Designation | undefined>;
  createDesignation(designation: InsertDesignation): Promise<Designation>;
  updateDesignation(id: string, designation: Partial<InsertDesignation>): Promise<Designation | undefined>;
  deleteDesignation(id: string): Promise<boolean>;
  
  // Salary sheet management
  getSalarySheets(): Promise<SalarySheet[]>;
  getSalarySheet(id: string): Promise<SalarySheet | undefined>;
  createSalarySheet(salarySheet: InsertSalarySheet): Promise<SalarySheet>;
  updateSalarySheet(id: string, salarySheet: Partial<InsertSalarySheet>): Promise<SalarySheet | undefined>;
}

export class MemStorage implements IStorage {
  private employees: Map<string, Employee>;
  private salarySheets: Map<string, SalarySheet>;
  private designations: Map<string, Designation>;

  constructor() {
    this.employees = new Map();
    this.salarySheets = new Map();
    this.designations = new Map();
    
    // Initialize with sample data
    this.initializeSampleData();
  }

  private initializeSampleData() {
    // Initialize default designations
    const defaultDesignations: InsertDesignation[] = [
      { name: 'Manager', isActive: 1 },
      { name: 'Assistant Manager', isActive: 1 },
      { name: 'Supervisor', isActive: 1 },
      { name: 'Assistant', isActive: 1 },
      { name: 'Senior Worker', isActive: 1 },
      { name: 'Worker', isActive: 1 },
      { name: 'Trainee', isActive: 1 }
    ];

    defaultDesignations.forEach(designation => {
      const id = randomUUID();
      const designationWithId: Designation = { ...designation, id };
      this.designations.set(id, designationWithId);
    });

    const sampleEmployees: InsertEmployee[] = [
      {
        name: 'राम कुमार',
        position: 'Manager',
        basic: 25000,
        hra: 5000,
        allowance: 2000,
        esi_rate: 1750,
        pf_rate: 1200,
        other_deduction: 0,
        attendance: Array(31).fill('NONE')
      },
      {
        name: 'सीता देवी',
        position: 'Assistant',
        basic: 18000,
        hra: 3600,
        allowance: 1500,
        esi_rate: 1750,
        pf_rate: 1200,
        other_deduction: 0,
        attendance: Array(31).fill('NONE')
      },
      {
        name: 'मोहन लाल',
        position: 'Worker',
        basic: 15000,
        hra: 3000,
        allowance: 1000,
        esi_rate: 0,
        pf_rate: 1200,
        other_deduction: 0,
        attendance: Array(31).fill('NONE')
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

  // Designation management methods
  async getDesignations(): Promise<Designation[]> {
    return Array.from(this.designations.values()).filter(d => d.isActive === 1);
  }

  async getDesignation(id: string): Promise<Designation | undefined> {
    return this.designations.get(id);
  }

  async createDesignation(insertDesignation: InsertDesignation): Promise<Designation> {
    const id = randomUUID();
    const designation: Designation = { ...insertDesignation, id };
    this.designations.set(id, designation);
    return designation;
  }

  async updateDesignation(id: string, updateData: Partial<InsertDesignation>): Promise<Designation | undefined> {
    const designation = this.designations.get(id);
    if (!designation) return undefined;
    
    const updatedDesignation: Designation = { ...designation, ...updateData };
    this.designations.set(id, updatedDesignation);
    return updatedDesignation;
  }

  async deleteDesignation(id: string): Promise<boolean> {
    return this.designations.delete(id);
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
