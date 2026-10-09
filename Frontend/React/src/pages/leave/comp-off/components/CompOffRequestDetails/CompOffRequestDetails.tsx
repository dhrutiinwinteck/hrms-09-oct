import {
  CheckCircle2,
  Clock3,
  X,
} from 'lucide-react';

import type {
  CompOffRequest,
} from '../../types/compOff.types';

import {
  formatCompOffDate,
  formatCompOffDateTime,
  getDayTypeLabel,
  getStatusClass,
  getStatusLabel,
} from '../../utils/compOff.utils';

interface CompOffRequestDetailsProps {
  request: CompOffRequest | null;
  onClose: () => void;
}

const CompOffRequestDetails = ({
  request,
  onClose,
}: CompOffRequestDetailsProps) => {
  if (!request) {
    return (
      <div className="comp-off-details-card empty-details-card">
        <div>
          <Clock3 size={22} />
          <h3>Select a request</h3>
          <p>
            Click the view icon from the table
            to see request details.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="comp-off-details-card">
      <div className="details-card-header">
        <h2>Request Details</h2>

        <button
          type="button"
          onClick={onClose}
          title="Close"
        >
          <X size={17} />
        </button>
      </div>

      <div className="details-card-content">
        <div className="details-info">
          <div>
            <span>Worked Date</span>
            <strong>
              {formatCompOffDate(
                request.workedDate,
              )}
            </strong>
          </div>

          <div>
            <span>Day Type</span>
            <strong>
              {getDayTypeLabel(
                request.dayType,
              )}
            </strong>
          </div>

          <div>
            <span>Reason</span>
            <strong>{request.reason}</strong>
          </div>

          <div>
            <span>Requested On</span>
            <strong>
              {formatCompOffDate(
                request.requestedOn,
              )}
            </strong>
          </div>

          <div>
            <span>Comp Off Date</span>
            <strong>
              {formatCompOffDate(
                request.compOffDate,
              )}
            </strong>
          </div>

          <div>
            <span>Status</span>
            <strong>
              <span
                className={`detail-status ${getStatusClass(
                  request.status,
                )}`}
              >
                {getStatusLabel(
                  request.status,
                )}
              </span>
            </strong>
          </div>

          {request.approvedBy && (
            <div>
              <span>Approved By</span>
              <strong>
                {request.approvedBy}
              </strong>
            </div>
          )}

          {request.approvedOn && (
            <div>
              <span>Approved On</span>
              <strong>
                {formatCompOffDateTime(
                  request.approvedOn,
                )}
              </strong>
            </div>
          )}

          {(request.remarks ||
            request.rejectionReason) && (
            <div>
              <span>Remarks</span>
              <strong>
                {request.remarks ??
                  request.rejectionReason}
              </strong>
            </div>
          )}
        </div>

        <div className="details-timeline">
          <div className="timeline-item completed">
            <div className="timeline-dot">
              <CheckCircle2 size={15} />
            </div>

            <div>
              <strong>
                Request Submitted
              </strong>

              <span>
                {formatCompOffDateTime(
                  request.requestedOn,
                )}
              </span>
            </div>
          </div>

          <div className="timeline-line" />

          <div
            className={`timeline-item ${
              request.status !== 'APPLIED'
                ? 'completed'
                : ''
            }`}
          >
            <div className="timeline-dot">
              <Clock3 size={14} />
            </div>

            <div>
              <strong>Under Review</strong>

              <span>
                HR is reviewing the request
              </span>
            </div>
          </div>

          <div className="timeline-line" />

          <div
            className={`timeline-item ${
              request.status ===
                'APPROVED' ||
              request.status ===
                'REJECTED'
                ? 'completed'
                : ''
            }`}
          >
            <div className="timeline-dot">
              <CheckCircle2 size={15} />
            </div>

            <div>
              <strong>
                {request.status ===
                'REJECTED'
                  ? 'Rejected'
                  : 'Approved'}
              </strong>

              <span>
                {request.status ===
                'APPROVED'
                  ? formatCompOffDateTime(
                      request.approvedOn,
                    )
                  : request.status ===
                      'REJECTED'
                    ? 'Request rejected'
                    : 'Awaiting HR decision'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompOffRequestDetails;