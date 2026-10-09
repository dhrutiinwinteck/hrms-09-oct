// src/pages/attendance/attendance-history/mocks/attendanceHistory.mock.ts

import { EmployeeAttendance, AttendanceStatistics, AttendanceFilters, PaginationInfo, AttendanceInsights } from '../types/attendanceHistory.types';

const generateDailyRecords = (month: number, year: number): Array<{ date: string; status: any; checkIn?: string; lateMinutes?: number }> => {
  const records = [];
  const daysInMonth = new Date(year, month, 0).getDate();
  
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    
    // Weekends (Saturday and Sunday)
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      records.push({
        date: `${String(day).padStart(2, '0')} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month-1]} ${year}`,
        status: 'WO'
      });
      continue;
    }
    
    // Random attendance pattern
    const random = Math.random();
    if (random < 0.75) {
      // Present
      const lateMinutes = Math.random() < 0.2 ? Math.floor(Math.random() * 30) + 1 : 0;
      const hour = lateMinutes > 0 ? 9 : 9;
      const minute = lateMinutes > 0 ? 18 : Math.floor(Math.random() * 30);
      records.push({
        date: `${String(day).padStart(2, '0')} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month-1]} ${year}`,
        status: 'P',
        checkIn: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')} AM`,
        lateMinutes
      });
    } else if (random < 0.88) {
      // Absent
      records.push({
        date: `${String(day).padStart(2, '0')} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month-1]} ${year}`,
        status: 'AB'
      });
    } else {
      // Various leave types
      const leaveTypes = ['PL', 'CO', 'CL', 'LOP', 'HD-PL', 'HD-CL', 'HD-CO', 'PH', 'HD-LOP', 'LWP'];
      records.push({
        date: `${String(day).padStart(2, '0')} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][month-1]} ${year}`,
        status: leaveTypes[Math.floor(Math.random() * leaveTypes.length)]
      });
    }
  }
  
  return records;
};

const generateMonthlySummary = (records: any[]) => {
  const summary = {
    present: 0,
    weekOff: 0,
    paidLeave: 0,
    casualLeave: 0,
    compensatoryLeave: 0,
    halfDayPL: 0,
    halfDayCL: 0,
    halfDayCO: 0,
    publicHoliday: 0,
    lop: 0,
    halfDayLOP: 0,
    lwp: 0,
    paidDays: 0,
    lopAbsent: 0
  };
  
  records.forEach(record => {
    switch(record.status) {
      case 'P': summary.present++; break;
      case 'WO': summary.weekOff++; break;
      case 'PL': summary.paidLeave++; break;
      case 'CL': summary.casualLeave++; break;
      case 'CO': summary.compensatoryLeave++; break;
      case 'HD-PL': summary.halfDayPL++; break;
      case 'HD-CL': summary.halfDayCL++; break;
      case 'HD-CO': summary.halfDayCO++; break;
      case 'PH': summary.publicHoliday++; break;
      case 'LOP': summary.lop++; break;
      case 'HD-LOP': summary.halfDayLOP++; break;
      case 'LWP': summary.lwp++; break;
      case 'AB': summary.lopAbsent++; break;
    }
  });
  
  summary.paidDays = summary.present + summary.weekOff + summary.paidLeave + 
                     summary.casualLeave + summary.compensatoryLeave + summary.halfDayPL + 
                     summary.halfDayCL + summary.halfDayCO + summary.publicHoliday;
  
  return summary;
};

const employees = [
  { id: 'EMP001', name: 'Aarav Sharma', designation: 'Software Engineer', department: 'Engineering' },
  { id: 'EMP002', name: 'Priya Singh', designation: 'Product Manager', department: 'Product' },
  { id: 'EMP003', name: 'Rohan Mehta', designation: 'UI/UX Designer', department: 'Design' },
  { id: 'EMP004', name: 'Sneha Iyer', designation: 'HR Executive', department: 'HR' },
  { id: 'EMP005', name: 'Vikram Joshi', designation: 'DevOps Engineer', department: 'Engineering' },
  { id: 'EMP006', name: 'Ananya Reddy', designation: 'Marketing Lead', department: 'Marketing' },
  { id: 'EMP007', name: 'Karan Patel', designation: 'Backend Developer', department: 'Engineering' },
  { id: 'EMP008', name: 'Meera Nair', designation: 'Data Analyst', department: 'Analytics' }
];

export const generateMockAttendanceHistory = (month: number = 5, year: number = 2026): EmployeeAttendance[] => {
  return employees.map(emp => {
    const records = generateDailyRecords(month, year);
    const lateCount = records.filter(r => r.status === 'P' && r.lateMinutes && r.lateMinutes > 0).length;
    const monthlySummary = generateMonthlySummary(records);
    
    return {
      ...emp,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=random`,
      dailyRecords: records,
      lateCount,
      monthlySummary
    };
  });
};

export const getMockStatistics = (employees: EmployeeAttendance[]): AttendanceStatistics => {
  const totalEmployees = employees.length;
  let present = 0, absent = 0, weekOff = 0, latePunchIn = 0, lop = 0;
  
  employees.forEach(emp => {
    emp.dailyRecords.forEach(record => {
      switch(record.status) {
        case 'P': 
          present++; 
          if (record.lateMinutes && record.lateMinutes > 0) latePunchIn++;
          break;
        case 'AB': absent++; break;
        case 'WO': weekOff++; break;
        case 'LOP': lop++; break;
      }
    });
  });
  
  const totalRecords = employees.reduce((sum, emp) => sum + emp.dailyRecords.length, 0);
  const totalLateMinutes = employees.reduce((sum, emp) => {
    return sum + emp.dailyRecords.reduce((s, r) => s + (r.lateMinutes || 0), 0);
  }, 0);
  
  return {
    totalEmployees,
    present,
    absent,
    weekOff,
    latePunchIn,
    lop,
    averageAttendance: (present / totalRecords) * 100,
    averageLateMinutes: latePunchIn > 0 ? totalLateMinutes / latePunchIn : 0,
    totalWorkingDays: totalRecords - weekOff,
    absenteeismRate: (absent / totalRecords) * 100
  };
};

export const getMockPagination = (total: number, pageSize: number = 5, currentPage: number = 1): PaginationInfo => {
  return {
    currentPage,
    pageSize,
    totalItems: total,
    totalPages: Math.ceil(total / pageSize)
  };
};

export const getMockFilters = (): AttendanceFilters => {
  return {
    month: '2026-05',
    year: 2026
  };
};

export const getMockInsights = (): AttendanceInsights => {
  return {
    title: 'Late Arrivals Alert',
    description: 'employees have more than 3 late arrivals this month.',
    count: 6,
    actionLabel: 'View Details'
  };
};