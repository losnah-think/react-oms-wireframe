import React, { useEffect, useRef } from 'react';
import { colors, typography, spacing, borderRadius, shadows } from '../tokens';

export interface ModalProps {
  /**
   * Whether the modal is open
   */
  open: boolean;
  
  /**
   * Function to close the modal
   */
  onClose: () => void;
  
  /**
   * Modal sizes
   */
  size?: 'small' | 'default' | 'big' | 'full';
  
  /**
   * Modal title
   */
  title?: string;
  
  /**
   * Show close button
   */
  showCloseButton?: boolean;
  
  /**
   * Close on backdrop click
   */
  closeOnBackdropClick?: boolean;
  
  /**
   * Close on escape key press
   */
  closeOnEscape?: boolean;
  
  /**
   * Custom children
   */
  children?: React.ReactNode;
  
  /**
   * Modal footer content
   */
  footer?: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  size = 'default',
  title,
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  children,
  footer,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Size configurations
  const sizeConfig = {
    small: {
      maxWidth: '28rem', // 448px
      width: '90%',
    },
    default: {
      maxWidth: '32rem', // 512px
      width: '90%',
    },
    big: {
      maxWidth: '48rem', // 768px
      width: '90%',
    },
    full: {
      maxWidth: '95%',
      width: '95%',
      height: '95%',
    },
  };

  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (closeOnEscape && event.key === 'Escape') {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [open, closeOnEscape, onClose]);

  // Handle backdrop click
  const handleBackdropClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!open) return null;

  const sizeStyles = sizeConfig[size];

  const backdropStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.dim,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: spacing[4],
  };

  const modalStyles: React.CSSProperties = {
    backgroundColor: colors.background.primary,
    borderRadius: borderRadius.lg,
    boxShadow: shadows.xl,
    maxWidth: sizeStyles.maxWidth,
    width: sizeStyles.width,
    height: size === 'full' ? '95%' : 'auto',
    maxHeight: size === 'full' ? '95%' : '90vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  const headerStyles: React.CSSProperties = {
    padding: `${spacing[4]} ${spacing[6]}`,
    borderBottom: `1px solid ${colors.border.primary}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0,
  };

  const titleStyles: React.CSSProperties = {
    fontSize: typography.textStyles.h4.fontSize,
    fontWeight: typography.textStyles.h4.fontWeight,
    lineHeight: typography.textStyles.h4.lineHeight,
    color: colors.text.primary,
    margin: 0,
    fontFamily: typography.fontFamily.sans.join(', '),
  };

  const closeButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    fontSize: '1.5rem',
    cursor: 'pointer',
    color: colors.text.tertiary,
    padding: spacing[1],
    borderRadius: borderRadius.base,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2rem',
    height: '2rem',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
  };

  const contentStyles: React.CSSProperties = {
    padding: spacing[6],
    overflowY: 'auto',
    flex: 1,
  };

  const footerStyles: React.CSSProperties = {
    padding: `${spacing[4]} ${spacing[6]}`,
    borderTop: `1px solid ${colors.border.primary}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing[3],
    flexShrink: 0,
  };

  return (
    <div style={backdropStyles} onClick={handleBackdropClick}>
      <div ref={modalRef} style={modalStyles}>
        {(title || showCloseButton) && (
          <div style={headerStyles}>
            {title && <h2 style={titleStyles}>{title}</h2>}
            {showCloseButton && (
              <button
                style={closeButtonStyles}
                onClick={onClose}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.background.secondary;
                  e.currentTarget.style.color = colors.text.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = colors.text.tertiary;
                }}
              >
                ×
              </button>
            )}
          </div>
        )}
        
        <div style={contentStyles}>
          {children}
        </div>
        
        {footer && (
          <div style={footerStyles}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;
