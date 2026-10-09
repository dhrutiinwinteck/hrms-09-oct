import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { categoryService } from '../services/category.service';
import type {
  Category,
  CategoryFormValues,
} from '../types/category.types';
import {
  mapFormToCreateRequest,
  mapFormToUpdateRequest,
} from '../utils/category.mapper';

interface UseCategoryResult {
  categories: Category[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createCategory: (values: CategoryFormValues) => Promise<void>;
  updateCategory: (
    id: string,
    values: CategoryFormValues,
  ) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
}

export function useCategory(): UseCategoryResult {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Unable to load categories.';

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const createCategory = useCallback(
    async (values: CategoryFormValues) => {
      setSaving(true);
      setError(null);

      try {
        const created = await categoryService.createCategory(
          mapFormToCreateRequest(values),
        );

        setCategories((current) => [...current, created]);
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : 'Unable to create category.';

        setError(message);
        throw requestError;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const updateCategory = useCallback(
    async (id: string, values: CategoryFormValues) => {
      setSaving(true);
      setError(null);

      try {
        const updated = await categoryService.updateCategory(
          id,
          mapFormToUpdateRequest(values),
        );

        setCategories((current) =>
          current.map((category) =>
            category.id === id ? updated : category,
          ),
        );
      } catch (requestError) {
        const message =
          requestError instanceof Error
            ? requestError.message
            : 'Unable to update category.';

        setError(message);
        throw requestError;
      } finally {
        setSaving(false);
      }
    },
    [],
  );

  const deleteCategory = useCallback(async (id: string) => {
    setSaving(true);
    setError(null);

    try {
      await categoryService.deleteCategory(id);

      setCategories((current) =>
        current.filter((category) => category.id !== id),
      );
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Unable to delete category.';

      setError(message);
      throw requestError;
    } finally {
      setSaving(false);
    }
  }, []);

  return useMemo(
    () => ({
      categories,
      loading,
      saving,
      error,
      refresh,
      createCategory,
      updateCategory,
      deleteCategory,
    }),
    [
      categories,
      loading,
      saving,
      error,
      refresh,
      createCategory,
      updateCategory,
      deleteCategory,
    ],
  );
}