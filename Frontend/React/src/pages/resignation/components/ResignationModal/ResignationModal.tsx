// ============================================================
// RESIGNATION MODAL COMPONENT
// Reusable, accessible, and enterprise-grade modal.
// Updated to support custom complex headers for the new UI.
// ============================================================

import React, { useEffect, useRef, useCallback } from 'react';
import { X } from 'lucide-react';
import './ResignationModal.css';

// ============================================================
// PROPS INTERFACE
// ============================================================
export interface ResignationModalProps {
  /** Controls the visibility of the modal. */
  isOpen: boolean;
  /** Callback function to close the modal. */
  onClose: () => void;
  /** The default title of the modal (ignored if customHeader is provided). */
  title?: string;
  /** Custom header content (bypasses the default title + X button). */
  customHeader?: React.ReactNode;
  /** The main content of the modal. */
  children: React.ReactNode;
  /** Optional custom footer content. If provided, default footer will be hidden. */
  footer?: React.ReactNode;
  /** Modal width (CSS value). Defaults to '640px'. */
  width?: string;
  /** Optional custom CSS class for the modal body. */
  bodyClassName?: string;
  /** Optional flag to disable closing on overlay click. */
  disableOverlayClose?: boolean;
}

// ============================================================
// MAIN COMPONENT
// ============================================================
const ResignationModal: React.FC<ResignationModalProps> = React.memo(({
  isOpen,
  onClose,
  title,
  customHeader,
  children,
  footer,
  width = '640px',
  bodyClassName = '',
  disableOverlayClose = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      setTimeout(() => modalRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
      if (previousActiveElement.current) previousActiveElement.current.focus();
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'Tab' && modalRef.current) {
        const focusable = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!focusable.length) return;
        const first = focusable[0] as HTMLElement;
        const last = focusable[focusable.length - 1] as HTMLElement;
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleOverlayClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !disableOverlayClose) onClose();
  }, [onClose, disableOverlayClose]);

  if (!isOpen) return null;

  return (
    <div className="resignation-modal-overlay" onClick={handleOverlayClick} role="presentation">
      <div ref={modalRef} className="resignation-modal-container" style={{ width }} role="dialog" aria-modal="true" aria-labelledby="modal-title" tabIndex={-1}>
        
        {/* Conditionally render Custom Header or Default Header */}
        {customHeader ? (
          customHeader
        ) : (
          <header className="resignation-modal-header">
            <h2 id="modal-title" className="resignation-modal-title">{title || 'Modal'}</h2>
            <button type="button" className="resignation-modal-close" onClick={onClose} aria-label="Close modal">
              <X size={20} strokeWidth={2.5} />
            </button>
          </header>
        )}

        {/* Modal Body */}
        <div className={`resignation-modal-body ${bodyClassName}`}>
          {children}
        </div>

        {/* Custom Footer */}
        {footer && (
          <footer className="resignation-modal-footer">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
});

ResignationModal.displayName = 'ResignationModal';
export default ResignationModal;