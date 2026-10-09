import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Users,
  Boxes,
  Check,
  Info,
  Search,
  LayoutDashboard,
  Clock,
  Calendar,
  Wallet,
  FileText,
  Award,
  Settings,
  UserPlus,
  ClipboardList,
  ChevronDown,
  X,
} from "lucide-react";

import {
  PERMISSION_COLUMNS,
} from "../../constants/settings.constants";

import {
  PermissionActionId,
} from "../../types/settings.types";

import {
  usePermissions,
} from "../../hooks/usePermissions";

import "./PermissionManagement.css";

// ============================================================
// MODULE ICONS
// ============================================================

const moduleIcons: Record<
  string,
  React.ElementType
> = {
  Dashboard: LayoutDashboard,

  "Send Application Form":
    UserPlus,

  "Interview Process":
    ClipboardList,

  Attendance:
    Clock,

  Shift:
    Clock,

  Leave:
    Calendar,

  Holiday:
    Calendar,

  Payroll:
    Wallet,

  Policies:
    FileText,

  KRA:
    Award,

  Settings:
    Settings,
};

// ============================================================
// SEARCHABLE SELECT PROPS
// ============================================================

interface SearchableOption {
  id: string;
  label: string;
  secondary?: string;
}

// ============================================================
// COMPONENT
// ============================================================

const PermissionManagement: React.FC =
  () => {
    // ========================================================
    // HOOK
    // ========================================================

    const {
      modules = [],
      currentRows = [],

      selectedModuleId,
      handleModuleSelect,

      handleTargetTypeChange,

      targetId,
      handleTargetIdChange,

      selectedTargetName,

      employees = [],

      permissionMatrix,
      handlePermissionToggle,

      handleSelectAll,
      handleClearAll,
      handleResetModule,

      handleSave,
      loadPermissions,

      loading,
      saving,

      permissionsLoaded,

      error,
      saveMessage,
    } = usePermissions();

    // Employee-only Permission Management screen.
    useEffect(() => {
      handleTargetTypeChange("employee");
    }, []);

    // ========================================================
    // SEARCH STATE
    // ========================================================

    const [
      targetSearch,
      setTargetSearch,
    ] = useState("");

    const [
      targetDropdownOpen,
      setTargetDropdownOpen,
    ] = useState(false);

    // ========================================================
    // CURRENT MODULE
    // ========================================================

    const currentModule =
      modules.find(
        (module) =>
          module.id ===
          selectedModuleId,
      );

    // ========================================================
    // SEARCH OPTIONS
    // ========================================================

    const targetOptions =
      useMemo<SearchableOption[]>(
        () => {
          const safeEmployees =
            Array.isArray(employees)
              ? employees
              : [];

          return safeEmployees.map(
            (employee) => ({
              id: String(
                employee.id,
              ),
              label:
                employee.employee_name ||
                employee.emp_code ||
                String(
                  employee.id,
                ),
              secondary:
                employee.emp_code ||
                employee.emp_id
                  ? String(
                      employee.emp_code ||
                        employee.emp_id,
                    )
                  : undefined,
            }),
          );
        },
        [employees],
      );

    // ========================================================
    // FILTER SEARCH
    // ========================================================

    const filteredTargets =
      useMemo(() => {
        const search =
          targetSearch
            .trim()
            .toLowerCase();

        if (!search) {
          return targetOptions;
        }

        return targetOptions.filter(
          (option) =>
            option.label
              .toLowerCase()
              .includes(search) ||
            option.secondary
              ?.toLowerCase()
              .includes(search),
        );
      }, [
        targetSearch,
        targetOptions,
      ]);

    // ========================================================
    // TARGET SELECTION
    // ========================================================

    const handleTargetSelect = (
      option: SearchableOption,
    ) => {
      handleTargetIdChange(
        option.id,
        option.label,
      );

      setTargetSearch("");
      setTargetDropdownOpen(false);
    };

    // ========================================================
    // CLEAR TARGET
    // ========================================================

    const handleClearTarget = () => {
      handleTargetIdChange(
        "",
        "",
      );

      setTargetSearch("");
    };

    // ========================================================
    // ENABLED COUNT
    // ========================================================

    const enabledPermissions =
      useMemo(() => {
        let count = 0;

        currentRows.forEach(
          (row) => {
            const actions =
              permissionMatrix[
                row.id
              ];

            if (!actions) {
              return;
            }

            Object.values(
              actions,
            ).forEach(
              (value) => {
                if (value) {
                  count++;
                }
              },
            );
          },
        );

        return count;
      }, [
        currentRows,
        permissionMatrix,
      ]);

    // ========================================================
    // TOTAL ACTIONS
    // ========================================================

    const totalPermissions =
      currentRows.length *
      PERMISSION_COLUMNS.length;

    // ========================================================
    // MODULE ICON
    // ========================================================

    const getModuleIcon =
      (
        moduleName: string,
      ) =>
        moduleIcons[
          moduleName
        ] || Boxes;

    // ========================================================
    // RENDER
    // ========================================================

    return (
      <div className="pm-container">

        {/* ==================================================
            STATISTICS
        ================================================== */}

        <div className="pm-stats-grid">

          {/* SELECTED TARGET */}

          <div className="pm-stat-card">

            <div className="pm-stat-icon">
              <Users size={22} />
            </div>

            <div className="pm-stat-info">

              <span className="pm-stat-label">
                Selected Target
              </span>

              <span
                className="pm-stat-value"
                title={
                  selectedTargetName ||
                  ""
                }
              >
                {selectedTargetName ||
                  "Not selected"}
              </span>

              <span className="pm-stat-sub">
                {targetId
                  ? `ID: ${targetId}`
                  : "No target selected"}
              </span>

            </div>

          </div>

          {/* MODULES */}

          <div className="pm-stat-card">

            <div className="pm-stat-icon">
              <Boxes size={22} />
            </div>

            <div className="pm-stat-info">

              <span className="pm-stat-label">
                Modules
              </span>

              <span className="pm-stat-value">
                {modules.length}
              </span>

              <span className="pm-stat-sub">
                Permission modules
              </span>

            </div>

          </div>

          {/* ENABLED */}

          <div className="pm-stat-card">

            <div className="pm-stat-icon">
              <Check size={22} />
            </div>

            <div className="pm-stat-info">

              <span className="pm-stat-label">
                Enabled
              </span>

              <span className="pm-stat-value">
                {enabledPermissions}
              </span>

              <span className="pm-stat-sub">
                of{" "}
                {totalPermissions}{" "}
                actions
              </span>

            </div>

          </div>

        </div>

        {/* ==================================================
            TARGET SELECTION
        ================================================== */}

        <div className="pm-selection-bar">

          <div className="pm-selectors">

            {/* SEARCHABLE TARGET */}

            <div
              className="pm-input-group flex-2"
              style={{
                position:
                  "relative",
              }}
            >

              <label>
                Employee
              </label>

              <div
                style={{
                  position:
                    "relative",
                }}
              >

                <button
                  type="button"
                  onClick={() =>
                    setTargetDropdownOpen(
                      (
                        current,
                      ) =>
                        !current,
                    )
                  }
                  disabled={
                    loading ||
                    saving
                  }
                  style={{
                    width:
                      "100%",
                    height:
                      "42px",
                    padding:
                      "0 38px 0 12px",
                    border:
                      "1px solid #d1d5db",
                    borderRadius:
                      "6px",
                    background:
                      "#fff",
                    textAlign:
                      "left",
                    cursor:
                      "pointer",
                    overflow:
                      "hidden",
                    textOverflow:
                      "ellipsis",
                    whiteSpace:
                      "nowrap",
                  }}
                >

                  {selectedTargetName ||
                    "Select employee"}

                </button>

                <ChevronDown
                  size={17}
                  style={{
                    position:
                      "absolute",
                    right:
                      "12px",
                    top:
                      "12px",
                    pointerEvents:
                      "none",
                  }}
                />

                {selectedTargetName && (
                  <button
                    type="button"
                    onClick={
                      handleClearTarget
                    }
                    disabled={
                      loading ||
                      saving
                    }
                    style={{
                      position:
                        "absolute",
                      right:
                        "35px",
                      top:
                        "11px",
                      border:
                        "none",
                      background:
                        "transparent",
                      cursor:
                        "pointer",
                      padding:
                        0,
                    }}
                    title="Clear selection"
                  >
                    <X
                      size={17}
                    />
                  </button>
                )}

                {targetDropdownOpen && (
                  <div
                    style={{
                      position:
                        "absolute",
                      top:
                        "calc(100% + 4px)",
                      left: 0,
                      right: 0,
                      zIndex: 1000,
                      background:
                        "#fff",
                      border:
                        "1px solid #d1d5db",
                      borderRadius:
                        "7px",
                      boxShadow:
                        "0 8px 25px rgba(0,0,0,0.12)",
                      overflow:
                        "hidden",
                    }}
                  >

                    {/* SEARCH */}

                    <div
                      style={{
                        padding:
                          "8px",
                        borderBottom:
                          "1px solid #e5e7eb",
                      }}
                    >

                      <div
                        style={{
                          position:
                            "relative",
                        }}
                      >

                        <Search
                          size={16}
                          style={{
                            position:
                              "absolute",
                            left:
                              "10px",
                            top:
                              "11px",
                          }}
                        />

                        <input
                          type="text"
                          value={
                            targetSearch
                          }
                          onChange={(
                            event,
                          ) =>
                            setTargetSearch(
                              event
                                .target
                                .value,
                            )
                          }
                          autoFocus
                          placeholder="Search employee..."
                          style={{
                            width:
                              "100%",
                            height:
                              "38px",
                            padding:
                              "0 10px 0 34px",
                            border:
                              "1px solid #d1d5db",
                            borderRadius:
                              "5px",
                            boxSizing:
                              "border-box",
                          }}
                        />

                      </div>

                    </div>

                    {/* OPTIONS */}

                    <div
                      style={{
                        maxHeight:
                          "260px",
                        overflowY:
                          "auto",
                      }}
                    >

                      {filteredTargets.length ===
                      0 ? (
                        <div
                          style={{
                            padding:
                              "18px",
                            textAlign:
                              "center",
                            color:
                              "#6b7280",
                          }}
                        >
                          No employee found
                        </div>
                      ) : (
                        filteredTargets.map(
                          (
                            option,
                          ) => (
                            <button
                              type="button"
                              key={
                                option.id
                              }
                              onClick={() =>
                                handleTargetSelect(
                                  option,
                                )
                              }
                              style={{
                                width:
                                  "100%",
                                padding:
                                  "10px 12px",
                                border:
                                  "none",
                                borderBottom:
                                  "1px solid #f1f5f9",
                                background:
                                  option.id ===
                                  targetId
                                    ? "#eff6ff"
                                    : "#fff",
                                textAlign:
                                  "left",
                                cursor:
                                  "pointer",
                              }}
                            >

                              <div
                                style={{
                                  fontWeight:
                                    600,
                                }}
                              >
                                {
                                  option.label
                                }
                              </div>

                              {option.secondary && (
                                <div
                                  style={{
                                    marginTop:
                                      "3px",
                                    fontSize:
                                      "12px",
                                    color:
                                      "#6b7280",
                                  }}
                                >
                                  {
                                    option.secondary
                                  }
                                </div>
                              )}

                            </button>
                          ),
                        )
                      )}

                    </div>

                  </div>
                )}

              </div>

            </div>

            {/* LOAD */}

            <button
              type="button"
              className="pm-save-btn"
              disabled={
                !targetId ||
                loading ||
                saving
              }
              onClick={() => {
                void loadPermissions();
              }}
            >

              <Search size={16} />

              {loading
                ? "Loading..."
                : "Load"}

            </button>

          </div>

          {/* INFORMATION */}

          <div className="pm-info-box">

            <Info size={17} />

            <span>

              Select an Employee and click
              Load. Permissions
              are retrieved from FastAPI
              and PostgreSQL.

            </span>

          </div>

        </div>

        {/* ==================================================
            ERROR
        ================================================== */}

        {error && (
          <div
            className="pm-info-box"
            style={{
              marginTop: 12,
              borderColor:
                "#dc2626",
              color:
                "#b91c1c",
            }}
          >

            <Info size={17} />

            <span>
              {error}
            </span>

          </div>
        )}

        {/* ==================================================
            SUCCESS
        ================================================== */}

        {saveMessage && (
          <div
            className="pm-info-box"
            style={{
              marginTop: 12,
              borderColor:
                "#16a34a",
              color:
                "#15803d",
            }}
          >

            <Check size={17} />

            <span>
              {saveMessage}
            </span>

          </div>
        )}

        {/* ==================================================
            WORKSPACE
        ================================================== */}

        <div className="pm-workspace">

          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="pm-sidebar">

            <div className="pm-sidebar-header">

              <div>

                <strong>
                  Modules
                </strong>

                <span>
                  Select permission area
                </span>

              </div>

            </div>

            <div className="pm-module-list">

              {modules.map(
                (module) => {
                  const Icon =
                    getModuleIcon(
                      module.name,
                    );

                  const active =
                    module.id ===
                    selectedModuleId;

                  return (
                    <button
                      type="button"
                      key={
                        module.id
                      }
                      className={
                        active
                          ? "pm-module-item active"
                          : "pm-module-item"
                      }
                      onClick={() =>
                        handleModuleSelect(
                          module.id,
                        )
                      }
                    >

                      <Icon
                        size={18}
                      />

                      <span>
                        {
                          module.name
                        }
                      </span>

                    </button>
                  );
                },
              )}

            </div>

          </aside>

          {/* =================================================
              MATRIX
          ================================================= */}

          <section className="pm-matrix-area">

            {/* HEADER */}

            <div className="pm-matrix-header">

              <div>

                <div className="pm-matrix-title">

                  {
                    currentModule?.name ||
                    "Permissions"
                  }

                </div>

                <div className="pm-divider-text">

                  Configure permissions for{" "}

                  <strong>
                    {selectedTargetName ||
                      "no target selected"}
                  </strong>

                </div>

              </div>

              {/* ACTIONS */}

              <div className="pm-matrix-actions">

                <button
                  type="button"
                  onClick={
                    handleSelectAll
                  }
                  disabled={
                    !permissionsLoaded ||
                    loading ||
                    saving
                  }
                >
                  Select All
                </button>

                <button
                  type="button"
                  onClick={
                    handleClearAll
                  }
                  disabled={
                    !permissionsLoaded ||
                    loading ||
                    saving
                  }
                >
                  Clear All
                </button>

                <button
                  type="button"
                  onClick={
                    handleResetModule
                  }
                  disabled={
                    !permissionsLoaded ||
                    loading ||
                    saving
                  }
                >
                  Reset Module
                </button>

              </div>

            </div>

            {/* LEGEND */}

            <div className="pm-legend">

              <div className="pm-legend-item">

                <span className="pm-dot allowed" />

                Allowed

              </div>

              <div className="pm-legend-item">

                <span className="pm-dot denied" />

                Denied

              </div>

            </div>

            {/* TABLE */}

            <div className="pm-table-container">

              {loading ? (

                <div
                  style={{
                    padding: 40,
                    textAlign:
                      "center",
                  }}
                >
                  Loading permissions
                  from server...
                </div>

              ) : !targetId ? (

                <div
                  style={{
                    padding: 40,
                    textAlign:
                      "center",
                  }}
                >
                  Select an Employee and
                  click Load.
                </div>

              ) : !permissionsLoaded ? (

                <div
                  style={{
                    padding: 40,
                    textAlign:
                      "center",
                  }}
                >
                  Click Load to retrieve
                  permissions from the
                  database.
                </div>

              ) : (

                <table className="pm-table">

                  <thead>

                    <tr>

                      <th>
                        Permission
                      </th>

                      {PERMISSION_COLUMNS.map(
                        (column) => (
                          <th
                            key={
                              column.id
                            }
                            className="text-center"
                          >
                            {
                              column.label
                            }
                          </th>
                        ),
                      )}

                    </tr>

                  </thead>

                  <tbody>

                    {currentRows.map(
                      (row) => (

                        <tr
                          key={
                            row.id
                          }
                        >

                          <td>

                            <div className="font-medium">
                              {
                                row.label
                              }
                            </div>

                          </td>

                          {PERMISSION_COLUMNS.map(
                            (
                              column,
                            ) => {

                              const actionId =
                                column.id as
                                  PermissionActionId;

                              const checked =
                                permissionMatrix[
                                  row.id
                                ]?.[
                                  actionId
                                ] === true;

                              return (
                                <td
                                  key={
                                    column.id
                                  }
                                  className="text-center"
                                >

                                  <input
                                    type="checkbox"
                                    checked={
                                      checked
                                    }
                                    disabled={
                                      !permissionsLoaded ||
                                      saving
                                    }
                                    onChange={() =>
                                      handlePermissionToggle(
                                        row.id,
                                        actionId,
                                      )
                                    }
                                  />

                                </td>
                              );
                            },
                          )}

                        </tr>

                      ),
                    )}

                  </tbody>

                </table>

              )}

            </div>

            {/* SAVE */}

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "flex-end",
                alignItems:
                  "center",
                gap: 12,
                marginTop: 18,
              }}
            >

              {saving && (
                <span>
                  Saving to database...
                </span>
              )}

              <button
                type="button"
                className="pm-save-btn"
                disabled={
                  saving ||
                  loading ||
                  !permissionsLoaded
                }
                onClick={() => {
                  void handleSave();
                }}
              >

                <Check size={17} />

                {saving
                  ? "Saving..."
                  : "Save All Permissions"}

              </button>

            </div>

          </section>

        </div>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <div className="pm-info-box">

          <Info size={17} />

          <span>

            One Load retrieves the complete
            permission matrix for the selected
            target. Switching modules only
            changes the displayed rows.
            Save All Permissions sends the
            complete matrix to FastAPI.

          </span>

        </div>

      </div>
    );
  };

export default PermissionManagement;