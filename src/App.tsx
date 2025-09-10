import React from 'react';
import './App.css';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/dashboard/Dashboard';
import ProductsListPage from './pages/products/ProductsListPage';
import ProductsAddPage from './pages/products/ProductsAddPage';
import BasicBrandsPage from './pages/products/BasicBrandsPage';

type Page = 'dashboard' | 'products' | 'products-list' | 'products-add' | 'products-csv' | 'products-import' |
           'malls' | 'malls-products' | 'malls-info' | 'malls-category-mapping' |
           'basic' | 'basic-brands' | 'basic-categories';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState<Page>('dashboard');
  
  const mockUser = {
    username: '관리자',
    role: 'Admin'
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'products-list':
        return <ProductsListPage />;
      case 'products-add':
        return <ProductsAddPage />;
      case 'products-csv':
        return <div className="p-6"><h1 className="text-2xl font-bold">CSV 상품 등록</h1><p className="mt-2 text-gray-600">CSV 파일을 통한 상품 일괄 등록 페이지입니다.</p></div>;
      case 'products-import':
        return <div className="p-6"><h1 className="text-2xl font-bold">상품 정보 불러오기</h1><p className="mt-2 text-gray-600">외부에서 상품 정보를 불러오는 페이지입니다.</p></div>;
      case 'malls-products':
        return <div className="p-6"><h1 className="text-2xl font-bold">쇼핑몰별 상품 관리</h1><p className="mt-2 text-gray-600">쇼핑몰별 상품 관리 페이지입니다.</p></div>;
      case 'malls-info':
        return <div className="p-6"><h1 className="text-2xl font-bold">쇼핑몰별 부가 정보 관리</h1><p className="mt-2 text-gray-600">쇼핑몰별 부가 정보 관리 페이지입니다.</p></div>;
      case 'malls-category-mapping':
        return <div className="p-6"><h1 className="text-2xl font-bold">카테고리 매핑</h1><p className="mt-2 text-gray-600">쇼핑몰 카테고리 매핑 페이지입니다.</p></div>;
      case 'basic-brands':
        return <BasicBrandsPage />;
      case 'basic-categories':
        return <div className="p-6"><h1 className="text-2xl font-bold">카테고리 관리</h1><p className="mt-2 text-gray-600">기초 카테고리 관리 페이지입니다.</p></div>;
      case 'dashboard':
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <Header user={mockUser} />
      
      {/* Main Layout: Sidebar + Content */}
      <div className="flex flex-1">
        {/* Left Navigation Bar (LNB) */}
        <Sidebar currentPage={currentPage} onPageChange={(page: string) => setCurrentPage(page as Page)} />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default App;
