import React, {
  useEffect,
} from 'react';

import {
  AdminHoliday,
  AdminHolidayFormData,
} from './types/adminHoliday.types';

import {
  useAdminHolidayCalendar,
} from './hooks/useAdminHolidayCalendar';

import {
  useAdminHolidayModal,
} from './hooks/useAdminHolidayModal';

import {
  AdminHolidayHeader,
} from './components/AdminHolidayHeader/AdminHolidayHeader';

import {
  AdminHolidayStatistics,
} from './components/AdminHolidayStatistics/AdminHolidayStatistics';

import {
  AdminHolidayTable,
} from './components/AdminHolidayTable/AdminHolidayTable';

import {
  AdminAddHolidayModal,
} from './components/AdminAddHolidayModal/AdminAddHolidayModal';

import './AdminHolidayCalendarPage.css';


// ============================================================
// ADMIN HOLIDAY CALENDAR PAGE
// ============================================================

export const AdminHolidayCalendarPage: React.FC = () => {

  // ==========================================================
  // HOLIDAY CALENDAR
  // ==========================================================

  const {
    holidays,
    statistics,

    loading,
    error,

    searchQuery,

    currentPage,
    pageSize,
    totalItems,

    addHoliday,
    updateHoliday,
    toggleStatus,
    deleteHoliday,

    searchHolidays,
    changePage,
    changePageSize,
  } = useAdminHolidayCalendar();


  // ==========================================================
  // HOLIDAY MODAL
  // ==========================================================

  const {
    isOpen,
    editingHoliday,
    formData,
    errors,

    openModal,
    closeModal,
    updateFormData,
    setFormErrors,
  } = useAdminHolidayModal();


  // ==========================================================
  // API ERROR
  // ==========================================================

  useEffect(() => {

    if (!error) {
      return;
    }

    window.alert(
      error,
    );

  }, [error]);


  // ==========================================================
  // ADD / UPDATE
  // ==========================================================

  const handleSubmit = async (
    data: AdminHolidayFormData,
  ): Promise<void> => {

    try {

      if (editingHoliday) {

        await updateHoliday(
          editingHoliday.id,
          data,
        );

      } else {

        await addHoliday(
          data,
        );

      }

      closeModal();

    } catch (error) {

      console.error(
        'Holiday save failed:',
        error,
      );

    }
  };


  // ==========================================================
  // EDIT
  // ==========================================================

  const handleEdit = (
    holiday: AdminHoliday,
  ): void => {

    openModal(
      holiday,
    );
  };


  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete = async (
    id: string,
  ): Promise<void> => {

    const confirmed =
      window.confirm(
        'Are you sure you want to delete this holiday?',
      );


    if (!confirmed) {
      return;
    }


    try {

      await deleteHoliday(
        id,
      );

    } catch (error) {

      console.error(
        'Holiday delete failed:',
        error,
      );

    }
  };


  // ==========================================================
  // STATUS
  // ==========================================================

  const handleStatusToggle =
    async (
      id: string,
    ): Promise<void> => {

      try {

        await toggleStatus(
          id,
        );

      } catch (error) {

        console.error(
          'Holiday status update failed:',
          error,
        );

      }
    };


  // ==========================================================
  // ADD
  // ==========================================================

  const handleAddHoliday =
    (): void => {

      openModal();

    };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="admin-holiday-calendar-page">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <AdminHolidayHeader
        onAddHoliday={
          handleAddHoliday
        }
      />


      {/* ======================================================
          STATISTICS
      ====================================================== */}

      <AdminHolidayStatistics
        statistics={
          statistics
        }
      />


      {/* ======================================================
          TABLE
      ====================================================== */}

      <AdminHolidayTable

        holidays={
          holidays
        }

        loading={
          loading
        }

        searchQuery={
          searchQuery
        }

        currentPage={
          currentPage
        }

        pageSize={
          pageSize
        }

        totalItems={
          totalItems
        }

        onSearch={
          searchHolidays
        }

        onPageChange={
          changePage
        }

        onPageSizeChange={
          changePageSize
        }

        onEdit={
          handleEdit
        }

        onDelete={
          handleDelete
        }

        onStatusToggle={
          handleStatusToggle
        }

      />


      {/* ======================================================
          ADD / EDIT MODAL
      ====================================================== */}

      <AdminAddHolidayModal

        isOpen={
          isOpen
        }

        editingHoliday={
          editingHoliday
        }

        formData={
          formData
        }

        errors={
          errors
        }

        onClose={
          closeModal
        }

        onSubmit={
          handleSubmit
        }

        onUpdateField={
          updateFormData
        }

        onSetErrors={
          setFormErrors
        }

      />

    </div>
  );
};


// ============================================================
// DEFAULT EXPORT
// ============================================================

export default AdminHolidayCalendarPage;