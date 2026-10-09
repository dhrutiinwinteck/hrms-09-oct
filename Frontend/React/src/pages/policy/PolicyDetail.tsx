import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import Breadcrumb from './components/policy-detail/Breadcrumb';

import PolicyAcceptance from './components/policy-detail/PolicyAcceptance';

import PolicyList from './components/policy-detail/PolicyList';

import PolicyViewer from './components/policy-detail/PolicyViewer';

import {
  usePolicies,
} from './hooks/usePolicies';

import type {
  Policy,
} from './types/policy.types';

import {
  openPolicyDocument,
} from './utils/policyDocument';

import {
  getCurrentEmployeeId,
} from './utils/employee.utils';

import './PolicyDetail.css';


/* ============================================================
   COMPONENT
============================================================ */

const PolicyDetail =
  (): JSX.Element => {

    /* =========================================================
       POLICY HOOK
    ========================================================= */

    const {
      policies,
      loading,
      error,
      accept,
      submitting,
      loadActivePolicies,
      loadEmployeeAcceptances,
    } = usePolicies();


    /* =========================================================
       SELECTED POLICY
    ========================================================= */

    const [
      selectedPolicy,
      setSelectedPolicy,
    ] =
      useState<Policy | null>(
        null,
      );


    /* =========================================================
       READ POLICY MODAL
    ========================================================= */

    const [
      isViewerOpen,
      setIsViewerOpen,
    ] =
      useState<boolean>(
        false,
      );


    /* =========================================================
       ACCEPTANCE CONFIRMATION
    ========================================================= */

    const [
      isConfirmed,
      setIsConfirmed,
    ] =
      useState<boolean>(
        false,
      );


    /* =========================================================
       POLICY ACCEPTED STATE
    ========================================================= */

    const [
      isAccepted,
      setIsAccepted,
    ] =
      useState<boolean>(
        false,
      );


    /* =========================================================
       EMPLOYEE ID
       
       Employee ID is resolved inside the Policy module.
       
       Resolution:
       
       1. localStorage employeeId
       2. logged-in username / employee code
       3. GET /api/v1/employees/profile/{emp_code}
    ========================================================= */

    const [
      employeeId,
      setEmployeeId,
    ] =
      useState<number | null>(
        null,
      );


    /* =========================================================
       STEP 1
       LOAD ACTIVE POLICIES
    ========================================================= */

    useEffect(() => {

      let isMounted = true;

      const loadPolicies =
        async (): Promise<void> => {

          try {

            console.log(
              'Loading active company policies...',
            );

            await loadActivePolicies();

            if (!isMounted) {
              return;
            }

            console.log(
              'Active company policies loaded successfully.',
            );

          } catch (
            error: unknown
          ) {

            if (!isMounted) {
              return;
            }

            console.error(
              'Failed to load active company policies.',
              error,
            );

          }
        };


      void loadPolicies();


      return () => {
        isMounted = false;
      };

    }, [
      loadActivePolicies,
    ]);


    /* =========================================================
       STEP 2
       GET CURRENT EMPLOYEE ID
       
       IMPORTANT:
       
       getCurrentEmployeeId() is now ASYNC because the Policy
       module may need to call:
       
       GET /api/v1/employees/profile/IWT90
       
       Therefore await is REQUIRED.
    ========================================================= */

    useEffect(() => {

      let isMounted = true;

      const loadEmployeeId =
        async (): Promise<void> => {

          try {

            console.log(
              'Resolving employee ID for Policy module...',
            );


            /*
             * IMPORTANT:
             *
             * getCurrentEmployeeId()
             * returns Promise<number>.
             *
             * Therefore we MUST await it.
             */

            const currentEmployeeId =
              await getCurrentEmployeeId();


            if (!isMounted) {
              return;
            }


            console.log(
              'Current Employee ID:',
              currentEmployeeId,
            );


            setEmployeeId(
              currentEmployeeId,
            );

          } catch (
            error: unknown
          ) {

            if (!isMounted) {
              return;
            }


            /*
             * Employee ID is required only
             * for policy acceptance.
             *
             * Failure to resolve it must
             * NOT block policy display.
             */

            console.error(
              'Employee ID could not be determined.',
              error,
            );


            setEmployeeId(
              null,
            );
          }
        };


      void loadEmployeeId();


      return () => {
        isMounted = false;
      };

    }, []);


    /* =========================================================
       STEP 3
       LOAD EMPLOYEE POLICY ACCEPTANCE
    ========================================================= */

    useEffect(() => {

      if (
        employeeId === null ||
        !Number.isInteger(employeeId) ||
        employeeId <= 0
      ) {
        return;
      }


      let isMounted = true;


      const loadAcceptance =
        async (): Promise<void> => {

          try {

            console.log(
              'Loading employee policy acceptance:',
              employeeId,
            );


            await loadEmployeeAcceptances(
              employeeId,
            );


            if (!isMounted) {
              return;
            }


            console.log(
              'Employee policy acceptance loaded successfully.',
            );

          } catch (
            error: unknown
          ) {

            if (!isMounted) {
              return;
            }


            console.error(
              'Failed to load employee policy acceptance.',
              error,
            );
          }
        };


      void loadAcceptance();


      return () => {
        isMounted = false;
      };

    }, [
      employeeId,
      loadEmployeeAcceptances,
    ]);


    /* =========================================================
       STEP 4
       CHECK POLICY ACCEPTANCE
    ========================================================= */

    useEffect(() => {

      if (
        policies.length === 0
      ) {

        setIsAccepted(
          false,
        );

        setIsConfirmed(
          false,
        );

        return;
      }


      const allPoliciesAccepted =
        policies.every(
          policy =>
            policy.isAccepted === true,
        );


      setIsAccepted(
        allPoliciesAccepted,
      );

      setIsConfirmed(
        allPoliciesAccepted,
      );

    }, [
      policies,
    ]);


    /* =========================================================
       READ POLICY
       
       Opens the readable policy modal.
    ========================================================= */

    const handleReadPolicy =
      useCallback(
        (
          policy: Policy,
        ): void => {

          setSelectedPolicy(
            policy,
          );

          setIsViewerOpen(
            true,
          );

        },
        [],
      );


    /* =========================================================
       VIEW ORIGINAL DOCUMENT
       
       Opens the original uploaded document.
       
       PDF:
       Browser PDF viewer opens it.
       
       DOC/DOCX:
       Browser may download it because browsers do not
       natively render Microsoft Word documents.
    ========================================================= */

    const handleViewOriginal =
      useCallback(
        (
          policy: Policy,
        ): void => {

          openPolicyDocument(
            policy.documentUrl,
            policy.title,
          );

        },
        [],
      );


    /* =========================================================
       CLOSE READ POLICY MODAL
    ========================================================= */

    const handleCloseViewer =
      useCallback(
        (): void => {

          setIsViewerOpen(
            false,
          );

          setSelectedPolicy(
            null,
          );

        },
        [],
      );


    /* =========================================================
       CONFIRMATION CHECKBOX
    ========================================================= */

    const handleConfirmationChange =
      useCallback(
        (
          checked: boolean,
        ): void => {

          /*
           * Once all policies have already
           * been accepted, checkbox cannot
           * be changed.
           */

          if (
            isAccepted
          ) {
            return;
          }


          setIsConfirmed(
            checked,
          );

        },
        [
          isAccepted,
        ],
      );


    /* =========================================================
       ACCEPT POLICIES
    ========================================================= */

    const handleAcceptPolicies =
      useCallback(
        async (): Promise<void> => {

          /* ---------------------------------------------------
             STEP 1
             Validate confirmation
          --------------------------------------------------- */

          if (
            !isConfirmed ||
            submitting ||
            isAccepted
          ) {
            return;
          }


          /* ---------------------------------------------------
             STEP 2
             Validate employee ID
          --------------------------------------------------- */

          if (
            employeeId === null ||
            !Number.isInteger(employeeId) ||
            employeeId <= 0
          ) {

            window.alert(
              'Employee ID was not found. Please login again.',
            );

            return;
          }


          /* ---------------------------------------------------
             STEP 3
             Validate policies
          --------------------------------------------------- */

          if (
            policies.length === 0
          ) {

            window.alert(
              'No active policies are available.',
            );

            return;
          }


          /* ---------------------------------------------------
             STEP 4
             Get policy IDs
          --------------------------------------------------- */

          const policyIds =
            policies.map(
              policy =>
                policy.id,
            );


          try {

            console.log(
              'Accepting company policies:',
              {
                employeeId,
                policyIds,
              },
            );


            /* -------------------------------------------------
               STEP 5
               Call policy acceptance API

               POST:
               /api/v1/policies/accept

               Query:
               employee_id={employeeId}

               Body:
               {
                 policy_ids: [...]
               }
            ------------------------------------------------- */

            const response =
              await accept(
                employeeId,
                policyIds,
              );


            /* -------------------------------------------------
               STEP 6
               Success
            ------------------------------------------------- */

            if (
              response.success
            ) {

              setIsAccepted(
                true,
              );

              setIsConfirmed(
                true,
              );


              /*
               * Reload active policies so the
               * latest acceptance state is reflected.
               */

              await loadActivePolicies();

            } else {

              window.alert(
                response.message ||
                  'Unable to accept company policies.',
              );
            }

          } catch (
            error: unknown
          ) {

            console.error(
              'Failed to accept company policies.',
              error,
            );


            window.alert(
              error instanceof Error
                ? error.message
                : 'Failed to accept company policies.',
            );
          }

        },
        [
          accept,
          employeeId,
          isAccepted,
          isConfirmed,
          loadActivePolicies,
          policies,
          submitting,
        ],
      );


    /* =========================================================
       PAGE
    ========================================================= */

    return (
      <div className="policy-detail-page">

        <main className="policy-detail-content">

          <section className="policy-detail-container">

            {/* =================================================
                HEADER
            ================================================= */}

            <header className="policy-detail-header">

              <div className="policy-detail-heading">

                <h1>
                  Company Policies
                </h1>

                <p>
                  Please read all the company policies
                  carefully. You must accept the policies
                  to continue.
                </p>

              </div>


              <Breadcrumb
                items={[
                  {
                    label: 'Dashboard',
                  },
                  {
                    label: 'Policy',
                  },
                  {
                    label: 'Policy Detail',
                  },
                ]}
              />

            </header>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (
              <div
                className="policy-detail-error"
                role="alert"
              >

                <p>
                  Unable to load company policies.
                </p>

                <span>
                  {error}
                </span>

              </div>
            )}


            {/* =================================================
                POLICY LIST
            ================================================= */}

            {loading ? (

              <section
                className="policy-list-empty"
                aria-label="Loading company policies"
              >

                <p>
                  Loading company policies...
                </p>

              </section>

            ) : (

              <div className="policy-detail-list-section">

                <PolicyList
                  policies={
                    policies
                  }

                  onReadPolicy={
                    handleReadPolicy
                  }

                  onViewOriginal={
                    handleViewOriginal
                  }
                />

              </div>
            )}


            {/* =================================================
                ACCEPTANCE
            ================================================= */}

            {!loading &&
              policies.length > 0 && (

                <PolicyAcceptance
                  isConfirmed={
                    isConfirmed
                  }

                  isSubmitting={
                    submitting
                  }

                  isAccepted={
                    isAccepted
                  }

                  onConfirmationChange={
                    handleConfirmationChange
                  }

                  onAccept={
                    handleAcceptPolicies
                  }
                />

              )}

          </section>

        </main>


        {/* =====================================================
            READ POLICY TEXT MODAL
        ===================================================== */}

        <PolicyViewer
          policy={
            selectedPolicy
          }

          isOpen={
            isViewerOpen
          }

          onClose={
            handleCloseViewer
          }
        />

      </div>
    );
  };


export default PolicyDetail;