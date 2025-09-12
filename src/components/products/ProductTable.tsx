import React from 'react';
import { ProductWithVariants } from '../../data/mockProducts';
import { formatDate, getStockStatus, getProductStatusBadge } from '../../utils/productUtils';

interface ProductTableProps {
  products: ProductWithVariants[];
  selectedProducts: (string | number)[];
  onSelectAll: () => void;
  onSelectProduct: (productId: string, checked: boolean) => void;
  onViewProduct: (productId: string) => void;
  onEditProduct: (productId: string) => void;
  onDeleteProduct: (productId: string) => void;
}

const ProductTable: React.FC<ProductTableProps> = ({
  products,
  selectedProducts,
  onSelectAll,
  onSelectProduct,
  onViewProduct,
  onEditProduct,
  onDeleteProduct
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-12 px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedProducts.length === products.length && products.length > 0}
                  onChange={onSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상품정보</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">카테고리</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가격</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">재고</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">등록일</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">관리</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.map((product) => {
              const stockStatus = getStockStatus(product);
              const statusBadge = getProductStatusBadge(product);
              
              return (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedProducts.includes(product.id)}
                      onChange={(e) => onSelectProduct(product.id, e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden">
                        {product.representativeImage ? (
                          <img src={product.representativeImage} alt={product.productName} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-gray-400">📦</span>
                        )}
                      </div>
                      <div>
                        <div 
                          className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer hover:underline"
                          onClick={() => onViewProduct(product.id)}
                          title="클릭하여 상품 상세보기"
                        >
                          {product.productName}
                        </div>
                        <div className="text-sm text-gray-500">{product.productCode}</div>
                        {product.brandId && (
                          <div className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1 inline-block">
                            {product.brandId.replace('BRAND-', '')}
                          </div>
                        )}
                        {/* 옵션 정보 표시 */}
                        {product.variants && product.variants.length > 0 && (
                          <div className="text-xs text-gray-600 mt-1">
                            옵션 {product.variants.length}개: {product.variants.slice(0, 2).map(v => v.optionCode).join(', ')}
                            {product.variants.length > 2 && '...'}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {product.productCategory}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {product.representativeSellingPrice?.toLocaleString()}원
                      </div>
                      <div className="text-gray-500 text-xs">
                        원가: {product.originalCost?.toLocaleString()}원
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm">
                      <div className={`font-medium ${stockStatus.color}`}>
                        {product.stock}개
                      </div>
                      <div className="text-gray-500 text-xs">
                        안전재고: {product.safeStock || 0}개
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${statusBadge.className}`}>
                      {statusBadge.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {formatDate(product.createdAt)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => onViewProduct(product.id)}
                        className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition-colors"
                        title="상세보기"
                      >
                        보기
                      </button>
                      <button 
                        onClick={() => onEditProduct(product.id)}
                        className="px-2 py-1 text-xs bg-gray-50 text-gray-700 rounded hover:bg-gray-100 transition-colors"
                        title="수정"
                      >
                        수정
                      </button>
                      <button 
                        onClick={() => onDeleteProduct(product.id)}
                        className="px-2 py-1 text-xs bg-red-50 text-red-700 rounded hover:bg-red-100 transition-colors"
                        title="삭제"
                      >
                        삭제
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {products.length === 0 && (
        <div className="px-6 py-12 text-center">
          <span className="text-4xl mb-4 block">📦</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
          <p className="text-gray-500">다른 검색어나 필터를 사용해보세요.</p>
        </div>
      )}
    </div>
  );
};

export default ProductTable;
