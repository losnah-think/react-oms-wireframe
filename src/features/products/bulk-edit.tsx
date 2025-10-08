// src/features/products/bulk-edit.tsx
import React, { useState } from 'react';
import { Container, Card, Button, Table, TableColumn } from '../../design-system';
import { useRouter } from 'next/router';

interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  status: string;
}

const BulkEditPage: React.FC = () => {
  const router = useRouter();
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkValue, setBulkValue] = useState('');
  const [loading, setLoading] = useState(false);

  // Mock 데이터
  const products: Product[] = [
    {
      id: '1',
      name: '라뮤즈 본딩 하프코트 SET',
      brand: '라뮤즈',
      category: '의류',
      price: 100000,
      stock: 50,
      status: '활성'
    },
    {
      id: '2',
      name: '나이키 에어맥스 270',
      brand: '나이키',
      category: '신발',
      price: 150000,
      stock: 30,
      status: '활성'
    },
    {
      id: '3',
      name: '샤넬 클래식 플랩백',
      brand: '샤넬',
      category: '가방',
      price: 5000000,
      stock: 5,
      status: '활성'
    }
  ];

  const handleSelectProduct = (productId: string) => {
    setSelectedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedProducts.length === 0) return;

    setLoading(true);
    try {
      console.log('일괄 작업:', {
        action: bulkAction,
        value: bulkValue,
        productIds: selectedProducts
      });
      
      alert(`${selectedProducts.length}개 상품에 ${bulkAction} 작업을 적용했습니다.`);
      
      setSelectedProducts([]);
      setBulkAction('');
      setBulkValue('');
    } catch (error) {
      console.error('일괄 작업 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns: TableColumn<Product>[] = [
    {
      key: 'select',
      label: '',
      render: (product) => (
        <input
          type="checkbox"
          checked={selectedProducts.includes(product?.id || '')}
          onChange={() => handleSelectProduct(product?.id || '')}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      )
    },
    {
      key: 'name',
      label: '상품명',
      render: (product) => (
        <div>
          <div className="font-medium text-gray-900">{product?.name || '-'}</div>
          <div className="text-sm text-gray-500">{product?.brand || '-'}</div>
        </div>
      )
    },
    {
      key: 'category',
      label: '카테고리',
      render: (product) => (
        <span className="text-sm text-gray-600">{product?.category || '-'}</span>
      )
    },
    {
      key: 'price',
      label: '가격',
      render: (product) => (
        <span className="text-sm text-gray-900">{product?.price?.toLocaleString() || '0'}원</span>
      )
    },
    {
      key: 'stock',
      label: '재고',
      render: (product) => (
        <span className="text-sm text-gray-600">{product?.stock || 0}개</span>
      )
    },
    {
      key: 'status',
      label: '상태',
      render: (product) => (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          product?.status === '활성' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {product?.status || '-'}
        </span>
      )
    }
  ];

  return (
    <Container>
      <div className="py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            상품 일괄 수정
          </h1>
          <p className="text-gray-600">
            상품 일괄 수정
          </p>
        </div>

        {/* 일괄 작업 패널 */}
        {selectedProducts.length > 0 && (
      <Card padding="lg" className="mb-6">
        <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                {selectedProducts.length}개 상품 선택됨
              </span>
              
                <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">작업을 선택하세요</option>
                <option value="price">가격 변경</option>
                <option value="stock">재고 변경</option>
                <option value="status">상태 변경</option>
                <option value="category">카테고리 변경</option>
                </select>

              {bulkAction && (
                          <input
                  type="text"
                  value={bulkValue}
                  onChange={(e) => setBulkValue(e.target.value)}
                  placeholder="새 값을 입력하세요"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              )}

              <Button
                onClick={handleBulkAction}
                disabled={!bulkAction || !bulkValue || loading}
              >
                {loading ? '처리 중...' : '적용'}
              </Button>
            </div>
          </Card>
        )}

        {/* 상품 목록 */}
          <Card padding="lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-900">
              상품 목록
            </h2>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={handleSelectAll}
                size="small"
              >
                {selectedProducts.length === products.length ? '전체 해제' : '전체 선택'}
              </Button>
            </div>
            </div>

          <Table
            data={products}
            columns={columns}
            loading={false}
          />
          </Card>
      </div>
    </Container>
  );
};

export default BulkEditPage;

