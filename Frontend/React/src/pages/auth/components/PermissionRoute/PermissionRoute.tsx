// ============================================================
// PROPS
// ============================================================

import { useEmployeePermissions } from "../../Permission/PermissionProvider";

interface PermissionRouteProps {
  permission: string;
  children: React.ReactNode;
}

// ============================================================
// COMPONENT
// ============================================================

const PermissionRoute = ({
  permission,
  children,
}: PermissionRouteProps): JSX.Element => {

  const {
    canView,
    loading,
  } =
    useEmployeePermissions();

  // ----------------------------------------------------------
  // Wait for real permissions
  // ----------------------------------------------------------

  if (loading) {
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
        }}
      >
        Loading permissions...
      </div>
    );
  }

  // ----------------------------------------------------------
  // Permission denied
  // ----------------------------------------------------------

  if (!canView(permission)) {
    return (
      <div
        style={{
          padding: "50px",
          textAlign: "center",
        }}
      >
        <h2>
          Access Denied
        </h2>

        <p>
          You do not have permission
          to access this page.
        </p>

        <button
          type="button"
          onClick={() => {
            window.location.href =
              "/dashboard/home";
          }}
          style={{
            marginTop: "20px",
            padding:
              "10px 20px",
            cursor: "pointer",
          }}
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  // ----------------------------------------------------------
  // Allowed
  // ----------------------------------------------------------

  return (
    <>
      {children}
    </>
  );
};

export default PermissionRoute;