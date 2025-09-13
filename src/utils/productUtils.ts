import { Product, ProductVariant } from '../types/database';
import { mockProducts } from '../data/mockProducts';

export type FilterState = {
  searchTerm: string;
  selectedCategory: string;
  selectedBrand: string;
  selectedStatus: string;
  sortBy: string;
  priceRange: { min?: number | string; max?: number | string };
  stockRange: { min?: number | string; max?: number | string };
  dateRange: { start?: string; end?: string };
};

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(price);
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
};

export const getStockStatus = (stockQuantity: number): { label: string; color: 'success' | 'warning' | 'danger' } => {
  if (stockQuantity === 0) {
    return { label: '품절', color: 'danger' };
  }
  
  if (stockQuantity < 10) {
    return { label: '재고부족', color: 'warning' };
  }
  
  return { label: '재고보유', color: 'success' };
};

export const getProductStatusBadge = (product: Product) => {
  const stockStatus = getStockStatus(product.stock || 0);
  
  if (!product.isSelling) {
    return { text: '판매중단', className: 'bg-gray-100 text-gray-800' };
  }
  
  if (product.isSoldout) {
    return { text: '품절', className: 'bg-red-100 text-red-800' };
  }
  
  switch (stockStatus.label) {
    case '품절':
      return { text: '재고없음', className: 'bg-red-100 text-red-800' };
    case '재고부족':
      return { text: '재고부족', className: 'bg-yellow-100 text-yellow-800' };
    default:
      return { text: '정상', className: 'bg-green-100 text-green-800' };
  }
};

export const filterProducts = (
  products: Product[], 
  filters: {
    search?: string;
    category?: string;
    status?: string;
    priceMin?: number;
    priceMax?: number;
  }
): Product[] => {
  return products.filter(product => {
    if (filters.search && !product.productName.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    if (filters.category && product.productCategory !== filters.category) {
      return false;
    }
    
    if (filters.status) {
      const status = getProductStatusBadge(product);
      if (status.text !== filters.status) {
        return false;
      }
    }
    
    if (filters.priceMin && product.representativeSellingPrice < filters.priceMin) {
      return false;
    }
    
    if (filters.priceMax && product.representativeSellingPrice > filters.priceMax) {
      return false;
    }
    
    return true;
  });
};

export const sortProducts = (products: Product[], sortBy: string): Product[] => {
  const sorted = [...products];
  
  switch (sortBy) {
    case 'name-asc':
      return sorted.sort((a, b) => a.productName.localeCompare(b.productName));
    case 'name-desc':
      return sorted.sort((a, b) => b.productName.localeCompare(a.productName));
    case 'price-asc':
      return sorted.sort((a, b) => a.representativeSellingPrice - b.representativeSellingPrice);
    case 'price-desc':
      return sorted.sort((a, b) => b.representativeSellingPrice - a.representativeSellingPrice);
    case 'stock-asc':
      return sorted.sort((a, b) => a.stock - b.stock);
    case 'stock-desc':
      return sorted.sort((a, b) => b.stock - a.stock);
    case 'updated-desc':
      return sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    default:
      return sorted;
  }
};

export const getProductById = (id: number | string): any => {
  const numericId = typeof id === 'string' ? Number(id) : id;
  return mockProducts.find(product => product.id === numericId);
};

export const calculateTotalValue = (products: Product[]): number => {
  return products.reduce((total, product) => total + (product.representativeSellingPrice * product.stock), 0);
};

export const getCategories = (products: Product[]): string[] => {
  const categories = new Set(products.map(product => product.productCategory));
  return Array.from(categories).sort();
};