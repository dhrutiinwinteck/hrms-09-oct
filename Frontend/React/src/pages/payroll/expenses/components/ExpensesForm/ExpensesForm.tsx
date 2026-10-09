import React, {
  ChangeEvent,
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  CalendarDays,
  ChevronDown,
  FileText,
  Folder,
  MapPin,
  Paperclip,
  Tag,
} from "lucide-react";

import type { ExpenseCreateRequest } from "../../types/expenses.types";

import type { Category } from "../../../category/types/category.types";
import type { SubCategory } from "../../../sub-category/types/subCategory.types";

import { categoryService } from "../../../category/services/category.service";
import { subCategoryService } from "../../../sub-category/services/subCategory.service";

import { validateExpense } from "../../validations/expenses.schema";

import "./ExpensesForm.css";

interface ExpensesFormProps {
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (values: ExpenseCreateRequest) => Promise<void>;
}

interface AttachmentSlot {
  id: string;
  file: File | null;
}

const EXPENSE_TYPES = [
  "Travel",
  "Food",
  "Accommodation",
  "Internet",
  "Transportation",
  "Office Supplies",
  "Other",
];

const createInitialAttachments = (): AttachmentSlot[] =>
  Array.from({ length: 5 }, (_, index) => ({
    id: `attachment-${index + 1}`,
    file: null,
  }));

const initialValues: ExpenseCreateRequest = {
  type: "",
  backendType: 0,

  category: "",
  subCategory: "",

  categoryId: null,
  subCategoryId: null,

  expenseFrom: "",
  expenseTo: "",

  amount: undefined,

  files: [],

  onSiteLocation: "",
  description: "",

  employeeId: null,
};

/**
 * Safely get a subcategory's category ID.
 * Supports both camelCase and snake_case API responses.
 */
const getSubCategoryCategoryId = (
  subCategory: SubCategory,
): number | null => {
  const item = subCategory as unknown as Record<string, unknown>;

  const categoryId =
    item.categoryId ??
    item.category_id ??
    (typeof item.category === "object" &&
    item.category !== null
      ? (item.category as Record<string, unknown>).id
      : null);

  if (categoryId === null || categoryId === undefined) {
    return null;
  }

  const parsedId = Number(categoryId);

  return Number.isNaN(parsedId) ? null : parsedId;
};

/**
 * Safely get the subcategory display name.
 */
const getSubCategoryName = (
  subCategory: SubCategory,
): string => {
  const item = subCategory as unknown as Record<string, unknown>;

  return String(
    item.name ??
      item.subCategoryName ??
      item.sub_category_name ??
      "",
  );
};

/**
 * Safely get the subcategory ID.
 */
const getSubCategoryId = (
  subCategory: SubCategory,
): number | null => {
  const item = subCategory as unknown as Record<string, unknown>;

  const id = item.id ?? item.subCategoryId ?? item.sub_category_id;

  if (id === null || id === undefined) {
    return null;
  }

  const parsedId = Number(id);

  return Number.isNaN(parsedId) ? null : parsedId;
};

export const ExpensesForm: React.FC<ExpensesFormProps> = ({
  isSaving,
  onCancel,
  onSubmit,
}) => {
  const [values, setValues] =
    useState<ExpenseCreateRequest>(initialValues);

  const [errors, setErrors] =
    useState<Record<string, string>>({});

  const [attachments, setAttachments] =
    useState<AttachmentSlot[]>(
      createInitialAttachments,
    );

  const [categories, setCategories] =
    useState<Category[]>([]);

  const [subCategories, setSubCategories] =
    useState<SubCategory[]>([]);

  const [isCategoriesLoading, setIsCategoriesLoading] =
    useState(false);

  const [isSubCategoriesLoading, setIsSubCategoriesLoading] =
    useState(false);

  const [categoryLoadError, setCategoryLoadError] =
    useState("");

  const [subCategoryLoadError, setSubCategoryLoadError] =
    useState("");

  const fileInputRefs =
    useRef<Array<HTMLInputElement | null>>([]);

  /**
   * Load active categories.
   */
  useEffect(() => {
    let isMounted = true;

    const loadCategories = async () => {
      try {
        setIsCategoriesLoading(true);
        setCategoryLoadError("");

        const response =
          await categoryService.getCategories(true);

        if (isMounted) {
          setCategories(response);
        }
      } catch (error) {
        if (isMounted) {
          setCategoryLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load categories.",
          );
        }
      } finally {
        if (isMounted) {
          setIsCategoriesLoading(false);
        }
      }
    };

    loadCategories();

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Load subcategories whenever category changes.
   */
  useEffect(() => {
    let isMounted = true;

    const loadSubCategories = async () => {
      const selectedCategoryId = values.categoryId;

      if (
        selectedCategoryId === null ||
        selectedCategoryId === undefined ||
        Number(selectedCategoryId) <= 0
      ) {
        setSubCategories([]);
        setIsSubCategoriesLoading(false);
        setSubCategoryLoadError("");
        return;
      }

      try {
        setIsSubCategoriesLoading(true);
        setSubCategoryLoadError("");

        const response =
          await subCategoryService.getAll();

        const filteredSubCategories =
          response.filter((subCategory) => {
            const subCategoryCategoryId =
              getSubCategoryCategoryId(subCategory);

            return (
              subCategoryCategoryId !== null &&
              subCategoryCategoryId ===
                Number(selectedCategoryId)
            );
          });

        if (isMounted) {
          setSubCategories(filteredSubCategories);
        }
      } catch (error) {
        if (isMounted) {
          setSubCategories([]);

          setSubCategoryLoadError(
            error instanceof Error
              ? error.message
              : "Unable to load subcategories.",
          );
        }
      } finally {
        if (isMounted) {
          setIsSubCategoriesLoading(false);
        }
      }
    };

    loadSubCategories();

    return () => {
      isMounted = false;
    };
  }, [values.categoryId]);

  /**
   * Update form values.
   */
  const updateValue = <
    K extends keyof ExpenseCreateRequest
  >(
    field: K,
    value: ExpenseCreateRequest[K],
  ) => {
    setValues((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => ({
      ...current,
      [field]: "",
    }));
  };

  /**
   * Handle category selection.
   */
  const handleCategoryChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    const categoryId = event.target.value
      ? Number(event.target.value)
      : null;

    const selectedCategory = categories.find(
      (category) =>
        Number(category.id) === categoryId,
    );

    setValues((current) => ({
      ...current,

      category:
        selectedCategory?.categoryName ?? "",

      categoryId,

      subCategory: "",
      subCategoryId: null,
    }));

    setSubCategories([]);
    setSubCategoryLoadError("");

    setErrors((current) => ({
      ...current,
      category: "",
      subCategory: "",
    }));
  };

  /**
   * Handle subcategory selection.
   */
  const handleSubCategoryChange = (
    event: ChangeEvent<HTMLSelectElement>,
  ) => {
    const subCategoryId = event.target.value
      ? Number(event.target.value)
      : null;

    const selectedSubCategory =
      subCategories.find(
        (subCategory) =>
          getSubCategoryId(subCategory) ===
          subCategoryId,
      );

    setValues((current) => ({
      ...current,

      subCategory: selectedSubCategory
        ? getSubCategoryName(selectedSubCategory)
        : "",

      subCategoryId,
    }));

    setErrors((current) => ({
      ...current,
      subCategory: "",
    }));
  };

  /**
   * Handle attachment selection.
   */
  const handleAttachmentChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const file =
      event.target.files?.[0] ?? null;

    setAttachments((current) =>
      current.map(
        (attachment, currentIndex) =>
          currentIndex === index
            ? {
                ...attachment,
                file,
              }
            : attachment,
      ),
    );

    if (file) {
      setErrors((current) => ({
        ...current,
        files: "",
        attachments: "",
      }));
    }
  };

  /**
   * Submit form.
   */
  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    const selectedFiles = attachments
      .filter(
        (
          attachment,
        ): attachment is AttachmentSlot & {
          file: File;
        } => Boolean(attachment.file),
      )
      .map(
        (attachment) => attachment.file,
      );

    const nextValues: ExpenseCreateRequest = {
      ...values,
      files: selectedFiles,
    };

    const validation =
      validateExpense(nextValues);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    try {
      await onSubmit(nextValues);
    } catch (error) {
      console.error(
        "Expense submission failed:",
        error,
      );
    }
  };

  const hasSelectedCategory =
    values.categoryId !== null &&
    values.categoryId !== undefined &&
    Number(values.categoryId) > 0;

  return (
    <form
      className="expenses-form"
      onSubmit={handleSubmit}
    >
      <div className="expenses-form__body">
        {/* Expense Details */}
        <section className="expenses-form__details">
          {/* Expense Type */}
          <div className="expenses-form__field expenses-form__field--full">
            <label htmlFor="expense-type">
              Expense Type <em>*</em>
            </label>

            <div className="expenses-form__control">
              <div className="expenses-form__control-icon">
                <FileText size={15} />
              </div>

              <select
                id="expense-type"
                value={values.type}
                onChange={(event) =>
                  updateValue(
                    "type",
                    event.target.value,
                  )
                }
              >
                <option value="">
                  Select Type
                </option>

                {EXPENSE_TYPES.map((type) => (
                  <option
                    value={type}
                    key={type}
                  >
                    {type}
                  </option>
                ))}
              </select>

              <ChevronDown
                size={13}
                className="expenses-form__select-arrow"
              />
            </div>

            {errors.type && (
              <span className="expenses-form__error">
                {errors.type}
              </span>
            )}
          </div>

          {/* Category and Subcategory */}
          <div className="expenses-form__row expenses-form__row--two">
            {/* Category */}
            <div className="expenses-form__field">
              <label htmlFor="expense-category">
                Category <em>*</em>
              </label>

              <div className="expenses-form__control">
                <div className="expenses-form__control-icon">
                  <Folder size={15} />
                </div>

                <select
                  id="expense-category"
                  value={values.categoryId ?? ""}
                  onChange={handleCategoryChange}
                  disabled={isCategoriesLoading}
                >
                  <option value="">
                    {isCategoriesLoading
                      ? "Loading categories..."
                      : "Select Category"}
                  </option>

                  {categories.map((category) => (
                    <option
                      value={category.id}
                      key={category.id}
                    >
                      {category.categoryName}
                    </option>
                  ))}
                </select>

                <ChevronDown
                  size={13}
                  className="expenses-form__select-arrow"
                />
              </div>

              {categoryLoadError && (
                <span className="expenses-form__error">
                  {categoryLoadError}
                </span>
              )}

              {errors.category && (
                <span className="expenses-form__error">
                  {errors.category}
                </span>
              )}
            </div>

            {/* Subcategory */}
            <div className="expenses-form__field">
              <label htmlFor="expense-subcategory">
                Sub Category
              </label>

              <div className="expenses-form__control">
                <div className="expenses-form__control-icon">
                  <Tag size={15} />
                </div>

                <select
                  id="expense-subcategory"
                  value={values.subCategoryId ?? ""}
                  onChange={handleSubCategoryChange}
                  disabled={
                    !hasSelectedCategory ||
                    isSubCategoriesLoading
                  }
                >
                  <option value="">
                    {isSubCategoriesLoading
                      ? "Loading subcategories..."
                      : !hasSelectedCategory
                        ? "Select category first"
                        : subCategories.length === 0
                          ? "No subcategories available"
                          : "Select Sub Category"}
                  </option>

                  {subCategories.map(
                    (subCategory) => (
                      <option
                        value={
                          getSubCategoryId(
                            subCategory,
                          ) ?? ""
                        }
                        key={
                          getSubCategoryId(
                            subCategory,
                          ) ?? Math.random()
                        }
                      >
                        {getSubCategoryName(
                          subCategory,
                        )}
                      </option>
                    ),
                  )}
                </select>

                <ChevronDown
                  size={13}
                  className="expenses-form__select-arrow"
                />
              </div>

              {subCategoryLoadError && (
                <span className="expenses-form__error">
                  {subCategoryLoadError}
                </span>
              )}

              {errors.subCategory && (
                <span className="expenses-form__error">
                  {errors.subCategory}
                </span>
              )}
            </div>
          </div>

          {/* Dates and Amount */}
          <div className="expenses-form__row expenses-form__row--three">
            {/* Expense From */}
            <div className="expenses-form__field">
              <label htmlFor="expense-from">
                Expense From <em>*</em>
              </label>

              <div className="expenses-form__control">
                <div className="expenses-form__control-icon">
                  <CalendarDays size={14} />
                </div>

                <input
                  id="expense-from"
                  type="date"
                  value={values.expenseFrom}
                  onChange={(event) =>
                    updateValue(
                      "expenseFrom",
                      event.target.value,
                    )
                  }
                />
              </div>

              {errors.expenseFrom && (
                <span className="expenses-form__error">
                  {errors.expenseFrom}
                </span>
              )}
            </div>

            {/* Expense To */}
            <div className="expenses-form__field">
              <label htmlFor="expense-to">
                Expense To <em>*</em>
              </label>

              <div className="expenses-form__control">
                <div className="expenses-form__control-icon">
                  <CalendarDays size={14} />
                </div>

                <input
                  id="expense-to"
                  type="date"
                  value={values.expenseTo}
                  onChange={(event) =>
                    updateValue(
                      "expenseTo",
                      event.target.value,
                    )
                  }
                />
              </div>

              {errors.expenseTo && (
                <span className="expenses-form__error">
                  {errors.expenseTo}
                </span>
              )}
            </div>

            {/* Amount */}
            <div className="expenses-form__field">
              <label htmlFor="expense-amount">
                Amount <em>*</em>
              </label>

              <div className="expenses-form__control">
                <div className="expenses-form__control-icon">
                  <span className="expenses-form__currency">
                    ₹
                  </span>
                </div>

                <input
                  id="expense-amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="Enter amount"
                  value={values.amount ?? ""}
                  onChange={(event) =>
                    updateValue(
                      "amount",
                      event.target.value
                        ? Number(event.target.value)
                        : undefined,
                    )
                  }
                />
              </div>

              {errors.amount && (
                <span className="expenses-form__error">
                  {errors.amount}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* Attachments */}
        <section className="expenses-form__attachments">
          <div className="expenses-form__section-header">
            <Paperclip size={17} />
            <span>Attachments</span>
          </div>

          <div className="expenses-form__attachment-content">
            <div className="expenses-form__attachment-grid">
              {attachments.map(
                (attachment, index) => (
                  <div
                    className="expenses-form__attachment"
                    key={attachment.id}
                  >
                    <label
                      htmlFor={`attachment-${index}`}
                    >
                      Attachment <em>*</em>
                    </label>

                    <div className="expenses-form__file-input">
                      <div className="expenses-form__file-icon">
                        <FileText size={14} />
                      </div>

                      <input
                        id={`attachment-${index}`}
                        ref={(element) => {
                          fileInputRefs.current[index] =
                            element;
                        }}
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.webp"
                        onChange={(event) =>
                          handleAttachmentChange(
                            index,
                            event,
                          )
                        }
                      />
                    </div>

                    {attachment.file && (
                      <span className="expenses-form__file-name">
                        {attachment.file.name}
                      </span>
                    )}
                  </div>
                ),
              )}
            </div>
          </div>

          {errors.files && (
            <span className="expenses-form__error">
              {errors.files}
            </span>
          )}

          {errors.attachments && (
            <span className="expenses-form__error">
              {errors.attachments}
            </span>
          )}
        </section>

        {/* Location and Description */}
        <section className="expenses-form__location-section">
          <div className="expenses-form__field expenses-form__field--full">
            <label htmlFor="expense-location">
              On Site Location <em>*</em>
            </label>

            <div className="expenses-form__control">
              <div className="expenses-form__control-icon">
                <MapPin size={15} />
              </div>

              <input
                id="expense-location"
                type="text"
                value={values.onSiteLocation}
                onChange={(event) =>
                  updateValue(
                    "onSiteLocation",
                    event.target.value,
                  )
                }
              />
            </div>

            {errors.onSiteLocation && (
              <span className="expenses-form__error">
                {errors.onSiteLocation}
              </span>
            )}
          </div>

          <div className="expenses-form__field expenses-form__field--full">
            <label htmlFor="expense-description">
              Description <em>*</em>
            </label>

            <div className="expenses-form__control expenses-form__control--textarea">
              <div className="expenses-form__control-icon">
                <FileText size={15} />
              </div>

              <textarea
                id="expense-description"
                value={values.description}
                onChange={(event) =>
                  updateValue(
                    "description",
                    event.target.value,
                  )
                }
                rows={2}
              />
            </div>

            {errors.description && (
              <span className="expenses-form__error">
                {errors.description}
              </span>
            )}
          </div>
        </section>
      </div>

      {/* Footer */}
      <div className="expenses-form__footer">
        <button
          type="button"
          className="expenses-form__button expenses-form__button--cancel"
          onClick={onCancel}
          disabled={isSaving}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="expenses-form__button expenses-form__button--submit"
          disabled={isSaving}
        >
          {isSaving ? "Submitting..." : "Submit"}
        </button>
      </div>
    </form>
  );
};

export default ExpensesForm;