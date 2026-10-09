import axiosInstance from '@/services/axios/axiosInstance';
import { JoiningFormData } from '../types/joiningForm.types';

/*
|--------------------------------------------------------------------------
| API CONFIGURATION
|--------------------------------------------------------------------------
*/

const API_URL =
  '/api/v1/api/v1/joining-forms';

/*
|--------------------------------------------------------------------------
| FORM DATA HELPERS
|--------------------------------------------------------------------------
*/

const appendIfValue = (
  formData: FormData,
  key: string,
  value: unknown
): void => {
  if (
    value === undefined ||
    value === null
  ) {
    return;
  }

  if (
    typeof value === 'string' &&
    value.trim() === ''
  ) {
    return;
  }

  formData.append(
    key,
    String(value)
  );
};

const appendFileIfExists = (
  formData: FormData,
  key: string,
  file: File | null | undefined
): void => {
  if (file instanceof File) {
    formData.append(
      key,
      file
    );
  }
};

const getFile = (
  documents: Record<
    string,
    File | null | undefined
  >,
  key: string
): File | null => {
  const file =
    documents?.[key];

  return file instanceof File
    ? file
    : null;
};

/*
|--------------------------------------------------------------------------
| BUILD FORM DATA
|--------------------------------------------------------------------------
*/

const buildFormData = (
  data: JoiningFormData
): FormData => {
  const formData =
    new FormData();

  const basic =
    data.basicInformation || {};

  const personal =  
    data.personalDetails || {};

  /*
  |--------------------------------------------------------------------------
  | COMMON APPLICATION INFORMATION
  |--------------------------------------------------------------------------
  */

  appendIfValue(
    formData,
    'full_name',
`${basic.first_name ?? ''} ${basic.last_name ?? ''}`.trim()
  );

  appendIfValue(
    formData,
    'email',
    basic.email
  );

  appendIfValue(
    formData,
    'phone_number',
    basic.phone
  );

  appendIfValue(
    formData,
    'alternate_phone_number',
    basic.alternatePhone
  );

  appendIfValue(
    formData,
    'date_of_birth',
    basic.dateOfBirth
  );

  appendIfValue(
    formData,
    'gender',
    basic.gender
  );

  appendIfValue(
    formData,
    'marital_status',
    basic.maritalStatus
  );
  appendIfValue(
  formData,
  "marriage_date",
  basic.marriage_date
);

  appendIfValue(
    formData,
    'position_applied_for',
    basic.position
  );

  appendIfValue(
    formData,
    'nationality',
    personal.nationality
  );

  appendIfValue(
    formData,
    'aadhar_number',
    personal.aadhaarNumber
  );

  appendIfValue(
    formData,
    'pan_number',
    personal.panNumber?.toUpperCase()
  );

  appendIfValue(
    formData,
    'permanent_address',
    personal.permanentAddress
  );

  appendIfValue(
    formData,
    'current_address',
    personal.currentAddress
  );

  /*
  |--------------------------------------------------------------------------
  | JOINING FORM INFORMATION
  |--------------------------------------------------------------------------
  */

  appendIfValue(
    formData,
    'blood_group',
    basic.bloodGroup
  );

  appendIfValue(
    formData,
    'date_of_joining',
    basic.dateOfJoining
  );

  appendIfValue(
    formData,
    'father_name',
    personal.fatherName
  );

  appendIfValue(
    formData,
    'mother_name',
    personal.motherName
  );

  appendIfValue(
    formData,
    'religion',
    personal.religion
  );

  appendIfValue(
    formData,
    'uan_number',
    personal.uanNumber
  );

  appendIfValue(
    formData,
    'passport_number',
    personal.passportNumber
  );

  formData.append(
    'same_as_permanent_address',
    String(
      Boolean(
        personal.sameAsPermanent
      )
    )
  );

  /*
  |--------------------------------------------------------------------------
  | EMERGENCY CONTACTS
  |--------------------------------------------------------------------------
  */

  if (
    data.emergencyContacts &&
    data.emergencyContacts.length > 0
  ) {
    const emergencyContacts = data.emergencyContacts
      .filter(
        (contact) =>
          contact.fullName?.trim() &&
          contact.relationship?.trim() &&
          contact.phoneNumber?.trim()
      )
      .map((contact, index) => ({
        full_name: contact.fullName.trim(),
        relationship: contact.relationship.trim(),
        phone_number: contact.phoneNumber.trim(),
        email_address:
          contact.emailAddress?.trim() || null,
        address:
          contact.address?.trim() || null,
        contact_order:
          contact.contactOrder || index + 1,
      }));

    if (emergencyContacts.length > 0) {
      formData.append(
        'emergency_contacts_json',
        JSON.stringify(emergencyContacts)
      );
    }
  }

  /*
  |--------------------------------------------------------------------------
  | WORK EXPERIENCE
  |--------------------------------------------------------------------------
  */

  const firstExperience =
    data.workExperience?.[0];

  if (
    firstExperience &&
    (
      firstExperience.organizationName?.trim() ||
      firstExperience.designation?.trim() ||
      firstExperience.fromDate ||
      firstExperience.toDate
    )
  ) {
    appendIfValue(
      formData,
      'work_experience_1_company_name',
      firstExperience.organizationName
    );

    appendIfValue(
      formData,
      'work_experience_1_designation',
      firstExperience.designation
    );

    appendIfValue(
      formData,
      'work_experience_1_from_date',
      firstExperience.fromDate
    );

    appendIfValue(
  formData,
  'work_experience_1_to_date',
  firstExperience.toDate
);

// Company details
appendIfValue(
  formData,
  'work_experience_1_company_location',
  firstExperience.company_location
);

appendFileIfExists(
  formData,
  'work_experience_1_company_file',
  firstExperience.company_file
);

appendIfValue(
  formData,
  'work_experience_1_company_country',
  firstExperience.company_country
);



// Employment details
appendIfValue(
  formData,
  'work_experience_1_project',
  firstExperience.project
);

appendIfValue(
  formData,
  'work_experience_1_employment_type',
  firstExperience.employmentType
);

appendIfValue(
  formData,
  'work_experience_1_contract_period',
  firstExperience.contract_period
);

appendIfValue(
  formData,
  'work_experience_1_notice_period',
  firstExperience.notice_period
);

formData.append(
  'work_experience_1_experience_order',
  '1'
);
  }

  /*
  |--------------------------------------------------------------------------
  | EDUCATION
  |--------------------------------------------------------------------------
  */

  const firstEducation =
    data.education?.[0];

  if (firstEducation) {
    appendIfValue(
      formData,
      'education_1_highest_qualification',
      firstEducation.qualification
    );

    appendIfValue(
      formData,
      'education_1_specialization',
      firstEducation.specialization
    );

    appendIfValue(
      formData,
      'education_1_institute',
      firstEducation.institute
    );

    appendIfValue(
      formData,
      'education_1_board_university',
      firstEducation.board
    );

    appendIfValue(
      formData,
      'education_1_passing_year',
      firstEducation.passingYear
    );

    appendIfValue(
      formData,
      'education_1_percentage_cgpa',
      firstEducation.percentage
    );

    formData.append(
      'education_1_education_order',
      '1'
    );
  }

  /*
  |--------------------------------------------------------------------------
  | REFERENCE
  |--------------------------------------------------------------------------
  */

  const firstReference =
    data.references?.[0];

  if (
    firstReference &&
    (
      firstReference.fullName?.trim() ||
      firstReference.designation?.trim() ||
      firstReference.company?.trim() ||
      firstReference.email?.trim() ||
      firstReference.phone?.trim() ||
      firstReference.relationship?.trim()
    )
  ) {
    appendIfValue(
      formData,
      'reference_1_full_name',
      firstReference.fullName
    );

    appendIfValue(
      formData,
      'reference_1_designation',
      firstReference.designation
    );

    appendIfValue(
      formData,
      'reference_1_company_organization',
      firstReference.company
    );

    appendIfValue(
      formData,
      'reference_1_email_address',
      firstReference.email
    );

    appendIfValue(
      formData,
      'reference_1_phone_number',
      firstReference.phone
    );

    appendIfValue(
      formData,
      'reference_1_relationship',
      firstReference.relationship
    );
    
    formData.append(
  'reference_1_can_contact',
  String(
    Boolean(
      firstReference.mayContact
    )
  )
);
    formData.append(
      'reference_1_reference_order',
      '1'
    );
  }

  /*
  |--------------------------------------------------------------------------
  | DOCUMENTS
  |--------------------------------------------------------------------------
  |
  | IMPORTANT:
  |
  | These keys MUST exactly match DOCUMENT_TYPES.
  |
  | Frontend:
  |
  | addressProof
  | identityProof
  | photo
  | signature
  | educationalCertificates
  | relievingLetter
  | offerLetter
  | salarySlips
  |
  | Backend:
  |
  | address_proof
  | identity_proof
  | passport_photo
  | signature
  | educational_certificate
  | relieving_letter
  | offer_letter
  | last_3_months_salary
  |--------------------------------------------------------------------------
  */

  const documents =
    data.documents || {};

  /*
  |--------------------------------------------------------------------------
  | REQUIRED DOCUMENTS
  |--------------------------------------------------------------------------
  */

  appendFileIfExists(
    formData,
    'address_proof',
    getFile(
      documents,
      'addressProof'
    )
  );

    appendFileIfExists(
    formData,
    'aadhaar_card_front',
    getFile(
      documents,
      'aadhar_file_front'
    )
  );

  appendFileIfExists(
    formData,
    'aadhaar_card_back',
    getFile(
      documents,
      'aadhar_file_back'
    )
  );

  

  appendFileIfExists(
    formData,
    'passport_photo',
    getFile(
      documents,
      'photo'
    )
  );

  appendFileIfExists(
    formData,
    'signature',
    getFile(
      documents,
      'signature'
    )
  );

  appendFileIfExists(
    formData,
    'educational_certificate',
    getFile(
      documents,
      'educationalCertificates'
    )
  );

  /*
  |--------------------------------------------------------------------------
  | OPTIONAL DOCUMENTS
  |--------------------------------------------------------------------------
  */

  appendFileIfExists(
    formData,
    'relieving_letter',
    getFile(
      documents,
      'relievingLetter'
    )
  );

  appendFileIfExists(
    formData,
    'offer_letter',
    getFile(
      documents,
      'offerLetter'
    )
  );

  appendFileIfExists(
    formData,
    'last_3_months_salary',
    getFile(
      documents,
      'salarySlips'
    )
  );

  return formData;
};

/*
|--------------------------------------------------------------------------
| ERROR HANDLING
|--------------------------------------------------------------------------
*/

const getErrorMessage = (
  error: unknown
): string => {
  const axiosError =
    error as {
      response?: {
        data?: {
          detail?: unknown;
          message?: unknown;
        };
      };
      message?: string;
    };

  const detail =
    axiosError?.response?.data?.detail;

  if (
    Array.isArray(detail)
  ) {
    return detail
      .map(
        (item: unknown) => {
          if (
            typeof item === 'string'
          ) {
            return item;
          }

          if (
            typeof item === 'object' &&
            item !== null
          ) {
            const validationItem =
              item as {
                msg?: unknown;
                message?: unknown;
              };

            if (
  typeof validationItem.msg ===
  'string'
) {
  const location =
    Array.isArray(
      (item as any).loc
    )
      ? (item as any).loc.join(" → ")
      : "";

  return location
    ? `${location}: ${validationItem.msg}`
    : validationItem.msg;
}

            if (
              typeof validationItem.message ===
              'string'
            ) {
              return validationItem.message;
            }
          }

          return 'Validation error';
        }
      )
      .join('\n');
  }

  if (
    typeof detail === 'string'
  ) {
    return detail;
  }

  const responseMessage =
    axiosError?.response?.data?.message;

  if (
    typeof responseMessage === 'string'
  ) {
    return responseMessage;
  }

  if (
    typeof axiosError?.message === 'string'
  ) {
    return axiosError.message;
  }

  return 'Unable to process joining form.';
};

/*
|--------------------------------------------------------------------------
| JOINING FORM SERVICE
|--------------------------------------------------------------------------
*/

export const joiningFormService = {

  getJoiningForm: async (
    applicationId: string
  ) => {
    try {
      const response =
        await axiosInstance.get(
          `${API_URL}/${applicationId}`
        );

      return response.data;
    } catch (
      error: unknown
    ) {
      console.error(
        'Failed to fetch joining form:',
        error
      );

      throw new Error(
        getErrorMessage(error)
      );
    }
  },

  createJoiningForm: async (
    applicationId: string,
    data: JoiningFormData
  ) => {
    try {
      const formData =
        buildFormData(data);

      const response =
        await axiosInstance.post(
          `${API_URL}/${applicationId}`,
          formData
        );

      return response.data;
    } catch (
      error: unknown
    ) {
      console.error(
        'Failed to submit joining form:',
        error
      );

      throw new Error(
        getErrorMessage(error)
      );
    }
  },

  getAllJoiningForms: async () => {
    try {
      const response =
        await axiosInstance.get(
          API_URL
        );

      return response.data;
    } catch (
      error: unknown
    ) {
      console.error(
        'Failed to fetch joining forms:',
        error
      );

      throw new Error(
        getErrorMessage(error)
      );
    }
  },
};