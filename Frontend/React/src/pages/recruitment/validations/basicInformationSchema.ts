import { z } from 'zod';

export const basicInformationSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phonePrefix: z.string().default('+91'),
  phoneNumber: z.string().regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  alternativePhone: z.string().optional().or(z.literal('')),
  positionApplied: z.string().min(1, 'Please select a position'),
  dateOfApplication: z.string().min(1, 'Date is required'),
  resume: z
    .any()
    .refine((files) => files?.length > 0, "Resume is required")
    .refine((files) => files?.[0]?.size <= 5000000, `Max file size is 5MB.`),
});

export type IBasicInformationForm = z.infer<typeof basicInformationSchema>;