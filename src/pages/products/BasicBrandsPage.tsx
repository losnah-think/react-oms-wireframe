import React from 'react';

const BasicBrandsPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">브랜드 관리</h1>
      
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">브랜드 목록</h2>
          <button className="px-4 py-2 bg-blue-600 text-white rounded text-sm">새 브랜드 추가</button>
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
                      <span className={`px-2 py-1 text-xs rounded ${
                        brand.status === '활성' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {brand.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <button className="text-xs text-blue-600">편집</button>
                        <button className="text-xs text-red-600">삭제</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BasicBrandsPage;
