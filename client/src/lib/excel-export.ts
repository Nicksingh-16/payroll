import type { Employee } from "@shared/schema";

export function exportToExcel(employees: Employee[], monthYear: string, totalDays: number) {
  const calculateAttendanceCount = (attendance: string[], totalDays: number): number => {
    let count = 0;
    for (let i = 0; i < totalDays; i++) {
      const status = attendance[i];
      if (status === 'P') count += 1;
      else if (status === 'H') count += 0.5;
      else if (status === 'PP') count += 2;
    }
    return count;
  };

  const calculateGrossSalary = (employee: Employee, attendanceCount: number, totalDays: number): number => {
    const dailyRate = (employee.basic + employee.hra + employee.allowance) / totalDays;
    return Math.floor(dailyRate * attendanceCount);
  };

  // Create CSV content
  let csvContent = "data:text/csv;charset=utf-8,";
  
  // Headers
  const headers = [
    'क्रम', 'कर्मचारी नाम', 'पद', 'मूल वेतन', 'HRA', 'अन्य भत्ता'
  ];
  
  // Add day headers
  for (let i = 1; i <= totalDays; i++) {
    headers.push(`दिन ${i}`);
  }
  
  headers.push('उपस्थिति', 'कुल वेतन', 'ESI', 'PF', 'अन्य कटौती', 'कुल कटौती', 'नेट वेतन');
  
  csvContent += headers.join(',') + '\n';
  
  // Data rows
  employees.forEach((emp, index) => {
    const attendanceCount = calculateAttendanceCount(emp.attendance, totalDays);
    const grossSalary = calculateGrossSalary(emp, attendanceCount, totalDays);
    const esi = Math.floor(grossSalary * 0.0175);
    const pf = Math.floor(grossSalary * 0.12);
    const totalDeduction = esi + pf;
    const netSalary = grossSalary - totalDeduction;
    
    const row = [
      index + 1,
      emp.name,
      emp.position,
      emp.basic,
      emp.hra,
      emp.allowance
    ];
    
    // Add attendance for each day
    for (let i = 0; i < totalDays; i++) {
      row.push(emp.attendance[i] || 'P');
    }
    
    row.push(
      attendanceCount.toFixed(1),
      grossSalary,
      esi,
      pf,
      0,
      totalDeduction,
      netSalary
    );
    
    csvContent += row.join(',') + '\n';
  });
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Salary_Sheet_${monthYear}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
