export type ProbationPeriodUnit =
  | "Days"
  | "Weeks"
  | "Months";

export type PageSize =
  | "A4"
  | "A3"
  | "A5"
  | "LETTER"
  | "LEGAL";

export interface OfferLetterFormData {
  offerLetterTitle: string;

  companyLogo: string | null;
companyLogoFile: File | null;
companyLogoRemoved: boolean;

  companyName: string;

  officeAddress: string;

  singaporeOsAddress: string;

  offerDate: string;

  candidateName: string;

  candidateAddress: string;

  candidateContactNo: string;

  candidateEmail: string;

  position: string;

  reportingManager: string;

  reportingManagerDesignation: string;

  joiningDate: string;

  probationPeriod: number;

  probationPeriodUnit: ProbationPeriodUnit;

  totalCtc: string;

  jobDuties: string;

  acceptanceText: string;

    hrSignatoryName: string;

  hrDesignation: string;

  signatureFileName: string | null;
  signatureFilePath: string | null;
  signatureFile: File | null;

  stampFileName: string | null;
  stampFilePath: string | null;
  stampFile: File | null;

  letterBodyTemplate: string;

  showCompanyLogo: boolean;

  showOfficeAddressFooter: boolean;

  showSingaporeAddress: boolean;

  showCandidateAcceptance: boolean;

  pageSize: PageSize;
}

export interface MergeField {
  key: string;
  label: string;
  token: string;
}

export interface OfferLetterPreviewProps {
  data: OfferLetterFormData;
}