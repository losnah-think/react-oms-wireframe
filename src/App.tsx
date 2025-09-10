import React from 'react';
import './App.css';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/dashboard/Dashboard';
import ProductsListPage from './pages/products/ProductsListPage';
import ProductsAddPage from './pages/products/ProductsAddPage';
import ProductDetailPage from './pages/products/ProductDetailPage';
import ProductCsvUploadPage from './pages/products/ProductCsvUploadPage';
import ExternalProductImportPage from './pages/products/ExternalProductImportPage';
import BasicBrandsPage from './pages/products/BasicBrandsPage';
import OrderList from './pages/orders/OrderList';
import MallsListPage from './pages/malls/MallsListPage';
import MallProductsPage from './pages/malls/MallProductsPage';
import MallInfoManagementPage from './pages/malls/MallInfoManagementPage';
import CategoryMappingPage from './pages/malls/CategoryMappingPage';
import CategoriesManagementPage from './pages/categories/CategoriesManagementPage';

type Page = 'dashboard' | 'products' | 'products-list' | 'products-add' | 'products-detail' | 'products-csv' | 'products-import' |
           'orders' | 'malls' | 'malls-products' | 'malls-info' | 'malls-category-mapping' |
           'basic' | 'basic-brands' | 'basic-categories';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState<Page>('products-list');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentProductId, setCurrentProductId] = React.useState<number | undefined>(undefined);
  
  const mockUser = {
    username: '관리자',
    role: 'Admin'
  };

  const handleNavigate = (page: string, productId?: number) => {
    setCurrentPage(page as Page);
    if (productId) setCurrentProductId(productId);
  };

  const renderContent = () => {
    switch (currentPage) {
      case 'products-list':
        return <ProductsListPage onNavigate={handleNavigate} />;
      case 'products-add':
        return <ProductsAddPage onNavigate={handleNavigate} />;
      case 'products-detail':
        return <ProductDetailPage onNavigateToList={() => setCurrentPage('products-list')} />;
      case 'products-csv':
        return <ProductCsvUploadPage />;
      case 'products-import':
        return <ExternalProductImportPage />;
      case 'orders':
        return <OrderList />;
      case 'malls':
        return <MallsListPage />;
      case 'malls-products':
        return <MallProductsPage />;
      case 'malls-info':
        return <MallInfoManagementPage />;
      case 'malls-category-mapping':
        return <CategoryMappingPage />;
      case 'basic-brands':
        return <BasicBrandsPage />;
      case 'basic-categories':
        return <CategoriesManagementPage />;
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
