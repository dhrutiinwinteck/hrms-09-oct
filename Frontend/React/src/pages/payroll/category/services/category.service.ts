import axios from 'axios';

import axiosInstance from '../../../../services/axios/axiosInstance';

import type {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '../types/category.types';

/**
 * Backend category endpoint
 *
 * Axios baseURL already comes from:
 * VITE_API_BASE_URL
 *
 * Example:
 * http://192.168.1.16:8001
 */
const CATEGORY_ENDPOINT = '/api/v1/expenses/categories';

/* ============================================================
   TYPES
============================================================ */

interface BackendCategoryResponse {
  id: number | string;
  category_name: string;
  status: unknown;
  created_at?: string | null;
  updated_at?: string | null;
}

/* ============================================================
   HELPERS
============================================================ */

function normalizeCategoryStatus(
  status: unknown,
): 'Active' | 'Inactive' {
  if (
    status === true ||
    status === 1 ||
    status === '1' ||
    String(status).toLowerCase() === 'active'
  ) {
    return 'Active';
  }

  return 'Inactive';
}

function mapBackendCategory(
  category: BackendCategoryResponse,
): Category {
  return {
    id: String(category.id),

    categoryName: category.category_name,

    status: normalizeCategoryStatus(category.status),

    createdAt: category.created_at ?? '',

    updatedAt: category.updated_at ?? '',
  };
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;

    if (typeof detail === 'string') {
      return detail;
    }

    if (Array.isArray(detail)) {
      return (
        detail
          .map((item) => item?.msg)
          .filter(Boolean)
          .join(', ') ||
        error.message
      );
    }

    if (
      typeof error.response?.data?.message === 'string'
    ) {
      return error.response.data.message;
    }

    if (error.response?.status) {
      return `Request failed with status ${error.response.status}`;
    }

    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
}

/* ============================================================
   CATEGORY SERVICE
============================================================ */

export const categoryService = {
  /**
   * GET /api/v1/expenses/categories
   */
  async getCategories(
    activeOnly = false,
  ): Promise<Category[]> {
    try {
      const response = await axiosInstance.get<
        BackendCategoryResponse[]
      >(CATEGORY_ENDPOINT, {
        params: {
          active_only: activeOnly,
        },
      });

      return response.data.map(mapBackendCategory);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * GET /api/v1/expenses/categories/{category_id}
   */
  async getCategory(id: string): Promise<Category> {
    try {
      const response =
        await axiosInstance.get<BackendCategoryResponse>(
          `${CATEGORY_ENDPOINT}/${id}`,
        );

      return mapBackendCategory(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * POST /api/v1/expenses/categories
   *
   * Backend expects:
   * {
   *   "category_name": "Travel"
   * }
   */
  async createCategory(
    payload: CreateCategoryRequest,
  ): Promise<Category> {
    try {
      const response =
        await axiosInstance.post<BackendCategoryResponse>(
          CATEGORY_ENDPOINT,
          {
            category_name: payload.categoryName.trim(),
          },
        );

      return mapBackendCategory(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * PUT /api/v1/expenses/categories/{category_id}
   *
   * Backend uses PUT, not PATCH.
   */
  async updateCategory(
    id: string,
    payload: UpdateCategoryRequest,
  ): Promise<Category> {
    try {
      const response =
        await axiosInstance.put<BackendCategoryResponse>(
          `${CATEGORY_ENDPOINT}/${id}`,
          {
            category_name: payload.categoryName.trim(),
          },
        );

      return mapBackendCategory(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },

  /**
   * PATCH /api/v1/expenses/categories/{category_id}/status
   *
   * Backend status endpoint does not require a request body.
   */
  async toggleCategoryStatus(
    id: string,
  ): Promise<Category> {
    try {
      const response =
        await axiosInstance.patch<BackendCategoryResponse>(
          `${CATEGORY_ENDPOINT}/${id}/status`,
        );

      return mapBackendCategory(response.data);
    } catch (error) {
      throw new Error(getErrorMessage(error));
    }
  },
};