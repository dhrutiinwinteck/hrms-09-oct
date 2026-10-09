import React, {
  useEffect,
  useState,
} from 'react';

import {
  Eye,
 
  ChevronDown,
  
} from 'lucide-react';

import {
  JoiningApproval,
} from '../../types/joiningApprovals.types';

import type {
  IDesignation,
} from '../../../types/application.types';

import './JoiningApprovalRow.css';

interface JoiningApprovalRowProps {
  serialNumber: number;

  candidate: JoiningApproval;
  onCandidateClick: (
    candidate: JoiningApproval
  ) => void;

  designations: IDesignation[];

 

accepted: boolean;

  onUpdateCandidate: (
  id: string,
  changes: {
    designation?: string;
    joiningDate?: string;
    remark?: string;
  }
) => void | Promise<void>;

  onDeleteCandidate: (
  id: string,
) => void | Promise<void>;
}

export const JoiningApprovalRow: React.FC<
  JoiningApprovalRowProps
> = ({
  serialNumber,
  candidate,
  onCandidateClick,
  designations,
  
  // onUpdateCandidate,
  // onDeleteCandidate,
}) => {
  /* ==========================================================
     EDIT MODE
     ========================================================== */

  const [
    editing,
    // setEditing,
  ] = useState<boolean>(false);

  /* ==========================================================
     DESIGNATION
     ========================================================== */

  const [
    designation,
    setDesignation,
  ] = useState<string>(
    candidate.designation || ''
  );

  /* ==========================================================
     JOINING DATE
     ========================================================== */

  const [
    joiningDate,
    setJoiningDate,
  ] = useState<string>(
    candidate.joiningDate || ''
  );


  const getTodayDate = (): string => {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

const todayDate = getTodayDate();
  /* ==========================================================
     REMARK
     ========================================================== */

 

  /* ==========================================================
     SYNC WITH CANDIDATE
     ========================================================== */

  useEffect(() => {
    setDesignation(
      candidate.designation || ''
    );

    setJoiningDate(
      candidate.joiningDate || ''
    );

    
  }, [
    candidate.designation,
    candidate.joiningDate,
    candidate.remark,
  ]);

  /* ==========================================================
     SAVE
     ========================================================== */
//    const handleSave = async (): Promise<void> => {
//   const trimmedDesignation = designation.trim();

//   if (!trimmedDesignation) {
//     return;
//   }

//   try {
//     await onUpdateCandidate(
//       candidate.id,
//       {
//         designation: trimmedDesignation,
//         joiningDate,
//       },
//     );

//     setEditing(false);
//   } catch (error) {
//     console.error(
//       'Failed to save candidate changes:',
//       error,
//     );
//   }
// };

  /* ==========================================================
     CANCEL
     ========================================================== */

  // const handleCancel = (): void => {
  //   setDesignation(
  //     candidate.designation || ''
  //   );

  //   setJoiningDate(
  //     candidate.joiningDate || ''
  //   );

    

  //   setEditing(false);
  // };

  /* ==========================================================
     STATUS CLASS
     ========================================================== */

  const statusClass =
    candidate.status
      .toLowerCase()
      .replace(/\s+/g, '-');
  
 

  return (
    <tr className="joining-approval-row">

      {/* ======================================================
          SR NO
          ====================================================== */}

      <td className="sr-no-cell">

        <span className="sr-number">
          {serialNumber}
        </span>

      </td>

      {/* ======================================================
          CANDIDATE
          ====================================================== */}

      <td className="candidate-cell">

        <div className="candidate-info">

         <button
  type="button"
  className="candidate-name candidate-name-button"
  title={`View details for ${candidate.candidateName}`}
  onClick={() =>
    onCandidateClick(candidate)
  }
>
  {candidate.candidateName}
</button>

        </div>

      </td>

      {/* ======================================================
          EMAIL
          ====================================================== */}

      {/* ======================================================
          DESIGNATION
          ====================================================== */}

      <td className="designation-cell">

        {!editing ? (

          <span
            className="designation-text"
            title={candidate.designation}
          >
            {candidate.designation}
          </span>

        ) : (

          <div className="designation-edit-wrapper">

            <select
              value={designation}
              onChange={(event) =>
                setDesignation(
                  event.target.value
                )
              }
              className="joining-table-input designation-select"
              aria-label={
                `Designation for ${candidate.candidateName}`
              }
            >

              <option value="">
                Select designation
              </option>

              {designations.map(
                (designationOption) => (
                  <option
                    key={designationOption.id}
                    value={designationOption.name}
                  >
                    {designationOption.name}
                  </option>
                )
              )}

            </select>

            <ChevronDown
              className="designation-select-icon"
              size={15}
              aria-hidden="true"
            />

          </div>

        )}

      </td>

      {/* ======================================================
          LOCATION
          ====================================================== */}

      <td className="location-cell">

        <span
          className="location-text"
          title={candidate.location}
        >
          {candidate.location}
        </span>

      </td>

      {/* ======================================================
          JOINING DATE
          ====================================================== */}

      <td className="joining-date-cell">

        <input
  type="date"
  value={joiningDate}
  disabled={!editing}
  min={todayDate}
  onChange={(event) =>
    setJoiningDate(
      event.target.value
    )
  }
          className={
            editing
              ? 'joining-table-input joining-date-input'
              : 'joining-table-input joining-date-input input-readonly'
          }
          aria-label={
            `Joining date for ${candidate.candidateName}`
          }
        />

      </td>

      {/* ======================================================
          APPLIED ON
          ====================================================== */}

      <td className="applied-on-cell">

        <span className="applied-date">
          {candidate.appliedOn}
        </span>

      </td>

      {/* ======================================================
          STATUS
          ====================================================== */}

      <td className="status-cell">

        <span
          className={
            `status-badge status-${statusClass}`
          }
        >
          {candidate.status}
        </span>

      </td>


     {/* ======================================================
    ACTIONS
    ====================================================== */}

    {/* ACTIONS */}

<td className="actions-cell">
  <div className="actions-wrapper">

    <button
      type="button"
      className="management-btn view-btn"
      onClick={() => onCandidateClick(candidate)}
      title={`View details for ${candidate.candidateName}`}
    >
      <Eye size={14} />

      <span>View</span>
    </button>

  </div>
</td>

      {/* ======================================================
          SEND
          ====================================================== */}


    </tr>
  );
};