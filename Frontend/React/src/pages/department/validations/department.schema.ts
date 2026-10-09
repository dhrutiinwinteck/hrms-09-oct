import { z } from 'zod';

export const departmentSchema = z.object({
  name: z
    .string()
    .min(1, 'Department name is required')
    .max(100, 'Department name must be less than 100 characters'),
});

export type DepartmentFormValues = z.infer<typeof departmentSchema>;