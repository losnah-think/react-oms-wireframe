import React, { useState } from "react";

interface ExpectedDelivery {
  id: string;
  orderSlipId: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  expectedDeliveryDate: string;
  status: "pending" | "partial" | "completed" | "overdue";
  totalOrderedQuantity: number;
  totalReceivedQuantity: number;
  remainingQuantity: number;
  productCount: number;
  estimatedAmount: number;
  receivedAmount: number;
  trackingNumber?: string;
  deliveryCompany?: string;
  actualDeliveryDate?: string;
  memo?: string;
}

interface ExpectedDeliveryItem {
  id: string;
  expectedDeliveryId: string;
  productId: string;
  productName: string;
  sku: string;
  orderedQuantity: number;
  receivedQuantity: number;
  remainingQuantity: number;
  unitPrice: number;
  expiryDate?: string;
  lotNumber?: string;
  receivedDate?: string;
}

const ExpectedDeliveryListPage: React.FC = () => {
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedSupplier, setSelectedSupplier] = useState("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDelivery, setSelectedDelivery] =
    useState<ExpectedDelivery | null>(null);
  const [isReceiveModalOpen, setIsReceiveModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [receiveItems, setReceiveItems] = useState<ExpectedDeliveryItem[]>([]);

  const mockSuppliers = [
    { id: "S001", name: "(주)글로벌공급사" },
    { id: "S002", name: "한국제조" },
    { id: "S003", name: "베스트파트너" },
    { id: "S004", name: "프리미엄상사" },
  ];

  const mockExpectedDeliveries: ExpectedDelivery[] = [
    {
      id: "ED001",
      orderSlipId: "OS001",
      orderNumber: "PO-2024-001",
      supplierId: "S001",
      supplierName: "(주)글로벌공급사",
      orderDate: "2024-09-15",
      expectedDeliveryDate: "2024-09-25",
      status: "pending",
      totalOrderedQuantity: 85,
      totalReceivedQuantity: 0,
      remainingQuantity: 85,
      productCount: 5,
      estimatedAmount: 1350000,
      receivedAmount: 0,
      trackingNumber: "TK20240925001",
      deliveryCompany: "CJ대한통운",
      memo: "긴급 발주 - 빠른 배송 요청",
    },
    {
      id: "ED002",
      orderSlipId: "OS002",
      orderNumber: "PO-2024-002",
      supplierId: "S002",
      supplierName: "한국제조",
      orderDate: "2024-09-18",
      expectedDeliveryDate: "2024-09-26",
      status: "partial",
      totalOrderedQuantity: 35,
      totalReceivedQuantity: 20,
      remainingQuantity: 15,
      productCount: 3,
      estimatedAmount: 850000,
      receivedAmount: 500000,
      actualDeliveryDate: "2024-09-24",
    },
    {
      id: "ED003",
      orderSlipId: "OS003",
      orderNumber: "PO-2024-003",
      supplierId: "S001",
      supplierName: "(주)글로벌공급사",
      orderDate: "2024-09-20",
      expectedDeliveryDate: "2024-09-22",
      status: "overdue",
      totalOrderedQuantity: 120,
      totalReceivedQuantity: 0,
      remainingQuantity: 120,
      productCount: 7,
      estimatedAmount: 2150000,
      receivedAmount: 0,
    },
    {
      id: "ED004",
      orderSlipId: "OS004",
      orderNumber: "PO-2024-004",
      supplierId: "S003",
      supplierName: "베스트파트너",
      orderDate: "2024-09-22",
      expectedDeliveryDate: "2024-09-29",
      status: "completed",
      totalOrderedQuantity: 25,
      totalReceivedQuantity: 25,
      remainingQuantity: 0,
      productCount: 2,
      estimatedAmount: 420000,
      receivedAmount: 420000,
      actualDeliveryDate: "2024-09-27",
    },
  ];

  const mockExpectedDeliveryItems: ExpectedDeliveryItem[] = [
    {
      id: "EDI001",
      expectedDeliveryId: "ED001",
      productId: "P001",
      productName: "스마트폰 케이스",
      sku: "SKU-001",
      orderedQuantity: 50,
      receivedQuantity: 0,
      remainingQuantity: 50,
      unitPrice: 15000,
    },
    {
      id: "EDI002",
      expectedDeliveryId: "ED001",
      productId: "P002",
      productName: "무선 이어폰",
      sku: "SKU-002",
      orderedQuantity: 35,
      receivedQuantity: 0,
      remainingQuantity: 35,
      unitPrice: 45000,
    },
    {
      id: "EDI003",
      expectedDeliveryId: "ED002",
      productId: "P003",
      productName: "티셔츠",
      sku: "SKU-003",
      orderedQuantity: 35,
      receivedQuantity: 20,
      remainingQuantity: 15,
      unitPrice: 25000,
      receivedDate: "2024-09-24",
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "입고대기", color: "bg-blue-100 text-blue-800" },
      partial: { label: "부분입고", color: "bg-yellow-100 text-yellow-800" },
      completed: { label: "입고완료", color: "bg-green-100 text-green-800" },
      overdue: { label: "지연", color: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span
        className={`inline-flex px-2 py-1 text-xs rounded-full ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  const getProgressPercentage = (received: number, total: number) => {
    return total > 0 ? Math.round((received / total) * 100) : 0;
  };

  const isOverdue = (expectedDate: string) => {
    return (
      new Date(expectedDate) < new Date() &&
      new Date().toDateString() !== new Date(expectedDate).toDateString()
    );
  };

  const filteredDeliveries = mockExpectedDeliveries.filter((delivery) => {
    const matchesStatus =
      selectedStatus === "all" || delivery.status === selectedStatus;
    const matchesSupplier =
      selectedSupplier === "all" || delivery.supplierId === selectedSupplier;
    const matchesSearch =
      searchTerm === "" ||
      delivery.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (delivery.trackingNumber &&
        delivery.trackingNumber
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    let matchesDateRange = true;
    if (dateRange.start && dateRange.end) {
      const deliveryDate = new Date(delivery.expectedDeliveryDate);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      matchesDateRange = deliveryDate >= startDate && deliveryDate <= endDate;
    }

    return (
      matchesStatus && matchesSupplier && matchesSearch && matchesDateRange
    );
  });

  const handleReceiveStock = (delivery: ExpectedDelivery) => {
    setSelectedDelivery(delivery);
    const items = mockExpectedDeliveryItems.filter(
      (item) =>
        item.expectedDeliveryId === delivery.id && item.remainingQuantity > 0,
    );
    setReceiveItems(
      items.map((item) => ({
        ...item,
        receivedQuantity: item.remainingQuantity,
      })),
    );
    setIsReceiveModalOpen(true);
  };

  const handleViewDetail = (delivery: ExpectedDelivery) => {
    setSelectedDelivery(delivery);
    setIsDetailModalOpen(true);
  };

  const handleUpdateReceiveQuantity = (itemId: string, quantity: number) => {
    setReceiveItems((items) =>
      items.map((item) =>
        item.id === itemId
          ? {
              ...item,
              receivedQuantity: Math.min(quantity, item.remainingQuantity),
            }
          : item,
      ),
    );
  };

  const handleSubmitReceive = () => {
    const totalReceived = receiveItems.reduce(
      (sum, item) => sum + item.receivedQuantity,
      0,
    );
    if (totalReceived === 0) {
      alert("입고할 수량을 입력해주세요.");
      return;
    }

    alert(`${totalReceived}개 상품이 입고 처리되었습니다.`);
    setIsReceiveModalOpen(false);
    setReceiveItems([]);
  };

  const getTotalStats = () => {
    return {
      total: filteredDeliveries.length,
      pending: filteredDeliveries.filter((d) => d.status === "pending").length,
      partial: filteredDeliveries.filter((d) => d.status === "partial").length,
      completed: filteredDeliveries.filter((d) => d.status === "completed")
        .length,
      overdue: filteredDeliveries.filter((d) => d.status === "overdue").length,
      totalExpectedAmount: filteredDeliveries.reduce(
        (sum, d) => sum + d.estimatedAmount,
        0,
      ),
      totalReceivedAmount: filteredDeliveries.reduce(
        (sum, d) => sum + d.receivedAmount,
        0,
      ),
    };
  };

  const stats = getTotalStats();

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">입고예정 목록</h1>
        <p className="text-gray-600">
          발주된 상품들의 입고 예정 현황을 확인하고 입고 처리를 진행합니다.
        </p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-500">전체 예정</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-blue-600">
            {stats.pending}
          </div>
          <div className="text-sm text-gray-500">입고대기</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-yellow-600">
            {stats.partial}
          </div>
          <div className="text-sm text-gray-500">부분입고</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-green-600">
            {stats.completed}
          </div>
          <div className="text-sm text-gray-500">입고완료</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          <div className="text-sm text-gray-500">지연</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-indigo-600">
            ₩{(stats.totalExpectedAmount / 1000000).toFixed(1)}M
          </div>
          <div className="text-sm text-gray-500">예정금액</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-2xl font-bold text-purple-600">
            ₩{(stats.totalReceivedAmount / 1000000).toFixed(1)}M
          </div>
          <div className="text-sm text-gray-500">입고금액</div>
        </div>
      </div>

      {/* 필터 */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              상태
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체 상태</option>
              <option value="pending">입고대기</option>
              <option value="partial">부분입고</option>
              <option value="completed">입고완료</option>
              <option value="overdue">지연</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              공급처
            </label>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">전체 공급처</option>
              {mockSuppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              시작일
            </label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, start: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              종료일
            </label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, end: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              검색
            </label>
            <input
              type="text"
              placeholder="발주번호, 공급처명, 송장번호"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* 입고예정 목록 */}
      <div className="bg-white border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  발주번호
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  공급처
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  예정일
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  상태
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  진행률
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  수량정보
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  금액정보
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  배송정보
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDeliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div
                      className="text-sm font-medium text-blue-600 cursor-pointer hover:underline"
                      onClick={() => handleViewDetail(delivery)}
                    >
                      {delivery.orderNumber}
                    </div>
                    <div className="text-xs text-gray-500">
                      발주일: {delivery.orderDate}
                    </div>
                    {delivery.memo && (
                      <div className="text-xs text-gray-500 mt-1">
                        📝 {delivery.memo}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {delivery.supplierName}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {delivery.expectedDeliveryDate}
                    </div>
                    {isOverdue(delivery.expectedDeliveryDate) &&
                      delivery.status !== "completed" && (
                        <div className="text-xs text-red-500">지연됨</div>
                      )}
                    {delivery.actualDeliveryDate && (
                      <div className="text-xs text-green-600">
                        실제: {delivery.actualDeliveryDate}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {getStatusBadge(delivery.status)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${getProgressPercentage(delivery.totalReceivedQuantity, delivery.totalOrderedQuantity)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-gray-600">
                      {getProgressPercentage(
                        delivery.totalReceivedQuantity,
                        delivery.totalOrderedQuantity,
                      )}
                      %
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {delivery.productCount}종 /{" "}
                      {delivery.totalOrderedQuantity}개
                    </div>
                    <div className="text-xs text-gray-500">
                      입고: {delivery.totalReceivedQuantity}개 / 잔여:{" "}
                      {delivery.remainingQuantity}개
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm font-medium text-gray-900">
                      ₩{delivery.estimatedAmount.toLocaleString()}
                    </div>
                    {delivery.receivedAmount > 0 && (
                      <div className="text-xs text-green-600">
                        입고: ₩{delivery.receivedAmount.toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {delivery.deliveryCompany && (
                      <div className="text-sm text-gray-900">
                        {delivery.deliveryCompany}
                      </div>
                    )}
                    {delivery.trackingNumber && (
                      <div className="text-xs text-blue-600">
                        {delivery.trackingNumber}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewDetail(delivery)}
                        className="text-blue-600 hover:text-blue-800 text-sm"
                      >
                        상세
                      </button>
                      {delivery.status !== "completed" && (
                        <button
                          onClick={() => handleReceiveStock(delivery)}
                          className="text-green-600 hover:text-green-800 text-sm"
                        >
                          입고
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 입고 처리 모달 */}
      {isReceiveModalOpen && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                입고 처리 - {selectedDelivery.orderNumber}
              </h2>
              <button
                onClick={() => setIsReceiveModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  실제 입고일
                </label>
                <input
                  type="date"
                  defaultValue={new Date().toISOString().split("T")[0]}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  입고 메모
                </label>
                <input
                  type="text"
                  placeholder="입고 관련 메모를 입력하세요"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                입고 상품 목록
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                        상품명
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                        SKU
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                        발주수량
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                        기입고
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                        잔여수량
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                        입고수량
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                        로트번호
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                        유통기한
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {receiveItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.productName}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {item.sku}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.orderedQuantity}개
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-600">
                          {item.orderedQuantity - item.remainingQuantity}개
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.remainingQuantity}개
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="number"
                            value={item.receivedQuantity}
                            onChange={(e) =>
                              handleUpdateReceiveQuantity(
                                item.id,
                                parseInt(e.target.value) || 0,
                              )
                            }
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                            min="0"
                            max={item.remainingQuantity}
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="text"
                            placeholder="LOT001"
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="px-4 py-2">
                          <input
                            type="date"
                            className="w-32 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6">
              <div className="text-sm text-gray-600">
                총 입고 예정:{" "}
                {receiveItems.reduce(
                  (sum, item) => sum + item.receivedQuantity,
                  0,
                )}
                개
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsReceiveModalOpen(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSubmitReceive}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  입고 처리
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 상세 모달 */}
      {isDetailModalOpen && selectedDelivery && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-5xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">
                입고예정 상세 - {selectedDelivery.orderNumber}
              </h2>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    공급처
                  </label>
                  <div className="text-sm text-gray-900">
                    {selectedDelivery.supplierName}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    예정일
                  </label>
                  <div className="text-sm text-gray-900">
                    {selectedDelivery.expectedDeliveryDate}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    상태
                  </label>
                  <div>{getStatusBadge(selectedDelivery.status)}</div>
                </div>
                {selectedDelivery.memo && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      메모
                    </label>
                    <div className="text-sm text-gray-900">
                      {selectedDelivery.memo}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    배송회사
                  </label>
                  <div className="text-sm text-gray-900">
                    {selectedDelivery.deliveryCompany || "-"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    송장번호
                  </label>
                  <div className="text-sm text-gray-900">
                    {selectedDelivery.trackingNumber || "-"}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    진행률
                  </label>
                  <div className="flex items-center space-x-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${getProgressPercentage(selectedDelivery.totalReceivedQuantity, selectedDelivery.totalOrderedQuantity)}%`,
                        }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">
                      {getProgressPercentage(
                        selectedDelivery.totalReceivedQuantity,
                        selectedDelivery.totalOrderedQuantity,
                      )}
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                상품별 입고 현황
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full border border-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                        상품명
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                        SKU
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                        발주수량
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                        입고수량
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                        잔여수량
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                        진행률
                      </th>
                      <th className="px-4 py-2 text-left text-sm font-medium text-gray-500">
                        입고일
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {mockExpectedDeliveryItems
                      .filter(
                        (item) =>
                          item.expectedDeliveryId === selectedDelivery.id,
                      )
                      .map((item) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item.productName}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {item.sku}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item.orderedQuantity}개
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item.receivedQuantity}개
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {item.remainingQuantity}개
                          </td>
                          <td className="px-4 py-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{
                                  width: `${getProgressPercentage(item.receivedQuantity, item.orderedQuantity)}%`,
                                }}
                              ></div>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-500">
                            {item.receivedDate || "-"}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                닫기
              </button>
              {selectedDelivery.status !== "completed" && (
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleReceiveStock(selectedDelivery);
                  }}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  입고 처리
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpectedDeliveryListPage;
