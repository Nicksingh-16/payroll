import { useState } from "react";
import { Edit2, Trash2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import type { Employee, AttendanceCode } from "@shared/schema";

interface SalaryTableProps {
  employees: Employee[];
  totalDays: number;
  onAttendanceChange: (employeeId: string, day: number, code: AttendanceCode) => void;
  onEditEmployee: (employee: Employee) => void;
  onDeleteEmployee: (employeeId: string) => void;
  calculateAttendanceCount: (attendance: string[], totalDays: number) => number;
  calculateGrossSalary: (employee: Employee, attendanceCount: number, totalDays: number) => number;
}

export default function SalaryTable({
  employees,
  totalDays,
  onAttendanceChange,
  onEditEmployee,
  onDeleteEmployee,
  calculateAttendanceCount,
  calculateGrossSalary,
}: SalaryTableProps) {
  const [isMarkingAllPresent, setIsMarkingAllPresent] = useState(false);
  const { toast } = useToast();

  const getAttendanceColor = (code: string) => {
    switch (code) {
      case 'P': return 'bg-green-50 text-green-800';
      case 'A': return 'bg-red-50 text-red-800';
      case 'H': return 'bg-yellow-50 text-yellow-800';
      case 'PP': return 'bg-blue-50 text-blue-800';
      case 'NONE': return 'bg-gray-50 text-gray-600';
      default: return 'bg-gray-50 text-gray-800';
    }
  };

  const handleMarkAllPresent = async (day: number) => {
    if (isMarkingAllPresent) return;
    
    setIsMarkingAllPresent(true);
    try {
      const response = await fetch("/api/employees/mark-all-present", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day }),
      });
      
      if (!response.ok) throw new Error("Failed to mark all employees present");
      
      await queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({ 
        title: "Success", 
        description: `सभी कर्मचारी दिन ${day + 1} के लिए उपस्थित चिह्नित किए गए`, 
      });
    } catch (error) {
      toast({ 
        title: "Error", 
        description: "सभी कर्मचारियों को उपस्थित चिह्नित करने में विफल", 
        variant: "destructive" 
      });
    } finally {
      setIsMarkingAllPresent(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-6">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-900 text-white">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide sticky left-0 bg-slate-900 z-20">क्रम</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide sticky left-12 bg-slate-900 z-20">नाम</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide sticky left-32 bg-slate-900 z-20">पद</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">मूल वेतन</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">HRA</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">अन्य भत्ता</th>
              
              {/* Day columns with Mark All Present buttons */}
              {Array.from({ length: totalDays }, (_, dayIndex) => (
                <th key={dayIndex} className="px-2 py-3 text-center text-xs font-semibold uppercase tracking-wide min-w-[40px]">
                  <div className="flex flex-col items-center">
                    <span>{dayIndex + 1}</span>
                    <button
                      onClick={() => handleMarkAllPresent(dayIndex)}
                      disabled={isMarkingAllPresent}
                      className="mt-1 text-xs bg-green-100 text-green-800 p-1 rounded hover:bg-green-200 transition-colors"
                      title="सभी को उपस्थित चिह्नित करें"
                    >
                      <Calendar className="h-3 w-3" />
                    </button>
                  </div>
                </th>
              ))}
              
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">उपस्थिति</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">सकल वेतन</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">ESI</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">PF</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">अन्य कटौती</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">कुल कटौती</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">नेट वेतन</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wide">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-200">
            {employees.map((employee, index) => {
              const attendanceCount = calculateAttendanceCount(employee.attendance, totalDays);
              const grossSalary = calculateGrossSalary(employee, attendanceCount, totalDays);
              const esi = Math.floor(grossSalary * ((employee.esi_rate || 0) / 10000));
              const pf = Math.floor(grossSalary * ((employee.pf_rate || 0) / 10000));
              const otherDeduction = employee.other_deduction || 0;
              const totalDeduction = esi + pf + otherDeduction;
              const netSalary = grossSalary - totalDeduction;

              return (
                <tr key={employee.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-slate-900 sticky left-0 bg-white">{index + 1}</td>
                  <td className="px-4 py-3 text-sm text-slate-900 sticky left-12 bg-white font-medium">{employee.name}</td>
                  <td className="px-4 py-3 text-sm text-slate-600 sticky left-32 bg-white">{employee.position}</td>
                  <td className="px-4 py-3 text-sm text-slate-900 text-center font-mono">₹{employee.basic.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-slate-900 text-center font-mono">₹{employee.hra.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm text-slate-900 text-center font-mono">₹{employee.allowance.toLocaleString()}</td>
                  
                  {/* Attendance columns */}
                  {Array.from({ length: totalDays }, (_, dayIndex) => (
                    <td key={dayIndex} className="px-2 py-3 text-center">
                      <Select
                        value={employee.attendance[dayIndex] || 'NONE'}
                        onValueChange={(value) => onAttendanceChange(employee.id, dayIndex, value as AttendanceCode)}
                      >
                        <SelectTrigger className={`w-12 h-9 text-sm border border-slate-300 rounded text-center font-bold ${getAttendanceColor(employee.attendance[dayIndex] || 'NONE')}`}>
                          <SelectValue placeholder="-" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NONE">-</SelectItem>
                          <SelectItem value="P">P</SelectItem>
                          <SelectItem value="A">A</SelectItem>
                          <SelectItem value="H">H</SelectItem>
                          <SelectItem value="PP">PP</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  ))}
                  
                  <td className="px-4 py-3 text-sm font-bold text-center">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                      {attendanceCount.toFixed(1)} दिन
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-900 text-center font-bold">₹{grossSalary.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-600 text-center">₹{esi.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-600 text-center">₹{pf.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-600 text-center">₹{otherDeduction.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-600 text-center font-bold">₹{totalDeduction.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm font-mono text-slate-900 text-center font-bold">₹{netSalary.toLocaleString()}</td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEditEmployee(employee)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onDeleteEmployee(employee.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}