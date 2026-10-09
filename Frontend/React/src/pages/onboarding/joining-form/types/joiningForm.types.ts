// ============================================================
// BASIC INFORMATION
// ============================================================

export interface BasicInformationData {
  first_name?: string;
  last_name?: string;

  email?: string;
  phone?: string;
  alternatePhone?: string;

  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;

  maritalStatus?: string;
  marriage_date?: string;

  dateOfJoining?: string;
  position?: string;
}


// ============================================================
// PERSONAL DETAILS
// ============================================================

export interface PersonalDetailsData {
  fatherName?: string;
  motherName?: string;

  nationality?: string;
  religion?: string;

  aadhaarNumber?: string;
  panNumber?: string;

  uanNumber?: string;
  passportNumber?: string;

  permanentAddress?: string;
  currentAddress?: string;

  sameAsPermanent?: boolean;
}


// ============================================================
// WORK EXPERIENCE
// ============================================================

export interface WorkExperienceData {
  id?: string;

  // Company details
  organizationName?: string;
  designation?: string;

  company_location?: string;
  company_country?: string;
  // company_address?: string;

  project?: string;

  // Employment details
  employmentType?: string;
  emp_type?: string;

  contract_period?: string;
  notice_period?: string;

  // Company document
  company_file?: File | null;

  // Dates
  fromDate?: string;
  toDate?: string;

  // Additional fields
  totalExperience?: string;
  reasonForLeaving?: string;
  keyResponsibilities?: string;

  isFresher?: boolean;
}


// ============================================================
// EDUCATION
// ============================================================

export interface EducationData {
  id?: string;

  qualification?: string;
  specialization?: string;

  institute?: string;
  board?: string;

  passingYear?: string;
  percentage?: string;

  isCurrentlyPursuing?: boolean;
}


// ============================================================
// UPLOADED DOCUMENT
// ============================================================

export interface UploadedDocument {
  key: string;

  fileName: string;
  fileSize?: number;
  fileType?: string;

  dataUrl?: string;
}


// ============================================================
// REFERENCE
// ============================================================

export interface ReferenceData {
  id?: string;

  fullName?: string;
  designation?: string;
  company?: string;

  email?: string;
  phone?: string;

  relationship?: string;
  mayContact?: boolean;
}


// ============================================================
// EMERGENCY CONTACT
// ============================================================

export interface EmergencyContactData {
  id?: string;

  fullName: string;
  relationship: string;

  phoneNumber: string;
  emailAddress: string;
  address: string;

  contactOrder: number;
}


// ============================================================
// JOINING FORM DATA
// ============================================================

export interface JoiningFormData {
  basicInformation: BasicInformationData;

  personalDetails: PersonalDetailsData;

  workExperience: WorkExperienceData[];

  education: EducationData[];

  documents: Record<string, File | null>;

  references: ReferenceData[];

  emergencyContacts: EmergencyContactData[];

  status?: string;

  applicationDate?: string;
  createdAt?: string;
  updatedAt?: string;
}