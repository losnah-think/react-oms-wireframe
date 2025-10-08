// src/features/products/hooks/useProducts.ts
import { useState, useEffect, useMemo } from 'react';
import { Product, ProductFilters, ProductSort, ProductStats, CreateProductData, UpdateProductData } from '../types';

interface UseProductsOptions {
  filters?: ProductFilters;
  sort?: ProductSort;
  page?: number;
  pageSize?: number;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  stats: ProductStats;
  total: number;
  refresh: () => void;
  createProduct: (data: CreateProductData) => Promise<void>;
  updateProduct: (id: string, updates: UpdateProductData) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  bulkDelete: (ids: string[]) => Promise<void>;
}

export const useProducts = (options: UseProductsOptions = {}): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock data - 실제로는 API 호출
  const mockProducts: Product[] = [
    {
      id: '1',
      name: '[MADE] 임스 베이직 반폴라 니트 JT09390',
      code: 'JJBD03-KN01',
      price: 10000,
      cost: 6000,
      stock: 45,
      status: 'active',
      category: ['상의', '니트'],
      brand: 'MADE J',
      image: '/images/product1.jpg',
      variants: [
        {
          id: 'v1',
          name: 'V-1000-1',
          sku: 'JJBD03-KN01-V1',
          price: 10000,
          cost: 6000,
          stock: 30,
          status: 'active',
          barcode: '123456',
          location: 'A-01-01',
          createdAt: '2024-01-01',
          updatedAt: '2025-01-01'
        }
      ],
      metadata: {
        season: '2024 SS',
        year: '2024',
        designer: '김디자이너',
        supplier: '공급처A',
        registrant: '등록자A',
        tags: ['니트', '반폴라', '베이직']
      },
      createdAt: '2024-01-01',
      updatedAt: '2025-01-01'
    },
    {
      id: '2',
      name: '[FULGO] 클래식 데님 청바지',
      code: 'FULGO-DN01',
      price: 15000,
      cost: 9000,
      stock: 0,
      status: 'out_of_stock',
      category: ['하의', '청바지'],
      brand: 'FULGO',
      variants: [],
      metadata: {
        season: '2024 FW',
        year: '2024',
        designer: '이디자이너',
        supplier: '공급처B',
        registrant: '등록자B',
        tags: ['데님', '청바지', '클래식']
      },
      createdAt: '2024-02-01',
      updatedAt: '2025-01-01'
    }
  ];

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...mockProducts];

    // 필터 적용
    if (options.filters?.search) {
      const search = options.filters.search.toLowerCase();
      filtered = filtered.filter(product => 
        product.name.toLowerCase().includes(search) ||
        product.code.toLowerCase().includes(search) ||
        product.brand.toLowerCase().includes(search)
      );
    }

    if (options.filters?.category) {
      filtered = filtered.filter(product => 
        product.category.includes(options.filters!.category!)
      );
    }

    if (options.filters?.brand) {
      filtered = filtered.filter(product => 
        product.brand === options.filters!.brand
      );
    }

    if (options.filters?.status) {
      filtered = filtered.filter(product => 
        product.status === options.filters!.status
      );
    }

    if (options.filters?.year) {
      filtered = filtered.filter(product => 
        product.metadata.year === options.filters!.year
      );
    }

    if (options.filters?.priceMin !== undefined) {
      filtered = filtered.filter(product => 
        product.price >= options.filters!.priceMin!
      );
    }

    if (options.filters?.priceMax !== undefined) {
      filtered = filtered.filter(product => 
        product.price <= options.filters!.priceMax!
      );
    }

    if (options.filters?.dateFrom) {
      filtered = filtered.filter(product => 
        new Date(product.createdAt) >= new Date(options.filters!.dateFrom!)
      );
    }

    if (options.filters?.dateTo) {
      filtered = filtered.filter(product => 
        new Date(product.createdAt) <= new Date(options.filters!.dateTo!)
      );
    }

    // 정렬 적용
    if (options.sort) {
      filtered.sort((a, b) => {
        const aValue = a[options.sort!.field];
        const bValue = b[options.sort!.field];
        
        if (options.sort!.direction === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        } else {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
      });
    }

    return filtered;
  }, [mockProducts, options.filters, options.sort]);

  const stats: ProductStats = useMemo(() => {
    return {
      total: mockProducts.length,
      active: mockProducts.filter(p => p.status === 'active').length,
      inactive: mockProducts.filter(p => p.status === 'inactive').length,
      outOfStock: mockProducts.filter(p => p.status === 'out_of_stock').length,
      discontinued: mockProducts.filter(p => p.status === 'discontinued').length,
      totalValue: mockProducts.reduce((sum, p) => sum + (p.price * p.stock), 0),
      lowStock: mockProducts.filter(p => p.stock < 10).length
    };
  }, [mockProducts]);

  const refresh = () => {
    setLoading(true);
    // 실제 API 호출 시뮬레이션
    setTimeout(() => {
      setProducts(mockProducts);
      setLoading(false);
    }, 1000);
  };

  const createProduct = async (data: CreateProductData) => {
    const newProduct: Product = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      variants: data.variants.map(variant => ({
        ...variant,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
    };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = async (id: string, updates: UpdateProductData) => {
    setProducts(prev => prev.map(product => 
      product.id === id 
        ? { 
            ...product, 
            ...updates, 
            updatedAt: new Date().toISOString(),
            metadata: { ...product.metadata, ...updates.metadata }
          } 
        : product
    ));
  };

  const deleteProduct = async (id: string) => {
    setProducts(prev => prev.filter(product => product.id !== id));
  };

  const bulkDelete = async (ids: string[]) => {
    setProducts(prev => prev.filter(product => !ids.includes(product.id)));
  };

  useEffect(() => {
    refresh();
  }, []);

  return {
    products: filteredAndSortedProducts,
    loading,
    error,
    stats,
    total: filteredAndSortedProducts.length,
    refresh,
    createProduct,
    updateProduct,
    deleteProduct,
    bulkDelete,
  };
};
