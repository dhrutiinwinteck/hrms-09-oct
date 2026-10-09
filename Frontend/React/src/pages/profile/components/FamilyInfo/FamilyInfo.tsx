import { useState } from "react";
import {
  Check,
  Plus,
  UsersRound,
  X,
} from "lucide-react";

import type { FamilyMember } from "../../types/profile.types.ts";
import "./FamilyInfo.css";

interface FamilyInfoProps {
  members: FamilyMember[];
}

const FamilyInfo = ({
  members,
}: FamilyInfoProps): JSX.Element => {
  const [isEditing, setIsEditing] =
    useState<boolean>(false);

  const [savedMembers, setSavedMembers] =
    useState<FamilyMember[]>(members);

  const [editedMembers, setEditedMembers] =
    useState<FamilyMember[]>(members);

  const handleEdit = (): void => {
    setEditedMembers(savedMembers);
    setIsEditing(true);
  };

  const handleCancel = (): void => {
    setEditedMembers(savedMembers);
    setIsEditing(false);
  };

  const handleSave = (): void => {
    setSavedMembers(editedMembers);
    setIsEditing(false);
  };

  const handleChange = (
    index: number,
    field: keyof FamilyMember,
    value: string,
  ): void => {
    setEditedMembers((current) =>
      current.map((member, memberIndex) =>
        memberIndex === index
          ? {
              ...member,
              [field]: value,
            }
          : member,
      ),
    );
  };

  const handleAddMember = (): void => {
    setEditedMembers((current) => [
      ...current,
      {
        name: "",
        relationship: "",
        dateOfBirth: "",
        occupation: "",
      },
    ]);
  };

  const displayMembers = isEditing
    ? editedMembers
    : savedMembers;

  return (
    <section className="family-info">
      {/* =====================================================
          HEADER
      ====================================================== */}

      <div className="family-info__header">
        <div className="family-info__title">
          <span className="family-info__title-icon">
            <UsersRound
              size={13}
              strokeWidth={1.8}
              aria-hidden="true"
            />
          </span>

          <h3>Family Information</h3>
        </div>

        <button
          type="button"
          className="family-info__more"
          aria-label="More family options"
        >
          •••
        </button>
      </div>

      {/* =====================================================
          TABLE
      ====================================================== */}

      <div className="family-info__table-wrapper">
        <table className="family-info__table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Relationship</th>
              <th>Date of Birth</th>
              <th>Occupation</th>
            </tr>
          </thead>

          <tbody>
            {displayMembers.map((member, index) => (
              <tr
                key={`${index}-${member.name}`}
              >
                {/* NAME */}

                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      value={member.name}
                      onChange={(event) =>
                        handleChange(
                          index,
                          "name",
                          event.target.value,
                        )
                      }
                      aria-label={`Family member ${index + 1} name`}
                    />
                  ) : (
                    member.name
                  )}
                </td>

                {/* RELATIONSHIP */}

                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      value={member.relationship}
                      onChange={(event) =>
                        handleChange(
                          index,
                          "relationship",
                          event.target.value,
                        )
                      }
                      aria-label={`Family member ${index + 1} relationship`}
                    />
                  ) : (
                    member.relationship
                  )}
                </td>

                {/* DATE OF BIRTH */}

                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      value={member.dateOfBirth}
                      onChange={(event) =>
                        handleChange(
                          index,
                          "dateOfBirth",
                          event.target.value,
                        )
                      }
                      aria-label={`Family member ${index + 1} date of birth`}
                    />
                  ) : (
                    member.dateOfBirth
                  )}
                </td>

                {/* OCCUPATION */}

                <td>
                  {isEditing ? (
                    <input
                      type="text"
                      value={member.occupation}
                      onChange={(event) =>
                        handleChange(
                          index,
                          "occupation",
                          event.target.value,
                        )
                      }
                      aria-label={`Family member ${index + 1} occupation`}
                    />
                  ) : (
                    member.occupation
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* =====================================================
          ACTIONS
      ====================================================== */}

      <div className="family-info__actions">
        {isEditing ? (
          <>
            {/* SAVE */}

            <button
              type="button"
              className="family-info__save"
              onClick={handleSave}
            >
              <Check
                size={9}
                strokeWidth={2}
                aria-hidden="true"
              />
              Save
            </button>

            {/* CANCEL */}

            <button
              type="button"
              className="family-info__cancel"
              onClick={handleCancel}
            >
              <X
                size={9}
                strokeWidth={2}
                aria-hidden="true"
              />
              Cancel
            </button>

            {/* ADD MEMBER */}

            <button
              type="button"
              className="family-info__add family-info__add--editing"
              onClick={handleAddMember}
            >
              <Plus
                size={9}
                strokeWidth={2}
                aria-hidden="true"
              />
              Add Member
            </button>
          </>
        ) : (
          /* ADD FAMILY MEMBER */

          <button
            type="button"
            className="family-info__add"
            onClick={handleEdit}
          >
            <Plus
              size={9}
              strokeWidth={2}
              aria-hidden="true"
            />
            Add Family Member
          </button>
        )}
      </div>
    </section>
  );
};

export default FamilyInfo;