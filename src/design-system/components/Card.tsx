import React from 'react';
import { colors, spacing, borderRadius, shadows } from '../tokens';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Card variants
   */
  variant?: 'default' | 'outlined' | 'elevated';
  
  /**
   * Card padding size
   */
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  
  /**
   * Whether the card should have hover effects
   */
  interactive?: boolean;
  
  /**
   * Custom children
   */
  children?: React.ReactNode;
}

const Card: React.FC<CardProps> = ({
  variant = 'default',
  padding = 'md',
  interactive = false,
  children,
  className = '',
  style,
  ...props
}) => {
  // Padding configurations
  const paddingConfig = {
    none: '0',
    sm: spacing[3], // 12px
    md: spacing[4], // 16px
    lg: spacing[6], // 24px
    xl: spacing[8], // 32px
  };

  // Variant configurations
  const variantConfig = {
    default: {
      backgroundColor: colors.background.primary,
      border: `1px solid ${colors.border.primary}`,
      boxShadow: shadows.none,
    },
    outlined: {
      backgroundColor: colors.background.primary,
      border: `1px solid ${colors.border.secondary}`,
      boxShadow: shadows.none,
    },
    elevated: {
      backgroundColor: colors.background.primary,
      border: `1px solid ${colors.border.primary}`,
      boxShadow: shadows.sm,
    },
  };

  const variantStyles = variantConfig[variant];

  const baseStyles: React.CSSProperties = {
    display: 'block',
    borderRadius: borderRadius.lg,
    padding: paddingConfig[padding],
    backgroundColor: variantStyles.backgroundColor,
    border: variantStyles.border,
    boxShadow: variantStyles.boxShadow,
    transition: interactive ? 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' : 'none',
    cursor: interactive ? 'pointer' : 'default',
    ...style,
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    if (interactive) {
      const target = e.currentTarget;
      target.style.boxShadow = shadows.md;
      target.style.transform = 'translateY(-1px)';
    }
    props.onMouseEnter?.(e);
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    if (interactive) {
      const target = e.currentTarget;
      target.style.boxShadow = variantStyles.boxShadow;
      target.style.transform = 'translateY(0)';
    }
    props.onMouseLeave?.(e);
  };

  return (
    <div
      style={baseStyles}
      className={className}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
