import React, { useState, useEffect } from 'react';

const MallInfoManagementPage = () => {
  const [selectedMall, setSelectedMall] = useState('');
  const [activeTab, setActiveTab] = useState('shipping');
  const [mallInfoData, setMallInfoData] = useState({});

  const [malls] = useState([
    { id: 'coupang', name: '쿠팡', status: 'active', logo: '□' },
    { id: 'gmarket', name: 'G마켓', status: 'active', logo: '□' },
    { id: 'auction', name: '옥션', status: 'active', logo: '□' },
    { id: '11st', name: '11번가', status: 'active', logo: '□' },
    { id: 'interpark', name: '인터파크', status: 'active', logo: '□' },
    { id: 'wemakeprice', name: '위메프', status: 'inactive', logo: '□' }
  ]);

  const defaultMallInfo = {
    shipping: {
      freeShippingThreshold: 30000,
      standardShippingFee: 3000,
      expressShippingFee: 5000,
      returnShippingFee: 3000,
      exchangeShippingFee: 6000,
      jejuShippingFee: 5000,
      mountainShippingFee: 5000
    },
    policies: {
      returnPolicy: '구매일로부터 7일 이내 반품 가능',
      exchangePolicy: '상품 불량 시에만 교환 가능',
      refundPolicy: '환불 시 배송비 제외하고 환불',
      warrantyPolicy: '제조사 보증 기준에 따름',
      asPolicy: 'A/S 문의는 고객센터로 연락'
    },
    templates: {
      productDescription: `
상품 상세 정보

[상품 특징]
- 고품질 소재 사용
- 우수한 내구성
- 세련된 디자인

[주의사항]
- 세탁 시 찬물 사용
- 건조기 사용 금지
- 직사광선 피해서 보관

[배송 정보]
- 평일 오후 2시 이전 주문 시 당일 발송
- 주말 및 공휴일 제외
- 제주/도서산간 지역 추가 배송비 발생
      `,
      asNotice: `
A/S 안내

본 상품은 구매일로부터 1년간 무상 A/S를 제공합니다.
A/S 접수는 고객센터(1588-0000)로 연락주시기 바랍니다.

[무상 A/S 대상]
- 정상 사용 중 발생한 제품 불량
- 제조 과정에서의 결함

[유상 A/S 대상]
- 사용자 부주의로 인한 손상
- 개조 또는 분해로 인한 고장
      `
    },
    options: {
      autoReply: true,
      inventorySync: true,
      priceSync: true,
      promotionSync: false,
      reviewSync: true,
      qnaAutoReply: true
    }
  };

  useEffect(() => {
    if (selectedMall) {
      setMallInfoData(prev => ({
        ...prev,
        [selectedMall]: prev[selectedMall] || defaultMallInfo
      }));
    }
  }, [selectedMall]);

  const handleInputChange = (section, field, value) => {
    setMallInfoData(prev => ({
      ...prev,
      [selectedMall]: {
        ...prev[selectedMall],
        [section]: {
          ...prev[selectedMall]?.[section],
          [field]: value
        }
      }
    }));
  };

  const handleSave = () => {
    alert('쇼핑몰 부가 정보가 저장되었습니다.');
  };

  const handleCopyFrom = (sourceMall) => {
    if (window.confirm(`${malls.find(m => m.id === sourceMall)?.name}의 설정을 복사하시겠습니까?`)) {
      setMallInfoData(prev => ({
        ...prev,
        [selectedMall]: { ...prev[sourceMall] }
      }));
    }
  };

  const currentInfo = mallInfoData[selectedMall] || defaultMallInfo;
  const tabs = [
    { id: 'shipping', name: '배송비 설정' },
    { id: 'policies', name: '정책 설정' },
    { id: 'templates', name: '템플릿 관리' },
    { id: 'options', name: '연동 옵션' }
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">쇼핑몰별 부가 정보 관리</h1>
        <p className="text-gray-600">각 쇼핑몰의 배송비, 정책, 템플릿 등 부가 정보를 관리합니다.</p>
      </div>

      {/* 쇼핑몰 선택 */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">쇼핑몰 선택</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {malls.map((mall) => (
            <div
              key={mall.id}
              onClick={() => mall.status === 'active' && setSelectedMall(mall.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedMall === mall.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${mall.status === 'inactive' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{mall.logo}</div>
                <div className="text-sm font-medium text-gray-900">{mall.name}</div>
                <div className={`text-xs mt-1 ${
                  mall.status === 'active' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {mall.status === 'active' ? '연결됨' : '연결 안됨'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedMall && (
        <>
          {/* 설정 복사 */}
          <div className="bg-white border rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-md font-medium text-gray-900">빠른 설정</h3>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">다른 쇼핑몰 설정 복사:</span>
                <select
                  onChange={(e) => e.target.value && handleCopyFrom(e.target.value)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  defaultValue=""
                >
                  <option value="">선택하세요</option>
                  {malls.filter(m => m.id !== selectedMall && mallInfoData[m.id]).map(mall => (
                    <option key={mall.id} value={mall.id}>{mall.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 탭 네비게이션 */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </nav>
          </div>

          {/* 배송비 설정 */}
          {activeTab === 'shipping' && (
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">배송비 설정</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      무료배송 기준 금액 (원)
                    </label>
                    <input
                      type="number"
                      value={currentInfo.shipping?.freeShippingThreshold || 0}
                      onChange={(e) => handleInputChange('shipping', 'freeShippingThreshold', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      일반 배송비 (원)
                    </label>
                    <input
                      type="number"
                      value={currentInfo.shipping?.standardShippingFee || 0}
                      onChange={(e) => handleInputChange('shipping', 'standardShippingFee', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      빠른 배송비 (원)
                    </label>
                    <input
                      type="number"
                      value={currentInfo.shipping?.expressShippingFee || 0}
                      onChange={(e) => handleInputChange('shipping', 'expressShippingFee', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      반품 배송비 (원)
                    </label>
                    <input
                      type="number"
                      value={currentInfo.shipping?.returnShippingFee || 0}
                      onChange={(e) => handleInputChange('shipping', 'returnShippingFee', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      교환 배송비 (원)
                    </label>
                    <input
                      type="number"
                      value={currentInfo.shipping?.exchangeShippingFee || 0}
                      onChange={(e) => handleInputChange('shipping', 'exchangeShippingFee', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      제주/도서산간 추가 배송비 (원)
                    </label>
                    <input
                      type="number"
                      value={currentInfo.shipping?.jejuShippingFee || 0}
                      onChange={(e) => handleInputChange('shipping', 'jejuShippingFee', parseInt(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 정책 설정 */}
          {activeTab === 'policies' && (
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">정책 설정</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    반품 정책
                  </label>
                  <textarea
                    value={currentInfo.policies?.returnPolicy || ''}
                    onChange={(e) => handleInputChange('policies', 'returnPolicy', e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    교환 정책
                  </label>
                  <textarea
                    value={currentInfo.policies?.exchangePolicy || ''}
                    onChange={(e) => handleInputChange('policies', 'exchangePolicy', e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    환불 정책
                  </label>
                  <textarea
                    value={currentInfo.policies?.refundPolicy || ''}
                    onChange={(e) => handleInputChange('policies', 'refundPolicy', e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    품질보증 정책
                  </label>
                  <textarea
                    value={currentInfo.policies?.warrantyPolicy || ''}
                    onChange={(e) => handleInputChange('policies', 'warrantyPolicy', e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    A/S 정책
                  </label>
                  <textarea
                    value={currentInfo.policies?.asPolicy || ''}
                    onChange={(e) => handleInputChange('policies', 'asPolicy', e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 템플릿 관리 */}
          {activeTab === 'templates' && (
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">템플릿 관리</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상품 상세 설명 템플릿
                  </label>
                  <textarea
                    value={currentInfo.templates?.productDescription || ''}
                    onChange={(e) => handleInputChange('templates', 'productDescription', e.target.value)}
                    rows="15"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="상품 상세 설명에 공통으로 사용될 템플릿을 입력하세요..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    A/S 안내 템플릿
                  </label>
                  <textarea
                    value={currentInfo.templates?.asNotice || ''}
                    onChange={(e) => handleInputChange('templates', 'asNotice', e.target.value)}
                    rows="10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="A/S 안내에 사용될 템플릿을 입력하세요..."
                  />
                </div>
              </div>
            </div>
          )}

          {/* 연동 옵션 */}
          {activeTab === 'options' && (
            <div className="bg-white border rounded-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">연동 옵션</h2>
              
              <div className="space-y-4">
                {[
                  { key: 'autoReply', label: '자동 답변', description: '고객 문의에 자동으로 답변합니다' },
                  { key: 'inventorySync', label: '재고 동기화', description: '재고 수량을 실시간으로 동기화합니다' },
                  { key: 'priceSync', label: '가격 동기화', description: '상품 가격을 자동으로 동기화합니다' },
                  { key: 'promotionSync', label: '프로모션 동기화', description: '할인 및 프로모션 정보를 동기화합니다' },
                  { key: 'reviewSync', label: '리뷰 동기화', description: '상품 리뷰를 가져옵니다' },
                  { key: 'qnaAutoReply', label: '상품문의 자동답변', description: '상품 문의에 자동으로 답변합니다' }
                ].map((option) => (
                  <div key={option.key} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.description}</div>
                    </div>
                    <label className="inline-flex items-center">
                      <input
                        type="checkbox"
                        checked={currentInfo.options?.[option.key] || false}
                        onChange={(e) => handleInputChange('options', option.key, e.target.checked)}
                        className="form-checkbox h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 저장 버튼 */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              설정 저장
            </button>
          </div>
        </>
      )}

      {!selectedMall && (
        <div className="bg-white border rounded-lg p-8 text-center">
          <div className="text-gray-400 text-lg mb-2">□</div>
          <p className="text-gray-600">부가 정보를 설정할 쇼핑몰을 선택해주세요.</p>
        </div>
      )}
    </div>
  );
};

export default MallInfoManagementPage;
