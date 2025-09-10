import React, { useState, useRef } from 'react';

interface ProductVariant {
  id: number;
  productId: number;
  variantName: string;
  safeStock: number;
  stock: number;
  costPrice: number;
  sellingPrice: number;
  supplyPrice: number;
  location?: string;
  isSelling: boolean;
  isSoldout: boolean;
  code?: string;
  barcode1?: string;
  barcode2?: string;
  barcode3?: string;
  linkCode?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductDetail {
  id: number;
  name: string;
  code?: string;
  brandName?: string;
  sellingPrice: number;
  supplyPrice: number;
  costPrice: number;
  largeCategoryNo?: number;
  mediumCategoryNo?: number;
  smallCategoryNo?: number;
  origin?: string;
  description?: string;
  summaryDescription?: string;
  supplierId?: number;
  categoryId?: number;
  isDutyfree?: boolean;
  isTaxfree?: boolean;
  retailPrice?: number;
  priceMargin?: number;
  cafe24Code?: string;
  hscode?: string;
  saleStatus: string;
  manufacturerName?: string;
  model?: string;
  publicationDate?: string;
  createdAt: string;
  updatedAt: string;
  variants: ProductVariant[];
}

interface ProductDetailPageProps {
  onNavigateToList?: () => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ onNavigateToList }) => {
  const [selectedVariants, setSelectedVariants] = useState<number[]>([]);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [description, setDescription] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const editorRef = useRef<HTMLTextAreaElement>(null);

  // Mock data - 실제 DDL 스키마 기반
  const mockProduct: ProductDetail = {
    id: 1001,
    name: '삼성 갤럭시 S24 Ultra',
    code: 'SAMSUNG-S24U-001',
    brandName: '삼성전자',
    sellingPrice: 1299000,
    supplyPrice: 1170000,
    costPrice: 1100000,
    retailPrice: 1399000,
    priceMargin: 129000,
    largeCategoryNo: 1,
    mediumCategoryNo: 11,
    smallCategoryNo: 111,
    origin: '한국',
    description: '<h2>삼성 갤럭시 S24 Ultra</h2><p>최신 플래그십 스마트폰입니다. <strong>200MP 카메라</strong>, S펜 내장, 5000mAh 배터리를 탑재한 프리미엄 모델입니다.</p><ul><li>AI 카메라 기능으로 완벽한 사진 촬영</li><li>S펜으로 정확한 필기와 그림 그리기</li><li>강력한 성능으로 멀티태스킹 완벽 지원</li></ul><p><em>갤럭시 시리즈의 최고급 모델로 모든 기능이 완벽하게 통합되었습니다.</em></p>',
    summaryDescription: '프리미엄 갤럭시 시리즈 최신 모델',
    supplierId: 1,
    categoryId: 101,
    isDutyfree: false,
    isTaxfree: false,
    cafe24Code: 'C24-001',
    hscode: '851712',
    saleStatus: 'selling',
    manufacturerName: '삼성전자',
    model: 'SM-S928N',
    createdAt: '2025-01-15T09:00:00Z',
    updatedAt: '2025-01-20T14:30:00Z',
    publicationDate: '2025-01-15T09:00:00Z',
    variants: [
      {
        id: 10001,
        productId: 1001,
        variantName: '티타늄 그레이 256GB',
        safeStock: 5,
        stock: 25,
        costPrice: 1100000,
        sellingPrice: 1299000,
        supplyPrice: 1170000,
        location: 'A-01-001',
        isSelling: true,
        isSoldout: false,
        code: 'S24U-TG-256',
        barcode1: '8806095144631',
        barcode2: 'FULGO240001',
        active: true,
        createdAt: '2025-01-15T09:00:00Z',
        updatedAt: '2025-01-20T14:30:00Z'
      },
      {
        id: 10002,
        productId: 1001,
        variantName: '티타늄 바이올렛 512GB',
        safeStock: 3,
        stock: 12,
        costPrice: 1200000,
        sellingPrice: 1599000,
        supplyPrice: 1440000,
        location: 'A-01-002',
        isSelling: true,
        isSoldout: false,
        code: 'S24U-TV-512',
        barcode1: '8806095144648',
        barcode2: 'FULGO240002',
        active: true,
        createdAt: '2025-01-15T09:00:00Z',
        updatedAt: '2025-01-20T14:30:00Z'
      },
      {
        id: 10003,
        productId: 1001,
        variantName: '티타늄 블랙 1TB',
        safeStock: 2,
        stock: 8,
        costPrice: 1400000,
        sellingPrice: 1899000,
        supplyPrice: 1710000,
        location: 'A-01-003',
        isSelling: true,
        isSoldout: false,
        code: 'S24U-TB-1TB',
        barcode1: '8806095144655',
        barcode2: 'FULGO240003',
        active: true,
        createdAt: '2025-01-15T09:00:00Z',
        updatedAt: '2025-01-20T14:30:00Z'
      }
    ]
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'selling':
        return <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded-full">판매중</span>;
      case 'soldout':
        return <span className="px-3 py-1 text-sm bg-red-100 text-red-800 rounded-full">품절</span>;
      case 'discontinued':
        return <span className="px-3 py-1 text-sm bg-gray-100 text-gray-800 rounded-full">단종</span>;
      default:
        return null;
    }
  };

  const getCategoryName = (product: ProductDetail) => {
    if (product.largeCategoryNo === 1) return '전자제품 > 스마트폰 > 안드로이드';
    if (product.largeCategoryNo === 2) return '가전제품';
    if (product.largeCategoryNo === 3) return '의류/신발';
    if (product.largeCategoryNo === 4) return '화장품/뷰티';
    if (product.largeCategoryNo === 5) return '식품/생활용품';
    return '기타';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ko-KR');
  };

  const handleVariantSelect = (variantId: number) => {
    setSelectedVariants(prev => 
      prev.includes(variantId) 
        ? prev.filter(id => id !== variantId)
        : [...prev, variantId]
    );
  };

  const handleSelectAllVariants = () => {
    if (selectedVariants.length === mockProduct.variants.length) {
      setSelectedVariants([]);
    } else {
      setSelectedVariants(mockProduct.variants.map(v => v.id));
    }
  };

  const handleEditDescription = () => {
    setDescription(mockProduct.description || '');
    setIsEditingDescription(true);
    setShowPreview(false);
  };

  const handleSaveDescription = () => {
    // 여기서 실제로는 API 호출로 저장
    console.log('Description saved:', description);
    setIsEditingDescription(false);
    setShowPreview(false);
  };

  const handleCancelEdit = () => {
    setIsEditingDescription(false);
    setShowPreview(false);
    setDescription('');
  };

  const insertHtmlTag = (tag: string) => {
    if (!editorRef.current) return;
    
    const textarea = editorRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let newText = '';
    switch (tag) {
      case 'h2':
        newText = `<h2>${selectedText || '제목'}</h2>`;
        break;
      case 'p':
        newText = `<p>${selectedText || '텍스트'}</p>`;
        break;
      case 'strong':
        newText = `<strong>${selectedText || '굵은 텍스트'}</strong>`;
        break;
      case 'em':
        newText = `<em>${selectedText || '기울임 텍스트'}</em>`;
        break;
      case 'ul':
        newText = `<ul>\n  <li>${selectedText || '목록 항목 1'}</li>\n  <li>목록 항목 2</li>\n</ul>`;
        break;
      case 'ol':
        newText = `<ol>\n  <li>${selectedText || '번호 목록 1'}</li>\n  <li>번호 목록 2</li>\n</ol>`;
        break;
      case 'br':
        newText = '<br>';
        break;
    }
    
    const newValue = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
    setDescription(newValue);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + newText.length, start + newText.length);
    }, 0);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <div className="mb-4">
        <button 
          onClick={() => onNavigateToList ? onNavigateToList() : window.history.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          상품 목록으로 돌아가기
        </button>
      </div>

      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{mockProduct.name}</h1>
            {getStatusBadge(mockProduct.saleStatus)}
          </div>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span>상품코드: {mockProduct.code}</span>
            <span>•</span>
            <span>브랜드: {mockProduct.brandName}</span>
            <span>•</span>
            <span>카테고리: {getCategoryName(mockProduct)}</span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50">
            이력 조회
          </button>
          <button className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded hover:bg-red-50">
            삭제
          </button>
          <button className="px-4 py-2 text-sm text-white bg-blue-500 rounded hover:bg-blue-600">
            수정
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Images */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">상품 이미지</h2>
            
            {/* Main Image */}
            <div className="mb-4">
              <div className="w-full aspect-square bg-gray-100 rounded-lg border flex items-center justify-center">
                <span className="text-gray-400">상품 이미지</span>
              </div>
            </div>
            
            {/* Thumbnail Images */}
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <div 
                  key={index}
                  className="aspect-square bg-gray-100 rounded border cursor-pointer hover:opacity-75 flex items-center justify-center"
                >
                  <span className="text-gray-400 text-xs">이미지 {index}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">기본 정보</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상품명</label>
                  <p className="text-gray-900">{mockProduct.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상품코드</label>
                  <p className="text-gray-900 font-mono">{mockProduct.code}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">브랜드</label>
                  <p className="text-gray-900">{mockProduct.brandName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                  <p className="text-gray-900">{getCategoryName(mockProduct)}</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">원산지</label>
                  <p className="text-gray-900">{mockProduct.origin}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">제조사</label>
                  <p className="text-gray-900">{mockProduct.manufacturerName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">HS Code</label>
                  <p className="text-gray-900 font-mono">{mockProduct.hscode}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
                  {getStatusBadge(mockProduct.saleStatus)}
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-gray-700">상품 설명</label>
                {!isEditingDescription ? (
                  <button
                    onClick={handleEditDescription}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    □ 수정
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowPreview(!showPreview)}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      {showPreview ? '□ 에디터' : '□ 미리보기'}
                    </button>
                    <button
                      onClick={handleSaveDescription}
                      className="text-sm text-green-600 hover:text-green-800"
                    >
                      □ 저장
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      □ 취소
                    </button>
                  </div>
                )}
              </div>

              {!isEditingDescription ? (
                <div 
                  className="text-gray-700 bg-gray-50 p-3 rounded prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: mockProduct.description || '' }}
                />
              ) : (
                <div className="border rounded-lg">
                  {!showPreview ? (
                    <div>
                      {/* HTML Editor Toolbar */}
                      <div className="flex flex-wrap gap-2 p-3 bg-gray-50 border-b">
                        <button
                          onClick={() => insertHtmlTag('h2')}
                          className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-100"
                          title="제목"
                        >
                          H2
                        </button>
                        <button
                          onClick={() => insertHtmlTag('p')}
                          className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-100"
                          title="단락"
                        >
                          P
                        </button>
                        <button
                          onClick={() => insertHtmlTag('strong')}
                          className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-100 font-bold"
                          title="굵게"
                        >
                          B
                        </button>
                        <button
                          onClick={() => insertHtmlTag('em')}
                          className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-100 italic"
                          title="기울임"
                        >
                          I
                        </button>
                        <button
                          onClick={() => insertHtmlTag('ul')}
                          className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-100"
                          title="목록"
                        >
                          UL
                        </button>
                        <button
                          onClick={() => insertHtmlTag('ol')}
                          className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-100"
                          title="번호 목록"
                        >
                          OL
                        </button>
                        <button
                          onClick={() => insertHtmlTag('br')}
                          className="px-3 py-1 text-sm bg-white border rounded hover:bg-gray-100"
                          title="줄바꿈"
                        >
                          BR
                        </button>
                      </div>

                      {/* HTML Editor */}
                      <textarea
                        ref={editorRef}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full h-64 p-3 font-mono text-sm border-none resize-none focus:outline-none"
                        placeholder="HTML 코드를 입력하세요..."
                      />
                    </div>
                  ) : (
                    <div className="p-4">
                      <div className="mb-2 text-sm text-gray-600 font-medium">미리보기:</div>
                      <div 
                        className="prose max-w-none bg-white p-4 border rounded"
                        dangerouslySetInnerHTML={{ __html: description }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Price Information */}
          <div className="bg-white border rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">가격 정보</h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">판매가</label>
                <p className="text-2xl font-bold text-blue-600">₩{mockProduct.sellingPrice.toLocaleString()}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">공급가</label>
                <p className="text-xl font-semibold text-gray-900">₩{mockProduct.supplyPrice.toLocaleString()}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">원가</label>
                <p className="text-xl font-semibold text-gray-700">₩{mockProduct.costPrice.toLocaleString()}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">마진</label>
                <p className="text-xl font-semibold text-green-600">₩{(mockProduct.priceMargin || (mockProduct.sellingPrice - mockProduct.costPrice)).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">소매가</label>
                <p className="text-lg text-gray-600">₩{mockProduct.retailPrice?.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Variants Section */}
      <div className="mt-8 bg-white border rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">옵션(Variant) 관리</h2>
          <div className="flex gap-2">
            {selectedVariants.length > 0 && (
              <button className="px-3 py-2 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50">
                선택된 옵션 라벨 출력 ({selectedVariants.length})
              </button>
            )}
            <button className="px-3 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
              옵션 추가
            </button>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={selectedVariants.length === mockProduct.variants.length}
              onChange={handleSelectAllVariants}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label className="text-sm text-gray-700">전체 선택</label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">선택</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">옵션명</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">옵션코드</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">재고 수량</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">개별 가격</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">바코드</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockProduct.variants.map((variant) => (
                <tr key={variant.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedVariants.includes(variant.id)}
                      onChange={() => handleVariantSelect(variant.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">{variant.variantName}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-600 font-mono">{variant.code}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className={`text-sm font-medium ${variant.stock > 5 ? 'text-green-600' : variant.stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {variant.stock}개
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">₩{variant.sellingPrice.toLocaleString()}</div>
                  </td>
                  <td className="px-4 py-3">
                    {variant.barcode1 ? (
                      <div className="text-sm font-mono text-blue-600">{variant.barcode1}</div>
                    ) : (
                      <div className="text-sm text-gray-400">없음</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button className="text-xs text-blue-500 hover:text-blue-700 border border-blue-300 px-2 py-1 rounded">
                        바코드 관리
                      </button>
                      <button className="text-xs text-gray-500 hover:text-gray-700 border border-gray-300 px-2 py-1 rounded">
                        수정
                      </button>
                      <button className="text-xs text-red-500 hover:text-red-700 border border-red-300 px-2 py-1 rounded">
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modification History */}
      <div className="mt-8 bg-white border rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">수정 이력</h2>
        
        <div className="text-sm text-gray-600 space-y-2">
          <div className="flex justify-between items-center py-2 border-b">
            <div>
              <span className="font-medium">등록일:</span> {formatDate(mockProduct.createdAt)}
            </div>
            <div>등록자: 관리자</div>
          </div>
          <div className="flex justify-between items-center py-2 border-b">
            <div>
              <span className="font-medium">최종 수정일:</span> {formatDate(mockProduct.updatedAt)}
            </div>
            <div>수정자: 관리자</div>
          </div>
          {mockProduct.publicationDate && (
            <div className="flex justify-between items-center py-2 border-b">
              <div>
                <span className="font-medium">출시일:</span> {formatDate(mockProduct.publicationDate)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
