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
    if (pathname.startsWith('/products/barcode')) return 'barcodes-products'
    if (pathname === '/products/add') return 'products-add'
    if (pathname === '/products/csv') return 'products-csv'
    if (pathname === '/products/import') return 'products-import'
    if (pathname === '/products/registration-history') return 'products-registration-history'
    if (pathname === '/products/individual-registration') return 'products-individual-registration'
    if (pathname === '/products/trash') return 'products-trash'
    if (pathname.startsWith('/products')) return 'products-list'
    if (pathname.startsWith('/vendors')) return 'vendors-sales'
    if (pathname.startsWith('/settings')) return 'settings-integrations'
    if (pathname.startsWith('/barcodes')) return 'barcodes-products'
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
