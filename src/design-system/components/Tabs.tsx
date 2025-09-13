import React from 'react';

export interface TabItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  closable?: boolean;
}

export interface TabsProps {
  items: TabItem[];
  activeKey: string;
  onChange: (key: string) => void;
  onEdit?: (targetKey: string, action: 'add' | 'remove') => void;
  type?: 'line' | 'card' | 'editable-card';
  size?: 'small' | 'middle' | 'large';
  centered?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const Tabs: React.FC<TabsProps> = ({
  items,
  activeKey,
  onChange,
  onEdit,
  type = 'line',
  size = 'middle',
  centered = false,
  className = '',
  children
}) => {
  const sizeClasses = {
    small: 'px-3 py-2 text-sm',
    middle: 'px-4 py-3 text-base',
    large: 'px-6 py-4 text-lg'
  };

  const handleTabClick = (key: string, disabled?: boolean) => {
    if (!disabled) {
      onChange(key);
    }
  };

  const handleClose = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    onEdit?.(key, 'remove');
  };

  const renderTabs = () => {
    return items.map((item) => {
      const isActive = item.key === activeKey;
      const baseClasses = `
        inline-flex items-center gap-2 cursor-pointer transition-all duration-200 
        ${sizeClasses[size]}
        ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `;

      if (type === 'line') {
        return (
          <div
            key={item.key}
            className={`
              ${baseClasses}
              ${isActive 
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-b-2 border-transparent'
              }
            `}
            onClick={() => handleTabClick(item.key, item.disabled)}
          >
            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
            {item.closable && (
              <button
                className="ml-1 p-1 rounded hover:bg-gray-200 hover:text-gray-900"
                onClick={(e) => handleClose(e, item.key)}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        );
      }

      if (type === 'card' || type === 'editable-card') {
        return (
          <div
            key={item.key}
            className={`
              ${baseClasses}
              rounded-t-lg border border-b-0
              ${isActive 
                ? 'bg-white border-gray-300 text-blue-600' 
                : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
              }
            `}
            onClick={() => handleTabClick(item.key, item.disabled)}
          >
            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
            {item.closable && type === 'editable-card' && (
              <button
                className="ml-1 p-1 rounded hover:bg-gray-200 hover:text-gray-900"
                onClick={(e) => handleClose(e, item.key)}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        );
      }

      return null;
    });
  };

  return (
    <div className={className}>
      <div className={`
        flex items-end
        ${centered ? 'justify-center' : ''}
        ${type === 'line' ? 'border-b border-gray-200' : ''}
        ${type === 'card' || type === 'editable-card' ? 'mb-0' : 'mb-4'}
      `}>
        {renderTabs()}
        
        {type === 'editable-card' && onEdit && (
          <button
            className="ml-2 px-3 py-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-t-lg border border-b-0 border-gray-200"
            onClick={() => onEdit('', 'add')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        )}
      </div>

      <div className={`
        ${type === 'card' || type === 'editable-card' 
          ? 'bg-white border border-gray-300 rounded-b-lg rounded-tr-lg p-4' 
          : ''
        }
      `}>
        {children}
      </div>
    </div>
  );
};

export default Tabs;
