export interface IBasicInformation {
  fullName: string;
  email: string;
  phoneNumber: string;
  alternativePhone?: string | null;
  positionApplied: string;
  dateOfApplication: string;
  resume?: string | null;
}

export interface IPersonalDetails {
  dateOfBirth: string;
  maritalStatus: string;
  gender: string;
  nationality: string;
  aadharNumber?: string | null;
  panNumber?: string | null;
  currentAddress: string;
  permanentAddress: string;
}

export interface IEmergencyContact {
  fullName: string;
  relationship: string;
  phoneNumber: string;
  emailAddress?: string | null;
  address: string;
}

export interface IEmergencyContacts {
  contact1: IEmergencyContact;
  contact2?: IEmergencyContact | null;
}

export interface IWorkExperience {
  companyName: string;
  jobTitle: string;
  employeeType: string;
  fromDate: string;
  toDate?: string | null;
  currentlyWorking: boolean;
  keyResponsibilities: string;
}

export interface IWorkExperiences {
  isFresher: boolean;
  experiences: IWorkExperience[];
}

export interface IEducation {
  qualification: string;
  specification: string;
  institute: string;
  passingYear: string;
  percentageCgpa: string;
  currentlyPursuing: boolean;
}

export interface IEducations {
  educations: IEducation[];
}

export interface IReference {
  fullName: string;
  designation: string;
  companyOrganization: string;
  emailAddress: string;
  phoneNumber: string;
  relationship: string;
  mayWeContact: boolean;
}

export interface IReferences {
  reference1: IReference;
  reference2?: IReference | null;
}

export interface IJobApplication {
  id?: string;
  applicationDate: string;
  status: 'Draft' | 'Submitted' | 'InReview' | 'Shortlisted' | 'Rejected' | 'Hired';
  basicInformation: IBasicInformation;
  personalDetails: IPersonalDetails;
  emergencyContacts: IEmergencyContacts;
  workExperiences: IWorkExperiences;
  educations: IEducations;
  references: IReferences;
  createdAt: string;
  updatedAt: string;
}

export interface IApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}
 


export interface IDesignation {
  id: number;
  name: string;
  depart_id: number;
  department_name: string;
}