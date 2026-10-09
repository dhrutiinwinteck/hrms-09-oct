import React, {
  useEffect,
  useState,
} from 'react';

import {
  useFieldArray,
  useFormContext,
} from 'react-hook-form';

import { CalendarDays } from 'lucide-react';

import Input from '../../../../components/ui/Input/Input';
import recruitmentService from '../../services/recruitmentService';

import './WorkExperience.css';

/* ============================================================
   TYPES
============================================================ */

interface WorkExperienceItem {
  companyName: string;
  jobTitle: string;
  employeeType: string;
  fromDate: string;
  toDate: string;
  currentlyWorking: boolean;
  keyResponsibilities: string;
}

interface WorkExperienceFormData {
  workExperiences: {
    isFresher: boolean;
    experiences: WorkExperienceItem[];
  };
}

/* ============================================================
   COMPONENT
============================================================ */

const WorkExperience: React.FC = () => {
  const {
    register,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<WorkExperienceFormData>();

  /* ============================================================
     EMPLOYEE TYPES
  ============================================================ */

  const [employeeTypes, setEmployeeTypes] =
    useState<string[]>([
      'Full Time',
      'Part Time',
      'Contract',
      'Internship',
    ]);

  /* ============================================================
     FIELD ARRAY
  ============================================================ */

  const {
    fields,
    append,
    remove,
  } = useFieldArray({
    control,
    name: 'workExperiences.experiences',
  });

  /* ============================================================
     FRESHER VALUE
  ============================================================ */

  const isFresher = Boolean(
    watch('workExperiences.isFresher')
  );

  /* ============================================================
     LOAD EMPLOYEE TYPES
  ============================================================ */

  useEffect(() => {
    let isMounted = true;

    const fetchEmployeeTypes = async (): Promise<void> => {
      try {
        const response =
          await recruitmentService.getEmployeeTypes();

        if (!isMounted) {
          return;
        }

        if (
          response.success &&
          response.data
        ) {
          setEmployeeTypes(response.data);
        }
      } catch (error) {
        console.error(
          'Failed to load employee types:',
          error
        );
      }
    };

    void fetchEmployeeTypes();

    return () => {
      isMounted = false;
    };
  }, []);

  /* ============================================================
     FRESHER CHECKBOX
     
     RULE:
     - If Fresher checked:
         Experiences are cleared.
     - If Fresher unchecked:
         At least one experience is required.
  ============================================================ */

  const fresherRegistration = register(
    'workExperiences.isFresher'
  );

  const handleFresherChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    const checked = event.target.checked;

    fresherRegistration.onChange(event);

    if (checked) {
      /*
       * Fresher selected.
       * Remove all existing experiences.
       */
      setValue(
        'workExperiences.experiences',
        [],
        {
          shouldDirty: true,
          shouldValidate: true,
        }
      );
    }
  };

  /* ============================================================
     ADD EXPERIENCE
     
     Clicking Add Experience creates Experience 1.
  ============================================================ */

  const handleAddExperience = (): void => {
    append({
      companyName: '',
      jobTitle: '',
      employeeType: '',
      fromDate: '',
      toDate: '',
      currentlyWorking: false,
      keyResponsibilities: '',
    });
  };

  /* ============================================================
     REMOVE EXPERIENCE
  ============================================================ */

  const handleRemoveExperience = (
    index: number
  ): void => {
    remove(index);
  };

  /* ============================================================
     DATE INPUT
     
     Only one custom calendar icon is displayed.
  ============================================================ */

  const renderDateInput = (
    index: number,
    fieldName: 'fromDate' | 'toDate',
    label: string,
    required = false
  ): React.ReactNode => {
    const fieldPath =
      `workExperiences.experiences.${index}.${fieldName}` as const;

    const fieldError =
      errors.workExperiences
        ?.experiences?.[index]
        ?.[fieldName]
        ?.message as string | undefined;

    const currentlyWorking = Boolean(
      watch(
        `workExperiences.experiences.${index}.currentlyWorking`
      )
    );

    return (
      <div className="form-group">
        <label
          htmlFor={`${fieldName}-${index}`}
          className="input-label"
        >
          {label}

          {required && (
            <>
              {' '}
              <span className="input-required">
                *
              </span>
            </>
          )}
        </label>

        <div className="date-input-wrapper">
          <input
            id={`${fieldName}-${index}`}
            type="date"
            className="date-input"
            disabled={
              fieldName === 'toDate' &&
              currentlyWorking
            }
            {...register(fieldPath)}
          />

          <CalendarDays
            className="date-input-icon"
            size={20}
            strokeWidth={1.8}
            aria-hidden="true"
          />
        </div>

        {fieldError && (
          <p className="input-error-text">
            {fieldError}
          </p>
        )}
      </div>
    );
  };

  /* ============================================================
     ARRAY LEVEL ERROR
     
     This error appears when:
       Fresher = false
       AND
       Experience count = 0
  ============================================================ */

  const experiencesError =
    errors.workExperiences
      ?.experiences
      ?.message;

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="work-experience">

      {/* ========================================================
          TITLE
      ======================================================== */}

      <h2 className="step-title">
        Work Experience
      </h2>

      <p className="step-description">
        Please provide your work experience details.
      </p>

      {/* ========================================================
          FRESHER CHECKBOX
      ======================================================== */}

      <div
        className={`fresher-checkbox ${
          experiencesError
            ? 'has-error'
            : ''
        }`}
      >
        <label className="checkbox-label">

          <input
            type="checkbox"
            name={fresherRegistration.name}
            ref={fresherRegistration.ref}
            onBlur={fresherRegistration.onBlur}
            onChange={handleFresherChange}
            checked={isFresher}
          />

          <span>
            I am a fresher / have no prior work experience
          </span>

        </label>

        {experiencesError && (
          <p className="input-error-text fresher-error">
            {experiencesError as string}
          </p>
        )}
      </div>

      {/* ========================================================
          EXPERIENCE SECTION

          Only visible when Fresher is NOT selected.
      ======================================================== */}

      {!isFresher && (
        <>

          {/* ====================================================
              EXISTING EXPERIENCES
          ==================================================== */}

          {fields.map(
            (field, index) => (
              <div
                key={field.id}
                className="experience-card"
              >

                {/* EXPERIENCE HEADER */}

                <div className="experience-header">

                  <h3>
                    Experience {index + 1}
                  </h3>

                  {fields.length > 1 && (
                    <button
                      type="button"
                      className="remove-experience-btn"
                      onClick={() =>
                        handleRemoveExperience(index)
                      }
                    >
                      Remove
                    </button>
                  )}

                </div>

                {/* FORM GRID */}

                <div className="form-grid">

                  {/* COMPANY NAME */}

                  <div className="form-group">
                    <Input
                      label="Company Name"
                      required
                      placeholder="Enter company name"
                      {...register(
                        `workExperiences.experiences.${index}.companyName`
                      )}
                      error={
                        errors
                          .workExperiences
                          ?.experiences?.[index]
                          ?.companyName
                          ?.message as string
                      }
                    />
                  </div>

                  {/* JOB TITLE */}

                  <div className="form-group">
                    <Input
                      label="Job Title"
                      required
                      placeholder="Enter job title"
                      {...register(
                        `workExperiences.experiences.${index}.jobTitle`
                      )}
                      error={
                        errors
                          .workExperiences
                          ?.experiences?.[index]
                          ?.jobTitle
                          ?.message as string
                      }
                    />
                  </div>

                  {/* EMPLOYEE TYPE */}

                  <div className="form-group">

                    <label className="input-label">
                      Employee Type{' '}
                      <span className="input-required">
                        *
                      </span>
                    </label>

                    <select
                      className="form-select"
                      {...register(
                        `workExperiences.experiences.${index}.employeeType`
                      )}
                    >
                      <option value="">
                        Select employee type
                      </option>

                      {employeeTypes.map(
                        (type) => (
                          <option
                            key={type}
                            value={type}
                          >
                            {type}
                          </option>
                        )
                      )}
                    </select>

                    {errors
                      .workExperiences
                      ?.experiences?.[index]
                      ?.employeeType && (
                      <p className="input-error-text">
                        {
                          errors
                            .workExperiences
                            .experiences[index]
                            .employeeType
                            .message as string
                        }
                      </p>
                    )}

                  </div>

                  {/* FROM DATE */}

                  {renderDateInput(
                    index,
                    'fromDate',
                    'From Date',
                    true
                  )}

                  {/* CURRENTLY WORKING */}

                  <div className="form-group currently-working-group">

                    <label className="checkbox-label">

                      <input
                        type="checkbox"
                        {...register(
                          `workExperiences.experiences.${index}.currentlyWorking`
                        )}
                        onChange={(event) => {
                          const checked =
                            event.target.checked;

                          setValue(
                            `workExperiences.experiences.${index}.currentlyWorking`,
                            checked,
                            {
                              shouldDirty: true,
                              shouldValidate: true,
                            }
                          );

                          if (checked) {
                            setValue(
                              `workExperiences.experiences.${index}.toDate`,
                              '',
                              {
                                shouldDirty: true,
                                shouldValidate: false,
                              }
                            );
                          }
                        }}
                      />

                      <span>
                        Currently working here
                      </span>

                    </label>

                  </div>

                  {/* TO DATE */}

                  {renderDateInput(
                    index,
                    'toDate',
                    'To Date'
                  )}

                  {/* KEY RESPONSIBILITIES */}

                  <div className="form-group full-width">

                    <label className="input-label">
                      Key Responsibilities{' '}
                      <span className="input-required">
                        *
                      </span>
                    </label>

                    <textarea
                      className="form-textarea"
                      rows={4}
                      placeholder="Enter key responsibilities"
                      {...register(
                        `workExperiences.experiences.${index}.keyResponsibilities`
                      )}
                    />

                    {errors
                      .workExperiences
                      ?.experiences?.[index]
                      ?.keyResponsibilities && (
                      <p className="input-error-text">
                        {
                          errors
                            .workExperiences
                            .experiences[index]
                            .keyResponsibilities
                            .message as string
                        }
                      </p>
                    )}

                  </div>

                </div>
              </div>
            )
          )}

          {/* ====================================================
              ADD EXPERIENCE

              This button remains available when Fresher
              is not selected.
          ==================================================== */}

          <button
            type="button"
            className="add-experience-btn"
            onClick={handleAddExperience}
          >
            + Add Experience
          </button>

        </>
      )}

    </div>
  );
};

export default WorkExperience;