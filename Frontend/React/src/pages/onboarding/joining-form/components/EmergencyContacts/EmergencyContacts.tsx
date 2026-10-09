import React, { useEffect, useRef } from "react";

import {
  Plus,
  Trash2,
 
} from "lucide-react";

import type {
  EmergencyContactData,
} from "../../types/joiningForm.types";

import "./EmergencyContacts.css";

interface EmergencyContactsProps {
  data: EmergencyContactData[];

  onChange: (
    index: number,
    field: keyof EmergencyContactData,
    value: string
  ) => void;

  onAdd: () => void;

  onRemove: (index: number) => void;

  onBack: () => void;

  onNext: () => void;
}

export const EmergencyContacts: React.FC<
  EmergencyContactsProps
> = ({
  data,
  onChange,
  onAdd,
  onRemove,
  onBack,
  onNext,
}) => {
  /*
   * Automatically add the first emergency contact
   * when the user enters this section.
   *
   * The ref prevents repeated initialization
   * during the component lifecycle.
   */
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (
      data.length === 0 &&
      !hasInitialized.current
    ) {
      hasInitialized.current = true;
      onAdd();
    }
  }, [data.length, onAdd]);

  /*
   * Handle input changes.
   */
  const handleChange = (
    index: number,
    field: keyof EmergencyContactData
  ) => (
    event: React.ChangeEvent<
      HTMLInputElement |
      HTMLTextAreaElement |
      HTMLSelectElement
    >
  ): void => {
    onChange(
      index,
      field,
      event.target.value
    );
  };

  /*
   * Render component.
   */
  return (
    <section className="emergency-contacts-section">

      

      {/* =====================================================
          CONTACT LIST
      ===================================================== */}

      <div className="emergency-contacts-list">

        {data.map((contact, index) => (

          <div
            className="emergency-contact-card"
            key={contact.id ?? index}
          >

            {/* =================================================
                CARD HEADER
            ================================================= */}

            <div className="emergency-contact-card-header">

              <div className="emergency-contact-title">

                <span className="emergency-contact-number">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <div>

                  <h3>
                    Contact {index + 1}
                  </h3>

                  <p>
                    Add emergency contact information
                  </p>

                </div>

              </div>

              <button
                type="button"
                className="emergency-remove-button"
                onClick={() => onRemove(index)}
                aria-label={`Remove contact ${index + 1}`}
              >

                <Trash2 size={16} />

                <span>
                  Remove
                </span>

              </button>

            </div>

            {/* =================================================
                FORM
            ================================================= */}

            <div className="emergency-contact-grid">

              {/* FULL NAME */}

              <div className="emergency-form-group">

                <label
                  htmlFor={`emergency-full-name-${index}`}
                >
                  Full Name <span>*</span>
                </label>

                <input
                  id={`emergency-full-name-${index}`}
                  type="text"
                  value={contact.fullName}
                  onChange={handleChange(
                    index,
                    "fullName"
                  )}
                  placeholder="Enter full name"
                  autoComplete="name"
                />

              </div>

              {/* RELATIONSHIP */}

              <div className="emergency-form-group">

                <label
                  htmlFor={`emergency-relationship-${index}`}
                >
                  Relationship <span>*</span>
                </label>

                <select
                  id={`emergency-relationship-${index}`}
                  value={contact.relationship}
                  onChange={handleChange(
                    index,
                    "relationship"
                  )}
                >

                  <option value="">
                    Select relationship
                  </option>

                  <option value="Father">
                    Father
                  </option>

                  <option value="Mother">
                    Mother
                  </option>

                  <option value="Brother">
                    Brother
                  </option>

                  <option value="Sister">
                    Sister
                  </option>

                  <option value="Spouse">
                    Spouse
                  </option>

                  <option value="Friend">
                    Friend
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

              {/* PHONE NUMBER */}

              <div className="emergency-form-group">

                <label
                  htmlFor={`emergency-phone-${index}`}
                >
                  Phone Number <span>*</span>
                </label>

                <input
                  id={`emergency-phone-${index}`}
                  type="tel"
                  value={contact.phoneNumber}
                  onChange={handleChange(
                    index,
                    "phoneNumber"
                  )}
                  placeholder="Enter phone number"
                  inputMode="tel"
                  autoComplete="tel"
                />

              </div>

              {/* EMAIL */}

              <div className="emergency-form-group">

                <label
                  htmlFor={`emergency-email-${index}`}
                >
                  Email Address
                </label>

                <input
                  id={`emergency-email-${index}`}
                  type="email"
                  value={contact.emailAddress}
                  onChange={handleChange(
                    index,
                    "emailAddress"
                  )}
                  placeholder="Enter email address"
                  autoComplete="email"
                />

              </div>

              {/* ADDRESS */}

              <div className="emergency-form-group emergency-form-group-full">

                <label
                  htmlFor={`emergency-address-${index}`}
                >
                  Address
                </label>

                <textarea
                  id={`emergency-address-${index}`}
                  value={contact.address}
                  onChange={handleChange(
                    index,
                    "address"
                  )}
                  placeholder="Enter complete address"
                  rows={3}
                />

              </div>

            </div>

          </div>

        ))}

      </div>

      {/* =====================================================
          ADD ANOTHER CONTACT
      ===================================================== */}

      <div className="emergency-add-contact-wrapper">

        <button
          type="button"
          className="emergency-add-button"
          onClick={onAdd}
        >

          <Plus size={18} />

          <span>
            Add Another Contact
          </span>

        </button>

      </div>

      {/* =====================================================
          NAVIGATION ACTIONS
      ===================================================== */}

      <div className="emergency-contacts-actions">

        <button
          type="button"
          className="joining-secondary-button"
          onClick={onBack}
        >
          Back
        </button>

        <button
          type="button"
          className="joining-primary-button"
          onClick={onNext}
        >
          Next
        </button>

      </div>

    </section>
  );
};

export default EmergencyContacts;