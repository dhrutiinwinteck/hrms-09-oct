import { useState } from "react";
import {
  BriefcaseBusiness,
  Check,
  Pencil,
  Plus,
  X,
} from "lucide-react";

import type { ExperienceRecord } from "../../types/profile.types.ts";
import "./ExperienceInfo.css";

interface ExperienceInfoProps {
  records: ExperienceRecord[];
}

const ExperienceInfo = ({
  records,
}: ExperienceInfoProps): JSX.Element => {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const [savedRecords, setSavedRecords] =
    useState<ExperienceRecord[]>(records);

  const [editedRecords, setEditedRecords] =
    useState<ExperienceRecord[]>(records);

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
    field: keyof ExperienceRecord,
    value: string,
  ): void => {
    setEditedRecords((currentRecords) =>
      currentRecords.map((record, recordIndex) =>
        recordIndex === index
          ? {
              ...record,
              [field]: value,
            }
          : record,
      ),
    );
  };

  const handleAddExperience = (): void => {
    setEditedRecords((currentRecords) => [
      ...currentRecords,
      {
        company: "",
        designation: "",
        from: "",
        to: "",
        totalExperience: "",
      },
    ]);

    setIsEditing(true);
  };

  const displayRecords = isEditing
    ? editedRecords
    : savedRecords;

  return (
    <section className="experience-info">
      {/* =========================================
          HEADER
      ========================================== */}
      <div className="experience-info__header">
        <div className="experience-info__title">
          <span className="experience-info__title-icon">
            <BriefcaseBusiness
              size={14}
              strokeWidth={1.8}
            />
          </span>

          <h3>Experience Information</h3>
        </div>

        <button
          type="button"
          className="experience-info__more"
          aria-label="More experience options"
        >
          •••
        </button>
      </div>

      {/* =========================================
          TABLE
      ========================================== */}
      <div className="experience-info__table-wrapper">
        <table className="experience-info__table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Designation</th>
              <th>From</th>
              <th>To</th>
              <th>Total Exp.</th>
            </tr>
          </thead>

          <tbody>
            {displayRecords.map((record, index) => (
              <tr
                key={`${index}-${record.company}-${record.from}`}
              >
                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      value={record.company}
                      onChange={(event) =>
                        handleChange(
                          index,
                          "company",
                          event.target.value,
                        )
                      }
                    />
                  ) : (
                    record.company
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      value={record.designation}
                      onChange={(event) =>
                        handleChange(
                          index,
                          "designation",
                          event.target.value,
                        )
                      }
                    />
                  ) : (
                    record.designation
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      value={record.from}
                      onChange={(event) =>
                        handleChange(
                          index,
                          "from",
                          event.target.value,
                        )
                      }
                    />
                  ) : (
                    record.from
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      value={record.to}
                      onChange={(event) =>
                        handleChange(
                          index,
                          "to",
                          event.target.value,
                        )
                      }
                    />
                  ) : (
                    record.to
                  )}
                </td>

                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      value={record.totalExperience}
                      onChange={(event) =>
                        handleChange(
                          index,
                          "totalExperience",
                          event.target.value,
                        )
                      }
                    />
                  ) : (
                    record.totalExperience
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* =========================================
          ACTIONS
      ========================================== */}
      <div className="experience-info__actions">
        {isEditing ? (
          <>
            <button
              type="button"
              className="experience-info__save"
              onClick={handleSave}
            >
              <Check size={9} />
              <span>Save</span>
            </button>

            <button
              type="button"
              className="experience-info__cancel"
              onClick={handleCancel}
            >
              <X size={9} />
              <span>Cancel</span>
            </button>

            <button
              type="button"
              className="experience-info__add experience-info__add--editing"
              onClick={handleAddExperience}
            >
              <Plus size={9} />
              <span>Add Experience</span>
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="experience-info__edit"
              onClick={handleEdit}
            >
              <Pencil size={9} />
              <span>Edit Information</span>
            </button>

            <button
              type="button"
              className="experience-info__add"
              onClick={handleAddExperience}
            >
              <Plus size={9} />
              <span>Add Experience</span>
            </button>
          </>
        )}
      </div>
    </section>
  );
};

export default ExperienceInfo;