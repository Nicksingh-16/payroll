import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const employees = pgTable("employees", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  position: text("position").notNull(),
  basic: integer("basic").notNull(),
  hra: integer("hra").notNull(),
  allowance: integer("allowance").notNull(),
  attendance: json("attendance").$type<string[]>().default([]).notNull(),
});

export const salarySheets = pgTable("salary_sheets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  month: text("month").notNull(),
  year: integer("year").notNull(),
  totalDays: integer("total_days").notNull(),
  employeeData: json("employee_data").$type<any[]>().default([]).notNull(),
});

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
});

export const insertSalarySheetSchema = createInsertSchema(salarySheets).omit({
  id: true,
});

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;
export type InsertSalarySheet = z.infer<typeof insertSalarySheetSchema>;
export type SalarySheet = typeof salarySheets.$inferSelect;

// Attendance codes validation
export const attendanceCodeSchema = z.enum(['P', 'A', 'H', 'PP']);
export type AttendanceCode = z.infer<typeof attendanceCodeSchema>;
