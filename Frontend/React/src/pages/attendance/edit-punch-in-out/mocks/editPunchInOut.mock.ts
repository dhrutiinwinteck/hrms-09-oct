// src/pages/attendance/edit-punch-in-out/mocks/editPunchInOut.mock.ts
import { EmployeeOption, AttendanceRecord } from '../types/editPunchInOut.types';

export const MOCK_EMPLOYEES: EmployeeOption[] = [
  { id: 'emp-001', name: 'Rahul Sharma', email: 'rahul.sharma@company.com', department: 'Engineering' },
  { id: 'emp-002', name: 'Priya Shah', email: 'priya.shah@company.com', department: 'Marketing' },
  { id: 'emp-003', name: 'Amit Patel', email: 'amit.patel@company.com', department: 'Sales' },
  { id: 'emp-004', name: 'Neha Mehta', email: 'neha.mehta@company.com', department: 'HR' },
  { id: 'emp-005', name: 'Rohan Desai', email: 'rohan.desai@company.com', department: 'Engineering' },
  { id: 'emp-006', name: 'Sneha Patel', email: 'sneha.patel@company.com', department: 'Finance' },
  { id: 'emp-007', name: 'Vikram Singh', email: 'vikram.singh@company.com', department: 'Operations' },
  { id: 'emp-008', name: 'Ananya Reddy', email: 'ananya.reddy@company.com', department: 'Design' },
];

export let MOCK_ATTENDANCE_DATA: AttendanceRecord[] = [
  {
    id: 'att-001',
    employeeId: 'emp-001',
    employeeName: 'Rahul Sharma',
    date: '2026-08-01',
    checkIn: '09:00',
    checkOut: '18:00',
    status: 'present',
    lateMark: null,
    overtime: 0,
    breakTime: 1,
  },
  {
    id: 'att-002',
    employeeId: 'emp-001',
    employeeName: 'Rahul Sharma',
    date: '2026-08-02',
    checkIn: '09:15',
    checkOut: '18:00',
    status: 'late',
    lateMark: '09:15',
    overtime: 0,
    breakTime: 1,
  },
  {
    id: 'att-003',
    employeeId: 'emp-001',
    employeeName: 'Rahul Sharma',
    date: '2026-08-03',
    checkIn: null,
    checkOut: null,
    status: 'absent',
    lateMark: null,
    overtime: 0,
    breakTime: 0,
  },
  {
    id: 'att-004',
    employeeId: 'emp-001',
    employeeName: 'Rahul Sharma',
    date: '2026-08-04',
    checkIn: '09:30',
    checkOut: '17:30',
    status: 'late',
    lateMark: '09:30',
    overtime: 0,
    breakTime: 1,
  },
  {
    id: 'att-005',
    employeeId: 'emp-001',
    employeeName: 'Rahul Sharma',
    date: '2026-08-05',
    checkIn: '09:00',
    checkOut: '18:00',
    status: 'present',
    lateMark: null,
    overtime: 0,
    breakTime: 1,
  },
];

// Helper function to update attendance data
export const updateAttendanceData = (recordId: string, data: Partial<AttendanceRecord>): AttendanceRecord => {
  const index = MOCK_ATTENDANCE_DATA.findIndex(r => r.id === recordId);
  if (index === -1) {
    throw new Error('Attendance record not found');
  }
  const updatedRecord = { ...MOCK_ATTENDANCE_DATA[index], ...data };
  MOCK_ATTENDANCE_DATA[index] = updatedRecord;
  return updatedRecord;
};

// Helper function to get filtered attendance data
export const getFilteredAttendanceData = (employeeId: string, month: string): AttendanceRecord[] => {
  return MOCK_ATTENDANCE_DATA.filter(
    record => record.employeeId === employeeId && record.date.startsWith(month)
  );
};

// Helper function to generate sample data for a month
export const generateSampleData = (employeeId: string, month: string): AttendanceRecord[] => {
  const sampleData: AttendanceRecord[] = [
    {
      id: `att-${Date.now()}-001`,
      employeeId: employeeId,
      employeeName: MOCK_EMPLOYEES.find(e => e.id === employeeId)?.name || 'Unknown',
      date: `${month}-01`,
      checkIn: '09:00',
      checkOut: '18:00',
      status: 'present',
      lateMark: null,
      overtime: 0,
      breakTime: 1,
    },
    {
      id: `att-${Date.now()}-002`,
      employeeId: employeeId,
      employeeName: MOCK_EMPLOYEES.find(e => e.id === employeeId)?.name || 'Unknown',
      date: `${month}-02`,
      checkIn: '09:15',
      checkOut: '18:00',
      status: 'late',
      lateMark: '09:15',
      overtime: 0,
      breakTime: 1,
    },
    {
      id: `att-${Date.now()}-003`,
      employeeId: employeeId,
      employeeName: MOCK_EMPLOYEES.find(e => e.id === employeeId)?.name || 'Unknown',
      date: `${month}-03`,
      checkIn: null,
      checkOut: null,
      status: 'absent',
      lateMark: null,
      overtime: 0,
      breakTime: 0,
    },
  ];
  MOCK_ATTENDANCE_DATA = [...MOCK_ATTENDANCE_DATA, ...sampleData];
  return sampleData;
};