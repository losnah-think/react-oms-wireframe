import React from 'react'
import { useRouter } from 'next/router'
import Header from './Header'
import Sidebar from './Sidebar'
import Breadcrumbs from '@/components/Breadcrumbs'

type LayoutProps = {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const router = useRouter()
  const [collapsed, setCollapsed] = React.useState(false)
  
  // URL에 따라 currentPage 설정
  const getCurrentPageFromPath = (pathname: string) => {
    // Products
    if (pathname.startsWith('/products/barcode')) return 'barcodes-products'
    if (pathname === '/products/add') return 'products-add'
    if (pathname === '/products/csv') return 'products-csv'
    if (pathname === '/products/import') return 'products-import'
    if (pathname === '/products/registration-history') return 'products-registration-history'
    if (pathname === '/products/individual-registration') return 'products-individual-registration'
    if (pathname === '/products/trash') return 'products-trash'
    if (pathname === '/products' || pathname.startsWith('/products/')) return 'products-list'
    
    // Barcodes
    if (pathname === '/barcodes/location') return 'barcodes-location'
    if (pathname === '/barcodes/settings') return 'barcodes-settings'
    if (pathname === '/barcodes' || pathname.startsWith('/barcodes/')) return 'barcodes-products'
    
    // Vendors
    if (pathname === '/vendors/sales') return 'vendors-sales'
    if (pathname === '/vendors/fixed-addresses') return 'vendors-fixed-addresses'
    if (pathname === '/vendors/vendor-products') return 'vendors-products'
    if (pathname === '/vendors/vendor-info') return 'vendors-info'
    if (pathname === '/vendors/vendor-category-mapping') return 'vendors-category-mapping'
    if (pathname === '/vendors/delivery-companies') return 'vendors-delivery'
    if (pathname === '/vendors/automation') return 'vendors-automation'
    if (pathname === '/vendors/suppliers') return 'vendors-suppliers'
    if (pathname === '/vendors/supplier-orders') return 'vendors-supplier-orders'
    if (pathname === '/vendors/payments') return 'vendors-payments'
    if (pathname === '/vendors' || pathname.startsWith('/vendors/')) return 'vendors-sales'
    
    // Settings
    if (pathname === '/settings/integration' || pathname === '/settings/integrations') return 'settings-integrations'
    if (pathname === '/settings/product-groups') return 'settings-product-groups'
    if (pathname === '/settings/product-classifications' || pathname === '/settings/product-categories') return 'settings-product-classifications'
    if (pathname === '/settings/basic-metadata') return 'settings-basic-metadata'
    if (pathname === '/settings/brands') return 'settings-brands'
    if (pathname === '/settings/years') return 'settings-product-years'
    if (pathname === '/settings/seasons') return 'settings-product-seasons'
    if (pathname === '/settings/users') return 'settings-users'
    if (pathname === '/settings/categories') return 'settings-product-classifications'
    if (pathname === '/settings/bc') return 'settings-integrations'
    if (pathname === '/settings' || pathname.startsWith('/settings/')) return 'settings-integrations'
    
    // Orders
    if (pathname === '/orders/settings') return 'orders-settings'
    if (pathname === '/orders' || pathname.startsWith('/orders/')) return 'orders-list'
    
    // Malls
    if (pathname === '/malls/products') return 'malls-products'
    if (pathname === '/malls/info') return 'malls-info'
    if (pathname === '/malls' || pathname.startsWith('/malls/')) return 'malls'
    
    // Categories
    if (pathname === '/categories/mapping') return 'category-mapping'
    
    return 'products-list'
  }
  
  const [currentPage, setCurrentPage] = React.useState(() => 
    getCurrentPageFromPath(router.pathname)
  )
  
  // URL 변경 시 currentPage 업데이트
  React.useEffect(() => {
    const handleRouteChange = (url: string) => {
      setCurrentPage(getCurrentPageFromPath(url))
    }
    
    router.events.on('routeChangeComplete', handleRouteChange)
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange)
    }
  }, [router])
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div
        className="grid"
        style={{
          gridTemplateColumns: collapsed ? '64px 1fr' : '260px 1fr',
          minHeight: 'calc(100vh - 64px)'
        }}
      >
        <Sidebar
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          isCollapsed={collapsed}
          onToggleCollapse={() => setCollapsed(s => !s)}
        />

        <div className="p-6 min-w-0">
          <div className="px-4 py-3">
            <Breadcrumbs />
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
