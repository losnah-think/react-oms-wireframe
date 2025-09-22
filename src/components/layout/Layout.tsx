import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import Breadcrumbs from '@/components/Breadcrumbs'

type LayoutProps = {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [currentPage, setCurrentPage] = React.useState('products')
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
