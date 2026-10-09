import { X } from "lucide-react";

import type { OfferLetterFormData } from "../../types/offerLetter.types";

import LivePreview from "../LivePreview/LivePreview";

import "./OfferLetterPreviewModal.css";

interface OfferLetterPreviewModalProps {
  open: boolean;
  data: OfferLetterFormData;
  onClose: () => void;
}

export default function OfferLetterPreviewModal({
  open,
  data,
  onClose,
}: OfferLetterPreviewModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="ol-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Offer Letter Preview"
    >
      <div className="ol-modal">
        <div className="ol-modal-header">
          <div>
            <h2>Offer Letter Preview</h2>
            <p>Full document preview</p>
          </div>

          <button
            type="button"
            className="ol-modal-close"
            onClick={onClose}
            aria-label="Close preview"
          >
            <X size={18} />
          </button>
        </div>

        <div className="ol-modal-body">
          <LivePreview data={data} />
        </div>
      </div>
    </div>
  );
}