/**
 * Recruitment Service
 * Handles all API calls for the recruitment module.
 */


import axiosInstance from '../../../services/axios/axiosInstance';
import {
  IJobApplication,
  IApiResponse,
  IDesignation,
} from '../types/application.types';



/* ============================================================
   FRONTEND FORM TYPES
============================================================ */

interface BasicInformationForm {
  fullName: string;
  email: string;
  phoneNumber: string;
  countryCode?: string;
  alternativePhone?: string;
  positionApplied: string;
  dateOfApplication: string;
  resume?: FileList | null;
}

interface PersonalDetailsForm {
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  nationality: string;
  aadharNumber?: string;
  panNumber?: string;
  currentAddress: string;
  permanentAddress: string;
}

interface EmergencyContactForm {
  fullName: string;
  relationship: string;
  phoneNumber: string;
  emailAddress?: string;
  address: string;
}

interface WorkExperienceForm {
  companyName: string;
  jobTitle: string;
  employeeType: string;
  fromDate: string;
  toDate: string;
  currentlyWorking: boolean;
  keyResponsibilities: string;
}

interface EducationForm {
  qualification: string;
  specification: string;
  institute: string;
  passingYear: string;
  percentageCgpa: string;
  currentlyPursuing: boolean;
}

interface ReferenceForm {
  fullName: string;
  designation: string;
  companyOrganization: string;
  emailAddress: string;
  phoneNumber: string;
  relationship: string;
}

export interface ApplicationFormValues {
  basicInformation: BasicInformationForm;

  personalDetails: PersonalDetailsForm;

  emergencyContacts: {
    contact1: EmergencyContactForm;
    contact2?: EmergencyContactForm | null;
  };

  workExperiences: {
    isFresher: boolean;
    experiences: WorkExperienceForm[];
  };

  educations: {
    educations: EducationForm[];
  };

  references: {
    reference1: ReferenceForm;
    reference2?: ReferenceForm | null;
  };
}

/* ============================================================
   INVITATION VALIDATION
============================================================ */

export interface InvitationValidationResponse {
  valid: boolean;
  candidate_email?: string;
  status?: string;
}

/* ============================================================
   RECRUITMENT SERVICE
============================================================ */

class RecruitmentService {

  /* ==========================================================
     SUBMIT COMPLETE JOB APPLICATION
  ========================================================== */

 async createApplication(
  formValues: ApplicationFormValues,
  referralToken?: string
): Promise<IApiResponse<IJobApplication>> {

    try {

      const formData = new FormData();

      if (referralToken?.trim()) {
  formData.append(
    'referralToken',
    referralToken.trim()
  );
}

      const {
        basicInformation,
        personalDetails,
        emergencyContacts,
        workExperiences,
        educations,
        references,
      } = formValues;

      /* ========================================================
         BASIC INFORMATION
      ======================================================== */

      formData.append(
        'full_name',
        basicInformation.fullName.trim()
      );

      formData.append(
        'email',
        basicInformation.email.trim()
      );

      /*
       * Backend expects only the actual phone number.
       * Country code (+91) is NOT sent as part of phone_number.
       */

      const phoneNumber =
        basicInformation.phoneNumber
          .replace(/\D/g, '')
          .slice(0, 10);

      formData.append(
        'phone_number',
        phoneNumber
      );

      const alternatePhone =
        basicInformation.alternativePhone
          ?.replace(/\D/g, '')
          .slice(0, 10) || '';

      if (alternatePhone) {
        formData.append(
          'alternate_phone_number',
          alternatePhone
        );
      }

      formData.append(
        'position_applied_for',
        basicInformation.positionApplied.trim()
      );

      /*
       * The current FastAPI endpoint declares date_of_birth,
       * but does NOT require date_of_application as a Form field.
       *
       * The backend service itself sets:
       * date_of_application = date.today()
       *
       * Therefore we intentionally do NOT append
       * date_of_application here.
       */

      /* ========================================================
         PERSONAL DETAILS
      ======================================================== */

      formData.append(
        'date_of_birth',
        personalDetails.dateOfBirth
      );

      formData.append(
        'gender',
        personalDetails.gender
      );

      formData.append(
        'marital_status',
        personalDetails.maritalStatus
      );

      formData.append(
        'nationality',
        personalDetails.nationality.trim()
      );

      const aadharNumber =
        personalDetails.aadharNumber
          ?.replace(/\D/g, '')
          .trim() || '';

      if (aadharNumber) {
        formData.append(
          'aadhar_number',
          aadharNumber
        );
      }

      const panNumber =
        personalDetails.panNumber
          ?.trim()
          .toUpperCase() || '';

      if (panNumber) {
        formData.append(
          'pan_number',
          panNumber
        );
      }

      formData.append(
        'current_address',
        personalDetails.currentAddress.trim()
      );

      formData.append(
        'permanent_address',
        personalDetails.permanentAddress.trim()
      );

      /* ========================================================
         EMERGENCY CONTACTS
         
         IMPORTANT:
         Backend currently accepts:
         emergency_contact_1_*
         emergency_contact_2_*
         emergency_contact_3_*

         It does NOT accept a JSON field called
         "emergency_contacts".
      ======================================================== */

      const emergencyContactList = [];

      /* --------------------------------------------------------
         CONTACT 1 - REQUIRED
      -------------------------------------------------------- */

      if (emergencyContacts.contact1) {

        const contact1 =
          emergencyContacts.contact1;

        emergencyContactList.push({
          full_name:
            contact1.fullName.trim(),

          relationship:
            contact1.relationship.trim(),

          phone_number:
            contact1.phoneNumber
              .replace(/\D/g, '')
              .trim(),

          email_address:
            contact1.emailAddress?.trim() || null,

          address:
            contact1.address.trim(),

          contact_order: 1,
        });

        formData.append(
          'emergency_contact_1_full_name',
          contact1.fullName.trim()
        );

        formData.append(
          'emergency_contact_1_relationship',
          contact1.relationship.trim()
        );

        formData.append(
          'emergency_contact_1_phone_number',
          contact1.phoneNumber
            .replace(/\D/g, '')
            .trim()
        );

        if (contact1.emailAddress?.trim()) {
          formData.append(
            'emergency_contact_1_email_address',
            contact1.emailAddress.trim()
          );
        }

        formData.append(
          'emergency_contact_1_address',
          contact1.address.trim()
        );
      }

      /* --------------------------------------------------------
         CONTACT 2 - OPTIONAL
      -------------------------------------------------------- */

      if (emergencyContacts.contact2) {

        const contact2 =
          emergencyContacts.contact2;

        emergencyContactList.push({
          full_name:
            contact2.fullName.trim(),

          relationship:
            contact2.relationship.trim(),

          phone_number:
            contact2.phoneNumber
              .replace(/\D/g, '')
              .trim(),

          email_address:
            contact2.emailAddress?.trim() || null,

          address:
            contact2.address.trim(),

          contact_order: 2,
        });

        if (contact2.fullName?.trim()) {
          formData.append(
            'emergency_contact_2_full_name',
            contact2.fullName.trim()
          );
        }

        if (contact2.relationship?.trim()) {
          formData.append(
            'emergency_contact_2_relationship',
            contact2.relationship.trim()
          );
        }

        if (contact2.phoneNumber?.trim()) {
          formData.append(
            'emergency_contact_2_phone_number',
            contact2.phoneNumber
              .replace(/\D/g, '')
              .trim()
          );
        }

        if (contact2.emailAddress?.trim()) {
          formData.append(
            'emergency_contact_2_email_address',
            contact2.emailAddress.trim()
          );
        }

        if (contact2.address?.trim()) {
          formData.append(
            'emergency_contact_2_address',
            contact2.address.trim()
          );
        }
      }

      /*
       * Current frontend form has only contact1 and contact2.
       * Backend supports contact3, but we do not invent contact3
       * data here.
       */

      /* ========================================================
         WORK EXPERIENCE
         
         IMPORTANT:
         Current backend endpoint accepts ONE work experience
         record only.
         
         If candidate is fresher:
         - is_fresher = true
         - experience_order = 0
         
         If experienced:
         - first experience is submitted
         - experience_order = 1
         
         Multi-record backend support can be added later.
      ======================================================== */

      const isFresher =
        Boolean(
          workExperiences.isFresher
        );

      formData.append(
        'is_fresher',
        String(isFresher)
      );

      if (isFresher) {

        formData.append(
          'experience_order',
          '0'
        );

        formData.append(
          'experience_currently_working_here',
          'false'
        );

      } else {

        const firstExperience =
          workExperiences.experiences?.[0];

        if (!firstExperience) {
          return {
            success: false,
            message:
              'At least one work experience is required for an experienced candidate.',
          };
        }

        formData.append(
          'experience_company_name',
          firstExperience.companyName.trim()
        );

        formData.append(
          'experience_job_title',
          firstExperience.jobTitle.trim()
        );

        formData.append(
          'experience_employee_type',
          firstExperience.employeeType.trim()
        );

        formData.append(
          'experience_from_date',
          firstExperience.fromDate
        );

        if (
          firstExperience.currentlyWorking
        ) {

          formData.append(
            'experience_currently_working_here',
            'true'
          );

        } else {

          formData.append(
            'experience_currently_working_here',
            'false'
          );

          if (firstExperience.toDate) {
            formData.append(
              'experience_to_date',
              firstExperience.toDate
            );
          }
        }

        formData.append(
          'experience_key_responsibilities',
          firstExperience.keyResponsibilities.trim()
        );

        formData.append(
          'experience_order',
          '1'
        );
      }

      /* ========================================================
         EDUCATION
         
         IMPORTANT:
         Current backend accepts ONE education record only.
         We therefore submit the first education record.
      ======================================================== */

      const firstEducation =
        educations.educations?.[0];

      if (!firstEducation) {
        return {
          success: false,
          message:
            'At least one education record is required.',
        };
      }

      formData.append(
        'education_qualification',
        firstEducation.qualification.trim()
      );

      formData.append(
        'education_specification_stream',
        firstEducation.specification.trim()
      );

      formData.append(
        'education_institute_university',
        firstEducation.institute.trim()
      );

      formData.append(
        'education_passing_year',
        String(
          Number(
            firstEducation.passingYear
          )
        )
      );

      formData.append(
        'education_percentage_cgpa',
        firstEducation.percentageCgpa.trim()
      );

      formData.append(
        'education_currently_pursuing',
        String(
          Boolean(
            firstEducation.currentlyPursuing
          )
        )
      );

      formData.append(
        'education_order',
        '1'
      );

      /* ========================================================
         REFERENCES
         
         IMPORTANT:
         Current backend accepts ONE reference only.
      ======================================================== */

      if (references.reference1) {

        const reference1 =
          references.reference1;

        formData.append(
          'reference_full_name',
          reference1.fullName.trim()
        );

        formData.append(
          'reference_designation',
          reference1.designation.trim()
        );

        formData.append(
          'reference_company_organization',
          reference1.companyOrganization.trim()
        );

        if (reference1.emailAddress?.trim()) {
          formData.append(
            'reference_email_address',
            reference1.emailAddress.trim()
          );
        }

        if (reference1.phoneNumber?.trim()) {
          formData.append(
            'reference_phone_number',
            reference1.phoneNumber
              .replace(/\D/g, '')
              .trim()
          );
        }

        formData.append(
          'reference_relationship',
          reference1.relationship.trim()
        );

        formData.append(
          'reference_order',
          '1'
        );
      }

      /* ========================================================
         RESUME
      ======================================================== */

      const resumeFiles =
        basicInformation.resume;

      if (
        resumeFiles &&
        resumeFiles.length > 0
      ) {

        formData.append(
          'resume',
          resumeFiles[0]
        );

      } else {

        return {
          success: false,
          message:
            'Resume file is required.',
        };
      }

      /* ========================================================
         DEBUG
         
         Safe FormData debugging.
         Resume contents are never logged.
      ======================================================== */

      console.log(
        'Submitting Job Application to backend'
      );

      console.log(
        'Emergency contacts prepared:',
        emergencyContactList.length
      );

      /* ========================================================
         API REQUEST
         
         IMPORTANT:
         Current backend router is mounted as:
         
         /api/v1/api/v1/job-applications
         
         because:
         
         main.py:
         /api/v1
         
         router.py:
         /api/v1
         
         Therefore current frontend endpoint must be:
         
         /api/v1/api/v1/job-applications
      ======================================================== */

      const response =
        await axiosInstance.post(
          '/api/v1/job-applications',
          formData,
          {
            /*
             * Do NOT manually set multipart boundary.
             * axiosInstance already removes Content-Type
             * for FormData.
             */
            timeout: 60000,
          }
        );

      /* ========================================================
         RESPONSE
      ======================================================== */

      const responseData =
        response.data;

      return {
        success:
          responseData?.success ??
          true,

        data:
          responseData?.data ??
          responseData,

        message:
          responseData?.message ??
          'Application submitted successfully.',
      };

    } catch (error: any) {

      console.error(
        'Create job application error:',
        error
      );

      const responseData =
        error?.response?.data;

      let message =
        responseData?.message ||
        responseData?.detail ||
        'Failed to submit job application.';

      /*
       * FastAPI validation errors arrive
       * as detail arrays.
       */

      if (
        Array.isArray(
          responseData?.detail
        )
      ) {

        message =
          responseData.detail
            .map(
              (item: any) =>
                item?.msg ||
                'Invalid field'
            )
            .join(', ');
      }

      return {
        success: false,
        message,
        errors:
          responseData?.errors ||
          responseData?.detail,
      };
    }
  }

  /* ==========================================================
     GET ALL APPLICATIONS
  ========================================================== */

  async getApplications():
    Promise<IApiResponse<IJobApplication[]>> {

    try {

      const response =
        await axiosInstance.get(
          '/api/v1/job-applications'
        );

      return {
        success:
          response.data?.success ??
          true,

        data:
          response.data?.data ??
          [],

        message:
          response.data?.message ||
          'Applications retrieved successfully.',
      };

    } catch (error: any) {

      console.error(
        'Get applications error:',
        error
      );

      return {
        success: false,
        message:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          'Failed to retrieve applications.',
      };
    }
  }

  /* ==========================================================
     GET APPLICATION BY ID
  ========================================================== */

  async getApplication(
    id: string
  ): Promise<IApiResponse<IJobApplication>> {

    try {

      const response =
        await axiosInstance.get(
          `/job-applications/${id}`
        );

      return {
        success:
          response.data?.success ??
          true,

        data:
          response.data?.data ??
          response.data,

        message:
          response.data?.message ||
          'Application retrieved successfully.',
      };

    } catch (error: any) {

      console.error(
        'Get application error:',
        error
      );

      return {
        success: false,
        message:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          'Failed to retrieve application.',
      };
    }
  }

  /* ==========================================================
     DELETE APPLICATION
  ========================================================== */

  async deleteApplication(
    id: string
  ): Promise<IApiResponse<void>> {

    try {

      await axiosInstance.delete(
        `/api/v1/job-applications/${id}`
      );

      return {
        success: true,
        message:
          'Application deleted successfully.',
      };

    } catch (error: any) {

      console.error(
        'Delete application error:',
        error
      );

      return {
        success: false,
        message:
          error.response?.data?.detail ||
          error.response?.data?.message ||
          'Failed to delete application.',
      };
    }
  }

  /* ==========================================================
     VALIDATE APPLICATION INVITATION TOKEN
  ========================================================== */

  async validateInvitationToken(
    token: string
  ): Promise<
    IApiResponse<InvitationValidationResponse>
  > {

    try {

      const response =
        await axiosInstance.get(
          `/api/v1/application-invitations/${encodeURIComponent(token)}`
        );

      return {
        success: true,

        data:
          response.data,

        message:
          'Invitation token is valid.',
      };

    } catch (error: any) {

      console.error(
        'Validate invitation token error:',
        error
      );

      return {
        success: false,
        message:
          error.response?.data?.detail ||
          'Invalid or expired application invitation.',
      };
    }
  }


    /* ==========================================================
     GET ALL DESIGNATIONS

     Backend:
     GET /api/v1/designations/

     Source:
     PostgreSQL -> designation table
  ========================================================== */

  async getDesignations():
    Promise<IApiResponse<IDesignation[]>> {

    try {

      const response =
        await axiosInstance.get<
          IDesignation[] | IApiResponse<IDesignation[]>
        >(
          '/api/v1/designations/'
        );

      const responseData =
        response.data;

      /*
       * Backend may return:
       *
       * 1. Direct array:
       * [
       *   {
       *     id: 1022,
       *     name: 'Chief Executive Officer',
       *     depart_id: 1009,
       *     department_name: 'Operations'
       *   }
       * ]
       *
       * OR:
       *
       * 2. Wrapped response:
       * {
       *   success: true,
       *   data: [...]
       * }
       */

      if (Array.isArray(responseData)) {

        return {
          success: true,
          data: responseData,
          message:
            'Designations retrieved successfully.',
        };
      }

      if (
        responseData &&
        Array.isArray(responseData.data)
      ) {

        return {
          success:
            responseData.success ?? true,

          data:
            responseData.data,

          message:
            responseData.message ||
            'Designations retrieved successfully.',
        };
      }

      return {
        success: false,
        data: [],
        message:
          'Invalid designation response received from the server.',
      };

    } catch (error: any) {

      console.error(
        'Get designations error:',
        error
      );

      return {
        success: false,
        data: [],
        message:
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          'Failed to retrieve designations.',
      };
    }
  }
  /* ==========================================================
     MASTER DATA
  ========================================================== */

  // async getPositions():
  //   Promise<IApiResponse<string[]>> {

  //   try {

  //     const response =
  //       await axiosInstance.get(
  //         '/positions'
  //       );

  //     if (
  //       response.data &&
  //       Array.isArray(response.data)
  //     ) {

  //       const positions =
  //         response.data.map(
  //           (item: any) =>
  //             item.name || item
  //         );

  //       return {
  //         success: true,
  //         data: positions,
  //         message:
  //           'Positions retrieved successfully.',
  //       };
  //     }

  //     return this.getFallbackPositions();

  //   } catch {

  //     console.warn(
  //       'Failed to fetch positions, using fallback data.'
  //     );

  //     return this.getFallbackPositions();
  //   }
  // }

  async getQualifications():
    Promise<IApiResponse<string[]>> {

    try {

      const response =
        await axiosInstance.get(
          '/qualifications'
        );

      if (
        response.data &&
        Array.isArray(response.data)
      ) {

        const qualifications =
          response.data.map(
            (item: any) =>
              item.name || item
          );

        return {
          success: true,
          data: qualifications,
          message:
            'Qualifications retrieved successfully.',
        };
      }

      return this.getFallbackQualifications();

    } catch {

      console.warn(
        'Failed to fetch qualifications, using fallback data.'
      );

      return this.getFallbackQualifications();
    }
  }

  async getEmployeeTypes():
    Promise<IApiResponse<string[]>> {

    try {

      const response =
        await axiosInstance.get(
          '/employeeTypes'
        );

      if (
        response.data &&
        Array.isArray(response.data)
      ) {

        const employeeTypes =
          response.data.map(
            (item: any) =>
              item.name || item
          );

        return {
          success: true,
          data: employeeTypes,
          message:
            'Employee types retrieved successfully.',
        };
      }

      return this.getFallbackEmployeeTypes();

    } catch {

      console.warn(
        'Failed to fetch employee types, using fallback data.'
      );

      return this.getFallbackEmployeeTypes();
    }
  }

  async getRelationships():
    Promise<IApiResponse<string[]>> {

    try {

      const response =
        await axiosInstance.get(
          '/relationships'
        );

      if (
        response.data &&
        Array.isArray(response.data)
      ) {

        const relationships =
          response.data.map(
            (item: any) =>
              item.name || item
          );

        return {
          success: true,
          data: relationships,
          message:
            'Relationships retrieved successfully.',
        };
      }

      return this.getFallbackRelationships();

    } catch {

      console.warn(
        'Failed to fetch relationships, using fallback data.'
      );

      return this.getFallbackRelationships();
    }
  }

  async getGenders():
    Promise<IApiResponse<string[]>> {

    try {

      const response =
        await axiosInstance.get(
          '/genders'
        );

      if (
        response.data &&
        Array.isArray(response.data)
      ) {

        const genders =
          response.data.map(
            (item: any) =>
              item.name || item
          );

        return {
          success: true,
          data: genders,
          message:
            'Genders retrieved successfully.',
        };
      }

      return this.getFallbackGenders();

    } catch {

      console.warn(
        'Failed to fetch genders, using fallback data.'
      );

      return this.getFallbackGenders();
    }
  }

  async getMaritalStatuses():
    Promise<IApiResponse<string[]>> {

    try {

      const response =
        await axiosInstance.get(
          '/maritalStatuses'
        );

      if (
        response.data &&
        Array.isArray(response.data)
      ) {

        const maritalStatuses =
          response.data.map(
            (item: any) =>
              item.name || item
          );

        return {
          success: true,
          data: maritalStatuses,
          message:
            'Marital statuses retrieved successfully.',
        };
      }

      return this.getFallbackMaritalStatuses();

    } catch {

      console.warn(
        'Failed to fetch marital statuses, using fallback data.'
      );

      return this.getFallbackMaritalStatuses();
    }
  }

  async getNationalities():
    Promise<IApiResponse<string[]>> {

    try {

      const response =
        await axiosInstance.get(
          '/nationalities'
        );

      if (
        response.data &&
        Array.isArray(response.data)
      ) {

        const nationalities =
          response.data.map(
            (item: any) =>
              item.name || item
          );

        return {
          success: true,
          data: nationalities,
          message:
            'Nationalities retrieved successfully.',
        };
      }

      return this.getFallbackNationalities();

    } catch {

      console.warn(
        'Failed to fetch nationalities, using fallback data.'
      );

      return this.getFallbackNationalities();
    }
  }

  /* ==========================================================
     FALLBACK DATA
  ========================================================== */

  // private getFallbackPositions():
  //   IApiResponse<string[]> {

  //   return {
  //     success: true,
  //     data: [
  //       'Software Developer',
  //       'Senior Software Developer',
  //       'Frontend Developer',
  //       'Backend Developer',
  //       'Full Stack Developer',
  //       'DevOps Engineer',
  //       'UI/UX Designer',
  //       'Product Manager',
  //       'Project Manager',
  //       'Business Analyst',
  //       'Quality Assurance Engineer',
  //       'Data Analyst',
  //       'Data Scientist',
  //       'Machine Learning Engineer',
  //       'Cloud Architect',
  //       'System Administrator',
  //       'Network Engineer',
  //       'Security Analyst',
  //       'HR Manager',
  //       'Recruitment Specialist',
  //       'Digital Marketing Specialist',
  //       'SEO Specialist',
  //       'Content Writer',
  //       'Graphic Designer',
  //       'Video Editor',
  //       'Social Media Manager',
  //       'Help Desk Support',
  //       'Technical Support Engineer',
  //       'Customer Service Representative',
  //       'Sales Executive',
  //     ],
  //     message:
  //       'Fallback positions loaded.',
  //   };
  // }

  private getFallbackQualifications():
    IApiResponse<string[]> {

    return {
      success: true,
      data: [
        'Bachelor of Technology (B.Tech)',
        'Bachelor of Engineering (B.E)',
        'Bachelor of Science (B.Sc)',
        'Bachelor of Commerce (B.Com)',
        'Bachelor of Arts (B.A)',
        'Master of Technology (M.Tech)',
        'Master of Engineering (M.E)',
        'Master of Science (M.Sc)',
        'Master of Business Administration (MBA)',
        'Master of Commerce (M.Com)',
        'Master of Arts (M.A)',
        'Doctor of Philosophy (Ph.D)',
        'Diploma',
        'Post Graduate Diploma',
        'Certificate Course',
      ],
      message:
        'Fallback qualifications loaded.',
    };
  }

  private getFallbackEmployeeTypes():
    IApiResponse<string[]> {

    return {
      success: true,
      data: [
        'Full Time',
        'Part Time',
        'Contract',
        'Internship',
        'Freelance',
        'Temporary',
        'Permanent',
      ],
      message:
        'Fallback employee types loaded.',
    };
  }

  private getFallbackRelationships():
    IApiResponse<string[]> {

    return {
      success: true,
      data: [
        'Father',
        'Mother',
        'Spouse',
        'Sibling',
        'Friend',
        'Colleague',
        'Relative',
        'Other',
      ],
      message:
        'Fallback relationships loaded.',
    };
  }

  private getFallbackGenders():
    IApiResponse<string[]> {

    return {
      success: true,
      data: [
        'Male',
        'Female',
        'Other',
      ],
      message:
        'Fallback genders loaded.',
    };
  }

  private getFallbackMaritalStatuses():
    IApiResponse<string[]> {

    return {
      success: true,
      data: [
        'Married',
        'Unmarried',
        'Divorced',
        'Widowed',
        'Separated',
      ],
      message:
        'Fallback marital statuses loaded.',
    };
  }

  private getFallbackNationalities():
    IApiResponse<string[]> {

    return {
      success: true,
      data: [
        'Indian',
        'American',
        'British',
        'Canadian',
        'Australian',
        'Other',
      ],
      message:
        'Fallback nationalities loaded.',
    };
  }
}

export const recruitmentService =
  new RecruitmentService();

export default recruitmentService;