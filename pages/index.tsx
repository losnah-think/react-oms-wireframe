import React, { useState } from 'react';
import { getServerSession } from 'next-auth/next'
import { authOptions } from './api/auth/[...nextauth]'
import LoginPage from './settings/integration-admin/login'
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

// Orders
import OrderList from '../src/pages/orders/OrderList';
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

export default function Home(props: any) {
  // If no session, render the login UI inline at '/'
  const sessionExists = !!props.session
  if (!sessionExists) return <LoginPage />

  const initialPage = props.initialPage ?? 'dashboard'
  const [currentPage, setCurrentPage] = useState(initialPage);
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
      case 'products-detail':
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
      
      // Orders
      case 'orders':
      case 'orders-list':
        return <OrderList />;
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
      case 'settings-integrations':
        // render pages-based integrations index for SPA navigation
        // Dynamically import to avoid SSR issues
        const IntegrationsPage = require('../src/pages/settings/IntegrationsPage').default;
        return <IntegrationsPage onNavigate={handleNavigate} />;
      case 'settings-integrations-orderDetail':
        const IntegrationOrderDetail = require('../src/pages/settings/integrations/orderDetail').default;
        return <IntegrationOrderDetail orderId={selectedProductId} />;
      case 'settings-brands':
        return <BrandsPage />;
      case 'settings-product-years':
        return <ProductYearsPage />;
      case 'settings-product-seasons':
        return <ProductSeasonsPage />;
      case 'settings-barcodes':
        const BarcodeManagement = require('../src/pages/settings/bc').default;
        return <BarcodeManagement onNavigate={handleNavigate} />;
      
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
// client-side session check replaces server-side redirect for smoother dev flow

export async function getServerSideProps(ctx: any) {
  // In dev we allow using a query param to preview pages without login
  const page = ctx.query?.page ?? null
  if (process.env.NEXT_PUBLIC_DEV_NO_AUTH === '1' || process.env.NODE_ENV !== 'production') {
    return { props: { session: true, initialPage: page } }
  }

  const session = await getServerSession(ctx.req, ctx.res, authOptions as any)
  return { props: { session: !!session, initialPage: page } }
}
