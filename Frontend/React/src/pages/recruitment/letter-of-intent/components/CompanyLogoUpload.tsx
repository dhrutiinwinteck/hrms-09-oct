import {
  Image as ImageIcon,
  Upload,
  X,
} from "lucide-react";

import "./CompanyLogoUpload.css";

import {
  ALLOWED_LOGO_TYPES,
  MAX_LOGO_SIZE_BYTES,
} from "../constants/letterOfIntent.constants";
import { getFileUrl } from "../../utils/fileUrl";

// import { getFileUrl } from "../utils/fileUrl";

interface CompanyLogoUploadProps {
  logo: string | null;
  uploading: boolean;
  onUpload: (
    file: File,
  ) => Promise<boolean>;
  onRemove: () => void;
}

const CompanyLogoUpload = ({
  logo,
  uploading,
  onUpload,
  onRemove,
}: CompanyLogoUploadProps) => {
  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    if (
      !ALLOWED_LOGO_TYPES.includes(
        file.type as
          (typeof ALLOWED_LOGO_TYPES)[number],
      )
    ) {
      return;
    }

    if (
      file.size >
      MAX_LOGO_SIZE_BYTES
    ) {
      return;
    }

    await onUpload(file);
  };

  const logoUrl = getFileUrl(logo);

  return (
    <div className="loi-logo-field">
      <div className="loi-field-label">
        Company Logo
      </div>

      <div className="loi-logo-upload-row">
        <label className="loi-logo-upload">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            disabled={uploading}
          />

          <Upload size={22} />

          <strong>
            {uploading
              ? "Uploading..."
              : "Upload Company Logo"}
          </strong>

          <span>
            JPG, PNG or WEBP (Max 2MB)
          </span>
        </label>

        {logo && (
          <div className="loi-current-logo">
            <button
              type="button"
              aria-label="Remove logo"
              onClick={onRemove}
            >
              <X size={15} />
            </button>

            <img
              src={logoUrl}
              alt="Current company logo"
              onError={(event) => {
                console.error(
                  "Failed to load company logo:",
                  logoUrl,
                );

                event.currentTarget.style.display =
                  "none";
              }}
            />

            <span>
              Current Logo
            </span>
          </div>
        )}

        {!logo && (
          <div className="loi-no-logo">
            <ImageIcon size={22} />

            <span>
              No logo uploaded
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyLogoUpload;