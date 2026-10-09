import { z } from 'zod';

/* ============================================================
   PHONE NUMBER VALIDATION
   ============================================================ */

const phoneNumberSchema = z
  .string()
  .trim()
  .min(
    10,
    'Phone number must be at least 10 characters'
  )
  .max(
    16,
    'Phone number must not exceed 16 characters'
  )
  .regex(
    /^\+?[0-9][0-9\s-]{9,15}$/,
    'Please enter a valid phone number'
  );

/* ============================================================
   SINGLE REFERENCE
   ============================================================ */

export const referenceSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(
      2,
      'Full name must be at least 2 characters'
    )
    .max(
      100,
      'Full name must not exceed 100 characters'
    ),

  designation: z
    .string()
    .trim()
    .min(
      2,
      'Designation must be at least 2 characters'
    )
    .max(
      100,
      'Designation must not exceed 100 characters'
    ),

  companyOrganization: z
    .string()
    .trim()
    .min(
      2,
      'Company name must be at least 2 characters'
    )
    .max(
      200,
      'Company name must not exceed 200 characters'
    ),

  emailAddress: z
    .string()
    .trim()
    .email(
      'Please enter a valid email address'
    ),

  phoneNumber: phoneNumberSchema,

  relationship: z
    .string()
    .trim()
    .min(
      1,
      'Relationship is required'
    )
    .max(
      100,
      'Relationship must not exceed 100 characters'
    ),
});

/* ============================================================
   REFERENCES
   ============================================================

   Both references are optional.

   User can:
   - Leave Reference 1 empty
   - Leave Reference 2 empty
   - Provide only Reference 1
   - Provide only Reference 2
   - Provide both references

   If a reference object is provided, its fields will be
   validated using referenceSchema.
   ============================================================ */

export const referencesSchema = z.object({
  reference1: referenceSchema
    .optional()
    .nullable(),

  reference2: referenceSchema
    .optional()
    .nullable(),
});

/* ============================================================
   TYPES
   ============================================================ */

export type IReferenceForm =
  z.infer<typeof referenceSchema>;

export type IReferencesForm =
  z.infer<typeof referencesSchema>;