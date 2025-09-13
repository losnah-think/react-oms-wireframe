import React from 'react';
import { Container, Card, Button, Badge, Stack } from '../../design-system';

const BasicBrandsPage: React.FC = () => {
  return (
    <Container maxWidth="full" padding="md" className="min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">브랜드 관리</h1>
      
      <Card padding="none" className="border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">브랜드 목록</h2>
          <Button variant="primary" size="small">새 브랜드 추가</Button>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-medium text-gray-900">브랜드명</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-900">등록일</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-900">상품 수</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-900">상태</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-900">관리</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { name: 'Apple', date: '2024-01-15', products: 25, status: '활성' },
                  { name: 'Samsung', date: '2024-01-10', products: 18, status: '활성' },
                  { name: 'Nike', date: '2024-01-05', products: 42, status: '활성' },
                  { name: 'Adidas', date: '2024-01-03', products: 31, status: '비활성' }
                ].map((brand, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 text-sm text-gray-900">{brand.name}</td>
                    <td className="py-3 text-sm text-gray-500">{brand.date}</td>
                    <td className="py-3 text-sm text-gray-500">{brand.products}</td>
                    <td className="py-3">
                      <Badge
                        variant={brand.status === '활성' ? 'success' : 'neutral'}
                        size="small"
                      >
                        {brand.status}
                      </Badge>
                    </td>
                    <td className="py-3">
                      <Stack direction="row" gap={2}>
                        <Button variant="ghost" size="small">편집</Button>
                        <Button variant="ghost" size="small" className="text-red-600 hover:text-red-700">삭제</Button>
                      </Stack>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </Container>
  );
};

export default BasicBrandsPage;
