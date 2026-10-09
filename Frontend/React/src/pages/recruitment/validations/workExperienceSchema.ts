import { z } from 'zod';

/* ============================================================
   SINGLE WORK EXPERIENCE
============================================================ */

export const workExperienceSchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(
      2,
      'Company name must be at least 2 characters'
    )
    .max(
      100,
      'Company name must not exceed 100 characters'
    ),

  jobTitle: z
    .string()
    .trim()
    .min(
      2,
      'Job title must be at least 2 characters'
    )
    .max(
      100,
      'Job title must not exceed 100 characters'
    ),

  employeeType: z
    .string()
    .min(
      1,
      'Please select employee type'
    ),

  fromDate: z
    .string()
    .min(
      1,
      'From date is required'
    ),

  toDate: z
    .string()
    .optional()
    .nullable(),

  currentlyWorking: z
    .boolean()
    .default(false),

  keyResponsibilities: z
    .string()
    .trim()
    .min(
      10,
      'Key responsibilities must be at least 10 characters'
    )
    .max(
      1000,
      'Key responsibilities must not exceed 1000 characters'
    ),
});

/* ============================================================
   WORK EXPERIENCES

   RULE:

   1. Fresher = TRUE
      -> 0 experiences allowed
      -> validation passes

   2. Fresher = FALSE
      -> minimum 1 experience required

   3. If experience exists
      -> every required field is validated
============================================================ */

export const workExperiencesSchema = z
  .object({
    isFresher: z
      .boolean()
      .default(false),

    experiences: z
      .array(workExperienceSchema)
      .default([]),
  })
  .superRefine((data, ctx) => {
    if (data.isFresher === true) {
      return;
    }

    if (data.experiences.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['experiences'],
        message:
          'Please add at least one work experience or select the fresher option.',
      });
    }
  });

/* ============================================================
   TYPES
============================================================ */

export type IWorkExperienceForm =
  z.infer<
    typeof workExperienceSchema
  >;

export type IWorkExperiencesForm =
  z.infer<
    typeof workExperiencesSchema
  >;