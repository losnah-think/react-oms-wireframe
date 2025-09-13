import React, { useState } from 'react';
import { Container, Card, Button, Input, Badge, Stack, Modal } from '../../design-system';

interface Brand {
  id: string;
  name: string;
  code: string;
  description: string;
  logoUrl?: string;
  isActive: boolean;
  commissionRate?: number;
  createdAt: string;
  updatedAt: string;
}

interface BrandsPageProps {
  onNavigate?: (page: string) => void;
}

const BrandsPage: React.FC<BrandsPageProps> = ({ onNavigate }) => {
  const [brands, setBrands] = useState<Brand[]>([
    {
      id: '1',
      name: '삼성전자',
      code: 'SAMSUNG',
      description: '대한민국의 글로벌 전자기업',
      isActive: true,
      commissionRate: 5.5,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '2',
      name: 'LG전자',
      code: 'LG',
      description: '생활가전 및 전자제품 전문기업',
      isActive: true,
      commissionRate: 6.0,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '3',
      name: '애플',
      code: 'APPLE',
      description: '미국의 전자기기 및 소프트웨어 기업',
      isActive: true,
      commissionRate: 3.5,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '4',
      name: '다이슨',
      code: 'DYSON',
      description: '영국의 가전제품 및 기술 회사',
      isActive: true,
      commissionRate: 8.0,
      createdAt: '2024-01-15',
      updatedAt: '2024-01-15'
    },
    {
      id: '5',
      name: '나이키',
      code: 'NIKE',
      description: '미국의 스포츠용품 브랜드',
      isActive: false,
      commissionRate: 7.5,
      createdAt: '2024-01-15',
      updatedAt: '2024-02-10'
    }
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Brand | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    logoUrl: '',
    isActive: true,
    commissionRate: 0
  });

  const handleAdd = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      code: '',
      description: '',
      logoUrl: '',
      isActive: true,
      commissionRate: 0
    });
    setIsModalOpen(true);
  };

  const handleEdit = (item: Brand) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      code: item.code,
      description: item.description,
      logoUrl: item.logoUrl || '',
      isActive: item.isActive,
      commissionRate: item.commissionRate || 0
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (editingItem) {
      // 수정
      setBrands(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, ...formData, updatedAt: new Date().toISOString().split('T')[0] }
          : item
      ));
    } else {
      // 추가
      const newItem: Brand = {
        id: String(Date.now()),
        ...formData,
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      setBrands(prev => [...prev, newItem]);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (confirm('정말 삭제하시겠습니까?')) {
      setBrands(prev => prev.filter(item => item.id !== id));
    }
  };

  const handleToggleActive = (id: string) => {
    setBrands(prev => prev.map(item => 
      item.id === id 
        ? { ...item, isActive: !item.isActive, updatedAt: new Date().toISOString().split('T')[0] }
        : item
    ));
  };

  return (
    <Container maxWidth="full" padding="md" className="min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">브랜드 관리</h1>
          <p className="text-gray-600 mt-1">상품 등록 시 사용할 브랜드를 관리합니다. (총 {brands.length}개)</p>
        </div>
        <Button
          variant="primary"
          onClick={handleAdd}
        >
          브랜드 추가
        </Button>
      </div>

      {/* 브랜드 목록 */}
      <Card padding="none" className="shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                브랜드명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                코드
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                설명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                수수료율
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
            {brands.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    {item.logoUrl ? (
                      <img
                        className="h-8 w-8 rounded-full mr-3"
                        src={item.logoUrl}
                        alt={item.name}
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-3">
                        <span className="text-xs font-medium text-gray-500">
                          {item.name.substring(0, 2)}
                        </span>
                      </div>
                    )}
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
                  <div className="text-sm text-gray-900">
                    {item.commissionRate ? `${item.commissionRate}%` : '-'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <Badge
                    variant={item.isActive ? "success" : "danger"}
                    onClick={() => handleToggleActive(item.id)}
                    className="cursor-pointer"
                  >
                    {item.isActive ? '활성' : '비활성'}
                  </Badge>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {item.updatedAt}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <Stack direction="row" gap={3}>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => handleEdit(item)}
                    >
                      수정
                    </Button>
                    <Button
                      variant="ghost"
                      size="small"
                      onClick={() => handleDelete(item.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      삭제
                    </Button>
                  </Stack>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* 모달 */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? '브랜드 수정' : '브랜드 추가'}
        size="default"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">브랜드명</label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="예: 삼성전자"
            />
          </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">코드</label>
                <Input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                  placeholder="예: SAMSUNG"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="브랜드에 대한 설명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">로고 URL (선택)</label>
                <input
                  type="url"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({...formData, logoUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://example.com/logo.png"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">브랜드 수수료율 (%)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.commissionRate}
                  onChange={(e) => setFormData({...formData, commissionRate: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.0"
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

            <Stack direction="row" gap={3} justify="end" className="mt-6">
              <Button
                variant="secondary"
                onClick={() => setIsModalOpen(false)}
              >
                취소
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!formData.name || !formData.code}
              >
                {editingItem ? '수정' : '추가'}
              </Button>
            </Stack>
        </Modal>
    </Container>
  );
};

export default BrandsPage;
