import React, { useEffect } from 'react'

const ProductClassificationsPage: React.FC = () => {
  useEffect(() => {
    // Redirect users to the new categories management page
    if (typeof window !== 'undefined') {
      window.location.href = '/settings/categories'
    }
  }, [])

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">Redirecting…</h1>
      <p className="mt-2 text-sm text-gray-600">This page has moved to <a className="text-blue-600 underline" href="/settings/categories">카테고리 관리</a>. If your browser doesn't redirect automatically, click the link.</p>
    </div>
  )
}

export default ProductClassificationsPage
