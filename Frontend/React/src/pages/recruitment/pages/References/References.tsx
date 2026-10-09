import React from 'react';
import {
  useFormContext,
  useWatch,
} from 'react-hook-form';

import Input from '../../../../components/ui/Input/Input';
import Button from '../../../../components/ui/Button/Button';

import './References.css';

/* ============================================================
   TYPES
============================================================ */

interface ReferenceItem {
  fullName: string;
  designation: string;
  companyOrganization: string;
  emailAddress: string;
  phoneNumber: string;
  relationship: string;
}

interface ReferencesFormData {
  references: {
    reference1: ReferenceItem;
    reference2: ReferenceItem | null;
  };
}

/* ============================================================
   DEFAULT REFERENCE
============================================================ */

const createEmptyReference = (): ReferenceItem => ({
  fullName: '',
  designation: '',
  companyOrganization: '',
  emailAddress: '',
  phoneNumber: '',
  relationship: '',
});

/* ============================================================
   COMPONENT
============================================================ */

const References: React.FC = () => {
  const {
    register,
    control,
    formState: { errors },
    setValue,
  } = useFormContext<ReferencesFormData>();

  /* ==========================================================
     WATCH ONLY REFERENCE 2
     
     Reference 1 does not need to be watched because there is
     no success message on this page anymore.
  ========================================================== */

  const reference2 = useWatch({
    control,
    name: 'references.reference2',
  });

  /* ============================================================
     ADD REFERENCE 2
  ============================================================ */

  const handleAddReference2 = (): void => {
    setValue(
      'references.reference2',
      createEmptyReference(),
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      }
    );
  };

  /* ============================================================
     REMOVE REFERENCE 2
  ============================================================ */

  const handleRemoveReference2 = (): void => {
    setValue(
      'references.reference2',
      null,
      {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: false,
      }
    );
  };

  /* ============================================================
     RENDER
  ============================================================ */

  return (
    <div className="references">

      {/* ======================================================
          TITLE
      ====================================================== */}

      <h2 className="step-title">
        References
      </h2>

      <p className="step-description">
        Please provide professional references. (Optional)
      </p>

      {/* ======================================================
          REFERENCE 1
      ====================================================== */}

      <div className="reference-card">

        <h3 className="reference-title">
          Reference 1
        </h3>

        <div className="form-grid">

          {/* ==================================================
              FULL NAME
          ================================================== */}

          <div className="form-group">
            <Input
              label="Full Name"
              placeholder="Enter full name"
              {...register(
                'references.reference1.fullName'
              )}
              error={
                errors.references
                  ?.reference1
                  ?.fullName
                  ?.message as string
              }
            />
          </div>

          {/* ==================================================
              DESIGNATION
          ================================================== */}

          <div className="form-group">
            <Input
              label="Designation"
              placeholder="Enter designation"
              {...register(
                'references.reference1.designation'
              )}
              error={
                errors.references
                  ?.reference1
                  ?.designation
                  ?.message as string
              }
            />
          </div>

          {/* ==================================================
              COMPANY / ORGANIZATION
          ================================================== */}

          <div className="form-group">
            <Input
              label="Company/Organization"
              placeholder="Enter company name"
              {...register(
                'references.reference1.companyOrganization'
              )}
              error={
                errors.references
                  ?.reference1
                  ?.companyOrganization
                  ?.message as string
              }
            />
          </div>

          {/* ==================================================
              EMAIL
          ================================================== */}

          <div className="form-group">
            <Input
              label="Email Address"
              type="email"
              placeholder="Enter email address"
              {...register(
                'references.reference1.emailAddress'
              )}
              error={
                errors.references
                  ?.reference1
                  ?.emailAddress
                  ?.message as string
              }
            />
          </div>

          {/* ==================================================
              PHONE
          ================================================== */}

          <div className="form-group">
            <Input
              label="Phone Number"
              type="tel"
              placeholder="Enter phone number"
              {...register(
                'references.reference1.phoneNumber'
              )}
              error={
                errors.references
                  ?.reference1
                  ?.phoneNumber
                  ?.message as string
              }
            />
          </div>

          {/* ==================================================
              RELATIONSHIP
          ================================================== */}

          <div className="form-group">
            <Input
              label="Relationship"
              placeholder="Enter relationship"
              {...register(
                'references.reference1.relationship'
              )}
              error={
                errors.references
                  ?.reference1
                  ?.relationship
                  ?.message as string
              }
            />
          </div>

        </div>
      </div>

      {/* ======================================================
          REFERENCE 2 OPTIONAL
      ====================================================== */}

      <div className="reference-card optional">

        <div className="optional-header">

          <h3 className="reference-title">
            Reference 2 (Optional)
          </h3>

          {!reference2 ? (
            <Button
              variant="primary"
              type="button"
              onClick={handleAddReference2}
            >
              + Add Reference 2
            </Button>
          ) : (
            <Button
              variant="secondary"
              type="button"
              onClick={handleRemoveReference2}
            >
              − Remove Reference 2
            </Button>
          )}

        </div>

        {/* ====================================================
            REFERENCE 2 FIELDS
        ==================================================== */}

        {reference2 && (
          <div className="form-grid">

            {/* ==================================================
                FULL NAME
            ================================================== */}

            <div className="form-group">
              <Input
                label="Full Name"
                placeholder="Enter full name"
                {...register(
                  'references.reference2.fullName'
                )}
                error={
                  errors.references
                    ?.reference2
                    ?.fullName
                    ?.message as string
                }
              />
            </div>

            {/* ==================================================
                DESIGNATION
            ================================================== */}

            <div className="form-group">
              <Input
                label="Designation"
                placeholder="Enter designation"
                {...register(
                  'references.reference2.designation'
                )}
                error={
                  errors.references
                    ?.reference2
                    ?.designation
                    ?.message as string
                }
              />
            </div>

            {/* ==================================================
                COMPANY / ORGANIZATION
            ================================================== */}

            <div className="form-group">
              <Input
                label="Company/Organization"
                placeholder="Enter company name"
                {...register(
                  'references.reference2.companyOrganization'
                )}
                error={
                  errors.references
                    ?.reference2
                    ?.companyOrganization
                    ?.message as string
                }
              />
            </div>

            {/* ==================================================
                EMAIL
            ================================================== */}

            <div className="form-group">
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter email address"
                {...register(
                  'references.reference2.emailAddress'
                )}
                error={
                  errors.references
                    ?.reference2
                    ?.emailAddress
                    ?.message as string
                }
              />
            </div>

            {/* ==================================================
                PHONE
            ================================================== */}

            <div className="form-group">
              <Input
                label="Phone Number"
                type="tel"
                placeholder="Enter phone number"
                {...register(
                  'references.reference2.phoneNumber'
                )}
                error={
                  errors.references
                    ?.reference2
                    ?.phoneNumber
                    ?.message as string
                }
              />
            </div>

            {/* ==================================================
                RELATIONSHIP
            ================================================== */}

            <div className="form-group">
              <Input
                label="Relationship"
                placeholder="Enter relationship"
                {...register(
                  'references.reference2.relationship'
                )}
                error={
                  errors.references
                    ?.reference2
                    ?.relationship
                    ?.message as string
                }
              />
            </div>

          </div>
        )}

      </div>

    </div>
  );
};

export default References;