import React from 'react'
import Header from './Header'
import Sidebar from './Sidebar'

type LayoutProps = {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [collapsed, setCollapsed] = React.useState(false)
  const [currentPage, setCurrentPage] = React.useState('products')

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} isCollapsed={collapsed} onToggleCollapse={() => setCollapsed(s => !s)} />
        <div className="flex-1 p-6">
          {children}
        </div>
      </div>
    </div>
  )
}
