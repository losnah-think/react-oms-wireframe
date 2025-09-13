import React from 'react';
import { colors, typography, spacing, borderRadius } from '../tokens';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  /**
   * Badge variants
   */
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
  
  /**
   * Badge sizes
   */
  size?: 'small' | 'default' | 'big';
  
  /**
   * Badge with border only
   */
  outline?: boolean;
  
  /**
   * Custom children
   */
  children?: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'primary',
  size = 'default',
  outline = false,
  children,
  className = '',
  style,
  ...props
}) => {
  // Size configurations
  const sizeConfig = {
    small: {
      padding: `${spacing[0.5]} ${spacing[1.5]}`, // 2px 6px
      fontSize: typography.textStyles.caption.fontSize,
      fontWeight: typography.fontWeight.medium,
      height: '1.125rem', // 18px
    },
    default: {
      padding: `${spacing[1]} ${spacing[2]}`, // 4px 8px
      fontSize: typography.textStyles.labelSmall.fontSize,
      fontWeight: typography.fontWeight.medium,
      height: '1.25rem', // 20px
    },
    big: {
      padding: `${spacing[1.5]} ${spacing[3]}`, // 6px 12px
      fontSize: typography.textStyles.label.fontSize,
      fontWeight: typography.fontWeight.medium,
      height: '1.5rem', // 24px
    },
  };

  // Variant configurations
  const variantConfig = {
    primary: {
      solid: {
        backgroundColor: colors.primary[600],
        color: colors.white,
        border: `1px solid ${colors.primary[600]}`,
      },
      outline: {
        backgroundColor: colors.transparent,
        color: colors.primary[600],
        border: `1px solid ${colors.primary[600]}`,
      },
    },
    secondary: {
      solid: {
        backgroundColor: colors.secondary[600],
        color: colors.white,
        border: `1px solid ${colors.secondary[600]}`,
      },
      outline: {
        backgroundColor: colors.transparent,
        color: colors.secondary[600],
        border: `1px solid ${colors.secondary[600]}`,
      },
    },
    success: {
      solid: {
        backgroundColor: colors.success[600],
        color: colors.white,
        border: `1px solid ${colors.success[600]}`,
      },
      outline: {
        backgroundColor: colors.transparent,
        color: colors.success[600],
        border: `1px solid ${colors.success[600]}`,
      },
    },
    warning: {
      solid: {
        backgroundColor: colors.warning[500],
        color: colors.white,
        border: `1px solid ${colors.warning[500]}`,
      },
      outline: {
        backgroundColor: colors.transparent,
        color: colors.warning[500],
        border: `1px solid ${colors.warning[500]}`,
      },
    },
    danger: {
      solid: {
        backgroundColor: colors.danger[600],
        color: colors.white,
        border: `1px solid ${colors.danger[600]}`,
      },
      outline: {
        backgroundColor: colors.transparent,
        color: colors.danger[600],
        border: `1px solid ${colors.danger[600]}`,
      },
    },
    neutral: {
      solid: {
        backgroundColor: colors.gray[500],
        color: colors.white,
        border: `1px solid ${colors.gray[500]}`,
      },
      outline: {
        backgroundColor: colors.transparent,
        color: colors.gray[500],
        border: `1px solid ${colors.gray[500]}`,
      },
    },
  };

  const sizeStyles = sizeConfig[size];
  const variantStyles = variantConfig[variant][outline ? 'outline' : 'solid'];

  const badgeStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: typography.fontFamily.sans.join(', '),
    fontSize: sizeStyles.fontSize,
    fontWeight: sizeStyles.fontWeight,
    lineHeight: 1,
    padding: sizeStyles.padding,
    height: sizeStyles.height,
    borderRadius: borderRadius.full,
    backgroundColor: variantStyles.backgroundColor,
    color: variantStyles.color,
    border: variantStyles.border,
    whiteSpace: 'nowrap',
    userSelect: 'none',
    ...style,
  };

  return (
    <span
      style={badgeStyles}
      className={className}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
