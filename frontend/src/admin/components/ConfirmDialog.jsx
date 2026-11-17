import React, { useState } from 'react';
import Modal from './Modal';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Button from '../../components/common/Button';

const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed? This action cannot be undone.',
  confirmText = 'Yes, Proceed',
  cancelText = 'Cancel',
  type = 'danger', // danger, warning, info
  loading = false
}) => {
  const [isConfirming, setIsConfirming] = useState(false);
  const isLoading = loading || isConfirming;

  const handleConfirm = async () => {
    try {
      const result = onConfirm();
      if (result && typeof result.then === 'function') {
        setIsConfirming(true);
        if (await result === false) return;
      } else if (result === false) {
        return;
      }
      onClose();
    } catch (error) {
      toast.error(error?.message || 'Could not complete the action.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              type === 'danger'
                ? 'bg-rose-50 text-rose-600 border border-rose-100'
                : 'bg-amber-50 text-amber-600 border border-amber-100'
            }`}
          >
            {type === 'danger' ? (
              <Trash2 className="w-6 h-6" />
            ) : (
              <AlertTriangle className="w-6 h-6" />
            )}
          </div>
          <div>
            <p className="text-sm text-slate-600 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            variant="secondary"
            size="sm"
          >
            {cancelText}
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            loading={isLoading}
            variant={type === 'danger' ? 'danger' : 'primary'}
            size="sm"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
