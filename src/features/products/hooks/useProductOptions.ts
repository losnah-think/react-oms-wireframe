// src/features/products/hooks/useProductOptions.ts
import { useState, useEffect } from 'react';
import { ProductOption, OptionFormData } from '../types';

interface UseProductOptionsOptions {
  productId: string;
}

interface UseProductOptionsReturn {
  options: ProductOption[];
  loading: boolean;
  error: string | null;
  refresh: () => void;
  createOption: (data: OptionFormData) => Promise<void>;
  updateOption: (id: string, data: OptionFormData) => Promise<void>;
  deleteOption: (id: string) => Promise<void>;
  bulkUpdateOptions: (updates: Partial<ProductOption>[]) => Promise<void>;
}

export const useProductOptions = ({ productId }: UseProductOptionsOptions): UseProductOptionsReturn => {
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock 데이터 - 실제로는 API 호출
  const mockOptions: ProductOption[] = [
    {
      id: '1',
      productId: productId,
      name: 'V-1000-1',
      sku: 'JJBD03-KN01-V1',
      price: 10000,
      cost: 6000,
      stock: 30,
      status: 'active',
      barcode: '123456',
      location: 'A-01-01',
      attributes: [
        { name: '색상', value: '블랙' },
        { name: '사이즈', value: 'M' }
      ],
      createdAt: '2024-01-01',
      updatedAt: '2025-01-01'
    },
    {
      id: '2',
      productId: productId,
      name: 'V-1000-2',
      sku: 'JJBD03-KN01-V2',
      price: 10000,
      cost: 6000,
      stock: 15,
      status: 'active',
      barcode: '123457',
      location: 'A-01-02',
      attributes: [
        { name: '색상', value: '화이트' },
        { name: '사이즈', value: 'L' }
      ],
      createdAt: '2024-01-01',
      updatedAt: '2025-01-01'
    },
    {
      id: '3',
      productId: productId,
      name: 'V-1000-3',
      sku: 'JJBD03-KN01-V3',
      price: 10000,
      cost: 6000,
      stock: 0,
      status: 'out_of_stock',
      barcode: '123458',
      location: 'A-01-03',
      attributes: [
        { name: '색상', value: '그레이' },
        { name: '사이즈', value: 'XL' }
      ],
      createdAt: '2024-01-01',
      updatedAt: '2025-01-01'
    }
  ];

  const refresh = () => {
    setLoading(true);
    // 실제 API 호출 시뮬레이션
    setTimeout(() => {
      setOptions(mockOptions);
      setLoading(false);
    }, 1000);
  };

  const createOption = async (data: OptionFormData) => {
    const newOption: ProductOption = {
      id: Date.now().toString(),
      productId: productId,
      name: data.name,
      sku: data.sku,
      price: Number(data.price),
      cost: Number(data.cost),
      stock: Number(data.stock),
      status: 'active',
      barcode: data.barcode || undefined,
      location: data.location || undefined,
      attributes: data.attributes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setOptions(prev => [...prev, newOption]);
  };

  const updateOption = async (id: string, data: OptionFormData) => {
    setOptions(prev => prev.map(option => 
      option.id === id 
        ? {
            ...option,
            name: data.name,
            sku: data.sku,
            price: Number(data.price),
            cost: Number(data.cost),
            stock: Number(data.stock),
            barcode: data.barcode || undefined,
            location: data.location || undefined,
            attributes: data.attributes,
            updatedAt: new Date().toISOString()
          }
        : option
    ));
  };

  const deleteOption = async (id: string) => {
    setOptions(prev => prev.filter(option => option.id !== id));
  };

  const bulkUpdateOptions = async (updates: Partial<ProductOption>[]) => {
    setOptions(prev => prev.map(option => {
      const update = updates.find(u => u.id === option.id);
      if (update) {
        return {
          ...option,
          ...update,
          updatedAt: new Date().toISOString()
        };
      }
      return option;
    }));
  };

  useEffect(() => {
    refresh();
  }, [productId]);

  return {
    options,
    loading,
    error,
    refresh,
    createOption,
    updateOption,
    deleteOption,
    bulkUpdateOptions,
  };
};
