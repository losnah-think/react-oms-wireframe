// src/features/products/individual-registration.tsx
import React, { useState } from 'react';
import { Container, Card, Button, Input } from '../../design-system';
import { useRouter } from 'next/router';
import ImageUrlModal from '../../components/products/ImageUrlModal';

const IndividualRegistrationPage: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    productName: '',
    brand: '',
    category: '',
    productCode: '',
    costPrice: '',
    sellingPrice: '',
    consumerPrice: '',
    description: '',
    images: [] as string[]
  });

  const [loading, setLoading] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);

  // 사용자의 기본 분류 불러오기 (localStorage 사용)
  React.useEffect(() => {
    const loadDefaultClassification = () => {
      try {
        const saved = localStorage.getItem("defaultProductClassification");
        if (saved) {
          setFormData(prev => ({
            ...prev,
            category: saved
          }));
        }
      } catch (error) {
        console.error("기본 분류 불러오기 실패:", error);
      }
    };
    loadDefaultClassification();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      const imageUrls = fileArray.map(file => URL.createObjectURL(file));
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));
    }
  };

  const handleImageRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleUrlUpload = (imageUrl: string) => {
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, imageUrl]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 실제로는 API 호출
      console.log('상품 등록 데이터:', formData);
      
      // 성공 시 상품 목록으로 이동
      router.push('/products');
    } catch (error) {
      console.error('상품 등록 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  return (
    <Container>
      <div className="py-8">
        {/* Image URL Modal */}
        <ImageUrlModal
          isOpen={isUrlModalOpen}
          onClose={() => setIsUrlModalOpen(false)}
          onUpload={handleUrlUpload}
        />

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            개별 상품 등록
          </h1>
          <p className="text-gray-600">
            상품 개별 등록
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 이미지 섹션 */}
          <Card padding="lg" className="mb-8">
            <h2 className="text-xl font-semibold mb-6">상품 이미지</h2>
            
            <div className="flex gap-6">
              {/* 대표 이미지 */}
              <div className="flex-shrink-0">
                <h3 className="text-sm font-medium text-gray-700 mb-3">대표 이미지 (1장)</h3>
                <div className="w-64 aspect-square bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 relative">
                  {formData.images[0] ? (
                    <>
                      <img 
                        src={formData.images[0]} 
                        alt="대표 이미지"
                        className="w-full h-full object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => handleImageRemove(0)}
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
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-xs text-gray-500 mt-1">파일 선택</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsUrlModalOpen(true)}
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
                <h3 className="text-sm font-medium text-gray-700 mb-3">추가 이미지 (5장)</h3>
                <div className="grid grid-cols-5 gap-3">
                  {[1, 2, 3, 4, 5].map((index) => (
                    <div key={index} className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300 relative">
                      {formData.images[index] ? (
                        <>
                          <img 
                            src={formData.images[index]} 
                            alt={`추가 이미지 ${index}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => handleImageRemove(index)}
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
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span className="text-xs text-gray-500 mt-1">파일</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => setIsUrlModalOpen(true)}
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
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 기본 정보 */}
            <Card padding="lg">
              <h2 className="text-xl font-semibold mb-6">기본 정보</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상품명 *
                  </label>
                  <Input
                    type="text"
                    value={formData.productName}
                    onChange={(e) => handleInputChange('productName', e.target.value)}
                    placeholder="상품명을 입력하세요"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    브랜드
                  </label>
                  <Input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => handleInputChange('brand', e.target.value)}
                    placeholder="브랜드명을 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    카테고리
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">카테고리를 선택하세요</option>
                    <option value="clothing">의류</option>
                    <option value="shoes">신발</option>
                    <option value="accessories">액세서리</option>
                    <option value="bags">가방</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    상품코드
                  </label>
                  <Input
                    type="text"
                    value={formData.productCode}
                    onChange={(e) => handleInputChange('productCode', e.target.value)}
                    placeholder="상품코드를 입력하세요"
                  />
                </div>
              </div>
            </Card>

            {/* 가격 정보 */}
            <Card padding="lg">
              <h2 className="text-xl font-semibold mb-6">가격 정보</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    원가
                  </label>
                  <Input
                    type="number"
                    value={formData.costPrice}
                    onChange={(e) => handleInputChange('costPrice', e.target.value)}
                    placeholder="원가를 입력하세요"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    판매가 *
                  </label>
                  <Input
                    type="number"
                    value={formData.sellingPrice}
                    onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                    placeholder="판매가를 입력하세요"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    소비자가
                  </label>
                  <Input
                    type="number"
                    value={formData.consumerPrice}
                    onChange={(e) => handleInputChange('consumerPrice', e.target.value)}
                    placeholder="소비자가를 입력하세요"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* 상품 설명 */}
          <Card padding="lg" className="mt-8">
            <h2 className="text-xl font-semibold mb-6">상품 설명</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                상품 설명
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="상품에 대한 자세한 설명을 입력하세요"
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </Card>

          {/* 버튼 */}
          <div className="flex justify-end gap-4 mt-8">
            <Button
              type="button"
              variant="ghost"
              onClick={handleCancel}
              disabled={loading}
            >
              취소
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? '등록 중...' : '상품 등록'}
            </Button>
          </div>
        </form>
      </div>
    </Container>
  );
};

export default IndividualRegistrationPage;
