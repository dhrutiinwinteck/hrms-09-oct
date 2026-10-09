/*
|--------------------------------------------------------------------------
| JOINING FORM CONSTANTS
|--------------------------------------------------------------------------
*/

/*
|--------------------------------------------------------------------------
| OPTION TYPE
|--------------------------------------------------------------------------
*/

export interface JoiningFormOption {
  value: string;
  label: string;
}

/*
|--------------------------------------------------------------------------
| GENDER OPTIONS
|--------------------------------------------------------------------------
*/

export const GENDER_OPTIONS: JoiningFormOption[] = [
  {
    value: 'Male',
    label: 'Male',
  },
  {
    value: 'Female',
    label: 'Female',
  },
  {
    value: 'Other',
    label: 'Other',
  },
];

/*
|--------------------------------------------------------------------------
| BLOOD GROUP OPTIONS
|--------------------------------------------------------------------------
*/

export const BLOOD_GROUP_OPTIONS: JoiningFormOption[] = [
  {
    value: 'A+',
    label: 'A+',
  },
  {
    value: 'A-',
    label: 'A-',
  },
  {
    value: 'B+',
    label: 'B+',
  },
  {
    value: 'B-',
    label: 'B-',
  },
  {
    value: 'AB+',
    label: 'AB+',
  },
  {
    value: 'AB-',
    label: 'AB-',
  },
  {
    value: 'O+',
    label: 'O+',
  },
  {
    value: 'O-',
    label: 'O-',
  },
];

/*
|--------------------------------------------------------------------------
| MARITAL STATUS OPTIONS
|--------------------------------------------------------------------------
*/

export const MARITAL_STATUS_OPTIONS: JoiningFormOption[] = [
  {
    value: 'Single',
    label: 'Single',
  },
  {
    value: 'Unmarried',
    label: 'Unmarried',
  },
  {
    value: 'Married',
    label: 'Married',
  },
  {
    value: 'Divorced',
    label: 'Divorced',
  },
  {
    value: 'Widowed',
    label: 'Widowed',
  },
  {
    value: 'Separated',
    label: 'Separated',
  },
];

/*
|--------------------------------------------------------------------------
| DOCUMENT TYPES
|--------------------------------------------------------------------------
*/

export interface DocumentType {
  key: string;
  label: string;
  required: boolean;
}

export const DOCUMENT_TYPES: DocumentType[] = [
  {
    key: 'relievingLetter',
    label: 'Relieving / Experience Letter',
    required: false,
  },
  {
    key: 'offerLetter',
    label: 'Offer Letter',
    required: false,
  },
  {
    key: 'salarySlips',
    label: 'Last 3 Months Salary Slips / Bank Statement',
    required: false,
  },
  {
    key: 'educationalCertificates',
    label:
      'Educational Certificates (10th, 12th, Graduation, etc.)',
    required: true,
  },
  {
    key: 'identityProof',
    label: 'Identity Proof (Aadhaar / PAN Card)',
    required: true,
  },
  {
    key: 'addressProof',
    label: 'Address Proof',
    required: true,
  },
  {
    key: 'photo',
    label: 'Passport Size Photo',
    required: true,
  },
  {
    key: 'signature',
    label: 'Signature',
    required: true,
  },
];