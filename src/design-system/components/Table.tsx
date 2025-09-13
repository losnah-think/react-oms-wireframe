import React from 'react';
import { spacing, typography } from '../tokens';
import Button from './Button';

export interface TableColumn<T = any> {
  key: string;
  title: string;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, record: T, index: number) => React.ReactNode;
  sorter?: boolean;
  fixed?: 'left' | 'right';
}

export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
  expandable?: {
    expandedRowKeys?: string[];
    onExpand?: (expanded: boolean, record: T) => void;
    expandedRowRender?: (record: T, index: number) => React.ReactNode;
    rowExpandable?: (record: T) => boolean;
  };
  rowSelection?: {
    selectedRowKeys?: string[];
    onChange?: (selectedRowKeys: string[], selectedRows: T[]) => void;
    getCheckboxProps?: (record: T) => { disabled?: boolean };
  };
  size?: 'small' | 'middle' | 'large';
  bordered?: boolean;
  className?: string;
  onRow?: (record: T, index: number) => React.HTMLAttributes<HTMLTableRowElement>;
}

const Table = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  pagination,
  expandable,
  rowSelection,
  size = 'middle',
  bordered = true,
  className = '',
  onRow
}: TableProps<T>) => {
  const [sortedData, setSortedData] = React.useState<T[]>(data);
  const [sortKey, setSortKey] = React.useState<string>('');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('asc');
  const [expandedRows, setExpandedRows] = React.useState<string[]>(
    expandable?.expandedRowKeys || []
  );
  const [selectedRows, setSelectedRows] = React.useState<string[]>(
    rowSelection?.selectedRowKeys || []
  );

  React.useEffect(() => {
    setSortedData(data);
  }, [data]);

  const handleSort = (columnKey: string) => {
    if (!columns.find(col => col.key === columnKey)?.sorter) return;

    const newOrder = sortKey === columnKey && sortOrder === 'asc' ? 'desc' : 'asc';
    setSortKey(columnKey);
    setSortOrder(newOrder);

    const sorted = [...data].sort((a, b) => {
      const aVal = a[columnKey];
      const bVal = b[columnKey];
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return newOrder === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return newOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      
      return 0;
    });

    setSortedData(sorted);
  };

  const handleExpand = (record: T) => {
    const key = record.id || record.key;
    const newExpandedRows = expandedRows.includes(key)
      ? expandedRows.filter(k => k !== key)
      : [...expandedRows, key];
    
    setExpandedRows(newExpandedRows);
    expandable?.onExpand?.(!expandedRows.includes(key), record);
  };

  const handleSelectRow = (record: T, checked: boolean) => {
    const key = record.id || record.key;
    const newSelectedRows = checked
      ? [...selectedRows, key]
      : selectedRows.filter(k => k !== key);
    
    setSelectedRows(newSelectedRows);
    const newSelectedRecords = sortedData.filter(item => 
      newSelectedRows.includes(item.id || item.key)
    );
    rowSelection?.onChange?.(newSelectedRows, newSelectedRecords);
  };

  const handleSelectAll = (checked: boolean) => {
    const allKeys = sortedData.map(item => item.id || item.key);
    const newSelectedRows = checked ? allKeys : [];
    setSelectedRows(newSelectedRows);
    const newSelectedRecords = checked ? sortedData : [];
    rowSelection?.onChange?.(newSelectedRows, newSelectedRecords);
  };

  const sizeClasses = {
    small: 'text-sm',
    middle: 'text-base',
    large: 'text-lg'
  };

  const paddingClasses = {
    small: 'px-3 py-2',
    middle: 'px-4 py-3',
    large: 'px-6 py-4'
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">데이터를 불러오는 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg ${bordered ? 'border border-gray-200' : ''} overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {expandable && (
                <th className={`${paddingClasses[size]} text-left font-medium text-gray-900 w-12`}>
                  {/* Expand header */}
                </th>
              )}
              {rowSelection && (
                <th className={`${paddingClasses[size]} text-left font-medium text-gray-900 w-12`}>
                  <input
                    type="checkbox"
                    checked={selectedRows.length === sortedData.length && sortedData.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`${paddingClasses[size]} font-medium text-gray-900 ${
                    column.align === 'center' ? 'text-center' :
                    column.align === 'right' ? 'text-right' : 'text-left'
                  } ${column.sorter ? 'cursor-pointer hover:bg-gray-100' : ''}`}
                  style={{ width: column.width }}
                  onClick={() => column.sorter && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    <span>{column.title}</span>
                    {column.sorter && (
                      <div className="flex flex-col">
                        <svg
                          className={`w-3 h-3 ${
                            sortKey === column.key && sortOrder === 'asc' 
                              ? 'text-blue-600' : 'text-gray-400'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M5 12l5-5 5 5H5z" />
                        </svg>
                        <svg
                          className={`w-3 h-3 -mt-1 ${
                            sortKey === column.key && sortOrder === 'desc' 
                              ? 'text-blue-600' : 'text-gray-400'
                          }`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M15 8l-5 5-5-5h10z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {sortedData.map((record, index) => {
              const rowKey = record.id || record.key || index;
              const isExpanded = expandedRows.includes(rowKey);
              const isSelected = selectedRows.includes(rowKey);
              const rowProps = onRow?.(record, index) || {};

              return (
                <React.Fragment key={rowKey}>
                  <tr
                    className={`hover:bg-gray-50 ${isSelected ? 'bg-blue-50' : ''} ${sizeClasses[size]}`}
                    {...rowProps}
                  >
                    {expandable && (
                      <td className={paddingClasses[size]}>
                        {expandable.rowExpandable?.(record) !== false && (
                          <Button
                            variant="ghost"
                            size="small"
                            onClick={() => handleExpand(record)}
                            className="p-1"
                          >
                            <svg
                              className={`w-4 h-4 transition-transform ${
                                isExpanded ? 'rotate-90' : ''
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Button>
                        )}
                      </td>
                    )}
                    {rowSelection && (
                      <td className={paddingClasses[size]}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleSelectRow(record, e.target.checked)}
                          disabled={rowSelection.getCheckboxProps?.(record)?.disabled}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className={`${paddingClasses[size]} text-gray-900 ${
                          column.align === 'center' ? 'text-center' :
                          column.align === 'right' ? 'text-right' : 'text-left'
                        }`}
                      >
                        {column.render 
                          ? column.render(record[column.key], record, index)
                          : record[column.key]
                        }
                      </td>
                    ))}
                  </tr>
                  {expandable && isExpanded && expandable.expandedRowRender && (
                    <tr>
                      <td 
                        colSpan={
                          columns.length + 
                          (expandable ? 1 : 0) + 
                          (rowSelection ? 1 : 0)
                        }
                        className="p-0"
                      >
                        <div className="bg-gray-50 border-t border-gray-200">
                          {expandable.expandedRowRender(record, index)}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {pagination && (
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="text-sm text-gray-700">
            총 {pagination.total}개 중 {((pagination.current - 1) * pagination.pageSize) + 1}-
            {Math.min(pagination.current * pagination.pageSize, pagination.total)}개 표시
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="secondary"
              size="small"
              disabled={pagination.current <= 1}
              onClick={() => pagination.onChange(pagination.current - 1, pagination.pageSize)}
            >
              이전
            </Button>
            <span className="px-3 py-1 text-sm text-gray-700">
              {pagination.current} / {Math.ceil(pagination.total / pagination.pageSize)}
            </span>
            <Button
              variant="secondary"
              size="small"
              disabled={pagination.current >= Math.ceil(pagination.total / pagination.pageSize)}
              onClick={() => pagination.onChange(pagination.current + 1, pagination.pageSize)}
            >
              다음
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Table;
