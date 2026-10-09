import { z } from 'zod';

export const emergencyContactSchema = z.object({
  fullName: z.string()
    .min(2, 'Full name must be at least 2 characters')
    .max(100, 'Full name must not exceed 100 characters'),
  
  relationship: z.string()
    .min(1, 'First fill this Input'),
  
  phoneNumber: z.string()
    .regex(/^\+?[\d\s-]{10,15}$/, 'Please enter a valid phone number'),
  
  emailAddress: z.string()
    .email('Please enter a valid email address')
    .optional()
    .nullable(),
  
  address: z.string()
    .min(10, 'Address must be at least 10 characters')
    .max(200, 'Address must not exceed 200 characters'),
});

export const emergencyContactsSchema = z.object({
  contact1: emergencyContactSchema,
  contact2: emergencyContactSchema.optional().nullable(),
});

export type IEmergencyContactForm = z.infer<typeof emergencyContactSchema>;
export type IEmergencyContactsForm = z.infer<typeof emergencyContactsSchema>;