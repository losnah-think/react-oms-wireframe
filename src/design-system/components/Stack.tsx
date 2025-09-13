import React from 'react';
import { spacing } from '../tokens';

export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Stack direction
   */
  direction?: 'row' | 'column';
  
  /**
   * Gap between children
   */
  gap?: keyof typeof spacing;
  
  /**
   * Align items
   */
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  
  /**
   * Justify content
   */
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  
  /**
   * Flex wrap
   */
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  
  /**
   * Custom children
   */
  children?: React.ReactNode;
}

const Stack: React.FC<StackProps> = ({
  direction = 'column',
  gap = 4,
  align = 'stretch',
  justify = 'start',
  wrap = 'nowrap',
  children,
  className = '',
  style,
  ...props
}) => {
  const alignItems = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    stretch: 'stretch',
    baseline: 'baseline',
  };

  const justifyContent = {
    start: 'flex-start',
    center: 'center',
    end: 'flex-end',
    between: 'space-between',
    around: 'space-around',
    evenly: 'space-evenly',
  };

  const gapValue = spacing[gap] as string;
  
  const stackStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: direction,
    gap: gapValue,
    alignItems: alignItems[align],
    justifyContent: justifyContent[justify],
    flexWrap: wrap,
    ...style,
  };

  return (
    <div
      style={stackStyles}
      className={className}
      {...props}
    >
      {children}
    </div>
  );
};

export default Stack;
