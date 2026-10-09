import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import type { SubCategory } from '../types/subCategory.types';

import { subCategoryService } from '../services/subCategory.service';

import {
  filterSubCategories,
  paginateSubCategories,
} from '../utils/subCategory.utils';

import { DEFAULT_SUB_CATEGORY_PAGE_SIZE } from '../constants/subCategory.constants';

interface UseSubCategoryResult {
  subCategories: SubCategory[];
  visibleSubCategories: SubCategory[];

  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;

  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;

  pageSize: number;
  setPageSize: React.Dispatch<React.SetStateAction<number>>;

  totalEntries: number;
  totalPages: number;

  loading: boolean;
  creating: boolean;
  updatingStatusId: number | null;
  error: string | null;

  refresh: () => Promise<void>;

  createSubCategory: (
    categoryId: number,
    subCategoryName: string,
  ) => Promise<void>;

  toggleSubCategoryStatus: (
    id: number,
  ) => Promise<void>;
}

export const useSubCategory = (): UseSubCategoryResult => {
  const [subCategories, setSubCategories] = useState<
    SubCategory[]
  >([]);

  const [search, setSearch] = useState('');

  const [page, setPage] = useState(1);

  const [pageSize, setPageSize] = useState(
    DEFAULT_SUB_CATEGORY_PAGE_SIZE,
  );

  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);

  const [updatingStatusId, setUpdatingStatusId] =
    useState<number | null>(null);

  const [error, setError] = useState<string | null>(
    null,
  );

  const loadSubCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await subCategoryService.getAll();

      setSubCategories(data);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to load sub categories.';

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const createSubCategory = useCallback(
    async (
      categoryId: number,
      subCategoryName: string,
    ): Promise<void> => {
      try {
        setCreating(true);
        setError(null);

        await subCategoryService.create({
          categoryId,
          subCategoryName:
            subCategoryName.trim(),
        });

        await loadSubCategories();

        setPage(1);
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to create sub category.';

        setError(message);

        throw new Error(message);
      } finally {
        setCreating(false);
      }
    },
    [loadSubCategories],
  );

  const toggleSubCategoryStatus = useCallback(
    async (id: number): Promise<void> => {
      try {
        setUpdatingStatusId(id);
        setError(null);

        const updated =
          await subCategoryService.toggleStatus(id);

        setSubCategories((current) =>
          current.map((item) =>
            item.id === id
              ? updated
              : item,
          ),
        );
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to update subcategory status.';

        setError(message);

        throw new Error(message);
      } finally {
        setUpdatingStatusId(null);
      }
    },
    [],
  );

  useEffect(() => {
    void loadSubCategories();
  }, [loadSubCategories]);

  const filteredSubCategories = useMemo(
    () =>
      filterSubCategories(
        subCategories,
        search,
      ),
    [subCategories, search],
  );

  const visibleSubCategories = useMemo(
    () =>
      paginateSubCategories(
        filteredSubCategories,
        page,
        pageSize,
      ),
    [
      filteredSubCategories,
      page,
      pageSize,
    ],
  );

  const totalEntries =
    filteredSubCategories.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalEntries / pageSize),
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  useEffect(() => {
    setPage(1);
  }, [search, pageSize]);

  return {
    subCategories,
    visibleSubCategories,

    search,
    setSearch,

    page,
    setPage,

    pageSize,
    setPageSize,

    totalEntries,
    totalPages,

    loading,
    creating,
    updatingStatusId,
    error,

    refresh: loadSubCategories,

    createSubCategory,
    toggleSubCategoryStatus,
  };
};