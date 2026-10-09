import { useState, useCallback } from "react";
import {
  CalendarDays,
  Check,
  Droplets,
  Heart,
  MapPin,
  Pencil,
  UserRound,
  X,
} from "lucide-react";

import type { ProfileField } from "../../types/profile.types.ts";
import "./PersonalInfo.css";

interface PersonalInfoProps {
  fields: ProfileField[];
}

const PersonalInfo = ({ fields }: PersonalInfoProps): JSX.Element => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [savedFields, setSavedFields] = useState<ProfileField[]>(fields);
  const [editedFields, setEditedFields] = useState<ProfileField[]>(fields);

  const getIcon = useCallback((label: string): JSX.Element => {
    switch (label) {
      case "Date of Birth":
        return <CalendarDays size={12} strokeWidth={1.8} />;
      case "Nationality":
        return <UserRound size={12} strokeWidth={1.8} />;
      case "Marital Status":
        return <Heart size={12} strokeWidth={1.8} />;
      case "Blood Group":
        return <Droplets size={12} strokeWidth={1.8} />;
      case "Address":
        return <MapPin size={12} strokeWidth={1.8} />;
      default:
        return <UserRound size={12} strokeWidth={1.8} />;
    }
  }, []);

  const handleEdit = (): void => {
    setEditedFields(savedFields);
    setIsEditing(true);
  };

  const handleCancel = (): void => {
    setEditedFields(savedFields);
    setIsEditing(false);
  };

  const handleChange = (label: string, value: string): void => {
    setEditedFields((currentFields) =>
      currentFields.map((field) =>
        field.label === label ? { ...field, value } : field
      )
    );
  };

  const handleSave = (): void => {
    setSavedFields(editedFields);
    setIsEditing(false);
  };

  const displayFields = isEditing ? editedFields : savedFields;

  return (
    <section className="personal-info">
      <div className="personal-info__header">
        <div className="personal-info__title">
          <UserRound size={14} strokeWidth={1.8} aria-hidden="true" />
          <h3>Personal Information</h3>
        </div>

        <span className="personal-info__menu">•••</span>
      </div>

      <div className="personal-info__body">
        {displayFields.map((field) => (
          <div className="personal-info__row" key={field.label}>
            <div className="personal-info__label">
              <span className="personal-info__field-icon">
                {getIcon(field.label)}
              </span>
              <span className="personal-info__field-name">{field.label}</span>
            </div>

            {isEditing ? (
              <input
                type="text"
                className="personal-info__input"
                value={String(field.value ?? "")}
                onChange={(event) =>
                  handleChange(field.label, event.target.value)
                }
                aria-label={`Edit ${field.label}`}
              />
            ) : (
              <strong className="personal-info__value">{field.value}</strong>
            )}
          </div>
        ))}
      </div>

      <div className="personal-info__actions">
        {isEditing ? (
          <>
            <button
              type="button"
              className="personal-info__save"
              onClick={handleSave}
            >
              <Check size={10} strokeWidth={2} />
              <span>Save Changes</span>
            </button>

            <button
              type="button"
              className="personal-info__cancel"
              onClick={handleCancel}
            >
              <X size={10} strokeWidth={2} />
              <span>Cancel</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            className="personal-info__edit"
            onClick={handleEdit}
          >
            <Pencil size={9} strokeWidth={1.8} />
            <span>Edit Information</span>
          </button>
        )}
      </div>
    </section>
  );
};

export default PersonalInfo;