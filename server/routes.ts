import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertEmployeeSchema, attendanceCodeSchema, insertDesignationSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Employee routes
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employees" });
    }
  });

  app.get("/api/employees/:id", async (req, res) => {
    try {
      const employee = await storage.getEmployee(req.params.id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch employee" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(validatedData);
      res.status(201).json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid employee data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create employee" });
    }
  });

  app.put("/api/employees/:id", async (req, res) => {
    try {
      const validatedData = insertEmployeeSchema.partial().parse(req.body);
      const employee = await storage.updateEmployee(req.params.id, validatedData);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid employee data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update employee" });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteEmployee(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Employee not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete employee" });
    }
  });

  // Attendance update route
  app.put("/api/employees/:id/attendance", async (req, res) => {
    try {
      const { day, code } = req.body;
      const dayIndex = parseInt(day);
      
      if (isNaN(dayIndex) || dayIndex < 0 || dayIndex >= 31) {
        return res.status(400).json({ message: "Invalid day index" });
      }

      const validatedCode = attendanceCodeSchema.parse(code);
      
      const employee = await storage.getEmployee(req.params.id);
      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      const updatedAttendance = [...employee.attendance];
      updatedAttendance[dayIndex] = validatedCode;

      const updatedEmployee = await storage.updateEmployee(req.params.id, {
        attendance: updatedAttendance
      });

      res.json(updatedEmployee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid attendance code" });
      }
      res.status(500).json({ message: "Failed to update attendance" });
    }
  });

  // NEW: Reset all employees' attendance
  app.post("/api/employees/reset-attendance", async (req, res) => {
    try {
      const { rows } = await storage.pool.query("SELECT id FROM employees");
      const employeeIds = rows.map(row => row.id);
      
      // Update each employee with empty attendance array
      for (const id of employeeIds) {
        await storage.updateEmployee(id, {
          attendance: Array(31).fill("NONE")
        });
      }
      
      res.json({ message: "All attendance records reset successfully", count: employeeIds.length });
    } catch (error) {
      res.status(500).json({ message: "Failed to reset attendance records" });
    }
  });

  // NEW: Mark all employees present for a specific day
  app.post("/api/employees/mark-all-present", async (req, res) => {
    try {
      const { day, code = "P" } = req.body;
      const dayIndex = parseInt(day);
      
      if (isNaN(dayIndex) || dayIndex < 0 || dayIndex >= 31) {
        return res.status(400).json({ message: "Invalid day index" });
      }
      
      // Get all employees
      const employees = await storage.getEmployees();
      
      // Update each employee's attendance for the specified day
      for (const employee of employees) {
        const updatedAttendance = [...employee.attendance];
        updatedAttendance[dayIndex] = code;
        
        await storage.updateEmployee(employee.id, {
          attendance: updatedAttendance
        });
      }
      
      res.json({ 
        message: `All employees marked as ${code} for day ${dayIndex + 1}`,
        count: employees.length 
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to mark all employees present" });
    }
  });

  // Designation routes
  app.get("/api/designations", async (req, res) => {
    try {
      const designations = await storage.getDesignations();
      res.json(designations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch designations" });
    }
  });

  app.post("/api/designations", async (req, res) => {
    try {
      const validatedData = insertDesignationSchema.parse(req.body);
      const designation = await storage.createDesignation(validatedData);
      res.status(201).json(designation);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid designation data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create designation" });
    }
  });

  app.delete("/api/designations/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteDesignation(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Designation not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete designation" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}