import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Calculator, Plus, FileDown, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import EmployeeModal from "@/components/employee-modal";
import SalaryTable from "@/components/salary-table";
import SummaryCards from "@/components/summary-cards";
import { exportToExcel } from "@/lib/excel-export";
import type { Employee, AttendanceCode } from "@shared/schema";

export default function SalaryManagement() {
  const [selectedMonth, setSelectedMonth] = useState("2025-08");
  const [totalDays, setTotalDays] = useState(31);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const { toast } = useToast();

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["/api/employees"],
  });

  const updateAttendanceMutation = useMutation({
    mutationFn: async ({ employeeId, day, code }: { employeeId: string; day: number; code: AttendanceCode }) => {
      const response = await fetch(`/api/employees/${employeeId}/attendance`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, code }),
      });
      if (!response.ok) throw new Error("Failed to update attendance");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update attendance", variant: "destructive" });
    },
  });

  const deleteEmployeeMutation = useMutation({
    mutationFn: async (employeeId: string) => {
      const response = await fetch(`/api/employees/${employeeId}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete employee");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({ title: "Success", description: "Employee deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete employee", variant: "destructive" });
    },
  });

  const handleAttendanceChange = (employeeId: string, day: number, code: AttendanceCode) => {
    updateAttendanceMutation.mutate({ employeeId, day, code });
  };

  const handleDeleteEmployee = (employeeId: string) => {
    if (confirm("क्या आप इस कर्मचारी को delete करना चाहते हैं?")) {
      deleteEmployeeMutation.mutate(employeeId);
    }
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsEmployeeModalOpen(true);
  };

  const handleExportToExcel = () => {
    exportToExcel(employees, selectedMonth, totalDays);
    toast({ title: "Success", description: "Excel file exported successfully" });
  };

  const calculateAttendanceCount = (attendance: string[], totalDays: number): number => {
    let count = 0;
    for (let i = 0; i < totalDays; i++) {
      const status = attendance[i];
      if (status === 'P') count += 1;
      else if (status === 'H') count += 0.5;
      else if (status === 'PP') count += 2;
      // 'A' and 'NONE' count as 0, no need to handle explicitly
    }
    return count;
  };

  const calculateGrossSalary = (employee: Employee, attendanceCount: number, totalDays: number): number => {
    const dailyRate = (employee.basic + employee.hra + employee.allowance) / totalDays;
    return Math.floor(dailyRate * attendanceCount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-primary text-white p-2 rounded-lg">
                <Calculator className="text-xl" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">वेतन प्रबंधन सिस्टम</h1>
                <p className="text-sm text-slate-600">Salary Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-sm text-slate-600">अगस्त 2025</span>
              <div className="h-6 w-px bg-slate-300"></div>
              <button className="text-slate-600 hover:text-slate-900 transition-colors">
                <Users className="text-xl" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            {/* Left Controls */}
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Label className="text-sm font-medium text-slate-700">महीना:</Label>
                <Input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="px-3 py-2 text-sm"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Label className="text-sm font-medium text-slate-700">कुल दिन:</Label>
                <Input
                  type="number"
                  value={totalDays}
                  min={28}
                  max={31}
                  onChange={(e) => setTotalDays(parseInt(e.target.value))}
                  className="w-20 px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
              <Button
                onClick={() => {
                  setEditingEmployee(null);
                  setIsEmployeeModalOpen(true);
                }}
                className="inline-flex items-center"
              >
                <Plus className="mr-2 h-4 w-4" />
                कर्मचारी जोड़ें
              </Button>
              <Button
                variant="outline"
                className="inline-flex items-center bg-green-600 text-white hover:bg-green-700"
                onClick={() => queryClient.invalidateQueries({ queryKey: ["/api/employees"] })}
              >
                <Calculator className="mr-2 h-4 w-4" />
                वेतन गणना करें
              </Button>
              <Button
                variant="outline"
                className="inline-flex items-center bg-orange-600 text-white hover:bg-orange-700"
                onClick={handleExportToExcel}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Excel Export
              </Button>
            </div>
          </div>

          {/* Attendance Legend */}
          <div className="mt-6 pt-4 border-t border-slate-200">
            <h3 className="text-sm font-medium text-slate-700 mb-3">उपस्थिति कोड:</h3>
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-xs font-bold">P</span>
                <span className="text-sm text-slate-600">Present (पूरा दिन)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-red-100 text-red-800 rounded-full flex items-center justify-center text-xs font-bold">A</span>
                <span className="text-sm text-slate-600">Absent (अनुपस्थित)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-6 h-6 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center text-xs font-bold">H</span>
                <span className="text-sm text-slate-600">Half Day (आधा दिन)</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-7 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">PP</span>
                <span className="text-sm text-slate-600">Double Shift (दोहरी पाली)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Salary Table */}
        <SalaryTable
          employees={employees}
          totalDays={totalDays}
          onAttendanceChange={handleAttendanceChange}
          onEditEmployee={handleEditEmployee}
          onDeleteEmployee={handleDeleteEmployee}
          calculateAttendanceCount={calculateAttendanceCount}
          calculateGrossSalary={calculateGrossSalary}
        />

        {/* Summary Cards */}
        <SummaryCards
          employees={employees}
          totalDays={totalDays}
          calculateAttendanceCount={calculateAttendanceCount}
          calculateGrossSalary={calculateGrossSalary}
        />
      </div>

      {/* Employee Modal */}
      <EmployeeModal
        isOpen={isEmployeeModalOpen}
        onClose={() => {
          setIsEmployeeModalOpen(false);
          setEditingEmployee(null);
        }}
        employee={editingEmployee}
      />
    </div>
  );
}
