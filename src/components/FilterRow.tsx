import React from 'react';

type FilterRowProps = {
  label: React.ReactNode;
  children: React.ReactNode;
  labelWidth?: number | string;
  className?: string;
};

const FilterRow: React.FC<FilterRowProps> = ({ label, children, labelWidth = 120, className }) => {
  return (
    <div className={`flex items-start ${className || ''}`}>
      <label style={{ width: typeof labelWidth === 'number' ? `${labelWidth}px` : labelWidth }} className="text-sm text-gray-700 mt-2">
        {label}
      </label>
      <div className="flex-1">{children}</div>
    </div>
  );
};

export default FilterRow;
