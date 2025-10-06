import React from 'react';
import Modal from './Modal';
import Button from './Button';
import { spacing } from '../tokens';

export interface ConfirmProps {
  /**
   * Show confirm dialog
   */
  open: boolean;
  
  /**
   * Confirmation title
   */
  title?: string;
  
  /**
   * Confirmation message
   */
  message: string;
  
  /**
   * Confirm button text
   */
  confirmText?: string;
  
  /**
   * Cancel button text
   */
  cancelText?: string;
  
  /**
   * Confirm button variant
   */
  confirmVariant?: 'primary' | 'danger' | 'secondary';
  
  /**
   * On confirm handler
   */
  onConfirm: () => void;
  
  /**
   * On cancel handler
   */
  onCancel: () => void;
}

const Confirm: React.FC<ConfirmProps> = ({
  open,
  title = '확인',
  message,
  confirmText = '확인',
  cancelText = '취소',
  confirmVariant = 'danger',
  onConfirm,
  onCancel
}) => {
  const messageStyles: React.CSSProperties = {
    marginBottom: spacing[4],
    lineHeight: 1.5,
  };

  const footerContent = (
    <>
      <Button variant="ghost" onClick={onCancel}>
        {cancelText}
      </Button>
      <Button 
        variant={confirmVariant} 
        onClick={() => {
          onConfirm();
        }}
      >
        {confirmText}
      </Button>
    </>
  );

  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      size="small"
      footer={footerContent}
    >
      <div style={messageStyles}>
        {message}
      </div>
    </Modal>
  );
};

export default Confirm;