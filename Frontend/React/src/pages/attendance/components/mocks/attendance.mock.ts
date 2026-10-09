/**
 * ======================================================
 * Attendance Module - Mock Data
 * ======================================================
 * Enterprise-grade mock data for attendance module development.
 *
 * @module mocks/attendance.mock
 */

import { AttendanceRecord, AttendanceOverviewItem } from '../../types/attendance.types'; // ✅ Correct path
import { WEEKDAY_SHORT_NAMES } from '../../constants/attendance.constants'; // ✅ Correct path

// -----------------------------------------------------------------------------
// Constants
// -----------------------------------------------------------------------------

const YEAR = 2026;
const MONTH = 7;

// -----------------------------------------------------------------------------
// Helper Functions
// -----------------------------------------------------------------------------

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(year, month, 0).getDate();
};

const getDayOfWeek = (year: number, month: number, day: number): number => {
  return new Date(year, month - 1, day).getDay();
};

const formatDate = (year: number, month: number, day: number): string => {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

const randomTime = (startHour: number, endHour: number): string => {
  const hour = Math.floor(Math.random() * (endHour - startHour + 1)) + startHour;
  const minute = Math.floor(Math.random() * 60);
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

// -----------------------------------------------------------------------------
// Generate Overview Data
// -----------------------------------------------------------------------------

const generateOverviewData = (): AttendanceOverviewItem[] => {
  const daysInMonth = getDaysInMonth(YEAR, MONTH);
  const overview: AttendanceOverviewItem[] = [];

  const statuses: Array<'Present' | 'Absent' | 'Late'> = [
    'Present', 'Present', 'Present', 'Absent', 'Present',
    'Present', 'Late', 'Present', 'Present', 'Present',
    'Present', 'Present', 'Absent', 'Present', 'Present',
    'Present', 'Late', 'Present', 'Present', 'Present',
    'Present', 'Present', 'Present', 'Absent', 'Present',
    'Present', 'Present', 'Present', 'Present', 'Late',
    'Present'
  ];

  for (let day = 1; day <= daysInMonth; day++) {
    const dow = getDayOfWeek(YEAR, MONTH, day);
    const dateStr = formatDate(YEAR, MONTH, day);
    const dayOfWeek = WEEKDAY_SHORT_NAMES[dow];
    const dayOfMonth = day;

    let status: AttendanceOverviewItem['status'];

    if (dow === 0 || dow === 6) {
      status = 'WeeklyOff';
    } else {
      if (day === 4) {
        status = 'Holiday';
      } else {
        const patternIndex = (day - 1) % statuses.length;
        const randomVal = Math.random();
        if (randomVal < 0.1) {
          status = 'Absent';
        } else if (randomVal < 0.15) {
          status = 'Late';
        } else {
          status = statuses[patternIndex];
        }
      }
    }

    overview.push({
      date: dateStr,
      dayOfWeek,
      dayOfMonth,
      status,
    });
  }

  return overview;
};

// -----------------------------------------------------------------------------
// Generate Records Data
// -----------------------------------------------------------------------------

const generateRecordsData = (): AttendanceRecord[] => {
  const daysInMonth = getDaysInMonth(YEAR, MONTH);
  const records: AttendanceRecord[] = [];

  const overview = generateOverviewData();
  const overviewMap = new Map<string, AttendanceOverviewItem>();
  overview.forEach(item => overviewMap.set(item.date, item));

  let idCounter = 0;

  for (let day = 1; day <= daysInMonth; day++) {
    const dateStr = formatDate(YEAR, MONTH, day);
    const overviewItem = overviewMap.get(dateStr);
    if (!overviewItem) continue;

    const status = overviewItem.status;

    if (status === 'WeeklyOff' || status === 'Holiday') {
      continue;
    }

    const punchIn = randomTime(8, 10);
    const punchOut = randomTime(17, 19);
    const breakTime = 30 + Math.floor(Math.random() * 30);

    const inParts = punchIn.split(':').map(Number);
    const outParts = punchOut.split(':').map(Number);
    const inMinutes = inParts[0] * 60 + inParts[1];
    const outMinutes = outParts[0] * 60 + outParts[1];
    const totalMinutes = outMinutes - inMinutes - breakTime;
    const workingHours = Math.max(0, parseFloat((totalMinutes / 60).toFixed(2)));

    const isLate = status === 'Late' || (inMinutes > 9 * 60 + 15);

    const record: AttendanceRecord = {
      id: `att-${dateStr}-${String(idCounter++).padStart(3, '0')}`,
      date: dateStr,
      shift: 'Regular Shift',
      punchIn: status === 'Absent' ? '--:--' : punchIn,
      punchOut: status === 'Absent' ? '--:--' : punchOut,
      workingHours: status === 'Absent' ? 0 : workingHours,
      breakTime: status === 'Absent' ? 0 : breakTime,
      status: isLate ? 'Late' : status,
      employeeName: 'John Doe',
    };

    records.push(record);
  }

  return records;
};

// -----------------------------------------------------------------------------
// Export Mock Data
// -----------------------------------------------------------------------------

export const attendanceMockData = {
  records: generateRecordsData(),
  overview: generateOverviewData(),
};

export { generateOverviewData, generateRecordsData };