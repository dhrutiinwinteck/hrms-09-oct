import { useState, useCallback } from "react";
import {
  Banknote,
  Building2,
  Check,
  CreditCard,
  KeyRound,
  Pencil,
  WalletCards,
  X,
} from "lucide-react";

import type { ProfileField } from "../../types/profile.types.ts";
import "./BankInfo.css";

interface BankInfoProps {
  fields: ProfileField[];
}

const BankInfo = ({ fields }: BankInfoProps): JSX.Element => {
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [savedFields, setSavedFields] = useState<ProfileField[]>(fields);
  const [editedFields, setEditedFields] = useState<ProfileField[]>(fields);

  const getIcon = useCallback((label: string): JSX.Element => {
    switch (label) {
      case "Bank Name":
        return <Banknote size={10} strokeWidth={1.8} />;
      case "Account Number":
        return <CreditCard size={10} strokeWidth={1.8} />;
      case "IFSC Code":
        return <KeyRound size={10} strokeWidth={1.8} />;
      case "Account Type":
        return <WalletCards size={10} strokeWidth={1.8} />;
      case "Branch":
        return <Building2 size={10} strokeWidth={1.8} />;
      default:
        return <Banknote size={10} strokeWidth={1.8} />;
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
    <section className="bank-info">
      <div className="bank-info__header">
        <div className="bank-info__title">
          <span className="bank-info__title-icon">
            <Banknote size={13} strokeWidth={1.8} />
          </span>
          <h3>Bank Information</h3>
        </div>

        <button
          type="button"
          className="bank-info__more"
          aria-label="More bank options"
        >
          •••
        </button>
      </div>

      <div className="bank-info__body">
        {displayFields.map((field) => (
          <div className="bank-info__row" key={field.label}>
            <div className="bank-info__label">
              <span className="bank-info__row-icon">
                {getIcon(field.label)}
              </span>
              <span>{field.label}</span>
            </div>

            {isEditing ? (
              <input
                type="text"
                className="bank-info__input"
                value={String(field.value ?? "")}
                onChange={(event) =>
                  handleChange(field.label, event.target.value)
                }
              />
            ) : (
              <strong>{field.value}</strong>
            )}
          </div>
        ))}
      </div>

      <div className="bank-info__actions">
        {isEditing ? (
          <>
            <button
              type="button"
              className="bank-info__save"
              onClick={handleSave}
            >
              <Check size={9} />
              <span>Save</span>
            </button>

            <button
              type="button"
              className="bank-info__cancel"
              onClick={handleCancel}
            >
              <X size={9} />
              <span>Cancel</span>
            </button>
          </>
        ) : (
          <button
            type="button"
            className="bank-info__edit"
            onClick={handleEdit}
          >
            <Pencil size={9} />
            <span>Edit Information</span>
          </button>
        )}
      </div>
    </section>
  );
};

export default BankInfo;