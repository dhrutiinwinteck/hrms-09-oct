import { FileText } from "lucide-react";
import "./LetterOfIntentHeader.css";

interface LetterOfIntentHeaderProps {
  loading: boolean;
}

const LetterOfIntentHeader = ({
  loading,
}: LetterOfIntentHeaderProps) => {
  return (
    <div className="loi-page-header">
      <div className="loi-breadcrumb">
        <span>Recruitment</span>
        <span>/</span>
        <span>Letter of Intent Settings</span>
      </div>

      <div className="loi-title-row">
        <div>
          <h1>Letter of Intent Settings</h1>

          <p>
            Manage your Letter of Intent template and
            company information.
          </p>
        </div>

        <div className="loi-header-status">
          <FileText size={18} />

          <span>
            {loading
              ? "Loading..."
              : "Settings loaded"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default LetterOfIntentHeader;