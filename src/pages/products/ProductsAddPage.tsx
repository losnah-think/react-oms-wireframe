import React from 'react';

const ProductsAddPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">상품 등록</h1>
      
      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">새 상품 등록</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상품명</label>
                <input type="text" className="w-full px-3 py-2 border border-gray-300 rounded" placeholder="상품명을 입력하세요" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">카테고리</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded">
                  <option>카테고리 선택</option>
                  <option>전자제품</option>
                  <option>의류</option>
                  <option>생활용품</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">가격</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded" placeholder="0" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">재고수량</label>
                <input type="number" className="w-full px-3 py-2 border border-gray-300 rounded" placeholder="0" />
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상품 이미지</label>
                <div className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500">이미지 업로드</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">상품 설명</label>
                <textarea rows={4} className="w-full px-3 py-2 border border-gray-300 rounded" placeholder="상품 설명을 입력하세요"></textarea>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <button className="px-4 py-2 text-gray-700 border border-gray-300 rounded">취소</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded">등록</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductsAddPage;
