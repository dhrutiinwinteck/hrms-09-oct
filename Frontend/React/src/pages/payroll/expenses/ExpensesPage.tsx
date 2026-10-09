
import { useCallback, useState } from 'react';
import { AlertCircle } from 'lucide-react';

import { ExpensesHeader } from './components/ExpensesHeader/ExpensesHeader';
import { ExpensesFilters } from './components/ExpensesFilters/ExpensesFilters';
import { ExpensesTable } from './components/ExpensesTable/ExpensesTable';
import { ExpensesModal } from './components/ExpensesModal/ExpensesModal';
import { useExpenses } from './hooks/useExpenses';

import './ExpensesPage.css';

export const ExpensesPage = () => {
  const {
    visibleExpenses,
    filters,
    totalPages,
    isLoading,
    isSaving,
    error,
    filteredExpenses,
    setSearch,
    setPageSize,
    setPage,
    createExpense,
    deleteExpense,
  } = useExpenses();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddExpense = useCallback(() => {
    setIsModalOpen(true);
  }, []);

  const handleDeleteExpense = useCallback(
    async (id: string) => {
      const confirmed = window.confirm(
        'Are you sure you want to delete this expense?'
      );

      if (!confirmed) {
        return;
      }

      await deleteExpense(id);
    },
    [deleteExpense]
  );

  return (
    <main className="expenses-page">
      <div className="expenses-page__breadcrumb">
        <span>Dashboard</span>

        <span className="expenses-page__breadcrumb-separator">
          ›
        </span>

        <strong>Expenses</strong>
      </div>

      <ExpensesHeader
        onAddExpense={handleAddExpense}
      />

      {error && (
        <div
          className="expenses-page__error"
          role="alert"
        >
          <AlertCircle size={15} />
          <span>{error}</span>
        </div>
      )}

      <section className="expenses-content">
        <ExpensesFilters
          search={filters.search}
          pageSize={filters.pageSize}
          page={filters.page}
          totalPages={totalPages}
          totalFiltered={filteredExpenses.length}
          onSearchChange={setSearch}
          onPageSizeChange={setPageSize}
          onPageChange={setPage}
          onAddExpense={handleAddExpense}
        />

        <ExpensesTable
          expenses={visibleExpenses}
          page={filters.page}
          totalPages={totalPages}
          totalFiltered={filteredExpenses.length}
          isLoading={isLoading}
          isDeleting={isSaving}
          onDelete={handleDeleteExpense}
          onPageChange={setPage}
        />
      </section>

      <ExpensesModal
        isOpen={isModalOpen}
        isSaving={isSaving}
        onClose={() => setIsModalOpen(false)}
        onSubmit={async (values) => {
          await createExpense(values);
          setIsModalOpen(false);
        }}
      />
    </main>
  );
};

export default ExpensesPage;
