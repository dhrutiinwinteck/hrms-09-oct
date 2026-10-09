import {
  CalendarDays,
  IndianRupee,
} from "lucide-react";
import { useEffect, useState } from "react";

import type { OfferLetterFormData } from "../../types/offerLetter.types";

import SignatureUpload from "../../../letter-of-intent/components/SignatureUpload";
import StampUpload from "../../../letter-of-intent/components/StampUpload";

import "./OfferLetterFields.css";

interface OfferLetterFieldsProps {
  data: OfferLetterFormData;
  updateField: <K extends keyof OfferLetterFormData>(
    field: K,
    value: OfferLetterFormData[K],
  ) => void;
}

function Label({
  children,
  required = false,
  merge = false,
}: {
  children: React.ReactNode;
  required?: boolean;
  merge?: boolean;
}) {
  return (
    <label className="olf-label">
      {children}

      {required && (
        <span className="olf-required">*</span>
      )}

      {merge && (
        <span className="olf-merge">
          Merge Field
        </span>
      )}
    </label>
  );
}

export default function OfferLetterFields({
  data,
  updateField,
}: OfferLetterFieldsProps) {
  const [signaturePreview, setSignaturePreview] =
    useState<string | null>(data.signatureFilePath);

  const [stampPreview, setStampPreview] =
    useState<string | null>(data.stampFilePath);

  /*
   * ============================================================
   * SIGNATURE PREVIEW
   * ============================================================
   */

  useEffect(() => {
    if (!data.signatureFile) {
      setSignaturePreview(data.signatureFilePath);
      return;
    }

    const objectUrl = URL.createObjectURL(
      data.signatureFile,
    );

    setSignaturePreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [
    data.signatureFile,
    data.signatureFilePath,
  ]);

  /*
   * ============================================================
   * STAMP PREVIEW
   * ============================================================
   */

  useEffect(() => {
    if (!data.stampFile) {
      setStampPreview(data.stampFilePath);
      return;
    }

    const objectUrl = URL.createObjectURL(
      data.stampFile,
    );

    setStampPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [
    data.stampFile,
    data.stampFilePath,
  ]);

  /*
   * ============================================================
   * SIGNATURE UPLOAD
   * ============================================================
   */

  const handleSignatureUpload = async (
    file: File,
  ): Promise<boolean> => {
    updateField("signatureFile", file);
    updateField("signatureFileName", file.name);

    return true;
  };

  /*
   * ============================================================
   * STAMP UPLOAD
   * ============================================================
   */

  const handleStampUpload = async (
    file: File,
  ): Promise<boolean> => {
    updateField("stampFile", file);
    updateField("stampFileName", file.name);

    return true;
  };

  /*
   * ============================================================
   * REMOVE SIGNATURE
   * ============================================================
   */

  const handleRemoveSignature = () => {
    updateField("signatureFile", null);
    updateField("signatureFileName", null);
    updateField("signatureFilePath", null);

    setSignaturePreview(null);
  };

  /*
   * ============================================================
   * REMOVE STAMP
   * ============================================================
   */

  const handleRemoveStamp = () => {
    updateField("stampFile", null);
    updateField("stampFileName", null);
    updateField("stampFilePath", null);

    setStampPreview(null);
  };

  return (
    <div className="olf-fields">
      <div className="olf-grid">

        <div className="olf-group">
          <Label merge>
            Candidate Name
          </Label>

          <input
            className="olf-input"
            value={data.candidateName}
            onChange={(event) =>
              updateField(
                "candidateName",
                event.target.value,
              )
            }
          />
        </div>

        <div className="olf-group">
          <Label merge>
            Candidate Address
          </Label>

          <input
            className="olf-input"
            value={data.candidateAddress}
            onChange={(event) =>
              updateField(
                "candidateAddress",
                event.target.value,
              )
            }
          />
        </div>

        <div className="olf-group">
          <Label merge>
            Contact No.
          </Label>

          <input
            className="olf-input"
            value={data.candidateContactNo}
            onChange={(event) =>
              updateField(
                "candidateContactNo",
                event.target.value,
              )
            }
          />
        </div>

        <div className="olf-group">
          <Label merge>
            Personal Email ID
          </Label>

          <input
            className="olf-input"
            value={data.candidateEmail}
            onChange={(event) =>
              updateField(
                "candidateEmail",
                event.target.value,
              )
            }
          />
        </div>

        <div className="olf-group">
          <Label required>
            Position
          </Label>

          <input
            className="olf-input"
            value={data.position}
            onChange={(event) =>
              updateField(
                "position",
                event.target.value,
              )
            }
          />
        </div>

        <div className="olf-group">
          <Label required>
            Reporting Manager
          </Label>

          <input
            className="olf-input"
            value={data.reportingManager}
            onChange={(event) =>
              updateField(
                "reportingManager",
                event.target.value,
              )
            }
          />
        </div>

        <div className="olf-group">
          <Label>
            Reporting Manager Designation
          </Label>

          <input
            className="olf-input"
            value={data.reportingManagerDesignation}
            onChange={(event) =>
              updateField(
                "reportingManagerDesignation",
                event.target.value,
              )
            }
          />
        </div>

        <div className="olf-group">
          <Label merge>
            Joining Date
          </Label>

          <div className="olf-icon-input">
            <CalendarDays size={14} />

            <input
              value={data.joiningDate}
              onChange={(event) =>
                updateField(
                  "joiningDate",
                  event.target.value,
                )
              }
            />
          </div>
        </div>

        <div className="olf-group">
          <Label>
            Probation Period
          </Label>

          <div className="olf-probation">
            <input
              type="number"
              min={0}
              value={data.probationPeriod}
              onChange={(event) =>
                updateField(
                  "probationPeriod",
                  Number(event.target.value),
                )
              }
            />

            <select
              value={data.probationPeriodUnit}
              onChange={(event) =>
                updateField(
                  "probationPeriodUnit",
                  event.target.value as OfferLetterFormData["probationPeriodUnit"],
                )
              }
            >
              <option value="Days">
                Days
              </option>

              <option value="Weeks">
                Weeks
              </option>

              <option value="Months">
                Months
              </option>
            </select>
          </div>
        </div>

        <div className="olf-group">
          <Label merge>
            Total CTC
          </Label>

          <div className="olf-icon-input">
            <IndianRupee size={13} />

            <input
              value={data.totalCtc}
              onChange={(event) =>
                updateField(
                  "totalCtc",
                  event.target.value,
                )
              }
            />
          </div>
        </div>

        <div className="olf-group">
          <Label>
            Job Duties / Responsibilities
          </Label>

          <input
            className="olf-input"
            value={data.jobDuties}
            onChange={(event) =>
              updateField(
                "jobDuties",
                event.target.value,
              )
            }
          />
        </div>

        <div className="olf-group">
          <Label>
            Acceptance Text
          </Label>

          <input
            className="olf-input"
            value={data.acceptanceText}
            onChange={(event) =>
              updateField(
                "acceptanceText",
                event.target.value,
              )
            }
          />
        </div>

        <div className="olf-group">
          <Label>
            HR Signatory Name
          </Label>

          <input
            className="olf-input"
            value={data.hrSignatoryName}
            onChange={(event) =>
              updateField(
                "hrSignatoryName",
                event.target.value,
              )
            }
          />
        </div>

        <div className="olf-group">
          <Label>
            HR Designation
          </Label>

          <input
            className="olf-input"
            value={data.hrDesignation}
            onChange={(event) =>
              updateField(
                "hrDesignation",
                event.target.value,
              )
            }
          />
        </div>

        {/* ================================================== */}
        {/* HR SIGNATURE */}
        {/* ================================================== */}

        <div className="olf-group olf-document-upload">
          <Label>
            HR Signature
          </Label>

          <SignatureUpload
            signature={signaturePreview}
            uploading={false}
            onUpload={handleSignatureUpload}
            onRemove={handleRemoveSignature}
          />
        </div>

        {/* ================================================== */}
        {/* COMPANY STAMP */}
        {/* ================================================== */}

        <div className="olf-group olf-document-upload">
          <Label>
            HR Stamp
          </Label>

          <StampUpload
            stamp={stampPreview}
            uploading={false}
            onUpload={handleStampUpload}
            onRemove={handleRemoveStamp}
          />
        </div>

      </div>
    </div>
  );
}