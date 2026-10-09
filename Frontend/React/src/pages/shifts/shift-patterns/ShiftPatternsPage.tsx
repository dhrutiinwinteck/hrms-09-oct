// src/pages/shifts/ShiftPatternsPage.tsx

import ShiftPatternsHeader from './components/ShiftPatternsHeader/ShiftPatternsHeader';
import ShiftPatternStats from './components/ShiftPatternStats/ShiftPatternStats';
import ShiftPatternToolbar from './components/ShiftPatternToolbar/ShiftPatternToolbar';
import ShiftPatternTable from './components/ShiftPatternTable/ShiftPatternTable';
import ShiftPatternPagination from './components/ShiftPatternPagination/ShiftPatternPagination';
import ShiftPatternForm from './components/ShiftPatternForm/ShiftPatternForm';

import { useShiftPatterns } from './hooks/useShiftPatterns';

import { type ShiftPatternFormData } from './types/shiftPatterns.types';

import './ShiftPatternsPage.css';

const ShiftPatternsPage = () => {


  const {
    patterns,

    stats,

    totalItems,

    totalPages,

    currentPage,

    filters,

    handleSearch,

    handleStatusFilter,

    handlePageChange,

    isFormOpen,

    formMode,

    selectedPattern,

    openCreateForm,

    openEditForm,

    closeForm,

    createPattern,

    updatePattern,

    deletePattern,

    loading,

    actionLoading,

    error,
  } = useShiftPatterns();

  // ============================================================
  // FORM SUBMIT
  // ============================================================

  const handleFormSubmit = async (
    data: ShiftPatternFormData
  ) => {
    try {
      if (formMode === 'create') {
        await createPattern(data);

        return;
      }

      if (
        formMode === 'edit' &&
        selectedPattern
      ) {
        await updatePattern(
          selectedPattern.id,
          data
        );
      }
    } catch {
      /**
       * The hook already stores the error.
       *
       * Do not close the form here because
       * an API failure should allow the user
       * to correct/retry the operation.
       */
    }
  };

  // ============================================================
  // DELETE
  // ============================================================

  const handleDelete = async (
    id: string
  ) => {
    const confirmed =
      window.confirm(
        'Are you sure you want to delete this shift pattern?'
      );

    if (!confirmed) {
      return;
    }

    try {
      await deletePattern(id);
    } catch {
      /**
       * Error is already handled by the hook.
       */
    }
  };

  return (
    <div className="shift-patterns-page">

      <ShiftPatternsHeader
        onAddNew={openCreateForm}
      />

      {error && (
        <div
          role="alert"
          style={{
            marginBottom: '16px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: '#fff1f2',
            border: '1px solid #fecdd3',
            color: '#be123c',
            fontSize: '14px',
          }}
        >
          {error}
        </div>
      )}

      <ShiftPatternStats
        stats={stats}
      />

      <ShiftPatternToolbar
        searchTerm={filters.searchTerm}
        onSearch={handleSearch}
        statusFilter={filters.status}
        onStatusFilter={
          handleStatusFilter
        }
      />

      <ShiftPatternTable
        patterns={patterns}
        onEdit={openEditForm}
        onDelete={handleDelete}
      />

      <ShiftPatternPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        onPageChange={handlePageChange}
      />

      <ShiftPatternForm
        isOpen={isFormOpen}
        mode={formMode}
        initialData={selectedPattern}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        isSubmitting={actionLoading}
      />

      {loading && (
        <div
          style={{
            position: 'fixed',
            right: '20px',
            bottom: '20px',
            padding: '10px 14px',
            borderRadius: '8px',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            boxShadow:
              '0 4px 12px rgba(0,0,0,0.08)',
            fontSize: '13px',
          }}
        >
          Loading shift patterns...
        </div>
      )}
    </div>
  );
};

export default ShiftPatternsPage;