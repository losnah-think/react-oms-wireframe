'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface SidebarProps {
  locale?: string
}

const menuTranslations = {
  ko: [
    { name: '대시보드', path: '/dashboard', icon: null },
    { name: '입고 요청', path: '/', icon: null },
    { name: '입고 상세', path: '/inbound-detail', icon: null },
    { name: '출고', path: '/outbound', icon: null },
    { name: '프로세스 흐름', path: '/flow', icon: null },
    { name: '설정', path: '/settings', icon: null },
  ],
  en: [
    { name: 'Dashboard', path: '/dashboard', icon: null },
    { name: 'Inbound Request', path: '/', icon: null },
    { name: 'Inbound Detail', path: '/inbound-detail', icon: null },
    { name: 'Outbound', path: '/outbound', icon: null },
    { name: 'Flow', path: '/flow', icon: null },
    { name: 'Settings', path: '/settings', icon: null },
  ],
  vi: [
    { name: 'Bảng điều khiển', path: '/dashboard', icon: null },
    { name: 'Yêu cầu nhập hàng', path: '/', icon: null },
    { name: 'Chi tiết nhập hàng', path: '/inbound-detail', icon: null },
    { name: 'Xuất hàng', path: '/outbound', icon: null },
    { name: 'Dòng quy trình', path: '/flow', icon: null },
    { name: 'Cài đặt', path: '/settings', icon: null },
  ],
}

export default function Sidebar({ locale = 'ko' }: SidebarProps) {
  const pathname = usePathname()
  
  // 로케일 코드 추출
  const currentLocale = pathname.split('/')[1] || 'ko'
  const menuItems = menuTranslations[currentLocale as keyof typeof menuTranslations] || menuTranslations.ko

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen fixed left-0 top-0 h-screen">
      {/* 로고 영역 */}
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800">OMS System</h1>
        <p className="text-xs text-gray-500 mt-1">Warehouse Management</p>
      </div>

      {/* 언어 선택 */}
      <div className="px-3 py-3 border-b border-gray-200 flex gap-2">
        {(['ko', 'en', 'vi'] as const).map((lang) => (
          <Link
            key={lang}
            href={`/${lang}${pathname.substring(3)}`}
            className={`px-2 py-1 text-xs rounded transition-all ${
              currentLocale === lang
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {lang.toUpperCase()}
          </Link>
        ))}
      </div>

      {/* 메뉴 */}
      <nav className="mt-6 px-3 pb-24">
        {menuItems.map((item) => {
          const itemPath = `/${currentLocale}${item.path}`
          const isActive = pathname === itemPath || (item.path === '/' && pathname === `/${currentLocale}`)
          return (
            <Link
              key={item.path}
              href={itemPath}
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
