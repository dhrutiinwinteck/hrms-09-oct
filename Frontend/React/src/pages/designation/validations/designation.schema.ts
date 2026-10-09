import { z } from 'zod';

export const designationSchema = z.object({
  name: z.string().min(1, 'Designation name is required').max(100, 'Too long'),
  department: z.string().min(1, 'Department is required'),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

export type DesignationFormData = z.infer<typeof designationSchema>;