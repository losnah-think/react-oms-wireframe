import React, { useState, useEffect } from 'react';

// 타입 정의
interface Vendor {
  id: string;
  name: string;
  type: '판매처' | '공급처';
  businessNumber: string;
  representative: string;
  phone: string;
  email?: string;
  address: string;
  status: '사용중' | '정지';
  registrationDate: string;
}

const VendorManagementPage = () => {
  const [selectedType, setSelectedType] = useState<'판매처' | '공급처'>('판매처');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 로컬스토리지에서 로드
  useEffect(() => {
    const saved = localStorage.getItem('vendors');
    if (saved) {
      setVendors(JSON.parse(saved));
    } else {
      // 초기 데이터
      const initialVendors: Vendor[] = [
        {
          id: '1',
          name: '스마트스토어',
          type: '판매처',
          businessNumber: '123-45-67890',
          representative: '김판매',
          phone: '02-1234-5678',
          email: 'smart@store.com',
          address: '서울시 강남구 테헤란로 123',
          status: '사용중',
          registrationDate: '2024-01-15'
        },
        {
          id: '2',
          name: '쿠팡',
          type: '판매처',
          businessNumber: '234-56-78901',
          representative: '이쿠팡',
          phone: '02-2345-6789',
          email: 'coupang@partners.com',
          address: '서울시 송파구 올림픽로 300',
          status: '사용중',
          registrationDate: '2024-02-01'
        }
      ];
      setVendors(initialVendors);
      localStorage.setItem('vendors', JSON.stringify(initialVendors));
    }
  }, []);

  // 저장
  const saveVendors = (newVendors: Vendor[]) => {
    setVendors(newVendors);
    localStorage.setItem('vendors', JSON.stringify(newVendors));
  };

  // 필터링
  const filteredVendors = vendors.filter(v => 
    v.type === selectedType && 
    (v.name.includes(searchTerm) || 
     v.businessNumber.includes(searchTerm) || 
     v.representative.includes(searchTerm))
  );

  // 새 업체 추가
  const openAddModal = () => {
    setEditingVendor({
      id: Date.now().toString(),
      name: '',
      type: selectedType,
      businessNumber: '',
      representative: '',
      phone: '',
      email: '',
      address: '',
      status: '사용중',
      registrationDate: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  // 수정 모달 열기
  const openEditModal = (vendor: Vendor) => {
    setEditingVendor({ ...vendor });
    setIsModalOpen(true);
  };

  // 저장
  const handleSave = () => {
    if (!editingVendor) return;

    if (!editingVendor.name.trim()) {
      alert('업체명을 입력하세요');
      return;
    }
    if (!editingVendor.representative.trim()) {
      alert('대표자명을 입력하세요');
      return;
    }
    if (!editingVendor.phone.trim()) {
      alert('전화번호를 입력하세요');
      return;
    }

    const existingIndex = vendors.findIndex(v => v.id === editingVendor.id);
    let newVendors;

    if (existingIndex >= 0) {
      newVendors = [...vendors];
      newVendors[existingIndex] = editingVendor;
    } else {
      newVendors = [...vendors, editingVendor];
    }

    saveVendors(newVendors);
    setIsModalOpen(false);
    setEditingVendor(null);
  };

  // 삭제
  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      saveVendors(vendors.filter(v => v.id !== id));
    }
  };

  // 상태 토글
  const toggleStatus = (id: string) => {
    const newVendors = vendors.map(v => {
      if (v.id === id) {
        return { ...v, status: v.status === '사용중' ? '정지' : '사용중' } as Vendor;
      }
      return v;
    });
    saveVendors(newVendors);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold">거래처 관리</h1>
          <p className="text-sm text-gray-600 mt-1">물건을 팔고 사는 곳을 등록하고 관리하세요</p>
        </div>
      </div>

      {/* 탭 */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-2 py-4">
            <button
              onClick={() => setSelectedType('판매처')}
              className={`flex-1 py-6 px-4 text-center rounded-lg font-semibold text-lg transition-all ${
                selectedType === '판매처'
                  ? "bg-blue-600 text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <div className="text-3xl mb-2">🛒</div>
              <div>판매처</div>
              <div className="text-xs mt-1 opacity-75">물건 파는 곳</div>
            </button>
            <button
              onClick={() => setSelectedType('공급처')}
              className={`flex-1 py-6 px-4 text-center rounded-lg font-semibold text-lg transition-all ${
                selectedType === '공급처'
                  ? "bg-green-600 text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <div className="text-3xl mb-2">🏭</div>
              <div>공급처</div>
              <div className="text-xs mt-1 opacity-75">물건 사는 곳</div>
            </button>
          </div>
        </div>
      </div>

      {/* 메인 */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* 검색 및 추가 */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between gap-4">
            <input
              type="text"
              placeholder={`${selectedType} 이름, 대표자, 사업자번호로 검색`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 px-4 py-3 border rounded-lg text-base"
            />
            <button
              onClick={openAddModal}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold whitespace-nowrap"
            >
              ➕ {selectedType} 추가
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">
            총 {filteredVendors.length}개의 {selectedType}
          </p>
        </div>

        {/* 목록 */}
        {filteredVendors.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-16 text-center">
            <div className="text-5xl mb-4">
              {selectedType === '판매처' ? '🛒' : '🏭'}
            </div>
            <p className="text-lg mb-2 text-gray-700">등록된 {selectedType}가 없어요</p>
            <p className="text-sm text-gray-500 mb-6">
              위의 "{selectedType} 추가" 버튼을 눌러서<br/>
              첫 {selectedType}를 등록해보세요
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  {/* 왼쪽: 정보 */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{vendor.name}</h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        vendor.status === '사용중' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {vendor.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">대표자:</span>
                        <span className="ml-2 font-medium text-gray-900">{vendor.representative}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">사업자번호:</span>
                        <span className="ml-2 font-medium text-gray-900">{vendor.businessNumber}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">전화번호:</span>
                        <span className="ml-2 font-medium text-gray-900">{vendor.phone}</span>
                      </div>
                      {vendor.email && (
                        <div>
                          <span className="text-gray-500">이메일:</span>
                          <span className="ml-2 font-medium text-gray-900">{vendor.email}</span>
                        </div>
                      )}
                      <div className="col-span-2">
                        <span className="text-gray-500">주소:</span>
                        <span className="ml-2 font-medium text-gray-900">{vendor.address}</span>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-gray-500">
                      등록일: {vendor.registrationDate}
                    </div>
                  </div>

                  {/* 오른쪽: 버튼 */}
                  <div className="flex flex-col gap-2 ml-6">
                    <button
                      onClick={() => toggleStatus(vendor.id)}
                      className={`px-4 py-2 rounded text-sm font-medium whitespace-nowrap ${
                        vendor.status === '사용중'
                          ? 'bg-red-50 text-red-600 hover:bg-red-100'
                          : 'bg-green-50 text-green-600 hover:bg-green-100'
                      }`}
                    >
                      {vendor.status === '사용중' ? '⏸️ 정지' : '▶️ 재개'}
                    </button>
                    <button
                      onClick={() => openEditModal(vendor)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(vendor.id)}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm font-medium"
                    >
                      🗑️ 삭제
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 모달 */}
      {isModalOpen && editingVendor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-xl font-semibold">
                {vendors.find(v => v.id === editingVendor.id) 
                  ? `${selectedType} 수정` 
                  : `새 ${selectedType} 추가`}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* 업체명 */}
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  {selectedType} 이름 *
                </label>
                <input
                  type="text"
                  value={editingVendor.name}
                  onChange={(e) => setEditingVendor({ ...editingVendor, name: e.target.value })}
                  placeholder="예: 스마트스토어, 쿠팡"
                  className="w-full px-4 py-3 border rounded-lg text-base"
                />
              </div>

              {/* 대표자 */}
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  대표자 이름 *
                </label>
                <input
                  type="text"
                  value={editingVendor.representative}
                  onChange={(e) => setEditingVendor({ ...editingVendor, representative: e.target.value })}
                  placeholder="예: 홍길동"
                  className="w-full px-4 py-3 border rounded-lg text-base"
                />
              </div>

              {/* 사업자번호 */}
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  사업자번호
                </label>
                <input
                  type="text"
                  value={editingVendor.businessNumber}
                  onChange={(e) => setEditingVendor({ ...editingVendor, businessNumber: e.target.value })}
                  placeholder="예: 123-45-67890"
                  className="w-full px-4 py-3 border rounded-lg text-base"
                />
              </div>

              {/* 전화번호 */}
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  전화번호 *
                </label>
                <input
                  type="text"
                  value={editingVendor.phone}
                  onChange={(e) => setEditingVendor({ ...editingVendor, phone: e.target.value })}
                  placeholder="예: 02-1234-5678"
                  className="w-full px-4 py-3 border rounded-lg text-base"
                />
              </div>

              {/* 이메일 */}
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  이메일
                </label>
                <input
                  type="email"
                  value={editingVendor.email || ''}
                  onChange={(e) => setEditingVendor({ ...editingVendor, email: e.target.value })}
                  placeholder="예: contact@company.com"
                  className="w-full px-4 py-3 border rounded-lg text-base"
                />
              </div>

              {/* 주소 */}
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  주소
                </label>
                <input
                  type="text"
                  value={editingVendor.address}
                  onChange={(e) => setEditingVendor({ ...editingVendor, address: e.target.value })}
                  placeholder="예: 서울시 강남구 테헤란로 123"
                  className="w-full px-4 py-3 border rounded-lg text-base"
                />
              </div>
            </div>

            {/* 하단 버튼 */}
            <div className="p-6 border-t bg-gray-50 flex gap-3">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-base font-medium"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-base font-semibold"
              >
                💾 저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorManagementPage;