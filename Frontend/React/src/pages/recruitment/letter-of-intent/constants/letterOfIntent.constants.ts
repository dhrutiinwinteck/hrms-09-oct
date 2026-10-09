// import type { LetterOfIntentFormData } from "../types/letterOfIntent.types";

// export const LETTER_OF_INTENT_MERGE_FIELDS = [
//   "{{CandidateName}}",
//   "{{CandidateAddress}}",
//   "{{CandidateContactNo}}",
//   "{{CandidateEmail}}",
//   "{{Position}}",
//   "{{JoiningDate}}",
//   "{{ShiftTiming}}",
//   "{{ProbationPeriod}}",
//   "{{CompanyName}}",
//   "{{CompanyAddress}}",
//   "{{HRName}}",
//   "{{HRDesignation}}",
//   "{{ReferenceContact}}",
// ] as const;

// export const DEFAULT_LETTER_BODY = `Dear {{CandidateName}},

// This letter represents confirmation of the intent to employ {{CandidateName}} as an {{Position}} made by {{HRName}}, {{HRDesignation}}, of {{CompanyName}} and to confirm the broad terms of our discussions.

// Terms & Conditions:

// • The candidate's work shall be considered full-time.
// • It is the intention of the Company to begin employment no later than {{JoiningDate}}.
// • Shift: {{ShiftTiming}} (Company can change the shift timing as required with Rotation Off).
// • Your employment will be confirmed after the successful completion of the probation period of {{ProbationPeriod}} Months.

// In case the above terms and conditions of service are acceptable to you, please acknowledge and return the copy of the offer in token of your acceptance of the same.

// For any clarification, please contact the {{ReferenceContact}}.

// Sincerely,

// Authorized Signatory
// {{HRDesignation}}`;

// export const DEFAULT_LETTER_OF_INTENT_FORM: LetterOfIntentFormData = {
//   letter_title: "Letter of Intent to Hire",

//   company_logo: null,

//   stamp_image_path: null,

//   company_name: "Inwinteck Pvt Ltd",

//   registered_office_address:
//     "(REGD. OFFICE) Inwinteck Pvt Ltd - 10/34, Vijay Garden, Off G.B. Road, Thane(W) - 400615",

//   letter_date: "",

//   position_role: "IT Helpdesk Executive",

//   joining_date: "",

//   shift_timing:
//     "01.00 P.M. to 10.00 P.M. (Rotation Off)",

//   probation_period_months: 3,

//   hr_signatory_name: "Shravani Chavan",

//   hr_designation: "Human Resource Executive",

//   reference_contact: "HR Department",

//   letter_body: DEFAULT_LETTER_BODY,

//   show_company_logo: true,

//   show_registered_office_footer: true,

//   show_acceptance_instruction: true,

//   show_hr_signature_section: true,

//   page_size: "A4",

//   template_status: "Active",
// };

// export const MAX_LOGO_SIZE_BYTES =
//   2 * 1024 * 1024;

// export const ALLOWED_LOGO_TYPES = [
//   "image/jpeg",
//   "image/png",
//   "image/webp",
// ] as const;

// export const MAX_STAMP_SIZE_BYTES =
//   2 * 1024 * 1024;

// export const ALLOWED_STAMP_TYPES = [
//   "image/jpeg",
//   "image/png",
//   "image/webp",
// ] as const;


import type {
  LetterOfIntentFormData,
} from "../types/letterOfIntent.types";

export const LETTER_OF_INTENT_MERGE_FIELDS = [
  "{{CandidateName}}",
  "{{CandidateAddress}}",
  "{{CandidateContactNo}}",
  "{{CandidateEmail}}",
  "{{Position}}",
  "{{JoiningDate}}",
  "{{ShiftTiming}}",
  "{{ProbationPeriod}}",
  "{{CompanyName}}",
  "{{CompanyAddress}}",
  "{{HRName}}",
  "{{HRDesignation}}",
  "{{ReferenceContact}}",
] as const;

export const DEFAULT_LETTER_BODY = `Dear {{CandidateName}},

This letter represents confirmation of the intent to employ {{CandidateName}} as an {{Position}} made by {{HRName}}, {{HRDesignation}}, of {{CompanyName}} and to confirm the broad terms of our discussions.

Terms & Conditions:

• The candidate's work shall be considered full-time.
• It is the intention of the Company to begin employment no later than {{JoiningDate}}.
• Shift: {{ShiftTiming}} (Company can change the shift timing as required with Rotation Off).
• Your employment will be confirmed after the successful completion of the probation period of {{ProbationPeriod}} Months.

In case the above terms and conditions of service are acceptable to you, please acknowledge and return the copy of the offer in token of your acceptance of the same.

For any clarification, please contact the {{ReferenceContact}}.`;

export const DEFAULT_LETTER_OF_INTENT_FORM: LetterOfIntentFormData = {
  letter_title: "Letter of Intent to Hire",

  company_logo: null,

  stamp_image_path: null,

  signature_image_path: null,

  company_name: "Inwinteck Pvt Ltd",

  registered_office_address:
    "(REGD. OFFICE) Inwinteck Pvt Ltd - 10/34, Vijay Garden, Off G.B. Road, Thane(W) - 400615",

  letter_date: "",

  position_role: "IT Helpdesk Executive",

  joining_date: "",

  shift_timing:
    "01.00 P.M. to 10.00 P.M. (Rotation Off)",

  probation_period_months: 3,

  hr_signatory_name: "Shravani Chavan",

  hr_designation: "Human Resource Executive",

  reference_contact: "HR Department",

  letter_body: DEFAULT_LETTER_BODY,

  show_company_logo: true,

  show_registered_office_footer: true,

  show_acceptance_instruction: true,

  show_hr_signature_section: true,

  page_size: "A4",

  template_status: "Active",
};

export const MAX_LOGO_SIZE_BYTES =
  2 * 1024 * 1024;

export const ALLOWED_LOGO_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_STAMP_SIZE_BYTES =
  2 * 1024 * 1024;

export const ALLOWED_STAMP_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export const MAX_SIGNATURE_SIZE_BYTES =
  2 * 1024 * 1024;

export const ALLOWED_SIGNATURE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;