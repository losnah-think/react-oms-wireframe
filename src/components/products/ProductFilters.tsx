import React from 'react';
import { mockProductFilterOptions } from '../../data/mockProductFilters';

type FilterState = {
  searchTerm: string;
  selectedCategory: string;
  selectedBrand: string;
  selectedStatus: string;
  sortBy: string;
  priceRange: { min?: number | string; max?: number | string };
  stockRange: { min?: number | string; max?: number | string };
  dateRange: { start?: string; end?: string };
};

interface ProductFiltersProps {
  filters: FilterState;
  showFilters: boolean;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onToggleFilters: () => void;
  onResetFilters: () => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  showFilters,
  onFilterChange,
  onToggleFilters,
  onResetFilters
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      {/* 검색바 */}
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="상품명, 상품코드, 브랜드로 검색..."
            value={filters.searchTerm}
            onChange={(e) => onFilterChange({ searchTerm: e.target.value })}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
        </div>
        <button
          onClick={onToggleFilters}
          className={`px-4 py-2 border border-gray-300 rounded-lg flex items-center space-x-2 transition-colors ${
            showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'bg-white text-gray-700 hover:bg-gray-50'
          }`}
        >
          <span>🔧</span>
          <span>필터</span>
        </button>
      </div>

      {/* 필터 섹션 */}
      {showFilters && (
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* 카테고리 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
              <select
                value={filters.selectedCategory}
                onChange={(e) => onFilterChange({ selectedCategory: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {mockProductFilterOptions.categories.map((category: any) => (
                  <option key={category.id} value={category.name}>{category.name}</option>
                ))}
              </select>
            </div>

            {/* 브랜드 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">브랜드</label>
              <select
                value={filters.selectedBrand}
                onChange={(e) => onFilterChange({ selectedBrand: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {mockProductFilterOptions.brands.map((brand: any) => (
                  <option key={brand.id} value={brand.name}>{brand.name}</option>
                ))}
              </select>
            </div>

            {/* 상태 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">판매상태</label>
              <select
                value={filters.selectedStatus}
                onChange={(e) => onFilterChange({ selectedStatus: e.target.value })}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {mockProductFilterOptions.status.map((status: any) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* 정렬 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">정렬</label>
              <select
                    value={filters.sortBy}
                    onChange={(e) => onFilterChange({ sortBy: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    {[
                      { value: 'newest', label: '최신순' },
                      { value: 'oldest', label: '오래된순' },
                      { value: 'name_asc', label: '상품명 (가나다순)' },
                      { value: 'name_desc', label: '상품명 (가나다 역순)' },
                    ].map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
            </div>
          </div>

          {/* 가격 및 재고 범위 필터 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">가격 범위</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="최소 가격"
                  value={filters.priceRange.min}
                  onChange={(e) => onFilterChange({ 
                    priceRange: { ...filters.priceRange, min: e.target.value } 
                  })}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="py-2 text-gray-500">~</span>
                <input
                  type="number"
                  placeholder="최대 가격"
                  value={filters.priceRange.max}
                  onChange={(e) => onFilterChange({ 
                    priceRange: { ...filters.priceRange, max: e.target.value } 
                  })}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">재고 범위</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  placeholder="최소 재고"
                  value={filters.stockRange.min}
                  onChange={(e) => onFilterChange({ 
                    stockRange: { ...filters.stockRange, min: e.target.value } 
                  })}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="py-2 text-gray-500">~</span>
                <input
                  type="number"
                  placeholder="최대 재고"
                  value={filters.stockRange.max}
                  onChange={(e) => onFilterChange({ 
                    stockRange: { ...filters.stockRange, max: e.target.value } 
                  })}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 날짜 범위 필터 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">등록일 범위</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={filters.dateRange.start}
                  onChange={(e) => onFilterChange({ 
                    dateRange: { ...filters.dateRange, start: e.target.value } 
                  })}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <span className="py-2 text-gray-500">~</span>
                <input
                  type="date"
                  value={filters.dateRange.end}
                  onChange={(e) => onFilterChange({ 
                    dateRange: { ...filters.dateRange, end: e.target.value } 
                  })}
                  className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={onResetFilters}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                필터 초기화
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters;
