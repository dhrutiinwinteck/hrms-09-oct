import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  Building2,
  CheckCircle2,
  ImagePlus,
  MapPin,
  Phone,
  Save,
  Upload,
  X,
} from 'lucide-react';

import {
  createPayrollSettings,
  getPayrollSettings,
  updatePayrollSettings,
} from './services/payrollSettings.service';

import {
  PayrollSettings,
  PayrollSettingsFormData,
} from './types/payrollSettings.types';

import {
  EMPTY_PAYROLL_SETTINGS_FORM,
  getImageUrl,
  mapSettingsToForm,
} from './utils/payrollSettings.utils';

import {
  PAYROLL_SETTINGS_TEXT as TEXT,
} from './constants/payrollSettings.constants';

import './PayrollSettingsPage.css';


const MAX_FILE_SIZE = 2 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];


const PayrollSettingsPage = () => {

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [settings, setSettings] =
    useState<PayrollSettings | null>(null);

  const [formData, setFormData] =
    useState<PayrollSettingsFormData>(
      EMPTY_PAYROLL_SETTINGS_FORM
    );

  const [previewUrl, setPreviewUrl] =
    useState<string | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);


  useEffect(() => {

    const loadSettings = async () => {

      try {

        setLoading(true);
        setError(null);

        const response =
          await getPayrollSettings();

        if (response) {

          setSettings(response);

          setFormData(
            mapSettingsToForm(response)
          );

          setPreviewUrl(
            getImageUrl(response.company_logo)
          );
        }

      } catch (err) {

        console.error(
          'Failed to load payroll settings:',
          err
        );

        setError(
          'Unable to load payroll settings.'
        );

      } finally {

        setLoading(false);
      }
    };

    loadSettings();

  }, []);


  const handleInputChange = (
    event: ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement
    >
  ) => {

    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setSuccessMessage(null);
  };


  const handleLogoChange = (
  event: ChangeEvent<HTMLInputElement>,
) => {
  const file = event.target.files?.[0];

  if (!file) {
    return;
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    setError(
      'Only JPG, JPEG, PNG and WEBP images are allowed.',
    );

    event.target.value = '';
    return;
  }

  if (file.size > MAX_FILE_SIZE) {
    setError(
      'Company logo size must not exceed 2MB.',
    );

    event.target.value = '';
    return;
  }

  // Revoke previous temporary preview URL
  if (
    previewUrl &&
    previewUrl.startsWith('blob:')
  ) {
    URL.revokeObjectURL(previewUrl);
  }

  const objectUrl = URL.createObjectURL(file);

  setFormData((previous) => ({
    ...previous,
    company_logo: file,
  }));

  setPreviewUrl(objectUrl);
  setError(null);
  setSuccessMessage(null);
};


  const removeLogo = () => {

    setFormData((previous) => ({
      ...previous,
      company_logo: null,
    }));

    setPreviewUrl(null);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };


  const handleSubmit = async (
  event: FormEvent<HTMLFormElement>,
) => {
  event.preventDefault();

  if (!formData.company_name.trim()) {
    setError('Company name is required.');
    return;
  }

  try {
    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    const isUpdate = Boolean(settings?.id);

    let response: PayrollSettings;

    if (settings?.id) {
      response = await updatePayrollSettings(
        settings.id,
        formData,
      );
    } else {
      response = await createPayrollSettings(formData);
    }

    // Save the latest settings response
    setSettings(response);

    // Update form fields with saved values
    setFormData(mapSettingsToForm(response));

    /**
     * Update logo preview.
     *
     * If backend returns the updated logo path,
     * convert it into a complete image URL.
     *
     * If backend does not return a logo path,
     * keep the currently selected preview.
     */
    const updatedLogoUrl = getImageUrl(
  response.company_logo,
);

if (updatedLogoUrl) {
  setPreviewUrl(updatedLogoUrl);
} else if (
  formData.company_logo instanceof File &&
  previewUrl
) {
  // Keep the selected local image if backend
  // does not return the updated logo path.
  setPreviewUrl(previewUrl);
} else {
  setPreviewUrl(null);
}

    setSuccessMessage(
      isUpdate
        ? 'Payroll settings updated successfully.'
        : 'Payroll settings saved successfully.',
    );
  } catch (err) {
    console.error(
      'Failed to save payroll settings:',
      err,
    );

    setError(
      'Unable to save payroll settings. Please try again.',
    );
  } finally {
    setSaving(false);
  }
};


  const handleCancel = () => {

    if (settings) {

      setFormData(
        mapSettingsToForm(settings)
      );

      setPreviewUrl(
        getImageUrl(settings.company_logo)
      );

    } else {

      setFormData(
        EMPTY_PAYROLL_SETTINGS_FORM
      );

      setPreviewUrl(null);
    }

    setError(null);
    setSuccessMessage(null);
  };


  if (loading) {

    return (
      <div className="payroll-settings-loading">
        Loading payroll settings...
      </div>
    );
  }


  return (
    <div className="payroll-settings-page">

      <div className="payroll-settings-header">

        <div>
          <div className="payroll-breadcrumb">
            Payroll
            <span>/</span>
            Payroll Settings
          </div>

          <h1>{TEXT.pageTitle}</h1>

          <p>{TEXT.pageDescription}</p>
        </div>

      </div>


      {error && (
        <div className="payroll-alert payroll-alert-error">
          <X size={17} />
          {error}
        </div>
      )}


      {successMessage && (
        <div className="payroll-alert payroll-alert-success">
          <CheckCircle2 size={17} />
          {successMessage}
        </div>
      )}


      <div className="payroll-settings-layout">

        <form
          className="company-settings-card"
          onSubmit={handleSubmit}
        >

          <div className="settings-card-header">

            <div className="settings-card-icon">
              <Building2 size={22} />
            </div>

            <div>
              <h2>{TEXT.companyInformation}</h2>
              <p>{TEXT.companyDescription}</p>
            </div>

          </div>


          <div className="company-logo-section">

            <label className="settings-label">
              {TEXT.companyLogo}
            </label>

            <div className="logo-upload-row">

              <button
                type="button"
                className="logo-upload-box"
                onClick={() =>
                  fileInputRef.current?.click()
                }
              >

                <Upload size={25} />

                <strong>
                  {TEXT.uploadLogo}
                </strong>

                <span>
                  {TEXT.logoDescription}
                </span>

              </button>


              <div className="logo-preview-container">

                {previewUrl ? (

                  <img
  src={previewUrl}
  alt="Company logo"
  className="company-logo-preview"
  onError={(event) => {
    console.error(
      'Current company logo failed:',
      event.currentTarget.src,
    );
  }}
/>

                ) : (

                  <div className="logo-empty-state">
                    <ImagePlus size={30} />
                  </div>
                )}

                {previewUrl && (

                  <button
                    type="button"
                    className="remove-logo-button"
                    onClick={removeLogo}
                    aria-label="Remove company logo"
                  >
                    <X size={14} />
                  </button>
                )}

                <span>
                  Current Logo
                </span>

              </div>

            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleLogoChange}
              hidden
            />

          </div>


          <div className="settings-form-group">

            <label htmlFor="company_name">
              {TEXT.companyName}
              <span>*</span>
            </label>

            <input
              id="company_name"
              name="company_name"
              type="text"
              value={formData.company_name}
              onChange={handleInputChange}
              placeholder="Enter company name"
              required
            />

          </div>


          <div className="settings-form-group">

            <label htmlFor="company_address">
              {TEXT.companyAddress}
            </label>

            <textarea
              id="company_address"
              name="company_address"
              value={formData.company_address}
              onChange={handleInputChange}
              placeholder="Enter company address"
              rows={4}
            />

          </div>


          <div className="settings-form-group">

            <label htmlFor="company_contact">
              {TEXT.companyContact}
            </label>

            <div className="input-with-icon">

              <Phone size={17} />

              <input
                id="company_contact"
                name="company_contact"
                type="text"
                value={formData.company_contact}
                onChange={handleInputChange}
                placeholder="Enter company contact"
              />

            </div>

          </div>


          <div className="settings-form-actions">

            <button
              type="button"
              className="settings-cancel-button"
              onClick={handleCancel}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="settings-save-button"
              disabled={saving}
            >

              <Save size={17} />

              {saving
                ? 'Saving...'
                : settings?.id
                  ? TEXT.update
                  : TEXT.save}

            </button>

          </div>

        </form>


        <aside className="company-preview-card">

          <div className="settings-card-header">

            <div className="settings-card-icon">
              <CheckCircle2 size={22} />
            </div>

            <div>
              <h2>{TEXT.previewTitle}</h2>
              <p>{TEXT.previewDescription}</p>
            </div>

          </div>


          <div className="preview-company-content">

            <div className="preview-logo-wrapper">

              {previewUrl ? (

                <img
  src={previewUrl}
  alt="Company logo preview"
  className="preview-company-logo"
  onError={(event) => {
    console.error(
      'Preview company logo failed:',
      event.currentTarget.src,
    );
  }}
/>

              ) : (

                <Building2 size={45} />
              )}

            </div>


            <h3>
              {formData.company_name ||
                'Your Company Name'}
            </h3>


            {formData.company_address && (

              <div className="preview-detail">

                <MapPin size={16} />

                <span>
                  {formData.company_address}
                </span>

              </div>
            )}


            {formData.company_contact && (

              <div className="preview-detail">

                <Phone size={16} />

                <span>
                  {formData.company_contact}
                </span>

              </div>
            )}

          </div>


          <div className="preview-divider" />

          <div className="preview-note">

            <CheckCircle2 size={18} />

            <p>
              This information will be displayed
              on employee payslips.
            </p>

          </div>


          <div className="preview-document">

            <div className="preview-document-title">
              PAYSLIP
            </div>

            <div className="preview-document-line wide" />
            <div className="preview-document-line" />
            <div className="preview-document-line medium" />
            <div className="preview-document-line wide" />
            <div className="preview-document-line" />

          </div>

        </aside>

      </div>

    </div>
  );
};


export default PayrollSettingsPage;