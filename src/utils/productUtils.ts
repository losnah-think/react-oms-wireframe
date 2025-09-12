import { Product, ProductVariant } from '../types/database';
import { mockProducts } from '../data/mockProducts';

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ko-KR', {
    style: 'currency',
    currency: 'KRW'
  }).format(price);
};

export const getStockStatus = (product: Product): 'in-stock' | 'low-stock' | 'out-of-stock' => {
  if (product.isOutOfStock || product.stock === 0) {
    return 'out-of-stock';
  }
  
  if (product.stock <= (product.safeStock || 10)) {
    return 'low-stock';
  }
  
  return 'in-stock';
};

export const getProductStatusBadge = (product: Product) => {
  const stockStatus = getStockStatus(product);
  
  if (!product.isSelling) {
    return { text: '판매중단', color: 'gray' };
  }
  
  if (product.isSoldout) {
    return { text: '품절', color: 'red' };
  }
  
  switch (stockStatus) {
    case 'out-of-stock':
      return { text: '재고없음', color: 'red' };
    case 'low-stock':
      return { text: '재고부족', color: 'yellow' };
    default:
      return { text: '정상', color: 'green' };
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

export const getProductById = (id: string): Product | undefined => {
  return mockProducts.find(product => product.id === id);
};

export const calculateTotalValue = (products: Product[]): number => {
  return products.reduce((total, product) => total + (product.representativeSellingPrice * product.stock), 0);
};

export const getCategories = (products: Product[]): string[] => {
  const categories = new Set(products.map(product => product.productCategory));
  return Array.from(categories).sort();
};