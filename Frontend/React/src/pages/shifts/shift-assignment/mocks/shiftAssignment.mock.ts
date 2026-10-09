// src/pages/shifts/shift-assignment/mocks/shiftAssignment.mock.ts

import { Employee, ShiftPattern } from '../types/shiftAssignment.types';

export const mockEmployees: Employee[] = [
    { id: 'emp-001', name: 'Aarav Sharma', email: 'aarav.sharma@company.com', department: 'Engineering' },
    { id: 'emp-002', name: 'Priya Patel', email: 'priya.patel@company.com', department: 'Product' },
    { id: 'emp-003', name: 'Rahul Singh', email: 'rahul.singh@company.com', department: 'Design' },
    { id: 'emp-004', name: 'Sneha Reddy', email: 'sneha.reddy@company.com', department: 'Engineering' },
    { id: 'emp-005', name: 'Vikram Kumar', email: 'vikram.kumar@company.com', department: 'Marketing' },
    { id: 'emp-006', name: 'Ananya Iyer', email: 'ananya.iyer@company.com', department: 'HR' },
    { id: 'emp-007', name: 'Karan Joshi', email: 'karan.joshi@company.com', department: 'Engineering' },
    { id: 'emp-008', name: 'Meera Nair', email: 'meera.nair@company.com', department: 'Finance' },
];

export const mockShiftPatterns: ShiftPattern[] = [
    { id: 'sp-001', name: 'Morning Shift', startTime: '07:00', endTime: '15:30', description: 'Early morning coverage' },
    { id: 'sp-002', name: 'Afternoon Shift', startTime: '15:00', endTime: '23:00', description: 'Afternoon to evening' },
    { id: 'sp-003', name: 'Night Shift', startTime: '22:30', endTime: '07:30', description: 'Overnight coverage' },
    { id: 'sp-004', name: 'Split Shift', startTime: '09:00', endTime: '18:00', description: 'Standard business hours' },
    { id: 'sp-005', name: 'Weekend Shift', startTime: '08:00', endTime: '17:00', description: 'Weekend coverage' },
];

export const getEmployeeById = (id: string): Employee | undefined => {
    return mockEmployees.find(emp => emp.id === id);
};

export const getShiftPatternById = (id: string): ShiftPattern | undefined => {
    return mockShiftPatterns.find(pattern => pattern.id === id);
};