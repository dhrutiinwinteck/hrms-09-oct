import { z } from 'zod';

export const personalDetailsSchema = z.object({
  dateOfBirth: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Please enter a valid date of birth'),
  
  maritalStatus: z.string()
    .min(1, 'Please select marital status'),
  
  gender: z.string()
    .min(1, 'Please select gender'),
  
  nationality: z.string()
    .min(1, 'Please select nationality'),
  
  aadharNumber: z.string()
    .regex(/^\d{12}$/, 'Aadhar number must be 12 digits')
    .optional()
    .nullable(),
  
  panNumber: z.string()
    .regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, 'Please enter a valid PAN number')
    .optional()
    .nullable(),
  
  currentAddress: z.string()
    .min(10, 'Current address must be at least 10 characters')
    .max(200, 'Current address must not exceed 200 characters'),
  
  permanentAddress: z.string()
    .min(10, 'Permanent address must be at least 10 characters')
    .max(200, 'Permanent address must not exceed 200 characters'),
});

export type IPersonalDetailsForm = z.infer<typeof personalDetailsSchema>;