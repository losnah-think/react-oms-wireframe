import React from 'react';
import { spacing } from '../tokens';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Container max width
   */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | 'full';
  
  /**
   * Center the container
   */
  centered?: boolean;
  
  /**
   * Container padding
   */
  padding?: keyof typeof spacing.component;
  
  /**
   * Custom children
   */
  children?: React.ReactNode;
}

const Container: React.FC<ContainerProps> = ({
  maxWidth = 'full',
  centered = true,
  padding = 'lg',
  children,
  className = '',
  style,
  ...props
}) => {
  const maxWidthConfig = {
    xs: '20rem',      // 320px
    sm: '24rem',      // 384px
    md: '28rem',      // 448px
    lg: '32rem',      // 512px
    xl: '36rem',      // 576px
    '2xl': '42rem',   // 672px
    '3xl': '48rem',   // 768px
    '4xl': '56rem',   // 896px
    '5xl': '64rem',   // 1024px
    '6xl': '72rem',   // 1152px
    '7xl': '80rem',   // 1280px
    full: '100%',
  };

  const containerStyles: React.CSSProperties = {
    width: '100%',
    maxWidth: maxWidthConfig[maxWidth],
    margin: centered ? '0 auto' : undefined,
    padding: spacing.component[padding],
    ...style,
  };

  return (
    <div
      style={containerStyles}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

export default Container;
