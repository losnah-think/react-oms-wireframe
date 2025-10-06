import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

interface ProductDetailPageProps {
  productId?: string;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId: propProductId }) => {
  const router = useRouter();
  const productId = propProductId || (router.query.id as string);
  
  const [activeTab, setActiveTab] = useState('images');
  
  const [formData, setFormData] = useState({
    productName: '라뮤즈 본딩 하프코트 SET',
    brand: 'default',
    englishName: 'default',
    supplier: 'default',
    businessName: 'default',
    category: 'default',
    productCode: 'default',
    productYear: 'default',
    englishCategory: 'default',
    productClassification: 'default',
    productSeason: 'default',
    currency: '원화',
    costPrice: 'default',
    sellingPrice: '1000',
    consumerPrice: 'default',
    supplyPrice: 'default',
    marketPrice: 'PRD-1000',
    brandFeeRate: 'default',
    marginRate: 'default',
    marginAmount: '0',
    designer: '전체',
    registrant: '전체',
    publishDate: 'default',
    cafe24Code: 'default',
    selfCode: 'default',
    invoiceDisplay: '포함',
    stockReflection: '반영',
    bundlingPrevention: '방지',
    shippingFeeAmount: 'default',
    shippingFeeCount: 'default',
    giftAmount: 'default',
    giftCount: 'default',
    giftText: '미적용',
    width: 'default',
    height: 'default',
    depth: 'default',
    volume: 'default',
    weight: 'default',
    origin: 'default',
    totalStock: '1000',
    boxQuantity: 'N',
    taxExempt: '면세',
    exceptionInfo: '전체',
    memo: '텍스트 입력 더미',
    tags: '#default',
    description: '상품 상세페이지에 들어갈 설명 HTML 코드를 포함해서 입력해주세요.'
  });

  const sections = [
    { id: 'images', label: '대표 이미지' },
    { id: 'name', label: '상품명' },
    { id: 'basic', label: '기본 정보' },
    { id: 'price', label: '가격 정보' },
    { id: 'options', label: '상품 옵션' },
    { id: 'additional-images', label: '추가 이미지' },
    { id: 'attributes', label: '추가 속성' },
    { id: 'dimensions', label: '물류 정보' },
    { id: 'tags', label: '태그' },
    { id: 'description', label: '상품 상세 설명' }
  ];

  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log('상품 저장:', formData);
    router.push('/products');
  };

  const scrollToSection = (sectionId: string) => {
    setActiveTab(sectionId);
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

    return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-gray-500 mb-1">1depth &gt; 2depth &gt; 3depth</div>
            <button 
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
            ← 목록으로
            </button>
            </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-700">api_test님 (api_test@example.com)</span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </div>
              </div>
              </div>

      {/* 메인 콘텐츠 */}
      <div className="px-6 py-6">
        <div className="max-w-7xl mx-auto">
          {/* 등록 정보 */}
          <div className="bg-gray-100 rounded-lg p-4 mb-6 grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">등록 아이디:</span>
              <span className="ml-2 font-medium">api_test</span>
            </div>
            <div>
              <span className="text-gray-600">등록 시간:</span>
              <span className="ml-2 font-medium">2025.6.23. 오후 07:46</span>
            </div>
            <div>
              <span className="text-gray-600">최종 수정 아이디:</span>
              <span className="ml-2 font-medium">api_test</span>
            </div>
            <div>
              <span className="text-gray-600">최종 수정 일자:</span>
              <span className="ml-2 font-medium">2025.6.23. 오후 07:46</span>
            </div>
          </div>

          {/* 상품 상세 탭 내비게이션 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">상품 상세</h2>
              <div className="flex items-center gap-3">
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">잠금</button>
                <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">삭제</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">상품등록일자 오늘로 갱신</button>
              </div>
            </div>
            <div className="flex space-x-1 px-6 py-4 bg-gray-50">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    activeTab === section.id
                      ? 'bg-blue-600 text-white'
                      : 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                  }`}
                >
                  {section.label}
                </button>
              ))}
            </div>
          </div>

          {/* 섹션들 */}
          <div className="space-y-6">
            {/* 대표 이미지 섹션 */}
            <div 
              ref={(el) => sectionRefs.current['images'] = el}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">대표 이미지</h3>
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((index) => (
                  <div key={index} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    {index === 1 ? (
                      <img 
                        src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=300&fit=crop" 
                        alt="상품 이미지"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    )}
                      </div>
                ))}
              </div>
            </div>

            {/* 상품명 섹션 */}
            <div 
              ref={(el) => sectionRefs.current['name'] = el}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">상품명</h3>
                      <div>
                            <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => handleInputChange('productName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="상품명을 입력하세요"
                />
                      </div>
                      </div>

            {/* 기본 정보 섹션 */}
            <div 
              ref={(el) => sectionRefs.current['basic'] = el}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                      <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">상품 ID</label>
                    <input type="text" value="default" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">브랜드</label>
                    <select value={formData.brand} onChange={(e) => handleInputChange('brand', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="default">default</option>
                    </select>
                      </div>
                      <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">공급처</label>
                    <select value={formData.supplier} onChange={(e) => handleInputChange('supplier', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="default">default</option>
                    </select>
                      </div>
                      <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                    <select value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="default">default</option>
                    </select>
                      </div>
                      <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">상품 연도</label>
                    <select value={formData.productYear} onChange={(e) => handleInputChange('productYear', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="default">default</option>
                    </select>
                      </div>
                      <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">상품 분류</label>
                    <select value={formData.productClassification} onChange={(e) => handleInputChange('productClassification', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="default">default</option>
                    </select>
                      </div>
                      </div>
                <div className="space-y-4">
                      <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">영문 상품명</label>
                    <input type="text" value={formData.englishName} onChange={(e) => handleInputChange('englishName', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">사업 상품명</label>
                    <input type="text" value={formData.businessName} onChange={(e) => handleInputChange('businessName', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">상품 코드</label>
                    <input type="text" value={formData.productCode} onChange={(e) => handleInputChange('productCode', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">영문 카테고리명</label>
                    <input type="text" value={formData.englishCategory} onChange={(e) => handleInputChange('englishCategory', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                      </div>
                      <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">상품 시즌</label>
                    <select value={formData.productSeason} onChange={(e) => handleInputChange('productSeason', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="default">default</option>
                    </select>
                      </div>
                      </div>
                      </div>
                      </div>

            {/* 가격 정보 섹션 */}
            <div 
              ref={(el) => sectionRefs.current['price'] = el}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">가격 정보</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">판매 통화</label>
                    <select value={formData.currency} onChange={(e) => handleInputChange('currency', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="원화">원화</option>
                    </select>
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">판매가</label>
                    <input type="text" value={formData.sellingPrice} onChange={(e) => handleInputChange('sellingPrice', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">공급가</label>
                    <input type="text" value={formData.supplyPrice} onChange={(e) => handleInputChange('supplyPrice', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">브랜드 수수료율</label>
                    <input type="text" value={formData.brandFeeRate} onChange={(e) => handleInputChange('brandFeeRate', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">마진 금액</label>
                    <input type="text" value={formData.marginAmount} onChange={(e) => handleInputChange('marginAmount', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    </div>
                <div className="space-y-4">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">원가</label>
                    <input type="text" value={formData.costPrice} onChange={(e) => handleInputChange('costPrice', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">소비자가</label>
                    <input type="text" value={formData.consumerPrice} onChange={(e) => handleInputChange('consumerPrice', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">시중가</label>
                    <input type="text" value={formData.marketPrice} onChange={(e) => handleInputChange('marketPrice', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">마진율</label>
                    <input type="text" value={formData.marginRate} onChange={(e) => handleInputChange('marginRate', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    </div>
                    </div>
                    </div>

            {/* 상품 옵션 섹션 */}
            <div 
              ref={(el) => sectionRefs.current['options'] = el}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
          <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">상품 옵션</h3>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  옵션 추가
                </button>
          </div>
          <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">옵션명/코드</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">판매상태/재고</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">위치</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">바코드</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">규격·중량</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">최종수정일</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">작업</th>
                </tr>
              </thead>
              <tbody>
                    {[1, 2].map((index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 border-b border-gray-200">V-1000-{index}</td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">판매중</span>
                            <span>30</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200">aaaaaaaaa</td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <span>없음</span>
                            <span className="text-blue-600">123456 관리</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200">aaaaaaaaa</td>
                        <td className="px-4 py-3 border-b border-gray-200">2025.01.01-7분 전</td>
                        <td className="px-4 py-3 border-b border-gray-200">aaaaaaaaa</td>
                      </tr>
                    ))}
              </tbody>
            </table>
          </div>
            </div>

            {/* 추가 이미지 섹션 */}
            <div 
              ref={(el) => sectionRefs.current['additional-images'] = el}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">추가 이미지</h3>
              <div className="grid grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((index) => (
                  <div key={index} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    {index === 1 ? (
                      <div className="w-full h-full bg-blue-500 rounded-lg flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                </div>
                    ) : (
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                )}
          </div>
                ))}
            </div>
            </div>

            {/* 추가 속성 섹션 */}
            <div 
              ref={(el) => sectionRefs.current['attributes'] = el}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">추가 속성</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
            <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">상품 디자이너</label>
                    <select value={formData.designer} onChange={(e) => handleInputChange('designer', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="전체">전체</option>
                    </select>
            </div>
            <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">상품 게시일</label>
                    <select value={formData.publishDate} onChange={(e) => handleInputChange('publishDate', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="default">default</option>
                    </select>
            </div>
            <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">자체 상품코드</label>
                    <input type="text" value={formData.selfCode} onChange={(e) => handleInputChange('selfCode', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">입고 예정 반영 여부</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input type="radio" name="stockReflection" value="반영" checked={formData.stockReflection === '반영'} onChange={(e) => handleInputChange('stockReflection', e.target.value)} className="mr-2" />
                        반영
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="stockReflection" value="미반영" checked={formData.stockReflection === '미반영'} onChange={(e) => handleInputChange('stockReflection', e.target.value)} className="mr-2" />
                        미반영
                      </label>
            </div>
          </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">배송비 선불 처리 금액</label>
                    <input type="text" value={formData.shippingFeeAmount} onChange={(e) => handleInputChange('shippingFeeAmount', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
            <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">사은품 처리 금액</label>
                    <input type="text" value={formData.giftAmount} onChange={(e) => handleInputChange('giftAmount', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">사은품 문자</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input type="radio" name="giftText" value="미적용" checked={formData.giftText === '미적용'} onChange={(e) => handleInputChange('giftText', e.target.value)} className="mr-2" />
                        미적용
                  </label>
                      <label className="flex items-center">
                        <input type="radio" name="giftText" value="적용" checked={formData.giftText === '적용'} onChange={(e) => handleInputChange('giftText', e.target.value)} className="mr-2" />
                        적용
                        </label>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">상품 등록자</label>
                    <select value={formData.registrant} onChange={(e) => handleInputChange('registrant', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="전체">전체</option>
                    </select>
              </div>
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Cafe24 상품코드</label>
                    <input type="text" value={formData.cafe24Code} onChange={(e) => handleInputChange('cafe24Code', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
              <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">송장 표시</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input type="radio" name="invoiceDisplay" value="포함" checked={formData.invoiceDisplay === '포함'} onChange={(e) => handleInputChange('invoiceDisplay', e.target.value)} className="mr-2" />
                        포함
                        </label>
                      <label className="flex items-center">
                        <input type="radio" name="invoiceDisplay" value="미포함" checked={formData.invoiceDisplay === '미포함'} onChange={(e) => handleInputChange('invoiceDisplay', e.target.value)} className="mr-2" />
                        미포함
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">합포 방지 여부</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input type="radio" name="bundlingPrevention" value="방지" checked={formData.bundlingPrevention === '방지'} onChange={(e) => handleInputChange('bundlingPrevention', e.target.value)} className="mr-2" />
                        방지
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="bundlingPrevention" value="미방지" checked={formData.bundlingPrevention === '미방지'} onChange={(e) => handleInputChange('bundlingPrevention', e.target.value)} className="mr-2" />
                        미방지
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">배송비 선불 처리 개수</label>
                    <input type="text" value={formData.shippingFeeCount} onChange={(e) => handleInputChange('shippingFeeCount', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">사은품 처리 개수</label>
                    <input type="text" value={formData.giftCount} onChange={(e) => handleInputChange('giftCount', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  </div>
                </div>
              </div>

            {/* 물류 정보 섹션 */}
            <div 
              ref={(el) => sectionRefs.current['dimensions'] = el}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">물류 정보</h3>
              <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">가로(cm)</label>
                    <input type="text" value={formData.width} onChange={(e) => handleInputChange('width', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">높이(cm)</label>
                    <input type="text" value={formData.height} onChange={(e) => handleInputChange('height', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">무게(g)</label>
                    <input type="text" value={formData.weight} onChange={(e) => handleInputChange('weight', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">총재고</label>
                    <input type="text" value={formData.totalStock} onChange={(e) => handleInputChange('totalStock', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">면세 여부</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input type="radio" name="taxExempt" value="면세" checked={formData.taxExempt === '면세'} onChange={(e) => handleInputChange('taxExempt', e.target.value)} className="mr-2" />
                        면세
                      </label>
                      <label className="flex items-center">
                        <input type="radio" name="taxExempt" value="과세" checked={formData.taxExempt === '과세'} onChange={(e) => handleInputChange('taxExempt', e.target.value)} className="mr-2" />
                        과세
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">메모</label>
                    <textarea value={formData.memo} onChange={(e) => handleInputChange('memo', e.target.value)} rows={3} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">세로(cm)</label>
                    <input type="text" value={formData.depth} onChange={(e) => handleInputChange('depth', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">부피(cc)</label>
                    <input type="text" value={formData.volume} onChange={(e) => handleInputChange('volume', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">원산지</label>
                    <input type="text" value={formData.origin} onChange={(e) => handleInputChange('origin', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">박스당 수량</label>
                    <input type="text" value={formData.boxQuantity} onChange={(e) => handleInputChange('boxQuantity', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
                      <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">편직 정보</label>
                    <select value={formData.exceptionInfo} onChange={(e) => handleInputChange('exceptionInfo', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="전체">전체</option>
                    </select>
                      </div>
                        </div>
                      </div>
                    </div>

            {/* 태그 섹션 */}
            <div 
              ref={(el) => sectionRefs.current['tags'] = el}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">태그</h3>
                      <div>
                <input type="text" value={formData.tags} onChange={(e) => handleInputChange('tags', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="태그를 입력하세요" />
                        </div>
                      </div>

            {/* 상품 상세 설명 섹션 */}
            <div 
              ref={(el) => sectionRefs.current['description'] = el}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">상품 상세 설명</h3>
              <div className="relative">
                <textarea value={formData.description} onChange={(e) => handleInputChange('description', e.target.value)} rows={8} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="상품 상세페이지에 들어갈 설명 HTML 코드를 포함해서 입력해주세요." />
                <button className="absolute bottom-3 left-3 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                  HTML
        </button>
          </div>
              </div>
              </div>

          {/* 하단 버튼 */}
          <div className="flex justify-end gap-4 mt-8 sticky bottom-0 bg-gray-50 py-4">
            <button onClick={() => router.back()} className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">취소</button>
            <button onClick={handleSave} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">저장</button>
              </div>
            </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
