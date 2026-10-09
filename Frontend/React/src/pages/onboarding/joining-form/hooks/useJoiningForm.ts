import {
  useCallback,
  useEffect,
  useState,
} from "react";

import type {
  JoiningFormData,
  EmergencyContactData,
} from "../types/joiningForm.types";

import {
  joiningFormService,
} from "../services/joiningForm.service";

/* ============================================================
   INITIAL FORM DATA
   ============================================================ */

const createInitialFormData =
  (): JoiningFormData => ({
     basicInformation: {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  alternatePhone: "",
  dateOfBirth: "",
  gender: "",
  bloodGroup: "",
  maritalStatus: "",
  dateOfJoining: "",
  marriage_date: "",
  position: "",
},

    personalDetails: {
      fatherName: "",
      motherName: "",
      nationality: "",
      religion: "",
      aadhaarNumber: "",
      panNumber: "",
      uanNumber: "",
      passportNumber: "",
      permanentAddress: "",
      currentAddress: "",
      sameAsPermanent: false,
    },

    workExperience: [],

    education: [
      {
        qualification: "",
        specialization: "",
        institute: "",
        board: "",
        passingYear: "",
        percentage: "",
        isCurrentlyPursuing: false,
      },
    ],

    documents: {},

    references: [],
    emergencyContacts: [],
  });

/* ============================================================
   DATE HELPER
   ============================================================ */

 const toDateString = (
  value: unknown
): string => {
  if (!value) {
    return "";
  }

  if (typeof value !== "string") {
    return "";
  }

  const datePart = value.substring(0, 10);

  // Backend: DD-MM-YYYY
  if (
    /^\d{2}-\d{2}-\d{4}$/.test(datePart)
  ) {
    const [day, month, year] =
      datePart.split("-");

    return `${year}-${month}-${day}`;
  }

  // Backend: YYYY-MM-DD
  if (
    /^\d{4}-\d{2}-\d{2}$/.test(datePart)
  ) {
    return datePart;
  }

  return "";
};

/* ============================================================
   NORMALIZE JOB APPLICATION
   ============================================================ */

const normalizeJobApplication = (
  jobApplication: any
): Partial<JoiningFormData> => {
  if (!jobApplication) {
    return {};
  }

  return {
  basicInformation: {
    first_name:
      jobApplication.full_name
        ?.trim()
        .split(" ")[0] || "",

    last_name:
      jobApplication.full_name
        ?.trim()
        .split(" ")
        .slice(1)
        .join(" ") || "",

    email:
      jobApplication.email || "",

    phone:
      jobApplication.phone_number || "",

    alternatePhone:
      jobApplication.alternate_phone_number || "",

    dateOfBirth:
      toDateString(
        jobApplication.date_of_birth
      ),

    dateOfJoining:
      toDateString(
        jobApplication.date_of_joining ??
        jobApplication.joining_date ??
        jobApplication.date_of_joining_date
      ),

    gender:
      jobApplication.gender || "",

    maritalStatus:
      jobApplication.marital_status || "",

    position:
      jobApplication.position_applied_for || "",
  },

  personalDetails: {
    nationality:
      jobApplication.nationality || "",

    aadhaarNumber:
      jobApplication.aadhar_number || "",

    panNumber:
      jobApplication.pan_number || "",

    permanentAddress:
      jobApplication.permanent_address || "",

    currentAddress:
      jobApplication.current_address || "",
  },
};
};

/* ============================================================
   NORMALIZE JOINING FORM
   ============================================================ */
   const normalizeJoiningForm = (
  responseData: any
): Partial<JoiningFormData> => {
  const joiningForm =
    responseData?.joining_form;

  const workExperiences =
    responseData?.work_experiences || [];

  const educationRecords =
    responseData?.education || [];

  const references =
    responseData?.references || [];

  const normalized:
    Partial<JoiningFormData> = {};

  /* ============================================================
     JOINING FORM
     ============================================================ */

  if (
    joiningForm &&
    Object.keys(joiningForm).length > 0
  ) {
    normalized.basicInformation = {};

    if (joiningForm.blood_group) {
      normalized.basicInformation.bloodGroup =
        joiningForm.blood_group;
    }

    if (
      joiningForm.date_of_joining ||
      joiningForm.joining_date
    ) {
      normalized.basicInformation.dateOfJoining =
        toDateString(
          joiningForm.date_of_joining ??
          joiningForm.joining_date
        );
    }

    normalized.personalDetails = {};

    if (joiningForm.father_name) {
      normalized.personalDetails.fatherName =
        joiningForm.father_name;
    }

    if (joiningForm.mother_name) {
      normalized.personalDetails.motherName =
        joiningForm.mother_name;
    }

    if (joiningForm.religion) {
      normalized.personalDetails.religion =
        joiningForm.religion;
    }

    if (joiningForm.uan_number) {
      normalized.personalDetails.uanNumber =
        joiningForm.uan_number;
    }

    if (joiningForm.passport_number) {
      normalized.personalDetails.passportNumber =
        joiningForm.passport_number;
    }

    if (
      joiningForm.same_as_permanent_address !==
      undefined
    ) {
      normalized.personalDetails.sameAsPermanent =
        Boolean(
          joiningForm.same_as_permanent_address
        );
    }
  }

  /* ----------------------------------------------------------
     WORK EXPERIENCE
     
     IMPORTANT:
     organizationName is the frontend property.
     
     NEVER use:
       item.company
     
     ---------------------------------------------------------- */

  if (workExperiences.length > 0) {
    normalized.workExperience =
      workExperiences.map(
        (item: any) => ({
          id:
            item.experience_id != null
              ? String(
                  item.experience_id
                )
              : undefined,

          organizationName:
            item.company_name || "",

          totalExperience:
            item.total_experience || "",

          fromDate:
            toDateString(
              item.from_date
            ),

          toDate:
            toDateString(
              item.to_date
            ),

          designation:
            item.designation || "",

          employmentType:
            item.employment_type || "",

          reasonForLeaving:
            item.reason_for_leaving || "",

          keyResponsibilities:
            item.key_responsibilities || "",

          isFresher:
            Boolean(
              item.is_fresher
            ),
        })
      );
  }

  /* ----------------------------------------------------------
     EDUCATION
     ---------------------------------------------------------- */

  if (educationRecords.length > 0) {
    normalized.education =
      educationRecords.map(
        (item: any) => ({
          id:
            item.education_id != null
              ? String(
                  item.education_id
                )
              : undefined,

          qualification:
            item.highest_qualification ||
            "",

          specialization:
            item.specialization ||
            "",

          institute:
            item.institute || "",

          board:
            item.board_university ||
            "",

          passingYear:
            item.passing_year != null
              ? String(
                  item.passing_year
                )
              : "",

          percentage:
            item.percentage_cgpa ||
            "",

          isCurrentlyPursuing:
            Boolean(
              item.is_currently_pursuing
            ),
        })
      );
  }

  /* ----------------------------------------------------------
     REFERENCES
     
     IMPORTANT:
     fullName is the frontend property.
     
     NEVER use:
       item.name
     
     ---------------------------------------------------------- */

  if (references.length > 0) {
    normalized.references =
      references.map(
        (item: any) => ({
          id:
            item.reference_id != null
              ? String(
                  item.reference_id
                )
              : undefined,

          fullName:
            item.full_name || "",

          designation:
            item.designation || "",

          company:
            item.company_organization ||
            "",

          email:
            item.email_address || "",

          phone:
            item.phone_number || "",

          relationship:
            item.relationship || "",

          mayContact:
            Boolean(
              item.can_contact ??
                item.may_contact
            ),
        })
      );
  }

  return normalized;
};

/* ============================================================
   HOOK
   ============================================================ */

const useJoiningForm = (
  applicationId?: string
) => {
  const [
    currentStep,
    setCurrentStep,
  ] = useState(0);

  const [
    formData,
    setFormData,
  ] = useState<JoiningFormData>(
    createInitialFormData()
  );

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    isSuccess,
    setIsSuccess,
  ] = useState(false);

  const [
    loadError,
    setLoadError,
  ] = useState<string | null>(
    null
  );

  /* ==========================================================
     LOAD FORM
     ========================================================== */

  useEffect(() => {
   if (!applicationId) {
  setLoadError(
    "Application ID is missing from the joining form link."
  );
  return;
}

    let cancelled = false;

    const loadForm = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const response =
          await joiningFormService.getJoiningForm(
            applicationId
          );

        if (cancelled) {
          return;
        }

        if (
          !response?.success ||
          !response?.data
        ) {
          throw new Error(
            response?.message ||
              "Unable to load joining form."
          );
        }

        const applicationData =
          normalizeJobApplication(
            response.data
              ?.job_application
          );

        const joiningData =
          normalizeJoiningForm(
            response.data
          );
          
          setFormData(
  (previous) => ({
    ...previous,

    basicInformation: {
      ...previous.basicInformation,
      ...(applicationData.basicInformation || {}),
      ...(joiningData.basicInformation || {}),
    },

    personalDetails: {
      ...previous.personalDetails,
      ...(applicationData.personalDetails || {}),
      ...(joiningData.personalDetails || {}),
    },

    workExperience:
      joiningData.workExperience !== undefined
        ? joiningData.workExperience
        : previous.workExperience,

    education:
      joiningData.education !== undefined
        ? joiningData.education
        : previous.education,

    references:
      joiningData.references !== undefined
        ? joiningData.references
        : previous.references,
  })
);
      } catch (error: any) {
        if (!cancelled) {
          console.error(
            "Joining form loading error:",
            error
          );

          setLoadError(
            error?.message ||
              "Unable to load joining form."
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadForm();

    return () => {
      cancelled = true;
    };
  }, [applicationId]);

  /* ==========================================================
     GENERIC FORM UPDATE
     ========================================================== */

  const updateFormData = useCallback(
    (
      section: keyof JoiningFormData
    ) => {
      return (
        field: string,
        value: any
      ) => {
        setFormData(
          (previous) => ({
            ...previous,

            [section]: {
              ...(previous[
                section
              ] as Record<
                string,
                any
              >),

              [field]: value,
            },
          })
        );
      };
    },
    []
  );

  /* ==========================================================
     DOCUMENT UPDATE
     ========================================================== */

  const updateDocuments =
    useCallback(
      (
        field: string,
        file: File | null
      ) => {
        setFormData(
          (previous) => ({
            ...previous,

            documents: {
              ...previous.documents,

              [field]: file,
            },
          })
        );
      },
      []
    );

  /* ==========================================================
     WORK EXPERIENCE
     ========================================================== */

  const addExperience =
    useCallback(() => {
      setFormData(
        (previous) => ({
          ...previous,

          workExperience: [
            ...previous.workExperience,

            {
              organizationName: "",

              totalExperience: "",

              fromDate: "",

              toDate: "",

              designation: "",

              employmentType: "",

              reasonForLeaving: "",

              keyResponsibilities: "",

              isFresher: false,
            },
          ],
        })
      );
    }, []);

  const updateExperience =
    useCallback(
      (
        index: number,
        field: string,
        value: any
      ) => {
        setFormData(
          (previous) => {
            const experiences = [
              ...previous.workExperience,
            ];

            if (!experiences[index]) {
              return previous;
            }

            experiences[index] = {
              ...experiences[index],

              [field]: value,
            };

            return {
              ...previous,

              workExperience:
                experiences,
            };
          }
        );
      },
      []
    );

  const removeExperience =
    useCallback(
      (index: number) => {
        setFormData(
          (previous) => ({
            ...previous,

            workExperience:
              previous.workExperience.filter(
                (_, itemIndex) =>
                  itemIndex !== index
              ),
          })
        );
      },
      []
    );

  /* ==========================================================
     EDUCATION
     ========================================================== */

  const addEducation =
    useCallback(() => {
      setFormData(
        (previous) => ({
          ...previous,

          education: [
            ...previous.education,

            {
              qualification: "",

              specialization: "",

              institute: "",

              board: "",

              passingYear: "",

              percentage: "",

              isCurrentlyPursuing:
                false,
            },
          ],
        })
      );
    }, []);

  const updateEducation =
    useCallback(
      (
        index: number,
        field: string,
        value: any
      ) => {
        setFormData(
          (previous) => {
            const education = [
              ...previous.education,
            ];

            if (!education[index]) {
              return previous;
            }

            education[index] = {
              ...education[index],

              [field]: value,
            };

            return {
              ...previous,

              education,
            };
          }
        );
      },
      []
    );

  const removeEducation =
    useCallback(
      (index: number) => {
        setFormData(
          (previous) => {
            if (
              previous.education
                .length <= 1
            ) {
              return previous;
            }

            return {
              ...previous,

              education:
                previous.education.filter(
                  (_, itemIndex) =>
                    itemIndex !== index
                ),
            };
          }
        );
      },
      []
    );

  /* ==========================================================
     REFERENCES
     ========================================================== */

const addReference = useCallback(() => {
  setFormData((previous) => ({
    ...previous,

    references: [
      ...previous.references,

      {
        fullName: '',
        designation: '',
        company: '',
        email: '',
        phone: '',
        relationship: '',
        mayContact: false,
      },
    ],
  }));
}, []);

  const updateReference =
    useCallback(
      (
        index: number,
        field: string,
        value: any
      ) => {
        setFormData(
          (previous) => {
            const references = [
              ...previous.references,
            ];

            if (!references[index]) {
              return previous;
            }

            references[index] = {
              ...references[index],

              [field]: value,
            };

            return {
              ...previous,

              references,
            };
          }
        );
      },
      []
    );

  const removeReference =
    useCallback(
      (index: number) => {
        setFormData(
          (previous) => ({
            ...previous,

            references:
              previous.references.filter(
                (_, itemIndex) =>
                  itemIndex !== index
              ),
          })
        );
      },
      []
    );

    /* ==========================================================
   EMERGENCY CONTACTS
   ========================================================== */

const addEmergencyContact = useCallback(() => {
  setFormData((previous) => ({
    ...previous,
    emergencyContacts: [
      ...previous.emergencyContacts,
      {
        fullName: "",
        relationship: "",
        phoneNumber: "",
        emailAddress: "",
        address: "",
        contactOrder:
          previous.emergencyContacts.length + 1,
      },
    ],
  }));
}, []);

const updateEmergencyContact = useCallback(
  (
    index: number,
    field: keyof EmergencyContactData,
    value: string
  ) => {
    setFormData((previous) => {
      const contacts = [
        ...previous.emergencyContacts,
      ];

      if (!contacts[index]) {
        return previous;
      }

      contacts[index] = {
        ...contacts[index],
        [field]: value,
      };

      return {
        ...previous,
        emergencyContacts: contacts,
      };
    });
  },
  []
);

const removeEmergencyContact = useCallback(
  (index: number) => {
    setFormData((previous) => {
      const contacts =
        previous.emergencyContacts.filter(
          (_, itemIndex) => itemIndex !== index
        );

      return {
        ...previous,
        emergencyContacts: contacts.map(
          (contact, itemIndex) => ({
            ...contact,
            contactOrder: itemIndex + 1,
          })
        ),
      };
    });
  },
  []
);

  /* ==========================================================
     NAVIGATION
     ========================================================== */

  const goToStep =
    useCallback(
      (step: number) => {
        setCurrentStep(
          Math.max(
            0,
            Math.min(step, 7)
          )
        );
      },
      []
    );

  const goToNextStep =
    useCallback(() => {
      setCurrentStep(
        (previous) =>
          Math.min(previous + 1, 7)
      );
    }, []);

  const goToPreviousStep =
    useCallback(() => {
      setCurrentStep(
        (previous) =>
          Math.max(
            previous - 1,
            0
          )
      );
    }, []);

  /* ==========================================================
     SUBMIT
     ========================================================== */

  const submitForm =
    useCallback(async () => {
      if (!applicationId) {
        alert(
          "Application ID is missing."
        );

        return;
      }

      setIsSubmitting(true);

      try {
        await joiningFormService.createJoiningForm(
          applicationId,
          formData
        );

        setIsSuccess(true);
      } catch (error: any) {
        console.error(
          "Joining form submission error:",
          error
        );

        alert(
          error?.message ||
            "Submission failed. Please try again."
        );
      } finally {
        setIsSubmitting(false);
      }
    }, [
      applicationId,
      formData,
    ]);

    return {
    currentStep,
    formData,
    isLoading,
    loadError,
    isSubmitting,
    isSuccess,
    goToStep,
    goToNextStep,
    goToPreviousStep,
    updateFormData,
    updateDocuments,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addReference,
    updateReference,
    removeReference,
    addEmergencyContact,
updateEmergencyContact,
removeEmergencyContact,
    submitForm,
  };
};

/* ============================================================
   EXPORTS
   ============================================================ */

export {
  useJoiningForm,
};

export default useJoiningForm;