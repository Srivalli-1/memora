import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { AlertTriangle, Trash2 } from 'lucide-react';

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Item?',
  message = 'This item and its associated information will be permanently deleted.',
  loading = false,
  confirmButtonText = 'Delete'
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="space-y-5 py-2">
        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#fbeeed] border border-[#f4cfd3]">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-[#a8323e] flex-shrink-0 shadow-xs">
            <Trash2 className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-left">
            <h4 className="text-sm font-serif font-bold text-[#2c1810]">
              Are you sure?
            </h4>
            <p className="text-xs text-[#633238] leading-relaxed font-serif">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={loading}
            onClick={onClose}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="danger"
            size="sm"
            loading={loading}
            onClick={onConfirm}
            className="shadow-sm font-semibold"
          >
            {confirmButtonText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DeleteConfirmModal;
