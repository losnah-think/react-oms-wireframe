import React from 'react';

// Grid Container Props
interface GridContainerProps {
  children: React.ReactNode;
  className?: string;
  gutter?: number | [number, number]; // [horizontal, vertical] or single value
  wrap?: boolean;
}

// Grid Item Props
interface GridItemProps {
  children: React.ReactNode;
  className?: string;
  span?: number; // 1-24
  offset?: number; // 0-23
  order?: number;
  xs?: number | { span?: number; offset?: number }; // mobile
  sm?: number | { span?: number; offset?: number }; // tablet
  md?: number | { span?: number; offset?: number }; // small desktop
  lg?: number | { span?: number; offset?: number }; // large desktop
  xl?: number | { span?: number; offset?: number }; // extra large
  xxl?: number | { span?: number; offset?: number }; // extra extra large
}

// Grid Container Component
export const GridContainer: React.FC<GridContainerProps> = ({ 
  children, 
  className = '', 
  gutter = 16,
  wrap = true 
}) => {
  const gutterValue = Array.isArray(gutter) ? gutter : [gutter, gutter];
  const [horizontal, vertical] = gutterValue;

  const containerStyle: React.CSSProperties = {
    marginLeft: horizontal ? -horizontal / 2 : 0,
    marginRight: horizontal ? -horizontal / 2 : 0,
    marginTop: vertical ? -vertical / 2 : 0,
    marginBottom: vertical ? -vertical / 2 : 0,
  };

  const containerClasses = [
    'flex',
    wrap ? 'flex-wrap' : 'flex-nowrap',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClasses} style={containerStyle}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as React.ReactElement<any>, {
            ...(child.props || {}),
            __gutterHorizontal: horizontal,
            __gutterVertical: vertical,
          });
        }
        return child;
      })}
    </div>
  );
};

// Grid Item Component
export const GridItem: React.FC<GridItemProps & { __gutterHorizontal?: number; __gutterVertical?: number }> = ({
  children,
  className = '',
  span = 24,
  offset = 0,
  order,
  xs,
  sm,
  md,
  lg,
  xl,
  xxl,
  __gutterHorizontal = 0,
  __gutterVertical = 0,
}) => {
  // Helper function to generate responsive classes
  const generateResponsiveClasses = (
    breakpoint: string,
    config?: number | { span?: number; offset?: number }
  ): string[] => {
    if (!config) return [];
    
    const classes: string[] = [];
    const prefix = breakpoint === 'base' ? '' : `${breakpoint}:`;
    
    if (typeof config === 'number') {
      // Simple span value
      const percentage = (config / 24) * 100;
      classes.push(`${prefix}w-[${percentage}%]`);
    } else {
      // Object with span and offset
      if (config.span !== undefined) {
        const percentage = (config.span / 24) * 100;
        classes.push(`${prefix}w-[${percentage}%]`);
      }
      if (config.offset !== undefined && config.offset > 0) {
        const offsetPercentage = (config.offset / 24) * 100;
        classes.push(`${prefix}ml-[${offsetPercentage}%]`);
      }
    }
    
    return classes;
  };

  // Generate all responsive classes
  const responsiveClasses = [
    ...generateResponsiveClasses('base', { span, offset }),
    ...generateResponsiveClasses('xs', xs),
    ...generateResponsiveClasses('sm', sm),
    ...generateResponsiveClasses('md', md),
    ...generateResponsiveClasses('lg', lg),
    ...generateResponsiveClasses('xl', xl),
    ...generateResponsiveClasses('2xl', xxl),
  ];

  const itemClasses = [
    'box-border',
    order !== undefined && `order-${order}`,
    ...responsiveClasses,
    className
  ].filter(Boolean).join(' ');

  const itemStyle: React.CSSProperties = {
    paddingLeft: __gutterHorizontal / 2,
    paddingRight: __gutterHorizontal / 2,
    paddingTop: __gutterVertical / 2,
    paddingBottom: __gutterVertical / 2,
  };

  return (
    <div className={itemClasses} style={itemStyle}>
      {children}
    </div>
  );
};

// Predefined Grid Layouts
interface GridRowProps {
  children: React.ReactNode;
  className?: string;
  gutter?: number | [number, number];
  align?: 'top' | 'middle' | 'bottom';
  justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly';
}

export const GridRow: React.FC<GridRowProps> = ({
  children,
  className = '',
  gutter = 16,
  align = 'top',
  justify = 'start'
}) => {
  const alignClasses = {
    top: 'items-start',
    middle: 'items-center',
    bottom: 'items-end'
  };

  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    'space-around': 'justify-around',
    'space-between': 'justify-between',
    'space-evenly': 'justify-evenly'
  };

  const rowClasses = [
    alignClasses[align],
    justifyClasses[justify],
    className
  ].filter(Boolean).join(' ');

  return (
    <GridContainer className={rowClasses} gutter={gutter} wrap={true}>
      {children}
    </GridContainer>
  );
};

// Predefined Column Component
interface GridColProps extends Omit<GridItemProps, 'span'> {
  span?: number;
}

export const GridCol: React.FC<GridColProps> = (props) => {
  return <GridItem {...props} />;
};

// Main Grid Component (combines Container and Item)
interface GridProps {
  container?: boolean;
  item?: boolean;
  children: React.ReactNode;
  className?: string;
  // Container props
  gutter?: number | [number, number];
  wrap?: boolean;
  // Item props
  span?: number;
  offset?: number;
  order?: number;
  xs?: number | { span?: number; offset?: number };
  sm?: number | { span?: number; offset?: number };
  md?: number | { span?: number; offset?: number };
  lg?: number | { span?: number; offset?: number };
  xl?: number | { span?: number; offset?: number };
  xxl?: number | { span?: number; offset?: number };
}

export const Grid: React.FC<GridProps> = ({ 
  container = false, 
  item = false, 
  children, 
  ...props 
}) => {
  if (container && item) {
    return (
      <GridContainer {...props}>
        <GridItem {...props}>
          {children}
        </GridItem>
      </GridContainer>
    );
  }
  
  if (container) {
    return <GridContainer {...props}>{children}</GridContainer>;
  }
  
  if (item) {
    return <GridItem {...props}>{children}</GridItem>;
  }
  
  // Default to container
  return <GridContainer {...props}>{children}</GridContainer>;
};

// Export all components
export { GridContainer as Row, GridItem as Col };

// CSS-in-JS styles for dynamic width calculations
export const GridStyles = () => (
  <style jsx global>{`
    /* Generate width classes for 24-grid system */
    ${Array.from({ length: 24 }, (_, i) => {
      const span = i + 1;
      const percentage = (span / 24) * 100;
      return `.w-${span}-24 { width: ${percentage}%; }`;
    }).join('\n')}
    
    /* Generate offset classes for 24-grid system */
    ${Array.from({ length: 24 }, (_, i) => {
      const offset = i;
      if (offset === 0) return '';
      const percentage = (offset / 24) * 100;
      return `.ml-${offset}-24 { margin-left: ${percentage}%; }`;
    }).join('\n')}
    
    /* Responsive variants */
    @media (min-width: 475px) {
      ${Array.from({ length: 24 }, (_, i) => {
        const span = i + 1;
        const percentage = (span / 24) * 100;
        return `.xs\\:w-${span}-24 { width: ${percentage}%; }`;
      }).join('\n')}
    }
    
    @media (min-width: 640px) {
      ${Array.from({ length: 24 }, (_, i) => {
        const span = i + 1;
        const percentage = (span / 24) * 100;
        return `.sm\\:w-${span}-24 { width: ${percentage}%; }`;
      }).join('\n')}
    }
    
    @media (min-width: 768px) {
      ${Array.from({ length: 24 }, (_, i) => {
        const span = i + 1;
        const percentage = (span / 24) * 100;
        return `.md\\:w-${span}-24 { width: ${percentage}%; }`;
      }).join('\n')}
    }
    
    @media (min-width: 1024px) {
      ${Array.from({ length: 24 }, (_, i) => {
        const span = i + 1;
        const percentage = (span / 24) * 100;
        return `.lg\\:w-${span}-24 { width: ${percentage}%; }`;
      }).join('\n')}
    }
    
    @media (min-width: 1280px) {
      ${Array.from({ length: 24 }, (_, i) => {
        const span = i + 1;
        const percentage = (span / 24) * 100;
        return `.xl\\:w-${span}-24 { width: ${percentage}%; }`;
      }).join('\n')}
    }
    
    @media (min-width: 1536px) {
      ${Array.from({ length: 24 }, (_, i) => {
        const span = i + 1;
        const percentage = (span / 24) * 100;
        return `.2xl\\:w-${span}-24 { width: ${percentage}%; }`;
      }).join('\n')}
    }
  `}</style>
);

export default Grid;
