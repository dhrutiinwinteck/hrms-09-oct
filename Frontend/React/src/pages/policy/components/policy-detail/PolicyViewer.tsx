import {
  useEffect,
  useState,
  type MouseEvent,
} from 'react';

import {
  CheckCircle2,
  FileText,
  Loader2,
  X,
} from 'lucide-react';

import {
  getPolicyContent,
} from '../../services/policy.service';

import type {
  Policy,
  PolicyContentResponse,
  PolicyLanguage,
} from '../../types/policy.types';

import './PolicyViewer.css';


interface PolicyViewerProps {
  policy: Policy | null;

  isOpen: boolean;

  onClose: () => void;
}


/* ============================================================
   LANGUAGE OPTIONS
============================================================ */

const LANGUAGE_OPTIONS: Array<{
  value: PolicyLanguage;
  label: string;
}> = [
  {
    value: 'en',
    label: 'English',
  },
  {
    value: 'hi',
    label: 'Hindi',
  },
  {
    value: 'bn',
    label: 'Bengali',
  },
];


/* ============================================================
   ERROR MESSAGE
============================================================ */

const getErrorMessage = (
  error: unknown,
): string => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const axiosError =
      error as {
        response?: {
          data?: {
            detail?: string;
            message?: string;
          };
        };
      };

    return (
      axiosError.response?.data?.detail ??
      axiosError.response?.data?.message ??
      'Unable to load policy content.'
    );
  }

  if (
    error instanceof Error
  ) {
    return error.message;
  }

  return 'Unable to load policy content.';
};


/* ============================================================
   COMPONENT
============================================================ */

const PolicyViewer = ({
  policy,
  isOpen,
  onClose,
}: PolicyViewerProps): JSX.Element | null => {

  /* ----------------------------------------------------------
     LANGUAGE
  ---------------------------------------------------------- */

  const [
    language,
    setLanguage,
  ] =
    useState<PolicyLanguage>(
      'en',
    );


  /* ----------------------------------------------------------
     CONTENT
  ---------------------------------------------------------- */

  const [
    content,
    setContent,
  ] =
    useState<string>('');


  /* ----------------------------------------------------------
     CONTENT RESPONSE
  ---------------------------------------------------------- */

  const [
    contentResponse,
    setContentResponse,
  ] =
    useState<PolicyContentResponse | null>(
      null,
    );


  /* ----------------------------------------------------------
     LOADING
  ---------------------------------------------------------- */

  const [
    loading,
    setLoading,
  ] =
    useState<boolean>(
      false,
    );


  /* ----------------------------------------------------------
     ERROR
  ---------------------------------------------------------- */

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );


  /* ==========================================================
     BODY SCROLL LOCK + ESC
  ========================================================== */

  useEffect(() => {
    if (
      !isOpen
    ) {
      return undefined;
    }

    const handleKeyDown =
      (
        event: KeyboardEvent,
      ): void => {
        if (
          event.key === 'Escape'
        ) {
          onClose();
        }
      };

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      'hidden';

    window.addEventListener(
      'keydown',
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        'keydown',
        handleKeyDown,
      );
    };
  }, [
    isOpen,
    onClose,
  ]);


  /* ==========================================================
     RESET WHEN POLICY CHANGES / MODAL OPENS
  ========================================================== */

  useEffect(() => {
    if (
      !isOpen ||
      !policy
    ) {
      return;
    }

    setLanguage('en');

    setContent('');

    setContentResponse(null);

    setError(null);
  }, [
    isOpen,
    policy?.id,
  ]);


  /* ==========================================================
     LOAD POLICY CONTENT
  ========================================================== */

  useEffect(() => {
    if (
      !isOpen ||
      !policy
    ) {
      return;
    }

    let isMounted =
      true;

    const loadContent =
      async (): Promise<void> => {
        try {
          setLoading(true);

          setError(null);

          setContent('');

          const response =
            await getPolicyContent(
              policy.id,
              language,
            );

          if (
            !isMounted
          ) {
            return;
          }

          setContentResponse(
            response,
          );

          setContent(
            response.content || '',
          );
        } catch (
          error: unknown
        ) {
          if (
            !isMounted
          ) {
            return;
          }

          const message =
            getErrorMessage(
              error,
            );

          setContent('');

          setContentResponse(
            null,
          );

          setError(
            message,
          );

          console.error(
            'Failed to load policy content.',
            error,
          );
        } finally {
          if (
            isMounted
          ) {
            setLoading(false);
          }
        }
      };

    void loadContent();

    return () => {
      isMounted = false;
    };
  }, [
    isOpen,
    policy,
    language,
  ]);


  /* ==========================================================
     DO NOT RENDER
  ========================================================== */

  if (
    !isOpen ||
    !policy
  ) {
    return null;
  }


  /* ==========================================================
     BACKDROP CLICK
  ========================================================== */

  const handleBackdropClick = (
    event: MouseEvent<HTMLDivElement>,
  ): void => {
    if (
      event.target ===
      event.currentTarget
    ) {
      onClose();
    }
  };


  /* ==========================================================
     LANGUAGE CHANGE
  ========================================================== */

  const handleLanguageChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ): void => {
    setLanguage(
      event.target.value as PolicyLanguage,
    );
  };


  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div
      className="policy-viewer-backdrop"
      role="presentation"
      onMouseDown={
        handleBackdropClick
      }
    >

      <section
        className="policy-viewer-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="policy-viewer-title"
      >

        {/* ====================================================
            HEADER
        ==================================================== */}

        <header className="policy-viewer-header">

          <div className="policy-viewer-heading">

            <div
              className="policy-viewer-heading-icon"
              aria-hidden="true"
            >
              <FileText
                size={19}
                strokeWidth={1.8}
              />
            </div>

            <div className="policy-viewer-heading-content">

              <h2
                id="policy-viewer-title"
                title={policy.title}
              >
                {policy.title}
              </h2>

              <p>
                Read Policy
              </p>

            </div>

          </div>


          <button
            type="button"
            className="policy-viewer-close-button"
            onClick={onClose}
            title="Close"
            aria-label="Close policy viewer"
          >
            <X
              size={19}
              strokeWidth={1.8}
            />
          </button>

        </header>


        {/* ====================================================
            LANGUAGE BAR
        ==================================================== */}

        <div className="policy-viewer-toolbar">

          <div className="policy-viewer-language">

            <label
              htmlFor="policy-language"
            >
              Language
            </label>

            <select
              id="policy-language"
              value={language}
              onChange={
                handleLanguageChange
              }
              disabled={loading}
              aria-label="Select policy language"
            >
              {LANGUAGE_OPTIONS.map(
                option => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ),
              )}
            </select>

          </div>


          {contentResponse?.version && (
            <div className="policy-viewer-version">
              Version {contentResponse.version}
            </div>
          )}

        </div>


        {/* ====================================================
            CONTENT
        ==================================================== */}

        <div className="policy-viewer-body">

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading && (
            <div
              className="policy-viewer-state"
              role="status"
              aria-live="polite"
            >

              <Loader2
                className="policy-viewer-spinner"
                size={28}
                strokeWidth={1.8}
              />

              <h3>
                Loading policy...
              </h3>

              <p>
                Please wait while the policy
                content is being prepared.
              </p>

            </div>
          )}


          {/* ==================================================
              ERROR
          ================================================== */}

          {!loading &&
            error && (
              <div
                className="policy-viewer-state policy-viewer-error-state"
                role="alert"
              >

                <div className="policy-viewer-error-icon">
                  <X
                    size={22}
                    strokeWidth={2}
                  />
                </div>

                <h3>
                  Unable to load policy
                </h3>

                <p>
                  {error}
                </p>

              </div>
            )}


          {/* ==================================================
              CONTENT
          ================================================== */}

          {!loading &&
            !error &&
            content && (
              <article className="policy-readable-content">

                <div className="policy-readable-title-row">

                  <div>
                    <h3>
                      {contentResponse?.title ||
                        policy.title}
                    </h3>

                    <span>
                      {
                        LANGUAGE_OPTIONS.find(
                          option =>
                            option.value ===
                            language,
                        )?.label
                      }
                    </span>
                  </div>

                  <CheckCircle2
                    size={20}
                    strokeWidth={1.8}
                    aria-hidden="true"
                  />

                </div>


                <div className="policy-readable-divider" />


                <div
                  className="policy-readable-text"
                  aria-label="Policy content"
                >
                  {content}
                </div>

              </article>
            )}


          {/* ==================================================
              EMPTY CONTENT
          ================================================== */}

          {!loading &&
            !error &&
            !content && (
              <div
                className="policy-viewer-state"
              >

                <FileText
                  size={36}
                  strokeWidth={1.5}
                />

                <h3>
                  No readable content available
                </h3>

                <p>
                  The policy document does not
                  contain readable text.
                </p>

              </div>
            )}

        </div>


        {/* ====================================================
            FOOTER
        ==================================================== */}

        <footer className="policy-viewer-footer">

          <p>
            Please read the complete policy
            before accepting the company policies.
          </p>

          <button
            type="button"
            className="policy-viewer-done-button"
            onClick={onClose}
          >
            Done
          </button>

        </footer>

      </section>

    </div>
  );
};


export default PolicyViewer;