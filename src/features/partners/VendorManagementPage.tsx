import React, { useState, useEffect } from 'react';
import { Vendor, FixedAddress, PLATFORM_OPTIONS, getPlatformLabel } from '../../types/vendor';
import { mockVendors, upsertVendor as upsertMockVendor, removeVendor as removeMockVendor } from '../../data/mockVendors';
import { getIntegrationsByVendorId } from '../../data/mockVendorIntegrations';
import { BaseVendor } from '../../types/vendor';

// 고정 주소 목록
const fixedAddresses: FixedAddress[] = [
  {
    id: 'addr-001',
    name: '본사 (서울)',
    address: '서울시 강남구 테헤란로 123',
    description: '메인 본사 건물'
  },
  {
    id: 'addr-002', 
    name: '물류센터 (경기)',
    address: '경기도 성남시 분당구 판교로 100',
    description: '물류 및 배송 센터'
  },
  {
    id: 'addr-003',
    name: '지점 (부산)',
    address: '부산시 해운대구 센텀중앙로 55',
    description: '부산 지역 지점'
  },
  {
    id: 'addr-004',
    name: '창고 (인천)',
    address: '인천시 연수구 컨벤시아대로 165',
    description: '인천 물류 창고'
  },
  {
    id: 'addr-005',
    name: '지점 (대구)',
    address: '대구시 수성구 동대구로 149',
    description: '대구 지역 지점'
  }
];

const VendorManagementPage = () => {
  const [selectedType, setSelectedType] = useState<'판매처' | '공급처'>('판매처');
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 추가 모달 상태들
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [vendorToDelete, setVendorToDelete] = useState<Vendor | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [showImportExportModal, setShowImportExportModal] = useState(false);

  // 로컬스토리지에서 로드 또는 mockVendors 기반 초기화
  useEffect(() => {
    const saved = localStorage.getItem('vendors');
    if (saved) {
      setVendors(JSON.parse(saved));
    } else {
      // mockVendors 기반으로 초기 데이터 생성
      console.log('🔄 mockVendors 기반으로 판매처 데이터 초기화:', mockVendors.length, '개');
      const initialVendors: Vendor[] = mockVendors.map((baseVendor, index) => ({
        id: baseVendor.id,
        name: baseVendor.name,
        code: baseVendor.code,
        type: '판매처' as const,
        platform: getPlatformLabel(baseVendor.platform),
        businessNumber: `${100 + index}-${20 + index}-${30000 + index * 1000}`,
        representative: baseVendor.settings?.contact || `대표자${index + 1}`,
        phone: `02-${1000 + index * 100}-${5000 + index * 100}`,
        email: baseVendor.settings?.loginId ? `${baseVendor.settings.loginId}@example.com` : `vendor${index + 1}@example.com`,
        address: `서울시 강남구 테헤란로 ${123 + index * 10}`,
        status: baseVendor.is_active ? '사용중' as const : '정지' as const,
        registrationDate: baseVendor.created_at?.split('T')[0] || '2024-01-01',
        created_at: baseVendor.created_at,
        updated_at: baseVendor.updated_at,
        settings: baseVendor.settings,
      }));
      console.log('✅ 생성된 판매처:', initialVendors.length, '개');
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
    
    // mockVendors에도 동기화 (판매처만)
    if (editingVendor.type === '판매처') {
      // platform 레이블을 value로 변환
      const platformValue = PLATFORM_OPTIONS.find(opt => opt.label === editingVendor.platform)?.value || 'cafe24';
      
      const baseVendor: BaseVendor = {
        id: editingVendor.id,
        name: editingVendor.name,
        code: editingVendor.code || `VENDOR${editingVendor.id}`,
        platform: platformValue as BaseVendor['platform'],
        is_active: editingVendor.status === '사용중',
        created_at: editingVendor.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        settings: {
          vendorType: editingVendor.settings?.vendorType || '오픈마켓',
          commissionRate: editingVendor.settings?.commissionRate || '0%',
          contact: editingVendor.representative,
          loginId: editingVendor.email?.split('@')[0] || '',
          ...editingVendor.settings,
        },
      };
      
      upsertMockVendor(baseVendor);
      console.log('✅ mockVendors 업데이트:', baseVendor.name);
    }
    
    setIsModalOpen(false);
    setEditingVendor(null);
  };

  // 삭제 확인 모달 열기
  const handleDelete = (vendor: Vendor) => {
    setVendorToDelete(vendor);
    setShowDeleteConfirmModal(true);
  };

  // 실제 삭제 실행
  const confirmDelete = () => {
    if (vendorToDelete) {
      // 외부 연동 확인 (판매처만)
      if (vendorToDelete.type === '판매처') {
        const integrations = getIntegrationsByVendorId(vendorToDelete.id);
        if (integrations.length > 0) {
          alert(`⚠️ 이 판매처는 ${integrations.length}개의 외부 연동이 있어 삭제할 수 없습니다.\n\n먼저 외부 연동을 해제해주세요.`);
          setShowDeleteConfirmModal(false);
          setVendorToDelete(null);
          return;
        }
        
        // mockVendors에서도 삭제
        removeMockVendor(vendorToDelete.id);
        console.log('✅ mockVendors에서 삭제:', vendorToDelete.name);
      }
      
      saveVendors(vendors.filter(v => v.id !== vendorToDelete.id));
      setShowDeleteConfirmModal(false);
      setVendorToDelete(null);
    }
  };


  // 통계 계산
  const getStats = () => {
    const totalVendors = vendors.length;
    const activeVendors = vendors.filter(v => v.status === '사용중').length;
    const inactiveVendors = vendors.filter(v => v.status === '정지').length;
    const sellers = vendors.filter(v => v.type === '판매처').length;
    const suppliers = vendors.filter(v => v.type === '공급처').length;
    
    return {
      totalVendors,
      activeVendors,
      inactiveVendors,
      sellers,
      suppliers
    };
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
               {selectedType} 추가
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
                      {vendor.platform && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
                          {vendor.platform}
                        </span>
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          vendor.status === '사용중'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {vendor.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      {vendor.code && (
                        <div>
                          <span className="text-gray-500">코드:</span>
                          <span className="ml-2 font-medium text-gray-900">{vendor.code}</span>
                        </div>
                      )}
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

                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                      <span>등록일: {vendor.registrationDate}</span>
                      {vendor.settings?.commissionRate && (
                        <span className="text-orange-600 font-medium">
                          수수료: {vendor.settings.commissionRate}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 오른쪽: 버튼 */}
                  <div className="flex flex-col gap-2 ml-6">
                    <button
                      onClick={() => openEditModal(vendor)}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 text-sm font-medium"
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(vendor)}
                      className="px-4 py-2 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm font-medium"
                    >
                       삭제
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

              {/* 플랫폼 (판매처만) */}
              {selectedType === '판매처' && (
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-2">
                    플랫폼
                  </label>
                  <select
                    value={editingVendor.platform || ''}
                    onChange={(e) => setEditingVendor({ ...editingVendor, platform: e.target.value })}
                    className="w-full px-4 py-3 border rounded-lg text-base"
                  >
                    <option value="">선택 안함</option>
                    {PLATFORM_OPTIONS.map(option => (
                      <option key={option.value} value={option.label}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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

              {/* 수수료율 (판매처만) */}
              {selectedType === '판매처' && (
                <div>
                  <label className="block text-base font-semibold text-gray-900 mb-2">
                    수수료율
                  </label>
                  <input
                    type="text"
                    value={editingVendor.settings?.commissionRate || ''}
                    onChange={(e) => setEditingVendor({ 
                      ...editingVendor, 
                      settings: { ...editingVendor.settings, commissionRate: e.target.value }
                    })}
                    placeholder="예: 5%, 10%, 15%"
                    className="w-full px-4 py-3 border rounded-lg text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">플랫폼에서 부과하는 수수료율을 입력하세요.</p>
                </div>
              )}

              {/* 주소 */}
              <div>
                <label className="block text-base font-semibold text-gray-900 mb-2">
                  고정 주소 선택
                </label>
                <select
                  value={editingVendor.fixedAddressId || ''}
                  onChange={(e) => {
                    const selectedAddress = fixedAddresses.find(addr => addr.id === e.target.value);
                    setEditingVendor({ 
                      ...editingVendor, 
                      fixedAddressId: e.target.value,
                      address: selectedAddress?.address || ''
                    });
                  }}
                  className="w-full px-4 py-3 border rounded-lg text-base"
                >
                  <option value="">주소를 선택하세요</option>
                  {fixedAddresses.map((address) => (
                    <option key={address.id} value={address.id}>
                      {address.name} - {address.address}
                    </option>
                  ))}
                </select>
                {editingVendor.fixedAddressId && (
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm text-blue-800">
                      <strong>선택된 주소:</strong> {editingVendor.address}
                    </div>
                    {fixedAddresses.find(addr => addr.id === editingVendor.fixedAddressId)?.description && (
                      <div className="text-xs text-blue-600 mt-1">
                        {fixedAddresses.find(addr => addr.id === editingVendor.fixedAddressId)?.description}
                      </div>
                    )}
                  </div>
                )}
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