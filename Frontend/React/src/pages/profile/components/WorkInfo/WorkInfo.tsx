import { useState } from "react";
import {
  BriefcaseBusiness,
  Building2,
  Check,
  Mail,
  Pencil,
  Phone,
  UserRound,
  VenusAndMars,
  X,
} from "lucide-react";

import type { ProfileField } from "../../types/profile.types.ts";

import "./WorkInfo.css";

interface WorkInfoProps {
  fields: ProfileField[];
}

const WorkInfo = ({
  fields,
}: WorkInfoProps): JSX.Element => {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [savedFields, setSavedFields] =
    useState<ProfileField[]>(fields);

  const [editedFields, setEditedFields] =
    useState<ProfileField[]>(fields);

  const getIcon = (label: string): JSX.Element => {
    switch (label) {
      case "Phone":
        return (
          <Phone
            size={12}
            strokeWidth={1.8}
          />
        );

      case "Email":
        return (
          <Mail
            size={12}
            strokeWidth={1.8}
          />
        );

      case "Designation":
        return (
          <BriefcaseBusiness
            size={12}
            strokeWidth={1.8}
          />
        );

      case "Department":
        return (
          <Building2
            size={12}
            strokeWidth={1.8}
          />
        );

      case "Reports To":
        return (
          <UserRound
            size={12}
            strokeWidth={1.8}
          />
        );

      case "Gender":
        return (
          <VenusAndMars
            size={12}
            strokeWidth={1.8}
          />
        );

      default:
        return (
          <BriefcaseBusiness
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
    <section className="work-info">
      {/* Header */}
      <div className="work-info__header">
        <div className="work-info__title">
          <BriefcaseBusiness
            size={14}
            strokeWidth={1.8}
            aria-hidden="true"
          />

          <h3>Work Information</h3>
        </div>

        <span className="work-info__menu">
          •••
        </span>
      </div>

      {/* Fields */}
      <div className="work-info__body">
        {displayFields.map((field) => (
          <div
            className="work-info__row"
            key={field.label}
          >
            <div className="work-info__label">
              <span className="work-info__field-icon">
                {getIcon(field.label)}
              </span>

              <span className="work-info__field-name">
                {field.label}
              </span>
            </div>

            {isEditing ? (
              <input
                type="text"
                className="work-info__input"
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
              <strong className="work-info__value">
                {field.value}
              </strong>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="work-info__actions">
        {isEditing ? (
          <>
            <button
              type="button"
              className="work-info__save"
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
              className="work-info__cancel"
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
            className="work-info__edit"
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

export default WorkInfo;