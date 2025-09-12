import React, { useState } from 'react';

interface ProductSeason {
  id: string;
  name: string;
  code: string;
  description: string;
  color: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductSeasonsPageProps {
  onNavigate?: (page: string) => void;
}

const ProductSeasonsPage: React.FC<ProductSeasonsPageProps> = ({ onNavigate }) => {
  const [productSeasons, setProductSeasons] = useState<ProductSeason[]>([
    {
      id: '1',
      name: '상시',
      code: 'YEAR_ROUND',
      description: '계절에 상관없이 판매하는 상품',
      color: '#6B7280',
      isActive: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '2',
      name: '봄/여름',
      code: 'SPRING_SUMMER',
      description: '봄, 여름 시즌 상품',
      color: '#10B981',
      isActive: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '3',
      name: '가을/겨울',
      code: 'FALL_WINTER',
      description: '가을, 겨울 시즌 상품',
      color: '#F59E0B',
      isActive: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '4',
      name: '봄',
      code: 'SPRING',
      description: '봄 시즌 전용 상품',
      color: '#EF4444',
      isActive: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '5',
      name: '여름',
      code: 'SUMMER',
      description: '여름 시즌 전용 상품',
      color: '#3B82F6',
      isActive: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '6',
      name: '가을',
      code: 'FALL',
      description: '가을 시즌 전용 상품',
      color: '#8B5CF6',
      isActive: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '7',
      name: '겨울',
      code: 'WINTER',
      description: '겨울 시즌 전용 상품',
      color: '#06B6D4',
      isActive: false,
      createdAt: '2024-01-15',
      updatedAt: '2024-02-10'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductSeason | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    color: '#6B7280',
    isActive: true
  });

  const predefinedColors = [
    '#6B7280', // Gray
    '#EF4444', // Red
    '#F59E0B', // Amber
    '#10B981', // Emerald
    '#3B82F6', // Blue
    '#8B5CF6', // Violet
    '#EC4899', // Pink
    '#06B6D4', // Cyan
  ];

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      color: '#6B7280',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: ProductSeason) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      code: item.code,
      description: item.description,
      color: item.color,
      isActive: item.isActive
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingItem) {
      // 수정
      setProductSeasons(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...formData, updatedAt: new Date().toISOString().split('T')[0] }
          : item
      ));
    } else {
      // 추가
      const newItem: ProductSeason = {
        id: String(Date.now()),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setProductSeasons(prev => [...prev, newItem]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setProductSeasons(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    setProductSeasons(prev => prev.map(item => 
      item.id === id 
        ? { ...item, isActive: !item.isActive, updatedAt: new Date().toISOString().split('T')[0] }
        : item
    ));
  };

  const handleBulkAddSeasons = () => {
    const defaultSeasons = [
      { name: '상시', code: 'YEAR_ROUND', description: '계절에 상관없이 판매하는 상품', color: '#6B7280' },
      { name: '봄/여름', code: 'SPRING_SUMMER', description: '봄, 여름 시즌 상품', color: '#10B981' },
      { name: '가을/겨울', code: 'FALL_WINTER', description: '가을, 겨울 시즌 상품', color: '#F59E0B' }
    ];

    const existingCodes = productSeasons.map(item => item.code);
    
    defaultSeasons.forEach(season => {
      if (!existingCodes.includes(season.code)) {
        const newItem: ProductSeason = {
          id: String(Date.now() + Math.random()),
          ...season,
          isActive: true,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        };
        setProductSeasons(prev => [...prev, newItem]);
      }
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">상품 시즌 관리</h1>
          <p className="text-gray-600 mt-1">상품 등록 시 사용할 시즌을 관리합니다. (총 {productSeasons.length}개)</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleBulkAddSeasons}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
          >
            기본 시즌 추가
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            시즌 추가
          </button>
        </div>
      </div>

      {/* 안내 메시지 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">시즌 관리 안내</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>의류, 액세서리 등 계절성이 있는 상품의 시즌을 관리합니다</li>
                <li>시즌별로 상품을 분류하고 매출을 분석할 때 활용됩니다</li>
                <li>색상을 지정하여 시각적으로 구분할 수 있습니다</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 시즌 목록 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                시즌
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                코드
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                설명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                수정일
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                작업
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {productSeasons.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3 border border-gray-200"
                      style={{ backgroundColor: item.color }}
                    ></div>
                    <div className="text-sm font-medium text-gray-900">{item.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                    {item.code}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm text-gray-900">{item.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => handleToggleActive(item.id)}
                    className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.isActive 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : 'bg-red-100 text-red-800 hover:bg-red-200'
                    }`}
                  >
                    {item.isActive ? '활성' : '비활성'}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.updatedAt}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    onClick={() => handleEdit(item)}
                    className="text-blue-600 hover:text-blue-900 mr-3"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
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

      {/* 모달 */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              {editingItem ? '상품 시즌 수정' : '상품 시즌 추가'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">시즌명</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="예: 봄/여름"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">코드</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  placeholder="예: SPRING_SUMMER"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="시즌에 대한 설명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">색상</label>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-8 h-8 rounded border border-gray-300"
                    style={{ backgroundColor: formData.color }}
                  ></div>
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className="sr-only"
                    id="colorPicker"
                  />
                  <label 
                    htmlFor="colorPicker"
                    className="cursor-pointer text-sm text-blue-600 hover:text-blue-800"
                  >
                    색상 선택
                  </label>
                </div>
                <div className="mt-2 flex space-x-1">
                  {predefinedColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({...formData, color})}
                      className={`w-6 h-6 rounded border-2 ${
                        formData.color === color ? 'border-gray-400' : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                  활성 상태
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                disabled={!formData.name || !formData.code}
              >
                {editingItem ? '수정' : '추가'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSeasonsPage;
