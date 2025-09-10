import React from 'react';
import { Product } from '../models/Product';

const ProductList: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  
  // Mock data
  const mockProducts: Product[] = [
    new Product({ id: '1', name: '베이직 티셔츠', description: '편안한 일상복', price: 25000, stock: 100, category: '상의' }),
    new Product({ id: '2', name: '청바지', description: '클래식 데님', price: 45000, stock: 50, category: '하의' }),
    new Product({ id: '3', name: '운동화', description: '편안한 스니커즈', price: 80000, stock: 30, category: '신발' }),
    new Product({ id: '4', name: '가방', description: '실용적인 백팩', price: 60000, stock: 20, category: '가방' }),
    new Product({ id: '5', name: '모자', description: '캐주얼 캡', price: 20000, stock: 0, category: '액세서리' })
  ];
  
  const categories = ['상의', '하의', '신발', '가방', '액세서리'];
  
  const [localProducts, setLocalProducts] = React.useState(mockProducts);

  React.useEffect(() => {
    const handleFilter = () => {
      let filteredProducts = mockProducts;
      
      if (searchTerm) {
        filteredProducts = mockProducts.filter(product => 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (categoryFilter) {
        filteredProducts = filteredProducts.filter(product => product.category === categoryFilter);
      }
      
      setLocalProducts(filteredProducts);
    };

    const timeoutId = setTimeout(handleFilter, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, categoryFilter]);

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">상품을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">오류가 발생했습니다: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">상품 관리</h1>
          <p className="text-gray-600">전체 {localProducts.length}개 상품</p>
        </div>
        <button className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors">
          □ 새 상품 등록
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="상품명 또는 설명으로 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="">모든 카테고리</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {localProducts.map(product => (
          <div key={product.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Product Image */}
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              <span className="text-4xl text-gray-400">□</span>
            </div>

            {/* Product Info */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-gray-900 truncate">{product.name}</h3>
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                  {product.category}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {product.description}
              </p>

              <div className="flex justify-between items-center mb-3">
                <span className="text-lg font-bold text-gray-900">
                  {product.getFormattedPrice()}
                </span>
                <div className={`text-sm ${product.isInStock() ? 'text-green-600' : 'text-red-600'}`}>
                  재고: {product.stock}개
                </div>
              </div>

              {/* Stock Status */}
              <div className="mb-3">
                {product.isInStock() ? (
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    재고 있음
                  </span>
                ) : (
                  <span className="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    품절
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <button className="flex-1 text-sm bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors">
                  수정
                </button>
                <button className="flex-1 text-sm bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors">
                  삭제
                </button>
              </div>
              <div className="mt-2">
                <button className="w-full text-sm bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  상세보기
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {localProducts.length === 0 && (
        <div className="text-center py-12">
          <span className="text-4xl text-gray-300 mb-4 block">□</span>
          <p className="text-gray-500">검색 조건에 맞는 상품이 없습니다.</p>
        </div>
      )}
    </div>
  );
};

export default ProductList;
