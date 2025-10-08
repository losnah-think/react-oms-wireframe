// src/features/products/components/OptionCard.tsx
import React from 'react';
import { Card, Button, Badge } from '../../../design-system';
import { ProductOption, VariantStatus } from '../types';

interface OptionCardProps {
  option: ProductOption;
  onEdit?: (option: ProductOption) => void;
  onDelete?: (option: ProductOption) => void;
  showActions?: boolean;
}

const OptionCard: React.FC<OptionCardProps> = ({
  option,
  onEdit,
  onDelete,
  showActions = true
}) => {
  const getStatusBadge = (status: VariantStatus) => {
    switch (status) {
      case 'active':
        return <Badge variant="success" size="small">활성</Badge>;
      case 'inactive':
        return <Badge variant="secondary" size="small">비활성</Badge>;
      case 'out_of_stock':
        return <Badge variant="warning" size="small">품절</Badge>;
      default:
        return <Badge variant="secondary" size="small">{status}</Badge>;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <Card padding="md" className="hover:shadow-md transition-shadow">
      <div className="space-y-3">
        {/* 헤더 */}
        <div className="flex items-center justify-between">
          <h4 className="font-semibold text-gray-900">{option.name}</h4>
          {getStatusBadge(option.status)}
        </div>

        {/* 기본 정보 */}
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">SKU:</span>
            <span className="font-mono text-gray-900">{option.sku}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">판매가:</span>
            <span className="font-semibold text-gray-900">{formatPrice(option.price)}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">원가:</span>
            <span className="text-gray-900">{formatPrice(option.cost)}원</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">재고:</span>
            <span className={`font-semibold ${
              option.stock === 0 ? 'text-red-600' : 
              option.stock < 10 ? 'text-orange-600' : 'text-gray-900'
            }`}>
              {option.stock}개
            </span>
          </div>
        </div>

        {/* 추가 정보 */}
        {(option.barcode || option.location) && (
          <div className="pt-2 border-t border-gray-200 space-y-1 text-sm">
            {option.barcode && (
              <div className="flex justify-between">
                <span className="text-gray-600">바코드:</span>
                <span className="font-mono text-gray-900">{option.barcode}</span>
              </div>
            )}
            {option.location && (
              <div className="flex justify-between">
                <span className="text-gray-600">위치:</span>
                <span className="text-gray-900">{option.location}</span>
              </div>
            )}
          </div>
        )}

        {/* 옵션 속성 */}
        {option.attributes.length > 0 && (
          <div className="pt-2 border-t border-gray-200">
            <div className="text-sm text-gray-600 mb-1">속성:</div>
            <div className="flex flex-wrap gap-1">
              {option.attributes.map((attr, index) => (
                <Badge key={index} variant="secondary" size="small">
                  {attr.name}: {attr.value}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* 액션 버튼 */}
        {showActions && (
          <div className="pt-2 border-t border-gray-200 flex gap-2">
            <Button
              variant="ghost"
              size="small"
              onClick={() => onEdit?.(option)}
              className="flex-1"
            >
              수정
            </Button>
            <Button
              variant="ghost"
              size="small"
              onClick={() => onDelete?.(option)}
              className="flex-1"
            >
              삭제
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default OptionCard;
