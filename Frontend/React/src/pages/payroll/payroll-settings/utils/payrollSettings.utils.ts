import {
  PayrollSettings,
  PayrollSettingsFormData,
} from '../types/payrollSettings.types';

export const EMPTY_PAYROLL_SETTINGS_FORM: PayrollSettingsFormData = {
  company_name: '',
  company_address: '',
  company_contact: '',
  company_logo: null,
};

export const mapSettingsToForm = (
  settings: PayrollSettings,
): PayrollSettingsFormData => {
  return {
    company_name: settings.company_name ?? '',
    company_address: settings.company_address ?? '',
    company_contact: settings.company_contact ?? '',
    company_logo: null,
  };
};

export const getImageUrl = (
  imagePath: string | null | undefined,
): string | null => {
  if (!imagePath || imagePath.trim() === '') {
    return null;
  }

  const trimmedPath = imagePath.trim();

  const apiBaseUrl = (
    import.meta.env.VITE_API_BASE_URL ||
    'http://localhost:8001'
  ).replace(/\/+$/, '');

  // Blob and data URLs
  if (
    trimmedPath.startsWith('blob:') ||
    trimmedPath.startsWith('data:')
  ) {
    return trimmedPath;
  }

  // Extract company logo path from any backend URL or relative path
  const uploadsMarker = '/uploads/company_logo/';

  const uploadsIndex = trimmedPath.indexOf(uploadsMarker);

  if (uploadsIndex !== -1) {
    const fileName = trimmedPath
      .substring(uploadsIndex + uploadsMarker.length)
      .split('?')[0];

    if (!fileName) {
      return null;
    }

    return (
      `${apiBaseUrl}/api/v1/payroll/settings` +
      `/uploads/company_logo/${encodeURIComponent(fileName)}`
    );
  }

  // Handle external URLs
  try {
    const parsedUrl = new URL(trimmedPath);

    if (
      parsedUrl.hostname !== 'localhost' &&
      parsedUrl.hostname !== '127.0.0.1' &&
      parsedUrl.hostname !== '0.0.0.0'
    ) {
      return trimmedPath;
    }
  } catch {
    // Continue for relative paths
  }

  // Normalize relative paths
  let normalizedPath = trimmedPath.replace(/\\/g, '/');

  normalizedPath = normalizedPath.replace(/^\.\/+/, '');

  if (!normalizedPath.startsWith('/')) {
    normalizedPath = `/${normalizedPath}`;
  }

  return `${apiBaseUrl}${normalizedPath}`;
};