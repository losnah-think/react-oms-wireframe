import React, { forwardRef } from 'react';
import { colors, typography, spacing, borderRadius, shadows } from '../tokens';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * Button variants - visual appearance
   */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  
  /**
   * Button sizes
   */
  size?: 'small' | 'default' | 'big';
  
  /**
   * Full width button
   */
  fullWidth?: boolean;
  
  /**
   * Loading state
   */
  loading?: boolean;
  
  /**
   * Left icon element
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Right icon element
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Custom children (text, icons, etc.)
   */
  children?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(({
  variant = 'primary',
  size = 'default',
  fullWidth = false,
  loading = false,
  disabled = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  ...props
}, ref) => {
  // Size configurations
  const sizeConfig = {
    small: {
      padding: `${spacing[2]} ${spacing[4]}`, // 8px 16px
      fontSize: typography.textStyles.button.fontSize,
      fontWeight: typography.textStyles.button.fontWeight,
      lineHeight: typography.textStyles.button.lineHeight,
      height: '2.375rem', // 38px
      minWidth: 'auto',
      iconSize: '0.875rem', // 14px
    },
    default: {
      padding: `${spacing[3]} ${spacing[6]}`, // 12px 24px
      fontSize: typography.textStyles.button.fontSize,
      fontWeight: typography.textStyles.button.fontWeight,
      lineHeight: typography.textStyles.button.lineHeight,
      height: '3rem', // 48px
      minWidth: '9.375rem', // 150px
      iconSize: '1rem', // 16px
    },
    big: {
      padding: `${spacing[4]} ${spacing[8]}`, // 16px 32px
      fontSize: typography.textStyles.buttonLarge.fontSize,
      fontWeight: typography.textStyles.buttonLarge.fontWeight,
      lineHeight: typography.textStyles.buttonLarge.lineHeight,
      height: '3.5rem', // 56px
      minWidth: 'auto',
      iconSize: '1.125rem', // 18px
    },
  };

  // Variant configurations
  const variantConfig = {
    primary: {
      backgroundColor: colors.primary[500],
      color: colors.white,
      border: `1px solid ${colors.primary[500]}`,
      hover: {
        backgroundColor: colors.primary[600],
        borderColor: colors.primary[600],
      },
      focus: {
        backgroundColor: colors.primary[600],
        borderColor: colors.primary[600],
        boxShadow: shadows.focus,
      },
      disabled: {
        backgroundColor: colors.gray[300],
        borderColor: colors.gray[300],
        color: colors.gray[500],
      },
    },
    secondary: {
      backgroundColor: colors.secondary[100],
      color: colors.secondary[700],
      border: `1px solid ${colors.secondary[200]}`,
      hover: {
        backgroundColor: colors.secondary[200],
        borderColor: colors.secondary[300],
      },
      focus: {
        backgroundColor: colors.secondary[200],
        borderColor: colors.secondary[300],
        boxShadow: shadows.focus,
      },
      disabled: {
        backgroundColor: colors.gray[100],
        borderColor: colors.gray[200],
        color: colors.gray[400],
      },
    },
    outline: {
      backgroundColor: colors.transparent,
      color: colors.primary[600],
      border: `1px solid ${colors.primary[300]}`,
      hover: {
        backgroundColor: colors.primary[50],
        borderColor: colors.primary[400],
      },
      focus: {
        backgroundColor: colors.primary[50],
        borderColor: colors.primary[400],
        boxShadow: shadows.focus,
      },
      disabled: {
        backgroundColor: colors.transparent,
        borderColor: colors.gray[200],
        color: colors.gray[400],
      },
    },
    ghost: {
      backgroundColor: colors.transparent,
      color: colors.gray[600],
      border: `1px solid ${colors.transparent}`,
      hover: {
        backgroundColor: colors.gray[50],
        borderColor: colors.transparent,
      },
      focus: {
        backgroundColor: colors.gray[50],
        borderColor: colors.transparent,
        boxShadow: shadows.focus,
      },
      disabled: {
        backgroundColor: colors.transparent,
        borderColor: colors.transparent,
        color: colors.gray[400],
      },
    },
    danger: {
      backgroundColor: colors.danger[600],
      color: colors.white,
      border: `1px solid ${colors.danger[600]}`,
      hover: {
        backgroundColor: colors.danger[700],
        borderColor: colors.danger[700],
      },
      focus: {
        backgroundColor: colors.danger[700],
        borderColor: colors.danger[700],
        boxShadow: shadows.focusError,
      },
      disabled: {
        backgroundColor: colors.gray[300],
        borderColor: colors.gray[300],
        color: colors.gray[500],
      },
    },
  };

  const sizeStyles = sizeConfig[size];
  const variantStyles = variantConfig[variant];
  const isDisabled = disabled || loading;

  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    fontFamily: typography.fontFamily.sans.join(', '),
    fontSize: sizeStyles.fontSize,
    fontWeight: sizeStyles.fontWeight,
    lineHeight: sizeStyles.lineHeight,
    padding: sizeStyles.padding,
    height: sizeStyles.height,
    minWidth: fullWidth ? 'auto' : sizeStyles.minWidth,
    borderRadius: borderRadius.md,
    border: variantStyles.border,
    backgroundColor: isDisabled ? variantStyles.disabled.backgroundColor : variantStyles.backgroundColor,
    color: isDisabled ? variantStyles.disabled.color : variantStyles.color,
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    outline: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    width: fullWidth ? '100%' : 'auto',
    opacity: loading ? 0.8 : 1,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      const target = e.currentTarget;
      target.style.backgroundColor = variantStyles.hover.backgroundColor;
      target.style.borderColor = variantStyles.hover.borderColor;
    }
    props.onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      const target = e.currentTarget;
      target.style.backgroundColor = variantStyles.backgroundColor;
      target.style.borderColor = variantStyles.border.split(' ')[2]; // Extract border color
    }
    props.onMouseLeave?.(e);
  };

  const handleFocus = (e: React.FocusEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      const target = e.currentTarget;
      target.style.backgroundColor = variantStyles.focus.backgroundColor;
      target.style.borderColor = variantStyles.focus.borderColor;
      target.style.boxShadow = variantStyles.focus.boxShadow;
    }
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      const target = e.currentTarget;
      target.style.backgroundColor = variantStyles.backgroundColor;
      target.style.borderColor = variantStyles.border.split(' ')[2]; // Extract border color
      target.style.boxShadow = 'none';
    }
    props.onBlur?.(e);
  };

  return (
    <button
      ref={ref}
      style={baseStyles}
      className={className}
      disabled={isDisabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      {...props}
    >
      {loading && (
        <svg
          style={{
            width: sizeStyles.iconSize,
            height: sizeStyles.iconSize,
            animation: 'spin 1s linear infinite',
          }}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            style={{ opacity: 0.25 }}
          />
          <path
            fill="currentColor"
            d="M4 12a8 8 0 0 1 8-8V2.5"
          />
        </svg>
      )}
      {!loading && leftIcon && (
        <span style={{ fontSize: sizeStyles.iconSize }}>
          {leftIcon}
        </span>
      )}
      {children}
      {!loading && rightIcon && (
        <span style={{ fontSize: sizeStyles.iconSize }}>
          {rightIcon}
        </span>
      )}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;

// Add keyframes for loading animation
if (typeof document !== 'undefined') {
  const styleSheet = document.styleSheets[0] || document.createElement('style').sheet;
  if (styleSheet && !document.querySelector('[data-button-keyframes]')) {
    const style = document.createElement('style');
    style.setAttribute('data-button-keyframes', 'true');
    style.textContent = `
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }
    `;
    document.head.appendChild(style);
  }
}
