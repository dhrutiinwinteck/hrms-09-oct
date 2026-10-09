import React, { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { CalendarDays } from "lucide-react";

import Input from "../../../../components/ui/Input/Input";
import recruitmentService from "../../services/recruitmentService";

import "./PersonalDetails.css";

interface PersonalDetailsFormData {
  personalDetails: {
    dateOfBirth: string;
    gender: string;
    maritalStatus: string;
    nationality: string;
    aadharNumber: string;
    panNumber: string;
    currentAddress: string;
    permanentAddress: string;
  };
}

const PersonalDetails: React.FC = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<PersonalDetailsFormData>();

  const [genders, setGenders] = useState<string[]>([
    "Male",
    "Female",
    "Other",
  ]);

  const [maritalStatuses, setMaritalStatuses] = useState<string[]>([
    "Married",
    "Unmarried",
    "Divorced",
    "Widowed",
  ]);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async (): Promise<void> => {
      try {
        const [gendersRes, maritalRes] = await Promise.all([
          recruitmentService.getGenders(),
          recruitmentService.getMaritalStatuses(),
        ]);

        if (!isMounted) {
          return;
        }

        if (gendersRes.success && gendersRes.data) {
          setGenders(gendersRes.data);
        }

        if (maritalRes.success && maritalRes.data) {
          setMaritalStatuses(maritalRes.data);
        }
      } catch (error) {
        console.error(
          "Failed to load personal details options:",
          error
        );
      }
    };

    void fetchData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="personal-details">

      {/* ============================================
          TITLE
          ============================================ */}
      <h2 className="step-title">
        Personal Details
      </h2>

      <p className="step-description">
        Please provide your personal and identification
        details.
      </p>

      <div className="form-grid">

        {/* ============================================
            DATE OF BIRTH
            ============================================ */}
        <div className="form-group">

          <label
            htmlFor="dateOfBirth"
            className="input-label"
          >
            Date of Birth{" "}
            <span className="input-required">
              *
            </span>
          </label>

          <div className="date-input-wrapper">

            <input
              id="dateOfBirth"
              type="date"
              className="date-input"
              {...register(
                "personalDetails.dateOfBirth"
              )}
            />

            <CalendarDays
              className="date-input-icon"
              size={20}
              strokeWidth={1.8}
              aria-hidden="true"
            />

          </div>

          {errors.personalDetails?.dateOfBirth && (
            <p className="input-error-text">
              {
                errors.personalDetails.dateOfBirth
                  .message as string
              }
            </p>
          )}

        </div>


        {/* ============================================
            GENDER
            ============================================ */}
        <div className="form-group">

          <label
            htmlFor="gender"
            className="input-label"
          >
            Gender{" "}
            <span className="input-required">
              *
            </span>
          </label>

          <select
            id="gender"
            className="form-select"
            {...register(
              "personalDetails.gender"
            )}
          >
            <option value="">
              Select gender
            </option>

            {genders.map((gender) => (
              <option
                key={gender}
                value={gender}
              >
                {gender}
              </option>
            ))}
          </select>

          {errors.personalDetails?.gender && (
            <p className="input-error-text">
              {
                errors.personalDetails.gender
                  .message as string
              }
            </p>
          )}

        </div>


        {/* ============================================
            MARITAL STATUS
            ============================================ */}
        <div className="form-group">

          <label
            htmlFor="maritalStatus"
            className="input-label"
          >
            Marital Status{" "}
            <span className="input-required">
              *
            </span>
          </label>

          <select
            id="maritalStatus"
            className="form-select"
            {...register(
              "personalDetails.maritalStatus"
            )}
          >
            <option value="">
              Select marital status
            </option>

            {maritalStatuses.map(
              (maritalStatus) => (
                <option
                  key={maritalStatus}
                  value={maritalStatus}
                >
                  {maritalStatus}
                </option>
              )
            )}
          </select>

          {errors.personalDetails
            ?.maritalStatus && (
            <p className="input-error-text">
              {
                errors.personalDetails
                  .maritalStatus
                  .message as string
              }
            </p>
          )}

        </div>


        {/* ============================================
            NATIONALITY - TEXT INPUT
            ============================================ */}
        <div className="form-group">

          <label
            htmlFor="nationality"
            className="input-label"
          >
            Nationality{" "}
            <span className="input-required">
              *
            </span>
          </label>

          <input
            id="nationality"
            type="text"
            className="form-text-input"
            placeholder="Enter nationality"
            autoComplete="country-name"
            {...register(
              "personalDetails.nationality"
            )}
          />

          {errors.personalDetails?.nationality && (
            <p className="input-error-text">
              {
                errors.personalDetails
                  .nationality
                  .message as string
              }
            </p>
          )}

        </div>


        {/* ============================================
            AADHAR NUMBER
            ============================================ */}
        <div className="form-group">

          <Input
            label="Aadhar Number"
            placeholder="Enter 12-digit Aadhar number"
            {...register(
              "personalDetails.aadharNumber"
            )}
            error={
              errors.personalDetails
                ?.aadharNumber
                ?.message as string
            }
          />

        </div>


        {/* ============================================
            PAN NUMBER - OPTIONAL
            ============================================ */}
        <div className="form-group">

          <Input
            label="PAN Number"
            placeholder="Enter PAN number (e.g., ABCDE1234F)"
            {...register(
              "personalDetails.panNumber"
            )}
            error={
              errors.personalDetails
                ?.panNumber
                ?.message as string
            }
          />

        </div>


        {/* ============================================
            CURRENT ADDRESS
            ============================================ */}
        <div className="form-group full-width">

          <Input
            label="Current Address"
            required
            placeholder="Enter your current address"
            {...register(
              "personalDetails.currentAddress"
            )}
            error={
              errors.personalDetails
                ?.currentAddress
                ?.message as string
            }
          />

        </div>


        {/* ============================================
            PERMANENT ADDRESS
            ============================================ */}
        <div className="form-group full-width">

          <Input
            label="Permanent Address"
            required
            placeholder="Enter your permanent address"
            {...register(
              "personalDetails.permanentAddress"
            )}
            error={
              errors.personalDetails
                ?.permanentAddress
                ?.message as string
            }
          />

        </div>

      </div>
    </div>
  );
};

export default PersonalDetails;