import React, { useState, useRef, useEffect } from 'react';
import { colors, typography, spacing, borderRadius, shadows } from '../tokens';

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface DropdownProps {
  /**
   * Dropdown options
   */
  options: DropdownOption[];
  
  /**
   * Selected value
   */
  value?: string;
  
  /**
   * Change handler
   */
  onChange: (value: string) => void;
  
  /**
   * Placeholder text
   */
  placeholder?: string;
  
  /**
   * Disabled state
   */
  disabled?: boolean;
  
  /**
   * Dropdown sizes
   */
  size?: 'small' | 'default' | 'big';
  
  /**
   * Full width dropdown
   */
  fullWidth?: boolean;
  
  /**
   * Label text
   */
  label?: string;
  
  /**
   * Error message
   */
  errorMessage?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = '선택해주세요',
  disabled = false,
  size = 'default',
  fullWidth = false,
  label,
  errorMessage,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Size configurations
  const sizeConfig = {
    small: {
      padding: `${spacing[1.5]} ${spacing[3]}`, // 6px 12px
      fontSize: typography.textStyles.bodySmall.fontSize,
      height: '2rem', // 32px
      labelFontSize: typography.textStyles.labelSmall.fontSize,
    },
    default: {
      padding: `${spacing[2]} ${spacing[3]}`, // 8px 12px
      fontSize: typography.textStyles.body.fontSize,
      height: '2.5rem', // 40px
      labelFontSize: typography.textStyles.label.fontSize,
    },
    big: {
      padding: `${spacing[2.5]} ${spacing[4]}`, // 10px 16px
      fontSize: typography.textStyles.body.fontSize,
      height: '3rem', // 48px
      labelFontSize: typography.textStyles.label.fontSize,
    },
  };

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const sizeStyles = sizeConfig[size];
  const selectedOption = options.find(option => option.value === value);
  const hasError = !!errorMessage;

  const containerStyles: React.CSSProperties = {
    position: 'relative',
    display: 'inline-block',
    width: fullWidth ? '100%' : 'auto',
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    fontSize: sizeStyles.labelFontSize,
    fontWeight: typography.fontWeight.medium,
    color: disabled ? colors.text.disabled : hasError ? colors.danger[600] : colors.text.secondary,
    marginBottom: spacing[1],
    fontFamily: typography.fontFamily.sans.join(', '),
  };

  const triggerStyles: React.CSSProperties = {
    width: fullWidth ? '100%' : 'auto',
    minWidth: '8rem',
    height: sizeStyles.height,
    padding: `0 ${spacing[8]} 0 ${spacing[3]}`,
    fontSize: sizeStyles.fontSize,
    fontFamily: typography.fontFamily.sans.join(', '),
    fontWeight: typography.fontWeight.normal,
    lineHeight: typography.lineHeight.normal,
    color: disabled 
      ? colors.text.disabled 
      : selectedOption 
        ? colors.text.primary 
        : colors.text.placeholder,
    backgroundColor: disabled ? colors.background.disabled : colors.background.primary,
    border: `1px solid ${disabled ? colors.border.primary : hasError ? colors.border.error : colors.border.primary}`,
    borderRadius: borderRadius.md,
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
  };

  const arrowStyles: React.CSSProperties = {
    position: 'absolute',
    right: spacing[3],
    top: '50%',
    transform: `translateY(-50%) ${isOpen ? 'rotate(180deg)' : 'rotate(0deg)'}`,
    transition: 'transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    pointerEvents: 'none',
    fontSize: '0.75rem',
    color: disabled ? colors.text.disabled : colors.text.tertiary,
  };

  const dropdownStyles: React.CSSProperties = {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 1000,
    backgroundColor: colors.background.primary,
    border: `1px solid ${colors.border.secondary}`,
    borderRadius: borderRadius.md,
    boxShadow: shadows.lg,
    marginTop: spacing[1],
    maxHeight: '12rem',
    overflowY: 'auto',
  };

  const optionStyles = (option: DropdownOption, isSelected: boolean): React.CSSProperties => ({
    padding: `${spacing[2]} ${spacing[3]}`,
    fontSize: sizeStyles.fontSize,
    fontFamily: typography.fontFamily.sans.join(', '),
    color: option.disabled 
      ? colors.text.disabled 
      : isSelected 
        ? colors.primary[600] 
        : colors.text.primary,
    backgroundColor: isSelected ? colors.primary[50] : 'transparent',
    cursor: option.disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    borderBottom: `1px solid ${colors.border.primary}`,
  });

  const errorStyles: React.CSSProperties = {
    fontSize: typography.textStyles.caption.fontSize,
    color: colors.danger[600],
    marginTop: spacing[1],
    fontFamily: typography.fontFamily.sans.join(', '),
  };

  const handleTriggerClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionClick = (optionValue: string, optionDisabled?: boolean) => {
    if (!optionDisabled) {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const handleTriggerFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!disabled) {
      e.currentTarget.style.borderColor = hasError ? colors.border.error : colors.border.focus;
      e.currentTarget.style.boxShadow = hasError ? shadows.focusError : shadows.focus;
    }
  };

  const handleTriggerBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!disabled) {
      e.currentTarget.style.borderColor = hasError ? colors.border.error : colors.border.primary;
      e.currentTarget.style.boxShadow = 'none';
    }
  };

  return (
    <div ref={dropdownRef} style={containerStyles}>
      {label && (
        <label style={labelStyles}>
          {label}
        </label>
      )}
      
      <div
        style={triggerStyles}
        onClick={handleTriggerClick}
        onFocus={handleTriggerFocus}
        onBlur={handleTriggerBlur}
        tabIndex={disabled ? -1 : 0}
        onMouseEnter={(e) => {
          if (!disabled) {
            e.currentTarget.style.borderColor = hasError ? colors.border.error : colors.border.secondary;
          }
        }}
        onMouseLeave={(e) => {
          if (!disabled && !isOpen) {
            e.currentTarget.style.borderColor = hasError ? colors.border.error : colors.border.primary;
          }
        }}
      >
        {selectedOption ? selectedOption.label : placeholder}
        <span style={arrowStyles}>▼</span>
      </div>
      
      {isOpen && (
        <div style={dropdownStyles}>
          {options.map((option) => {
            const isSelected = option.value === value;
            return (
              <div
                key={option.value}
                style={optionStyles(option, isSelected)}
                onClick={() => handleOptionClick(option.value, option.disabled)}
                onMouseEnter={(e) => {
                  if (!option.disabled) {
                    e.currentTarget.style.backgroundColor = isSelected 
                      ? colors.primary[100] 
                      : colors.background.secondary;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!option.disabled) {
                    e.currentTarget.style.backgroundColor = isSelected 
                      ? colors.primary[50] 
                      : 'transparent';
                  }
                }}
              >
                {option.label}
              </div>
            );
          })}
        </div>
      )}
      
      {errorMessage && (
        <div style={errorStyles}>
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default Dropdown;
