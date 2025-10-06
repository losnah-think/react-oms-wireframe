import React from 'react';
import { colors, typography, spacing, borderRadius } from '../tokens';

export interface AlertProps {
  /**
   * Alert message
   */
  message: string;
  
  /**
   * Alert type
   */
  type: 'success' | 'error' | 'warning' | 'info';
  
  /**
   * Show alert
   */
  open: boolean;
  
  /**
   * Close handler
   */
  onClose: () => void;
  
  /**
   * Auto close duration (ms)
   */
  duration?: number;
  
  /**
   * Show close button
   */
  showCloseButton?: boolean;
}

const Alert: React.FC<AlertProps> = ({
  message,
  type,
  open,
  onClose,
  duration = 3000,
  showCloseButton = true
}) => {
  React.useEffect(() => {
    if (!open || duration <= 0) return;
    
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [open, duration, onClose]);

  if (!open) return null;

  const typeConfig = {
    success: {
      backgroundColor: '#10b981',
      icon: '✓'
    },
    error: {
      backgroundColor: '#ef4444',
      icon: '✕'
    },
    warning: {
      backgroundColor: '#f59e0b',
      icon: '⚠'
    },
    info: {
      backgroundColor: '#3b82f6',
      icon: 'ℹ'
    }
  };

  const config = typeConfig[type];

  const alertStyles: React.CSSProperties = {
    position: 'fixed',
    top: spacing[4],
    right: spacing[4],
    zIndex: 1050,
    backgroundColor: config.backgroundColor,
    color: 'white',
    padding: `${spacing[3]} ${spacing[4]}`,
    borderRadius: borderRadius.lg,
    display: 'flex',
    alignItems: 'center',
    gap: spacing[2],
    minWidth: '300px',
    maxWidth: '500px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    animation: 'slideInRight 0.3s ease-out',
  };

  const iconStyles: React.CSSProperties = {
    fontSize: '1rem',
    fontWeight: 'bold',
  };

  const messageStyles: React.CSSProperties = {
    flex: 1,
    fontSize: typography.textStyles.body.fontSize,
    lineHeight: typography.textStyles.body.lineHeight,
  };

  const closeButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1.2rem',
    padding: spacing[1],
    borderRadius: borderRadius.base,
    opacity: 0.8,
  };

  return (
    <>
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      <div style={alertStyles}>
        <span style={iconStyles}>{config.icon}</span>
        <span style={messageStyles}>{message}</span>
        {showCloseButton && (
          <button
            style={closeButtonStyles}
            onClick={onClose}
            onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
            onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
          >
            ×
          </button>
        )}
      </div>
    </>
  );
};

export default Alert;