import {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  JoiningApproval,
  JoiningApprovalFilters,
  JoiningApprovalStats,
  PaginationState,
} from '../types/joiningApprovals.types';

import {
  joiningApprovalService,
} from '../services/joiningApprovals.service';

import {
  DEFAULT_PAGE_SIZE,
} from '../constants/joiningApprovals.constants';

import type {
  IDesignation,
} from '../../types/application.types';

import {
  recruitmentService,
} from '../../services/recruitmentService';

/**
 * ============================================================
 * JOINING APPROVALS HOOK
 * ============================================================
 *
 * Responsibilities:
 *
 * - Fetch joining approval applications
 * - Fetch statistics
 * - Handle approve action
 * - Handle reject action
 * - Handle on-hold action
 * - Handle frontend search
 * - Handle frontend filters
 * - Handle pagination
 * - Handle frontend joining-date/remark updates
 * - Handle frontend row deletion
 *
 * The API service instance is imported from:
 *
 * ../services/joiningApprovals.service
 *
 * Do NOT create another service instance here.
 */
export function useJoiningApprovals() {
  /**
   * ============================================================
   * LOADING
   * ============================================================
   */
  const [
    loading,
    setLoading,
  ] = useState<boolean>(false);

  const [
    actionLoading,
    setActionLoading,
  ] = useState<boolean>(false);

  /**
   * ============================================================
   * TABLE DATA
   * ============================================================
   */
const [
  candidates,
  setCandidates,
] = useState<JoiningApproval[]>([]);

const [
  total,
  setTotal,
] = useState<number>(0);

/**
 * ============================================================
 * DESIGNATIONS
 * ============================================================
 */
const [
  designations,
  setDesignations,
] = useState<IDesignation[]>([]);

const departments = Array.from(
  new Set(
    designations
      .map(
        designation =>
          designation.department_name?.trim(),
      )
      .filter(
        (
          department,
        ): department is string =>
          Boolean(department),
      ),
  ),
);
  /**
   * ============================================================
   * STATISTICS
   * ============================================================
   */
  const [
    stats,
    setStats,
  ] = useState<JoiningApprovalStats>({
    pending: 0,
    approved: 0,
    rejected: 0,
    onHold: 0,
  });

  /**
   * ============================================================
   * FILTERS
   * ============================================================
   */
  const [
    filters,
    setFilters,
  ] = useState<JoiningApprovalFilters>({});

  /**
   * ============================================================
   * SEARCH
   * ============================================================
   */
  const [
    searchTerm,
    setSearchTerm,
  ] = useState<string>('');

  /**
   * ============================================================
   * PAGINATION
   * ============================================================
   */
  const [
    pagination,
    setPagination,
  ] = useState<PaginationState>({
    currentPage: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    totalItems: 0,
  });

  useEffect(() => {
  const fetchDesignations = async (): Promise<void> => {
    try {
      const result =
        await recruitmentService.getDesignations();

      if (
        result.success &&
        Array.isArray(result.data)
      ) {
        setDesignations(result.data);
      } else {
        setDesignations([]);
      }
    } catch (error) {
      console.error(
        'Failed to fetch designations:',
        error,
      );

      setDesignations([]);
    }
  };

  void fetchDesignations();
}, []);



  /**
   * ============================================================
   * FETCH TABLE DATA
   * ============================================================
   */
  const fetchData = useCallback(async (): Promise<void> => {
    setLoading(true);

    try {
  const result =
  await joiningApprovalService.getJoiningApprovals(
    filters,
    searchTerm,
    pagination.currentPage,
    pagination.pageSize,
    designations,
  );

      setCandidates(result.items);

      setTotal(result.total);

      setPagination(
        previous => ({
          ...previous,
          totalItems: result.total,
        }),
      );
    } catch (error) {
      console.error(
        'Failed to fetch joining approvals:',
        error,
      );

      setCandidates([]);

      setTotal(0);

      setPagination(
        previous => ({
          ...previous,
          totalItems: 0,
        }),
      );
    } finally {
      setLoading(false);
    }
  }, [
    filters,
    searchTerm,
    pagination.currentPage,
    pagination.pageSize,
     designations,
  ]);

  /**
   * ============================================================
   * FETCH STATISTICS
   * ============================================================
   */
  const fetchStats = useCallback(async (): Promise<void> => {
    try {
      const statsData =
        await joiningApprovalService.getStats();

      setStats(statsData);
    } catch (error) {
      console.error(
        'Failed to fetch joining approval statistics:',
        error,
      );

      setStats({
        pending: 0,
        approved: 0,
        rejected: 0,
        onHold: 0,
      });
    }
  }, []);

  /**
   * ============================================================
   * INITIAL LOAD
   * ============================================================
   */
  useEffect(() => {
    void fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  /**
   * ============================================================
   * ACCEPT APPLICATION
   * ============================================================
   */
  const acceptApplication = useCallback(
    async (id: string): Promise<void> => {
      setActionLoading(true);

      try {
        await joiningApprovalService.acceptApplication(id);

        await Promise.all([
          fetchData(),
          fetchStats(),
        ]);
      } catch (error) {
        console.error(
          'Failed to approve application:',
          error,
        );

        throw error;
      } finally {
        setActionLoading(false);
      }
    },
    [
      fetchData,
      fetchStats,
    ],
  );

  /**
   * ============================================================
   * REJECT APPLICATION
   * ============================================================
   */
  const rejectApplication = useCallback(
    async (id: string): Promise<void> => {
      setActionLoading(true);

      try {
        await joiningApprovalService.rejectApplication(id);

        await Promise.all([
          fetchData(),
          fetchStats(),
        ]);
      } catch (error) {
        console.error(
          'Failed to reject application:',
          error,
        );

        throw error;
      } finally {
        setActionLoading(false);
      }
    },
    [
      fetchData,
      fetchStats,
    ],
  );

  /**
   * ============================================================
   * PUT APPLICATION ON HOLD
   * ============================================================
   */
  const holdApplication = useCallback(
    async (id: string): Promise<void> => {
      setActionLoading(true);

      try {
        await joiningApprovalService.holdApplication(id);

        await Promise.all([
          fetchData(),
          fetchStats(),
        ]);
      } catch (error) {
        console.error(
          'Failed to put application on hold:',
          error,
        );

        throw error;
      } finally {
        setActionLoading(false);
      }
    },
    [
      fetchData,
      fetchStats,
    ],
  );


  /**
 * ============================================================
 * SEND JOINING FORM
 * ============================================================
 */
const sendJoiningForm = useCallback(
  async (id: string): Promise<void> => {

    setActionLoading(true);

    try {

      await joiningApprovalService.sendJoiningForm(
        id,
      );

    } catch (error) {

      console.error(
        'Failed to send joining form:',
        error,
      );

      throw error;

    } finally {

      setActionLoading(false);

    }
  },
  [],
);
  /**
   * ============================================================
   * UPDATE CANDIDATE
   * ============================================================
   *
   * Currently frontend-managed.
   *
   * This updates:
   *
   * - joiningDate
   * - remark
   *
   * for the currently displayed row.
   */
  const updateCandidate = useCallback(
  async (
    id: string,
    changes: Partial<JoiningApproval>,
  ): Promise<void> => {
    setActionLoading(true);

    try {
      const existingCandidate = candidates.find(
        candidate => candidate.id === id,
      );

      if (!existingCandidate) {
        throw new Error(
          `Candidate with id ${id} not found`,
        );
      }

      const payload = {
        position_applied_for:
          changes.designation !== undefined
            ? changes.designation
            : existingCandidate.designation,

        joining_date:
          changes.joiningDate !== undefined
            ? changes.joiningDate
            : existingCandidate.joiningDate || null,

        remark:
          changes.remark !== undefined
            ? changes.remark
            : existingCandidate.remark || null,

        reporting_manager_status:
          changes.reportingManagerStatus !== undefined
            ? changes.reportingManagerStatus
            : existingCandidate.reportingManagerStatus,

        reporting_manager_remark:
          changes.reportingManagerRemark !== undefined
            ? changes.reportingManagerRemark
            : existingCandidate.reportingManagerRemark,

        team_manager_status:
          changes.teamManagerStatus !== undefined
            ? changes.teamManagerStatus
            : existingCandidate.teamManagerStatus,

        team_manager_remark:
          changes.teamManagerRemark !== undefined
            ? changes.teamManagerRemark
            : existingCandidate.teamManagerRemark,

        hr_status:
          changes.hrStatus !== undefined
            ? changes.hrStatus
            : existingCandidate.hrStatus,

        hr_remark:
          changes.hrRemark !== undefined
            ? changes.hrRemark
            : existingCandidate.hrRemark,
      };

      console.log(
        'Update Application Payload:',
        payload,
      );

      await joiningApprovalService.updateApplication(
        id,
        {
          position_applied_for:
            payload.position_applied_for,

          joining_date:
            payload.joining_date,

          remark:
            payload.remark,

          reporting_manager_status:
            payload.reporting_manager_status,

          reporting_manager_remark:
            payload.reporting_manager_remark,

          team_manager_status:
            payload.team_manager_status,

          team_manager_remark:
            payload.team_manager_remark,

          hr_status:
            payload.hr_status,

          hr_remark:
            payload.hr_remark,
        },
      );

      await Promise.all([
        fetchData(),
        fetchStats(),
      ]);

    } catch (error) {
      console.error(
        'Failed to update job application:',
        error,
      );

      throw error;

    } finally {
      setActionLoading(false);
    }
  },
  [
    candidates,
    fetchData,
    fetchStats,
  ],
);

  /**
   * ============================================================
   * DELETE CANDIDATE
   * ============================================================
   *
   * Currently frontend-managed because there is no DELETE
   * endpoint in the supplied backend service.
   *//**
 * ============================================================
 * DELETE CANDIDATE
 * ============================================================
 */
const deleteCandidate = useCallback(
  async (id: string): Promise<void> => {
    setActionLoading(true);

    try {
      await joiningApprovalService.deleteApplication(
        id,
      );

      await Promise.all([
        fetchData(),
        fetchStats(),
      ]);
    } catch (error) {
      console.error(
        'Failed to delete job application:',
        error,
      );

      throw error;
    } finally {
      setActionLoading(false);
    }
  },
  [
    fetchData,
    fetchStats,
  ],
);

  /**
   * ============================================================
   * APPLY FILTERS
   * ============================================================
   */
  const applyFilters = useCallback(
    (
      newFilters: JoiningApprovalFilters,
    ): void => {
      setFilters(newFilters);

      setPagination(
        previous => ({
          ...previous,
          currentPage: 1,
        }),
      );
    },
    [],
  );

  /**
   * ============================================================
   * RESET FILTERS
   * ============================================================
   */
  const resetFilters = useCallback(
    (): void => {
      setFilters({});

      setSearchTerm('');

      setPagination(
        previous => ({
          ...previous,
          currentPage: 1,
        }),
      );
    },
    [],
  );

  /**
   * ============================================================
   * SEARCH
   * ============================================================
   */
  const handleSearch = useCallback(
    (term: string): void => {
      setSearchTerm(term);

      setPagination(
        previous => ({
          ...previous,
          currentPage: 1,
        }),
      );
    },
    [],
  );

  /**
   * ============================================================
   * PAGINATION
   * ============================================================
   */
  const goToPage = useCallback(
    (page: number): void => {
      if (!Number.isInteger(page)) {
        return;
      }

      if (page < 1) {
        return;
      }

      const totalPages =
        Math.max(
          1,
          Math.ceil(
            total /
              pagination.pageSize,
          ),
        );

      if (page > totalPages) {
        return;
      }

      setPagination(
        previous => ({
          ...previous,
          currentPage: page,
        }),
      );
    },
    [
      total,
      pagination.pageSize,
    ],
  );

  /**
   * ============================================================
   * RETURN
   * ============================================================
   */
  return {
  loading,
  actionLoading,

  candidates,
  total,

  designations,
    departments,

  stats,

  filters,
  searchTerm,

  pagination,

  applyFilters,
  resetFilters,
  handleSearch,
  goToPage,

  acceptApplication,
  rejectApplication,
  holdApplication,
  sendJoiningForm,

  updateCandidate,
  deleteCandidate,
};
}