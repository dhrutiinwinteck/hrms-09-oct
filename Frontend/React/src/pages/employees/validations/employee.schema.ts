// src/pages/employees/validations/employee.schema.ts

import { z } from 'zod';

export const employeeSchema = z.object({
  firstName: z.string()
    .min(1, 'First name is required')
    .max(50, 'First name must be less than 50 characters'),
  
  lastName: z.string()
    .min(1, 'Last name is required')
    .max(50, 'Last name must be less than 50 characters'),
  
  email: z.string()
    .min(1, 'Email is required')
    .email('Invalid email address'),
  
  personalEmail: z.string()
    .email('Invalid personal email address')
    .optional()
    .or(z.literal('')),
  
  phone: z.string()
    .optional()
    .or(z.literal(''))
    .refine((val) => {
      if (!val) return true;
      return /^[0-9]{10}$/.test(val);
    }, 'Phone number must be 10 digits'),
  
  photo: z.string().optional(),
  
  gender: z.string()
    .min(1, 'Gender is required'),
  
  password: z.string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  
  noticePeriod: z.number()
    .min(0, 'Notice period must be 0 or more days')
    .max(90, 'Notice period cannot exceed 90 days'),
  
  joiningDate: z.string()
    .min(1, 'Joining date is required'),
  
  designation: z.string()
    .min(1, 'Designation is required'),
  
  reportingManager: z.string()
    .min(1, 'Reporting manager is required'),
  
  employeeType: z.string()
    .min(1, 'Employee type is required')
});

export type EmployeeFormSchema = z.infer<typeof employeeSchema>;