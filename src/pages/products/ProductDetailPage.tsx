import React, { useState, useMemo } from 'react';
import { Container, Card, Button, Badge, Stack } from '../../design-system';
import { mockProducts, ProductWithVariants } from '../../data/mockProducts';
import { formatDate, formatPrice, getStockStatus } from '../../utils/productUtils';
import { ProductVariant } from '../../types/database';

interface ProductDetailPageProps {
  productId?: string;
  onNavigate?: (page: string) => void;
}

const ProductDetailPage: React.FC<ProductDetailPageProps> = ({ 
  productId: propProductId,
  onNavigate 
}) => {
  const productId = propProductId || '1'; // 기본값 설정
  
  const [activeTab, setActiveTab] = useState<'info' | 'variants' | 'images' | 'history'>('info');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // 상품 데이터 찾기
  const product = useMemo(() => {
    return mockProducts.find(p => p.id === productId);
  }, [productId]);

  const handleBack = () => {
    if (onNavigate) {
      onNavigate('products');
    }
  };

  const handleEdit = () => {
    if (onNavigate) {
      onNavigate('product-edit');
    }
  };

  if (!product) {
    return (
      <div className="p-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">상품을 찾을 수 없습니다</h2>
          <p className="text-gray-600 mb-6">요청하신 상품이 존재하지 않거나 삭제되었습니다.</p>
          <button
            onClick={handleBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            상품 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← 목록으로
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{product.productName}</h1>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            product.isSelling ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {product.isSelling ? '판매중' : '판매중지'}
          </div>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleEdit}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            수정
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition-colors">
            외부 송신
          </button>
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors">
            삭제
          </button>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { id: 'info', label: '기본 정보' },
              { id: 'variants', label: `옵션/변형 (${product.variants?.length || 0})` },
              { id: 'images', label: '이미지' },
              { id: 'history', label: '변경 이력' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* 탭 내용 */}
        <div className="p-6">
          {activeTab === 'info' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 기본 정보 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">기본 정보</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">상품명</label>
                    <p className="mt-1 text-sm text-gray-900">{product.productName}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">영문명</label>
                    <p className="mt-1 text-sm text-gray-900">{product.englishProductName || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">상품 코드</label>
                    <p className="mt-1 text-sm text-gray-900">{product.productCode}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">카테고리</label>
                    <p className="mt-1 text-sm text-gray-900">{product.productCategory}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">브랜드</label>
                    <p className="mt-1 text-sm text-gray-900">{product.brandId || '-'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">원산지</label>
                    <p className="mt-1 text-sm text-gray-900">{product.origin || '-'}</p>
                  </div>
                </div>
              </div>

              {/* 가격 및 재고 정보 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">가격 및 재고</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">판매가</label>
                    <p className="mt-1 text-lg font-semibold text-green-600">
                      {formatPrice(product.representativeSellingPrice)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">공급가</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {product.representativeSupplyPrice ? formatPrice(product.representativeSupplyPrice) : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">원가</label>
                    <p className="mt-1 text-sm text-gray-900">{formatPrice(product.originalCost)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">재고 수량</label>
                    <div className="flex items-center space-x-2">
                      <p className="mt-1 text-lg font-semibold text-gray-900">{product.stock.toLocaleString()}개</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatus(product.stock, product.safeStock || 0).class}`}>
                        {getStockStatus(product.stock, product.safeStock || 0).text}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">안전 재고</label>
                    <p className="mt-1 text-sm text-gray-900">{(product.safeStock || 0).toLocaleString()}개</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'variants' && (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">상품 옵션/변형</h3>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
                  옵션 추가
                </button>
              </div>
              
              {product.variants && product.variants.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">옵션명</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">재고</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">판매가</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">공급가</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">원가</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">상태</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">관리</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {product.variants.map((variant, index) => (
                        <tr key={variant.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{variant.variantName}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div className="flex items-center space-x-2">
                              <span>{variant.stock.toLocaleString()}개</span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatus(variant.stock, variant.safeStock).class}`}>
                                {getStockStatus(variant.stock, variant.safeStock).text}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatPrice(variant.sellingPrice)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatPrice(variant.supplyPrice)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900">{formatPrice(variant.costPrice)}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              variant.isSelling ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {variant.isSelling ? '판매중' : '판매중지'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm font-medium">
                            <button
                              onClick={() => setSelectedVariant(variant)}
                              className="text-blue-600 hover:text-blue-800 mr-3"
                            >
                              수정
                            </button>
                            <button className="text-red-600 hover:text-red-800">
                              삭제
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>등록된 옵션이 없습니다.</p>
                  <button className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm transition-colors">
                    첫 번째 옵션 추가
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'images' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">상품 이미지</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {product.representativeImage && (
                  <div className="relative">
                    <img
                      src={product.representativeImage}
                      alt="대표 이미지"
                      className="w-full h-32 object-cover rounded-lg border-2 border-blue-500"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop';
                      }}
                    />
                    <span className="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                      대표
                    </span>
                  </div>
                )}
                {product.descriptionImages?.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image}
                      alt={`상품 이미지 ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.png';
                      }}
                    />
                  </div>
                ))}
                <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors">
                  <div className="text-center">
                    <p className="text-gray-500 text-sm">+ 이미지 추가</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">변경 이력</h3>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">상품 등록</p>
                      <p className="text-sm text-gray-600">{formatDate(product.createdAt)}</p>
                    </div>
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      생성
                    </span>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">정보 수정</p>
                      <p className="text-sm text-gray-600">{formatDate(product.updatedAt)}</p>
                    </div>
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      수정
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
