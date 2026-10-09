import {
  AdminHoliday,
  AdminHolidayApiResponse,
  AdminHolidayCreateRequest,
  AdminHolidayFormData,
  AdminHolidayUpdateRequest,
} from '../types/adminHoliday.types';
import { getDayFromDate } from './adminHoliday.utils';

/**
 * Converts YYYY-MM-DD into a local Date.
 *
 * Using new Date('YYYY-MM-DD') can introduce timezone shifts.
 * This implementation deliberately constructs a local date.
 */
export const parseApiDate = (value: string): Date => {
  const [year, month, day] = value.split('-').map(Number);

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day)
  ) {
    const fallback = new Date(value);

    if (Number.isNaN(fallback.getTime())) {
      throw new Error(`Invalid holiday date received from API: ${value}`);
    }

    return fallback;
  }

  return new Date(year, month - 1, day);
};

/**
 * Converts Date to backend-compatible YYYY-MM-DD.
 */
export const formatDateForApi = (date: Date): string => {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
    throw new Error('Invalid holiday date.');
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Backend status:
 * 1 = Active
 * 0 = Inactive
 */
export const mapApiStatusToUiStatus = (
  status: number,
): AdminHoliday['status'] => {
  return status === 1 ? 'active' : 'inactive';
};

/**
 * Converts backend holiday to Admin UI holiday.
 */
export const mapApiHolidayToAdminHoliday = (
  holiday: AdminHolidayApiResponse,
): AdminHoliday => {
  const holidayDate = parseApiDate(holiday.holiday_date);

  return {
    id: String(holiday.id),
    title: holiday.holiday_name,
    holidayDate,
    day: getDayFromDate(holidayDate),
    status: mapApiStatusToUiStatus(holiday.status),
    createdBy: holiday.createdby ?? null,
    createdOn: holiday.createdon
      ? new Date(holiday.createdon)
      : null,
  };
};

/**
 * Converts Add Holiday form to POST payload.
 */
export const mapFormDataToCreateRequest = (
  data: AdminHolidayFormData,
  createdBy: string,
): AdminHolidayCreateRequest => {
  if (!data.holidayDate) {
    throw new Error('Holiday date is required.');
  }

  return {
    holiday_name: data.title.trim(),
    holiday_date: formatDateForApi(data.holidayDate),
    createdby: createdBy,
  };
};

/**
 * Converts Edit Holiday form to PUT payload.
 */
export const mapFormDataToUpdateRequest = (
  data: AdminHolidayFormData,
  modifiedBy: string,
): AdminHolidayUpdateRequest => {
  if (!data.holidayDate) {
    throw new Error('Holiday date is required.');
  }

  return {
    holiday_name: data.title.trim(),
    holiday_date: formatDateForApi(data.holidayDate),
    modifiedby: modifiedBy,
  };
};

/**
 * Converts status to backend integer.
 */
export const mapUiStatusToApiStatus = (
  status: AdminHoliday['status'],
): number => {
  return status === 'active' ? 1 : 0;
};

/**
 * Converts holiday to edit form.
 */
export const mapToFormData = (
  holiday: AdminHoliday,
): AdminHolidayFormData => {
  return {
    title: holiday.title,
    holidayDate: holiday.holidayDate,
  };
};