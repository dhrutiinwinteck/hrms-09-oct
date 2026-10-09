// src/pages/attendance/edit-punch-in-out/EditPunchInOutPage.tsx
import React, { useState } from 'react';
import { EditPunchInOutHeader } from './components/EditPunchInOutHeader/EditPunchInOutHeader';
import { EditPunchInOutFilters } from './components/EditPunchInOutFilters/EditPunchInOutFilters';
import { EditPunchInOutEmptyState } from './components/EditPunchInOutEmptyState/EditPunchInOutEmptyState';
import { useEditPunchInOut } from './hooks/useEditPunchInOut';
import { AttendanceRecord } from './types/editPunchInOut.types';
import { editPunchInOutService } from './services/editPunchInOut.service';
import { Edit2, Save, X, Clock, Loader2 } from 'lucide-react';
import './EditPunchInOutPage.css';

export const EditPunchInOutPage: React.FC = () => {
  const {
    selectedEmployee,
    selectedMonth,
    employeeSearchText,
    monthSearchText,
    isEmployeeDropdownOpen,
    isMonthDropdownOpen,
    isLoading,
    searchPerformed,
    attendanceData,
    setAttendanceData,
    error,
    validationErrors,
    filteredEmployees,
    filteredMonths,
    employeeRef,
    monthRef,
    handleEmployeeSelect,
    handleEmployeeSearch,
    handleEmployeeClear,
    handleEmployeeToggle,
    handleMonthSelect,
    handleMonthSearch,
    handleMonthClear,
    handleMonthToggle,
    handleSearch,
  } = useEditPunchInOut();

  // State for editing
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<AttendanceRecord>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleEditClick = (record: AttendanceRecord) => {
    setEditingRecord(record.id);
    setEditData({
      checkIn: record.checkIn,
      checkOut: record.checkOut,
      lateMark: record.lateMark,
      status: record.status,
      breakTime: record.breakTime,
      overtime: record.overtime,
    });
    setSaveError(null);
  };

  const handleSaveEdit = async (recordId: string) => {
    setIsSaving(true);
    setSaveError(null);
    
    try {
      // Call the service to update the record
      const record = attendanceData?.find(
  (item) => item.id === recordId
);

if (!record) {
  throw new Error(
    'Attendance record not found'
  );
}

const updatedRecord =
  await editPunchInOutService.updateAttendance(
    recordId,
    editData,
    record.date
  );
      
      // Update the local state with the updated record
      if (attendanceData) {
        const updatedData = attendanceData.map(record => 
          record.id === recordId ? updatedRecord : record
        );
        setAttendanceData(updatedData);
      }
      
      // Show success message
      console.log('✅ Record updated successfully:', updatedRecord);
      
      // Exit edit mode
      setEditingRecord(null);
      setEditData({});
    } catch (error) {
      console.error('❌ Failed to update record:', error);
      setSaveError(error instanceof Error ? error.message : 'Failed to update attendance record');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditingRecord(null);
    setEditData({});
    setSaveError(null);
  };

  const handleInputChange = (field: keyof AttendanceRecord, value: string | number | null) => {
    setEditData(prev => ({ ...prev, [field]: value }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div className="edit-punch-in-out-page">
      <EditPunchInOutHeader />
      
      <EditPunchInOutFilters
        selectedEmployee={selectedEmployee}
        employeeSearchText={employeeSearchText}
        isEmployeeDropdownOpen={isEmployeeDropdownOpen}
        filteredEmployees={filteredEmployees}
        onEmployeeSelect={handleEmployeeSelect}
        onEmployeeSearch={handleEmployeeSearch}
        onEmployeeClear={handleEmployeeClear}
        onEmployeeToggle={handleEmployeeToggle}
        employeeRef={employeeRef}
        employeeError={validationErrors.employee}
        selectedMonth={selectedMonth}
        monthSearchText={monthSearchText}
        isMonthDropdownOpen={isMonthDropdownOpen}
        filteredMonths={filteredMonths}
        onMonthSelect={handleMonthSelect}
        onMonthSearch={handleMonthSearch}
        onMonthClear={handleMonthClear}
        onMonthToggle={handleMonthToggle}
        monthRef={monthRef}
        monthError={validationErrors.month}
        onSearch={handleSearch}
        isLoading={isLoading}
      />

      {isLoading && (
        <div className="edit-punch-in-out-page__loading">
          <Loader2 size={24} className="edit-punch-in-out-page__spinner" />
          Loading attendance data...
        </div>
      )}

      {error && (
        <div className="edit-punch-in-out-page__error">
          {error}
        </div>
      )}

      {!searchPerformed && !isLoading && !error && (
        <EditPunchInOutEmptyState />
      )}

      {searchPerformed && attendanceData && !isLoading && !error && (
        <div className="edit-punch-in-out-page__results">
          <div className="edit-punch-in-out-page__results-header">
            <h2 className="edit-punch-in-out-page__results-title">
              Attendance Records
            </h2>
            <div className="edit-punch-in-out-page__results-summary">
              <span className="edit-punch-in-out-page__results-summary-item">
                Employee: {selectedEmployee?.name}
              </span>
              <span className="edit-punch-in-out-page__results-summary-item">
                Month: {selectedMonth?.label}
              </span>
            </div>
          </div>

          {saveError && (
            <div className="edit-punch-in-out-page__error edit-punch-in-out-page__error--save">
              {saveError}
            </div>
          )}
          
          <div className="edit-punch-in-out-page__results-table-wrapper">
            <table className="edit-punch-in-out-page__results-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Status</th>
                  <th>Late Mark</th>
                  <th>Break Time</th>
                  <th>Overtime</th>
                  <th className="edit-punch-in-out-page__actions-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {attendanceData.map((record) => {
                  const isEditing = editingRecord === record.id;
                  
                  return (
                    <tr key={record.id} className={isEditing ? 'editing' : ''}>
                      <td>{formatDate(record.date)}</td>
                      
                      <td>
                        {isEditing ? (
                          <input
                            type="time"
                            className="edit-punch-in-out-page__edit-input"
                            value={editData.checkIn || ''}
                            onChange={(e) => handleInputChange('checkIn', e.target.value || null)}
                            disabled={isSaving}
                          />
                        ) : (
                          record.checkIn || '-'
                        )}
                      </td>
                      
                      <td>
                        {isEditing ? (
                          <input
                            type="time"
                            className="edit-punch-in-out-page__edit-input"
                            value={editData.checkOut || ''}
                            onChange={(e) => handleInputChange('checkOut', e.target.value || null)}
                            disabled={isSaving}
                          />
                        ) : (
                          record.checkOut || '-'
                        )}
                      </td>
                      
                      <td>
                        {isEditing ? (
                          <select
                            className="edit-punch-in-out-page__edit-select"
                            value={editData.status || 'present'}
                            onChange={(e) => handleInputChange('status', e.target.value as AttendanceRecord['status'])}
                            disabled={isSaving}
                          >
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                            <option value="late">Late</option>
                            <option value="half-day">Half Day</option>
                          </select>
                        ) : (
                          <span className={`edit-punch-in-out-page__status-badge edit-punch-in-out-page__status-badge--${record.status}`}>
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        )}
                      </td>
                      
                      <td>
                        {isEditing ? (
                          <div className="edit-punch-in-out-page__late-mark-input">
                            <Clock size={14} className="edit-punch-in-out-page__late-mark-icon" />
                            <input
                              type="time"
                              className="edit-punch-in-out-page__edit-input"
                              value={editData.lateMark || ''}
                              onChange={(e) => handleInputChange('lateMark', e.target.value || null)}
                              disabled={isSaving}
                            />
                          </div>
                        ) : (
                          <span className="edit-punch-in-out-page__late-mark">
                            {record.lateMark || '-'}
                          </span>
                        )}
                      </td>
                      
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            className="edit-punch-in-out-page__edit-input edit-punch-in-out-page__edit-input--small"
                            value={editData.breakTime ?? 0}
                            onChange={(e) => handleInputChange('breakTime', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.5"
                            disabled={isSaving}
                          />
                        ) : (
                          record.breakTime ? `${record.breakTime}h` : '-'
                        )}
                      </td>
                      
                      <td>
                        {isEditing ? (
                          <input
                            type="number"
                            className="edit-punch-in-out-page__edit-input edit-punch-in-out-page__edit-input--small"
                            value={editData.overtime ?? 0}
                            onChange={(e) => handleInputChange('overtime', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.5"
                            disabled={isSaving}
                          />
                        ) : (
                          record.overtime ? `${record.overtime}h` : '-'
                        )}
                      </td>
                      
                      <td>
                        {isEditing ? (
                          <div className="edit-punch-in-out-page__actions">
                            <button
                              className="edit-punch-in-out-page__action-btn edit-punch-in-out-page__action-btn--save"
                              onClick={() => handleSaveEdit(record.id)}
                              disabled={isSaving}
                              title="Save changes"
                            >
                              {isSaving ? <Loader2 size={16} className="edit-punch-in-out-page__spinner" /> : <Save size={16} />}
                            </button>
                            <button
                              className="edit-punch-in-out-page__action-btn edit-punch-in-out-page__action-btn--cancel"
                              onClick={handleCancelEdit}
                              disabled={isSaving}
                              title="Cancel editing"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <button
                            className="edit-punch-in-out-page__action-btn edit-punch-in-out-page__action-btn--edit"
                            onClick={() => handleEditClick(record)}
                            title="Edit record"
                          >
                            <Edit2 size={16} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditPunchInOutPage;