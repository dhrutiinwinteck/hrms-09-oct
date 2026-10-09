export interface EmployeeOption {
  id: string;
  name: string;
  email?: string;
  department?: string;
}

export interface MonthOption {
  value: string;
  label: string;
  month: number;
  year: number;
}

export interface EditPunchInOutFilters {
  employeeId: string | null;
  month: string | null;
}

export type AttendanceStatus =
  | 'present'
  | 'absent'
  | 'late'
  | 'half-day';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;

  checkIn: string | null;
  checkOut: string | null;

  status: AttendanceStatus;

  lateMark: string | null;

  overtime?: number;
  breakTime?: number;

  isEditing?: boolean;
}

export interface EditPunchInOutState {
  selectedEmployee: EmployeeOption | null;
  selectedMonth: MonthOption | null;

  employeeSearchText: string;
  monthSearchText: string;

  isEmployeeDropdownOpen: boolean;
  isMonthDropdownOpen: boolean;

  isLoading: boolean;
  searchPerformed: boolean;

  attendanceData: AttendanceRecord[] | null;
  error: string | null;
}

export interface EditPunchInOutValidationErrors {
  employee?: string;
  month?: string;
}