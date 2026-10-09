import React from 'react';
import { useFormContext } from 'react-hook-form';

import Input from '../../../../components/ui/Input/Input';

import './EmergencyContacts.css';

interface EmergencyContact {
  fullName: string;
  relationship: string;
  phoneNumber: string;
  emailAddress: string;
  address: string;
}

interface EmergencyContactsFormData {
  emergencyContacts: {
    contact1: EmergencyContact;
    contact2?: EmergencyContact | null;
  };
}

const EmergencyContacts: React.FC = () => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<EmergencyContactsFormData>();

  const contact2Exists = watch(
    'emergencyContacts.contact2'
  );

  /**
   * Add or remove Emergency Contact 2.
   *
   * When removing Contact 2, all of its values are
   * cleared so stale form data cannot remain.
   */
  const toggleContact2 = (): void => {
    if (contact2Exists) {
      setValue(
        'emergencyContacts.contact2',
        null,
        {
          shouldDirty: true,
          shouldValidate: false,
        }
      );

      return;
    }

    setValue(
      'emergencyContacts.contact2',
      {
        fullName: '',
        relationship: '',
        phoneNumber: '',
        emailAddress: '',
        address: '',
      },
      {
        shouldDirty: true,
        shouldValidate: false,
      }
    );
  };

  return (
    <div className="emergency-contacts">

      {/* ============================================
          TITLE
          ============================================ */}

      <h2 className="step-title">
        Emergency Contacts
      </h2>

      <p className="step-description">
        Please provide emergency contact person details.
      </p>


      {/* ============================================
          EMERGENCY CONTACT 1
          ============================================ */}

      <div className="contact-card">

        <h3 className="contact-title">
          Emergency Contact 
        </h3>

        <div className="form-grid">

          {/* ==========================================
              FULL NAME
              ========================================== */}

          <div className="form-group">

            <Input
              label="Full Name"
              required
              placeholder="Enter full name"
              {...register(
                'emergencyContacts.contact1.fullName'
              )}
              error={
                errors.emergencyContacts
                  ?.contact1
                  ?.fullName
                  ?.message as string
              }
            />

          </div>


          {/* ==========================================
              RELATIONSHIP - TEXT INPUT
              ========================================== */}

          <div className="form-group">

            <label
              htmlFor="contact1Relationship"
              className="input-label"
            >
              Relationship{' '}
              <span className="input-required">
                *
              </span>
            </label>

            <input
              id="contact1Relationship"
              type="text"
              className="form-text-input"
              placeholder="Enter relationship"
              autoComplete="off"
              {...register(
                'emergencyContacts.contact1.relationship'
              )}
            />

            {errors.emergencyContacts
              ?.contact1
              ?.relationship && (
              <p className="input-error-text">
                {
                  errors.emergencyContacts
                    .contact1
                    .relationship
                    .message as string
                }
              </p>
            )}

          </div>


          {/* ==========================================
              PHONE NUMBER
              ========================================== */}

          <div className="form-group">

            <Input
              label="Phone Number"
              required
              placeholder="Enter phone number"
              {...register(
                'emergencyContacts.contact1.phoneNumber'
              )}
              error={
                errors.emergencyContacts
                  ?.contact1
                  ?.phoneNumber
                  ?.message as string
              }
            />

          </div>


          {/* ==========================================
              EMAIL ADDRESS
              ========================================== */}

          <div className="form-group">

            <Input
              label="Email Address"
              type="email"
              placeholder="Enter email address"
              {...register(
                'emergencyContacts.contact1.emailAddress'
              )}
              error={
                errors.emergencyContacts
                  ?.contact1
                  ?.emailAddress
                  ?.message as string
              }
            />

          </div>


          {/* ==========================================
              ADDRESS
              ========================================== */}

          <div className="form-group full-width">

            <Input
              label="Address"
              required
              placeholder="Enter address"
              {...register(
                'emergencyContacts.contact1.address'
              )}
              error={
                errors.emergencyContacts
                  ?.contact1
                  ?.address
                  ?.message as string
              }
            />

          </div>

        </div>

      </div>


      {/* ============================================
          EMERGENCY CONTACT 2
          OPTIONAL
          ============================================ */}

      <div className="contact-card optional">

        <div className="optional-header">

          <div className="optional-title-wrapper">

            <h3 className="contact-title">
              Emergency Contact 
            </h3>

            <span className="optional-label">
              Optional
            </span>

          </div>

          <button
            type="button"
            className={`toggle-contact-btn ${
              contact2Exists
                ? 'remove-contact-btn'
                : 'add-contact-btn'
            }`}
            onClick={toggleContact2}
            aria-expanded={Boolean(contact2Exists)}
          >
            {contact2Exists
              ? '− Remove Contact'
              : '+ Add Emergency Contact '}
          </button>

        </div>


        {/* ==========================================
            CONTACT 2 FORM
            ========================================== */}

        {contact2Exists && (
          <div className="form-grid">

            {/* ========================================
                FULL NAME
                ======================================== */}

            <div className="form-group">

              <Input
                label="Full Name"
                placeholder="Enter full name"
                {...register(
                  'emergencyContacts.contact2.fullName'
                )}
                error={
                  errors.emergencyContacts
                    ?.contact2
                    ?.fullName
                    ?.message as string
                }
              />

            </div>


            {/* ========================================
                RELATIONSHIP - TEXT INPUT
                ======================================== */}

            <div className="form-group">

              <label
                htmlFor="contact2Relationship"
                className="input-label"
              >
                Relationship
              </label>

              <input
                id="contact2Relationship"
                type="text"
                className="form-text-input"
                placeholder="Enter relationship"
                autoComplete="off"
                {...register(
                  'emergencyContacts.contact2.relationship'
                )}
              />

              {errors.emergencyContacts
                ?.contact2
                ?.relationship && (
                <p className="input-error-text">
                  {
                    errors.emergencyContacts
                      .contact2
                      .relationship
                      .message as string
                  }
                </p>
              )}

            </div>


            {/* ========================================
                PHONE NUMBER
                ======================================== */}

            <div className="form-group">

              <Input
                label="Phone Number"
                placeholder="Enter phone number"
                {...register(
                  'emergencyContacts.contact2.phoneNumber'
                )}
                error={
                  errors.emergencyContacts
                    ?.contact2
                    ?.phoneNumber
                    ?.message as string
                }
              />

            </div>


            {/* ========================================
                EMAIL ADDRESS
                ======================================== */}

            <div className="form-group">

              <Input
                label="Email Address"
                type="email"
                placeholder="Enter email address"
                {...register(
                  'emergencyContacts.contact2.emailAddress'
                )}
                error={
                  errors.emergencyContacts
                    ?.contact2
                    ?.emailAddress
                    ?.message as string
                }
              />

            </div>


            {/* ========================================
                ADDRESS
                ======================================== */}

            <div className="form-group full-width">

              <Input
                label="Address"
                placeholder="Enter address"
                {...register(
                  'emergencyContacts.contact2.address'
                )}
                error={
                  errors.emergencyContacts
                    ?.contact2
                    ?.address
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

export default EmergencyContacts;