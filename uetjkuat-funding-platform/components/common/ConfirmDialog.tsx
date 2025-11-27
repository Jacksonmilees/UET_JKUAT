import React from 'react';
import Button from './Button';
import { IconX } from '../icons';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
}) => {
  if (!isOpen) return null;

  const variants = {
    danger: {
      icon: '⚠️',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      buttonVariant: 'danger' as const,
    },
    warning: {
      icon: '⚠️',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      buttonVariant: 'primary' as const,
    },
    info: {
      icon: 'ℹ️',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonVariant: 'primary' as const,
    },
  };

  const config = variants[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 animate-scale-in">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className={`${config.iconBg} ${config.iconColor} p-3 rounded-full flex-shrink-0 text-2xl`}>
            {config.icon}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <IconX className="w-6 h-6" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <Button
            variant="secondary"
            onClick={onClose}
            disabled={loading}
            fullWidth
          >
            {cancelLabel}
          </Button>
          <Button
            variant={config.buttonVariant}
            onClick={onConfirm}
            loading={loading}
            fullWidth
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
