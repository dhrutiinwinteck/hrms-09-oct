import React, {
  ChangeEvent,
  useRef,
} from "react";

import "./DocumentUpload.css";

interface DocumentUploadProps {
  data: Record<
    string,
    File | null
  >;

  onUpload: (
    field: string,
    file: File | null
  ) => void;

  onBack: () => void;

  onNext: () => void;
}

interface DocumentItem {
  key: string;

  label: string;

  required: boolean;

  accept: string;
}
const DOCUMENTS: DocumentItem[] = [
  {
    key: "addressProof",
    label: "Address Proof",
    required: true,
    accept: ".pdf,.jpg,.jpeg,.png",
  },

  {
    key: "photo",
    label: "Passport Size Photo",
    required: true,
    accept: ".jpg,.jpeg,.png",
  },

  {
    key: "signature",
    label: "Signature",
    required: true,
    accept: ".jpg,.jpeg,.png,.pdf",
  },

  {
    key: "educationalCertificates",
    label: "Educational Certificate",
    required: true,
    accept: ".pdf,.jpg,.jpeg,.png",
  },

  {
    key: "relievingLetter",
    label: "Experience Certificate",
    required: false,
    accept: ".pdf,.jpg,.jpeg,.png",
  },

  {
    key: "salarySlips",
    label: "Bank Document",
    required: true,
    accept: ".pdf,.jpg,.jpeg,.png",
  },

  {
    key: "passport_file",
    label: "Passport",
    required: false,
    accept: ".pdf,.jpg,.jpeg,.png",
  },

  {
    key: "aadhar_file_front",
    label: "Aadhar Card (Front)",
    required: true,
    accept: ".pdf,.jpg,.jpeg,.png",
  },

  {
    key: "aadhar_file_back",
    label: "Aadhar Card (Back)",
    required: true,
    accept: ".pdf,.jpg,.jpeg,.png",
  },

  {
    key: "pan_card",
    label: "PAN Card",
    required: false,
    accept: ".pdf,.jpg,.jpeg,.png",
  },
];

const MAX_FILE_SIZE =
  5 * 1024 * 1024;

const DocumentUpload: React.FC<
  DocumentUploadProps
> = ({
  data,
  onUpload,
  onBack,
  onNext,
}) => {
  const inputRefs =
    useRef<
      Record<
        string,
        HTMLInputElement | null
      >
    >({});

  /* ==========================================================
     FILE SELECT
     ========================================================== */

  const handleFileChange =
    (
      event: ChangeEvent<HTMLInputElement>,
      key: string
    ) => {
      const file =
        event.target.files?.[0];

      if (!file) {
        return;
      }

      if (
        file.size >
        MAX_FILE_SIZE
      ) {
        alert(
          "File size must be less than 5 MB."
        );

        event.target.value = "";

        return;
      }

      onUpload(
        key,
        file
      );
    };

  /* ==========================================================
     REMOVE FILE
     ========================================================== */

  const handleRemove =
    (key: string) => {
      onUpload(
        key,
        null
      );

      const input =
        inputRefs.current[key];

      if (input) {
        input.value = "";
      }
    };

  /* ==========================================================
     NEXT
     ========================================================== */

  const handleNext =
    () => {
      const missing =
        DOCUMENTS.filter(
          (document) =>
            document.required &&
            !data?.[
              document.key
            ]
        );

      if (
        missing.length > 0
      ) {
        alert(
          `Please upload:\n\n${missing
            .map(
              (item) =>
                `• ${item.label}`
            )
            .join("\n")}`
        );

        return;
      }

      onNext();
    };

  /* ==========================================================
     FORMAT FILE SIZE
     ========================================================== */

  const formatFileSize =
    (bytes: number) => {
      if (bytes < 1024) {
        return `${bytes} B`;
      }

      if (
        bytes <
        1024 * 1024
      ) {
        return `${(
          bytes / 1024
        ).toFixed(1)} KB`;
      }

      return `${(
        bytes /
        (1024 * 1024)
      ).toFixed(1)} MB`;
    };

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <section className="document-upload">

      <div className="document-upload-header">
        <h2>
          Upload Documents
        </h2>

        <p>
          Upload the required documents
          to complete your joining form.
        </p>
      </div>

      <div className="document-upload-grid">
        {DOCUMENTS.map(
          (document) => {
            const file =
              data?.[
                document.key
              ];

            return (
              <div
                key={
                  document.key
                }
                className={`document-upload-card ${
                  file
                    ? "has-file"
                    : ""
                }`}
              >
                <div className="document-upload-card-header">

                  <div>
                    <h3>
                      {
                        document.label
                      }

                      {document.required && (
                        <span
                          aria-hidden="true"
                        >
                          {" "}
                          *
                        </span>
                      )}
                    </h3>

                    <span>
                      Maximum size: 5 MB
                    </span>
                  </div>

                </div>

                <input
                  ref={(element) => {
                    inputRefs.current[
                      document.key
                    ] =
                      element;
                  }}
                  type="file"
                  accept={
                    document.accept
                  }
                  hidden
                  onChange={(event) =>
                    handleFileChange(
                      event,
                      document.key
                    )
                  }
                />

                {!file ? (
                  <button
                    type="button"
                    className="document-upload-button"
                    onClick={() =>
                      inputRefs.current[
                        document.key
                      ]?.click()
                    }
                  >
                    Choose File
                  </button>
                ) : (
                  <div className="document-selected-file">

                    <div className="document-file-info">

                      <strong>
                        {
                          file.name
                        }
                      </strong>

                      <span>
                        {formatFileSize(
                          file.size
                        )}
                      </span>

                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleRemove(
                          document.key
                        )
                      }
                    >
                      Remove
                    </button>

                  </div>
                )}
              </div>
            );
          }
        )}
      </div>

      <div className="document-upload-actions">

       <button
  type="button"
  onClick={onBack}
>
  ← Back
</button>

        <button
          type="button"
          onClick={
            handleNext
          }
        >
          Continue
        </button>

      </div>

    </section>
  );
};

/* ============================================================
   EXPORT BOTH
   ============================================================ */

export {
  DocumentUpload,
};

export default DocumentUpload;