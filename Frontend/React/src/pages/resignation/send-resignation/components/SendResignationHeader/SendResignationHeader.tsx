import {
  ChevronRight,
  MailPlus,
} from "lucide-react";

import "./SendResignationHeader.css";

export const SendResignationHeader =
  (): JSX.Element => {
    return (
      <div className="send-resignation-header">
        <div className="send-resignation-breadcrumb">
          <span>Home</span>
          <ChevronRight size={14} />
          <span>Resignation</span>
          <ChevronRight size={14} />
          <strong>Send Resignation</strong>
        </div>

        <h1>Send Resignation</h1>

        <p>
          Send a resignation communication to
          an active employee via email.
        </p>
      </div>
    );
  };