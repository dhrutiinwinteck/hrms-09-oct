import {
  BriefcaseBusiness,
  ClipboardList,
  CirclePause,
  TrendingUp,
} from "lucide-react";

import { DesignationStatCard } from "../DesignationStatCard/DesignationStatCard";

import "./DesignationStatistics.css";

const DesignationStatistics = () => {
  return (
    <section
      className="designation-statistics"
      aria-label="Designation statistics"
    >
      {/* =========================================
          TOTAL DESIGNATIONS
      ========================================= */}

      <DesignationStatCard
        title="Total Designations"
        value={18}
        description="All Designations"
        icon={
          <ClipboardList
            size={21}
            strokeWidth={1.8}
          />
        }
        variant="green"
      />

      {/* =========================================
          ACTIVE DESIGNATIONS
      ========================================= */}

      <DesignationStatCard
        title="Active Designations"
        value={16}
        description="Currently Active"
        icon={
          <BriefcaseBusiness
            size={21}
            strokeWidth={1.8}
          />
        }
        variant="green"
      />

      {/* =========================================
          INACTIVE DESIGNATIONS
      ========================================= */}

      <DesignationStatCard
        title="Inactive Designations"
        value={2}
        description="Currently Inactive"
        icon={
          <CirclePause
            size={21}
            strokeWidth={1.8}
          />
        }
        variant="orange"
      />

      {/* =========================================
          DEPARTMENTS COVERED
      ========================================= */}

      <DesignationStatCard
        title="Departments Covered"
        value={7}
        description="Across Organization"
        icon={
          <TrendingUp
            size={21}
            strokeWidth={1.8}
          />
        }
        variant="blue"
      />
    </section>
  );
};

/*
 * Named export
 *
 * Used by:
 *
 * import {
 *   DesignationStatistics,
 * } from "./components/DesignationStatistics/DesignationStatistics";
 */
export { DesignationStatistics };

/*
 * Default export
 */
export default DesignationStatistics;