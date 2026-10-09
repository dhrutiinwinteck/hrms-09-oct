import { z } from 'zod';

import {
  VALIDATION_MESSAGES,
  PASSWORD_REQUIREMENTS,
} from '../constants/settings.constants';

/* ============================================================
   PASSWORD VALIDATION
   ============================================================ */

const passwordSchema = z
  .string({
    required_error: VALIDATION_MESSAGES.PASSWORD.REQUIRED,
  })
  .min(PASSWORD_REQUIREMENTS.MIN_LENGTH, {
    message: VALIDATION_MESSAGES.PASSWORD.MIN_LENGTH,
  })
  .refine((v) => /[A-Z]/.test(v), {
    message: VALIDATION_MESSAGES.PASSWORD.UPPERCASE,
  })
  .refine((v) => /[a-z]/.test(v), {
    message: VALIDATION_MESSAGES.PASSWORD.LOWERCASE,
  })
  .refine((v) => /[0-9]/.test(v), {
    message: VALIDATION_MESSAGES.PASSWORD.NUMBER,
  })
  .refine(
    (v) => /[!@#$%^&*()_+=[\]{}|;:,.<>?/~`\\-]/.test(v),
    {
      message: VALIDATION_MESSAGES.PASSWORD.SPECIAL,
    },
  );

/* ============================================================
   EMAIL VALIDATION
   ============================================================ */

const emailSchema = z
  .string({
    required_error: VALIDATION_MESSAGES.EMAIL.REQUIRED,
  })
  .email({
    message: VALIDATION_MESSAGES.EMAIL.INVALID,
  });

/* ============================================================
   CHANGE PASSWORD SCHEMA
   ============================================================

   The user can change password using either:

   1. Email ID
      → POST /api/v1/auth/change-password

   2. Employee Code
      → POST /api/v1/auth/change-password1

   The form uses one common field:

   identifier

   Its meaning is determined by:

   identifierType
   ============================================================ */

export const changePasswordSchema = z
  .object({
    /* ----------------------------------------------------------
       IDENTIFIER TYPE
       ---------------------------------------------------------- */

    identifierType: z.enum(['email', 'employeeCode']),

    /* ----------------------------------------------------------
       EMAIL OR EMPLOYEE CODE
       ---------------------------------------------------------- */

    identifier: z
      .string({
        required_error:
          'Email ID or Employee Code is required.',
      })
      .trim()
      .min(1, {
        message:
          'Email ID or Employee Code is required.',
      }),

    /* ----------------------------------------------------------
       PASSWORD
       ---------------------------------------------------------- */

    password: passwordSchema,

    /* ----------------------------------------------------------
       CONFIRM PASSWORD
       ---------------------------------------------------------- */

    confirmPassword: z.string({
      required_error:
        VALIDATION_MESSAGES.CONFIRM_PASSWORD.REQUIRED,
    }),
  })

  /* ==========================================================
     CONDITIONAL VALIDATION
     ========================================================== */

  .superRefine((data, ctx) => {
    /* ----------------------------------------------------------
       EMAIL VALIDATION
       ---------------------------------------------------------- */

    if (data.identifierType === 'email') {
      const result = emailSchema.safeParse(
        data.identifier,
      );

      if (!result.success) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['identifier'],
          message: VALIDATION_MESSAGES.EMAIL.INVALID,
        });
      }
    }

    /* ----------------------------------------------------------
       EMPLOYEE CODE VALIDATION
       ----------------------------------------------------------

       Employee code does not need email validation.

       We only make sure that the user has entered
       a non-empty employee code.
       ---------------------------------------------------------- */

    if (data.identifierType === 'employeeCode') {
      if (!data.identifier.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['identifier'],
          message: 'Employee Code is required.',
        });
      }
    }

    /* ----------------------------------------------------------
       PASSWORD MATCH VALIDATION
       ---------------------------------------------------------- */

    if (data.password !== data.confirmPassword) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['confirmPassword'],
        message:
          VALIDATION_MESSAGES.CONFIRM_PASSWORD.MISMATCH,
      });
    }
  });

/* ============================================================
   FORM TYPE
   ============================================================ */

export type ChangePasswordSchemaType = z.infer<
  typeof changePasswordSchema
>;

export default changePasswordSchema;