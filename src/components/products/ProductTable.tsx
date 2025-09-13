import React, { useState } from 'react';
import Table, { TableColumn } from '../../design-system/components/Table';
import Button from '../../design-system/components/Button';
import Badge from '../../design-system/components/Badge';
import Stack from '../../design-system/components/Stack';
import { ProductWithVariants } from '../../data/mockProducts';
import { formatDate, formatPrice, getStockStatus } from '../../utils/productUtils';

interface ProductTableProps {
  products: ProductWithVariants[];
  loading?: boolean;
  selectedProducts?: string[];
  onSelectionChange?: (selectedKeys: string[], selectedRows: ProductWithVariants[]) => void;
  onProductClick?: (product: ProductWithVariants) => void;
  onProductEdit?: (productId: string) => void;
  onProductDelete?: (productId: string) => void;
  onProductCopy?: (productId: string) => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange: (page: number, pageSize: number) => void;
  };
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  loading = false,
  selectedProducts = [],
  onSelectionChange,
  onProductClick,
  onProductEdit,
  onProductDelete,
  onProductCopy,
  pagination
}) => {
  const [expandedProductIds, setExpandedProductIds] = useState<string[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const toggleDropdown = (productId: string) => {
    setDropdownOpen(dropdownOpen === productId ? null : productId);
  };

  // 테이블 컬럼 정의
  const columns: TableColumn<ProductWithVariants>[] = [
    {
      key: 'thumbnail',
      title: '',
      width: 80,
      align: 'center',
      render: (_, product) => (
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
          {product.representativeImage ? (
            <img 
              src={product.representativeImage} 
              alt={product.productName}
              className="w-full h-full object-cover"
            />
          ) : (
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )}
        </div>
      )
    },
    {
      key: 'productInfo',
      title: '상품정보',
      width: '30%',
      render: (_, product) => (
        <Stack gap={2}>
          <div 
            className="cursor-pointer hover:text-blue-600"
            onClick={() => onProductClick?.(product)}
          >
            <div className="font-semibold text-gray-900">{product.productName}</div>
            <div className="text-sm text-gray-500">
              {product.productCode} | {product.brandId?.replace('BRAND-', '') || '브랜드 없음'}
            </div>
          </div>
          <Stack direction="row" gap={1}>
            <Badge 
              variant={product.isSelling ? 'success' : 'secondary'} 
              size="small"
            >
              {product.isSelling ? '판매중' : '판매중지'}
            </Badge>
            <Badge variant="neutral" size="small">
              {product.variants?.length || 0}개 옵션
            </Badge>
          </Stack>
        </Stack>
      )
    },
    {
      key: 'category',
      title: '분류',
      width: '15%',
      render: (_, product) => (
        <div className="text-sm text-gray-600">
          {product.productCategory}
        </div>
      )
    },
    {
      key: 'price',
      title: '가격',
      width: '12%',
      align: 'right',
      render: (_, product) => (
        <Stack gap={1} align="end">
          <div className="font-semibold text-gray-900">
            {formatPrice(product.representativeSellingPrice || 0)}
          </div>
          {product.originalCost && (
            <div className="text-xs text-gray-500">
              원가: {formatPrice(product.originalCost)}
            </div>
          )}
        </Stack>
      ),
      sorter: true
    },
    {
      key: 'stock',
      title: '재고',
      width: '10%',
      align: 'center',
      render: (_, product) => {
        const totalStock = product.variants?.reduce((sum, variant) => sum + (variant.stock || 0), 0) || product.stock || 0;
        const stockStatus = getStockStatus(totalStock);
        
        return (
          <Stack gap={1} align="center">
            <Badge 
              variant={stockStatus.color}
              size="small"
            >
              {stockStatus.label}
            </Badge>
            <div className="text-xs text-gray-500">
              {totalStock}개
            </div>
          </Stack>
        );
      }
    },
    {
      key: 'registDate',
      title: '등록일',
      width: '10%',
      render: (_, product) => (
        <div className="text-sm text-gray-600">
          {formatDate(product.createdAt)}
        </div>
      ),
      sorter: true
    },
    {
      key: 'actions',
      title: '작업',
      width: '8%',
      align: 'center',
      render: (_, product) => (
        <div className="relative">
          <Button
            variant="ghost"
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              toggleDropdown(product.id);
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v.01M12 12v.01M12 18v.01" />
            </svg>
          </Button>

          {dropdownOpen === product.id && (
            <div className="absolute right-0 top-8 z-50 min-w-32 bg-white border border-gray-200 rounded-lg shadow-lg py-1">
              <button
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  onProductClick?.(product);
                  setDropdownOpen(null);
                }}
              >
                상세보기
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  onProductEdit?.(product.id);
                  setDropdownOpen(null);
                }}
              >
                수정
              </button>
              <button
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => {
                  onProductCopy?.(product.id);
                  setDropdownOpen(null);
                }}
              >
                복사
              </button>
              <hr className="my-1 border-gray-200" />
              <button
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                onClick={() => {
                  onProductDelete?.(product.id);
                  setDropdownOpen(null);
                }}
              >
                삭제
              </button>
            </div>
          )}
        </div>
      )
    }
  ];

  // 확장된 행 렌더링 (옵션 정보)
  const expandedRowRender = (product: ProductWithVariants) => {
    if (!product.variants || product.variants.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500">
          등록된 옵션이 없습니다.
        </div>
      );
    }

    return (
      <div className="p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">
          상품 옵션 ({product.variants.length}개)
        </h4>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700">옵션명</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">옵션코드</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">원가</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">판매가</th>
                <th className="px-4 py-2 text-right font-medium text-gray-700">공급가</th>
                <th className="px-4 py-2 text-center font-medium text-gray-700">재고</th>
                <th className="px-4 py-2 text-center font-medium text-gray-700">상태</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {product.variants.map((variant) => (
                <tr key={variant.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{variant.variantName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-600 font-mono text-xs">{variant.optionCode}</div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-medium text-gray-900">
                      {formatPrice(variant.costPrice || 0)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-medium text-gray-900">
                      {formatPrice(variant.sellingPrice || 0)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="font-medium text-gray-900">
                      {formatPrice(variant.supplyPrice || 0)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="font-medium text-gray-900">{variant.stock || 0}</span>
                      <Badge 
                        variant={
                          (variant.stock || 0) === 0 ? 'danger' :
                          (variant.stock || 0) < (variant.safeStock || 5) ? 'warning' : 'success'
                        }
                        size="small"
                      >
                        {(variant.stock || 0) === 0 ? '품절' :
                         (variant.stock || 0) < (variant.safeStock || 5) ? '부족' : '충분'}
                      </Badge>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Stack gap={1} align="center">
                      <Badge 
                        variant={variant.active ? 'success' : 'secondary'}
                        size="small"
                      >
                        {variant.active ? '활성' : '비활성'}
                      </Badge>
                      {variant.isSoldout && (
                        <Badge variant="danger" size="small">품절</Badge>
                      )}
                      {!variant.isSelling && (
                        <Badge variant="warning" size="small">판매중지</Badge>
                      )}
                    </Stack>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // 외부 클릭 시 드롭다운 닫기
  React.useEffect(() => {
    const handleClickOutside = () => {
      setDropdownOpen(null);
    };
    
    if (dropdownOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [dropdownOpen]);

  return (
    <Table
      columns={columns}
      data={products}
      loading={loading}
      pagination={pagination}
      rowSelection={onSelectionChange ? {
        selectedRowKeys: selectedProducts,
        onChange: onSelectionChange
      } : undefined}
      expandable={{
        expandedRowKeys: expandedProductIds,
        onExpand: (expanded, record) => {
          if (expanded) {
            setExpandedProductIds([...expandedProductIds, record.id]);
          } else {
            setExpandedProductIds(expandedProductIds.filter(id => id !== record.id));
          }
        },
        expandedRowRender,
        rowExpandable: (record) => Boolean(record.variants && record.variants.length > 0)
      }}
      onRow={(record) => ({
        className: 'cursor-pointer'
      })}
    />
  );
};

export default ProductTable;
