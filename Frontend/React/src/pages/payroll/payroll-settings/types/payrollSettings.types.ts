export interface PayrollSettings {
  id: number;
  company_logo: string | null;
  company_name: string;
  company_address: string | null;
  company_contact: string | null;

  basic_earning: number;
  hra: number;
  conveyance_allowance: number;
  provident_fund: number;
  esic: number;
  professional_tax: number;

  created_by: string | null;
  created_on: string | null;
  modified_by: string | null;
  modified_on: string | null;
}

export interface PayrollSettingsFormData {
  company_name: string;
  company_address: string;
  company_contact: string;
  company_logo: File | null;
}

export type PayrollSettingsPayload =
  PayrollSettingsFormData;