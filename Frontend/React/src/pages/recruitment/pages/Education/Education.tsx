import React from 'react';
import {
  useFieldArray,
  useFormContext,
} from 'react-hook-form';

import Input from '../../../../components/ui/Input/Input';
import Button from '../../../../components/ui/Button/Button';

import './Education.css';

/* ============================================================
   TYPES
============================================================ */

interface EducationItem {
  qualification: string;
  specification: string;
  institute: string;
  passingYear: string;
  percentageCgpa: string;
  currentlyPursuing: boolean;
}

interface EducationFormData {
  educations: {
    educations: EducationItem[];
  };
}

/* ============================================================
   LIMITS
============================================================ */

const MIN_EDUCATION_ENTRIES = 2;
const MAX_EDUCATION_ENTRIES = 6;

/* ============================================================
   COMPONENT
============================================================ */

const Education: React.FC = () => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<EducationFormData>();

  const {
    fields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'educations.educations',
  });

  /* ============================================================
     ADD EDUCATION
  ============================================================ */

  const handleAddEducation = (): void => {
    if (fields.length >= MAX_EDUCATION_ENTRIES) {
      return;
    }

    append({
      qualification: '',
      specification: '',
      institute: '',
      passingYear: '',
      percentageCgpa: '',
      currentlyPursuing: false,
    });
  };

  /* ============================================================
     REMOVE EDUCATION
  ============================================================ */

  const handleRemoveEducation = (
    index: number
  ): void => {
    remove(index);
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="education">

      {/* ======================================================
          TITLE
      ====================================================== */}

      <h2 className="step-title">
        Education
      </h2>

      <p className="step-description">
        Please provide your educational background
        and qualifications.
      </p>

      {/* ======================================================
          EDUCATION RECORDS
      ====================================================== */}

      {fields.map((field, index) => (
        <div
          key={field.id}
          className="education-card"
        >

          {/* ==================================================
              EDUCATION HEADER
          ================================================== */}

          <div className="education-header">

            <h3>
              Education {index + 1}
            </h3>

            {fields.length > 1 && (
              <Button
                variant="danger"
                size="small"
                type="button"
                onClick={() =>
                  handleRemoveEducation(index)
                }
              >
                Remove
              </Button>
            )}

          </div>

          {/* ==================================================
              FORM GRID
          ================================================== */}

          <div className="form-grid">

            {/* ==================================================
                QUALIFICATION
            ================================================== */}

            <div className="form-group">

              <Input
                label="Qualification"
                required
                type="text"
                placeholder="Enter qualification"
                autoComplete="off"
                {...register(
                  `educations.educations.${index}.qualification`
                )}
                error={
                  errors.educations
                    ?.educations?.[index]
                    ?.qualification
                    ?.message as string
                }
              />

            </div>

            {/* ==================================================
                SPECIFICATION / STREAM
            ================================================== */}

            <div className="form-group">

              <Input
                label="Specification/Stream"
                required
                type="text"
                placeholder="Enter specification or stream"
                autoComplete="off"
                {...register(
                  `educations.educations.${index}.specification`
                )}
                error={
                  errors.educations
                    ?.educations?.[index]
                    ?.specification
                    ?.message as string
                }
              />

            </div>

            {/* ==================================================
                INSTITUTE / UNIVERSITY
            ================================================== */}

            <div className="form-group">

              <Input
                label="Institute/University"
                required
                type="text"
                placeholder="Enter institute or university name"
                autoComplete="organization"
                {...register(
                  `educations.educations.${index}.institute`
                )}
                error={
                  errors.educations
                    ?.educations?.[index]
                    ?.institute
                    ?.message as string
                }
              />

            </div>

            {/* ==================================================
                PASSING YEAR
            ================================================== */}

            <div className="form-group">

              <Input
                label="Passing Year"
                required
                type="text"
                placeholder="YYYY"
                inputMode="numeric"
                maxLength={4}
                autoComplete="off"
                {...register(
                  `educations.educations.${index}.passingYear`
                )}
                error={
                  errors.educations
                    ?.educations?.[index]
                    ?.passingYear
                    ?.message as string
                }
              />

            </div>

            {/* ==================================================
                PERCENTAGE / CGPA
            ================================================== */}

            <div className="form-group">

              <Input
                label="Percentage/CGPA"
                required
                type="text"
                placeholder="Enter percentage or CGPA"
                autoComplete="off"
                {...register(
                  `educations.educations.${index}.percentageCgpa`
                )}
                error={
                  errors.educations
                    ?.educations?.[index]
                    ?.percentageCgpa
                    ?.message as string
                }
              />

            </div>

            {/* ==================================================
                CURRENTLY PURSUING
            ================================================== */}

            <div className="form-group">

              <label className="checkbox-label">

                <input
                  type="checkbox"
                  {...register(
                    `educations.educations.${index}.currentlyPursuing`
                  )}
                />

                <span>
                  Currently pursuing
                </span>

              </label>

            </div>

          </div>
        </div>
      ))}

      {/* ======================================================
          ADD EDUCATION BUTTON

          Maximum 6 records.
      ====================================================== */}

      {fields.length < MAX_EDUCATION_ENTRIES && (
        <Button
          variant="secondary"
          type="button"
          onClick={handleAddEducation}
        >
          + Add Education
        </Button>
      )}

      {/* ======================================================
          INFORMATION
      ====================================================== */}

      <p className="education-limit-text">
        Minimum {MIN_EDUCATION_ENTRIES} education
        records are required. You can add up to{' '}
        {MAX_EDUCATION_ENTRIES} records.
      </p>

    </div>
  );
};

export default Education;