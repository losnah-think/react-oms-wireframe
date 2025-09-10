import React, { useState } from 'react';

const ProductDetailPage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  // Mock product data
  const mockProduct = {
    id: 'P001',
    name: '베이직 티셔츠',
    code: 'TS_BASIC_001',
    category: '상의 > 티셔츠',
    brand: 'Basic Brand',
    description: '편안하고 실용적인 베이직 티셔츠입니다.',
    price: 19900,
    originalPrice: 10000,
    supplierPrice: 15000,
    status: 'selling',
    images: ['/placeholder-1.jpg', '/placeholder-2.jpg'],
    variants: [
      { id: 'V001', name: '화이트 XS', price: 19900, stock: 15, barcode: '8801234567890' },
      { id: 'V002', name: '화이트 S', price: 19900, stock: 25, barcode: '8801234567891' },
      { id: 'V003', name: '화이트 M', price: 19900, stock: 30, barcode: '8801234567892' },
      { id: 'V004', name: '블랙 XS', price: 19900, stock: 20, barcode: '8801234567893' },
      { id: 'V005', name: '블랙 S', price: 19900, stock: 35, barcode: '8801234567894' },
      { id: 'V006', name: '블랙 M', price: 19900, stock: 25, barcode: '8801234567895' }
    ],
    modificationHistory: [
      { date: '2024-03-15', user: '김상품', action: '가격 변경', details: '19,900원 → 18,900원' },
      { date: '2024-03-10', user: '이관리', action: '재고 추가', details: '+50개 입고' },
      { date: '2024-03-01', user: '박등록', action: '상품 등록', details: '신규 상품 등록' }
    ]
  };

  const totalStock = mockProduct.variants.reduce((sum, variant) => sum + variant.stock, 0);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <button className="text-blue-600 hover:text-blue-800 text-sm mb-2">← 상품 목록으로 돌아가기</button>
          <h1 className="text-2xl font-bold text-gray-900">상품 상세정보</h1>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >
            {isEditing ? '취소' : '수정'}
          </button>
          <button className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50">
            바코드 라벨 출력
          </button>
          <button className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
            저장
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'basic', name: '기본 정보' },
            { id: 'variants', name: '옵션 관리' },
            { id: 'history', name: '수정 이력' }
          ].map((tab) => (
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

      {/* Basic Info Tab */}
      {activeTab === 'basic' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Product Images */}
          <div className="lg:col-span-1">
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-4">상품 이미지</h3>
              <div className="space-y-4">
                <div className="aspect-square bg-gray-100 border border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">메인 이미지</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="aspect-square bg-gray-100 border border-dashed border-gray-300 rounded flex items-center justify-center">
                      <span className="text-gray-400 text-xs">추가 {i}</span>
                    </div>
                  ))}
                </div>
                {isEditing && (
                  <button className="w-full py-2 text-sm text-blue-600 border border-blue-300 rounded hover:bg-blue-50">
                    이미지 업로드
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Product Details */}
          <div className="lg:col-span-2">
            <div className="bg-white border rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">상품 기본정보</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상품명</label>
                  {isEditing ? (
                    <input
                      type="text"
                      defaultValue={mockProduct.name}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{mockProduct.name}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">상품코드</label>
                  {isEditing ? (
                    <input
                      type="text"
                      defaultValue={mockProduct.code}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="text-sm text-gray-900 font-mono">{mockProduct.code}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                  {isEditing ? (
                    <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option>{mockProduct.category}</option>
                      <option>상의 &gt; 셔츠</option>
                      <option>하의 &gt; 팬츠</option>
                    </select>
                  ) : (
                    <div className="text-sm text-gray-900">{mockProduct.category}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">브랜드</label>
                  {isEditing ? (
                    <input
                      type="text"
                      defaultValue={mockProduct.brand}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">{mockProduct.brand}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">판매가</label>
                  {isEditing ? (
                    <input
                      type="number"
                      defaultValue={mockProduct.price}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">₩{mockProduct.price.toLocaleString()}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">원가</label>
                  {isEditing ? (
                    <input
                      type="number"
                      defaultValue={mockProduct.originalPrice}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">₩{mockProduct.originalPrice.toLocaleString()}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">공급가</label>
                  {isEditing ? (
                    <input
                      type="number"
                      defaultValue={mockProduct.supplierPrice}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="text-sm text-gray-900">₩{mockProduct.supplierPrice.toLocaleString()}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">판매상태</label>
                  {isEditing ? (
                    <select className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="selling">판매중</option>
                      <option value="out-of-stock">품절</option>
                      <option value="stopped">판매중지</option>
                    </select>
                  ) : (
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      mockProduct.status === 'selling' ? 'bg-green-100 text-green-800' :
                      mockProduct.status === 'out-of-stock' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {mockProduct.status === 'selling' ? '판매중' :
                       mockProduct.status === 'out-of-stock' ? '품절' : '판매중지'}
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">상품설명</label>
                {isEditing ? (
                  <textarea
                    rows={4}
                    defaultValue={mockProduct.description}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <div className="text-sm text-gray-900">{mockProduct.description}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Variants Tab */}
      {activeTab === 'variants' && (
        <div className="bg-white border rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">옵션 관리</h3>
              {isEditing && (
                <button className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">
                  옵션 추가
                </button>
              )}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              총 {mockProduct.variants.length}개 옵션 | 전체 재고: {totalStock}개
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">옵션명</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">판매가</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">재고</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">바코드</th>
                  {isEditing && <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">관리</th>}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockProduct.variants.map((variant) => (
                  <tr key={variant.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="text"
                          defaultValue={variant.name}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">{variant.name}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          defaultValue={variant.price}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="text-sm text-gray-900">₩{variant.price.toLocaleString()}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="number"
                          defaultValue={variant.stock}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <span className={`text-sm font-medium ${
                          variant.stock === 0 ? 'text-red-600' : 
                          variant.stock < 10 ? 'text-orange-600' : 'text-gray-900'
                        }`}>
                          {variant.stock}개
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          type="text"
                          defaultValue={variant.barcode}
                          className="w-full px-2 py-1 text-sm font-mono border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      ) : (
                        <div className="text-sm font-mono text-gray-600">{variant.barcode}</div>
                      )}
                    </td>
                    {isEditing && (
                      <td className="px-4 py-3">
                        <button className="text-sm text-red-600 hover:text-red-800">삭제</button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">수정 이력</h3>
          <div className="space-y-4">
            {mockProduct.modificationHistory.map((entry, index) => (
              <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-blue-600 text-xs font-medium">□</span>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{entry.action}</div>
                      <div className="text-sm text-gray-600 mt-1">{entry.details}</div>
                    </div>
                    <div className="text-xs text-gray-500 text-right">
                      <div>{entry.date}</div>
                      <div>{entry.user}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
