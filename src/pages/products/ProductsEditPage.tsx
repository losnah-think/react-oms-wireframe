import React, { useState, useEffect } from 'react';
import { mockBrands } from '../../data/mockBrands';
import { mockCategories } from '../../data/mockCategories';
import Container from '../../design-system/components/Container';
import Card from '../../design-system/components/Card';
import Button from '../../design-system/components/Button';
import Stack from '../../design-system/components/Stack';
import { GridRow, GridCol } from '../../design-system/components';

interface ProductsEditPageProps {
  onNavigate?: (page: string) => void;
  productId?: string;
}

interface Product {
  id: string;
  optionName: string;
  optionCode: string;
  barcodeNumber: string;
  sellingPrice: number;
  color: string;
  size: string;
  isForSale: boolean;
  isOutOfStock: boolean;
  inventorySync: boolean;
}

// 모달 컴포넌트들
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
}

const ProductsEditPage: React.FC<ProductsEditPageProps> = ({ onNavigate, productId }) => {
  // State for form data and collapsed sections
  const [formData, setFormData] = useState<any>({ basicInfo: {}, additionalInfo: {} });
  const [collapsedSections, setCollapsedSections] = useState<{ [k: string]: boolean }>({ additionalInfo: true, logistics: true, policies: true });
  const [saving, setSaving] = useState(false);

  // Field update function

  // Load product data (mock for now)
  useEffect(() => {
    if (productId) {
      // TODO: Replace with real API call
      setFormData({
        basicInfo: {
          productName: '기존 상품명',
          englishProductName: 'Existing Product',
          productCode: 'PRD000001',
          categoryId: 'cat-1',
          brandId: 'brand-1',
          supplierId: 'supplier-1',
          active: true,
          isSelling: true,
          isOutOfStock: false,
          logistics: { width: 20, height: 15, depth: 5, weight: 300, packagingUnit: 'ea', packagingQuantity: 1, isFragile: false, isLiquid: false },
          policies: { showProductNameOnInvoice: true, preventConsolidation: false, shippingPolicyId: undefined, giftPolicyId: undefined, isSampleIncluded: false, isReturnable: true, isExchangeable: true, returnPeriodDays: 14 }
        },
        additionalInfo: {
          productDesigner: '홍길동',
          publishDate: new Date('2025-09-01'),
          productSeason: 'FW',
          detailedLogistics: { packageWidth: 20, packageHeight: 15, packageDepth: 5, packageWeight: 300, countryOfOrigin: 'KR', hsCode: '123456', storageConditions: '', shelfLife: 365 }
        },
        validation: { errors: {}, warnings: {}, isValid: true, touchedFields: new Set() }
      });
    }
  }, [productId]);

  const updateField = (path: string, value: any) => {
    const keys = path.split('.');
    setFormData((prev: any) => {
      const copy = JSON.parse(JSON.stringify(prev));
      let cur: any = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        cur = cur[keys[i]] = cur[keys[i]] ?? {};
      }
      cur[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  return (
    <Container>
      <div className="flex gap-8">
        <div className="flex-1">
          {/* 기본 정보 Card */}
          <Card className="mb-6">
            <div className="p-6">
              <GridRow gutter={16}>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상품명</label>
                  <input type="text" value={formData.basicInfo?.productName || ''} onChange={e => updateField('basicInfo.productName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">영문 상품명</label>
                  <input type="text" value={formData.basicInfo?.englishProductName || ''} onChange={e => updateField('basicInfo.englishProductName', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상품 코드</label>
                  <input type="text" value={formData.basicInfo?.productCode || ''} onChange={e => updateField('basicInfo.productCode', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                  <select value={formData.basicInfo?.categoryId || ''} onChange={e => updateField('basicInfo.categoryId', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">카테고리 선택</option>
                    {mockCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">브랜드</label>
                  <select value={formData.basicInfo?.brandId || ''} onChange={e => updateField('basicInfo.brandId', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="">브랜드 선택</option>
                    {mockBrands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">공급처</label>
                  <input type="text" value={formData.basicInfo?.supplierId || ''} onChange={e => updateField('basicInfo.supplierId', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">판매가</label>
                  <input type="number" value={formData.basicInfo?.pricing?.sellingPrice || 0} onChange={e => updateField('basicInfo.pricing.sellingPrice', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">소비자가</label>
                  <input type="number" value={formData.basicInfo?.pricing?.consumerPrice || 0} onChange={e => updateField('basicInfo.pricing.consumerPrice', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">공급가</label>
                  <input type="number" value={formData.basicInfo?.pricing?.supplyPrice || 0} onChange={e => updateField('basicInfo.pricing.supplyPrice', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">수수료율(%)</label>
                  <input type="number" value={formData.basicInfo?.pricing?.commissionRate || 0} onChange={e => updateField('basicInfo.pricing.commissionRate', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상품 설명</label>
                  <input type="text" value={formData.basicInfo?.description || ''} onChange={e => updateField('basicInfo.description', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">대표 이미지 URL</label>
                  <input type="text" value={formData.basicInfo?.thumbnailUrl || ''} onChange={e => updateField('basicInfo.thumbnailUrl', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">재고</label>
                  <input type="number" value={formData.basicInfo?.stock || 0} onChange={e => updateField('basicInfo.stock', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">활성화</label>
                  <input type="checkbox" checked={formData.basicInfo?.active || false} onChange={e => updateField('basicInfo.active', e.target.checked)} className="h-4 w-4 text-blue-600 border-gray-300 rounded" />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">판매중</label>
                  <input type="checkbox" checked={formData.basicInfo?.isSelling || false} onChange={e => updateField('basicInfo.isSelling', e.target.checked)} className="h-4 w-4 text-green-600 border-gray-300 rounded" />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">품절</label>
                  <input type="checkbox" checked={formData.basicInfo?.isOutOfStock || false} onChange={e => updateField('basicInfo.isOutOfStock', e.target.checked)} className="h-4 w-4 text-red-600 border-gray-300 rounded" />
                </GridCol>
              </GridRow>
            </div>
          </Card>
          {/* 추가 정보 Card */}
          <Card id="step2" className="mb-6 border-t-4 border-green-500">
            <div className="px-6 py-4 bg-green-50 border-b border-gray-200 rounded-t-lg">
              <Stack direction="row" gap={3} align="center">
                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">2</div>
                <div className="flex-1" />
              </Stack>
              <GridRow gutter={16}>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상세 물류 정보(높이)</label>
                  <input type="number" value={formData.additionalInfo?.detailedLogistics?.packageDepth || 0} onChange={e => updateField('additionalInfo.detailedLogistics.packageDepth', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상세 물류 정보(무게)</label>
                  <input type="number" value={formData.additionalInfo?.detailedLogistics?.packageWeight || 0} onChange={e => updateField('additionalInfo.detailedLogistics.packageWeight', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">원산지</label>
                  <input type="text" value={formData.additionalInfo?.detailedLogistics?.countryOfOrigin || ''} onChange={e => updateField('additionalInfo.detailedLogistics.countryOfOrigin', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">HS코드</label>
                  <input type="text" value={formData.additionalInfo?.detailedLogistics?.hsCode || ''} onChange={e => updateField('additionalInfo.detailedLogistics.hsCode', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">보관 조건</label>
                  <input type="text" value={formData.additionalInfo?.detailedLogistics?.storageConditions || ''} onChange={e => updateField('additionalInfo.detailedLogistics.storageConditions', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </GridCol>
                <GridCol span={6}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">유통기한(일)</label>
                  <input type="number" value={formData.additionalInfo?.detailedLogistics?.shelfLife || 0} onChange={e => updateField('additionalInfo.detailedLogistics.shelfLife', Number(e.target.value))} className="w-full px-3 py-2 border border-gray-300 rounded-md" />
                </GridCol>
              </GridRow>
            </div>
          </Card>
          <Stack direction="row" gap={4} justify="end" className="pt-6">
            <Button variant="secondary" onClick={() => onNavigate && onNavigate('products-list')}>취소</Button>
            <Button variant="primary" onClick={() => setSaving(true)}>수정 완료</Button>
          </Stack>
        </div>
        <div className="w-96 shrink-0">
          <Card className="mb-6">
            <h2 className="text-lg font-bold mb-2">상품 미리보기</h2>
            <div className="flex flex-col items-center gap-2">
              <img
                src={formData.basicInfo?.thumbnailUrl || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=128&h=128&fit=crop"}
                alt="상품 이미지"
                className="w-32 h-32 object-cover rounded"
                onError={e => {
                  (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=128&h=128&fit=crop";
                }}
              />
              <div className="text-base font-semibold mt-2">{formData.basicInfo?.productName || '상품명 미입력'}</div>
              <div className="text-sm text-gray-500">{formData.basicInfo?.productCode || '상품코드 미입력'}</div>
              <div className="text-sm text-gray-500">{formData.basicInfo?.categoryId || '카테고리 미입력'}</div>
              <div className="text-sm text-gray-500">{formData.basicInfo?.brandId || '브랜드 미입력'}</div>
            </div>
          </Card>
          <Card>
            <h2 className="text-lg font-bold mb-2">상품 요약</h2>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>판매가: <span className="font-semibold">{formData.basicInfo?.pricing?.sellingPrice ? `${formData.basicInfo.pricing.sellingPrice.toLocaleString()}원` : '-'}</span></li>
              <li>재고: <span className="font-semibold">{formData.basicInfo?.stock ?? '-'}</span></li>
              <li>상태: <span className="font-semibold">{formData.basicInfo?.isSelling ? '판매중' : '판매중지'}</span></li>
              <li>활성화: <span className="font-semibold">{formData.basicInfo?.active ? '활성' : '비활성'}</span></li>
            </ul>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default ProductsEditPage;
