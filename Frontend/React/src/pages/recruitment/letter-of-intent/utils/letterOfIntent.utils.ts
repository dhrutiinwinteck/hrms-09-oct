// import type {
//   LetterOfIntentFormData,
//   LetterOfIntentSettings,
//   LetterOfIntentSettingsUpdate,
// } from "../types/letterOfIntent.types";

// export const toDateInputValue = (
//   value: string | null | undefined,
// ): string => {
//   if (!value) {
//     return "";
//   }

//   return value.slice(0, 10);
// };

// export const formatDisplayDate = (
//   value: string | null | undefined,
// ): string => {
//   if (!value) {
//     return "Date not configured";
//   }

//   const date = new Date(`${value.slice(0, 10)}T00:00:00`);

//   if (Number.isNaN(date.getTime())) {
//     return value;
//   }

//   return date.toLocaleDateString("en-IN", {
//     day: "numeric",
//     month: "long",
//     year: "numeric",
//   });
// };

// export const mapSettingsToForm = (
//   settings: LetterOfIntentSettings,
// ): LetterOfIntentFormData => ({
//   letter_title:
//     settings.letter_title ?? "",

//   company_logo:
//     settings.company_logo ?? null,

//     stamp_image_path:
//   settings.stamp_image_path ?? null,

//   company_name:
//     settings.company_name ?? "",

//   registered_office_address:
//     settings.registered_office_address ?? "",

//   letter_date:
//     toDateInputValue(settings.letter_date),

//   position_role:
//     settings.position_role ?? "",

//   joining_date:
//     toDateInputValue(settings.joining_date),

//   shift_timing:
//     settings.shift_timing ?? "",

//   probation_period_months:
//     settings.probation_period_months ?? 0,

//   hr_signatory_name:
//     settings.hr_signatory_name ?? "",

//   hr_designation:
//     settings.hr_designation ?? "",

//   reference_contact:
//     settings.reference_contact ?? "",

//   letter_body:
//     settings.letter_body ?? "",

//   show_company_logo:
//     settings.show_company_logo,

//   show_registered_office_footer:
//     settings.show_registered_office_footer,

//   show_acceptance_instruction:
//     settings.show_acceptance_instruction,

//   show_hr_signature_section:
//     settings.show_hr_signature_section,

//   page_size:
//     settings.page_size,

//   template_status:
//     settings.template_status,
// });

// export const createSettingsPayload = (
//   form: LetterOfIntentFormData,
// ): LetterOfIntentSettingsUpdate => ({
//   letter_title: form.letter_title.trim(),

//   company_logo: form.company_logo,

//   stamp_image_path: form.stamp_image_path,

//   company_name: form.company_name.trim(),

//   registered_office_address:
//     form.registered_office_address.trim(),

//   letter_date:
//     form.letter_date || null,

//   position_role:
//     form.position_role.trim() || null,

//   joining_date:
//     form.joining_date || null,

//   shift_timing:
//     form.shift_timing.trim() || null,

//   probation_period_months:
//     Number(form.probation_period_months),

//   hr_signatory_name:
//     form.hr_signatory_name.trim() || null,

//   hr_designation:
//     form.hr_designation.trim() || null,

//   reference_contact:
//     form.reference_contact.trim() || null,

//   letter_body:
//     form.letter_body,

//   show_company_logo:
//     form.show_company_logo,

//   show_registered_office_footer:
//     form.show_registered_office_footer,

//   show_acceptance_instruction:
//     form.show_acceptance_instruction,

//   show_hr_signature_section:
//     form.show_hr_signature_section,

//   page_size:
//     form.page_size,

//   template_status:
//     form.template_status,
// });

// export const insertMergeField = (
//   value: string,
//   field: string,
// ): string => {
//   const normalizedField = field.startsWith("{{")
//     ? field
//     : `{{${field}}}`;

//   return `${value}${normalizedField}`;
// };

// export const replaceMergeFieldsForPreview = (
//   body: string,
//   form: LetterOfIntentFormData,
// ): string => {
//   const values: Record<string, string> = {
//     CandidateName: "John Doe",
//     CandidateAddress:
//       "123, Sample Address, Thane, Maharashtra",
//     CandidateContactNo: "9876543210",
//     CandidateEmail: "john.doe@example.com",
//     Position:
//       form.position_role || "IT Helpdesk Executive",
//     JoiningDate:
//       formatDisplayDate(form.joining_date),
//     ShiftTiming:
//       form.shift_timing || "01.00 P.M. to 10.00 P.M.",
//     ProbationPeriod:
//       String(form.probation_period_months || 3),
//     CompanyName:
//       form.company_name || "Inwinteck Pvt Ltd",
//     CompanyAddress:
//       form.registered_office_address || "",
//     HRName:
//       form.hr_signatory_name || "Shravani Chavan",
//     HRDesignation:
//       form.hr_designation ||
//       "Human Resource Executive",
//     ReferenceContact:
//       form.reference_contact || "HR Department",
//   };

//   return Object.entries(values).reduce(
//     (result, [key, value]) =>
//       result.replace(
//         new RegExp(
//           `\\{\\{${key}\\}\\}`,
//           "g",
//         ),
//         value,
//       ),
//     body,
//   );
// };

// export const escapeHtml = (
//   value: string,
// ): string =>
//   value
//     .replace(/&/g, "&amp;")
//     .replace(/</g, "&lt;")
//     .replace(/>/g, "&gt;")
//     .replace(/"/g, "&quot;")
//     .replace(/'/g, "&#039;");

// export const bodyToPreviewHtml = (
//   body: string,
//   form: LetterOfIntentFormData,
// ): string => {
//   const replaced =
//     replaceMergeFieldsForPreview(
//       body,
//       form,
//     );

//   return replaced
//     .split("\n\n")
//     .map((paragraph) => {
//       const html = escapeHtml(paragraph)
//         .replace(/\n/g, "<br />");

//       return `<p>${html}</p>`;
//     })
//     .join("");
// };




import type {
  LetterOfIntentFormData,
  LetterOfIntentSettings,
  LetterOfIntentSettingsUpdate,
} from "../types/letterOfIntent.types";

export const toDateInputValue = (
  value: string | null | undefined,
): string => {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
};

export const formatDisplayDate = (
  value: string | null | undefined,
): string => {
  if (!value) {
    return "Date not configured";
  }

  const date = new Date(
    `${value.slice(0, 10)}T00:00:00`,
  );

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const mapSettingsToForm = (
  settings: LetterOfIntentSettings,
): LetterOfIntentFormData => ({
  letter_title:
    settings.letter_title ?? "",

  company_logo:
    settings.company_logo ?? null,

  stamp_image_path:
    settings.stamp_image_path ?? null,

  signature_image_path:
    settings.signature_image_path ?? null,

  company_name:
    settings.company_name ?? "",

  registered_office_address:
    settings.registered_office_address ?? "",

  letter_date:
    toDateInputValue(settings.letter_date),

  position_role:
    settings.position_role ?? "",

  joining_date:
    toDateInputValue(settings.joining_date),

  shift_timing:
    settings.shift_timing ?? "",

  probation_period_months:
    settings.probation_period_months ?? 0,

  hr_signatory_name:
    settings.hr_signatory_name ?? "",

  hr_designation:
    settings.hr_designation ?? "",

  reference_contact:
    settings.reference_contact ?? "",

  letter_body:
    settings.letter_body ?? "",

  show_company_logo:
    settings.show_company_logo,

  show_registered_office_footer:
    settings.show_registered_office_footer,

  show_acceptance_instruction:
    settings.show_acceptance_instruction,

  show_hr_signature_section:
    settings.show_hr_signature_section,

  page_size:
    settings.page_size,

  template_status:
    settings.template_status,
});

export const createSettingsPayload = (
  form: LetterOfIntentFormData,
): LetterOfIntentSettingsUpdate => ({
  letter_title:
    form.letter_title.trim(),

  company_logo:
    form.company_logo,

  stamp_image_path:
    form.stamp_image_path,

  signature_image_path:
    form.signature_image_path,

  company_name:
    form.company_name.trim(),

  registered_office_address:
    form.registered_office_address.trim(),

  letter_date:
    form.letter_date || null,

  position_role:
    form.position_role.trim() || null,

  joining_date:
    form.joining_date || null,

  shift_timing:
    form.shift_timing.trim() || null,

  probation_period_months:
    Number(form.probation_period_months),

  hr_signatory_name:
    form.hr_signatory_name.trim() || null,

  hr_designation:
    form.hr_designation.trim() || null,

  reference_contact:
    form.reference_contact.trim() || null,

  letter_body:
    form.letter_body,

  show_company_logo:
    form.show_company_logo,

  show_registered_office_footer:
    form.show_registered_office_footer,

  show_acceptance_instruction:
    form.show_acceptance_instruction,

  show_hr_signature_section:
    form.show_hr_signature_section,

  page_size:
    form.page_size,

  template_status:
    form.template_status,
});

export const insertMergeField = (
  value: string,
  field: string,
): string => {
  const normalizedField =
    field.startsWith("{{")
      ? field
      : `{{${field}}}`;

  return `${value}${normalizedField}`;
};

export const replaceMergeFieldsForPreview = (
  body: string,
  form: LetterOfIntentFormData,
): string => {
  const values: Record<string, string> = {
    CandidateName: "John Doe",

    CandidateAddress:
      "123, Sample Address, Thane, Maharashtra",

    CandidateContactNo:
      "9876543210",

    CandidateEmail:
      "john.doe@example.com",

    Position:
      form.position_role ||
      "IT Helpdesk Executive",

    JoiningDate:
      formatDisplayDate(
        form.joining_date,
      ),

    ShiftTiming:
      form.shift_timing ||
      "01.00 P.M. to 10.00 P.M.",

    ProbationPeriod:
      String(
        form.probation_period_months || 3,
      ),

    CompanyName:
      form.company_name ||
      "Inwinteck Pvt Ltd",

    CompanyAddress:
      form.registered_office_address ||
      "",

    HRName:
      form.hr_signatory_name ||
      "Shravani Chavan",

    HRDesignation:
      form.hr_designation ||
      "Human Resource Executive",

    ReferenceContact:
      form.reference_contact ||
      "HR Department",
  };

  return Object.entries(values).reduce(
    (result, [key, value]) =>
      result.replace(
        new RegExp(
          `\\{\\{${key}\\}\\}`,
          "g",
        ),
        value,
      ),
    body,
  );
};

export const escapeHtml = (
  value: string,
): string =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(
      /'/g,
      "&#039;",
    );

export const bodyToPreviewHtml = (
  body: string,
  form: LetterOfIntentFormData,
): string => {
  const replaced =
    replaceMergeFieldsForPreview(
      body,
      form,
    );

  return replaced
    .split("\n\n")
    .map((paragraph) => {
      const html =
        escapeHtml(paragraph)
          .replace(
            /\n/g,
            "<br />",
          );

      return `<p>${html}</p>`;
    })
    .join("");
};