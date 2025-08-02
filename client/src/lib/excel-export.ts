import type { Employee } from "@shared/schema";

export function exportToExcel(employees: Employee[], monthYear: string, totalDays: number) {
  const calculateAttendanceCount = (attendance: string[], totalDays: number): number => {
    let count = 0;
    for (let i = 0; i < totalDays; i++) {
      const status = attendance[i];
      if (status === 'P') count += 1;
      else if (status === 'H') count += 0.5;
      else if (status === 'PP') count += 2;
      // 'A' and 'NONE' count as 0
    }
    return count;
  };

  const calculateGrossSalary = (employee: Employee, attendanceCount: number, totalDays: number): number => {
    const dailyRate = (employee.basic + employee.hra + employee.allowance) / totalDays;
    return Math.floor(dailyRate * attendanceCount);
  };

  // Create CSV content with proper BOM for Hindi characters
  let csvContent = "\uFEFF"; // UTF-8 BOM
  
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
    const esi = Math.floor(grossSalary * ((emp.esi_rate || 0) / 10000));
    const pf = Math.floor(grossSalary * ((emp.pf_rate || 0) / 10000));
    const otherDeduction = emp.other_deduction || 0;
    const totalDeduction = esi + pf + otherDeduction;
    const netSalary = grossSalary - totalDeduction;
    
    const row = [
      index + 1,
      `"${emp.name}"`, // Quote names to handle commas in names
      `"${emp.position}"`,
      emp.basic,
      emp.hra,
      emp.allowance
    ];
    
    // Add attendance for each day
    for (let i = 0; i < totalDays; i++) {
      const status = emp.attendance[i] || 'NONE';
      row.push(status === 'NONE' ? '-' : status);
    }
    
    row.push(
      attendanceCount.toFixed(1),
      grossSalary,
      esi,
      pf,
      otherDeduction,
      totalDeduction,
      netSalary
    );
    
    csvContent += row.join(',') + '\n';
  });
  
  // Create blob with proper encoding
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `Salary_Sheet_${monthYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}
