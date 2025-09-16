import React, { useState, useEffect } from 'react';
// `getServerSession` and `authOptions` are server-only and imported dynamically
// inside `getServerSideProps` to avoid pulling server-only dependencies into
// the client/test runtime at module-evaluation time.
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
  const router = require('next/router').useRouter();

  const idToPath: Record<string, string> = {
    'dashboard': '/',
    'products-list': '/products',
    'products': '/products',
    'products-add': '/products/add',
    'products-edit': '/products/edit',
    'products-csv': '/products/csv',
    'products-import': '/products/import',
    'products-detail': '/products', // will be suffixed with /:id when productId provided
    'orders-list': '/orders',
    'orders-settings': '/orders/settings',
    'malls': '/malls'
  };

  const handleNavigate = (page: string, productId?: string) => {
    setCurrentPage(page);
    if (productId) {
      setSelectedProductId(productId);
    }
    // Immediately update browser history (so Back/Forward work instantly)
    try {
      const basePath = idToPath[page] ?? `/${page.replace(/_/g, '/').replace(/\s+/g, '-')}`;
      const target = page === 'products-detail' && productId ? `${basePath}/${productId}` : basePath;
      if (typeof window !== 'undefined' && window.history && window.history.pushState) {
        window.history.pushState({}, '', target);
      }
      // keep Next router in sync (shallow)
      router.push(router.pathname, target, { shallow: true }).catch(() => {});
    } catch (e) {
      // ignore
    }
  };

  // Helper: map a pathname (e.g. '/products', '/products/123') to SPA page id and id
  const parsePathToPage = (pathname: string): { page: string; id?: string } => {
    const parts = pathname.replace(/^\//, '').split('/').filter(Boolean);
    if (parts.length === 0) return { page: 'dashboard' };
    if (parts[0] === 'products') {
      if (parts.length === 1) return { page: 'products-list' };
      // handle known product subpaths
      if (parts[1] === 'csv') return { page: 'products-csv' };
      if (parts[1] === 'import') return { page: 'products-import' };
      if (parts[1] === 'external-import') return { page: 'products-external-import' };
      if (parts[1] === 'add') return { page: 'products-add' };
      if (parts[1] === 'edit') return { page: 'products-edit' };
      // otherwise, assume /products/:id
      return { page: 'products-detail', id: parts[1] };
    }
    if (parts[0] === 'orders') return { page: 'orders-list' };
    if (parts[0] === 'malls') return { page: 'malls' };
    if (parts[0] === 'settings') return { page: 'settings-integrations' };
    // fallback to dashboard
    return { page: 'dashboard' };
  };

  // On mount, initialize SPA state from the current URL
  useEffect(() => {
    try {
      const { page, id } = parsePathToPage(window.location.pathname);
      setCurrentPage(page);
      if (id) setSelectedProductId(id);
    } catch (e) {
      // ignore on server or unexpected errors
    }

    // Listen to router events and popstate so Back/Forward navigations update SPA state immediately
    const onRouteChange = (url: string) => {
      try {
        const { page, id } = parsePathToPage(new URL(url, window.location.origin).pathname);
        setCurrentPage(page);
        setSelectedProductId(id ?? '');
      } catch (err) {
        // ignore
      }
    };

    const onPopState = () => {
      try {
        const { page, id } = parsePathToPage(window.location.pathname);
        setCurrentPage(page);
        setSelectedProductId(id ?? '');
      } catch (err) {
        // ignore
      }
    };

    router.events?.on?.('routeChangeComplete', onRouteChange);
    window.addEventListener('popstate', onPopState);
    return () => {
      router.events?.off?.('routeChangeComplete', onRouteChange);
      window.removeEventListener('popstate', onPopState);
    };
  }, []);

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

  // Dynamically import server-only helpers to avoid loading them during tests
  try {
    const { getServerSession } = await import('next-auth/next')
    const { authOptions } = await import('./api/auth/[...nextauth]')
    const session = await (getServerSession as any)(ctx.req, ctx.res, authOptions as any)
    return { props: { session: !!session, initialPage: page } }
  } catch (e) {
    // If server auth cannot be loaded (e.g. in unit tests), fall back to unauthenticated
    return { props: { session: false, initialPage: page } }
  }
}
