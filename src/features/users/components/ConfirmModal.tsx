// src/features/users/components/ConfirmModal.tsx
import React from 'react';
import { Modal, Button } from '../../../design-system';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  loading?: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  variant = 'danger',
  loading = false
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: '',
          iconColor: 'text-red-500',
          buttonColor: 'bg-red-500 hover:bg-red-600'
        };
      case 'warning':
        return {
          icon: '',
          iconColor: 'text-yellow-500',
          buttonColor: 'bg-yellow-500 hover:bg-yellow-600'
        };
      case 'info':
        return {
          icon: '',
          iconColor: 'text-blue-500',
          buttonColor: 'bg-blue-500 hover:bg-blue-600'
        };
      default:
        return {
          icon: '',
          iconColor: 'text-red-500',
          buttonColor: 'bg-red-500 hover:bg-red-600'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6">
        <div className="flex items-center mb-4">
          <div className={`text-2xl mr-3 ${styles.iconColor}`}>
            {styles.icon}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {title}
          </h3>
        </div>

        <div className="mb-6">
          <p className="text-sm text-gray-600 leading-relaxed">
            {message}
          </p>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </Button>
          <Button
            onClick={handleConfirm}
            loading={loading}
            disabled={loading}
            className={styles.buttonColor}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmModal;
