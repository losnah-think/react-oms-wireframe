// src/features/products/options/OptionBulkEditPage.tsx
import React, { useState } from 'react';
import { Container, Card, Button, Table, type TableColumn } from '../../../design-system';
import { ProductOption, OptionBulkEditProps } from '../types';

const OptionBulkEditPage: React.FC<OptionBulkEditProps> = ({
  productId,
  options,
  onSave,
  onCancel
}) => {
  const [editedOptions, setEditedOptions] = useState<ProductOption[]>(options);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleOptionChange = (optionId: string, field: keyof ProductOption, value: any) => {
    setEditedOptions(prev => 
      prev.map(option => 
        option.id === optionId 
          ? { ...option, [field]: value }
          : option
      )
    );

    // 에러 초기화
    const errorKey = `${optionId}-${field}`;
    if (errors[errorKey]) {
      setErrors(prev => ({
        ...prev,
        [errorKey]: ''
      }));
    }
  };

  const validateOptions = (): boolean => {
    const newErrors: Record<string, string> = {};

    editedOptions.forEach(option => {
      if (!option.name.trim()) {
        newErrors[`${option.id}-name`] = '옵션명을 입력해주세요';
      }
      if (!option.sku.trim()) {
        newErrors[`${option.id}-sku`] = 'SKU를 입력해주세요';
      }
      if (isNaN(option.price) || option.price < 0) {
        newErrors[`${option.id}-price`] = '올바른 가격을 입력해주세요';
      }
      if (isNaN(option.cost) || option.cost < 0) {
        newErrors[`${option.id}-cost`] = '올바른 원가를 입력해주세요';
      }
      if (isNaN(option.stock) || option.stock < 0) {
        newErrors[`${option.id}-stock`] = '올바른 재고 수량을 입력해주세요';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateOptions()) {
      return;
    }

    setLoading(true);
    try {
      const updates = editedOptions.map(option => ({
        id: option.id,
        name: option.name,
        sku: option.sku,
        price: option.price,
        cost: option.cost,
        stock: option.stock,
        barcode: option.barcode,
        location: option.location,
        status: option.status
      }));
      
      await onSave(updates);
    } catch (error) {
      console.error('옵션 일괄 수정 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: TableColumn<ProductOption>[] = [
    {
      key: 'name',
      title: '옵션명',
      render: (option) => (
        <input
          type="text"
          value={option.name}
          onChange={(e) => handleOptionChange(option.id, 'name', e.target.value)}
          className={`w-full px-2 py-1 border rounded ${
            errors[`${option.id}-name`] ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="옵션명"
        />
      ),
    },
    {
      key: 'sku',
      title: 'SKU',
      render: (option) => (
        <input
          type="text"
          value={option.sku}
          onChange={(e) => handleOptionChange(option.id, 'sku', e.target.value)}
          className={`w-full px-2 py-1 border rounded ${
            errors[`${option.id}-sku`] ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="SKU"
        />
      ),
    },
    {
      key: 'price',
      title: '판매가',
      render: (option) => (
        <input
          type="number"
          value={option.price}
          onChange={(e) => handleOptionChange(option.id, 'price', Number(e.target.value))}
          className={`w-full px-2 py-1 border rounded ${
            errors[`${option.id}-price`] ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="0"
        />
      ),
    },
    {
      key: 'cost',
      title: '원가',
      render: (option) => (
        <input
          type="number"
          value={option.cost}
          onChange={(e) => handleOptionChange(option.id, 'cost', Number(e.target.value))}
          className={`w-full px-2 py-1 border rounded ${
            errors[`${option.id}-cost`] ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="0"
        />
      ),
    },
    {
      key: 'stock',
      title: '재고',
      render: (option) => (
        <input
          type="number"
          value={option.stock}
          onChange={(e) => handleOptionChange(option.id, 'stock', Number(e.target.value))}
          className={`w-full px-2 py-1 border rounded ${
            errors[`${option.id}-stock`] ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="0"
        />
      ),
    },
    {
      key: 'barcode',
      title: '바코드',
      render: (option) => (
        <input
          type="text"
          value={option.barcode || ''}
          onChange={(e) => handleOptionChange(option.id, 'barcode', e.target.value)}
          className="w-full px-2 py-1 border border-gray-300 rounded"
          placeholder="바코드"
        />
      ),
    },
    {
      key: 'location',
      title: '위치',
      render: (option) => (
        <input
          type="text"
          value={option.location || ''}
          onChange={(e) => handleOptionChange(option.id, 'location', e.target.value)}
          className="w-full px-2 py-1 border border-gray-300 rounded"
          placeholder="위치"
        />
      ),
    },
    {
      key: 'status',
      title: '상태',
      render: (option) => (
        <select
          value={option.status}
          onChange={(e) => handleOptionChange(option.id, 'status', e.target.value)}
          className="w-full px-2 py-1 border border-gray-300 rounded"
        >
          <option value="active">활성</option>
          <option value="inactive">비활성</option>
          <option value="out_of_stock">품절</option>
        </select>
      ),
    },
  ];

  return (
    <Container maxWidth="full" centered={false} padding="lg">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">옵션 일괄 수정</h1>
        <p className="text-sm text-gray-600 mt-1">
          상품의 모든 옵션을 한 번에 수정할 수 있습니다.
        </p>
      </div>

      <Card padding="lg" className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">수정할 옵션</h3>
            <p className="text-sm text-gray-600">총 {editedOptions.length}개의 옵션</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                // 모든 변경사항 되돌리기
                setEditedOptions(options);
                setErrors({});
              }}
              disabled={loading}
            >
              변경사항 되돌리기
            </Button>
          </div>
        </div>
      </Card>

      <Card padding="none" className="mb-6">
        <Table
          data={editedOptions}
          columns={columns}
        />
      </Card>

      {/* 에러 메시지 표시 */}
      {Object.keys(errors).length > 0 && (
        <Card padding="md" className="mb-6 border-red-200 bg-red-50">
          <h4 className="text-sm font-medium text-red-800 mb-2">수정이 필요한 항목:</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {Object.entries(errors).map(([key, message]) => (
              <li key={key}>• {message}</li>
            ))}
          </ul>
        </Card>
      )}

      {/* 액션 버튼 */}
      <div className="flex justify-end gap-3">
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
        >
          취소
        </Button>
        <Button
          onClick={handleSubmit}
          loading={loading}
          disabled={loading}
        >
          일괄 수정
        </Button>
      </div>
    </Container>
  );
};

export default OptionBulkEditPage;
