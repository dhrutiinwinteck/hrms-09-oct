import { z } from "zod";
const MIN_REASON_LENGTH = 10;
const MAX_REASON_LENGTH = 500;
const MAX_COMMENT_LENGTH = 1000;
const MIN_NOTICE_DAYS = 0;
const MAX_NOTICE_DAYS = 180;
export const createResignationSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, "Reason is required.")
    .min(
      MIN_REASON_LENGTH,
      `Reason must be at least ${MIN_REASON_LENGTH} characters.`,
    )
    .max(
      MAX_REASON_LENGTH,
      `Reason cannot exceed ${MAX_REASON_LENGTH} characters.`,
    ),
  reasonType: z.string().min(1, "Resignation type is required."),
  fromDate: z
    .string()
    .min(1, "From date is required.")
    .refine(
      (value) => !Number.isNaN(new Date(value).getTime()),
      "Please enter a valid from date.",
    ),
  noticePeriod: z
    .number()
    .min(
      MIN_NOTICE_DAYS,
      `Notice period cannot be less than ${MIN_NOTICE_DAYS} days.`,
    )
    .max(
      MAX_NOTICE_DAYS,
      `Notice period cannot exceed ${MAX_NOTICE_DAYS} days.`,
    ),
  lastWorkingDate: z
    .string()
    .min(1, "Last working day is required.")
    .refine(
      (value) => !Number.isNaN(new Date(value).getTime()),
      "Please enter a valid last working date.",
    ),
  reportingManager: z.string().optional(),
  comments: z
    .string()
    .max(
      MAX_COMMENT_LENGTH,
      `Comments cannot exceed ${MAX_COMMENT_LENGTH} characters.`,
    )
    .optional(),
});
export const updateResignationSchema = createResignationSchema.partial();
export const approvalSchema = z.object({
  approverId: z.string().min(1),
  notes: z.string().optional(),
});
export const rejectionSchema = z.object({
  approverId: z.string().min(1),
  reason: z.string().min(1),
});
export const cancelSchema = z.object({ reason: z.string().optional() });
export type CreateResignationInput = z.infer<typeof createResignationSchema>;
export type UpdateResignationInput = z.infer<typeof updateResignationSchema>;
export type ApprovalInput = z.infer<typeof approvalSchema>;
export type RejectionInput = z.infer<typeof rejectionSchema>;
export type CancelInput = z.infer<typeof cancelSchema>;
