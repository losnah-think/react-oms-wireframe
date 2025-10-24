import { ReactNode } from 'react'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Sidebar from '@/app/components/Sidebar'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'OMS-WMS Wireframe',
  description: 'Order Management System - Warehouse Management System Integration',
}

const translations = {
  ko: { title: 'OMS-WMS 통합 시스템', description: '주문 관리 시스템 - 창고 관리 시스템 연동' },
  en: { title: 'OMS-WMS Integration', description: 'Order Management System - Warehouse Management System Integration' },
  vi: { title: 'Hệ thống tích hợp OMS-WMS', description: 'Hệ thống quản lý đơn hàng - Tích hợp hệ thống quản lý kho' },
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: { locale: string }
}) {
  const locale = (params.locale as keyof typeof translations) || 'ko'

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <div className="flex h-screen">
          <Sidebar locale={locale} />
          <main className="flex-1 ml-64 overflow-auto">{children}</main>
        </div>
      </body>
    </html>
  )
}
