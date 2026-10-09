import React from 'react';

import {
  ArrowUpDown,
} from 'lucide-react';

import {
  JoiningApproval,
} from '../../types/joiningApprovals.types';

import type {
  IDesignation,
} from '../../../types/application.types';

import {
  JoiningApprovalRow,
} from '../JoiningApprovalRow/JoiningApprovalRow';

import {
  JoiningApprovalSearch,
} from '../JoiningApprovalSearch/JoiningApprovalSearch';

import {
  JoiningApprovalPagination,
} from '../JoiningApprovalPagination/JoiningApprovalPagination';

import './JoiningApprovalTable.css';

interface TableProps {
  candidates: JoiningApproval[];
   designations: IDesignation[];

  total: number;

   onCandidateClick: (
    candidate: JoiningApproval
  ) => void;

  page: number;

  pageSize: number;

  searchTerm: string;

  onSearch: (term: string) => void;

  onPageChange: (page: number) => void;

  
  acceptedApplications: Set<string>;

  onUpdateCandidate: (
    id: string,
    changes: {
      designation?: string;
      joiningDate?: string;
      remark?: string;
    }
  ) => void;

 onDeleteCandidate: (
  id: string,
) => void | Promise<void>;
}

export const JoiningApprovalTable: React.FC<TableProps> = ({
  candidates,
  designations,
  total,
  onCandidateClick,
  page,
  pageSize,
  searchTerm,
  onSearch,
  onPageChange,

  
  acceptedApplications,
  onUpdateCandidate,
  onDeleteCandidate,
}) => {
  return (
    <section className="joining-approval-table-container">

      {/* ======================================================
          TABLE HEADER
          ====================================================== */}

      <div className="table-header">

        <div className="table-heading-wrapper">

          <h3 className="table-title">

            Pending Joining Requests

            <span className="table-count">
              {total}
            </span>

          </h3>

          <span className="table-subtitle">
            Review and manage employee joining requests
          </span>

        </div>

        <JoiningApprovalSearch
          value={searchTerm}
          onChange={onSearch}
        />

      </div>


      {/* ======================================================
          TABLE
          ====================================================== */}

      <div className="table-wrapper">

        <table className="joining-approval-table">

         <colgroup>

  <col className="col-sr-no" />

  <col className="col-candidate" />

  <col className="col-designation" />

  <col className="col-location" />

  <col className="col-joining-date" />

  <col className="col-applied-on" />

  <col className="col-status" />

  <col className="col-actions" />

  

</colgroup>

          <thead>

            <tr>

              <th className="col-sr-no">
                Sr. No.
              </th>

              <th className="col-candidate">
                Candidate
              </th>

              
             

              <th className="col-designation">

                <span className="header-with-sort">

                  Designation

                  <ArrowUpDown size={14} />

                </span>

              </th>

              <th className="col-location">

                <span className="header-with-sort">

                  Location

                  <ArrowUpDown size={14} />

                </span>

              </th>

              <th className="col-joining-date">

                <span className="header-with-sort">

                  Joining Date

                  <ArrowUpDown size={14} />

                </span>

              </th>

              <th className="col-applied-on">

                <span className="header-with-sort">

                  Applied On

                  <ArrowUpDown size={14} />

                </span>

              </th>

              <th className="col-status">

                <span className="header-with-sort">

                  Status

                  <ArrowUpDown size={14} />

                </span>

              </th>

              

              <th className="col-actions">
                Actions
              </th>

             

            </tr>

          </thead>


          <tbody>

            {candidates.length === 0 ? (

              <tr>

                <td
                  colSpan={8}
                  className="no-data"
                >

                  <div className="no-data-content">

                    <span className="no-data-title">
                      No candidates found
                    </span>

                    <span className="no-data-text">
                      There are no joining requests matching your current filters.
                    </span>

                  </div>

                </td>

              </tr>

            ) : (

              candidates.map(
                (
                  candidate,
                  index
                ) => {

                  const serialNumber =
                    (
                      (page - 1) *
                      pageSize
                    ) +
                    index +
                    1;

                  return (
                   <JoiningApprovalRow
  key={candidate.id}

  serialNumber={
    serialNumber
  }

  candidate={
    candidate
  }
    onCandidateClick={
    onCandidateClick
  }

  designations={
    designations
  }

  

 

 
 accepted={acceptedApplications.has(candidate.id)}

  onUpdateCandidate={
    onUpdateCandidate
  }

  onDeleteCandidate={
    onDeleteCandidate
  }
/>
                  );
                }
              )

            )}

          </tbody>

        </table>

      </div>


      {/* ======================================================
          PAGINATION
          ====================================================== */}

      <JoiningApprovalPagination
        currentPage={
          page
        }

        totalItems={
          total
        }

        pageSize={
          pageSize
        }

        onPageChange={
          onPageChange
        }
      />

    </section>
  );
};