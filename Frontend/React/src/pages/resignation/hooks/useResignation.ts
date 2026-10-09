// ============================================================
// USE RESIGNATION HOOK
// Enterprise-grade custom hook for the Resignation module.
// Implements Clean Architecture, SOLID principles, and React 19 best practices.
// ============================================================

import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Resignation,
  ResignationStatistics,
  PaginationState,
  ResignationFilters,
  CreateResignationPayload,
} from '../types/resignation.types';
import { DEFAULT_FILTERS, DEFAULT_PAGE_SIZE, DEFAULT_PAGE_NUMBER } from '../constants/resignation.constants';
import ResignationService from '../services/resignation.service';

// ============================================================
// DEBOUNCE HELPER
// Manual implementation of a debounce function.
// ============================================================
const useDebounce = (value: string, delay: number): string => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// ============================================================
// CUSTOM HOOK DEFINITION
// ============================================================
/**
 * Custom hook managing the state and operations for the Resignation module.
 * 
 * This hook serves as the single source of truth for resignation data within the UI.
 * It communicates exclusively with the ResignationService and handles all state
 * management, filtering, pagination, and CRUD operations.
 * 
 * The hook ensures that the UI remains completely decoupled from the data source,
 * whether it's db.json or a FastAPI backend.
 * 
 * @returns {Object} Object containing state and functions for the resignation module.
 */
const useResignation = () => {
  // ============================================================
  // STATE MANAGEMENT
  // ============================================================
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  const [resignations, setResignations] = useState<Resignation[]>([]);
  const [statistics, setStatistics] = useState<ResignationStatistics>({
    totalRequests: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [departments, setDepartments] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<ResignationFilters>({
  status: undefined,
  department: undefined,
  search: '',
  startDate: undefined,
  endDate: undefined,
  sortBy: 'createdAt',
  sortDirection: 'desc',
  dateRange: { start: '', end: '' },
});

  const [pagination, setPagination] = useState<PaginationState>({
    page: DEFAULT_PAGE_NUMBER,
    limit: DEFAULT_PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });
  
  const [selectedResignation, setSelectedResignation] = useState<Resignation | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');

  // ============================================================
  // DEBOUNCE SEARCH
  // ============================================================
  const searchTerm = filters.search || '';
  const debouncedSearch = useDebounce(searchTerm, 300);

  // ============================================================
  // DATA FETCHING FUNCTIONS
  // ============================================================
  const fetchResignations = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ResignationService.getResignations(
        pagination.page,
        pagination.limit,
        filters,
        filters.sortBy || 'createdAt',
        (filters.sortDirection as 'asc' | 'desc') || 'desc'
      );
      
      setResignations(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load resignations.');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, filters, debouncedSearch]);

  const fetchStatistics = useCallback(async () => {
    try {
      const stats = await ResignationService.getDashboardStatistics();
      setStatistics(stats);
    } catch (err) {
      // Don't block the UI if statistics fail to load
      console.error('Failed to load statistics:', err);
    }
  }, []);

  const fetchDepartments = useCallback(async () => {
    try {
      const depts = await ResignationService.getDepartments();
      setDepartments(depts);
    } catch (err) {
      // Don't block the UI if departments fail to load
      console.error('Failed to load departments:', err);
    }
  }, []);

  // ============================================================
  // INITIAL LOAD
  // Load all data when the hook mounts
  // ============================================================
  useEffect(() => {
    const loadInitialData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await Promise.all([
          fetchResignations(),
          fetchStatistics(),
          fetchDepartments(),
        ]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load initial data.');
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [fetchResignations, fetchStatistics, fetchDepartments]);

  // ============================================================
  // FILTER UPDATES
  // Automatically reload data when filters change
  // ============================================================
  useEffect(() => {
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }));
      return;
    }
    fetchResignations();
  }, [debouncedSearch, filters.status, filters.department, filters.dateRange, filters.sortBy, filters.sortDirection]);

  // ============================================================
  // PAGINATION UPDATES
  // ============================================================
  useEffect(() => {
    fetchResignations();
  }, [pagination.page, pagination.limit]);

  // ============================================================
  // FILTER OPERATIONS
  // ============================================================
  const updateFilters = useCallback((newFilters: Partial<ResignationFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const search = useCallback((term: string) => {
    setFilters(prev => ({ ...prev, search: term }));
  }, []);

  const changePage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  }, [pagination.totalPages]);

  const changePageSize = useCallback((newSize: number) => {
    setPagination(prev => ({ ...prev, limit: newSize, page: 1 }));
  }, []);

  // ============================================================
  // REFRESH DATA
  // ============================================================
  const refreshData = useCallback(async () => {
    await Promise.all([
      fetchResignations(),
      fetchStatistics(),
      fetchDepartments(),
    ]);
  }, [fetchResignations, fetchStatistics, fetchDepartments]);

  // ============================================================
  // CRUD OPERATIONS
  // ============================================================
  const create = useCallback(async (payload: CreateResignationPayload) => {
    setLoading(true);
    setError(null);
    try {
      await ResignationService.createResignation(payload);
      setIsModalOpen(false);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create resignation.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  const update = useCallback(async (id: string, payload: Partial<CreateResignationPayload>) => {
    setLoading(true);
    setError(null);
    try {
      await ResignationService.updateResignation(id, payload);
      setIsModalOpen(false);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update resignation.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  const deleteResignation = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await ResignationService.deleteResignation(id);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete resignation.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  // ============================================================
  // STATUS TRANSITIONS
  // ============================================================
  const approve = useCallback(async (id: string, notes?: string) => {
    setLoading(true);
    setError(null);
    try {
      const approverId = 'current-user-id'; // In real app, get from auth context
      await ResignationService.approveResignation(id, { approverId, notes });
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to approve resignation.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  const reject = useCallback(async (id: string, reason: string) => {
    setLoading(true);
    setError(null);
    try {
      const approverId = 'current-user-id'; // In real app, get from auth context
      await ResignationService.rejectResignation(id, { approverId, reason });
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject resignation.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  const withdraw = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await ResignationService.withdrawResignation(id);
      await refreshData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to withdraw resignation.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  // ============================================================
  // ATTACHMENT OPERATIONS
  // ============================================================
  const downloadAttachment = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const blob = await ResignationService.downloadAttachment(id);
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `resignation-${id}-attachment.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to download attachment.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadAttachment = useCallback(async (file: File, id?: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await ResignationService.uploadAttachment(file, id);
      await refreshData();
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload attachment.');
      throw err;
    } finally {
      setLoading(false);
    }
  }, [refreshData]);

  // ============================================================
  // MODAL OPERATIONS
  // ============================================================
  const openModal = useCallback((mode: 'create' | 'edit' | 'view' = 'create', resignation?: Resignation) => {
    setSelectedResignation(resignation || null);
    setModalMode(mode);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedResignation(null);
  }, []);

  // ============================================================
  // RETURN VALUES
  // All state and functions exposed to UI components.
  // ============================================================
  return useMemo(() => ({
    // State
    loading,
    error,
    resignations,
    statistics,
    departments,
    filters,
    selectedResignation,
    isModalOpen,
    modalMode,
    pagination,
    currentPage: pagination.page,
    pageSize: pagination.limit,
    totalPages: pagination.totalPages,
    totalRecords: pagination.total,

    // Data Fetching
    refreshData,
    fetchResignations,
    fetchStatistics,
    fetchDepartments,

    // Filter Operations
    updateFilters,
    clearFilters,
    search,

    // Pagination Operations
    changePage,
    changePageSize,

    // CRUD Operations
    create,
    update,
    delete: deleteResignation,

    // Status Operations
    approve,
    reject,
    withdraw,

    // Attachment Operations
    downloadAttachment,
    uploadAttachment,

    // Modal Operations
    openModal,
    closeModal,
  }), [
    loading,
    error,
    resignations,
    statistics,
    departments,
    filters,
    selectedResignation,
    isModalOpen,
    modalMode,
    pagination,
    refreshData,
    fetchResignations,
    fetchStatistics,
    fetchDepartments,
    updateFilters,
    clearFilters,
    search,
    changePage,
    changePageSize,
    create,
    update,
    deleteResignation,
    approve,
    reject,
    withdraw,
    downloadAttachment,
    uploadAttachment,
    openModal,
    closeModal,
  ]);
};

export default useResignation;