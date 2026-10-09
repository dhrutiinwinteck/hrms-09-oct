import React, {
  useMemo,
  useState,
} from 'react';

import { AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

import CategoryHeader from './components/CategoryHeader/CategoryHeader';
import CategoryModal from './components/CategoryModal/CategoryModal';
import CategorySearch from './components/CategorySearch/CategorySearch';
import CategoryTable from './components/CategoryTable/CategoryTable';

import { useCategory } from './hooks/useCategory';
import { useCategoryModal } from './hooks/useCategoryModal';

import {
  CATEGORY_PAGE_SIZE_OPTIONS,
  DEFAULT_CATEGORY_PAGE_SIZE,
} from './constants/category.constants';

import {
  filterCategories,
  sortCategories,
} from './utils/category.utils';

import type {
  CategoryFormValues,
} from './types/category.types';

import './CategoryPage.css';

const CategoryPage: React.FC = () => {
  const {
    categories,
    loading,
    saving,
    error,
    createCategory,
    updateCategory,
  } = useCategory();

  const modal = useCategoryModal();

  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(
    DEFAULT_CATEGORY_PAGE_SIZE,
  );
  const [currentPage, setCurrentPage] = useState(1);

  const [sortDirection, setSortDirection] =
    useState<'asc' | 'desc'>('asc');

  const filteredCategories = useMemo(() => {
    const filtered = filterCategories(
      categories,
      searchTerm,
    );

    return sortCategories(
      filtered,
      sortDirection,
    );
  }, [
    categories,
    searchTerm,
    sortDirection,
  ]);

  const totalEntries = filteredCategories.length;

  const totalPages = Math.max(
    1,
    Math.ceil(totalEntries / pageSize),
  );

  const safeCurrentPage = Math.min(
    currentPage,
    totalPages,
  );

  const visibleCategories = useMemo(() => {
    const startIndex =
      (safeCurrentPage - 1) * pageSize;

    return filteredCategories.slice(
      startIndex,
      startIndex + pageSize,
    );
  }, [
    filteredCategories,
    safeCurrentPage,
    pageSize,
  ]);

  const firstEntry =
    totalEntries === 0
      ? 0
      : (safeCurrentPage - 1) * pageSize + 1;

  const lastEntry =
    totalEntries === 0
      ? 0
      : Math.min(
          safeCurrentPage * pageSize,
          totalEntries,
        );

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (
    event: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setPageSize(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleSort = () => {
    setSortDirection((current) =>
      current === 'asc' ? 'desc' : 'asc',
    );
  };

  const handleSubmit = async (
    values: CategoryFormValues,
  ) => {
    if (modal.category) {
      await updateCategory(
        modal.category.id,
        values,
      );
    } else {
      await createCategory(values);
    }

    modal.close();
  };

  return (
    <main className="category-page">
      <CategoryHeader
        onAddCategory={modal.openCreate}
      />

      {error && (
        <div className="category-error">
          <AlertCircle size={15} />

          <span>{error}</span>
        </div>
      )}

      <section className="category-content-card">
        <div className="category-table-toolbar">
          <div className="category-entries-control">
            <span>Show</span>

            <select
              value={pageSize}
              onChange={handlePageSizeChange}
              aria-label="Entries per page"
            >
              {CATEGORY_PAGE_SIZE_OPTIONS.map(
                (option) => (
                  <option
                    key={option}
                    value={option}
                  >
                    {option}
                  </option>
                ),
              )}
            </select>

            <span>entries</span>
          </div>

          <div className="category-toolbar-actions">
            <CategorySearch
              value={searchTerm}
              onChange={handleSearchChange}
            />

            <button
              type="button"
              className="category-sort-button"
              onClick={handleSort}
              aria-label="Sort categories"
              title="Sort categories"
            >
              {sortDirection === 'asc' ? 'A–Z' : 'Z–A'}
            </button>
          </div>
        </div>

        <CategoryTable
          categories={visibleCategories}
          loading={loading}
          onEdit={modal.openEdit}
        />

        <div className="category-table-footer">
          <div className="category-entry-summary">
            {totalEntries === 0
              ? 'Showing 0 to 0 of 0 entries'
              : `Showing ${firstEntry} to ${lastEntry} of ${totalEntries} entries`}
          </div>

          <div className="category-pagination">
            <button
              type="button"
              className="category-pagination-button category-pagination-previous"
              disabled={
                safeCurrentPage <= 1 ||
                loading
              }
              onClick={() =>
                setCurrentPage((page) =>
                  Math.max(1, page - 1),
                )
              }
            >
              <ChevronLeft size={13} />
              <span>Previous</span>
            </button>

            <button
              type="button"
              className="category-pagination-page active"
              disabled={loading}
            >
              {safeCurrentPage}
            </button>

            <button
              type="button"
              className="category-pagination-button"
              disabled={
                safeCurrentPage >= totalPages ||
                loading
              }
              onClick={() =>
                setCurrentPage((page) =>
                  Math.min(
                    totalPages,
                    page + 1,
                  ),
                )
              }
            >
              <span>Next</span>
              <ChevronRight size={13} />
            </button>
          </div>
        </div>
      </section>

      <CategoryModal
        isOpen={modal.isOpen}
        category={modal.category}
        saving={saving}
        onClose={modal.close}
        onSubmit={handleSubmit}
      />
    </main>
  );
};

export default CategoryPage;