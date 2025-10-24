'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: null },
    { name: 'Inbound Request', path: '/inbound', icon: null, active: true },
    { name: 'Inbound Detail', path: '/inbound-detail', icon: null },
    { name: 'Outbound', path: '/outbound', icon: null },
    { name: 'Flow', path: '/flow', icon: null },
    { name: 'Settings', path: '/settings', icon: null },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      {/* 로고 영역 */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">OMS System</h1>
        <p className="text-xs text-gray-500 mt-1">Warehouse Management</p>
      </div>

      {/* 메뉴 */}
      <nav className="mt-6 px-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.path
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-2 transition-all ${
                isActive
                  ? 'bg-blue-50 text-blue-600 border-l-4 border-blue-600'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      {/* 푸터 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gray-50 border-t border-gray-200 w-64">
        <p className="text-xs text-gray-500 text-center">v1.0.0</p>
      </div>
    </aside>
  )
}
