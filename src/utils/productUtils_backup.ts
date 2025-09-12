import { ProductWithVariants } from '../data/mockProducts';

// 필터 관련 타입들
export interface FilterState {
  searchTerm: string;
  selectedCategory: string;
  selectedBrand: string;
  selectedStatus: string;
  priceRange: { min: string; max: string };
  stockRange: { min: string; max: string };
  dateRange: { start: string; end: string };
  sortBy: string;
}

// 상품 필터링 함수
export const filterProducts = (
  products: ProductWithVariants[],
  filters: FilterState
): ProductWithVariants[] => {
  return products.filter(product => {
    // 검색어 필터링
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      if (!product.productName.toLowerCase().includes(searchLower) &&
          !product.productCode.toLowerCase().includes(searchLower) &&
          !(product.brandId || '').toLowerCase().includes(searchLower)) {
        return false;
      }
    }

    // 카테고리 필터링
    if (filters.selectedCategory !== '전체' && product.productCategory !== filters.selectedCategory) {
      return false;
    }

    // 브랜드 필터링
    if (filters.selectedBrand !== '전체' && product.brandId !== filters.selectedBrand) {
      return false;
    }

    // 상태 필터링
    if (filters.selectedStatus !== 'all') {
      if (filters.selectedStatus === 'selling' && !product.isSelling) return false;
      if (filters.selectedStatus === 'soldout' && !product.isSoldout) return false;
      if (filters.selectedStatus === 'discontinued' && product.active !== false) return false;
    }

    // 가격 범위 필터링
    if (filters.priceRange.min && product.representativeSellingPrice < parseInt(filters.priceRange.min)) return false;
    if (filters.priceRange.max && product.representativeSellingPrice > parseInt(filters.priceRange.max)) return false;

    // 재고 범위 필터링
    if (filters.stockRange.min && product.stock < parseInt(filters.stockRange.min)) return false;
    if (filters.stockRange.max && product.stock > parseInt(filters.stockRange.max)) return false;

    // 날짜 범위 필터링
    if (filters.dateRange.start) {
      const startDate = new Date(filters.dateRange.start);
      if (new Date(product.createdAt) < startDate) return false;
    }
    if (filters.dateRange.end) {
      const endDate = new Date(filters.dateRange.end);
      if (new Date(product.createdAt) > endDate) return false;
    }

    return true;
  });
};

// 상품 정렬 함수
export const sortProducts = (
  products: ProductWithVariants[],
  sortBy: string
): ProductWithVariants[] => {
  const sorted = [...products];

  switch (sortBy) {
    case 'newest':
      sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      break;
    case 'oldest':
      sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      break;
    case 'name_asc':
      sorted.sort((a, b) => a.productName.localeCompare(b.productName));
      break;
    case 'name_desc':
      sorted.sort((a, b) => b.productName.localeCompare(a.productName));
      break;
    case 'price_high':
      sorted.sort((a, b) => b.representativeSellingPrice - a.representativeSellingPrice);
      break;
    case 'price_low':
      sorted.sort((a, b) => a.representativeSellingPrice - b.representativeSellingPrice);
      break;
    case 'stock_high':
      sorted.sort((a, b) => b.stock - a.stock);
      break;
    case 'stock_low':
      sorted.sort((a, b) => a.stock - b.stock);
      break;
    default:
      break;
  }

  return sorted;
};

// CSV 내보내기 함수
export const exportToCSV = (products: ProductWithVariants[], filename?: string) => {
  const csvHeaders = ['상품코드', '상품명', '카테고리', '브랜드', '판매가', '재고수량', '상태'];
  const csvData = products.map(product => [
    product.productCode,
    product.productName,
    product.productCategory,
    product.brandId?.replace('BRAND-', '') || '',
    product.representativeSellingPrice?.toString() || '0',
    product.stock?.toString() || '0',
    product.isSelling ? '판매중' : product.isSoldout ? '품절' : '판매중지'
  ]);

  const csvContent = [csvHeaders, ...csvData].map(row => row.join(',')).join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename || `상품목록_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
};

// 날짜 포맷 함수
export const formatDate = (date: Date | string): string => {
  return new Date(date).toLocaleDateString('ko-KR');
};

// 가격 포맷 함수
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ko-KR').format(price) + '원';
};

// 재고 상태 확인 함수 (개별 재고와 안전재고를 받음)
export const getStockStatus = (stock: number, safeStock: number = 0) => {
  if (stock <= safeStock) {
    return { 
      class: 'bg-red-100 text-red-800', 
      text: '부족',
      color: 'text-red-600', 
      status: 'danger' 
    };
  } else if (stock <= safeStock * 2) {
    return { 
      class: 'bg-yellow-100 text-yellow-800', 
      text: '주의',
      color: 'text-yellow-600', 
      status: 'warning' 
    };
  }
  return { 
    class: 'bg-green-100 text-green-800', 
    text: '충분',
    color: 'text-gray-900', 
    status: 'normal' 
  };
};

// 상품 상태 뱃지 클래스
export const getProductStatusBadge = (product: ProductWithVariants) => {
  if (!product.isSelling) {
    return { class: 'bg-red-100 text-red-800', text: '판매중지' };
  }
  if (product.isSoldout) {
    return { class: 'bg-yellow-100 text-yellow-800', text: '품절' };
  }
  return { class: 'bg-green-100 text-green-800', text: '판매중' };
};

// 상품 상태 뱃지 정보
export const getProductStatusBadge = (product: ProductWithVariants) => {
  if (product.isSelling) {
    return { 
      text: '판매중', 
      className: 'bg-green-100 text-green-800' 
    };
  } else if (product.isSoldout) {
    return { 
      text: '품절', 
      className: 'bg-red-100 text-red-800' 
    };
  } else if (!product.active) {
    return { 
      text: '판매중지', 
      className: 'bg-gray-100 text-gray-800' 
    };
  } else {
    return { 
      text: '준비중', 
      className: 'bg-yellow-100 text-yellow-800' 
    };
  }
};
