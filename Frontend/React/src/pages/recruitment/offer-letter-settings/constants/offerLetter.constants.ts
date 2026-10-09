import type {
  MergeField,
  OfferLetterFormData,
} from "../types/offerLetter.types";


export const OFFER_LETTER_MERGE_FIELDS: MergeField[] = [
  {
    key: "candidateName",
    label: "Candidate Name",
    token: "{{CandidateName}}",
  },
  {
    key: "candidateAddress",
    label: "Candidate Address",
    token: "{{CandidateAddress}}",
  },
  {
    key: "candidateContactNo",
    label: "Candidate Contact No.",
    token: "{{CandidateContactNo}}",
  },
  {
    key: "candidateEmail",
    label: "Candidate Email",
    token: "{{CandidateEmail}}",
  },
  {
    key: "position",
    label: "Position",
    token: "{{Position}}",
  },
  {
    key: "managerName",
    label: "Manager Name",
    token: "{{ManagerName}}",
  },
  {
    key: "joiningDate",
    label: "Joining Date",
    token: "{{JoiningDate}}",
  },
  {
    key: "interviewDate",
    label: "Interview Date",
    token: "{{InterviewDate}}",
  },
  {
    key: "probationPeriod",
    label: "Probation Period",
    token: "{{ProbationPeriod}}",
  },
  {
    key: "ctc",
    label: "CTC",
    token: "{{CTC}}",
  },
];


export const DEFAULT_OFFER_LETTER: OfferLetterFormData = {
  offerLetterTitle: "Offer Letter",

  companyLogo: null,

  companyLogoFile: null,

  companyLogoRemoved: false,

  companyName: "inwinteck",

  officeAddress:
    "412, 4th floor, Omega Business Park,\nWagle Estate, Thane (W) 400604",

  singaporeOsAddress:
    "Inwinteck Pte Ltd - 23 Kallang Lane,\n#04-01 Kim Hoe Centre, Singapore – 208642",

  offerDate: "2026-04-17",

  candidateName: "{{CandidateName}}",

  candidateAddress: "{{CandidateAddress}}",

  candidateContactNo: "{{CandidateContactNo}}",

  candidateEmail: "{{CandidateEmail}}",

  position: "IT Helpdesk & Vendor Management",

  reportingManager: "Uma",

  reportingManagerDesignation: "Quality Manager",

  joiningDate: "{{JoiningDate}}",

  probationPeriod: 3,

  probationPeriodUnit: "Months",

  totalCtc: "{{CTC}}",

  jobDuties:
    "As outlined in the email separately.",

  acceptanceText:
    "I hereby received and accepted the offer",

  hrSignatoryName:
    "Shravani Chavan",

  hrDesignation:
    "Human Resources",

  signatureFileName: null,

  signatureFilePath: null,

  signatureFile: null,

  stampFileName: null,

  stampFilePath: null,

  stampFile: null,

  letterBodyTemplate:
    "Refer to your interview dated {{InterviewDate}} we believe your skills and experience are an excellent match for our company. Hence, we are pleased to offer you the position of {{Position}} with us. You will be reporting directly to {{ManagerName}}.\n\nYou are requested to report on duty on or before {{JoiningDate}}.\n\nIn this role, you will be required to perform relevant job duties and responsibilities as outlined in the email separately.\n\nYou will initially be on a probation period of {{ProbationPeriod}}.\n\nYour employment will be confirmed after the successful completion of the probation period and other terms of employment may be applicable thereafter as stated in the appointment letter. If your performance is not satisfactory, the company may extend the probation period or may terminate your employment with or without notice.\n\nWe are pleased to offer {{CTC}} p.a. as the total CTC.\n\nPlease confirm your acceptance of this offer by signing and returning this letter.",

  showCompanyLogo: true,

  showOfficeAddressFooter: true,

  showSingaporeAddress: true,

  showCandidateAcceptance: true,

  pageSize: "A4",
};