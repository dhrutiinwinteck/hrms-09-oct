import axiosInstance from '../../../services/axios/axiosInstance';

/* ============================================================
   DOCUMENT TYPES
============================================================ */

export type PolicyDocumentType =
  | 'pdf'
  | 'doc'
  | 'docx'
  | 'unknown';


/* ============================================================
   RESOLVE POLICY DOCUMENT URL
============================================================ */

export const resolvePolicyDocumentUrl = (
  documentUrl: string | null | undefined,
): string | null => {
  if (
    documentUrl === null ||
    documentUrl === undefined
  ) {
    return null;
  }

  const normalizedUrl =
    documentUrl.trim();

  if (
    normalizedUrl.length === 0
  ) {
    return null;
  }

  /* ----------------------------------------------------------
     Absolute URL
  ---------------------------------------------------------- */

  if (
    normalizedUrl.startsWith('http://') ||
    normalizedUrl.startsWith('https://')
  ) {
    return normalizedUrl;
  }

  /* ----------------------------------------------------------
     Axios API base URL
  ---------------------------------------------------------- */

  const apiBaseUrl =
    axiosInstance.defaults.baseURL;

  /* ----------------------------------------------------------
     No API base URL
  ---------------------------------------------------------- */

  if (!apiBaseUrl) {
    try {
      const documentPath =
        normalizedUrl.startsWith('/')
          ? normalizedUrl
          : `/${normalizedUrl}`;

      return new URL(
        documentPath,
        window.location.origin,
      ).toString();
    } catch (
      error: unknown
    ) {
      console.error(
        'Unable to resolve policy document URL.',
        error,
      );

      return normalizedUrl;
    }
  }

  /* ----------------------------------------------------------
     API server origin
  ---------------------------------------------------------- */

  try {
    const apiUrl =
      new URL(
        apiBaseUrl,
        window.location.origin,
      );

    const serverOrigin =
      apiUrl.origin;

    const documentPath =
      normalizedUrl.startsWith('/')
        ? normalizedUrl
        : `/${normalizedUrl}`;

    return new URL(
      documentPath,
      `${serverOrigin}/`,
    ).toString();
  } catch (
    error: unknown
  ) {
    console.error(
      'Unable to resolve policy document URL.',
      error,
    );

    return normalizedUrl;
  }
};


/* ============================================================
   GET DOCUMENT TYPE
============================================================ */

export const getPolicyDocumentType = (
  documentUrl: string,
): PolicyDocumentType => {
  try {
    const url =
      new URL(
        documentUrl,
        window.location.origin,
      );

    const pathname =
      url.pathname.toLowerCase();

    if (
      pathname.endsWith('.pdf')
    ) {
      return 'pdf';
    }

    if (
      pathname.endsWith('.docx')
    ) {
      return 'docx';
    }

    if (
      pathname.endsWith('.doc')
    ) {
      return 'doc';
    }

    return 'unknown';
  } catch {
    const normalizedUrl =
      documentUrl.toLowerCase();

    if (
      normalizedUrl.includes('.pdf')
    ) {
      return 'pdf';
    }

    if (
      normalizedUrl.includes('.docx')
    ) {
      return 'docx';
    }

    if (
      normalizedUrl.includes('.doc')
    ) {
      return 'doc';
    }

    return 'unknown';
  }
};


/* ============================================================
   OPEN ORIGINAL POLICY DOCUMENT
============================================================ */

/**
 * Opens the original policy document.
 *
 * PDF:
 *   Opens directly in a new browser tab.
 *
 * DOC/DOCX:
 *   Opens in a new browser tab if the browser/server supports
 *   inline rendering. Otherwise the browser will download it.
 *
 * The function intentionally does not use window.open()
 * return-value checking because that can produce false
 * popup-blocked messages.
 */
export const openPolicyDocument = (
  documentUrl: string | null | undefined,
  policyTitle: string,
): boolean => {
  const resolvedUrl =
    resolvePolicyDocumentUrl(
      documentUrl,
    );

  if (!resolvedUrl) {
    window.alert(
      `No document is currently attached to "${policyTitle}".`,
    );

    return false;
  }

  const documentType =
    getPolicyDocumentType(
      resolvedUrl,
    );

  console.info(
    'Opening policy document:',
    {
      policyTitle,
      documentType,
      url: resolvedUrl,
    },
  );

  /*
   * PDF
   *
   * Browser PDF viewer can render it directly.
   */
  if (
    documentType === 'pdf'
  ) {
    window.open(
      resolvedUrl,
      '_blank',
      'noopener,noreferrer',
    );

    return true;
  }

  /*
   * DOC / DOCX
   *
   * Browsers generally do not provide a native document
   * viewer for Microsoft Word files.
   *
   * Opening the URL allows the browser to download the file
   * or hand it to the configured application.
   */
  if (
    documentType === 'doc' ||
    documentType === 'docx'
  ) {
    window.open(
      resolvedUrl,
      '_blank',
      'noopener,noreferrer',
    );

    return true;
  }

  /*
   * Unknown file type.
   *
   * Still attempt to open it rather than blocking the user.
   */
  window.open(
    resolvedUrl,
    '_blank',
    'noopener,noreferrer',
  );

  return true;
};