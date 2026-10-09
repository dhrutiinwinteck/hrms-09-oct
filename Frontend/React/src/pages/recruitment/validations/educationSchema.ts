import { z } from 'zod';

/* ============================================================
   SINGLE EDUCATION
============================================================ */

export const educationSchema = z.object({
  qualification: z
    .string()
    .trim()
    .min(
      2,
      'Qualification must be at least 2 characters'
    )
    .max(
      150,
      'Qualification must not exceed 150 characters'
    ),

  specification: z
    .string()
    .trim()
    .min(
      2,
      'Specification must be at least 2 characters'
    )
    .max(
      100,
      'Specification must not exceed 100 characters'
    ),

  institute: z
    .string()
    .trim()
    .min(
      2,
      'Institute name must be at least 2 characters'
    )
    .max(
      200,
      'Institute name must not exceed 200 characters'
    ),

  passingYear: z
    .string()
    .trim()
    .regex(
      /^\d{4}$/,
      'Please enter a valid 4-digit year'
    ),

  percentageCgpa: z
    .string()
    .trim()
    .min(
      1,
      'Percentage/CGPA is required'
    )
    .max(
      50,
      'Percentage/CGPA must not exceed 50 characters'
    ),

  currentlyPursuing: z
    .boolean()
    .default(false),
});

/* ============================================================
   EDUCATION LIST

   Minimum = 1
   Maximum = 6

   At least ONE education record is required.
   Second, third, etc. education records are optional.
============================================================ */

export const educationsSchema = z.object({
  educations: z
    .array(educationSchema)
    .min(
      1,
      'Please add at least 1 education record.'
    )
    .max(
      6,
      'Maximum 6 education records are allowed.'
    ),
});

/* ============================================================
   TYPES
============================================================ */

export type IEducationForm =
  z.infer<typeof educationSchema>;

export type IEducationsForm =
  z.infer<typeof educationsSchema>;