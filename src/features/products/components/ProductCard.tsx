// src/features/products/components/ProductCard.tsx
import React from 'react';
import { Card, Button, Badge } from '../../../design-system';
import { ProductCardProps, ProductStatus } from '../types';

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  variant = 'default',
  showActions = true,
  onEdit,
  onDelete,
  onView
}) => {
  const getStatusBadge = (status: ProductStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" size="small">판매중</Badge>;
      case 'inactive':
        return <Badge variant="secondary" size="small">판매중단</Badge>;
      case 'out_of_stock':
        return <Badge variant="warning" size="small">품절</Badge>;
      case 'discontinued':
        return <Badge variant="danger" size="small">단종</Badge>;
      default:
        return <Badge variant="secondary" size="small">{status}</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return 'p-4';
      case 'detailed':
        return 'p-6';
      default:
        return 'p-5';
    }
  };

  return (
    <Card 
      padding="none" 
      interactive={!!onView}
      onClick={() => onView?.(product)}
      className="hover:shadow-lg transition-all duration-200"
    >
      <div className={getVariantStyles()}>
        {/* 상품 이미지 */}
        <div className="mb-4">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-48 object-cover rounded-lg"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-400">이미지 없음</span>
            </div>
          )}
        </div>

        {/* 상품 정보 */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h3 className="font-semibold text-gray-900 line-clamp-2">
              {product.name}
            </h3>
            {getStatusBadge(product.status)}
          </div>

          <div className="text-sm text-gray-600">
            <div>상품코드: {product.code}</div>
            <div>브랜드: {product.brand}</div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-lg font-bold text-gray-900">
              {formatPrice(product.price)}원
            </div>
            <div className="text-sm text-gray-500">
              재고: {product.stock}개
            </div>
          </div>

          {/* 카테고리 태그 */}
          {product.category.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {product.category.slice(0, 3).map((cat, index) => (
                <Badge key={index} variant="secondary" size="small">
                  {cat}
                </Badge>
              ))}
              {product.category.length > 3 && (
                <Badge variant="secondary" size="small">
                  +{product.category.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* 상세 정보 (detailed 모드) */}
          {variant === 'detailed' && (
            <div className="pt-2 border-t border-gray-200">
              <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                <div>시즌: {product.metadata.season}</div>
                <div>연도: {product.metadata.year}</div>
                <div>디자이너: {product.metadata.designer}</div>
                <div>공급처: {product.metadata.supplier}</div>
              </div>
              
              {product.variants.length > 0 && (
                <div className="mt-2">
                  <div className="text-sm text-gray-600">
                    옵션: {product.variants.length}개
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 액션 버튼 */}
        {showActions && (
          <div className="mt-4 flex gap-2">
            <Button
              variant="ghost"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(product);
              }}
            >
              수정
            </Button>
            <Button
              variant="ghost"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(product);
              }}
            >
              삭제
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default ProductCard;
