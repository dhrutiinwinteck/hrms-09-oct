import {
  Eye,
  Save,
} from "lucide-react";

import "./OfferLetterActions.css";

interface OfferLetterActionsProps {
  isSaving: boolean;
  onCancel: () => void;
  onPreview: () => void;
  onSave: () => void | Promise<void>;
}

export default function OfferLetterActions({
  isSaving,
  onCancel,
  onPreview,
  onSave,
}: OfferLetterActionsProps) {
  return (
    <div className="ol-actions">

      <button
        type="button"
        className="ol-cancel-button"
        onClick={onCancel}
        disabled={isSaving}
      >
        Cancel
      </button>

      <div className="ol-actions-right">

        <button
          type="button"
          className="ol-preview-button"
          onClick={onPreview}
          disabled={isSaving}
        >
          <Eye size={15} />
          Preview Full Letter
        </button>

        <button
          type="button"
          className="ol-save-button"
          disabled={isSaving}
          onClick={() => {
            console.log(
              "========== OFFER LETTER SAVE BUTTON ==========",
            );

            void onSave();
          }}
        >
          <Save size={15} />

          {isSaving
            ? "Saving..."
            : "Save Template"}
        </button>

      </div>
    </div>
  );
}