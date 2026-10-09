import {
  useEffect,
  useState,
} from "react";

import OfferLetterActions from "./components/OfferLetterActions/OfferLetterActions";
import OfferLetterContent from "./components/OfferLetterContent/OfferLetterContent";
import OfferLetterHeader from "./components/OfferLetterHeader/OfferLetterHeader";
import OfferLetterPreviewModal from "./components/OfferLetterPreviewModal/OfferLetterPreviewModal";
import LivePreview from "./components/LivePreview/LivePreview";
import TemplateSettings from "./components/TemplateSettings/TemplateSettings";

import { useOfferLetterForm } from "./hooks/useOfferLetterForm";
import {
  useOfferLetterSettings,
} from "./hooks/useOfferLetterSettings";

import "./OfferLetterSettingsPage.css";

export default function OfferLetterSettingsPage() {
  const {
    formData,
    setFormData,
    updateField,
    resetForm,
  } = useOfferLetterForm();

  const {
    isLoading,
    isSaving,
    error,
    loadTemplate,
    saveTemplate,
  } = useOfferLetterSettings(
    setFormData,
  );

  const [
    previewOpen,
    setPreviewOpen,
  ] = useState(false);

  useEffect(() => {
    void loadTemplate();
  }, [loadTemplate]);

  const handleSave = async () => {
  console.log("========== SAVE BUTTON CLICKED ==========");

  console.log(
    "FORM DATA BEFORE SAVE:",
    formData,
  );

  try {
    console.log(
      "CALLING saveTemplate()...",
    );

    const result = await saveTemplate(formData);

    console.log(
      "saveTemplate() SUCCESS:",
      result,
    );

    window.alert(
      "Offer Letter settings saved successfully.",
    );
  } catch (error) {
    console.error(
      "saveTemplate() FAILED:",
      error,
    );

    window.alert(
      "Failed to save Offer Letter settings.",
    );
  }
};

  const handleCancel = () => {
    resetForm();

    void loadTemplate();
  };

  if (isLoading) {
    return (
      <main className="offer-letter-page">
        <OfferLetterHeader />

        <div className="offer-letter-loading">
          Loading Offer Letter settings...
        </div>
      </main>
    );
  }

  return (
    <main className="offer-letter-page">
      <OfferLetterHeader />

      {error && (
        <div
          className="offer-letter-error"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="offer-letter-layout">
        <div className="offer-letter-left">
          <OfferLetterContent
            data={formData}
            updateField={updateField}
          />
        </div>

        <div className="offer-letter-right">
          <LivePreview
            data={formData}
          />

          <TemplateSettings
            data={formData}
            updateField={updateField}
          />
        </div>
      </div>

      <OfferLetterActions
        isSaving={isSaving}
        onCancel={handleCancel}
        onPreview={() =>
          setPreviewOpen(true)
        }
        onSave={handleSave}
      />

      <OfferLetterPreviewModal
        open={previewOpen}
        data={formData}
        onClose={() =>
          setPreviewOpen(false)
        }
      />
    </main>
  );
}