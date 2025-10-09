import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import ImageUrlModal from '../../components/products/ImageUrlModal';
import OptionDetailModal from '../../components/products/OptionDetailModal';

interface ProductDetailPageProps {
  productId?: string;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ productId: propProductId }) => {
  const router = useRouter();
  const productId = propProductId || (router.query.id as string);
  
  const [activeTab, setActiveTab] = useState('images');
  const [images, setImages] = useState<string[]>([]);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [isLocked, setIsLocked] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [currentImageType, setCurrentImageType] = useState<'main' | 'additional'>('main');
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [options, setOptions] = useState([
    { id: 1, code: 'V-1000-1', status: '판매중', stock: '30', location: 'A-01-01', barcode: '123456', dimensions: '10x10x10cm, 100g', lastModified: '2025.01.01' },
    { id: 2, code: 'V-1000-2', status: '판매중', stock: '20', location: 'A-01-02', barcode: '123457', dimensions: '10x10x10cm, 100g', lastModified: '2025.01.01' }
  ]);
  
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'additional') => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const imageUrls = fileArray.map(file => URL.createObjectURL(file));
      
      if (type === 'main') {
        setImages(prev => [...prev, ...imageUrls]);
      } else {
        setAdditionalImages(prev => [...prev, ...imageUrls]);
        // 추가 이미지가 등록되면 첫 번째 추가 이미지를 대표 이미지의 첫 번째로 이동
        if (imageUrls.length > 0 && images.length === 0) {
          setImages(prev => [imageUrls[0], ...prev]);
        }
      }
    }
  };

  const handleOpenUrlModal = (type: 'main' | 'additional') => {
    setCurrentImageType(type);
    setIsUrlModalOpen(true);
  };

  const handleUrlUpload = (imageUrl: string) => {
    if (currentImageType === 'main') {
      setImages(prev => [...prev, imageUrl]);
    } else {
      setAdditionalImages(prev => [...prev, imageUrl]);
    }
  };

  const handleImageRemove = (index: number, type: 'main' | 'additional') => {
    if (type === 'main') {
      setImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setAdditionalImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleLockToggle = () => {
    setIsLocked(!isLocked);
  };

  const handleDelete = () => {
    if (confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      console.log('상품 삭제:', productId);
      router.push('/products');
    }
  };

  const handleUpdateRegistrationDate = () => {
    const today = new Date().toISOString().split('T')[0];
    console.log('상품등록일자를 오늘로 갱신:', today);
    alert('상품등록일자가 오늘로 갱신되었습니다.');
  };

  const handleOptionAdd = () => {
    const newOption = {
      id: options.length + 1,
      code: `V-1000-${options.length + 1}`,
      status: '판매중',
      stock: '0',
      location: '',
      barcode: '',
      dimensions: '',
      lastModified: new Date().toLocaleDateString('ko-KR')
    };
    setOptions([...options, newOption]);
  };

  const handleOptionRemove = (id: number) => {
    setOptions(options.filter(option => option.id !== id));
  };

  const handleOptionChange = (id: number, field: string, value: string) => {
    setOptions(options.map(option => 
      option.id === id ? { ...option, [field]: value } : option
    ));
  };

  const handleOptionClick = (option: any) => {
    setSelectedOption(option);
    setIsOptionModalOpen(true);
  };

  const handleOptionSave = (updatedOption: any) => {
    setOptions(options.map(option => 
      option.id === updatedOption.id ? updatedOption : option
    ));
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
      {/* Image URL Modal */}
      <ImageUrlModal
        isOpen={isUrlModalOpen}
        onClose={() => setIsUrlModalOpen(false)}
        onUpload={handleUrlUpload}
      />

      {/* Option Detail Modal */}
      <OptionDetailModal
        isOpen={isOptionModalOpen}
        option={selectedOption}
        onClose={() => setIsOptionModalOpen(false)}
        onSave={handleOptionSave}
      />
      
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div>
            <button 
              onClick={() => router.back()}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
            ← 목록으로
            </button>
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
                <button 
                  onClick={handleLockToggle}
                  className={`px-4 py-2 border rounded-lg ${isLocked ? 'bg-red-600 text-white border-red-600' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  {isLocked ? '잠금해제' : '잠금'}
                </button>
                <button 
                  onClick={handleDelete}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  삭제
                </button>
                <button 
                  onClick={handleUpdateRegistrationDate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  상품등록일자 오늘로 갱신
                </button>
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
            {/* 이미지 섹션 */}
            <div 
              ref={(el) => { sectionRefs.current['images'] = el; }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">상품 이미지</h3>
              <div className="flex gap-6">
                {/* 대표 이미지 */}
                <div className="flex-shrink-0">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">대표 이미지 (1장)</h4>
                  <div className="w-64 aspect-square bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 relative">
                    {images[0] ? (
                      <>
                        <img 
                          src={images[0]} 
                          alt="대표 이미지"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleImageRemove(0, 'main')}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <label className="cursor-pointer flex flex-col items-center justify-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'main')}
                            className="hidden"
                          />
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs text-gray-500 mt-1">파일 선택</span>
                        </label>
                        <button
                          onClick={() => handleOpenUrlModal('main')}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          URL 입력
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 추가 이미지 */}
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">추가 이미지 (5장)</h4>
                  <div className="grid grid-cols-5 gap-3">
                    {[1, 2, 3, 4, 5].map((index) => (
                      <div key={index} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 relative">
                        {additionalImages[index - 1] ? (
                          <>
                            <img 
                              src={additionalImages[index - 1]} 
                              alt={`추가 이미지 ${index}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              onClick={() => handleImageRemove(index - 1, 'additional')}
                              className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </>
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                            <label className="cursor-pointer flex flex-col items-center justify-center">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(e, 'additional')}
                                className="hidden"
                              />
                              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              <span className="text-xs text-gray-500 mt-1">파일</span>
                            </label>
                            <button
                              onClick={() => handleOpenUrlModal('additional')}
                              className="text-xs text-blue-600 hover:text-blue-800 underline"
                            >
                              URL
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 상품명 섹션 */}
            <div 
              ref={(el) => { sectionRefs.current['name'] = el; }}
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
              ref={(el) => { sectionRefs.current['basic'] = el; }}
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
              ref={(el) => { sectionRefs.current['price'] = el; }}
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
              ref={(el) => { sectionRefs.current['options'] = el; }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
          <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">상품 옵션</h3>
                <button 
                  onClick={handleOptionAdd}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  옵션 추가
                </button>
          </div>
          <div className="overflow-x-auto">
                <table className="w-full border border-gray-200 rounded-lg">
              <thead className="bg-gray-50">
                <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">옵션명/코드</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">판매상태</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">재고</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">위치</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">바코드</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">규격·중량</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">최종수정일</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 border-b border-gray-200">작업</th>
                </tr>
              </thead>
              <tbody>
                    {options.map((option) => (
                      <tr 
                        key={option.id} 
                        className="hover:bg-blue-50 cursor-pointer transition-colors"
                        onClick={() => handleOptionClick(option)}
                      >
                        <td className="px-4 py-3 border-b border-gray-200">
                          <input
                            type="text"
                            value={option.code}
                            onChange={(e) => handleOptionChange(option.id, 'code', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="옵션 코드"
                          />
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          <select
                            value={option.status}
                            onChange={(e) => handleOptionChange(option.id, 'status', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="판매중">판매중</option>
                            <option value="품절">품절</option>
                            <option value="판매중지">판매중지</option>
                          </select>
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          <input
                            type="number"
                            value={option.stock}
                            onChange={(e) => handleOptionChange(option.id, 'stock', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="재고"
                          />
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          <input
                            type="text"
                            value={option.location}
                            onChange={(e) => handleOptionChange(option.id, 'location', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="위치"
                          />
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          <input
                            type="text"
                            value={option.barcode}
                            onChange={(e) => handleOptionChange(option.id, 'barcode', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="바코드"
                          />
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          <input
                            type="text"
                            value={option.dimensions}
                            onChange={(e) => handleOptionChange(option.id, 'dimensions', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="규격·중량"
                          />
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200 text-sm text-gray-600">
                          {option.lastModified}
                        </td>
                        <td className="px-4 py-3 border-b border-gray-200">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOptionRemove(option.id);
                            }}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            삭제
                          </button>
                        </td>
                      </tr>
                    ))}
                    {options.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                          옵션을 추가해주세요
                        </td>
                      </tr>
                    )}
              </tbody>
            </table>
          </div>
            </div>

            {/* 추가 이미지 섹션 */}
            <div 
              ref={(el) => { sectionRefs.current['additional-images'] = el; }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">추가 이미지</h3>
              <div className="grid grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((index) => (
                  <div key={index} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 relative">
                    {additionalImages[index - 1] ? (
                      <>
                        <img 
                          src={additionalImages[index - 1]} 
                          alt="추가 이미지"
                          className="w-full h-full object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleImageRemove(index - 1, 'additional')}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                        >
                          ×
                        </button>
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                        <label className="cursor-pointer flex flex-col items-center justify-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, 'additional')}
                            className="hidden"
                          />
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-xs text-gray-500 mt-1">파일 선택</span>
                        </label>
                        <button
                          onClick={() => handleOpenUrlModal('additional')}
                          className="text-xs text-blue-600 hover:text-blue-800 underline"
                        >
                          URL 입력
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 추가 속성 섹션 */}
            <div 
              ref={(el) => { sectionRefs.current['attributes'] = el; }}
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
              ref={(el) => { sectionRefs.current['dimensions'] = el; }}
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
              ref={(el) => { sectionRefs.current['tags'] = el; }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
            >
              <h3 className="text-lg font-semibold text-gray-900 mb-4">태그</h3>
                      <div>
                <input type="text" value={formData.tags} onChange={(e) => handleInputChange('tags', e.target.value)} className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="태그를 입력하세요" />
                        </div>
                      </div>

            {/* 상품 상세 설명 섹션 */}
            <div 
              ref={(el) => { sectionRefs.current['description'] = el; }}
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
