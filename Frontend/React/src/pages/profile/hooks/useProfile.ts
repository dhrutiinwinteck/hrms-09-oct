import {
  useState,
  useEffect,
  useCallback,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import type {
  ProfileData,
  ProfileField,
  EmployeeProfileApi,
  EmployeePersonalDetailsApi,
  EmployeeEducationApi,
  EmployeeBankApi,
  EmployeeEmergencyContactApi,
  EmployeeExperienceApi,
  EmployeeFamilyInfoApi,
  EmployeeSalaryApi,
  EducationRecord,
  ExperienceRecord,
  FamilyMember,
} from "../types/profile.types";

import {
  getUsername,
} from "@/pages/auth/utils/authStorage";

import {
  getEmployeePersonalDetails,
  getEmployeeEducation,
  getEmployeeBank,
  getEmployeeEmergencyContacts,
  getEmployeeExperience,
  getEmployeeFamilyInfo,
  getEmployeeSalary,
} from "../services/profile.service";

/* =========================================
   HELPER FUNCTIONS
========================================= */

const getDisplayValue = (
  value: unknown,
  fallback = "Not Set",
): string => {
  if (
    value === null ||
    value === undefined ||
    String(value).trim() === ""
  ) {
    return fallback;
  }

  return String(value);
};

/* =========================================
   DATE FORMATTING
========================================= */

const formatDate = (
  value: string | null | undefined,
): string => {
  if (!value) {
    return "Not Set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatMonthYear = (
  value: string | null | undefined,
): string => {
  if (!value) {
    return "Not Set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
};

/* =========================================
   ARRAY NORMALIZATION
========================================= */

const toArray = <T,>(
  value: T | T[] | null | undefined,
): T[] => {
  if (Array.isArray(value)) {
    return value;
  }

  return value ? [value] : [];
};

/* =========================================
   INITIALS
========================================= */

const getInitials = (
  name: string,
): string => {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0))
    .join("")
    .toUpperCase();
};

/* =========================================
   HOOK
========================================= */

export const useProfile = () => {
  const [searchParams] = useSearchParams();

  const [profile, setProfile] =
    useState<ProfileData | null>(null);

  const [loading, setLoading] =
    useState<boolean>(true);

  const [error, setError] =
    useState<string | null>(null);

  /* =========================================
     FETCH PROFILE
  ========================================= */

  const fetchProfile = useCallback(async () => {
    const requestedEmployeeCode =
      searchParams.get("empCode")?.trim();

    const loggedInEmployeeCode =
      getUsername()?.trim();

    const employeeCode =
      requestedEmployeeCode ||
      loggedInEmployeeCode;

    if (!employeeCode) {
      setError("Employee code is not available.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const apiBaseUrl =
        import.meta.env.VITE_API_BASE_URL as
          | string
          | undefined;

      if (!apiBaseUrl) {
        throw new Error(
          "API base URL is not configured.",
        );
      }

      /* =========================================
         STEP 1: GET BASIC EMPLOYEE PROFILE
      ========================================= */

      const response = await fetch(
        `${apiBaseUrl.replace(/\/+$/, "")}/api/v1/employees/profile/${encodeURIComponent(
          employeeCode,
        )}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            ...(localStorage.getItem("accessToken")
              ? {
                  Authorization: `Bearer ${localStorage.getItem(
                    "accessToken",
                  )}`,
                }
              : {}),
          },
        },
      );

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(
            "Employee profile not found.",
          );
        }

        throw new Error(
          "Failed to fetch employee profile.",
        );
      }

      const api: EmployeeProfileApi =
        await response.json();

      /* =========================================
         STEP 2: RESOLVE EMPLOYEE DATABASE ID
      ========================================= */

      const employeeId =
        api.emp_id ?? api.id;

      if (
        employeeId === null ||
        employeeId === undefined ||
        !Number.isInteger(employeeId) ||
        employeeId <= 0
      ) {
        throw new Error(
          "Employee database ID is missing from the profile response.",
        );
      }

      /* =========================================
         STEP 3: FETCH ALL EMPLOYEE DETAILS
      ========================================= */

      const [
        personalResult,
        educationResult,
        bankResult,
        emergencyResult,
        experienceResult,
        familyResult,
        salaryResult,
      ] = await Promise.allSettled([
        getEmployeePersonalDetails(employeeId),
        getEmployeeEducation(employeeId),
        getEmployeeBank(employeeId),
        getEmployeeEmergencyContacts(employeeId),
        getEmployeeExperience(employeeId),
        getEmployeeFamilyInfo(employeeId),
        getEmployeeSalary(employeeId),
      ]);

      /* =========================================
         STEP 4: NORMALIZE API RESPONSES
      ========================================= */

      const personalDetails:
        | EmployeePersonalDetailsApi
        | null =
        personalResult.status === "fulfilled"
          ? personalResult.value
          : null;

      const educationDetails:
        EmployeeEducationApi[] =
        educationResult.status === "fulfilled"
          ? toArray(educationResult.value)
          : [];

      const bankDetails:
        EmployeeBankApi[] =
        bankResult.status === "fulfilled"
          ? toArray(bankResult.value)
          : [];

      const emergencyDetails:
        EmployeeEmergencyContactApi[] =
        emergencyResult.status === "fulfilled"
          ? toArray(emergencyResult.value)
          : [];

      const experienceDetails:
        EmployeeExperienceApi[] =
        experienceResult.status === "fulfilled"
          ? toArray(experienceResult.value)
          : [];

      const familyDetails:
        EmployeeFamilyInfoApi[] =
        familyResult.status === "fulfilled"
          ? toArray(familyResult.value)
          : [];

      const salaryDetails:
        EmployeeSalaryApi[] =
        salaryResult.status === "fulfilled"
          ? toArray(salaryResult.value)
          : [];

      /* =========================================
         STEP 5: LOG API FAILURES
      ========================================= */

      const detailResults = [
        {
          name: "Personal Details",
          result: personalResult,
        },
        {
          name: "Education",
          result: educationResult,
        },
        {
          name: "Bank",
          result: bankResult,
        },
        {
          name: "Emergency Contact",
          result: emergencyResult,
        },
        {
          name: "Experience",
          result: experienceResult,
        },
        {
          name: "Family Information",
          result: familyResult,
        },
        {
          name: "Salary",
          result: salaryResult,
        },
      ];

      detailResults.forEach(({ name, result }) => {
        if (result.status === "rejected") {
          console.error(
            `${name} API failed:`,
            result.reason,
          );
        }
      });

      /* =========================================
         STEP 6: BASIC PROFILE FORMATTING
      ========================================= */

      const fullName =
        api.full_name?.trim() ||
        "Unknown Employee";

      const initials =
        getInitials(fullName);

      const employeeType =
        api.emp_type?.toUpperCase() === "FT"
          ? "Full Time"
          : getDisplayValue(api.emp_type);

      /* =========================================
         STEP 7: EDUCATION MAPPING
      ========================================= */

      const educationInformation:
        EducationRecord[] =
        educationDetails.map((item) => ({
          degree: getDisplayValue(
            item.degree_subject,
          ),

          institution: getDisplayValue(
            item.name_school_university,
          ),

          yearOfPassing: getDisplayValue(
            item.year_of_passing,
          ),

          percentage: getDisplayValue(
            item.marks_obtained,
          ),
        }));

      /* =========================================
         STEP 8: EXPERIENCE MAPPING
      ========================================= */

      const experienceInformation:
        ExperienceRecord[] =
        experienceDetails.map((item) => ({
          company: getDisplayValue(
            item.company_name,
          ),

          designation: getDisplayValue(
            item.designation,
          ),

          from: formatMonthYear(
            item.exp_year_from,
          ),

          to: formatMonthYear(
            item.exp_year_to,
          ),

          totalExperience: "Not Set",
        }));

      /* =========================================
         STEP 9: BANK MAPPING
      ========================================= */

      const bankInformation: ProfileField[] =
        bankDetails.length > 0
          ? [
              {
                label: "Bank Name",
                value: getDisplayValue(
                  bankDetails[0].bank_name,
                ),
              },

              {
                label: "Account Number",
                value: getDisplayValue(
                  bankDetails[0].account_no,
                ),
              },

              {
                label: "IFSC Code",
                value: getDisplayValue(
                  bankDetails[0].ifsc_code,
                ),
              },
            ]
          : [
              {
                label: "Bank Name",
                value: "Not Set",
              },

              {
                label: "Account Number",
                value: "Not Set",
              },

              {
                label: "IFSC Code",
                value: "Not Set",
              },
            ];

      /* =========================================
         STEP 10: EMERGENCY CONTACT MAPPING
      ========================================= */

      const emergencyContact: ProfileField[] =
        emergencyDetails.length > 0
          ? [
              {
                label: "Primary Contact",
                value: getDisplayValue(
                  emergencyDetails[0].p_name,
                ),
              },

              {
                label: "Relationship",
                value: getDisplayValue(
                  emergencyDetails[0].p_relationship,
                ),
              },

              {
                label: "Phone",
                value: getDisplayValue(
                  emergencyDetails[0].p_phone,
                ),
              },

              {
                label: "Alternate Phone",
                value: getDisplayValue(
                  emergencyDetails[0].p_alt_phone,
                ),
              },

              {
                label: "Secondary Contact",
                value: getDisplayValue(
                  emergencyDetails[0].s_name,
                ),
              },

              {
                label: "Secondary Relationship",
                value: getDisplayValue(
                  emergencyDetails[0].s_relationship,
                ),
              },

              {
                label: "Secondary Phone",
                value: getDisplayValue(
                  emergencyDetails[0].s_phone,
                ),
              },
            ]
          : [
              {
                label: "Primary Contact",
                value: "Not Set",
              },

              {
                label: "Phone",
                value: "Not Set",
              },
            ];

      /* =========================================
         STEP 11: FAMILY INFORMATION MAPPING
      ========================================= */

      const familyInformation:
        FamilyMember[] =
        familyDetails.map((item) => ({
          name: getDisplayValue(
            item.name,
          ),

          relationship: getDisplayValue(
            item.relationship,
          ),

          dateOfBirth: formatDate(
            item.dob,
          ),

          occupation: "Not Set",

          phone: getDisplayValue(
            item.phone,
          ),
        }));

      /* =========================================
         STEP 12: PERSONAL INFORMATION MAPPING
      ========================================= */

      const personalInformation:
        ProfileField[] = [
          {
            label: "Gender",
            value: getDisplayValue(
              api.gender,
            ),
          },

          {
            label: "Official Email",
            value: getDisplayValue(
              api.email,
              "N/A",
            ),
          },

          {
            label: "Personal Email",
            value: getDisplayValue(
              api.personal_email ||
                api.email,
              "N/A",
            ),
          },

          {
            label: "Notice Period",
            value:
              api.notice_period !== null &&
              api.notice_period !== undefined
                ? `${api.notice_period} Days`
                : "Not Set",
          },

          {
            label: "Date of Birth",
            value: formatDate(
              personalDetails?.date_of_birth,
            ),
          },

          {
            label: "Current Address",
            value: getDisplayValue(
              personalDetails?.current_address,
            ),
          },

          {
            label: "Permanent Address",
            value: getDisplayValue(
              personalDetails?.permanent_address,
            ),
          },

          {
            label: "Aadhar Number",
            value: getDisplayValue(
              personalDetails?.aadhar_no,
            ),
          },

          {
            label: "PAN Number",
            value: getDisplayValue(
              personalDetails?.pan_no,
            ),
          },
        ];

      /* =========================================
         STEP 13: SALARY INFORMATION MAPPING
         
         IMPORTANT:
         salaryInformation is declared BEFORE
         the final structured profile object.
      ========================================= */

      const salaryInformation:
        ProfileField[] =
        salaryDetails.length > 0
          ? [
              {
                label: "Salary",
                value: getDisplayValue(
                  salaryDetails[0].salary,
                ),
              },

              {
                label: "Payment Mode",
                value: getDisplayValue(
                  salaryDetails[0].mode_pay,
                ),
              },

              {
                label: "UAN",
                value: getDisplayValue(
                  salaryDetails[0].uan,
                ),
              },

              {
                label: "ESIC",
                value: getDisplayValue(
                  salaryDetails[0].esic,
                ),
              },
            ]
          : [
              {
                label: "Salary",
                value: "Not Set",
              },

              {
                label: "Payment Mode",
                value: "Not Set",
              },

              {
                label: "UAN",
                value: "Not Set",
              },

              {
                label: "ESIC",
                value: "Not Set",
              },
            ];

      /* =========================================
         STEP 14: FINAL PROFILE OBJECT
      ========================================= */

      const structured: ProfileData = {
        name: fullName,

        initials,

        photo: api.photo || null,

        designation: getDisplayValue(
          api.designation,
        ),

        employeeId:
          api.emp_code || employeeCode,

        dateOfJoining: formatDate(
          api.doj,
        ),

        workLocation: getDisplayValue(
          api.company_location,
        ),

        status: employeeType,

        summary: [
          {
            label: "Email",
            value: getDisplayValue(
              api.email,
              "N/A",
            ),
            icon: "mail",
          },

          {
            label: "Phone",
            value: getDisplayValue(
              api.phone,
              "N/A",
            ),
            icon: "phone",
          },

          {
            label: "Department",
            value: getDisplayValue(
              api.department,
              "N/A",
            ),
            icon: "building",
          },

          {
            label: "Manager",
            value: getDisplayValue(
              api.reporting_manager,
              "N/A",
            ),
            icon: "user",
          },
        ],

        personalInformation,

        emergencyContact,

        workInformation: [
          {
            label: "Department",
            value: getDisplayValue(
              api.department,
            ),
          },

          {
            label: "Designation",
            value: getDisplayValue(
              api.designation,
            ),
          },

          {
            label: "Reporting Manager",
            value: getDisplayValue(
              api.reporting_manager,
            ),
          },
        ],

        bankInformation,

        salaryInformation,

        familyInformation,

        educationInformation,

        experienceInformation,
      };

      /* =========================================
         STEP 15: UPDATE STATE
      ========================================= */

      setProfile(structured);
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Something went wrong while loading profile.";

      setError(errorMessage);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [searchParams]);

  /* =========================================
     INITIAL FETCH
  ========================================= */

  useEffect(() => {
    void fetchProfile();
  }, [fetchProfile]);

  /* =========================================
     RETURN HOOK DATA
  ========================================= */

  return {
    profile,
    loading,
    error,
    refresh: fetchProfile,
  };
};