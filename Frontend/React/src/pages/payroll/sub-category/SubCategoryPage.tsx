import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import SubCategoryHeader from './components/SubCategoryHeader/SubCategoryHeader';

import SubCategoryFilters from './components/SubCategoryFilters/SubCategoryFilters';

import SubCategoryTable from './components/SubCategoryTable/SubCategoryTable';

import SubCategoryModal from './components/SubCategoryModal/SubCategoryModal';

import { useSubCategory } from './hooks/useSubCategory';

import { useSubCategoryModal } from './hooks/useSubCategoryModal';

import './SubCategoryPage.css';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8000';

const CATEGORY_ENDPOINT =
  '/api/v1/expenses/categories';

interface CategoryApiRecord {
  id: number;
  category_name: string;
  status: number;
}

interface CategoryOption {
  id: number;
  name: string;
  status?: number;
}

const SubCategoryPage: React.FC = () => {
  const {
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

    refresh,
    createSubCategory,
    toggleSubCategoryStatus,
  } = useSubCategory();

  const {
    isOpen,
    form,
    errors,
    openModal,
    closeModal,
    setCategoryId,
    setSubCategoryName,
    validate,
  } = useSubCategoryModal();

  const [categories, setCategories] = useState<
    CategoryOption[]
  >([]);

  const [categoryLoading, setCategoryLoading] =
    useState(false);

  const [categoryError, setCategoryError] =
    useState<string | null>(null);

  const [submitError, setSubmitError] = useState<
    string | null
  >(null);

  const loadCategories = useCallback(async () => {
    try {
      setCategoryLoading(true);
      setCategoryError(null);

      const token =
        localStorage.getItem('accessToken');

      const response = await fetch(
        `${API_BASE_URL}${CATEGORY_ENDPOINT}`,
        {
          method: 'GET',
          headers: {
            Accept: 'application/json',
            ...(token
              ? {
                  Authorization: `Bearer ${token}`,
                }
              : {}),
          },
        },
      );

      if (!response.ok) {
        let message =
          `Request failed. Status: ${response.status}`;

        try {
          const errorData =
            await response.json();

          if (
            typeof errorData?.detail ===
            'string'
          ) {
            message = errorData.detail;
          }
        } catch {
          // Keep default error message
        }

        throw new Error(message);
      }

      const data: CategoryApiRecord[] =
        await response.json();

      const mappedCategories:
        CategoryOption[] = data.map(
          (category) => ({
            id: category.id,
            name: category.category_name,
            status: category.status,
          }),
        );

      setCategories(mappedCategories);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to load categories.';

      setCategoryError(message);
    } finally {
      setCategoryLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCategories();
  }, [loadCategories]);

  const handleOpenModal = useCallback(() => {
    setSubmitError(null);

    void loadCategories();

    openModal();
  }, [
    loadCategories,
    openModal,
  ]);

  const handleSubmitSubCategory =
    useCallback(async () => {
      const isValid = validate();

      if (!isValid) {
        return;
      }

      const parsedCategoryId = Number(
        form.categoryId,
      );

      if (
        !Number.isInteger(parsedCategoryId) ||
        parsedCategoryId <= 0
      ) {
        setSubmitError(
          'Please select a valid category.',
        );

        return;
      }

      try {
        setSubmitError(null);

        await createSubCategory(
          parsedCategoryId,
          form.subCategoryName.trim(),
        );

        closeModal();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to create sub category.';

        setSubmitError(message);
      }
    }, [
      validate,
      form.categoryId,
      form.subCategoryName,
      createSubCategory,
      closeModal,
    ]);

  const handleCloseModal = useCallback(() => {
    if (creating) {
      return;
    }

    setSubmitError(null);

    closeModal();
  }, [
    creating,
    closeModal,
  ]);

  const handleToggleStatus = useCallback(
    async (id: number): Promise<void> => {
      try {
        await toggleSubCategoryStatus(id);
      } catch {
        // Error is already handled inside the hook
      }
    },
    [toggleSubCategoryStatus],
  );

  const handlePreviousPage = useCallback(() => {
    setPage((currentPage) =>
      Math.max(1, currentPage - 1),
    );
  }, [setPage]);

  const handleNextPage = useCallback(() => {
    setPage((currentPage) =>
      Math.min(
        totalPages,
        currentPage + 1,
      ),
    );
  }, [
    setPage,
    totalPages,
  ]);

  return (
    <>
      <main className="sub-category-page">
        <SubCategoryHeader
          onAddSubCategory={handleOpenModal}
        />

        <section className="sub-category-content-card">
          <SubCategoryFilters
            pageSize={pageSize}
            search={search}
            onPageSizeChange={setPageSize}
            onSearchChange={setSearch}
          />

          {(error || categoryError) && (
            <div className="sub-category-error">
              <span>
                {error || categoryError}
              </span>

              <button
                type="button"
                onClick={() => {
                  void refresh();
                  void loadCategories();
                }}
              >
                Retry
              </button>
            </div>
          )}

          <SubCategoryTable
            data={visibleSubCategories}
            loading={loading}
            hasSearch={Boolean(
              search.trim(),
            )}
            updatingStatusId={
              updatingStatusId
            }
            onToggleStatus={
              handleToggleStatus
            }
          />

          <div className="sub-category-table-footer">
            <span className="sub-category-entry-info">
              Showing{' '}
              {totalEntries === 0
                ? 0
                : (page - 1) * pageSize + 1}{' '}
              to{' '}
              {Math.min(
                page * pageSize,
                totalEntries,
              )}{' '}
              of {totalEntries} entries
            </span>

            <div className="sub-category-pagination">
              <button
                type="button"
                className="sub-category-pagination-button"
                disabled={page === 1}
                onClick={handlePreviousPage}
              >
                Previous
              </button>

              <button
                type="button"
                className="sub-category-pagination-button active"
                disabled
              >
                {page}
              </button>

              <button
                type="button"
                className="sub-category-pagination-button"
                disabled={
                  page >= totalPages
                }
                onClick={handleNextPage}
              >
                Next
              </button>
            </div>
          </div>
        </section>
      </main>

      <SubCategoryModal
        isOpen={isOpen}
        categoryId={form.categoryId}
        subCategoryName={
          form.subCategoryName
        }
        categories={categories}
        categoryError={
          categoryError ||
          errors.categoryId
        }
        subCategoryNameError={
          submitError ||
          errors.subCategoryName
        }
        onCategoryChange={setCategoryId}
        onSubCategoryNameChange={
          setSubCategoryName
        }
        onClose={handleCloseModal}
        onSubmit={() => {
          void handleSubmitSubCategory();
        }}
      />

      {categoryLoading && isOpen && (
        <div className="sub-category-loading-message">
          Loading categories...
        </div>
      )}
    </>
  );
};

export default SubCategoryPage;