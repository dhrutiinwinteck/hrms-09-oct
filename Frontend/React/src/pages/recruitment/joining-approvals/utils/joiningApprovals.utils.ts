import {
  useState,
  useEffect,
  useCallback,
} from 'react';

import {
  JoiningApproval,
  JoiningApprovalFilters,
  JoiningApprovalStats,
  PaginationState,
} from '../types/joiningApprovals.types';



import {
  DEFAULT_PAGE_SIZE,
} from '../constants/joiningApprovals.constants';

import {
  joiningApprovalService,
} from '../services/joiningApprovals.service';

const service = joiningApprovalService;

export function useJoiningApprovals() {
  const [loading, setLoading] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [candidates, setCandidates] =
    useState<JoiningApproval[]>([]);

  const [total, setTotal] =
    useState(0);

  const [stats, setStats] =
    useState<JoiningApprovalStats>({
      pending: 0,
      approved: 0,
      rejected: 0,
      onHold: 0,
    });

  const [filters, setFilters] =
    useState<JoiningApprovalFilters>({});

  const [searchTerm, setSearchTerm] =
    useState('');

  const [pagination, setPagination] =
    useState<PaginationState>({
      currentPage: 1,
      pageSize: DEFAULT_PAGE_SIZE,
      totalItems: 0,
    });

  /**
   * ==========================================================
   * FETCH APPLICATIONS
   * ==========================================================
   */

  const fetchData =
    useCallback(async () => {
      setLoading(true);

      try {
        const result =
          await service.getJoiningApprovals(
            filters,
            searchTerm,
            pagination.currentPage,
            pagination.pageSize
          );

        setCandidates(
          result.items
        );

        setTotal(
          result.total
        );

        setPagination(
          previous => ({
            ...previous,
            totalItems:
              result.total,
          })
        );
      } catch (error) {
        console.error(
          'Failed to fetch joining approvals:',
          error
        );
      } finally {
        setLoading(false);
      }
    }, [
      filters,
      searchTerm,
      pagination.currentPage,
      pagination.pageSize,
    ]);

  /**
   * ==========================================================
   * FETCH STATISTICS
   * ==========================================================
   */

  const fetchStats =
    useCallback(async () => {
      try {
        const statsData =
          await service.getStats();

        setStats(
          statsData
        );
      } catch (error) {
        console.error(
          'Failed to fetch joining approval statistics:',
          error
        );
      }
    }, []);

  /**
   * ==========================================================
   * INITIAL LOAD
   * ==========================================================
   */

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /**
   * ==========================================================
   * ACCEPT
   * ==========================================================
   */

  const acceptApplication =
    useCallback(
      async (id: string) => {
        setActionLoading(true);

        try {
          await service.acceptApplication(
            id
          );

          await Promise.all([
            fetchData(),
            fetchStats(),
          ]);
        } catch (error) {
          console.error(
            'Failed to approve application:',
            error
          );

          throw error;
        } finally {
          setActionLoading(false);
        }
      },
      [
        fetchData,
        fetchStats,
      ]
    );

  /**
   * ==========================================================
   * REJECT
   * ==========================================================
   */

  const rejectApplication =
    useCallback(
      async (id: string) => {
        setActionLoading(true);

        try {
          await service.rejectApplication(
            id
          );

          await Promise.all([
            fetchData(),
            fetchStats(),
          ]);
        } catch (error) {
          console.error(
            'Failed to reject application:',
            error
          );

          throw error;
        } finally {
          setActionLoading(false);
        }
      },
      [
        fetchData,
        fetchStats,
      ]
    );

  /**
   * ==========================================================
   * ON HOLD
   * ==========================================================
   */

  const holdApplication =
    useCallback(
      async (id: string) => {
        setActionLoading(true);

        try {
          await service.holdApplication(
            id
          );

          await Promise.all([
            fetchData(),
            fetchStats(),
          ]);
        } catch (error) {
          console.error(
            'Failed to put application on hold:',
            error
          );

          throw error;
        } finally {
          setActionLoading(false);
        }
      },
      [
        fetchData,
        fetchStats,
      ]
    );

  /**
   * ==========================================================
   * UPDATE TABLE DATA
   * ==========================================================
   *
   * Currently frontend-only.
   *
   * This updates joiningDate and remark in the
   * currently displayed table.
   */

  const updateCandidate =
    useCallback(
      (
        id: string,
        changes: Partial<JoiningApproval>
      ) => {
        setCandidates(
          previous =>
            previous.map(candidate =>
              candidate.id === id
                ? {
                    ...candidate,
                    ...changes,
                  }
                : candidate
            )
        );
      },
      []
    );

  /**
   * ==========================================================
   * DELETE TABLE ROW
   * ==========================================================
   *
   * Currently frontend-only because no DELETE endpoint
   * was provided by the backend.
   */

  const deleteCandidate =
    useCallback(
      (id: string) => {
        setCandidates(
          previous =>
            previous.filter(
              candidate =>
                candidate.id !== id
            )
        );

        setTotal(
          previous =>
            Math.max(0, previous - 1)
        );

        setPagination(
          previous => ({
            ...previous,
            totalItems:
              Math.max(
                0,
                previous.totalItems - 1
              ),
          })
        );
      },
      []
    );

  /**
   * ==========================================================
   * FILTER
   * ==========================================================
   */

  const applyFilters =
    useCallback(
      (
        newFilters: JoiningApprovalFilters
      ) => {
        setFilters(
          newFilters
        );

        setPagination(
          previous => ({
            ...previous,
            currentPage: 1,
          })
        );
      },
      []
    );

  /**
   * ==========================================================
   * RESET
   * ==========================================================
   */

  const resetFilters =
    useCallback(() => {
      setFilters({});
      setSearchTerm('');

      setPagination(
        previous => ({
          ...previous,
          currentPage: 1,
        })
      );
    }, []);

  /**
   * ==========================================================
   * SEARCH
   * ==========================================================
   */

  const handleSearch =
    useCallback(
      (term: string) => {
        setSearchTerm(
          term
        );

        setPagination(
          previous => ({
            ...previous,
            currentPage: 1,
          })
        );
      },
      []
    );

  /**
   * ==========================================================
   * PAGINATION
   * ==========================================================
   */

  const goToPage =
    useCallback(
      (page: number) => {
        setPagination(
          previous => ({
            ...previous,
            currentPage: page,
          })
        );
      },
      []
    );

  return {
    loading,
    actionLoading,

    candidates,
    total,

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

    updateCandidate,
    deleteCandidate,
  };
}