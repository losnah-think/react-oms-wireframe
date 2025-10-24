'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const menuItems = [
    { name: '대시보드', path: '/', icon: '📊' },
    { name: '입고 요청', path: '/inbound', icon: '📥', active: true },
    { name: '출고 관리', path: '/outbound', icon: '📦' },
    { name: 'OMS-WMS 플로우', path: '/flow', icon: '🔄' },
    { name: '설정', path: '/settings', icon: '⚙️' },
  ]

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      {/* 로고 영역 */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">OMS-WMS</h1>
        <p className="text-xs text-gray-500 mt-1">Order & Warehouse Management</p>
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
              <span className="text-xl">{item.icon}</span>
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
