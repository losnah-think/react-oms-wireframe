import React from 'react'
import Head from 'next/head'
import BarcodeBuilder from '../../../components/barcodes/BarcodeBuilder'
import TemplateList from '../../../components/barcodes/TemplateList'
import TemplateEditor from '../../../components/barcodes/TemplateEditor'
import BarcodePreview from '../../../components/barcodes/BarcodePreview'
import { useSession } from 'next-auth/react'
import { shouldSkipAuth } from '../../../lib/devAuth'

export default function BarcodeSettingsPage() {
  const sess = useSession()
  const skip = shouldSkipAuth()

  if (!skip && sess.status !== 'authenticated') {
    return (
      <div className="min-h-screen p-6 bg-gray-50 text-center">
        <Head>
          <title>Barcode Management · Settings</title>
        </Head>
        <div className="max-w-md mx-auto mt-20 bg-white p-6 rounded shadow">
          <h2 className="text-lg font-medium">로그인이 필요합니다</h2>
          <p className="text-sm text-gray-600 mt-2">이 페이지는 관리자 전용입니다. 로그인 후 접근하세요.</p>
        </div>
      </div>
    )
  }
  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <Head>
        <title>Barcode Management · Settings</title>
      </Head>

      <div className="max-w-screen-xl mx-auto">
        <h1 className="text-2xl font-semibold mb-4">Barcode Management</h1>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3 bg-white p-4 rounded shadow">
            <BarcodeBuilder.Sidebar />
            <div className="mt-4">
              <TemplateList />
            </div>
          </div>
          <div className="col-span-6 bg-white p-4 rounded shadow">
            <BarcodePreview />
          </div>
          <div className="col-span-3 bg-white p-4 rounded shadow">
            <TemplateEditor />
            <div className="mt-4">
              <h4 className="font-medium">Actions</h4>
              <div className="mt-2 space-y-2">
                <button className="px-3 py-2 bg-primary-600 text-white rounded">Generate PDF</button>
                <button className="px-3 py-2 border rounded">Export PNG</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
