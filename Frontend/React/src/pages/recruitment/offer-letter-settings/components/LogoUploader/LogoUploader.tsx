import {
  useEffect,
  useState,
  type ChangeEvent,
} from "react";

import type {
  OfferLetterFormData,
} from "../../types/offerLetter.types";

import {
  isValidLogoFile,
} from "../../utils/offerLetter.mapper";

import { Upload } from "lucide-react";

import "./LogoUploader.css";

interface LogoUploaderProps {
  data: OfferLetterFormData;

  updateField: <
    K extends keyof OfferLetterFormData,
  >(
    field: K,
    value: OfferLetterFormData[K],
  ) => void;
}

export default function LogoUploader({
  data,
  updateField,
}: LogoUploaderProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    data.companyLogo,
  );

  useEffect(() => {
    setPreviewUrl(data.companyLogo);
  }, [data.companyLogo]);

  const handleFileChange = (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!isValidLogoFile(file)) {
      window.alert(
        "Please select a JPG, PNG or WEBP image up to 2 MB.",
      );

      event.target.value = "";
      return;
    }

    const localUrl = URL.createObjectURL(file);

    setPreviewUrl(localUrl);

    updateField(
      "companyLogo",
      localUrl,
    );

    updateField(
      "companyLogoFile",
      file,
    );

    event.target.value = "";
  };

  const handleRemove = () => {
    setPreviewUrl(null);

    updateField(
      "companyLogo",
      null,
    );

    updateField(
      "companyLogoFile",
      null,
    );
  };

  return (
    <div className="ol-logo-upload-wrapper">
      <div className="ol-logo-upload-row">

        <label
          htmlFor="offer-letter-company-logo"
          className="ol-logo-dropzone"
        >
          <Upload
            size={18}
            strokeWidth={1.8}
          />

          <strong>
            Upload Company Logo
          </strong>

          <span>
            JPG, PNG or WEBP (Max 2MB)
          </span>

          <input
            id="offer-letter-company-logo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            hidden
          />
        </label>

        <div className="ol-current-logo">

          {previewUrl ? (
            <>
              <img
                src={previewUrl}
                alt="Current company logo"
              />

              <span>
                Current Logo
              </span>

              <button
                type="button"
                className="ol-logo-remove"
                onClick={handleRemove}
                aria-label="Remove company logo"
              >
                ×
              </button>
            </>
          ) : (
            <>
              <div className="ol-default-logo-icon">
                <Upload
                  size={16}
                  strokeWidth={1.5}
                />
              </div>

              <span>
                No Logo
              </span>
            </>
          )}

        </div>

      </div>
    </div>
  );
}