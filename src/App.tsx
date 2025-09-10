import React from 'react';
import './App.css';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/dashboard/Dashboard';
import ProductsListPage from './pages/products/ProductsListPage';
import ProductsAddPage from './pages/products/ProductsAddPage';
import ProductCsvUploadPage from './pages/products/ProductCsvUploadPage';
import ProductImportPage from './pages/products/ProductImportPage';
import BasicBrandsPage from './pages/products/BasicBrandsPage';
import OrderList from './pages/orders/OrderList';
import MallsListPage from './pages/malls/MallsListPage';

type Page = 'dashboard' | 'products' | 'products-list' | 'products-add' | 'products-csv' | 'products-import' |
           'orders' | 'malls' | 'malls-products' | 'malls-info' | 'malls-category-mapping' |
           'basic' | 'basic-brands' | 'basic-categories';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState<Page>('products-list');
  
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
        return <ProductCsvUploadPage />;
      case 'products-import':
        return <ProductImportPage />;
      case 'orders':
        return <OrderList />;
      case 'malls':
        return <MallsListPage />;
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
        return <Dashboard />;
      default:
        return <ProductsListPage />;
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
