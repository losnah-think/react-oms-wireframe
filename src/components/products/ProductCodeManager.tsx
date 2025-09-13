import React, { useState, useEffect } from 'react';
import type { ProductCodes, ChannelCode } from '../../types/multitenant';

interface ProductCodeManagerProps {
  codes: ProductCodes;
  onChange: (codes: ProductCodes) => void;
  onValidation?: (isValid: boolean, errors: Record<string, string[]>) => void;
  disabled?: boolean;
}

interface ValidationError {
  field: string;
  message: string;
}

interface CodeDuplicationResult {
  isDuplicated: boolean;
  conflictingProducts?: string[];
}

const ProductCodeManager: React.FC<ProductCodeManagerProps> = ({
  codes,
  onChange,
  onValidation,
  disabled = false
}) => {
  // 상태 관리
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]>>({});
  const [validationWarnings, setValidationWarnings] = useState<Record<string, string[]>>({});
  const [checking, setChecking] = useState<Record<string, boolean>>({});
  
  // 사용 가능한 채널 목록
  const availableChannels = [
    { id: 'naver', name: '네이버 쇼핑' },
    { id: 'coupang', name: '쿠팡' },
    { id: 'gmarket', name: 'G마켓' },
    { id: 'auction', name: '옥션' },
    { id: '11st', name: '11번가' },
    { id: 'wemakeprice', name: '위메프' },
    { id: 'tmon', name: '티몬' },
    { id: 'interpark', name: '인터파크' }
  ];
  
  // 검증 규칙
  const validateCode = async (type: 'internal' | 'cafe24' | 'channel', value: string, channelId?: string): Promise<ValidationError[]> => {
    const errors: ValidationError[] = [];
    
    if (!value.trim()) {
      if (type === 'internal') {
        errors.push({ field: type, message: '자체상품코드는 필수 입력 항목입니다.' });
      }
      return errors;
    }
    
    // 형식 검증
    switch (type) {
      case 'internal':
        if (!/^[A-Z0-9]{6,20}$/.test(value)) {
          errors.push({ 
            field: type, 
            message: '자체상품코드는 영문 대문자와 숫자 6-20자로 입력해주세요.' 
          });
        }
        break;
        
      case 'cafe24':
        if (value && !/^[A-Za-z0-9_-]{3,30}$/.test(value)) {
          errors.push({ 
            field: type, 
            message: '카페24 상품코드는 영문, 숫자, _, - 조합 3-30자로 입력해주세요.' 
          });
        }
        break;
        
      case 'channel':
        if (value && value.length < 3) {
          errors.push({ 
            field: `channel_${channelId}`, 
            message: '채널 상품코드는 3자 이상 입력해주세요.' 
          });
        }
        break;
    }
    
    // 중복 검증 (API 호출 시뮬레이션)
    if (errors.length === 0 && value.trim()) {
      const duplicationCheck = await checkCodeDuplication(type, value, channelId);
      if (duplicationCheck.isDuplicated) {
        errors.push({
          field: type === 'channel' ? `channel_${channelId}` : type,
          message: `이미 사용중인 ${getCodeTypeName(type)} 입니다. ${duplicationCheck.conflictingProducts?.join(', ')}`
        });
      }
    }
    
    return errors;
  };
  
  // 코드 중복 검증 (API 시뮬레이션)
  const checkCodeDuplication = async (
    type: 'internal' | 'cafe24' | 'channel', 
    value: string, 
    channelId?: string
  ): Promise<CodeDuplicationResult> => {
    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // 임시 중복 체크 로직
    const isDuplicated = Math.random() < 0.1; // 10% 확률로 중복
    
    if (isDuplicated) {
      return {
        isDuplicated: true,
        conflictingProducts: [`기존상품${Math.floor(Math.random() * 100) + 1}`]
      };
    }
    
    return { isDuplicated: false };
  };
  
  // 코드 타입 이름 반환
  const getCodeTypeName = (type: 'internal' | 'cafe24' | 'channel'): string => {
    switch (type) {
      case 'internal': return '자체상품코드';
      case 'cafe24': return '카페24 상품코드';
      case 'channel': return '채널 상품코드';
    }
  };
  
  // 자체상품코드 변경 처리
  const handleInternalCodeChange = async (value: string) => {
    const upperValue = value.toUpperCase();
    const newCodes = { ...codes, internal: upperValue };
    onChange(newCodes);
    
    // 실시간 검증
    if (upperValue !== codes.internal) {
      setChecking(prev => ({ ...prev, internal: true }));
      const errors = await validateCode('internal', upperValue);
      updateValidationErrors('internal', errors);
      setChecking(prev => ({ ...prev, internal: false }));
    }
  };
  
  // 카페24 코드 변경 처리
  const handleCafe24CodeChange = async (value: string) => {
    const newCodes = { ...codes, cafe24: value };
    onChange(newCodes);
    
    // 실시간 검증
    if (value !== codes.cafe24) {
      setChecking(prev => ({ ...prev, cafe24: true }));
      const errors = await validateCode('cafe24', value);
      updateValidationErrors('cafe24', errors);
      setChecking(prev => ({ ...prev, cafe24: false }));
    }
  };
  
  // 채널 코드 변경 처리
  const handleChannelCodeChange = async (channelId: string, value: string) => {
    const existingChannels = codes.channels || [];
    const channelIndex = existingChannels.findIndex(ch => ch.channelId === channelId);
    
    let newChannels: ChannelCode[];
    
    if (channelIndex >= 0) {
      // 기존 채널 코드 업데이트
      newChannels = [...existingChannels];
      newChannels[channelIndex] = {
        ...newChannels[channelIndex],
        code: value
      };
    } else {
      // 새 채널 코드 추가
      const channelInfo = availableChannels.find(ch => ch.id === channelId);
      if (channelInfo && value.trim()) {
        newChannels = [...existingChannels, {
          channelId,
          channelName: channelInfo.name,
          code: value.trim()
        }];
      } else {
        newChannels = existingChannels;
      }
    }
    
    // 빈 값인 채널 제거
    newChannels = newChannels.filter(ch => ch.code.trim() !== '');
    
    const newCodes = { ...codes, channels: newChannels };
    onChange(newCodes);
    
    // 실시간 검증
    if (value.trim()) {
      setChecking(prev => ({ ...prev, [`channel_${channelId}`]: true }));
      const errors = await validateCode('channel', value, channelId);
      updateValidationErrors(`channel_${channelId}`, errors);
      setChecking(prev => ({ ...prev, [`channel_${channelId}`]: false }));
    }
  };
  
  // 검증 에러 업데이트
  const updateValidationErrors = (field: string, errors: ValidationError[]) => {
    const errorMessages = errors.map(err => err.message);
    
    setValidationErrors(prev => ({
      ...prev,
      [field]: errorMessages
    }));
    
    // 부모 컴포넌트에 검증 결과 전달
    const allErrors = { ...validationErrors, [field]: errorMessages };
    const isValid = Object.values(allErrors).every(errs => errs.length === 0);
    
    onValidation?.(isValid, allErrors);
  };
  
  // 채널 코드 값 가져오기
  const getChannelCode = (channelId: string): string => {
    const channel = codes.channels?.find(ch => ch.channelId === channelId);
    return channel?.code || '';
  };
  
  // 자동 코드 생성
  const generateAutoCode = (type: 'cafe24') => {
    switch (type) {
      case 'cafe24':
        if (codes.internal) {
          const autoCode = `C24${codes.internal.slice(-6)}`;
          handleCafe24CodeChange(autoCode);
        }
        break;
    }
  };
  
  // 코드 동기화 영향 분석
  const getSyncImpact = (type: 'internal' | 'cafe24') => {
    const impacts: string[] = [];
    
    if (type === 'internal') {
      impacts.push('전체 채널 상품 정보 업데이트 필요');
      impacts.push('재고 연동 시스템 코드 변경');
      impacts.push('주문 연동 시스템 영향');
    } else if (type === 'cafe24') {
      impacts.push('카페24 쇼핑몰 상품 코드 변경');
      impacts.push('카페24 재고 연동 영향');
    }
    
    return impacts;
  };
  
  return (
    <div className="space-y-6">
      {/* 자체상품코드 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            자체상품코드 <span className="text-red-500">*</span>
          </label>
          {checking.internal && (
            <span className="text-xs text-blue-600 flex items-center">
              <span className="animate-spin mr-1">⏳</span>
              중복 확인 중...
            </span>
          )}
        </div>
        
        <input
          type="text"
          value={codes.internal || ''}
          onChange={(e) => handleInternalCodeChange(e.target.value)}
          disabled={disabled}
          placeholder="PRD000001"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          maxLength={20}
        />
        
        <div className="mt-1 space-y-1">
          <p className="text-xs text-gray-500">
            영문 대문자, 숫자 6-20자 / 중복 불가 / 수정 시 전체 시스템 영향
          </p>
          
          {validationErrors.internal?.map((error, index) => (
            <p key={index} className="text-sm text-red-600">{error}</p>
          ))}
          
          {codes.internal && codes.internal.length >= 6 && !validationErrors.internal?.length && (
            <div className="text-xs text-amber-600 space-y-1">
              <p><strong>채널 동기화 영향:</strong></p>
              {getSyncImpact('internal').map((impact, index) => (
                <p key={index} className="ml-2">• {impact}</p>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* 카페24 상품코드 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">
            카페24 상품코드
          </label>
          <div className="flex items-center space-x-2">
            {checking.cafe24 && (
              <span className="text-xs text-blue-600 flex items-center">
                <span className="animate-spin mr-1">⏳</span>
                중복 확인 중...
              </span>
            )}
            <button
              type="button"
              onClick={() => generateAutoCode('cafe24')}
              disabled={disabled || !codes.internal}
              className="text-xs text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              자동생성
            </button>
          </div>
        </div>
        
        <input
          type="text"
          value={codes.cafe24 || ''}
          onChange={(e) => handleCafe24CodeChange(e.target.value)}
          disabled={disabled}
          placeholder="C24000001"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
          maxLength={30}
        />
        
        <div className="mt-1 space-y-1">
          <p className="text-xs text-gray-500">
            영문, 숫자, _, - 조합 3-30자 / 카페24 쇼핑몰 연동 시 사용
          </p>
          
          {validationErrors.cafe24?.map((error, index) => (
            <p key={index} className="text-sm text-red-600">{error}</p>
          ))}
          
          {codes.cafe24 && codes.cafe24.length >= 3 && !validationErrors.cafe24?.length && (
            <div className="text-xs text-amber-600 space-y-1">
              <p><strong>채널 동기화 영향:</strong></p>
              {getSyncImpact('cafe24').map((impact, index) => (
                <p key={index} className="ml-2">• {impact}</p>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* 판매처별 상품코드 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          판매처별 상품코드
        </label>
        
        <div className="space-y-3">
          {availableChannels.map((channel) => {
            const channelCode = getChannelCode(channel.id);
            const fieldKey = `channel_${channel.id}`;
            const isChecking = checking[fieldKey];
            const errors = validationErrors[fieldKey];
            
            return (
              <div key={channel.id} className="flex items-start space-x-3">
                <div className="w-24 flex-shrink-0">
                  <span className="text-sm text-gray-600">{channel.name}</span>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={channelCode}
                      onChange={(e) => handleChannelCodeChange(channel.id, e.target.value)}
                      disabled={disabled}
                      placeholder={`${channel.name} 상품코드`}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    />
                    
                    {isChecking && (
                      <span className="text-xs text-blue-600 flex items-center">
                        <span className="animate-spin">⏳</span>
                      </span>
                    )}
                  </div>
                  
                  {errors?.map((error, index) => (
                    <p key={index} className="text-sm text-red-600 mt-1">{error}</p>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-3 p-3 bg-blue-50 rounded-md">
          <p className="text-xs text-blue-700">
            <strong>💡 채널 코드 관리 팁:</strong>
          </p>
          <ul className="text-xs text-blue-700 mt-1 space-y-1">
            <li>• 각 채널별로 고유한 코드를 사용하세요</li>
            <li>• 코드 변경 시 해당 채널의 상품 정보가 자동 업데이트됩니다</li>
            <li>• 빈 값으로 두면 해당 채널에서 판매하지 않는 것으로 처리됩니다</li>
          </ul>
        </div>
      </div>
      
      {/* 코드 요약 */}
      {(codes.internal || codes.cafe24 || (codes.channels && codes.channels.length > 0)) && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3">코드 요약</h4>
          
          <div className="space-y-2 text-sm">
            {codes.internal && (
              <div className="flex justify-between">
                <span className="text-gray-600">자체상품코드:</span>
                <span className="font-medium">{codes.internal}</span>
              </div>
            )}
            
            {codes.cafe24 && (
              <div className="flex justify-between">
                <span className="text-gray-600">카페24 코드:</span>
                <span className="font-medium">{codes.cafe24}</span>
              </div>
            )}
            
            {codes.channels && codes.channels.length > 0 && (
              <div>
                <span className="text-gray-600 block mb-2">채널별 코드:</span>
                <div className="ml-4 space-y-1">
                  {codes.channels.map((channel) => (
                    <div key={channel.channelId} className="flex justify-between">
                      <span className="text-gray-500">{channel.channelName}:</span>
                      <span className="font-medium">{channel.code}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCodeManager;
