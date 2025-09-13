import React, { useState, useEffect } from 'react';
import { Button, Input, Card, Badge, Container, Stack } from '../../design-system';
import type { 
  MultiTenantProduct, 
  ProductFormData, 
  ProductBasicInfo, 
  ProductAdditionalInfo,
  FormValidation,
  ProductTag,
  Tenant
} from '../../types/multitenant';

interface ProductsAddPageProps {
  onNavigate?: (page: string) => void;
  onSave?: (product: MultiTenantProduct) => void;
}

const ProductsAddPage: React.FC<ProductsAddPageProps> = ({
  onNavigate,
  onSave
}) => {
  // 현재 테넌트 (임시 데이터)
  const [currentTenant] = useState<Tenant>({
    id: 'tenant-1',
    code: 'T001',
    name: '화주사 A',
    type: 'external',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  // 수정 모드인지 확인 (URL 파라미터에서)
  const [productId] = useState<string | undefined>(undefined);
  
  // 취소 핸들러
  const onCancel = () => {
    if (onNavigate) {
      onNavigate('products-list');
    }
  };
  
  // 태그 카테고리별 색상 맵핑
  const getTagColor = (category: string) => {
    const colorMap: Record<string, string> = {
      general: '#6B7280',
      material: '#3B82F6',
      feature: '#10B981',
      quality: '#F59E0B',
      environmental: '#059669',
      usage: '#8B5CF6',
      season: '#EC4899'
    };
    return colorMap[category] || '#6B7280';
  };
  
  // 폼 데이터 상태
  const [formData, setFormData] = useState<ProductFormData>({
    basicInfo: {
      productName: '',
      englishProductName: '',
      codes: {
        internal: '',
        cafe24: '',
        channels: []
      },
      categoryId: '',
      brandId: '',
      pricing: {
        sellingPrice: 0,
        consumerPrice: 0,
        supplyPrice: 0,
        commissionRate: 15, // 기본 수수료율 15%
        isSupplyPriceCalculated: true,
        calculationMethod: 'commission'
      },
      tags: [],
      description: '',
      thumbnailUrl: '',
      images: [],
      logistics: {
        width: undefined,
        height: undefined,
        depth: undefined,
        weight: undefined,
        packagingUnit: 'ea',
        packagingQuantity: 1,
        isFragile: false,
        isLiquid: false
      },
      policies: {
        showProductNameOnInvoice: true,
        preventConsolidation: false,
        shippingPolicyId: undefined,
        giftPolicyId: undefined,
        isSampleIncluded: false,
        isReturnable: true,
        isExchangeable: true,
        returnPeriodDays: 14
      }
    },
    additionalInfo: {
      productDesigner: '',
      publishDate: undefined,
      detailedLogistics: {
        width: undefined,
        height: undefined,
        depth: undefined,
        weight: undefined,
        packagingUnit: 'ea',
        packagingQuantity: 1,
        isFragile: false,
        isLiquid: false,
        packageWidth: undefined,
        packageHeight: undefined,
        packageDepth: undefined,
        packageWeight: undefined,
        countryOfOrigin: 'KR',
        hsCode: '',
        storageConditions: '',
        shelfLife: undefined
      },
      options: [] // 백로그
    },
    validation: {
      errors: {},
      warnings: {},
      isValid: true,
      touchedFields: new Set()
    }
  });
  
  // 아코디언 상태
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    basicInfo: true,
    additionalInfo: true,
    pricing: true,
    logistics: true,
    policies: true
  });
  
  // 로딩 상태
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  // 외부 화주사 여부
  const isExternalTenant = currentTenant?.type === 'external';
  
  // 기존 상품 로딩 (수정 모드)
  useEffect(() => {
    if (productId) {
      loadProduct(productId);
    }
  }, [productId]);
  
  // 상품 로딩
  const loadProduct = async (id: string) => {
    setLoading(true);
    try {
      // API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 임시 데이터 로딩
      const mockProduct: Partial<MultiTenantProduct> = {
        id,
        productName: '기존 상품',
        englishProductName: 'Existing Product',
        codes: {
          internal: 'PRD000001',
          cafe24: 'C24000001',
          channels: []
        },
        categoryId: 'cat-1',
        brandId: 'brand-1',
        pricing: {
          sellingPrice: 29900,
          consumerPrice: 39900,
          supplyPrice: 25410,
          commissionRate: 15,
          isSupplyPriceCalculated: true,
          calculationMethod: 'commission'
        },
        tags: [
          { id: 'tag-1', name: '신상품', category: 'general' }
        ],
        description: '기존 상품 설명',
        logistics: {
          width: 20,
          height: 15,
          depth: 5,
          weight: 300,
          packagingUnit: 'ea',
          packagingQuantity: 1,
          isFragile: false,
          isLiquid: false
        },
        policies: {
          showProductNameOnInvoice: true,
          preventConsolidation: false,
          isReturnable: true,
          isExchangeable: true,
          returnPeriodDays: 14
        }
      };
      
      // 폼 데이터에 반영
      setFormData(prev => ({
        ...prev,
        basicInfo: {
          ...prev.basicInfo,
          productName: mockProduct.productName || '',
          englishProductName: mockProduct.englishProductName || '',
          codes: mockProduct.codes || prev.basicInfo.codes,
          categoryId: mockProduct.categoryId || '',
          brandId: mockProduct.brandId || '',
          pricing: mockProduct.pricing || prev.basicInfo.pricing,
          tags: mockProduct.tags || [],
          description: mockProduct.description || '',
          logistics: mockProduct.logistics || prev.basicInfo.logistics,
          policies: mockProduct.policies || prev.basicInfo.policies
        }
      }));
    } catch (error) {
      console.error('상품 로딩 실패:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // 아코디언 토글
  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };
  
  // 폼 필드 업데이트
  const updateFormField = (path: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev };
      const pathParts = path.split('.');
      let current: any = newData;
      
      for (let i = 0; i < pathParts.length - 1; i++) {
        current = current[pathParts[i]];
      }
      
      current[pathParts[pathParts.length - 1]] = value;
      
      // 터치된 필드 추가
      newData.validation.touchedFields.add(path);
      
      return newData;
    });
    
    // 실시간 검증
    validateField(path, value);
  };
  
  // 필드 검증
  const validateField = (path: string, value: any) => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    switch (path) {
      case 'basicInfo.productName':
        if (!value || value.trim() === '') {
          errors.push('상품명은 필수 입력 항목입니다.');
        } else if (value.length < 2) {
          errors.push('상품명은 2자 이상 입력해주세요.');
        } else if (value.length > 100) {
          errors.push('상품명은 100자 이하로 입력해주세요.');
        }
        break;
        
      case 'basicInfo.codes.internal':
        if (!value || value.trim() === '') {
          errors.push('자체상품코드는 필수 입력 항목입니다.');
        } else if (!/^[A-Z0-9]{6,20}$/.test(value)) {
          errors.push('자체상품코드는 영문 대문자와 숫자 6-20자로 입력해주세요.');
        }
        break;
        
      case 'basicInfo.pricing.sellingPrice':
        if (!value || value <= 0) {
          errors.push('판매가는 필수 입력 항목입니다.');
        } else if (value < 100) {
          warnings.push('판매가가 100원 미만입니다. 확인해주세요.');
        }
        break;
        
      case 'basicInfo.categoryId':
        if (!value) {
          errors.push('카테고리는 필수 선택 항목입니다.');
        }
        break;
    }
    
    setFormData(prev => ({
      ...prev,
      validation: {
        ...prev.validation,
        errors: {
          ...prev.validation.errors,
          [path]: errors
        },
        warnings: {
          ...prev.validation.warnings,
          [path]: warnings
        }
      }
    }));
  };
  
  // 공급가 자동 계산
  useEffect(() => {
    const { sellingPrice, commissionRate } = formData.basicInfo.pricing;
    if (sellingPrice > 0 && commissionRate > 0) {
      const calculatedSupplyPrice = Math.round(sellingPrice * (100 - commissionRate) / 100);
      updateFormField('basicInfo.pricing.supplyPrice', calculatedSupplyPrice);
    }
  }, [formData.basicInfo.pricing.sellingPrice, formData.basicInfo.pricing.commissionRate]);
  
  // 태그 추가
  const addTag = (tagName: string) => {
    if (!tagName.trim()) return;
    
    const newTag: ProductTag = {
      id: `tag-${Date.now()}`,
      name: tagName.trim(),
      category: 'general'
    };
    
    const currentTags = formData.basicInfo.tags;
    if (!currentTags.some(tag => tag.name === newTag.name)) {
      updateFormField('basicInfo.tags', [...currentTags, newTag]);
    }
  };
  
  // 태그 제거
  const removeTag = (tagId: string) => {
    const currentTags = formData.basicInfo.tags;
    updateFormField('basicInfo.tags', currentTags.filter(tag => tag.id !== tagId));
  };
  
  // 폼 저장
  const handleSave = async () => {
    setSaving(true);
    try {
      // 전체 검증
      const isValid = await validateForm();
      if (!isValid) {
        alert('입력 오류가 있습니다. 확인해주세요.');
        return;
      }
      
      // API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('저장 데이터:', formData);
      alert('상품이 성공적으로 저장되었습니다.');
      
      onSave?.(formData as any);
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };
  
  // 전체 폼 검증
  const validateForm = async (): Promise<boolean> => {
    const requiredFields = [
      'basicInfo.productName',
      'basicInfo.codes.internal', 
      'basicInfo.categoryId',
      'basicInfo.pricing.sellingPrice'
    ];
    
    let isValid = true;
    
    for (const field of requiredFields) {
      const value = getFieldValue(field);
      validateField(field, value);
      
      if (formData.validation.errors[field]?.length > 0) {
        isValid = false;
      }
    }
    
    return isValid;
  };
  
  // 필드 값 가져오기
  const getFieldValue = (path: string): any => {
    const pathParts = path.split('.');
    let current: any = formData;
    
    for (const part of pathParts) {
      current = current[part];
      if (current === undefined) return '';
    }
    
    return current;
  };
  
  // 에러 메시지 표시 컴포넌트
  const ErrorMessage: React.FC<{ field: string }> = ({ field }) => {
    const errors = formData.validation.errors[field] || [];
    const warnings = formData.validation.warnings[field] || [];
    
    if (errors.length === 0 && warnings.length === 0) return null;
    
    return (
      <div className="mt-1">
        {errors.map((error, index) => (
          <p key={index} className="text-sm text-red-600">{error}</p>
        ))}
        {warnings.map((warning, index) => (
          <p key={index} className="text-sm text-yellow-600">{warning}</p>
        ))}
      </div>
    );
  };
  
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin text-4xl mb-4">⏳</div>
          <p>상품 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }
  
  return (
    <Container maxWidth="4xl" padding="md" className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {productId ? '상품 수정' : '상품 등록'}
            </h1>
            {currentTenant && (
              <p className="text-sm text-gray-500 mt-1">
                {currentTenant.name} ({currentTenant.type === 'external' ? '외부 공급처' : '자체 화주사'})
              </p>
            )}
          </div>
              
              <Stack direction="row" gap={3}>
                <Button
                  variant="outline"
                  size="default"
                  onClick={onCancel}
                >
                  취소
                </Button>
                <Button
                  variant="primary"
                  size="default"
                  loading={saving}
                  disabled={saving}
                  onClick={handleSave}
                >
                  {saving ? '저장 중...' : '저장'}
                </Button>
              </Stack>
            </div>
          </div>
          
          {/* 기본 정보 섹션 */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div 
              className="px-6 py-4 border-b border-gray-200 cursor-pointer"
              onClick={() => toggleSection('basicInfo')}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">기본 정보</h2>
                <span className="text-gray-500">
                  {expandedSections.basicInfo ? '▲' : '▼'}
                </span>
              </div>
            </div>
            
            {expandedSections.basicInfo && (
              <div className="px-6 py-6 space-y-6">
                {/* 상품명 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Input
                      label="상품명"
                      required
                      type="text"
                      value={formData.basicInfo.productName}
                      onChange={(e) => updateFormField('basicInfo.productName', e.target.value)}
                      placeholder="상품명을 입력하세요"
                      fullWidth
                      maxLength={100}
                    />
                    <ErrorMessage field="basicInfo.productName" />
                  </div>
                  
                  <div>
                    <Input
                      label="영문 상품명"
                      type="text"
                      value={formData.basicInfo.englishProductName || ''}
                      onChange={(e) => updateFormField('basicInfo.englishProductName', e.target.value)}
                      placeholder="English Product Name"
                      fullWidth
                      maxLength={100}
                    />
                  </div>
                </div>
                
                {/* 상품 코드 */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">상품 코드</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <Input
                        label="자체상품코드"
                        required
                        type="text"
                        value={formData.basicInfo.codes.internal}
                        onChange={(e) => updateFormField('basicInfo.codes.internal', e.target.value.toUpperCase())}
                        placeholder="PRD000001"
                        fullWidth
                        maxLength={20}
                        helperText="영문 대문자, 숫자 6-20자"
                      />
                      <ErrorMessage field="basicInfo.codes.internal" />
                    </div>
                    
                    <div>
                      <Input
                        label="카페24 상품코드"
                        type="text"
                        value={formData.basicInfo.codes.cafe24 || ''}
                        onChange={(e) => updateFormField('basicInfo.codes.cafe24', e.target.value)}
                        placeholder="C24000001"
                        fullWidth
                        maxLength={20}
                      />
                    </div>
                    
                    <div>
                      <Stack gap={1}>
                        <label className="block text-sm font-medium text-gray-700">
                          판매처별 코드
                        </label>
                        <Button 
                          variant="outline" 
                          size="default"
                          fullWidth
                        >
                          판매처 코드 관리
                        </Button>
                        <p className="text-xs text-gray-500">네이버, 쿠팡 등 채널별 코드</p>
                      </Stack>
                    </div>
                  </div>
                </div>
                
                {/* 카테고리 및 브랜드 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      카테고리 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.basicInfo.categoryId}
                      onChange={(e) => updateFormField('basicInfo.categoryId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">카테고리를 선택하세요</option>
                      <option value="cat-1">카테고리 A</option>
                      <option value="cat-2">카테고리 B</option>
                      <option value="cat-3">카테고리 C</option>
                    </select>
                    <ErrorMessage field="basicInfo.categoryId" />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      브랜드
                    </label>
                    <select
                      value={formData.basicInfo.brandId || ''}
                      onChange={(e) => updateFormField('basicInfo.brandId', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">브랜드를 선택하세요</option>
                      <option value="brand-1">브랜드 A</option>
                      <option value="brand-2">브랜드 B</option>
                      <option value="brand-3">브랜드 C</option>
                    </select>
                  </div>
                </div>
                
                {/* 가격 정보 */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">가격 정보</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                      <Input
                        label="판매가"
                        required
                        type="number"
                        value={formData.basicInfo.pricing.sellingPrice || ''}
                        onChange={(e) => updateFormField('basicInfo.pricing.sellingPrice', Number(e.target.value))}
                        placeholder="0"
                        fullWidth
                        min="0"
                        rightIcon={<span className="text-gray-500 text-sm">원</span>}
                      />
                      <ErrorMessage field="basicInfo.pricing.sellingPrice" />
                    </div>
                    
                    <div>
                      <Input
                        label="소비자가"
                        helperText="마케팅용"
                        type="number"
                        value={formData.basicInfo.pricing.consumerPrice || ''}
                        onChange={(e) => updateFormField('basicInfo.pricing.consumerPrice', Number(e.target.value))}
                        placeholder="0"
                        fullWidth
                        min="0"
                        rightIcon={<span className="text-gray-500 text-sm">원</span>}
                      />
                    </div>
                    
                    <div>
                      <Input
                        label="수수료율"
                        type="number"
                        value={formData.basicInfo.pricing.commissionRate}
                        onChange={(e) => updateFormField('basicInfo.pricing.commissionRate', Number(e.target.value))}
                        fullWidth
                        min="0"
                        max="100"
                        step="0.1"
                        rightIcon={<span className="text-gray-500 text-sm">%</span>}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        공급가 <span className="text-gray-500 text-xs">(자동계산)</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={formData.basicInfo.pricing.supplyPrice}
                          readOnly
                          className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md bg-gray-50 text-gray-600"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">원</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">판매가 × (100 - 수수료율) / 100</p>
                    </div>
                  </div>
                </div>
                
                {/* 태그 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상품 태그
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.basicInfo.tags.map((tag) => {
                      const tagColor = getTagColor(tag.category);
                      return (
                        <span
                          key={tag.id}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                          style={{ backgroundColor: `${tagColor}20`, color: tagColor }}
                        >
                          {tag.name}
                          <button
                            onClick={() => removeTag(tag.id)}
                            className="ml-2 text-gray-400 hover:text-gray-600"
                          >
                            ×
                          </button>
                        </span>
                      );
                    })}
                  </div>
                  <Stack direction="row" gap={2}>
                    <Input
                      placeholder="태그 입력 후 Enter"
                      className="flex-1"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addTag((e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="default"
                    >
                      태그 추가
                    </Button>
                  </Stack>
                </div>
                
                {/* 상품 설명 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상품 설명
                  </label>
                  <textarea
                    value={formData.basicInfo.description || ''}
                    onChange={(e) => updateFormField('basicInfo.description', e.target.value)}
                    rows={6}
                    placeholder="상품에 대한 자세한 설명을 입력하세요"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                {/* 물류 간편 정보 (기본정보에 포함) */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">물류 정보</h3>
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">가로(cm)</label>
                      <input
                        type="number"
                        value={formData.basicInfo.logistics.width || ''}
                        onChange={(e) => updateFormField('basicInfo.logistics.width', Number(e.target.value))}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">세로(cm)</label>
                      <input
                        type="number"
                        value={formData.basicInfo.logistics.height || ''}
                        onChange={(e) => updateFormField('basicInfo.logistics.height', Number(e.target.value))}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">높이(cm)</label>
                      <input
                        type="number"
                        value={formData.basicInfo.logistics.depth || ''}
                        onChange={(e) => updateFormField('basicInfo.logistics.depth', Number(e.target.value))}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                        step="0.1"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">무게(g)</label>
                      <input
                        type="number"
                        value={formData.basicInfo.logistics.weight || ''}
                        onChange={(e) => updateFormField('basicInfo.logistics.weight', Number(e.target.value))}
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">포장단위</label>
                      <select
                        value={formData.basicInfo.logistics.packagingUnit}
                        onChange={(e) => updateFormField('basicInfo.logistics.packagingUnit', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="ea">EA</option>
                        <option value="box">박스</option>
                        <option value="set">세트</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">포장수량</label>
                      <input
                        type="number"
                        value={formData.basicInfo.logistics.packagingQuantity}
                        onChange={(e) => updateFormField('basicInfo.logistics.packagingQuantity', Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                      />
                    </div>
                  </div>
                </div>
                
                {/* 정책 설정 */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">정책 설정</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.basicInfo.policies.showProductNameOnInvoice}
                          onChange={(e) => updateFormField('basicInfo.policies.showProductNameOnInvoice', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">상품명 송장표시</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.basicInfo.policies.preventConsolidation}
                          onChange={(e) => updateFormField('basicInfo.policies.preventConsolidation', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">합포 방지</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.basicInfo.policies.isSampleIncluded}
                          onChange={(e) => updateFormField('basicInfo.policies.isSampleIncluded', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">샘플 정책 포함</span>
                      </label>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">배송비 정책</label>
                        <select
                          value={formData.basicInfo.policies.shippingPolicyId || ''}
                          onChange={(e) => updateFormField('basicInfo.policies.shippingPolicyId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">기본 정책</option>
                          <option value="policy-1">무료배송</option>
                          <option value="policy-2">유료배송</option>
                          <option value="policy-3">조건부 무료배송</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">사은품 정책</label>
                        <select
                          value={formData.basicInfo.policies.giftPolicyId || ''}
                          onChange={(e) => updateFormField('basicInfo.policies.giftPolicyId', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="">사은품 없음</option>
                          <option value="gift-1">신규 고객 사은품</option>
                          <option value="gift-2">리뷰 작성 사은품</option>
                          <option value="gift-3">재구매 사은품</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">반품 기간 (일)</label>
                        <input
                          type="number"
                          value={formData.basicInfo.policies.returnPeriodDays}
                          onChange={(e) => updateFormField('basicInfo.policies.returnPeriodDays', Number(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          min="0"
                          max="90"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* 추가 정보 섹션 */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div 
              className="px-6 py-4 border-b border-gray-200 cursor-pointer"
              onClick={() => toggleSection('additionalInfo')}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">추가 정보</h2>
                <span className="text-gray-500">
                  {expandedSections.additionalInfo ? '▲' : '▼'}
                </span>
              </div>
            </div>
            
            {expandedSections.additionalInfo && (
              <div className="px-6 py-6 space-y-6">
                {/* 상품 관리 정보 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      상품 디자이너
                    </label>
                    <input
                      type="text"
                      value={formData.additionalInfo.productDesigner || ''}
                      onChange={(e) => updateFormField('additionalInfo.productDesigner', e.target.value)}
                      placeholder="디자이너 이름"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      상품 게시일
                    </label>
                    <input
                      type="date"
                      value={formData.additionalInfo.publishDate ? formData.additionalInfo.publishDate.toISOString().split('T')[0] : ''}
                      onChange={(e) => updateFormField('additionalInfo.publishDate', e.target.value ? new Date(e.target.value) : undefined)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                {/* 상세 물류 정보 */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">상세 물류 정보</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">원산지</label>
                      <select
                        value={formData.additionalInfo.detailedLogistics.countryOfOrigin || 'KR'}
                        onChange={(e) => updateFormField('additionalInfo.detailedLogistics.countryOfOrigin', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="KR">대한민국</option>
                        <option value="CN">중국</option>
                        <option value="US">미국</option>
                        <option value="JP">일본</option>
                        <option value="DE">독일</option>
                        <option value="OTHER">기타</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">세번(HS) 코드</label>
                      <input
                        type="text"
                        value={formData.additionalInfo.detailedLogistics.hsCode || ''}
                        onChange={(e) => updateFormField('additionalInfo.detailedLogistics.hsCode', e.target.value)}
                        placeholder="0000.00.00"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">보관 조건</label>
                      <textarea
                        value={formData.additionalInfo.detailedLogistics.storageConditions || ''}
                        onChange={(e) => updateFormField('additionalInfo.detailedLogistics.storageConditions', e.target.value)}
                        rows={3}
                        placeholder="보관 온도, 습도 등 조건을 입력하세요"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">유통기한 (일)</label>
                      <input
                        type="number"
                        value={formData.additionalInfo.detailedLogistics.shelfLife || ''}
                        onChange={(e) => updateFormField('additionalInfo.detailedLogistics.shelfLife', Number(e.target.value))}
                        placeholder="365"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        min="1"
                      />
                    </div>
                  </div>
                </div>
                
                {/* 옵션 관리 (백로그) */}
                <div>
                  <h3 className="text-md font-medium text-gray-900 mb-4">
                    옵션 관리 
                    <span className="ml-2 text-xs text-gray-500 bg-yellow-100 px-2 py-1 rounded">백로그</span>
                  </h3>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center text-gray-500">
                    <p>상품 옵션 자동 생성 기능은 향후 개발 예정입니다.</p>
                    <p className="text-sm mt-1">현재는 기본 상품만 등록 가능합니다.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* 재고 정보 (읽기 전용) */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">재고 정보 (읽기 전용)</h2>
            </div>
            
            <div className="px-6 py-6">
              <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
                <p>재고 정보는 등록 완료 후 재고 관리 메뉴에서 설정할 수 있습니다.</p>
                <p className="text-sm mt-1">상품 등록 시 초기 재고는 0으로 설정됩니다.</p>
              </div>
            </div>
          </div>
          
          {/* 하단 버튼 */}
          <Stack direction="row" justify="end" gap={3} style={{ paddingBottom: '1.5rem' }}>
            <Button
              variant="outline"
              size="default"
              onClick={onCancel}
            >
              취소
            </Button>
            <Button
              variant="primary"
              size="default"
              loading={saving}
              disabled={saving}
              onClick={handleSave}
            >
              {saving ? '저장 중...' : (productId ? '수정' : '등록')}
            </Button>
          </Stack>
    </Container>
  );
};

export default ProductsAddPage;
