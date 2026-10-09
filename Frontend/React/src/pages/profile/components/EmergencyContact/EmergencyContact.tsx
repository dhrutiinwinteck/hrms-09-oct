import { useState } from "react";
import {
  Check,
  MapPin,
  Pencil,
  Phone,
  ShieldAlert,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import type { ProfileField } from "../../types/profile.types.ts";

import "./EmergencyContact.css";

interface EmergencyContactProps {
  fields: ProfileField[];
}

const EmergencyContact = ({
  fields,
}: EmergencyContactProps): JSX.Element => {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [savedFields, setSavedFields] =
    useState<ProfileField[]>(fields);

  const [editedFields, setEditedFields] =
    useState<ProfileField[]>(fields);

  const getIcon = (label: string): JSX.Element => {
    switch (label) {
      case "Contact Name":
        return (
          <UserRound
            size={12}
            strokeWidth={1.8}
          />
        );

      case "Relationship":
        return (
          <UsersRound
            size={12}
            strokeWidth={1.8}
          />
        );

      case "Phone":
      case "Alternate Phone":
        return (
          <Phone
            size={12}
            strokeWidth={1.8}
          />
        );

      case "Address":
        return (
          <MapPin
            size={12}
            strokeWidth={1.8}
          />
        );

      default:
        return (
          <ShieldAlert
            size={12}
            strokeWidth={1.8}
          />
        );
    }
  };

  const handleEdit = (): void => {
    setEditedFields(savedFields);
    setIsEditing(true);
  };

  const handleCancel = (): void => {
    setEditedFields(savedFields);
    setIsEditing(false);
  };

  const handleChange = (
    label: string,
    value: string,
  ): void => {
    setEditedFields((currentFields) =>
      currentFields.map((field) =>
        field.label === label
          ? {
              ...field,
              value,
            }
          : field,
      ),
    );
  };

  const handleSave = (): void => {
    setSavedFields(editedFields);
    setIsEditing(false);
  };

  const displayFields = isEditing
    ? editedFields
    : savedFields;

  return (
    <section className="emergency-contact">
      {/* Header */}
      <div className="emergency-contact__header">
        <div className="emergency-contact__title">
          <ShieldAlert
            size={14}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <h3>Emergency Contact</h3>
        </div>

        <span className="emergency-contact__menu">
          •••
        </span>
      </div>

      {/* Fields */}
      <div className="emergency-contact__body">
        {displayFields.map((field) => (
          <div
            className="emergency-contact__row"
            key={field.label}
          >
            <div className="emergency-contact__label">
              <span className="emergency-contact__field-icon">
                {getIcon(field.label)}
              </span>

              <span className="emergency-contact__field-name">
                {field.label}
              </span>
            </div>

            {isEditing ? (
              <input
                type="text"
                className="emergency-contact__input"
                value={String(field.value ?? "")}
                onChange={(event) =>
                  handleChange(
                    field.label,
                    event.target.value,
                  )
                }
                aria-label={`Edit ${field.label}`}
              />
            ) : (
              <strong className="emergency-contact__value">
                {field.value}
              </strong>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="emergency-contact__actions">
        {isEditing ? (
          <>
            <button
              type="button"
              className="emergency-contact__save"
              onClick={handleSave}
            >
              <Check
                size={10}
                strokeWidth={2}
              />

              <span>Save Changes</span>
            </button>

            <button
              type="button"
              className="emergency-contact__cancel"
              onClick={handleCancel}
            >
              <X
                size={10}
                strokeWidth={2}
              />

              <span>Cancel</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            className="emergency-contact__edit"
            onClick={handleEdit}
          >
            <Pencil
              size={9}
              strokeWidth={1.8}
            />

            <span>Edit Information</span>
          </button>
        )}
      </div>
    </section>
  );
};

export default EmergencyContact;