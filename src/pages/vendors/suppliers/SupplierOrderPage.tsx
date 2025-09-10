import React, { useState } from 'react';

interface Product {
  id: string;
  name: string;
  sku: string;
  supplierId: string;
  supplierName: string;
  currentStock: number;
  safetyStock: number;
  avgDailySales: number;
  leadTime: number;
  suggestedOrder: number;
  unitPrice: number;
  lastOrderDate?: string;
  category: string;
}

interface OrderItem extends Product {
  orderQuantity: number;
}

const SupplierOrderPage: React.FC = () => {
  const [selectedSupplier, setSelectedSupplier] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filterType, setFilterType] = useState<'all' | 'lowStock' | 'outOfStock' | 'suggested'>('suggested');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [isOrderModalOpen, setIsOrderModalOpen] = useState(false);

  const mockSuppliers = [
    { id: 'S001', name: '(주)글로벌공급사' },
    { id: 'S002', name: '한국제조' },
    { id: 'S003', name: '베스트파트너' },
    { id: 'S004', name: '프리미엄상사' }
  ];

  const mockCategories = [
    { id: 'C001', name: '전자제품' },
    { id: 'C002', name: '의류' },
    { id: 'C003', name: '생활용품' },
    { id: 'C004', name: '식품' }
  ];

  const mockProducts: Product[] = [
    {
      id: 'P001',
      name: '스마트폰 케이스',
      sku: 'SKU-001',
      supplierId: 'S001',
      supplierName: '(주)글로벌공급사',
      currentStock: 5,
      safetyStock: 20,
      avgDailySales: 3,
      leadTime: 5,
      suggestedOrder: 30,
      unitPrice: 15000,
      lastOrderDate: '2024-08-20',
      category: '전자제품'
    },
    {
      id: 'P002',
      name: '무선 이어폰',
      sku: 'SKU-002',
      supplierId: 'S001',
      supplierName: '(주)글로벌공급사',
      currentStock: 0,
      safetyStock: 15,
      avgDailySales: 2,
      leadTime: 7,
      suggestedOrder: 25,
      unitPrice: 45000,
      category: '전자제품'
    },
    {
      id: 'P003',
      name: '티셔츠',
      sku: 'SKU-003',
      supplierId: 'S002',
      supplierName: '한국제조',
      currentStock: 8,
      safetyStock: 30,
      avgDailySales: 4,
      leadTime: 3,
      suggestedOrder: 50,
      unitPrice: 25000,
      lastOrderDate: '2024-09-01',
      category: '의류'
    },
    {
      id: 'P004',
      name: '주방세제',
      sku: 'SKU-004',
      supplierId: 'S003',
      supplierName: '베스트파트너',
      currentStock: 12,
      safetyStock: 25,
      avgDailySales: 1,
      leadTime: 2,
      suggestedOrder: 20,
      unitPrice: 8000,
      category: '생활용품'
    },
    {
      id: 'P005',
      name: '유기농 쌀',
      sku: 'SKU-005',
      supplierId: 'S004',
      supplierName: '프리미엄상사',
      currentStock: 3,
      safetyStock: 50,
      avgDailySales: 5,
      leadTime: 1,
      suggestedOrder: 100,
      unitPrice: 35000,
      category: '식품'
    }
  ];

  const filteredProducts = mockProducts.filter(product => {
    const matchesSupplier = selectedSupplier === 'all' || product.supplierId === selectedSupplier;
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    
    let matchesFilter = true;
    switch (filterType) {
      case 'outOfStock':
        matchesFilter = product.currentStock === 0;
        break;
      case 'lowStock':
        matchesFilter = product.currentStock > 0 && product.currentStock < product.safetyStock;
        break;
      case 'suggested':
        matchesFilter = product.suggestedOrder > 0;
        break;
      case 'all':
      default:
        matchesFilter = true;
    }
    
    return matchesSupplier && matchesCategory && matchesFilter;
  });

  const handleAddToOrder = (product: Product) => {
    const existingItem = orderItems.find(item => item.id === product.id);
    if (existingItem) {
      setOrderItems(orderItems.map(item => 
        item.id === product.id 
          ? { ...item, orderQuantity: item.orderQuantity + product.suggestedOrder }
          : item
      ));
    } else {
      setOrderItems([...orderItems, { ...product, orderQuantity: product.suggestedOrder }]);
    }
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    setOrderItems(orderItems.map(item =>
      item.id === productId ? { ...item, orderQuantity: quantity } : item
    ));
  };

  const handleRemoveFromOrder = (productId: string) => {
    setOrderItems(orderItems.filter(item => item.id !== productId));
  };

  const handleCreateOrder = () => {
    if (orderItems.length === 0) {
      alert('발주할 상품을 선택해주세요.');
      return;
    }
    setIsOrderModalOpen(true);
  };

  const handleSubmitOrder = () => {
    alert('발주서가 생성되었습니다.');
    setOrderItems([]);
    setIsOrderModalOpen(false);
  };

  const getStockStatus = (product: Product) => {
    if (product.currentStock === 0) {
      return <span className="inline-flex px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">품절</span>;
    } else if (product.currentStock < product.safetyStock) {
      return <span className="inline-flex px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">부족</span>;
    } else {
      return <span className="inline-flex px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">충분</span>;
    }
  };

  const totalOrderAmount = orderItems.reduce((sum, item) => sum + (item.orderQuantity * item.unitPrice), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">발주하기</h1>
        <p className="text-gray-600">재고 현황을 확인하고 공급처에 발주서를 생성합니다.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 필터 및 상품 목록 */}
        <div className="lg:col-span-2">
          {/* 필터 */}
          <div className="bg-white border rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">공급처</label>
                <select
                  value={selectedSupplier}
                  onChange={(e) => setSelectedSupplier(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">전체 공급처</option>
                  {mockSuppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">전체 카테고리</option>
                  {mockCategories.map(category => (
                    <option key={category.id} value={category.name}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">재고 상태</label>
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">전체</option>
                  <option value="outOfStock">품절</option>
                  <option value="lowStock">재고부족</option>
                  <option value="suggested">발주권장</option>
                </select>
              </div>

              <div className="flex items-end">
                <span className="text-sm text-gray-500">
                  총 {filteredProducts.length}개 상품
                </span>
              </div>
            </div>
          </div>

          {/* 상품 목록 */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상품정보</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">재고현황</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">발주정보</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                          <div className="text-sm text-gray-500">{product.supplierName}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-sm">현재: {product.currentStock}개</span>
                            {getStockStatus(product)}
                          </div>
                          <div className="text-xs text-gray-500">안전재고: {product.safetyStock}개</div>
                          <div className="text-xs text-gray-500">일평균 판매: {product.avgDailySales}개</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">권장 발주: {product.suggestedOrder}개</div>
                          <div className="text-sm text-gray-600">단가: ₩{product.unitPrice.toLocaleString()}</div>
                          <div className="text-xs text-gray-500">리드타임: {product.leadTime}일</div>
                          {product.lastOrderDate && (
                            <div className="text-xs text-gray-500">최근발주: {product.lastOrderDate}</div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleAddToOrder(product)}
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          발주담기
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* 발주 목록 */}
        <div className="lg:col-span-1">
          <div className="bg-white border rounded-lg p-4 sticky top-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">발주 목록</h3>
              <span className="text-sm text-gray-500">{orderItems.length}개 상품</span>
            </div>

            {orderItems.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <div className="text-4xl mb-2">📦</div>
                <p>발주할 상품을 선택해주세요</p>
              </div>
            ) : (
              <>
                <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                  {orderItems.map((item) => (
                    <div key={item.id} className="border border-gray-200 rounded p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div className="text-sm font-medium text-gray-900 flex-1">{item.name}</div>
                        <button
                          onClick={() => handleRemoveFromOrder(item.id)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          ✕
                        </button>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">{item.supplierName}</div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={item.orderQuantity}
                          onChange={(e) => handleUpdateQuantity(item.id, parseInt(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          min="1"
                        />
                        <span className="text-xs text-gray-500">개</span>
                      </div>
                      <div className="text-sm font-medium mt-1">
                        ₩{(item.orderQuantity * item.unitPrice).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-medium">총 발주금액</span>
                    <span className="text-lg font-bold text-blue-600">
                      ₩{totalOrderAmount.toLocaleString()}
                    </span>
                  </div>
                  <button
                    onClick={handleCreateOrder}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                  >
                    발주서 생성
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 발주서 생성 모달 */}
      {isOrderModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">발주서 생성</h2>
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* 발주 정보 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    발주 예정일
                  </label>
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    입고 희망일
                  </label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  발주 메모
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="발주 관련 특이사항이나 요청사항을 입력하세요..."
                />
              </div>

              {/* 발주 상품 목록 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">발주 상품 목록</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">상품명</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">공급처</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">수량</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">단가</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">금액</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {orderItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.name}</td>
                          <td className="px-4 py-2 text-sm text-gray-500">{item.supplierName}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{item.orderQuantity}개</td>
                          <td className="px-4 py-2 text-sm text-gray-900">₩{item.unitPrice.toLocaleString()}</td>
                          <td className="px-4 py-2 text-sm font-medium text-gray-900">
                            ₩{(item.orderQuantity * item.unitPrice).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={4} className="px-4 py-2 text-sm font-medium text-gray-900 text-right">
                          총 발주금액:
                        </td>
                        <td className="px-4 py-2 text-sm font-bold text-blue-600">
                          ₩{totalOrderAmount.toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setIsOrderModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSubmitOrder}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                발주서 생성
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierOrderPage;
