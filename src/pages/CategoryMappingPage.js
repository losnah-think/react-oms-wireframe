import React, { useState, useEffect } from 'react';

const CategoryMappingPage = () => {
  const [selectedMall, setSelectedMall] = useState('');
  const [mappings, setMappings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMapping, setEditingMapping] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [malls] = useState([
    { id: 'coupang', name: '쿠팡', logo: '□' },
    { id: 'gmarket', name: 'G마켓', logo: '□' },
    { id: 'auction', name: '옥션', logo: '□' },
    { id: '11st', name: '11번가', logo: '□' },
    { id: 'interpark', name: '인터파크', logo: '□' }
  ]);

  const [internalCategories] = useState([
    { id: 1, name: '전자제품', path: '전자제품' },
    { id: 11, name: '스마트폰', path: '전자제품 > 스마트폰' },
    { id: 111, name: '아이폰', path: '전자제품 > 스마트폰 > 아이폰' },
    { id: 112, name: '갤럭시', path: '전자제품 > 스마트폰 > 갤럭시' },
    { id: 12, name: '노트북', path: '전자제품 > 노트북' },
    { id: 13, name: '가전제품', path: '전자제품 > 가전제품' },
    { id: 2, name: '패션/의류', path: '패션/의류' },
    { id: 21, name: '남성의류', path: '패션/의류 > 남성의류' },
    { id: 22, name: '여성의류', path: '패션/의류 > 여성의류' },
    { id: 23, name: '신발', path: '패션/의류 > 신발' },
    { id: 3, name: '화장품', path: '화장품' },
    { id: 31, name: '스킨케어', path: '화장품 > 스킨케어' },
    { id: 32, name: '메이크업', path: '화장품 > 메이크업' }
  ]);

  const mallCategoriesData = {
    coupang: [
      { id: 'c1', name: '가전디지털', path: '가전디지털' },
      { id: 'c11', name: '휴대폰', path: '가전디지털 > 휴대폰' },
      { id: 'c111', name: 'iPhone', path: '가전디지털 > 휴대폰 > iPhone' },
      { id: 'c112', name: 'Galaxy', path: '가전디지털 > 휴대폰 > Galaxy' },
      { id: 'c12', name: '노트북/PC', path: '가전디지털 > 노트북/PC' },
      { id: 'c2', name: '패션의류', path: '패션의류' },
      { id: 'c21', name: '남성패션', path: '패션의류 > 남성패션' },
      { id: 'c22', name: '여성패션', path: '패션의류 > 여성패션' },
      { id: 'c3', name: '뷰티', path: '뷰티' }
    ],
    gmarket: [
      { id: 'g1', name: '디지털/가전', path: '디지털/가전' },
      { id: 'g11', name: '모바일/태블릿', path: '디지털/가전 > 모바일/태블릿' },
      { id: 'g12', name: '컴퓨터', path: '디지털/가전 > 컴퓨터' },
      { id: 'g2', name: '의류/잡화', path: '의류/잡화' },
      { id: 'g21', name: '남성의류', path: '의류/잡화 > 남성의류' },
      { id: 'g22', name: '여성의류', path: '의류/잡화 > 여성의류' },
      { id: 'g3', name: '화장품/향수', path: '화장품/향수' }
    ],
    auction: [
      { id: 'a1', name: 'IT/디지털', path: 'IT/디지털' },
      { id: 'a11', name: '스마트폰', path: 'IT/디지털 > 스마트폰' },
      { id: 'a12', name: '노트북', path: 'IT/디지털 > 노트북' },
      { id: 'a2', name: '패션/뷰티', path: '패션/뷰티' },
      { id: 'a21', name: '의류', path: '패션/뷰티 > 의류' },
      { id: 'a22', name: '화장품', path: '패션/뷰티 > 화장품' }
    ]
  };

  const sampleMappings = {
    coupang: [
      {
        id: 1,
        internalCategoryId: 111,
        internalCategory: '전자제품 > 스마트폰 > 아이폰',
        mallCategoryId: 'c111',
        mallCategory: '가전디지털 > 휴대폰 > iPhone',
        status: 'active',
        productsCount: 25,
        lastSync: '2024-09-10 14:30:00'
      },
      {
        id: 2,
        internalCategoryId: 112,
        internalCategory: '전자제품 > 스마트폰 > 갤럭시',
        mallCategoryId: 'c112',
        mallCategory: '가전디지털 > 휴대폰 > Galaxy',
        status: 'active',
        productsCount: 18,
        lastSync: '2024-09-10 14:25:00'
      },
      {
        id: 3,
        internalCategoryId: 12,
        internalCategory: '전자제품 > 노트북',
        mallCategoryId: 'c12',
        mallCategory: '가전디지털 > 노트북/PC',
        status: 'active',
        productsCount: 12,
        lastSync: '2024-09-10 14:20:00'
      },
      {
        id: 4,
        internalCategoryId: 21,
        internalCategory: '패션/의류 > 남성의류',
        mallCategoryId: 'c21',
        mallCategory: '패션의류 > 남성패션',
        status: 'inactive',
        productsCount: 0,
        lastSync: '2024-09-09 16:00:00'
      }
    ],
    gmarket: [
      {
        id: 5,
        internalCategoryId: 11,
        internalCategory: '전자제품 > 스마트폰',
        mallCategoryId: 'g11',
        mallCategory: '디지털/가전 > 모바일/태블릿',
        status: 'active',
        productsCount: 35,
        lastSync: '2024-09-10 15:00:00'
      }
    ]
  };

  const [formData, setFormData] = useState({
    internalCategoryId: '',
    mallCategoryId: '',
    status: 'active'
  });

  useEffect(() => {
    if (selectedMall) {
      setMappings(sampleMappings[selectedMall] || []);
    } else {
      setMappings([]);
    }
  }, [selectedMall]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (!formData.internalCategoryId || !formData.mallCategoryId) {
      alert('카테고리를 모두 선택해주세요.');
      return;
    }

    const internalCategory = internalCategories.find(c => c.id === parseInt(formData.internalCategoryId));
    const mallCategories = mallCategoriesData[selectedMall] || [];
    const mallCategory = mallCategories.find(c => c.id === formData.mallCategoryId);

    // 중복 매핑 검사
    const isDuplicate = mappings.some(mapping => 
      mapping.internalCategoryId === parseInt(formData.internalCategoryId) && 
      mapping.id !== (editingMapping?.id)
    );

    if (isDuplicate) {
      alert('이미 매핑된 내부 카테고리입니다.');
      return;
    }

    const newMapping = {
      id: editingMapping ? editingMapping.id : Date.now(),
      internalCategoryId: parseInt(formData.internalCategoryId),
      internalCategory: internalCategory.path,
      mallCategoryId: formData.mallCategoryId,
      mallCategory: mallCategory.path,
      status: formData.status,
      productsCount: editingMapping ? editingMapping.productsCount : 0,
      lastSync: editingMapping ? editingMapping.lastSync : new Date().toLocaleString('ko-KR')
    };

    if (editingMapping) {
      setMappings(prev => prev.map(mapping => 
        mapping.id === editingMapping.id ? newMapping : mapping
      ));
    } else {
      setMappings(prev => [...prev, newMapping]);
    }

    handleCloseModal();
  };

  const handleEdit = (mapping) => {
    setEditingMapping(mapping);
    setFormData({
      internalCategoryId: mapping.internalCategoryId.toString(),
      mallCategoryId: mapping.mallCategoryId,
      status: mapping.status
    });
    setIsModalOpen(true);
  };

  const handleDelete = (mappingId) => {
    if (window.confirm('정말로 이 매핑을 삭제하시겠습니까?')) {
      setMappings(prev => prev.filter(mapping => mapping.id !== mappingId));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingMapping(null);
    setFormData({
      internalCategoryId: '',
      mallCategoryId: '',
      status: 'active'
    });
  };

  const handleSyncMapping = (mappingId) => {
    setMappings(prev => prev.map(mapping => 
      mapping.id === mappingId 
        ? { ...mapping, lastSync: new Date().toLocaleString('ko-KR') }
        : mapping
    ));
    alert('매핑이 동기화되었습니다.');
  };

  const handleBulkSync = () => {
    if (window.confirm('모든 활성 매핑을 동기화하시겠습니까?')) {
      setMappings(prev => prev.map(mapping => 
        mapping.status === 'active'
          ? { ...mapping, lastSync: new Date().toLocaleString('ko-KR') }
          : mapping
      ));
      alert('모든 활성 매핑이 동기화되었습니다.');
    }
  };

  const filteredMappings = mappings.filter(mapping =>
    mapping.internalCategory.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mapping.mallCategory.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const mallCategories = mallCategoriesData[selectedMall] || [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">카테고리 매핑</h1>
        <p className="text-gray-600">내부 카테고리와 쇼핑몰 카테고리 간의 매핑을 관리합니다.</p>
      </div>

      {/* 쇼핑몰 선택 */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">쇼핑몰 선택</h2>
          {selectedMall && (
            <button
              onClick={handleBulkSync}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              전체 동기화
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {malls.map((mall) => (
            <div
              key={mall.id}
              onClick={() => setSelectedMall(mall.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedMall === mall.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">{mall.logo}</div>
                <div className="text-sm font-medium text-gray-900">{mall.name}</div>
                {selectedMall === mall.id && (
                  <div className="text-xs text-blue-600 mt-1">
                    {filteredMappings.length}개 매핑
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedMall && (
        <>
          {/* 검색 및 제어 */}
          <div className="bg-white border rounded-lg p-4 mb-6">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-64">
                <input
                  type="text"
                  placeholder="카테고리명으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 whitespace-nowrap"
              >
                매핑 추가
              </button>
            </div>
          </div>

          {/* 매핑 목록 */}
          <div className="bg-white border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      내부 카테고리
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ↔
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {malls.find(m => m.id === selectedMall)?.name} 카테고리
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상품수
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      상태
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      마지막 동기화
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMappings.map((mapping) => (
                    <tr key={mapping.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">
                          {mapping.internalCategory}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-gray-400">□</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-blue-600">
                          {mapping.mallCategory}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {mapping.productsCount}개
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          mapping.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {mapping.status === 'active' ? '활성' : '비활성'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mapping.lastSync}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleSyncMapping(mapping.id)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          동기화
                        </button>
                        <button
                          onClick={() => handleEdit(mapping)}
                          className="text-green-600 hover:text-green-900 mr-3"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(mapping.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredMappings.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">매핑된 카테고리가 없습니다.</p>
              </div>
            )}
          </div>

          {/* 통계 */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{mappings.length}</div>
              <div className="text-sm text-gray-600">전체 매핑</div>
            </div>
            <div className="bg-white border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {mappings.filter(m => m.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">활성 매핑</div>
            </div>
            <div className="bg-white border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {mappings.reduce((sum, m) => sum + m.productsCount, 0)}
              </div>
              <div className="text-sm text-gray-600">매핑된 상품수</div>
            </div>
          </div>
        </>
      )}

      {!selectedMall && (
        <div className="bg-white border rounded-lg p-8 text-center">
          <div className="text-gray-400 text-lg mb-2">□</div>
          <p className="text-gray-600">카테고리 매핑을 관리할 쇼핑몰을 선택해주세요.</p>
        </div>
      )}

      {/* 매핑 추가/수정 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-[500px] shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingMapping ? '매핑 수정' : '매핑 추가'}
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    내부 카테고리 *
                  </label>
                  <select
                    value={formData.internalCategoryId}
                    onChange={(e) => handleInputChange('internalCategoryId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">선택하세요</option>
                    {internalCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.path}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {malls.find(m => m.id === selectedMall)?.name} 카테고리 *
                  </label>
                  <select
                    value={formData.mallCategoryId}
                    onChange={(e) => handleInputChange('mallCategoryId', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">선택하세요</option>
                    {mallCategories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.path}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    상태
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="active">활성</option>
                    <option value="inactive">비활성</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSubmit}
                  className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  {editingMapping ? '수정' : '추가'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryMappingPage;
