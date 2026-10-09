import axios from 'axios';

import axiosInstance from '../../../../services/axios/axiosInstance';

import type {
  SubCategory,
  SubCategoryApiRecord,
  CreateSubCategoryRequest,
} from '../types/subCategory.types';

const SUB_CATEGORY_ENDPOINT =
  '/api/v1/expenses/sub-categories';

const mapSubCategory = (
  item: SubCategoryApiRecord,
): SubCategory => {
  const rawStatus = item.status;

  /**
   * Convert every possible backend status
   * into a string to avoid TypeScript comparison errors.
   */
  const normalizedStatus = String(
    rawStatus ?? '',
  )
    .trim()
    .toLowerCase();

  const isActive =
    item.is_active !== undefined
      ? Boolean(item.is_active)
      : normalizedStatus === '1' ||
        normalizedStatus === 'true' ||
        normalizedStatus === 'active';

  return {
    id:
      item.id ??
      item.sub_category_id ??
      0,

    categoryId:
      item.category_id ??
      0,

    name:
      item.name ??
      item.sub_category_name ??
      '',

    status: isActive
      ? 'Active'
      : 'Inactive',
  };
};

const getErrorMessage = (
  error: unknown,
): string => {
  if (axios.isAxiosError(error)) {
    const detail =
      error.response?.data?.detail;

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
      typeof error.response?.data?.message ===
      'string'
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
};

export const subCategoryService = {
  /**
   * GET all subcategories
   */
  async getAll(): Promise<SubCategory[]> {
    try {
      const response =
        await axiosInstance.get<
          SubCategoryApiRecord[]
        >(SUB_CATEGORY_ENDPOINT);

      return response.data.map(mapSubCategory);
    } catch (error) {
      throw new Error(
        getErrorMessage(error),
      );
    }
  },

  /**
   * GET subcategories by category
   */
  async getByCategory(
    categoryId: number,
  ): Promise<SubCategory[]> {
    try {
      const response =
        await axiosInstance.get<
          SubCategoryApiRecord[]
        >(SUB_CATEGORY_ENDPOINT, {
          params: {
            category_id: categoryId,
          },
        });

      return response.data.map(mapSubCategory);
    } catch (error) {
      throw new Error(
        getErrorMessage(error),
      );
    }
  },

  /**
   * POST create subcategory
   */
  async create(
    payload: CreateSubCategoryRequest,
  ): Promise<SubCategory> {
    try {
      const response =
        await axiosInstance.post<SubCategoryApiRecord>(
          SUB_CATEGORY_ENDPOINT,
          {
            category_id: payload.categoryId,
            sub_category_name:
              payload.subCategoryName.trim(),
          },
        );

      return mapSubCategory(response.data);
    } catch (error) {
      throw new Error(
        getErrorMessage(error),
      );
    }
  },

  /**
   * PUT update subcategory
   */
  async update(
    id: number,
    categoryId: number,
    subCategoryName: string,
  ): Promise<SubCategory> {
    try {
      const response =
        await axiosInstance.put<SubCategoryApiRecord>(
          `${SUB_CATEGORY_ENDPOINT}/${id}`,
          {
            category_id: categoryId,
            sub_category_name:
              subCategoryName.trim(),
          },
        );

      return mapSubCategory(response.data);
    } catch (error) {
      throw new Error(
        getErrorMessage(error),
      );
    }
  },

  /**
   * PATCH toggle subcategory status
   */
  async toggleStatus(
    id: number,
  ): Promise<SubCategory> {
    try {
      const response =
        await axiosInstance.patch<SubCategoryApiRecord>(
          `${SUB_CATEGORY_ENDPOINT}/${id}/status`,
        );

      return mapSubCategory(response.data);
    } catch (error) {
      throw new Error(
        getErrorMessage(error),
      );
    }
  },
};