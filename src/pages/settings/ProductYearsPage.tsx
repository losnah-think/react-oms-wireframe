import React, { useState } from 'react';

interface ProductYear {
  id: string;
  year: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductYearsPageProps {
  onNavigate?: (page: string) => void;
}

const ProductYearsPage: React.FC<ProductYearsPageProps> = ({ onNavigate }) => {
  const [productYears, setProductYears] = useState<ProductYear[]>([
    {
      id: '1',
      year: '2024',
      description: '2024년 출시 제품',
      isActive: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '2',
      year: '2023',
      description: '2023년 출시 제품',
      isActive: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '3',
      year: '2022',
      description: '2022년 출시 제품',
      isActive: true,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '4',
      year: '2021',
      description: '2021년 출시 제품',
      isActive: false,
      createdAt: '2024-01-15',
      updatedAt: '2024-02-10'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ProductYear | null>(null);
  const [formData, setFormData] = useState({
    year: '',
    description: '',
    isActive: true
  });

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({length: 10}, (_, i) => currentYear + 2 - i);

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      year: String(currentYear),
      description: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: ProductYear) => {
    setEditingItem(item);
    setFormData({
      year: item.year,
      description: item.description,
      isActive: item.isActive
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    // 중복 체크
    if (!editingItem && productYears.some(item => item.year === formData.year)) {
      alert('이미 등록된 연도입니다.');
      return;
    }

    if (editingItem) {
      // 수정
      setProductYears(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...formData, updatedAt: new Date().toISOString().split('T')[0] }
          : item
      ));
    } else {
      // 추가
      const newItem: ProductYear = {
        id: String(Date.now()),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setProductYears(prev => [...prev, newItem]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setProductYears(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    setProductYears(prev => prev.map(item => 
      item.id === id 
        ? { ...item, isActive: !item.isActive, updatedAt: new Date().toISOString().split('T')[0] }
        : item
    ));
  };

  const handleBulkAddYears = () => {
    const yearsToAdd = [currentYear + 1, currentYear, currentYear - 1, currentYear - 2];
    const existingYears = productYears.map(item => item.year);
    
    yearsToAdd.forEach(year => {
      if (!existingYears.includes(String(year))) {
        const newItem: ProductYear = {
          id: String(Date.now() + Math.random()),
          year: String(year),
          description: `${year}년 출시 제품`,
          isActive: true,
          createdAt: new Date().toISOString().split('T')[0],
          updatedAt: new Date().toISOString().split('T')[0]
        };
        setProductYears(prev => [...prev, newItem]);
      }
    });
  };

  const sortedYears = [...productYears].sort((a, b) => parseInt(b.year) - parseInt(a.year));

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">상품 연도 관리</h1>
          <p className="text-gray-600 mt-1">상품 등록 시 사용할 연도를 관리합니다. (총 {productYears.length}개)</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleBulkAddYears}
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded-md hover:bg-blue-50"
          >
            기본 연도 추가
          </button>
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            연도 추가
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
            <h3 className="text-sm font-medium text-blue-800">상품 연도 관리 안내</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>상품의 출시 연도나 모델 연도를 관리합니다</li>
                <li>연도별로 상품을 분류하고 필터링할 때 사용됩니다</li>
                <li>'기본 연도 추가' 버튼으로 현재 연도 기준 ±2년을 한 번에 추가할 수 있습니다</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 연도 목록 */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                연도
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                설명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                상태
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                등록일
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
            {sortedYears.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-lg font-bold text-gray-900">{item.year}</div>
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
                  {item.createdAt}
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
              {editingItem ? '상품 연도 수정' : '상품 연도 추가'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">연도</label>
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">연도를 선택하세요</option>
                  {yearOptions.map(year => (
                    <option key={year} value={String(year)}>{year}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="연도에 대한 설명을 입력하세요"
                />
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
                disabled={!formData.year}
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

export default ProductYearsPage;
