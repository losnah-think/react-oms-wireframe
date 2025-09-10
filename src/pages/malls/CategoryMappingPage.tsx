import React, { useState } from 'react';

interface Mall {
  id: string;
  name: string;
  status: 'active' | 'inactive';
}

interface Category {
  id: number;
  name: string;
  parentId?: number;
  level: number;
}

interface MallCategory {
  id: string;
  name: string;
  level: number;
  parentId?: string;
}

interface CategoryMapping {
  id: number;
  internalCategoryId: number;
  mallCategoryId: string;
  mallId: string;
  isActive: boolean;
  createdAt: string;
}

const CategoryMappingPage: React.FC = () => {
  const [selectedMall, setSelectedMall] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const malls: Mall[] = [
    { id: 'naver', name: '네이버 스마트스토어', status: 'active' },
    { id: 'coupang', name: '쿠팡', status: 'active' },
    { id: 'gmarket', name: 'G마켓', status: 'active' },
    { id: '11st', name: '11번가', status: 'active' },
    { id: 'wemakeprice', name: '위메프', status: 'active' },
    { id: 'cafe24', name: '카페24', status: 'inactive' }
  ];

  // 내부 카테고리 (FULGO)
  const internalCategories: Category[] = [
    { id: 1, name: '전자제품', level: 1 },
    { id: 11, name: '스마트폰', parentId: 1, level: 2 },
    { id: 111, name: '안드로이드', parentId: 11, level: 3 },
    { id: 112, name: 'iOS', parentId: 11, level: 3 },
    { id: 12, name: '노트북', parentId: 1, level: 2 },
    { id: 121, name: '게이밍 노트북', parentId: 12, level: 3 },
    { id: 122, name: '울트라북', parentId: 12, level: 3 },
    
    { id: 2, name: '가전제품', level: 1 },
    { id: 21, name: '청소기', parentId: 2, level: 2 },
    { id: 211, name: '무선청소기', parentId: 21, level: 3 },
    { id: 212, name: '로봇청소기', parentId: 21, level: 3 },
    { id: 22, name: '에어컨', parentId: 2, level: 2 },
    
    { id: 3, name: '의류/신발', level: 1 },
    { id: 31, name: '신발', parentId: 3, level: 2 },
    { id: 311, name: '운동화', parentId: 31, level: 3 },
    { id: 312, name: '구두', parentId: 31, level: 3 },
    
    { id: 4, name: '화장품/뷰티', level: 1 },
    { id: 41, name: '스킨케어', parentId: 4, level: 2 },
    { id: 411, name: '크림', parentId: 41, level: 3 },
    { id: 412, name: '로션', parentId: 41, level: 3 },
    
    { id: 5, name: '식품/생활용품', level: 1 },
    { id: 51, name: '즉석식품', parentId: 5, level: 2 },
    { id: 511, name: '즉석밥', parentId: 51, level: 3 }
  ];

  // 쇼핑몰별 카테고리 (예시: 네이버 스마트스토어)
  const mallCategories: Record<string, MallCategory[]> = {
    naver: [
      { id: 'naver_1', name: '디지털/가전', level: 1 },
      { id: 'naver_11', name: '휴대폰/스마트폰', parentId: 'naver_1', level: 2 },
      { id: 'naver_111', name: '스마트폰', parentId: 'naver_11', level: 3 },
      { id: 'naver_12', name: '노트북/데스크탑', parentId: 'naver_1', level: 2 },
      { id: 'naver_121', name: '노트북', parentId: 'naver_12', level: 3 },
      
      { id: 'naver_2', name: '생활/건강', level: 1 },
      { id: 'naver_21', name: '생활용품', parentId: 'naver_2', level: 2 },
      { id: 'naver_211', name: '청소용품', parentId: 'naver_21', level: 3 },
      
      { id: 'naver_3', name: '패션의류', level: 1 },
      { id: 'naver_31', name: '신발', parentId: 'naver_3', level: 2 },
      { id: 'naver_311', name: '운동화/스니커즈', parentId: 'naver_31', level: 3 },
      
      { id: 'naver_4', name: '뷰티', level: 1 },
      { id: 'naver_41', name: '스킨케어', parentId: 'naver_4', level: 2 },
      { id: 'naver_411', name: '크림/에센스', parentId: 'naver_41', level: 3 },
      
      { id: 'naver_5', name: '식품', level: 1 },
      { id: 'naver_51', name: '간편식/즉석조리식품', parentId: 'naver_5', level: 2 },
      { id: 'naver_511', name: '즉석밥/죽', parentId: 'naver_51', level: 3 }
    ],
    coupang: [
      { id: 'coupang_1', name: '전자기기', level: 1 },
      { id: 'coupang_11', name: '모바일', parentId: 'coupang_1', level: 2 },
      { id: 'coupang_111', name: '스마트폰', parentId: 'coupang_11', level: 3 },
      { id: 'coupang_12', name: 'PC/노트북', parentId: 'coupang_1', level: 2 },
      { id: 'coupang_121', name: '노트북', parentId: 'coupang_12', level: 3 }
    ]
  };

  // 기존 매핑 데이터
  const [mappings, setMappings] = useState<CategoryMapping[]>([
    {
      id: 1,
      internalCategoryId: 111,
      mallCategoryId: 'naver_111',
      mallId: 'naver',
      isActive: true,
      createdAt: '2025-01-15T10:00:00Z'
    },
    {
      id: 2,
      internalCategoryId: 121,
      mallCategoryId: 'naver_121',
      mallId: 'naver',
      isActive: true,
      createdAt: '2025-01-15T10:05:00Z'
    },
    {
      id: 3,
      internalCategoryId: 211,
      mallCategoryId: 'naver_211',
      mallId: 'naver',
      isActive: true,
      createdAt: '2025-01-15T10:10:00Z'
    },
    {
      id: 4,
      internalCategoryId: 311,
      mallCategoryId: 'naver_311',
      mallId: 'naver',
      isActive: true,
      createdAt: '2025-01-15T10:15:00Z'
    },
    {
      id: 5,
      internalCategoryId: 411,
      mallCategoryId: 'naver_411',
      mallId: 'naver',
      isActive: true,
      createdAt: '2025-01-15T10:20:00Z'
    },
    {
      id: 6,
      internalCategoryId: 511,
      mallCategoryId: 'naver_511',
      mallId: 'naver',
      isActive: true,
      createdAt: '2025-01-15T10:25:00Z'
    }
  ]);

  const getInternalCategoryPath = (categoryId: number): string => {
    const category = internalCategories.find(c => c.id === categoryId);
    if (!category) return '';
    
    if (category.parentId) {
      const parentPath = getInternalCategoryPath(category.parentId);
      return parentPath ? `${parentPath} > ${category.name}` : category.name;
    }
    
    return category.name;
  };

  const getMallCategoryPath = (categories: MallCategory[], categoryId: string): string => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return '';
    
    if (category.parentId) {
      const parentPath = getMallCategoryPath(categories, category.parentId);
      return parentPath ? `${parentPath} > ${category.name}` : category.name;
    }
    
    return category.name;
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleCreateMapping = (internalCategoryId: number, mallCategoryId: string) => {
    const newMapping: CategoryMapping = {
      id: mappings.length + 1,
      internalCategoryId,
      mallCategoryId,
      mallId: selectedMall,
      isActive: true,
      createdAt: new Date().toISOString()
    };
    
    setMappings([...mappings, newMapping]);
    alert('카테고리 매핑이 생성되었습니다.');
  };

  const handleDeleteMapping = (mappingId: number) => {
    if (window.confirm('이 매핑을 삭제하시겠습니까?')) {
      setMappings(mappings.filter(m => m.id !== mappingId));
      alert('매핑이 삭제되었습니다.');
    }
  };

  const toggleMappingStatus = (mappingId: number) => {
    setMappings(mappings.map(m => 
      m.id === mappingId ? { ...m, isActive: !m.isActive } : m
    ));
  };

  const filteredInternalCategories = internalCategories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = selectedLevel === 'all' || category.level.toString() === selectedLevel;
    return matchesSearch && matchesLevel;
  });

  const currentMallCategories = selectedMall ? mallCategories[selectedMall] || [] : [];
  const currentMappings = mappings.filter(m => m.mallId === selectedMall);
  const selectedMallInfo = malls.find(m => m.id === selectedMall);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">카테고리 매핑 관리</h1>
        <p className="text-gray-600">내부 카테고리와 각 쇼핑몰 카테고리 간의 매핑을 관리합니다.</p>
      </div>

      {/* 쇼핑몰 선택 */}
      <div className="bg-white border rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">쇼핑몰 선택</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {malls.map((mall) => (
            <div
              key={mall.id}
              onClick={() => mall.status === 'active' && setSelectedMall(mall.id)}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                selectedMall === mall.id
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              } ${mall.status === 'inactive' ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="text-center">
                <div className="text-sm font-medium text-gray-900">{mall.name}</div>
                <div className={`text-xs mt-1 ${
                  mall.status === 'active' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {mall.status === 'active' ? '연결됨' : '연결 안됨'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedMall && (
        <>
          {/* 검색 및 필터 */}
          <div className="bg-white border rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {selectedMallInfo?.name} 카테고리 매핑
              </h3>
              <div className="text-sm text-gray-600">
                매핑된 카테고리: {currentMappings.filter(m => m.isActive).length}개
              </div>
            </div>
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
              
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체 레벨</option>
                <option value="1">1레벨 (대분류)</option>
                <option value="2">2레벨 (중분류)</option>
                <option value="3">3레벨 (소분류)</option>
              </select>
            </div>
          </div>

          {/* 현재 매핑 현황 */}
          <div className="bg-white border rounded-lg p-4 mb-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">현재 매핑 현황</h3>
            
            {currentMappings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        내부 카테고리 (FULGO)
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        쇼핑몰 카테고리
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        상태
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        생성일
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        관리
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentMappings.map((mapping) => {
                      // 카테고리 정보는 직접 함수 호출로 가져옴
                      
                      return (
                        <tr key={mapping.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {getInternalCategoryPath(mapping.internalCategoryId)}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {mapping.internalCategoryId}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {getMallCategoryPath(currentMallCategories, mapping.mallCategoryId)}
                            </div>
                            <div className="text-xs text-gray-500">
                              ID: {mapping.mallCategoryId}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <label className="inline-flex items-center">
                              <input
                                type="checkbox"
                                checked={mapping.isActive}
                                onChange={() => toggleMappingStatus(mapping.id)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className={`ml-2 text-sm ${
                                mapping.isActive ? 'text-green-600' : 'text-gray-400'
                              }`}>
                                {mapping.isActive ? '활성' : '비활성'}
                              </span>
                            </label>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500">
                            {new Date(mapping.createdAt).toLocaleDateString('ko-KR')}
                          </td>
                          <td className="px-6 py-4">
                            <button
                              onClick={() => handleDeleteMapping(mapping.id)}
                              className="text-xs text-red-600 hover:text-red-900 border border-red-300 px-2 py-1 rounded"
                            >
                              삭제
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                매핑된 카테고리가 없습니다.
              </div>
            )}
          </div>

          {/* 새 매핑 생성 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 내부 카테고리 */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">내부 카테고리 (FULGO)</h3>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredInternalCategories.map((category) => {
                  const isAlreadyMapped = currentMappings.some(m => m.internalCategoryId === category.id && m.isActive);
                  
                  return (
                    <div
                      key={category.id}
                      className={`p-3 border rounded-lg ${
                        isAlreadyMapped 
                          ? 'bg-gray-50 border-gray-200' 
                          : 'hover:bg-blue-50 border-gray-200 hover:border-blue-300 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className={`text-sm font-medium ${ 
                            isAlreadyMapped ? 'text-gray-400' : 'text-gray-900'
                          }`}>
                            {getInternalCategoryPath(category.id)}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {category.id} | 레벨: {category.level}
                          </div>
                        </div>
                        {isAlreadyMapped && (
                          <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                            매핑됨
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 쇼핑몰 카테고리 */}
            <div className="bg-white border rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {selectedMallInfo?.name} 카테고리
              </h3>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {currentMallCategories.map((category) => (
                  <div
                    key={category.id}
                    className="p-3 border rounded-lg hover:bg-green-50 border-gray-200 hover:border-green-300 cursor-pointer"
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {getMallCategoryPath(currentMallCategories, category.id)}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {category.id} | 레벨: {category.level}
                    </div>
                  </div>
                ))}
              </div>
              
              {currentMallCategories.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  해당 쇼핑몰의 카테고리 정보가 없습니다.
                </div>
              )}
            </div>
          </div>

          {/* 매핑 생성 도움말 */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">매핑 생성 방법</h4>
            <div className="text-sm text-blue-800 space-y-1">
              <p>1. 왼쪽에서 내부 카테고리를 선택하세요 (회색 표시는 이미 매핑된 카테고리)</p>
              <p>2. 오른쪽에서 대응하는 쇼핑몰 카테고리를 선택하세요</p>
              <p>3. 두 카테고리를 모두 선택한 후 "매핑 생성" 버튼을 클릭하세요</p>
              <p>4. 생성된 매핑은 "현재 매핑 현황"에서 확인할 수 있습니다</p>
            </div>
          </div>

          {/* 통계 */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {internalCategories.filter(c => c.level === 3).length}
              </div>
              <div className="text-sm text-gray-600">내부 카테고리 (소분류)</div>
            </div>
            
            <div className="bg-white border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {currentMappings.filter(m => m.isActive).length}
              </div>
              <div className="text-sm text-gray-600">활성 매핑</div>
            </div>
            
            <div className="bg-white border rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">
                {Math.round((currentMappings.filter(m => m.isActive).length / Math.max(internalCategories.filter(c => c.level === 3).length, 1)) * 100)}%
              </div>
              <div className="text-sm text-gray-600">매핑 완성도</div>
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
    </div>
  );
};

export default CategoryMappingPage;
