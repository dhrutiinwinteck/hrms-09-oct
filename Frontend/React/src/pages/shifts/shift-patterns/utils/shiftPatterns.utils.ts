// src/pages/shifts/utils/shiftPatterns.utils.ts

import { ShiftType } from '../types/shiftPatterns.types';

/**
 * Convert "HH:MM" or "HH:MM:SS" (24h)
 * to "hh:MM AM/PM".
 */
export const formatTimeTo12Hour = (time24: string): string => {
  if (!time24) {
    return '';
  }

  const cleanTime = time24.trim();

  const parts = cleanTime.split(':');

  if (parts.length < 2) {
    return '';
  }

  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);

  if (
    Number.isNaN(hours) ||
    Number.isNaN(minutes) ||
    hours < 0 ||
    hours > 23 ||
    minutes < 0 ||
    minutes > 59
  ) {
    return '';
  }

  const ampm = hours >= 12 ? 'PM' : 'AM';

  const h12 = hours % 12 || 12;

  return `${String(h12).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0'
  )} ${ampm}`;
};

/**
 * Convert "hh:MM AM/PM" to "HH:MM".
 */
export const parseTime12To24 = (time12: string): string => {
  if (!time12) {
    return '';
  }

  const match = time12.match(
    /(\d{1,2}):(\d{2})\s*(AM|PM)/i
  );

  if (!match) {
    return '';
  }

  let hours = parseInt(match[1], 10);

  const minutes = parseInt(match[2], 10);

  const ampm = match[3].toUpperCase();

  if (hours < 1 || hours > 12 || minutes < 0 || minutes > 59) {
    return '';
  }

  if (ampm === 'PM' && hours !== 12) {
    hours += 12;
  }

  if (ampm === 'AM' && hours === 12) {
    hours = 0;
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
    2,
    '0'
  )}`;
};

/**
 * Convert any supported time representation to HH:MM.
 *
 * Supports:
 * - 07:00
 * - 07:00:00
 * - 07:00 AM
 * - 07:00:00 AM
 */
export const normalizeTimeTo24Hour = (value: string): string => {
  if (!value) {
    return '';
  }

  const cleanValue = value.trim();

  if (/^\d{1,2}:\d{2}$/.test(cleanValue)) {
    return cleanValue;
  }

  if (/^\d{1,2}:\d{2}:\d{2}$/.test(cleanValue)) {
    return cleanValue.substring(0, 5);
  }

  return parseTime12To24(cleanValue);
};

/**
 * Compute duration between two HH:MM values.
 *
 * Supports shifts crossing midnight.
 *
 * Example:
 *
 * 07:00 -> 15:30 = 8h 30m
 * 22:30 -> 07:30 = 9h 00m
 */
export const computeDuration = (
  start: string,
  end: string
): string => {
  if (!start || !end) {
    return '';
  }

  const start24 = normalizeTimeTo24Hour(start);
  const end24 = normalizeTimeTo24Hour(end);

  if (!start24 || !end24) {
    return '';
  }

  const [sH, sM] = start24.split(':').map(Number);
  const [eH, eM] = end24.split(':').map(Number);

  if (
    Number.isNaN(sH) ||
    Number.isNaN(sM) ||
    Number.isNaN(eH) ||
    Number.isNaN(eM)
  ) {
    return '';
  }

  const startMinutes = sH * 60 + sM;

  let endMinutes = eH * 60 + eM;

  if (endMinutes < startMinutes) {
    endMinutes += 24 * 60;
  }

  const diff = endMinutes - startMinutes;

  const hours = Math.floor(diff / 60);

  const mins = diff % 60;

  return `${hours}h ${String(mins).padStart(2, '0')}m`;
};

/**
 * Infer shift type from start time.
 */
export const inferShiftType = (
  startTime: string
): ShiftType => {
  if (!startTime) {
    return 'morning';
  }

  const normalized = normalizeTimeTo24Hour(startTime);

  if (!normalized) {
    return 'morning';
  }

  const [hours] = normalized.split(':').map(Number);

  if (hours >= 6 && hours < 12) {
    return 'morning';
  }

  if (hours >= 12 && hours < 18) {
    return 'afternoon';
  }

  return 'night';
};

/**
 * Get icon name for shift type.
 */
export const getShiftTypeIconName = (
  type: ShiftType
): string => {
  const map: Record<ShiftType, string> = {
    morning: 'Sun',
    afternoon: 'Sunrise',
    night: 'Moon',
  };

  return map[type];
};

/**
 * Pagination text.
 */
export const formatPaginationText = (
  start: number,
  end: number,
  total: number
): string => {
  if (total === 0) {
    return 'Showing 0 to 0 of 0 patterns';
  }

  return `Showing ${start} to ${end} of ${total} patterns`;
};