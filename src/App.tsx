import React from 'react';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import Dashboard from './pages/dashboard/Dashboard';
import ProductsListPage from './pages/products/ProductsListPage';
import ProductsAddPage from './pages/products/ProductsAddPage';
import ProductsEditPage from './pages/products/ProductsEditPage';
import ProductDetailPage from './pages/products/ProductDetailPage';
import ProductCsvUploadPage from './pages/products/ProductCsvUploadPage';
import ExternalProductImportPage from './pages/products/ExternalProductImportPage';
import BasicBrandsPage from './pages/products/BasicBrandsPage';
import OrderList from './pages/orders/OrderList';
import OrderAnalytics from './pages/orders/OrderAnalytics';
import OrderSettings from './pages/orders/OrderSettings';
import { Order, OrderStatus } from './models/Order';
import MallsListPage from './pages/malls/MallsListPage';
import MallProductsPage from './pages/malls/MallProductsPage';
import MallInfoManagementPage from './pages/malls/MallInfoManagementPage';
import CategoryMappingPage from './pages/malls/CategoryMappingPage';
import CategoriesManagementPage from './pages/categories/CategoriesManagementPage';

type Page = 'dashboard' | 'products' | 'products-list' | 'products-add' | 'products-edit' | 'products-detail' | 'products-csv' | 'products-import' |
           'orders' | 'orders-list' | 'orders-analytics' | 'orders-settings' | 
           'malls' | 'malls-products' | 'malls-info' | 'malls-category-mapping' |
           'basic' | 'basic-brands' | 'basic-categories';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = React.useState<Page>('products-list');
  const [currentProductId, setCurrentProductId] = React.useState<number | undefined>(undefined);
  
  const mockUser = {
    username: '관리자',
    role: 'Admin'
  };

  const handleNavigate = (page: string, productId?: number) => {
    setCurrentPage(page as Page);
    if (productId) setCurrentProductId(productId);
  };

  // Mock 주문 데이터 생성
  const mockOrders = React.useMemo(() => [
    new Order({
      id: "ORD-001",
      createdAt: new Date(),
      updatedAt: new Date(),
      orderNumber: "ORDER-001",
      customerName: "고객1",
      customerEmail: "customer1@example.com",
      customerPhone: "010-1234-5678",
      shippingAddress: "서울시 강남구 강남대로 123",
      status: OrderStatus.DELIVERED,
      totalAmount: 150000,
      items: []
    }),
    new Order({
      id: "ORD-002",
      createdAt: new Date(),
      updatedAt: new Date(),
      orderNumber: "ORDER-002",
      customerName: "고객2",
      customerEmail: "customer2@example.com",
      customerPhone: "010-5678-9012",
      shippingAddress: "서울시 서초구 서초대로 456",
      status: OrderStatus.SHIPPED,
      totalAmount: 89000,
      items: []
    })
  ], []);

  const renderContent = () => {
    switch (currentPage) {
      case 'products-list':
        return <ProductsListPage onNavigate={handleNavigate} />;
      case 'products-add':
        return <ProductsAddPage onNavigate={handleNavigate} />;
      case 'products-edit':
        return <ProductsEditPage onNavigate={handleNavigate} productId={currentProductId} />;
      case 'products-detail':
        return <ProductDetailPage onNavigateToList={() => setCurrentPage('products-list')} />;
      case 'products-csv':
        return <ProductCsvUploadPage />;
      case 'products-import':
        return <ExternalProductImportPage />;
      case 'orders':
      case 'orders-list':
        return <OrderList />;
      case 'orders-analytics':
        return <OrderAnalytics orders={mockOrders} />;
      case 'orders-settings':
        return <OrderSettings onSave={(settings) => console.log('Settings saved:', settings)} />;
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
