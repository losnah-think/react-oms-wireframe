import React, { forwardRef } from 'react';
import { colors, typography, spacing, borderRadius, shadows } from '../tokens';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /**
   * Input variants
   */
  variant?: 'default' | 'filled' | 'outline';
  
  /**
   * Input sizes
   */
  size?: 'sm' | 'md' | 'lg';
  
  /**
   * Input state
   */
  state?: 'default' | 'error' | 'success' | 'warning';
  
  /**
   * Label text
   */
  label?: string;
  
  /**
   * Helper text
   */
  helperText?: string;
  
  /**
   * Error message
   */
  errorMessage?: string;
  
  /**
   * Left icon element
   */
  leftIcon?: React.ReactNode;
  
  /**
   * Right icon element
   */
  rightIcon?: React.ReactNode;
  
  /**
   * Full width input
   */
  fullWidth?: boolean;
  
  /**
   * Required field indicator
   */
  required?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  variant = 'default',
  size = 'md',
  state = 'default',
  label,
  helperText,
  errorMessage,
  leftIcon,
  rightIcon,
  fullWidth = false,
  required = false,
  disabled = false,
  className = '',
  ...props
}, ref) => {
  // Size configurations
  const sizeConfig = {
    sm: {
      padding: `${spacing[1.5]} ${spacing[3]}`, // 6px 12px
      fontSize: typography.textStyles.bodySmall.fontSize,
      height: '2rem', // 32px
      iconSize: '0.875rem', // 14px
      labelFontSize: typography.textStyles.labelSmall.fontSize,
    },
    md: {
      padding: `${spacing[2]} ${spacing[3]}`, // 8px 12px
      fontSize: typography.textStyles.body.fontSize,
      height: '2.5rem', // 40px
      iconSize: '1rem', // 16px
      labelFontSize: typography.textStyles.label.fontSize,
    },
    lg: {
      padding: `${spacing[2.5]} ${spacing[4]}`, // 10px 16px
      fontSize: typography.textStyles.body.fontSize,
      height: '3rem', // 48px
      iconSize: '1.125rem', // 18px
      labelFontSize: typography.textStyles.label.fontSize,
    },
  };

  // State configurations
  const stateConfig = {
    default: {
      borderColor: colors.border.primary,
      focusBorderColor: colors.border.focus,
      backgroundColor: colors.background.primary,
      textColor: colors.text.primary,
      labelColor: colors.text.secondary,
      helperColor: colors.text.tertiary,
      focusBoxShadow: shadows.focus,
    },
    error: {
      borderColor: colors.border.error,
      focusBorderColor: colors.border.error,
      backgroundColor: colors.background.primary,
      textColor: colors.text.primary,
      labelColor: colors.danger[600],
      helperColor: colors.danger[600],
      focusBoxShadow: shadows.focusError,
    },
    success: {
      borderColor: colors.success[300],
      focusBorderColor: colors.success[500],
      backgroundColor: colors.background.primary,
      textColor: colors.text.primary,
      labelColor: colors.success[600],
      helperColor: colors.success[600],
      focusBoxShadow: shadows.focusSuccess,
    },
    warning: {
      borderColor: colors.warning[300],
      focusBorderColor: colors.warning[500],
      backgroundColor: colors.background.primary,
      textColor: colors.text.primary,
      labelColor: colors.warning[600],
      helperColor: colors.warning[600],
      focusBoxShadow: shadows.focus,
    },
  };

  // Variant configurations
  const variantConfig = {
    default: {
      backgroundColor: colors.background.primary,
      border: `1px solid`,
    },
    filled: {
      backgroundColor: colors.background.secondary,
      border: `1px solid transparent`,
    },
    outline: {
      backgroundColor: colors.transparent,
      border: `2px solid`,
    },
  };

  const sizeStyles = sizeConfig[size];
  const stateStyles = stateConfig[state];
  const variantStyles = variantConfig[variant];
  const finalState = errorMessage ? 'error' : state;
  const finalStateStyles = stateConfig[finalState];

  const inputStyles: React.CSSProperties = {
    width: fullWidth ? '100%' : 'auto',
    height: sizeStyles.height,
    padding: leftIcon || rightIcon 
      ? `${spacing[2]} ${rightIcon ? sizeStyles.height : spacing[3]} ${spacing[2]} ${leftIcon ? sizeStyles.height : spacing[3]}`
      : sizeStyles.padding,
    fontSize: sizeStyles.fontSize,
    fontFamily: typography.fontFamily.sans.join(', '),
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
    color: disabled ? colors.text.disabled : finalStateStyles.textColor,
    backgroundColor: disabled ? colors.background.disabled : variantStyles.backgroundColor,
    border: variantStyles.border,
    borderColor: disabled ? colors.border.primary : finalStateStyles.borderColor,
    borderRadius: borderRadius.md,
    outline: 'none',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    cursor: disabled ? 'not-allowed' : 'text',
  };

  const containerStyles: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    width: fullWidth ? '100%' : 'auto',
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    fontSize: sizeStyles.labelFontSize,
    fontWeight: typography.fontWeight.medium,
    color: disabled ? colors.text.disabled : finalStateStyles.labelColor,
    marginBottom: spacing[1],
    fontFamily: typography.fontFamily.sans.join(', '),
  };

  const helperStyles: React.CSSProperties = {
    fontSize: typography.textStyles.caption.fontSize,
    color: disabled ? colors.text.disabled : finalStateStyles.helperColor,
    marginTop: spacing[1],
    fontFamily: typography.fontFamily.sans.join(', '),
  };

  const iconStyles: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    fontSize: sizeStyles.iconSize,
    color: disabled ? colors.text.disabled : colors.text.tertiary,
    pointerEvents: 'none',
    zIndex: 1,
  };

  const leftIconStyles: React.CSSProperties = {
    ...iconStyles,
    left: spacing[3],
  };

  const rightIconStyles: React.CSSProperties = {
    ...iconStyles,
    right: spacing[3],
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!disabled) {
      const target = e.currentTarget;
      target.style.borderColor = finalStateStyles.focusBorderColor;
      target.style.boxShadow = finalStateStyles.focusBoxShadow;
    }
    props.onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (!disabled) {
      const target = e.currentTarget;
      target.style.borderColor = finalStateStyles.borderColor;
      target.style.boxShadow = 'none';
    }
    props.onBlur?.(e);
  };

  const displayHelperText = errorMessage || helperText;

  return (
    <div style={containerStyles} className={className}>
      {label && (
        <label style={labelStyles}>
          {label}
          {required && (
            <span style={{ color: colors.danger[600], marginLeft: spacing[1] }}>
              *
            </span>
          )}
        </label>
      )}
      
      <div style={{ position: 'relative' }}>
        {leftIcon && (
          <span style={leftIconStyles}>
            {leftIcon}
          </span>
        )}
        
        <input
          ref={ref}
          style={inputStyles}
          disabled={disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {rightIcon && (
          <span style={rightIconStyles}>
            {rightIcon}
          </span>
        )}
      </div>
      
      {displayHelperText && (
        <div style={helperStyles}>
          {errorMessage || helperText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
