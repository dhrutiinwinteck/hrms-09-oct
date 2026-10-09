export interface FamilyMember {
  name: string;
  relationship: string;
  dateOfBirth: string;
  occupation: string;
  phone: string;
}

export interface EducationRecord {
  degree: string;
  institution: string;
  yearOfPassing: string;
  percentage: string;
}

export interface ExperienceRecord {
  company: string;
  designation: string;
  from: string;
  to: string;
  totalExperience: string;
}

export interface ProfileField {
  label: string;
  value: string;
}

export interface ProfileSummaryItem {
  label: string;
  value: string;
  icon: string;
}

export interface ProfileData {
  name: string;
  initials: string;
  photo: string | null;
  designation: string;
  employeeId: string;
  dateOfJoining: string;
  workLocation: string;
  status: string;

  summary: ProfileSummaryItem[];

  personalInformation: ProfileField[];

  emergencyContact: ProfileField[];

  workInformation: ProfileField[];

  bankInformation: ProfileField[];

  salaryInformation: ProfileField[];

  familyInformation: FamilyMember[];

  educationInformation: EducationRecord[];

  experienceInformation: ExperienceRecord[];
}
/* ================================
   EMPLOYEE PROFILE API
================================ */

export interface EmployeeProfileApi {
  id?: number | null;
  emp_id?: number | null;
  full_name?: string | null;
  photo?: string | null;
  designation?: string | null;
  emp_code?: string | null;
  doj?: string | null;
  company_location?: string | null;
  emp_type?: string | null;
  email?: string | null;
  phone?: string | null;
  department?: string | null;
  reporting_manager?: string | null;
  gender?: string | null;
  personal_email?: string | null;
  notice_period?: number | null;
}

/* ================================
   PERSONAL DETAILS API
================================ */

export interface EmployeePersonalDetailsApi {
  id?: number;
  emp_id?: number;
  passport_no?: string | null;
  passport_file?: string | null;
  aadhar_no?: string | null;
  aadhar_file_front?: string | null;
  aadhar_file_back?: string | null;
  date_of_birth?: string | null;
  email?: string | null;
  phone?: string | null;
  current_address?: string | null;
  permanent_address?: string | null;
  marital_status?: number | string | null;
  marriage_date?: string | null;
  pan_no?: string | null;
  pan_file?: string | null;
  createdby?: string | null;
  createdon?: string | null;
  modifiedby?: string | null;
  modifiedon?: string | null;
}

/* ================================
   EDUCATION API
================================ */

export interface EmployeeEducationApi {
  id?: number;
  emp_id?: number;
  name_school_university?: string | null;
  location_school_uni?: string | null;
  degree_subject?: string | null;
  year_of_passing?: string | null;
  marks_obtained?: string | null;
  certificates?: string | null;
  createdby?: string | null;
  createdon?: string | null;
  modifiedby?: string | null;
  modifiedon?: string | null;
}

/* ================================
   BANK API
================================ */

export interface EmployeeBankApi {
  id?: number;
  emp_id?: number;
  bank_name?: string | null;
  account_no?: string | null;
  ifsc_code?: string | null;
  createdby?: string | null;
  createdon?: string | null;
  modifiedby?: string | null;
  modifiedon?: string | null;
}

/* ================================
   EMERGENCY CONTACT API
================================ */

export interface EmployeeEmergencyContactApi {
  id?: number;
  emp_id?: number;
  p_name?: string | null;
  p_relationship?: string | null;
  p_phone?: string | null;
  p_alt_phone?: string | null;
  s_name?: string | null;
  s_relationship?: string | null;
  s_phone?: string | null;
  s_alt_phone?: string | null;
  createdby?: string | null;
  createdon?: string | null;
  modifiedby?: string | null;
  modifiedon?: string | null;
}

/* ================================
   EXPERIENCE API
================================ */

export interface EmployeeExperienceApi {
  id?: number;
  emp_id?: number;
  company_name?: string | null;
  company_address?: string | null;
  exp_year_from?: string | null;
  exp_year_to?: string | null;
  designation?: string | null;
  company_file?: string | null;
  createdby?: string | null;
  createdon?: string | null;
  modifiedby?: string | null;
  modifiedon?: string | null;
}

// =================================
// EMPLOYEE FAMILY INFORMATION API
// =================================

export interface EmployeeFamilyInfoApi {
  id?: number;
  emp_id?: number;
  name?: string | null;
  relationship?: string | null;
  dob?: string | null;
  phone?: string | null;
  createdby?: string | null;
  createdon?: string | null;
  modifiedby?: string | null;
  modifiedon?: string | null;
}

// =================================
// EMPLOYEE SALARY API
// =================================

export interface EmployeeSalaryApi {
  id?: number;
  emp_id?: number;
  salary?: string | number | null;
  mode_pay?: number | null;
  uan?: string | null;
  esic?: string | null;
  createdby?: string | null;
  createdon?: string | null;
  modifiedby?: string | null;
  modifiedon?: string | null;
}

export interface EmployeeSalaryUpdate {
  salary: number | null;
  mode_pay: string | null;
  uan: string | null;
  esic: string | null;
}

export interface EmployeeBankUpdate {
  bank_name: string | null;
  account_no: string | null;
  ifsc_code: string | null;
}