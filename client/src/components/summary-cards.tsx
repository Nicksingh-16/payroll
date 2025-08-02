import { Users, IndianRupee, MinusCircle, Wallet } from "lucide-react";
import type { Employee } from "@shared/schema";

interface SummaryCardsProps {
  employees: Employee[];
  totalDays: number;
  calculateAttendanceCount: (attendance: string[], totalDays: number) => number;
  calculateGrossSalary: (employee: Employee, attendanceCount: number, totalDays: number) => number;
}

export default function SummaryCards({
  employees,
  totalDays,
  calculateAttendanceCount,
  calculateGrossSalary,
}: SummaryCardsProps) {
  const summary = employees.reduce(
    (acc, employee) => {
      const attendanceCount = calculateAttendanceCount(employee.attendance, totalDays);
      const grossSalary = calculateGrossSalary(employee, attendanceCount, totalDays);
      const esi = Math.floor(grossSalary * 0.0175);
      const pf = Math.floor(grossSalary * 0.12);
      const deductions = esi + pf;
      const netSalary = grossSalary - deductions;

      return {
        totalEmployees: acc.totalEmployees + 1,
        totalGross: acc.totalGross + grossSalary,
        totalDeductions: acc.totalDeductions + deductions,
        totalNet: acc.totalNet + netSalary,
      };
    },
    { totalEmployees: 0, totalGross: 0, totalDeductions: 0, totalNet: 0 }
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="text-blue-600 text-xl" />
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-slate-600">कुल कर्मचारी</p>
            <p className="text-2xl font-bold text-slate-900">{summary.totalEmployees}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <IndianRupee className="text-green-600 text-xl" />
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-slate-600">कुल सकल वेतन</p>
            <p className="text-2xl font-bold text-slate-900">₹{summary.totalGross.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <MinusCircle className="text-red-600 text-xl" />
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-slate-600">कुल कटौती</p>
            <p className="text-2xl font-bold text-slate-900">₹{summary.totalDeductions.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Wallet className="text-purple-600 text-xl" />
            </div>
          </div>
          <div className="ml-4">
            <p className="text-sm font-medium text-slate-600">कुल नेट वेतन</p>
            <p className="text-2xl font-bold text-slate-900">₹{summary.totalNet.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
