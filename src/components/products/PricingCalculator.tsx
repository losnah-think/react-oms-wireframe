import React, { useState, useEffect } from 'react';
import type { PricingInfo, PricingRule } from '../../types/multitenant';

interface PricingCalculatorProps {
  pricing: PricingInfo;
  onChange: (pricing: PricingInfo) => void;
  disabled?: boolean;
  productCategory?: string;
  supplierType?: 'chemical' | 'distributor';
}

interface PricingValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

interface MarginAnalysis {
  grossMargin: number;
  netMargin: number;
  competitivePosition: 'low' | 'competitive' | 'high';
  recommendations: string[];
}

const PricingCalculator: React.FC<PricingCalculatorProps> = ({
  pricing,
  onChange,
  disabled = false,
  productCategory = '',
  supplierType = 'distributor'
}) => {
  // 상태 관리
  const [validation, setValidation] = useState<PricingValidation>({ isValid: true, errors: [], warnings: [] });
  const [marginAnalysis, setMarginAnalysis] = useState<MarginAnalysis | null>(null);
  const [rules, setRules] = useState<PricingRule[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  
  // 가격 규칙 로드 (실제로는 API에서 가져옴)
  useEffect(() => {
    loadPricingRules();
  }, [productCategory, supplierType]);
  
  // 가격 변경 시 자동 계산 및 검증
  useEffect(() => {
    if (pricing.supplyPrice || pricing.salePrice) {
      calculatePricing();
      validatePricing();
      analyzeProfitMargin();
    }
  }, [pricing.supplyPrice, pricing.salePrice, pricing.discountPrice, rules]);
  
  // 가격 규칙 로드
  const loadPricingRules = async () => {
    // API 호출 시뮬레이션
    const mockRules: PricingRule[] = [
      {
        id: '1',
        name: '최소 마진율 규칙',
        type: 'margin',
        condition: 'minimum',
        value: supplierType === 'chemical' ? 20 : 15, // 화학업체는 20%, 유통업체는 15%
        description: '최소 마진율을 보장합니다'
      },
      {
        id: '2',
        name: '최대 할인율 규칙',
        type: 'discount',
        condition: 'maximum',
        value: 30,
        description: '최대 할인율을 제한합니다'
      },
      {
        id: '3',
        name: '카테고리별 가격 규칙',
        type: 'category',
        condition: 'range',
        value: productCategory === '화학원료' ? 50000 : 10000,
        description: '카테고리별 최소 판매가격을 설정합니다'
      }
    ];
    
    setRules(mockRules);
  };
  
  // 자동 가격 계산
  const calculatePricing = () => {
    setIsCalculating(true);
    
    const newPricing = { ...pricing };
    
    // 공급가 기준 판매가 자동 계산
    if (pricing.supplyPrice && !pricing.salePrice) {
      const minMarginRule = rules.find(rule => rule.type === 'margin' && rule.condition === 'minimum');
      if (minMarginRule) {
        const calculatedSalePrice = Math.ceil(pricing.supplyPrice * (1 + minMarginRule.value / 100));
        newPricing.salePrice = calculatedSalePrice;
      }
    }
    
    // 마진율 계산
    if (pricing.supplyPrice && pricing.salePrice) {
      const marginAmount = pricing.salePrice - pricing.supplyPrice;
      const marginRate = (marginAmount / pricing.supplyPrice) * 100;
      newPricing.marginRate = Math.round(marginRate * 100) / 100;
      newPricing.marginAmount = marginAmount;
    }
    
    // 할인가 적용 시 실제 마진 계산
    if (pricing.discountPrice && pricing.supplyPrice) {
      const discountMarginAmount = pricing.discountPrice - pricing.supplyPrice;
      const discountMarginRate = (discountMarginAmount / pricing.supplyPrice) * 100;
      newPricing.actualMarginRate = Math.round(discountMarginRate * 100) / 100;
      newPricing.actualMarginAmount = discountMarginAmount;
    }
    
    // 할인율 계산
    if (pricing.salePrice && pricing.discountPrice) {
      const discountRate = ((pricing.salePrice - pricing.discountPrice) / pricing.salePrice) * 100;
      newPricing.discountRate = Math.round(discountRate * 100) / 100;
    }
    
    onChange(newPricing);
    setIsCalculating(false);
  };
  
  // 가격 검증
  const validatePricing = () => {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // 필수 값 검증
    if (!pricing.supplyPrice || pricing.supplyPrice <= 0) {
      errors.push('공급가는 0보다 큰 값이어야 합니다.');
    }
    
    if (!pricing.salePrice || pricing.salePrice <= 0) {
      errors.push('판매가는 0보다 큰 값이어야 합니다.');
    }
    
    if (pricing.supplyPrice && pricing.salePrice && pricing.supplyPrice >= pricing.salePrice) {
      errors.push('판매가는 공급가보다 높아야 합니다.');
    }
    
    // 규칙 기반 검증
    rules.forEach(rule => {
      switch (rule.type) {
        case 'margin':
          if (pricing.marginRate !== undefined && rule.condition === 'minimum' && pricing.marginRate < rule.value) {
            errors.push(`마진율이 최소 기준(${rule.value}%)보다 낮습니다.`);
          }
          break;
          
        case 'discount':
          if (pricing.discountRate !== undefined && rule.condition === 'maximum' && pricing.discountRate > rule.value) {
            errors.push(`할인율이 최대 기준(${rule.value}%)을 초과합니다.`);
          }
          break;
          
        case 'category':
          if (pricing.salePrice && rule.condition === 'range' && pricing.salePrice < rule.value) {
            warnings.push(`${productCategory} 카테고리 권장 최소 판매가(${rule.value.toLocaleString()}원)보다 낮습니다.`);
          }
          break;
      }
    });
    
    // 할인가 검증
    if (pricing.discountPrice) {
      if (pricing.discountPrice <= 0) {
        errors.push('할인가는 0보다 큰 값이어야 합니다.');
      }
      
      if (pricing.supplyPrice && pricing.discountPrice <= pricing.supplyPrice) {
        errors.push('할인가는 공급가보다 높아야 합니다.');
      }
      
      if (pricing.salePrice && pricing.discountPrice >= pricing.salePrice) {
        warnings.push('할인가가 판매가와 같거나 높습니다.');
      }
    }
    
    setValidation({
      isValid: errors.length === 0,
      errors,
      warnings
    });
  };
  
  // 수익성 분석
  const analyzeProfitMargin = async () => {
    if (!pricing.supplyPrice || !pricing.salePrice) return;
    
    // 시장 평균 데이터 조회 (실제로는 API에서 가져옴)
    const marketData = await getMarketPricingData();
    
    const effectivePrice = pricing.discountPrice || pricing.salePrice;
    const grossMargin = ((effectivePrice - pricing.supplyPrice) / effectivePrice) * 100;
    
    // 순 마진 계산 (수수료, 배송비 등 고려)
    const platformFee = effectivePrice * 0.035; // 플랫폼 수수료 3.5%
    const shippingCost = pricing.supplyPrice > 50000 ? 0 : 3000; // 5만원 미만 배송비
    const netProfit = effectivePrice - pricing.supplyPrice - platformFee - shippingCost;
    const netMargin = (netProfit / effectivePrice) * 100;
    
    // 경쟁력 분석
    let competitivePosition: 'low' | 'competitive' | 'high';
    if (effectivePrice < marketData.avgPrice * 0.9) {
      competitivePosition = 'low';
    } else if (effectivePrice > marketData.avgPrice * 1.1) {
      competitivePosition = 'high';
    } else {
      competitivePosition = 'competitive';
    }
    
    // 추천사항 생성
    const recommendations: string[] = [];
    if (grossMargin < 15) {
      recommendations.push('마진율이 낮습니다. 판매가 상향 조정을 고려해보세요.');
    }
    if (competitivePosition === 'high') {
      recommendations.push('시장 평균보다 높은 가격입니다. 경쟁력 검토가 필요합니다.');
    }
    if (pricing.discountRate && pricing.discountRate > 20) {
      recommendations.push('할인율이 높습니다. 브랜드 가치 훼손을 주의하세요.');
    }
    
    setMarginAnalysis({
      grossMargin: Math.round(grossMargin * 100) / 100,
      netMargin: Math.round(netMargin * 100) / 100,
      competitivePosition,
      recommendations
    });
  };
  
  // 시장 가격 데이터 조회 (시뮬레이션)
  const getMarketPricingData = async () => {
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      avgPrice: pricing.salePrice ? pricing.salePrice * (0.9 + Math.random() * 0.2) : 0,
      minPrice: pricing.salePrice ? pricing.salePrice * 0.8 : 0,
      maxPrice: pricing.salePrice ? pricing.salePrice * 1.3 : 0
    };
  };
  
  // 가격 필드 변경 처리
  const handlePriceChange = (field: keyof PricingInfo, value: number | undefined) => {
    const newPricing = { ...pricing, [field]: value };
    onChange(newPricing);
  };
  
  // 추천 가격 적용
  const applyRecommendedPrice = (type: 'minimum' | 'competitive' | 'premium') => {
    if (!pricing.supplyPrice) return;
    
    let multiplier: number;
    switch (type) {
      case 'minimum':
        multiplier = 1.15; // 15% 마진
        break;
      case 'competitive':
        multiplier = 1.25; // 25% 마진
        break;
      case 'premium':
        multiplier = 1.35; // 35% 마진
        break;
    }
    
    const recommendedPrice = Math.ceil(pricing.supplyPrice * multiplier);
    handlePriceChange('salePrice', recommendedPrice);
  };
  
  return (
    <div className="space-y-6">
      {/* 기본 가격 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 공급가 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            공급가 (원) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={pricing.supplyPrice || ''}
            onChange={(e) => handlePriceChange('supplyPrice', e.target.value ? Number(e.target.value) : undefined)}
            disabled={disabled}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          />
          {supplierType === 'chemical' && (
            <p className="text-xs text-blue-600 mt-1">
              화학업체: 최소 20% 마진율 권장
            </p>
          )}
        </div>
        
        {/* 판매가 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700">
              판매가 (원) <span className="text-red-500">*</span>
            </label>
            {isCalculating && (
              <span className="text-xs text-blue-600">계산중...</span>
            )}
          </div>
          <input
            type="number"
            value={pricing.salePrice || ''}
            onChange={(e) => handlePriceChange('salePrice', e.target.value ? Number(e.target.value) : undefined)}
            disabled={disabled}
            placeholder="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          />
          
          {/* 추천 가격 버튼 */}
          {pricing.supplyPrice && !disabled && (
            <div className="flex space-x-2 mt-2">
              <button
                type="button"
                onClick={() => applyRecommendedPrice('minimum')}
                className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
              >
                최소가 ({Math.ceil(pricing.supplyPrice * 1.15).toLocaleString()}원)
              </button>
              <button
                type="button"
                onClick={() => applyRecommendedPrice('competitive')}
                className="text-xs px-2 py-1 bg-blue-100 hover:bg-blue-200 rounded"
              >
                적정가 ({Math.ceil(pricing.supplyPrice * 1.25).toLocaleString()}원)
              </button>
              <button
                type="button"
                onClick={() => applyRecommendedPrice('premium')}
                className="text-xs px-2 py-1 bg-green-100 hover:bg-green-200 rounded"
              >
                프리미엄 ({Math.ceil(pricing.supplyPrice * 1.35).toLocaleString()}원)
              </button>
            </div>
          )}
        </div>
        
        {/* 할인가 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            할인가 (원)
          </label>
          <input
            type="number"
            value={pricing.discountPrice || ''}
            onChange={(e) => handlePriceChange('discountPrice', e.target.value ? Number(e.target.value) : undefined)}
            disabled={disabled}
            placeholder="할인가 (선택)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          />
        </div>
        
        {/* 재고 원가 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            재고 원가 (원)
          </label>
          <input
            type="number"
            value={pricing.costPrice || ''}
            onChange={(e) => handlePriceChange('costPrice', e.target.value ? Number(e.target.value) : undefined)}
            disabled={disabled}
            placeholder="재고 원가 (선택)"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50"
          />
          <p className="text-xs text-gray-500 mt-1">
            재고 관리 및 손익 계산에 사용됩니다.
          </p>
        </div>
      </div>
      
      {/* 계산된 수치 표시 */}
      {(pricing.marginRate !== undefined || pricing.discountRate !== undefined) && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
          {pricing.marginRate !== undefined && (
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {pricing.marginRate}%
              </div>
              <div className="text-xs text-gray-600">마진율</div>
              <div className="text-xs text-gray-500">
                ({pricing.marginAmount?.toLocaleString()}원)
              </div>
            </div>
          )}
          
          {pricing.discountRate !== undefined && (
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {pricing.discountRate}%
              </div>
              <div className="text-xs text-gray-600">할인율</div>
            </div>
          )}
          
          {pricing.actualMarginRate !== undefined && (
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {pricing.actualMarginRate}%
              </div>
              <div className="text-xs text-gray-600">실제 마진율</div>
              <div className="text-xs text-gray-500">
                ({pricing.actualMarginAmount?.toLocaleString()}원)
              </div>
            </div>
          )}
          
          {marginAnalysis && (
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {marginAnalysis.netMargin}%
              </div>
              <div className="text-xs text-gray-600">순 마진율</div>
              <div className="text-xs text-gray-500">(수수료 제외)</div>
            </div>
          )}
        </div>
      )}
      
      {/* 검증 결과 */}
      {(validation.errors.length > 0 || validation.warnings.length > 0) && (
        <div className="space-y-2">
          {validation.errors.map((error, index) => (
            <div key={index} className="flex items-center text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          ))}
          
          {validation.warnings.map((warning, index) => (
            <div key={index} className="flex items-center text-sm text-yellow-700 bg-yellow-50 px-3 py-2 rounded">
              <span className="mr-2">💡</span>
              {warning}
            </div>
          ))}
        </div>
      )}
      
      {/* 수익성 분석 */}
      {marginAnalysis && (
        <div className="p-4 bg-blue-50 rounded-lg">
          <h4 className="text-sm font-medium text-blue-900 mb-3">수익성 분석</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <div className="text-sm text-blue-700">총 마진율</div>
              <div className="text-lg font-semibold">{marginAnalysis.grossMargin}%</div>
            </div>
            <div>
              <div className="text-sm text-blue-700">순 마진율</div>
              <div className="text-lg font-semibold">{marginAnalysis.netMargin}%</div>
            </div>
            <div>
              <div className="text-sm text-blue-700">시장 경쟁력</div>
              <div className={`text-lg font-semibold ${
                marginAnalysis.competitivePosition === 'low' ? 'text-green-600' :
                marginAnalysis.competitivePosition === 'high' ? 'text-red-600' :
                'text-blue-600'
              }`}>
                {marginAnalysis.competitivePosition === 'low' ? '가격 경쟁력 우수' :
                 marginAnalysis.competitivePosition === 'high' ? '가격 경쟁력 부족' :
                 '적정 가격'}
              </div>
            </div>
          </div>
          
          {marginAnalysis.recommendations.length > 0 && (
            <div>
              <div className="text-sm font-medium text-blue-900 mb-2">추천사항</div>
              <ul className="space-y-1">
                {marginAnalysis.recommendations.map((recommendation, index) => (
                  <li key={index} className="text-sm text-blue-700 flex items-start">
                    <span className="mr-2 mt-0.5">•</span>
                    {recommendation}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
      
      {/* 적용 규칙 */}
      {rules.length > 0 && (
        <div className="p-3 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">적용 가격 규칙</h4>
          <div className="space-y-1">
            {rules.map((rule) => (
              <div key={rule.id} className="text-xs text-gray-600">
                • {rule.name}: {rule.description}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingCalculator;
