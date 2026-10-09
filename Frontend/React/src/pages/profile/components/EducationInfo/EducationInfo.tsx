import { useState } from "react";
import {
  Check,
  GraduationCap,
  Plus,
  X,
} from "lucide-react";

import type { EducationRecord } from "../../types/profile.types.ts";

import "./EducationInfo.css";

interface EducationInfoProps {
  records: EducationRecord[];
}

const EducationInfo = ({
  records,
}: EducationInfoProps): JSX.Element => {
  const [isEditing, setIsEditing] =
    useState<boolean>(false);

  const [savedRecords, setSavedRecords] =
    useState<EducationRecord[]>(records);

  const [editedRecords, setEditedRecords] =
    useState<EducationRecord[]>(records);

  const handleEdit = (): void => {
    setEditedRecords(savedRecords);
    setIsEditing(true);
  };

  const handleCancel = (): void => {
    setEditedRecords(savedRecords);
    setIsEditing(false);
  };

  const handleSave = (): void => {
    setSavedRecords(editedRecords);
    setIsEditing(false);
  };

  const handleChange = (
    index: number,
    field: keyof EducationRecord,
    value: string,
  ): void => {
    setEditedRecords((current) =>
      current.map((record, recordIndex) =>
        recordIndex === index
          ? {
              ...record,
              [field]: value,
            }
          : record,
      ),
    );
  };

  const handleAddEducation = (): void => {
    setEditedRecords((current) => [
      ...current,
      {
        degree: "",
        institution: "",
        yearOfPassing: "",
        percentage: "",
      },
    ]);
  };

  const displayRecords = isEditing
    ? editedRecords
    : savedRecords;

  return (
    <section className="education-info">
      <div className="education-info__header">
        <div className="education-info__title">
          <span className="education-info__title-icon">
            <GraduationCap
              size={13}
              strokeWidth={1.8}
            />
          </span>

          <h3>Education Information</h3>
        </div>

        <button
          type="button"
          className="education-info__more"
          aria-label="More education options"
        >
          •••
        </button>
      </div>

      <div className="education-info__table-wrapper">
        <table className="education-info__table">
          <thead>
            <tr>
              <th>Degree</th>
              <th>Institution</th>
              <th>Year of Passing</th>
              <th>Percentage</th>
            </tr>
          </thead>

          <tbody>
            {displayRecords.map((record, index) => (
              <tr
                key={`${index}-${record.degree}`}
              >
                <td>
                  {isEditing ? (
                    <input
                      value={record.degree}
                      onChange={(event) =>
                        handleChange(
                          index,
                          "degree",
                          event.target.value,
                        )
                      }
                    />
                  ) : (
                    record.degree
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <input
                      value={record.institution}
                      onChange={(event) =>
                        handleChange(
                          index,
                          "institution",
                          event.target.value,
                        )
                      }
                    />
                  ) : (
                    record.institution
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <input
                      value={record.yearOfPassing}
                      onChange={(event) =>
                        handleChange(
                          index,
                          "yearOfPassing",
                          event.target.value,
                        )
                      }
                    />
                  ) : (
                    record.yearOfPassing
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <input
                      value={record.percentage}
                      onChange={(event) =>
                        handleChange(
                          index,
                          "percentage",
                          event.target.value,
                        )
                      }
                    />
                  ) : (
                    record.percentage
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="education-info__actions">
        {isEditing ? (
          <>
            <button
              type="button"
              className="education-info__save"
              onClick={handleSave}
            >
              <Check size={9} />
              Save
            </button>

            <button
              type="button"
              className="education-info__cancel"
              onClick={handleCancel}
            >
              <X size={9} />
              Cancel
            </button>

            <button
              type="button"
              className="education-info__add education-info__add--editing"
              onClick={handleAddEducation}
            >
              <Plus size={9} />
              Add Education
            </button>
          </>
        ) : (
          <button
            type="button"
            className="education-info__add"
            onClick={handleEdit}
          >
            <Plus size={9} />
            Add Education
          </button>
        )}
      </div>
    </section>
  );
};

export default EducationInfo;