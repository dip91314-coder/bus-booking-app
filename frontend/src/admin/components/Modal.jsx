import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  footer = null,
  maxWidth = 'max-w-2xl'
}) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="flex min-h-full items-center justify-center p-3 text-center sm:p-4">
        <div
          className={`relative flex max-h-[calc(100dvh-1.5rem)] w-full ${maxWidth} transform flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white text-left shadow-2xl transition-all sm:max-h-[calc(100dvh-2rem)] sm:my-4 animate__animated animate__fadeInUp animate__faster`}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={typeof title === 'string' ? title : 'Dialog'}
        >
          {/* Header */}
          <div className="flex shrink-0 items-start justify-between border-b border-slate-100 bg-slate-50/50 px-4 py-4 sm:px-6">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{title}</h3>
              {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label={`Close ${title}`}
              className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
            {children}
          </div>

          {/* Optional Explicit Footer */}
          {footer && (
            <div className="shrink-0 border-t border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 px-6 py-3.5 flex items-center justify-end gap-3">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
