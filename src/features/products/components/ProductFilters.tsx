// src/features/products/components/ProductFilters.tsx
import React from 'react';
import { Card, Input, Button } from '../../../design-system';
import { ProductFiltersProps, ProductStatus } from '../types';

const ProductFilters: React.FC<ProductFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
  loading = false
}) => {
  const handleFilterChange = (key: keyof typeof filters, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const handleReset = () => {
    onReset();
  };

  return (
    <Card padding="lg">
      <div className="space-y-4">
        {/* 검색 */}
        <div>
          <Input
            placeholder="상품명, 상품코드로 검색"
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            disabled={loading}
          />
        </div>

        {/* 필터 그리드 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 카테고리 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              카테고리
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              <option value="상의">상의</option>
              <option value="하의">하의</option>
              <option value="신발">신발</option>
              <option value="액세서리">액세서리</option>
            </select>
          </div>

          {/* 브랜드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              브랜드
            </label>
            <select
              value={filters.brand || ''}
              onChange={(e) => handleFilterChange('brand', e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              <option value="MADE J">MADE J</option>
              <option value="FULGO">FULGO</option>
              <option value="NIKE">NIKE</option>
              <option value="ADIDAS">ADIDAS</option>
            </select>
          </div>

          {/* 상태 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상태
            </label>
            <select
              value={filters.status || ''}
              onChange={(e) => handleFilterChange('status', e.target.value as ProductStatus)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              <option value="active">판매중</option>
              <option value="inactive">판매중단</option>
              <option value="out_of_stock">품절</option>
              <option value="discontinued">단종</option>
            </select>
          </div>

          {/* 연도 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              연도
            </label>
            <select
              value={filters.year || ''}
              onChange={(e) => handleFilterChange('year', e.target.value)}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">전체</option>
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>
        </div>

        {/* 가격 범위 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              최소 가격
            </label>
            <Input
              type="number"
              placeholder="0"
              value={filters.priceMin || ''}
              onChange={(e) => handleFilterChange('priceMin', parseInt(e.target.value) || undefined)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              최대 가격
            </label>
            <Input
              type="number"
              placeholder="999999"
              value={filters.priceMax || ''}
              onChange={(e) => handleFilterChange('priceMax', parseInt(e.target.value) || undefined)}
              disabled={loading}
            />
          </div>
        </div>

        {/* 날짜 범위 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              등록일 시작
            </label>
            <Input
              type="date"
              value={filters.dateFrom || ''}
              onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              등록일 종료
            </label>
            <Input
              type="date"
              value={filters.dateTo || ''}
              onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {/* 액션 버튼 */}
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            onClick={handleReset}
            disabled={loading}
          >
            초기화
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ProductFilters;
