import React, { useState } from 'react';
import Header from '../src/components/layout/Header';
import Sidebar from '../src/components/layout/Sidebar';

// Dashboard
import Dashboard from '../src/pages/dashboard/Dashboard';

// Products
import ProductsListPage from '../src/pages/products/ProductsListPage';
import ProductDetailPage from '../src/pages/products/ProductDetailPage';
import ProductsAddPage from '../src/pages/products/ProductsAddPage';
import ProductsEditPage from '../src/pages/products/ProductsEditPage';
import ProductCsvUploadPage from '../src/pages/products/ProductCsvUploadPage';
import ProductImportPage from '../src/pages/products/ProductImportPage';
import ExternalProductImportPage from '../src/pages/products/ExternalProductImportPage';
import BasicBrandsPage from '../src/pages/products/BasicBrandsPage';

// Orders
import OrderList from '../src/pages/orders/OrderList';
import OrderDashboard from '../src/pages/orders/OrderDashboard';
import OrderAnalytics from '../src/pages/orders/OrderAnalytics';
import OrderSettings from '../src/pages/orders/OrderSettings';

// Categories
import CategoriesManagementPage from '../src/pages/categories/CategoriesManagementPage';

// Malls
import MallsListPage from '../src/pages/malls/MallsListPage';
import MallInfoManagementPage from '../src/pages/malls/MallInfoManagementPage';
import MallProductsPage from '../src/pages/malls/MallProductsPage';
import CategoryMappingPage from '../src/pages/malls/CategoryMappingPage';

// Settings
import BrandsPage from '../src/pages/settings/BrandsPage';
import ProductClassificationsPage from '../src/pages/settings/ProductClassificationsPage';
import ProductSeasonsPage from '../src/pages/settings/ProductSeasonsPage';
import ProductYearsPage from '../src/pages/settings/ProductYearsPage';
import SystemSettingsPage from '../src/pages/settings/SystemSettingsPage';

export default function Home() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleNavigate = (page: string, productId?: string) => {
    setCurrentPage(page);
    if (productId) {
      setSelectedProductId(productId);
    }
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(prev => !prev);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      // Dashboard
      case 'dashboard':
        return <Dashboard />;
      
      // Products
      case 'products':
      case 'products-list':
        return <ProductsListPage onNavigate={handleNavigate} />;
      case 'product-detail':
        return <ProductDetailPage productId={selectedProductId} onNavigate={handleNavigate} />;
      case 'products-add':
        return <ProductsAddPage onNavigate={handleNavigate} />;
      case 'products-edit':
        return <ProductsEditPage productId={selectedProductId} onNavigate={handleNavigate} />;
      case 'products-csv':
        return <ProductCsvUploadPage />;
      case 'products-import':
        return <ProductImportPage />;
      case 'products-external-import':
        return <ExternalProductImportPage />;
      case 'basic-brands':
        return <BasicBrandsPage />;
      
      // Orders
      case 'orders':
      case 'orders-list':
        return <OrderList />;
      case 'orders-dashboard':
        return <OrderDashboard />;
      case 'orders-analytics':
        return <OrderAnalytics orders={[]} />;
      case 'orders-settings':
        return <OrderSettings onSave={(settings) => console.log('Settings saved:', settings)} />;
      
      // Categories
      case 'categories':
        return <CategoriesManagementPage />;
      
      // Malls
      case 'malls':
      case 'malls-list':
        return <MallsListPage />;
      case 'mall-info':
      case 'malls-info':
        return <MallInfoManagementPage />;
      case 'mall-products':
      case 'malls-products':
        return <MallProductsPage />;
      case 'category-mapping':
      case 'malls-category-mapping':
        return <CategoryMappingPage />;
      
      // Settings
      case 'settings-product-classifications':
        return <ProductClassificationsPage />;
      case 'settings-brands':
        return <BrandsPage />;
      case 'settings-product-years':
        return <ProductYearsPage />;
      case 'settings-product-seasons':
        return <ProductSeasonsPage />;
      case 'settings-system':
        return <SystemSettingsPage />;
      
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar 
          currentPage={currentPage} 
          onPageChange={handleNavigate}
          isCollapsed={sidebarCollapsed}
          onToggleCollapse={toggleSidebar}
        />
        <main className="flex-1">
          {renderCurrentPage()}
        </main>
      </div>
    </div>
  );
}
