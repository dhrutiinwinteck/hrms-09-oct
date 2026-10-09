// export interface LetterOfIntentSettings {
//   id: number;
//   setting_key: string;

//   letter_title: string;
//   company_logo: string | null;
//   stamp_image_path: string | null;

//   company_name: string;
//   registered_office_address: string;

//   letter_date: string | null;
//   position_role: string | null;
//   joining_date: string | null;

//   shift_timing: string | null;
//   probation_period_months: number;

//   hr_signatory_name: string | null;
//   hr_designation: string | null;
//   reference_contact: string | null;

//   letter_body: string;

//   show_company_logo: boolean;
//   show_registered_office_footer: boolean;
//   show_acceptance_instruction: boolean;
//   show_hr_signature_section: boolean;

//   page_size: "A4" | "LETTER";
//   template_status: "Active" | "Inactive";

//   created_at: string;
//   updated_at: string;

//   created_by: string | null;
//   updated_by: string | null;
// }

// export interface LetterOfIntentSettingsUpdate {
//   letter_title?: string | null;
//   company_logo?: string | null;
//   stamp_image_path?: string | null;

//   company_name?: string | null;
//   registered_office_address?: string | null;

//   letter_date?: string | null;
//   position_role?: string | null;
//   joining_date?: string | null;

//   shift_timing?: string | null;
//   probation_period_months?: number | null;

//   hr_signatory_name?: string | null;
//   hr_designation?: string | null;
//   reference_contact?: string | null;

//   letter_body?: string | null;

//   show_company_logo?: boolean | null;
//   show_registered_office_footer?: boolean | null;
//   show_acceptance_instruction?: boolean | null;
//   show_hr_signature_section?: boolean | null;

//   page_size?: "A4" | "LETTER" | null;
//   template_status?: "Active" | "Inactive" | null;
// }

// export interface LetterOfIntentFormData {
//   letter_title: string;
//   company_logo: string | null;
//   stamp_image_path: string | null;

//   company_name: string;
//   registered_office_address: string;

//   letter_date: string;
//   position_role: string;
//   joining_date: string;

//   shift_timing: string;
//   probation_period_months: number;

//   hr_signatory_name: string;
//   hr_designation: string;
//   reference_contact: string;

//   letter_body: string;

//   show_company_logo: boolean;
//   show_registered_office_footer: boolean;
//   show_acceptance_instruction: boolean;
//   show_hr_signature_section: boolean;

//   page_size: "A4" | "LETTER";
//   template_status: "Active" | "Inactive";
// }


export interface LetterOfIntentSettings {
  id: number;
  setting_key: string;

  letter_title: string;

  company_logo: string | null;
  stamp_image_path: string | null;
  signature_image_path: string | null;

  company_name: string;
  registered_office_address: string;

  letter_date: string | null;
  position_role: string | null;
  joining_date: string | null;

  shift_timing: string | null;
  probation_period_months: number;

  hr_signatory_name: string | null;
  hr_designation: string | null;
  reference_contact: string | null;

  letter_body: string;

  show_company_logo: boolean;
  show_registered_office_footer: boolean;
  show_acceptance_instruction: boolean;
  show_hr_signature_section: boolean;

  page_size: "A4" | "LETTER";
  template_status: "Active" | "Inactive";

  created_at: string;
  updated_at: string;

  created_by: string | null;
  updated_by: string | null;
}

export interface LetterOfIntentSettingsUpdate {
  letter_title?: string | null;

  company_logo?: string | null;
  stamp_image_path?: string | null;
  signature_image_path?: string | null;

  company_name?: string | null;
  registered_office_address?: string | null;

  letter_date?: string | null;
  position_role?: string | null;
  joining_date?: string | null;

  shift_timing?: string | null;
  probation_period_months?: number | null;

  hr_signatory_name?: string | null;
  hr_designation?: string | null;
  reference_contact?: string | null;

  letter_body?: string | null;

  show_company_logo?: boolean | null;
  show_registered_office_footer?: boolean | null;
  show_acceptance_instruction?: boolean | null;
  show_hr_signature_section?: boolean | null;

  page_size?: "A4" | "LETTER" | null;
  template_status?: "Active" | "Inactive" | null;
}

export interface LetterOfIntentFormData {
  letter_title: string;

  company_logo: string | null;
  stamp_image_path: string | null;
  signature_image_path: string | null;

  company_name: string;
  registered_office_address: string;

  letter_date: string;
  position_role: string;
  joining_date: string;

  shift_timing: string;
  probation_period_months: number;

  hr_signatory_name: string;
  hr_designation: string;
  reference_contact: string;

  letter_body: string;

  show_company_logo: boolean;
  show_registered_office_footer: boolean;
  show_acceptance_instruction: boolean;
  show_hr_signature_section: boolean;

  page_size: "A4" | "LETTER";
  template_status: "Active" | "Inactive";
}