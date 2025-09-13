import React, { useState } from 'react';

interface OrderSettingsProps {
  onSave: (settings: OrderSettingsType) => void;
}

interface OrderSettingsType {
  autoConfirmationEnabled: boolean;
  autoConfirmationDelay: number;
  lowStockThreshold: number;
  maxOrderQuantity: number;
  requirePhoneVerification: boolean;
  allowGuestCheckout: boolean;
  defaultShippingMethod: string;
  defaultPaymentMethod: string;
  orderNumberPrefix: string;
  emailNotifications: {
    orderReceived: boolean;
    orderConfirmed: boolean;
    orderShipped: boolean;
    orderDelivered: boolean;
    orderCancelled: boolean;
  };
  smsNotifications: {
    orderConfirmed: boolean;
    orderShipped: boolean;
    orderDelivered: boolean;
  };
  businessHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone: string;
  };
  holidays: string[];
  shippingRules: {
    freeShippingThreshold: number;
    standardShippingCost: number;
    expeditedShippingCost: number;
    sameDayDeliveryEnabled: boolean;
    sameDayDeliveryCutoff: string;
  };
  returnPolicy: {
    returnPeriodDays: number;
    requireReturnReason: boolean;
    autoApproveReturns: boolean;
    restockingFee: number;
  };
}

const OrderSettings: React.FC<OrderSettingsProps> = ({ onSave }) => {
  const [activeTab, setActiveTab] = useState<'general' | 'notifications' | 'shipping' | 'returns'>('general');
  
  const [settings, setSettings] = useState<OrderSettingsType>({
    autoConfirmationEnabled: true,
    autoConfirmationDelay: 5,
    lowStockThreshold: 10,
    maxOrderQuantity: 99,
    requirePhoneVerification: false,
    allowGuestCheckout: true,
    defaultShippingMethod: 'standard',
    defaultPaymentMethod: 'card',
    orderNumberPrefix: 'ORD',
    emailNotifications: {
      orderReceived: true,
      orderConfirmed: true,
      orderShipped: true,
      orderDelivered: true,
      orderCancelled: true,
    },
    smsNotifications: {
      orderConfirmed: false,
      orderShipped: true,
      orderDelivered: true,
    },
    businessHours: {
      enabled: true,
      startTime: '09:00',
      endTime: '18:00',
      timezone: 'Asia/Seoul',
    },
    holidays: ['2024-01-01', '2024-02-09', '2024-03-01'],
    shippingRules: {
      freeShippingThreshold: 50000,
      standardShippingCost: 3000,
      expeditedShippingCost: 8000,
      sameDayDeliveryEnabled: false,
      sameDayDeliveryCutoff: '14:00',
    },
    returnPolicy: {
      returnPeriodDays: 7,
      requireReturnReason: true,
      autoApproveReturns: false,
      restockingFee: 0,
    },
  });

  const handleSettingChange = (path: string, value: any) => {
    setSettings((prev: OrderSettingsType) => {
      const keys = path.split('.');
      const newSettings = { ...prev };
      let current: any = newSettings;
      
      for (let i = 0; i < keys.length - 1; i++) {
        current[keys[i]] = { ...current[keys[i]] };
        current = current[keys[i]];
      }
      
      current[keys[keys.length - 1]] = value;
      return newSettings;
    });
  };

  const handleSave = () => {
    onSave(settings);
  };

  const tabs = [
    { id: 'general', label: '일반 설정', icon: '' },
    { id: 'notifications', label: '알림 설정', icon: '' },
    { id: 'shipping', label: '배송 설정', icon: '' },
    { id: 'returns', label: '반품 설정', icon: '' },
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">주문 설정</h1>
        <p className="text-gray-600">주문 처리 규칙과 알림을 설정하여 효율적인 주문 관리를 구축합니다.</p>
      </div>

      {/* 탭 네비게이션 */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="text-lg">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* 일반 설정 */}
      {activeTab === 'general' && (
        <div className="space-y-8">
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">주문 처리 설정</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={settings.autoConfirmationEnabled}
                    onChange={(e) => handleSettingChange('autoConfirmationEnabled', e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-900">자동 주문 확인</span>
                </label>
                <p className="text-sm text-gray-500 mt-1 ml-7">
                  결제 완료 후 자동으로 주문을 확인 처리합니다
                </p>
              </div>

              {settings.autoConfirmationEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    자동 확인 지연 시간 (분)
                  </label>
                  <input
                    type="number"
                    value={settings.autoConfirmationDelay}
                    onChange={(e) => handleSettingChange('autoConfirmationDelay', parseInt(e.target.value))}
                    min="0"
                    max="60"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  재고 부족 임계값
                </label>
                <input
                  type="number"
                  value={settings.lowStockThreshold}
                  onChange={(e) => handleSettingChange('lowStockThreshold', parseInt(e.target.value))}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  이 수량 이하로 재고가 떨어지면 알림을 받습니다
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  최대 주문 수량
                </label>
                <input
                  type="number"
                  value={settings.maxOrderQuantity}
                  onChange={(e) => handleSettingChange('maxOrderQuantity', parseInt(e.target.value))}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  주문번호 접두사
                </label>
                <input
                  type="text"
                  value={settings.orderNumberPrefix}
                  onChange={(e) => handleSettingChange('orderNumberPrefix', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">고객 설정</h2>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.requirePhoneVerification}
                  onChange={(e) => handleSettingChange('requirePhoneVerification', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-900">휴대폰 번호 인증 필수</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.allowGuestCheckout}
                  onChange={(e) => handleSettingChange('allowGuestCheckout', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-900">비회원 주문 허용</span>
              </label>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">영업 시간</h2>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.businessHours.enabled}
                  onChange={(e) => handleSettingChange('businessHours.enabled', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-900">영업 시간 제한 활성화</span>
              </label>

              {settings.businessHours.enabled && (
                <div className="grid grid-cols-2 gap-4 ml-7">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">시작 시간</label>
                    <input
                      type="time"
                      value={settings.businessHours.startTime}
                      onChange={(e) => handleSettingChange('businessHours.startTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">종료 시간</label>
                    <input
                      type="time"
                      value={settings.businessHours.endTime}
                      onChange={(e) => handleSettingChange('businessHours.endTime', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 알림 설정 */}
      {activeTab === 'notifications' && (
        <div className="space-y-8">
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">이메일 알림</h2>
            <div className="space-y-4">
              {Object.entries(settings.emailNotifications).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={value as boolean}
                    onChange={(e) => handleSettingChange(`emailNotifications.${key}`, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {key === 'orderReceived' ? '주문 접수' :
                     key === 'orderConfirmed' ? '주문 확인' :
                     key === 'orderShipped' ? '배송 시작' :
                     key === 'orderDelivered' ? '배송 완료' :
                     key === 'orderCancelled' ? '주문 취소' : key}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">SMS 알림</h2>
            <div className="space-y-4">
              {Object.entries(settings.smsNotifications).map(([key, value]) => (
                <label key={key} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={value as boolean}
                    onChange={(e) => handleSettingChange(`smsNotifications.${key}`, e.target.checked)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {key === 'orderConfirmed' ? '주문 확인' :
                     key === 'orderShipped' ? '배송 시작' :
                     key === 'orderDelivered' ? '배송 완료' : key}
                  </span>
                </label>
              ))}
            </div>
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                <strong>주의:</strong> SMS 알림은 별도의 요금이 발생할 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 배송 설정 */}
      {activeTab === 'shipping' && (
        <div className="space-y-8">
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">배송비 설정</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  무료배송 기준 금액 (원)
                </label>
                <input
                  type="number"
                  value={settings.shippingRules.freeShippingThreshold}
                  onChange={(e) => handleSettingChange('shippingRules.freeShippingThreshold', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  일반 배송비 (원)
                </label>
                <input
                  type="number"
                  value={settings.shippingRules.standardShippingCost}
                  onChange={(e) => handleSettingChange('shippingRules.standardShippingCost', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  빠른 배송비 (원)
                </label>
                <input
                  type="number"
                  value={settings.shippingRules.expeditedShippingCost}
                  onChange={(e) => handleSettingChange('shippingRules.expeditedShippingCost', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">당일배송</h2>
            <div className="space-y-4">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.shippingRules.sameDayDeliveryEnabled}
                  onChange={(e) => handleSettingChange('shippingRules.sameDayDeliveryEnabled', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-900">당일배송 활성화</span>
              </label>

              {settings.shippingRules.sameDayDeliveryEnabled && (
                <div className="ml-7">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    당일배송 주문 마감 시간
                  </label>
                  <input
                    type="time"
                    value={settings.shippingRules.sameDayDeliveryCutoff}
                    onChange={(e) => handleSettingChange('shippingRules.sameDayDeliveryCutoff', e.target.value)}
                    className="w-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    이 시간 이후의 주문은 다음 영업일에 배송됩니다
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 반품 설정 */}
      {activeTab === 'returns' && (
        <div className="space-y-8">
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">반품 정책</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  반품 가능 기간 (일)
                </label>
                <input
                  type="number"
                  value={settings.returnPolicy.returnPeriodDays}
                  onChange={(e) => handleSettingChange('returnPolicy.returnPeriodDays', parseInt(e.target.value))}
                  min="0"
                  max="365"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  재입고 수수료 (%)
                </label>
                <input
                  type="number"
                  value={settings.returnPolicy.restockingFee}
                  onChange={(e) => handleSettingChange('returnPolicy.restockingFee', parseFloat(e.target.value))}
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-4 mt-6">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.returnPolicy.requireReturnReason}
                  onChange={(e) => handleSettingChange('returnPolicy.requireReturnReason', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-900">반품 사유 입력 필수</span>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={settings.returnPolicy.autoApproveReturns}
                  onChange={(e) => handleSettingChange('returnPolicy.autoApproveReturns', e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-900">반품 요청 자동 승인</span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* 저장 버튼 */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <button
          onClick={() => {/* Reset to defaults */}}
          className="px-6 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
        >
          기본값 복원
        </button>
        <button
          onClick={handleSave}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          설정 저장
        </button>
      </div>
    </div>
  );
};

export default OrderSettings;
