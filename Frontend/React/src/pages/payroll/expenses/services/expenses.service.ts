import axiosInstance from "../../../../services/axios/axiosInstance";

import type {
  Expense,
  ExpenseCreateRequest,
  ExpenseUpdateRequest,
} from "../types/expenses.types";

const EXPENSES_ENDPOINT = "/api/v1/expenses";

const CATEGORIES_ENDPOINT = `${EXPENSES_ENDPOINT}/categories`;
const SUB_CATEGORIES_ENDPOINT = `${EXPENSES_ENDPOINT}/subcategories`;

interface BackendExpenseResponse {
  id: number | string;
  type?: number | string;

  description?: string;

  category_id?: number | null;
  sub_category_id?: number | null;

  category_name?: string | null;
  sub_category_name?: string | null;

  amount?: number | string | null;

  expense_from?: string;
  expense_to?: string;

  location?: string | null;
  on_site_location?: string | null;

  bill?: string | null;
  bill1?: string | null;
  bill2?: string | null;
  bill3?: string | null;
  bill4?: string | null;

  status_hr?: number | null;
  status_promoter?: number | null;

  created_on?: string;
  modified_on?: string;
}

interface BackendCategoryResponse {
  id?: number;
  category_id?: number;
  categoryId?: number;

  name?: string;
  category_name?: string;
  categoryName?: string;
}

interface BackendSubCategoryResponse {
  id?: number;
  sub_category_id?: number;

  name?: string;
  sub_category_name?: string;
  subCategoryName?: string;

  category_id?: number;
  categoryId?: number;
}

type BackendListResponse<T> =
  | T[]
  | {
      data?: T[];
      items?: T[];
      results?: T[];
    };

const getFileNameFromUrl = (
  url: string,
  fallbackName: string,
): string => {
  const cleanUrl = url.split("?")[0];

  return cleanUrl.split("/").pop() || fallbackName;
};

const normalizeText = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[_-]/g, " ")
    .replace(/\s+/g, " ");
};

const extractList = <T>(
  response: BackendListResponse<T>,
): T[] => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (Array.isArray(response.items)) {
    return response.items;
  }

  if (Array.isArray(response.results)) {
    return response.results;
  }

  return [];
};

const getExpenseStatus = (
  item: BackendExpenseResponse,
): Expense["status"] => {
  const statusHr = item.status_hr;
  const statusPromoter = item.status_promoter;

  if (
    statusHr === 12 ||
    statusPromoter === 12
  ) {
    return "Rejected";
  }

  if (
    statusHr === 11 ||
    statusPromoter === 11
  ) {
    return "Approved";
  }

  return "Pending";
};

const mapExpenseResponse = (
  item: BackendExpenseResponse,
): Expense => {
  const billUrls = [
    item.bill,
    item.bill1,
    item.bill2,
    item.bill3,
    item.bill4,
  ].filter(
    (url): url is string => Boolean(url),
  );

  return {
    id: String(item.id),

    type:
      item.type !== undefined &&
      item.type !== null
        ? String(item.type)
        : "",

    description: item.description ?? "",

    categoryId: item.category_id ?? null,

    subCategoryId:
      item.sub_category_id ?? null,

    category:
      item.category_name ?? undefined,

    subCategory:
      item.sub_category_name ?? undefined,

    amount:
      item.amount !== null &&
      item.amount !== undefined
        ? Number(item.amount)
        : undefined,

    expenseFrom: item.expense_from,
    expenseTo: item.expense_to,

    onSiteLocation:
      item.location ??
      item.on_site_location ??
      undefined,

    attachments: billUrls.map(
      (url, index) => ({
        id: `${item.id}-${index + 1}`,

        fileName: getFileNameFromUrl(
          url,
          `bill-${index + 1}`,
        ),

        fileSize: 0,
        fileType: "",
      }),
    ),

    status: getExpenseStatus(item),

    createdAt: item.created_on,
    updatedAt: item.modified_on,
  };
};

/**
 * Extract category name from backend response.
 */
const getCategoryName = (
  category: BackendCategoryResponse,
): string => {
  return (
    category.name ??
    category.category_name ??
    category.categoryName ??
    ""
  );
};

/**
 * Extract category ID from backend response.
 */
const getCategoryId = (
  category: BackendCategoryResponse,
): number | null => {
  const id =
    category.id ??
    category.category_id ??
    category.categoryId;

  return id !== undefined && id !== null
    ? Number(id)
    : null;
};

/**
 * Extract sub-category name from backend response.
 */
const getSubCategoryName = (
  subCategory: BackendSubCategoryResponse,
): string => {
  return (
    subCategory.name ??
    subCategory.sub_category_name ??
    subCategory.subCategoryName ??
    ""
  );
};

/**
 * Extract sub-category ID from backend response.
 */
const getSubCategoryId = (
  subCategory: BackendSubCategoryResponse,
): number | null => {
  const id =
    subCategory.id ??
    subCategory.sub_category_id;

  return id !== undefined && id !== null
    ? Number(id)
    : null;
};

/**
 * Resolve category ID from category name.
 *
 * Supports exact matching and partial matching.
 *
 * Example:
 * Frontend: Business Travel
 * Backend: Travel
 */
const resolveCategoryId = async (
  categoryName: string,
): Promise<number> => {
  const response =
    await axiosInstance.get<
      BackendListResponse<BackendCategoryResponse>
    >(CATEGORIES_ENDPOINT);

  const categories = extractList(
    response.data,
  );

  const selectedName = normalizeText(
    categoryName,
  );

  let selectedCategory =
    categories.find((category) => {
      const backendName = normalizeText(
        getCategoryName(category),
      );

      return backendName === selectedName;
    });

  /**
   * Fallback partial matching.
   */
  if (!selectedCategory) {
    selectedCategory = categories.find(
      (category) => {
        const backendName = normalizeText(
          getCategoryName(category),
        );

        return (
          backendName.includes(selectedName) ||
          selectedName.includes(backendName)
        );
      },
    );
  }

  const categoryId = selectedCategory
    ? getCategoryId(selectedCategory)
    : null;

  if (!categoryId) {
    const availableCategories =
      categories
        .map(getCategoryName)
        .filter(Boolean)
        .join(", ");

    throw new Error(
      `Category "${categoryName}" was not found. Available backend categories: ${
        availableCategories || "None"
      }`,
    );
  }

  return categoryId;
};

/**
 * Resolve sub-category ID from sub-category name.
 *
 * IMPORTANT:
 * category_id is sent as a query parameter
 * because the backend requires it.
 */
const resolveSubCategoryId = async (
  subCategoryName: string,
  categoryId: number,
): Promise<number> => {
  const response =
    await axiosInstance.get<
      BackendListResponse<BackendSubCategoryResponse>
    >(SUB_CATEGORIES_ENDPOINT, {
      params: {
        category_id: categoryId,
      },
    });

  const subCategories = extractList(
    response.data,
  );

  const selectedName = normalizeText(
    subCategoryName,
  );

  const selectedSubCategory =
    subCategories.find((subCategory) => {
      const backendName = normalizeText(
        getSubCategoryName(subCategory),
      );

      const parentCategoryId =
        subCategory.category_id ??
        subCategory.categoryId;

      const isSameName =
        backendName === selectedName ||
        backendName.includes(selectedName) ||
        selectedName.includes(backendName);

      const isSameCategory =
        parentCategoryId === undefined ||
        parentCategoryId === null ||
        Number(parentCategoryId) ===
          Number(categoryId);

      return isSameName && isSameCategory;
    });

  const subCategoryId = selectedSubCategory
    ? getSubCategoryId(selectedSubCategory)
    : null;

  if (!subCategoryId) {
    const availableSubCategories =
      subCategories
        .map(getSubCategoryName)
        .filter(Boolean)
        .join(", ");

    throw new Error(
      `Sub-category "${subCategoryName}" was not found. Available sub-categories: ${
        availableSubCategories || "None"
      }`,
    );
  }

  return subCategoryId;
};

export const expensesService = {
  async getExpenses(): Promise<Expense[]> {
    const response =
      await axiosInstance.get<
        BackendListResponse<BackendExpenseResponse>
      >(EXPENSES_ENDPOINT);

    const expenses = extractList(
      response.data,
    );

    return expenses.map(
      mapExpenseResponse,
    );
  },

  async getExpenseById(
    id: string,
  ): Promise<Expense> {
    const response =
      await axiosInstance.get<
        BackendExpenseResponse
      >(
        `${EXPENSES_ENDPOINT}/${encodeURIComponent(id)}`,
      );

    return mapExpenseResponse(
      response.data,
    );
  },

  async createExpense(
    payload: ExpenseCreateRequest,
  ): Promise<Expense> {
    if (!payload.category.trim()) {
      throw new Error(
        "Please select a valid category.",
      );
    }

    if (
      !payload.files ||
      payload.files.length === 0
    ) {
      throw new Error(
        "Please upload at least one attachment.",
      );
    }

    /**
     * Resolve category ID from selected
     * frontend category name.
     */
    let categoryId = payload.categoryId;

    if (
      categoryId === null ||
      categoryId === undefined
    ) {
      categoryId = await resolveCategoryId(
        payload.category,
      );
    }

    /**
     * Resolve sub-category ID when selected.
     */
    let subCategoryId =
      payload.subCategoryId;

    if (
      payload.subCategory.trim() &&
      (subCategoryId === null ||
        subCategoryId === undefined)
    ) {
      subCategoryId =
        await resolveSubCategoryId(
          payload.subCategory,
          Number(categoryId),
        );
    }

    const formData = new FormData();

    /**
     * Backend expects integer type.
     *
     * 0 = admin entry
     * employee ID = employee entry
     */
    formData.append(
      "type",
      String(payload.backendType ?? 0),
    );

    formData.append(
      "description",
      payload.description.trim(),
    );

    formData.append(
      "category_id",
      String(categoryId),
    );

    if (
      subCategoryId !== null &&
      subCategoryId !== undefined
    ) {
      formData.append(
        "sub_category_id",
        String(subCategoryId),
      );
    }

    formData.append(
      "amount",
      String(payload.amount ?? 0),
    );

    formData.append(
      "expense_from",
      payload.expenseFrom,
    );

    formData.append(
      "expense_to",
      payload.expenseTo,
    );

    if (payload.onSiteLocation.trim()) {
      formData.append(
        "location",
        payload.onSiteLocation.trim(),
      );
    }

    payload.files
      .slice(0, 5)
      .forEach((file, index) => {
        const fieldName =
          index === 0
            ? "bill"
            : `bill${index}`;

        formData.append(
          fieldName,
          file,
        );
      });

    const response =
      await axiosInstance.post<
        BackendExpenseResponse
      >(
        EXPENSES_ENDPOINT,
        formData,
      );

    return mapExpenseResponse(
      response.data,
    );
  },

  async updateExpense(
    _id: string,
    _payload: ExpenseUpdateRequest,
  ): Promise<Expense> {
    throw new Error(
      "Expense editing is not supported by the current backend API.",
    );
  },

  async deleteExpense(
    id: string,
  ): Promise<void> {
    await axiosInstance.delete(
      `${EXPENSES_ENDPOINT}/${encodeURIComponent(id)}`,
    );
  },
};