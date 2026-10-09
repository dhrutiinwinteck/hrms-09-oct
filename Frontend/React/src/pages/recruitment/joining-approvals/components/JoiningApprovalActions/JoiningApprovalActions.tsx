import React from 'react';
import {
  Check,
  X,
  Clock,
  Send,
} from 'lucide-react';

import './JoiningApprovalActions.css';

interface ActionsProps {
  candidateId: string;

  onAccept: (id: string) => void;

  onReject: (id: string) => void;

  onHold: (id: string) => void;

  onSend: (id: string) => void;
}

export const JoiningApprovalActions: React.FC<
  ActionsProps
> = ({
  candidateId,
  onAccept,
  onReject,
  onHold,
  onSend,
}) => {
  return (
    <div className="joining-approval-actions">
      <button
        type="button"
        className="action-btn accept"
        onClick={() => onAccept(candidateId)}
        aria-label="Accept joining request"
      >
        <Check size={14} strokeWidth={2.2} />
        <span>Accept</span>
      </button>

      <button
        type="button"
        className="action-btn reject"
        onClick={() => onReject(candidateId)}
        aria-label="Reject joining request"
      >
        <X size={14} strokeWidth={2.2} />
        <span>Reject</span>
      </button>

      <button
        type="button"
        className="action-btn hold"
        onClick={() => onHold(candidateId)}
        aria-label="Put joining request on hold"
      >
        <Clock size={14} strokeWidth={2.2} />
        <span>On Hold</span>
      </button>

      <button
        type="button"
        className="action-btn send"
        onClick={() => onSend(candidateId)}
        aria-label="Send joining form"
      >
        <Send size={14} strokeWidth={2.2} />
        <span>Send</span>
      </button>
    </div>
  );
};