import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import "./BasicInformation.css";
import { User, Calendar, Paperclip } from "lucide-react";
import { recruitmentService } from "../../services/recruitmentService";
import type { IDesignation } from "../../types/application.types";

interface BasicInfoFormData {
  basicInformation: {
    fullName: string;
    email: string;
    phoneNumber: string;
    countryCode: string;
    alternativePhone?: string;
    positionApplied: string;
    dateOfApplication: string;
    resume?: FileList;
  };
}

const MAX_RESUME_SIZE = 5 * 1024 * 1024;

const ALLOWED_RESUME_EXTENSIONS = [".pdf", ".doc", ".docx"];

const BasicInformation: React.FC = () => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
    getValues,
  } = useFormContext<BasicInfoFormData>();

  const resumeFile = watch("basicInformation.resume");

  const [designations, setDesignations] = useState<IDesignation[]>([]);
  const [isLoadingDesignations, setIsLoadingDesignations] = useState(true);
  const [designationError, setDesignationError] = useState<string | null>(null);

  const fileName =
    resumeFile instanceof FileList && resumeFile.length > 0
      ? resumeFile[0].name
      : "No file chosen";

  /*
   * ------------------------------------------------------------
   * LOAD DESIGNATIONS
   * ------------------------------------------------------------
   *
   * Position Applied For is populated from the designation master
   * data exposed by the backend. The designation table is the
   * single source of truth; no hardcoded positions are used here.
   */
  useEffect(() => {
    let isMounted = true;

    const loadDesignations = async (): Promise<void> => {
      setIsLoadingDesignations(true);
      setDesignationError(null);

      try {
        const result = await recruitmentService.getDesignations();

        if (!isMounted) {
          return;
        }

        if (result.success && result.data) {
          setDesignations(result.data);
          return;
        }

        setDesignations([]);
        setDesignationError(
          result.message || "Unable to load available positions."
        );
      } catch (error) {
        if (!isMounted) {
          return;
        }

        console.error("Load designations error:", error);
        setDesignations([]);
        setDesignationError(
          "Unable to load available positions. Please try again."
        );
      } finally {
        if (isMounted) {
          setIsLoadingDesignations(false);
        }
      }
    };

    void loadDesignations();

    return () => {
      isMounted = false;
    };
  }, []);

  /*
   * ------------------------------------------------------------
   * Set default values safely
   * ------------------------------------------------------------
   *
   * We only populate these values when they are empty.
   * This prevents the component from overwriting values
   * already entered by the user.
   */
  useEffect(() => {
    /*
     * ------------------------------------------------------------
     * INDIA ONLY
     * ------------------------------------------------------------
     *
     * Country code is always +91.
     * It must NEVER be stored inside phoneNumber.
     */
    setValue("basicInformation.countryCode", "+91", {
      shouldValidate: true,
      shouldDirty: false,
      shouldTouch: false,
    });

    /*
     * ------------------------------------------------------------
     * CLEAN PHONE NUMBER
     * ------------------------------------------------------------
     *
     * Older/default form data may contain:
     *
     * phoneNumber = "+91"
     *
     * or:
     *
     * phoneNumber = "+919151545566"
     *
     * Since this is an India-only form, phoneNumber must
     * contain ONLY the actual 10-digit number.
     */
    const currentPhoneNumber = getValues("basicInformation.phoneNumber");

    if (currentPhoneNumber) {
      const cleanedPhoneNumber = currentPhoneNumber
        .replace(/^\+91\s*/, "")
        .replace(/\D/g, "")
        .slice(0, 10);

      if (cleanedPhoneNumber !== currentPhoneNumber) {
        setValue("basicInformation.phoneNumber", cleanedPhoneNumber, {
          shouldValidate: true,
          shouldDirty: false,
          shouldTouch: false,
        });
      }
    }

    /*
     * ------------------------------------------------------------
     * DEFAULT APPLICATION DATE
     * ------------------------------------------------------------
     */
    const currentDate = getValues("basicInformation.dateOfApplication");

    if (!currentDate) {
      const now = new Date();

      const year = now.getFullYear();

      const month = String(now.getMonth() + 1).padStart(2, "0");

      const day = String(now.getDate()).padStart(2, "0");

      const today = `${year}-${month}-${day}`;

      setValue("basicInformation.dateOfApplication", today, {
        shouldValidate: true,
        shouldDirty: false,
        shouldTouch: false,
      });
    }
  }, [getValues, setValue]);

  return (
    <section className="it-basic-info-section">
      {/* ============================================================
          SECTION HEADER
      ============================================================ */}
      <header className="it-section-header">
        <div className="it-section-icon">
          <User size={24} strokeWidth={2} color="#4E6868" />
        </div>

        <div className="it-section-text">
          <h2 className="it-section-title">Basic Information</h2>

          <p className="it-section-subtitle">
            Please provide your basic information.
          </p>
        </div>
      </header>

      {/* ============================================================
          FORM GRID
      ============================================================ */}
      <div className="it-form-grid">
        {/* ========================================================
            FULL NAME
        ======================================================== */}
        <div className="it-field-group">
          <label className="it-label">
            Full Name <span className="it-required">*</span>
          </label>

          <input
            type="text"
            placeholder="Enter your full name"
            autoComplete="name"
            className={`it-input ${
              errors.basicInformation?.fullName ? "error" : ""
            }`}
            {...register("basicInformation.fullName", {
              required: "Full Name is required",

              validate: (value) => {
                if (!value?.trim()) {
                  return "Full Name is required";
                }

                if (value.trim().length < 2) {
                  return "Full Name must contain at least 2 characters";
                }

                return true;
              },
            })}
          />

          {errors.basicInformation?.fullName && (
            <span className="it-error-msg">
              {String(errors.basicInformation.fullName.message)}
            </span>
          )}
        </div>

        {/* ========================================================
            EMAIL
        ======================================================== */}
        <div className="it-field-group">
          <label className="it-label">
            Email Address <span className="it-required">*</span>
          </label>

          <input
            type="email"
            placeholder="Enter your email address"
            autoComplete="email"
            className={`it-input ${
              errors.basicInformation?.email ? "error" : ""
            }`}
            {...register("basicInformation.email", {
              required: "Email Address is required",

              validate: (value) => {
                const email = value?.trim();

                if (!email) {
                  return "Email Address is required";
                }

                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                if (!emailPattern.test(email)) {
                  return "Please enter a valid email address";
                }

                return true;
              },
            })}
          />

          {errors.basicInformation?.email && (
            <span className="it-error-msg">
              {String(errors.basicInformation.email.message)}
            </span>
          )}
        </div>

        {/* ============================================================
            PHONE NUMBER
        ============================================================ */}
        <div className="it-field-group">
          <label className="it-label">
            Phone Number <span className="it-required">*</span>
          </label>

          <div
            className={`it-phone-container ${
              errors.basicInformation?.phoneNumber ? "error" : ""
            }`}
          >
            {/* FIXED INDIA PREFIX */}
            <div className="it-phone-prefix it-fixed-country">
              <span className="it-country-text">IN</span>

              <span className="it-country-code">+91</span>
            </div>

            <div className="it-phone-divider" />

            {/* ACTUAL PHONE NUMBER */}
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel-national"
              placeholder="Enter a number"
              className="it-phone-input"
              maxLength={10}
              {...register("basicInformation.phoneNumber", {
                required: "Phone Number is required",

                onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
                  event.target.value = event.target.value
                    .replace(/\D/g, "")
                    .slice(0, 10);
                },

                validate: (value) => {
                  const phone = value?.replace(/\D/g, "");

                  if (!phone) {
                    return "Phone Number is required";
                  }

                  if (phone.length !== 10) {
                    return "Phone number must be 10 digits";
                  }

                  if (!/^[6-9]\d{9}$/.test(phone)) {
                    return "Please enter a valid 10-digit mobile number";
                  }

                  return true;
                },
              })}
            />
          </div>

          {errors.basicInformation?.phoneNumber && (
            <span className="it-error-msg">
              {String(errors.basicInformation.phoneNumber.message)}
            </span>
          )}

          <p className="it-field-hint">Enter your 10-digit mobile number</p>
        </div>

        {/* ========================================================
            ALTERNATE PHONE
        ======================================================== */}
        <div className="it-field-group">
          <label className="it-label">Alternate Phone Number</label>

          <input
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            placeholder="Enter alternate phone number"
            className="it-input"
            {...register("basicInformation.alternativePhone", {
              validate: (value) => {
                if (!value?.trim()) {
                  return true;
                }

                const phone = value.replace(/\D/g, "");

                if (phone.length < 10) {
                  return "Alternate phone number must contain at least 10 digits";
                }

                if (phone.length > 15) {
                  return "Alternate phone number cannot exceed 15 digits";
                }

                return true;
              },
            })}
          />

          {errors.basicInformation?.alternativePhone && (
            <span className="it-error-msg">
              {String(errors.basicInformation.alternativePhone.message)}
            </span>
          )}
        </div>

        {/* ========================================================
            POSITION APPLIED FOR
        ======================================================== */}
        <div className="it-field-group">
          <label className="it-label">
            Position Applied For <span className="it-required">*</span>
          </label>

          <div className="it-select-wrapper">
            <select
              className={`it-select ${
                errors.basicInformation?.positionApplied ? "error" : ""
              }`}
              disabled={isLoadingDesignations || designations.length === 0}
              {...register("basicInformation.positionApplied", {
                required: "Position Applied For is required",

                validate: (value) => {
                  if (!value?.trim()) {
                    return "Position Applied For is required";
                  }

                  return true;
                },
              })}
            >
              <option value="">
                {isLoadingDesignations
                  ? "Loading positions..."
                  : designationError
                    ? "Unable to load positions"
                    : "Select position"}
              </option>

              {designations.map((designation) => (
                <option
                  key={designation.id}
                  value={designation.name}
                >
                  {designation.name}
                </option>
              ))}
            </select>
          </div>

          {designationError && (
            <span className="it-error-msg">
              {designationError}
            </span>
          )}

          {errors.basicInformation?.positionApplied && (
            <span className="it-error-msg">
              {String(errors.basicInformation.positionApplied.message)}
            </span>
          )}
        </div>

        {/* ========================================================
            DATE OF APPLICATION
        ======================================================== */}
        <div className="it-field-group">
          <label className="it-label">
            Date of Application <span className="it-required">*</span>
          </label>

          <div className="it-input-with-icon">
            <input
              type="date"
              readOnly
              id="dateOfApplication"
              className={`it-input it-input-readonly ${
                errors.basicInformation?.dateOfApplication ? "error" : ""
              }`}
              {...register("basicInformation.dateOfApplication", {
                required: "Date of Application is required",

                validate: (value) => {
                  if (!value) {
                    return "Date of Application is required";
                  }

                  return true;
                },
              })}
            />

            <span
              className="it-input-adornment"
              style={{
                cursor: "default",
                pointerEvents: "none",
              }}
            >
              <Calendar size={20} strokeWidth={2} color="#888" />
            </span>
          </div>

          {errors.basicInformation?.dateOfApplication && (
            <span className="it-error-msg">
              {String(errors.basicInformation.dateOfApplication.message)}
            </span>
          )}
        </div>

        {/* ========================================================
            RESUME
        ======================================================== */}
        <div className="it-field-group it-col-full">
          <label className="it-label">
            Resume (CV) <span className="it-required">*</span>
          </label>

          <div
            className={`it-file-upload-wrapper ${
              errors.basicInformation?.resume ? "error" : ""
            }`}
          >
            <label className="it-file-label">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="it-file-hidden"
                {...register("basicInformation.resume", {
                  required: "Resume is required",

                  validate: (files) => {
                    if (!files || files.length === 0) {
                      return "Resume is required";
                    }

                    const file = files[0];

                    if (file.size > MAX_RESUME_SIZE) {
                      return "Resume file size must not exceed 5MB";
                    }

                    const fileName = file.name.toLowerCase();

                    const isAllowed = ALLOWED_RESUME_EXTENSIONS.some(
                      (extension) => fileName.endsWith(extension),
                    );

                    if (!isAllowed) {
                      return "Only PDF, DOC and DOCX files are allowed";
                    }

                    return true;
                  },
                })}
              />

              <div className="it-file-button">
                <Paperclip size={18} strokeWidth={2} color="#333" />

                <span>Choose File</span>
              </div>

              <div className="it-file-name">{fileName}</div>
            </label>
          </div>

          <p className="it-file-hint">
            Upload your updated resume (PDF/DOC/DOCX, Max 5MB)
          </p>

          {errors.basicInformation?.resume && (
            <span className="it-error-msg">
              {String(errors.basicInformation.resume.message)}
            </span>
          )}
        </div>
      </div>
    </section>
  );
};

export default BasicInformation;