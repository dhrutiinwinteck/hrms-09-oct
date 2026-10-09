/**
 * ======================================================
 * Attendance Module - Export Component
 * ======================================================
 * Enterprise-grade component for exporting attendance data.
 * Provides a button with dropdown options for different export formats.
 *
 * Features:
 * - Single click export to Excel
 * - Export with summary option
 * - Loading state during export
 * - Success/error notifications
 * - Accessibility (ARIA labels, keyboard support)
 * - Responsive design
 * - Memoized for performance
 *
 * @module components/AttendanceExport
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Download, FileSpreadsheet, FileText, ChevronDown, Check, X } from 'lucide-react';
import { AttendanceRecord } from '../../types/attendance.types';
import {
  exportAttendanceToExcel,
  exportAttendanceWithMetadata,
  exportAttendanceWithSummary,
} from '../../utils/exportExcel';
import './AttendanceExport.css';

// -----------------------------------------------------------------------------
// Component Props Interface
// -----------------------------------------------------------------------------

export interface AttendanceExportProps {
  /** Records to export. */
  records: AttendanceRecord[];
  /** Whether the component is in a loading state. */
  loading?: boolean;
  /** Callback when export starts. */
  onExportStart?: () => void;
  /** Callback when export completes. */
  onExportComplete?: () => void;
  /** Callback when export fails. */
  onExportError?: (error: Error) => void;
  /** Additional CSS class names. */
  className?: string;
  /** Button size variant. */
  size?: 'sm' | 'md' | 'lg';
  /** Disable the export button. */
  disabled?: boolean;
}

// -----------------------------------------------------------------------------
// Component Implementation
// -----------------------------------------------------------------------------

/**
 * AttendanceExport component for exporting attendance data.
 *
 * @param props - Component props
 * @returns React component
 */
export const AttendanceExport: React.FC<AttendanceExportProps> = ({
  records,
  loading = false,
  onExportStart,
  onExportComplete,
  onExportError,
  className = '',
  size = 'md',
  disabled = false,
}) => {
  // ---------------------------------------------------------------------------
  // State
  // ---------------------------------------------------------------------------

  /** Whether the dropdown menu is open. */
  const [isOpen, setIsOpen] = useState<boolean>(false);
  /** Whether export is currently in progress. */
  const [isExporting, setIsExporting] = useState<boolean>(false);
  /** Export status message. */
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: '',
  });

  /** Ref for the dropdown container. */
  const dropdownRef = useRef<HTMLDivElement>(null);

  // ---------------------------------------------------------------------------
  // Effects
  // ---------------------------------------------------------------------------

  /**
   * Close dropdown when clicking outside.
   */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  /**
   * Clear status message after delay.
   */
  useEffect(() => {
    if (status.type) {
      const timer = setTimeout(() => {
        setStatus({ type: null, message: '' });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  // ---------------------------------------------------------------------------
  // Event Handlers
  // ---------------------------------------------------------------------------

  /**
   * Toggles the dropdown menu.
   */
  const toggleDropdown = useCallback(() => {
    if (!disabled && !loading && !isExporting) {
      setIsOpen(prev => !prev);
    }
  }, [disabled, loading, isExporting]);

  /**
   * Closes the dropdown menu.
   */
  // const closeDropdown = useCallback(() => {
  //   setIsOpen(false);
  // }, []);

  /**
   * Handles the export action.
   * @param exportFn - Export function to call.
   * @param fileName - Optional custom file name.
   */
  const handleExport = useCallback(
    (
      exportFn: (records: AttendanceRecord[], options?: any) => void,
      options?: any
    ) => {
      if (isExporting || loading) return;

      // Validate records
      if (!records || records.length === 0) {
        setStatus({
          type: 'error',
          message: 'No records available to export.',
        });
        return;
      }

      setIsExporting(true);
      setIsOpen(false);
      if (onExportStart) onExportStart();

      try {
        // Execute the export function
        exportFn(records, options);
        setStatus({
          type: 'success',
          message: `Successfully exported ${records.length} records.`,
        });
        if (onExportComplete) onExportComplete();
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Export failed');
        setStatus({
          type: 'error',
          message: err.message || 'Failed to export. Please try again.',
        });
        if (onExportError) onExportError(err);
      } finally {
        setIsExporting(false);
      }
    },
    [records, isExporting, loading, onExportStart, onExportComplete, onExportError]
  );

  /**
   * Handles basic Excel export.
   */
  const handleExportBasic = useCallback(() => {
    handleExport(exportAttendanceToExcel);
  }, [handleExport]);

  /**
   * Handles Excel export with summary.
   */
  const handleExportWithSummary = useCallback(() => {
    handleExport(exportAttendanceWithSummary);
  }, [handleExport]);

  /**
   * Handles Excel export with metadata.
   */
  const handleExportWithMetadata = useCallback(() => {
    const filters = {
      'Total Records': String(records.length),
      'Generated On': new Date().toLocaleString(),
    };
    handleExport(exportAttendanceWithMetadata, {
      reportTitle: 'Attendance Report',
      filters,
    });
  }, [handleExport, records]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const isDisabled = disabled || loading || isExporting;
  const buttonSizeClass = `attendance-export__btn--${size}`;

  return (
    <div
      ref={dropdownRef}
      className={`attendance-export ${className}`}
    >
      {/* Main Button */}
      <div className="attendance-export__wrapper">
        <button
          type="button"
          className={`attendance-export__btn ${buttonSizeClass} ${isOpen ? 'active' : ''}`}
          onClick={toggleDropdown}
          disabled={isDisabled}
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-label="Export attendance data"
        >
          <Download size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />
          <span className="attendance-export__btn-text">
            {isExporting ? 'Exporting...' : 'Download'}
          </span>
          <ChevronDown
            size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16}
            className={`attendance-export__chevron ${isOpen ? 'open' : ''}`}
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div
            className="attendance-export__dropdown"
            role="menu"
            aria-label="Export options"
          >
            <button
              type="button"
              className="attendance-export__dropdown-item"
              onClick={handleExportBasic}
              role="menuitem"
              disabled={isExporting}
            >
              <FileSpreadsheet size={16} />
              <span>Export to Excel</span>
            </button>
            <button
              type="button"
              className="attendance-export__dropdown-item"
              onClick={handleExportWithSummary}
              role="menuitem"
              disabled={isExporting}
            >
              <FileText size={16} />
              <span>Export with Summary</span>
            </button>
            <button
              type="button"
              className="attendance-export__dropdown-item"
              onClick={handleExportWithMetadata}
              role="menuitem"
              disabled={isExporting}
            >
              <FileText size={16} />
              <span>Export with Metadata</span>
            </button>
          </div>
        )}
      </div>

      {/* Status Message */}
      {status.type && (
        <div
          className={`attendance-export__status attendance-export__status--${status.type}`}
          role="alert"
          aria-live="polite"
        >
          {status.type === 'success' ? (
            <Check size={14} />
          ) : (
            <X size={14} />
          )}
          <span>{status.message}</span>
        </div>
      )}
    </div>
  );
};

// -----------------------------------------------------------------------------
// Default Export
// -----------------------------------------------------------------------------

export default AttendanceExport;