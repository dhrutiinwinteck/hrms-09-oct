import React from "react";
import { KRAStatus } from "../../types/kra.types";

import "./StatusBadge.css";

interface StatusBadgeProps {
  status: KRAStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const normalizedStatus = status
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");

  return (
    <span
      className={`kra-status-badge kra-status-badge--${normalizedStatus}`}
      aria-label={`Status: ${status}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;